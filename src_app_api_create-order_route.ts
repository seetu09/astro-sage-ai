import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', userEmail, paymentType = 'kundli_report' } = await request.json();

    if (!amount || !userEmail) {
      return NextResponse.json(
        { error: 'Amount and userEmail are required' },
        { status: 400 }
      );
    }

    const options = {
      amount: amount, // amount in paise (4900 = Rs. 49)
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userEmail,
        paymentType,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
