import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updatePaymentStatus } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required parameters', success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      // Update payment status in database
      await updatePaymentStatus(
        razorpay_order_id,
        razorpay_payment_id,
        'success'
      );

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      await updatePaymentStatus(
        razorpay_order_id,
        razorpay_payment_id,
        'failed'
      );

      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', success: false },
      { status: 500 }
    );
  }
}
