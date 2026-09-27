import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getUserFromAuthHeader } from '@/lib/serverWallet';
import { getArtifactForCheckout } from '@/lib/serverArtifactCatalog';
import { resolveArtifactOrderAmount } from '@/lib/artifactPricing';

const MIN_AMOUNT_INR = 20; // ₹20 minimum top-up
const MIN_AMOUNT_PAISE = MIN_AMOUNT_INR * 100;

export async function POST(req: Request) {
  try {
    // Rate limit the order-creation endpoint (Razorpay orders have a cost and
    // creates are idempotence-prone under bots) — 10 req / 60s / IP.
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
      // kundli_report extras — captured at order-creation so /api/payment/verify
      // can record durable report ownership once the order settles.
      chartFingerprint,
      clientName,
      birthDate,
      birthTime,
      report,
      // artifact_purchase extra — the item being bought. The PRICE never comes
      // from the client: it is resolved from the catalog below (Task 1.3).
      artifactId,
    } = body;

    // Wallet top-ups require a signed-in account so the credit is applied to the
    // right profile. For kundli_report purchases auth is OPTIONAL — the report is
    // owned by the checkout email and can be recovered without an account. We
    // capture the signed-in user_id when present so the profile tab surfaces the
    // report for account holders too. artifact_purchase follows the same optional
    // model: ownership is keyed by checkout email, with user_id attached when
    // the buyer happens to be signed in.
    let walletUserId: string | undefined;
    let reportOwnerUserId: string | null = null;
    let artifactOwnerUserId: string | null = null;
    if (paymentType === 'wallet_topup') {
      const user = await getUserFromAuthHeader(req);
      if (!user) {
        return NextResponse.json(
          { error: 'Please sign in before adding funds to your wallet.' },
          { status: 401 }
        );
      }
      walletUserId = user.id;
    } else if (paymentType === 'kundli_report') {
      const user = await getUserFromAuthHeader(req);
      reportOwnerUserId = user?.id ?? null;
    } else if (paymentType === 'artifact_purchase') {
      const user = await getUserFromAuthHeader(req);
      artifactOwnerUserId = user?.id ?? null;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('MISSING_RAZORPAY_CREDS');
      return NextResponse.json(
        { error: 'Razorpay credentials missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Settings → Environment Variables.' },
        { status: 500 }
      );
    }

    // Server-side amount resolution.
    //  - artifact_purchase: the CATALOG price is authoritative (Task 1.3).
    //    `amount` from the body is only a cross-check — a mismatch rejects the
    //    order with a "price changed" message instead of charging a stale price.
    //  - every other paymentType: client-supplied amount, validated as before.
    let amountPaise: number;
    let orderCurrency = currency.toUpperCase();
    let checkoutArtifact: Awaited<ReturnType<typeof getArtifactForCheckout>> = null;

    if (paymentType === 'artifact_purchase') {
      const requestedId = typeof artifactId === 'string' ? artifactId.trim() : '';
      if (!requestedId) {
        return NextResponse.json({ error: 'artifactId is required.' }, { status: 400 });
      }
      try {
        checkoutArtifact = await getArtifactForCheckout(requestedId);
      } catch {
        // Catalog read failed (config/transport) — a 5xx, NOT "item not found".
        return NextResponse.json(
          { error: 'Store catalog is unavailable right now. Please try again shortly.' },
          { status: 500 }
        );
      }
      if (!checkoutArtifact || checkoutArtifact.isActive === false) {
        return NextResponse.json(
          { error: 'This item is not available for purchase.' },
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
    } else {
      // Validate amount is a positive number and meets the ₹20 minimum
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
                ...(reportOwnerUserId ? { reportOwnerUserId } : {}),
              }
            : {}),
          ...(paymentType === 'artifact_purchase' && checkoutArtifact
            ? {
                // Snapshot of what was bought + who bought it, re-read by
                // /api/payment/verify to record ownership after settlement.
                artifactId: checkoutArtifact.id,
                artifactName: checkoutArtifact.name?.en ?? checkoutArtifact.id,
                artifactCurrency: checkoutArtifact.currency,
                ...(artifactOwnerUserId ? { artifactOwnerUserId } : {}),
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