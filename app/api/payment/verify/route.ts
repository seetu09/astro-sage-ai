import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { issueUnlockToken } from '@/lib/paymentUnlock';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: 'Razorpay secret missing', success: false },
        { status: 500 }
      );
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters', success: false },
        { status: 400 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }

    // Mint the signed unlock token the paid report + PDF routes require.
    let unlockToken: string | null = null;
    try {
      unlockToken = issueUnlockToken(razorpay_order_id, razorpay_payment_id);
    } catch {
      // Token issuance failing (misconfigured secret) must not silently pass.
      return NextResponse.json(
        { error: 'Unlock token issuance failed', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified',
      unlockToken,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed', success: false },
      { status: 500 }
    );
  }
}