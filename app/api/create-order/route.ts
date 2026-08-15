export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Universal base64 encoder (works in Node.js AND Edge)
function base64Encode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str).toString('base64');
  }
  // Fallback for any environment
  return btoa(str);
}

export async function POST(req: NextRequest) {
  console.log('=== CREATE ORDER API v3 START ===');

  try {
    // 1. Validate env vars FIRST (before any heavy operations)
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Env check:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
    });

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay credentials missing. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel Environment Variables.' },
        { status: 500 }
      );
    }

    // 2. Parse body
    let body;
    try {
      body = await req.json();
      console.log('Body parsed:', JSON.stringify(body));
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { amount, currency = 'INR', userEmail, userName, paymentType = 'kundali' } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 3. Call Razorpay via native fetch
    console.log('Calling Razorpay API...');
    
    const authString = base64Encode(`${keyId}:${keySecret}`);
    
    const orderPayload = {
      amount: Math.round(Number(amount) * 100),
      currency: currency.toUpperCase(),
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userEmail: userEmail || 'unknown',
        productType: paymentType,
      },
    };

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    console.log('Razorpay status:', rzpRes.status);

    if (!rzpRes.ok) {
      const errData = await rzpRes.json().catch(() => ({}));
      console.error('Razorpay error:', errData);
      return NextResponse.json(
        { error: `Razorpay error: ${errData.error?.description || rzpRes.statusText}` },
        { status: 500 }
      );
    }

    const order = await rzpRes.json();
    console.log('Order created:', order.id);

    // 4. Save to Supabase (best effort, don't fail payment if DB fails)
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { error: dbErr } = await supabase.from('payments').insert({
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
        if (dbErr) console.error('DB warning:', dbErr);
        else console.log('DB saved');
      } catch (dbErr: any) {
        console.error('DB exception:', dbErr.message);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });

  } catch (error: any) {
    console.error('FATAL ERROR:', error.message, error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
