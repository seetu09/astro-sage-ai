import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { default: Razorpay } = await import('razorpay');

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Razorpay credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { amount, currency = 'INR', userEmail, userName, birthDetails } = body;

    // Create Razorpay order
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { userEmail, productType: 'kundali' },
    };
    const order = await razorpay.orders.create(options);

    // Save to Supabase
    const { error: dbError } = await supabase.from('payments').insert({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'created',
      user_email: userEmail,
      user_name: userName,
      product_type: 'kundali',
      metadata: { birthDetails },
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
    }

    return NextResponse.json(
      { orderId: order.id, amount: order.amount, currency: order.currency },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Razorpay error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
