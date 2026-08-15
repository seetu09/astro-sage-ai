import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        { error: 'Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel env vars.' },
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

    // 3. Call Razorpay API directly using fetch (NO npm package!)
    console.log('Calling Razorpay API directly...');
    
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const razorpayBody = {
      amount: Math.round(Number(amount) * 100), // paise
      currency: currency.toUpperCase(),
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      notes: {
        userEmail: userEmail || 'unknown',
        productType: paymentType,
      },
    };

    console.log('Razorpay request body:', JSON.stringify(razorpayBody));

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayBody),
    });

    console.log('Razorpay response status:', razorpayResponse.status);

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json().catch(() => ({}));
      console.error('Razorpay API error:', errorData);
      return NextResponse.json(
        { error: `Razorpay error: ${errorData.error?.description || razorpayResponse.statusText}` },
        { status: 500 }
      );
    }

    const order = await razorpayResponse.json();
    console.log('Razorpay order created:', order.id);

    // 4. Save to Supabase (non-blocking)
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
        console.error('Supabase insert warning:', dbError);
      } else {
        console.log('Saved to Supabase successfully');
      }
    } catch (dbError: any) {
      console.error('Supabase save warning:', dbError);
    }

    console.log('=== CREATE ORDER API SUCCESS ===');
    return NextResponse.json(
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId,
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
