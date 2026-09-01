import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getUserFromAuthHeader } from '@/lib/serverWallet';

const MIN_AMOUNT_INR = 20; // ₹20 minimum top-up
const MIN_AMOUNT_PAISE = MIN_AMOUNT_INR * 100;

export async function POST(req: Request) {
  try {
    // Rate limit the order-creation endpoint (Razorpay orders have a cost;and
    // creates are idempotence-prone under bots) — 10 req / 60s / IP.

    const { allowed, retryAfter } = checkRateLimit(
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

    const { amount, currency = 'INR', userEmail, paymentType = 'wallet_topup' } = body;

    // Wallet top-ups must be tied to a signed-in account — the credit is
    // applied server-side in /api/payment/verify using this identity.
    let walletUserId: string | undefined;
    if (paymentType === 'wallet_topup') {
      const user = await getUserFromAuthHeader(req);
      if (!user) {
        return NextResponse.json(
          { error: 'Please sign in before adding funds to your wallet.' },
          { status: 401 }
        );
      }
      walletUserId = user.id;
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

    // Validate amount is a positive number and meets the ₹20 minimum
    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Please enter a valid top-up amount.' },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(amountNum * 100);
    if (amountPaise < MIN_AMOUNT_PAISE) {
      return NextResponse.json(
        { error: `Minimum top-up amount is ₹${MIN_AMOUNT_INR}. Please choose a higher amount.` },
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
        currency: currency.toUpperCase(),
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userEmail: userEmail || 'unknown',
          productType: paymentType,
          ...(walletUserId ? { userId: walletUserId } : {}),
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