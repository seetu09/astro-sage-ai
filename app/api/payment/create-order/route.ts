import { NextResponse } from 'next/server';

const MIN_AMOUNT_INR = 20; // ₹20 minimum top-up
const MIN_AMOUNT_PAISE = MIN_AMOUNT_INR * 100;

export async function POST(req: Request) {
  console.log('PAYMENT_CREATE_ORDER_STARTED');

  try {
    const body = await req.json();
    console.log('PAYMENT_BODY_RECEIVED:', JSON.stringify(body));

    const { amount, currency = 'INR', userEmail, paymentType = 'wallet_topup' } = body;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('ENV_CHECK:', { hasKeyId: !!keyId, hasSecret: !!keySecret });

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

    console.log('CALLING_RAZORPAY');
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
        },
      }),
    });

    console.log('RAZORPAY_STATUS:', rzpRes.status);

    if (!rzpRes.ok) {
      const err = await rzpRes.json().catch(() => ({}));
      console.error('RAZORPAY_ERROR:', err);
      return NextResponse.json(
        { error: err.error?.description || `Razorpay error: ${rzpRes.status}` },
        { status: 500 }
      );
    }

    const order = await rzpRes.json();
    console.log('ORDER_CREATED:', order.id);

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