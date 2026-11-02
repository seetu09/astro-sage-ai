import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getUserFromAuthHeader } from '@/lib/serverWallet';
import { getArtifactForCheckout } from '@/lib/serverArtifactCatalog';
import { resolveArtifactOrderAmount } from '@/lib/artifactPricing';
import type { CatalogArtifact } from '@/lib/catalogSchema';

const MIN_AMOUNT_INR = 20; // ₹20 minimum top-up
const MIN_AMOUNT_PAISE = MIN_AMOUNT_INR * 100;

export async function POST(req: Request) {
  try {
    const { allowed, retryAfter } = await checkRateLimit(
      `payment-create-order:${getClientIp(req)}`,
      10,
      60_000
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const body = await req.json();

    const {
      amount,
      currency = 'INR',
      userEmail,
      paymentType = 'wallet_topup',
      chartFingerprint,
      clientName,
      birthDate,
      birthTime,
      report,
      artifactId,
    } = body;

    // === REQUIRE AUTHENTICATION FOR ALL PAYMENT TYPES ===
    const user = await getUserFromAuthHeader(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in before creating an order.' },
        { status: 401 }
      );
    }
    const walletUserId = user.id;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('MISSING_RAZORPAY_CREDS');
      return NextResponse.json(
        { error: 'Razorpay credentials missing.' },
        { status: 500 }
      );
    }

    // === RESOLVE AMOUNT SERVER-SIDE ===
    let amountPaise: number;
    let orderCurrency = 'INR';
    let checkoutArtifact: CatalogArtifact | null = null;

    if (paymentType === 'artifact_purchase') {
      if (!artifactId) {
        return NextResponse.json(
          { error: 'artifactId is required for artifact purchases.' },
          { status: 400 }
        );
      }
      checkoutArtifact = await getArtifactForCheckout(artifactId);
      if (!checkoutArtifact) {
        return NextResponse.json(
          { error: 'This item is not available for purchase.' },
          { status: 404 }
        );
      }
      if (!checkoutArtifact.isActive) {
        return NextResponse.json(
          { error: 'This item is no longer available for purchase.' },
          { status: 404 }
        );
      }
      const verdict = resolveArtifactOrderAmount({
        catalogPriceInr: checkoutArtifact.priceInr,
        clientAmount: amount,
      });
      if (!verdict.ok) {
        return NextResponse.json({ error: verdict.error }, { status: 400 });
      }
      amountPaise = verdict.amountPaise;
      orderCurrency = checkoutArtifact.currency.toUpperCase();
    } else if (paymentType === 'kundli_report') {
      const verdict = resolveArtifactOrderAmount({
        catalogPriceInr: 50,
        clientAmount: amount,
      });
      if (!verdict.ok) {
        return NextResponse.json({ error: verdict.error }, { status: 400 });
      }
      amountPaise = verdict.amountPaise;
      orderCurrency = 'INR';
    } else if (paymentType === 'wallet_topup') {
      // wallet_topup: amount comes from the client, validated against ₹20 minimum
      const amountNum = Number(amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount. Please enter a valid top-up amount.' },
          { status: 400 }
        );
      }
      amountPaise = Math.round(amountNum * 100);
      if (amountPaise < MIN_AMOUNT_PAISE) {
        return NextResponse.json(
          { error: `Minimum top-up amount is ₹${MIN_AMOUNT_INR}. Please choose a higher amount.` },
          { status: 400 }
        );
      }
      orderCurrency = 'INR';
    } else {
      return NextResponse.json(
        { error: 'Invalid payment type.' },
        { status: 400 }
      );
    }

    // === BULLETPROOF ₹20 MINIMUM CHECK ===
    if (amountPaise < MIN_AMOUNT_PAISE) {
      return NextResponse.json(
        { error: `Minimum top-up amount is ₹${MIN_AMOUNT_INR}.` },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: orderCurrency,
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userEmail: userEmail || 'unknown',
          productType: paymentType,
          ...(walletUserId ? { userId: walletUserId } : {}),
          ...(paymentType === 'kundli_report'
            ? {
                chartFingerprint: String(chartFingerprint ?? ''),
                clientName: String(clientName ?? 'User'),
                birthDate: String(birthDate ?? ''),
                birthTime: String(birthTime ?? ''),
                report: typeof report === 'object' && report ? JSON.stringify(report) : '',
                ...(user?.id ? { reportOwnerUserId: user.id } : {}),
              }
            : {}),
          ...(paymentType === 'artifact_purchase' && checkoutArtifact
            ? {
                artifactId: artifactId,
                artifactName: checkoutArtifact.name?.en ?? checkoutArtifact.id,
                artifactCurrency: checkoutArtifact.currency,
                ...(user?.id ? { artifactOwnerUserId: user.id } : {}),
              }
            : {}),
        },
      }),
    });

    if (!rzpRes.ok) {
      const err = await rzpRes.json().catch(() => ({}));
      console.error('RAZORPAY_ERROR:', err);
      return NextResponse.json(
        { error: err.error?.description || `Razorpay error: ${rzpRes.status}` },
        { status: 500 }
      );
    }

    const order = await rzpRes.json();

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error: any) {
    console.error('FATAL_ERROR:', error.message);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
