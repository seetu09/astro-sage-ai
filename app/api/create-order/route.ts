import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  console.log('=== CREATE ORDER API START ===');

  try {
    // 1. Validate env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Missing Razorpay credentials');
      return NextResponse.json(
        { error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel env vars.' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      );
    }

    // 2. Parse request body
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

    const { amount, currency = 'INR', userEmail, userName, paymentType = 'kundali' } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      );
    }

    // 3. Initialize Razorpay (STATIC IMPORT — this is the fix!)
    console.log('Initializing Razorpay...');
    let razorpay;
    try {
      razorpay = new Razorpay({ 
        key_id: keyId, 
        key_secret: keySecret 
      });
      console.log('Razorpay initialized successfully');
    } catch (rzpError: any) {
      console.error('Razorpay initialization failed:', rzpError);
      return NextResponse.json(
        { error: 'Payment gateway initialization failed: ' + rzpError.message },
        { status: 500 }
      );
    }

    // 4. Create order
    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency: currency.toUpperCase(),
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      notes: { 
        userEmail: userEmail || 'unknown', 
        productType: paymentType 
      },
    };

    console.log('Creating Razorpay order with options:', options);
    
    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log('Razorpay order created:', order.id);
    } catch (orderError: any) {
      console.error('Razorpay order creation failed:', orderError);
      return NextResponse.json(
        { error: 'Failed to create payment order: ' + (orderError.error?.description || orderError.message) },
        { status: 500 }
      );
    }

    // 5. Save to Supabase (non-blocking — don't fail if DB insert fails)
    try {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error: dbError } = await supabase.from('payments').insert({
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        user_email: userEmail || null,
        user_name: userName || null,
        product_type: paymentType,
        metadata: { birthDetails: body.birthDetails || null },
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error('Supabase insert warning (non-critical):', dbError);
      } else {
        console.log('Saved to Supabase successfully');
      }
    } catch (dbError: any) {
      console.error('Supabase save warning (non-critical):', dbError);
      // Don't fail the payment if DB save fails
    }

    console.log('=== CREATE ORDER API SUCCESS ===');
    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId, // Send keyId so frontend doesn't need env var
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('=== CREATE ORDER API ERROR ===', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
