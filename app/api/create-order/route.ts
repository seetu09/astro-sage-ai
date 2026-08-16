import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('HANDLER_STARTED');
  
  try {
    const body = await req.json();
    console.log('BODY_RECEIVED:', JSON.stringify(body));
    
    const { amount, currency = 'INR', userEmail, paymentType = 'kundali' } = body;

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

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    console.log('CALLING_RAZORPAY');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
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
