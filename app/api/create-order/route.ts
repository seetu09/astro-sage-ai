import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  console.log('=== API START ===');

  try {
    // Check env vars first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SERVICE_ROLE_KEY exists:', !!serviceRoleKey);
    console.log('RAZORPAY_KEY_ID exists:', !!keyId);
    console.log('RAZORPAY_KEY_SECRET exists:', !!keySecret);

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      );
    }

    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Razorpay credentials not configured' },
        { status: 500 }
      );
    }

    // Initialize Supabase
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    console.log('Supabase client created');

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (e) {
      console.error('Failed to parse JSON body:', e);
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { amount, currency = 'INR', userEmail, userName, birthDetails } = body;

    if (!amount || isNaN(amount)) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    console.log('Creating Razorpay order...');
    const { default: Razorpay } = await import('razorpay');
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { userEmail: userEmail || 'unknown', productType: 'kundali' },
    };

    console.log('Razorpay options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order.id);

    // Save to Supabase
    console.log('Saving to Supabase...');
    const { error: dbError } = await supabase.from('payments').insert({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'created',
      user_email: userEmail || null,
      user_name: userName || null,
      product_type: 'kundali',
      metadata: { birthDetails: birthDetails || null },
    });

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      // Don't fail - payment can still proceed
    } else {
      console.log('Saved to Supabase successfully');
    }

    console.log('=== API SUCCESS ===');
    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('=== API ERROR ===', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
