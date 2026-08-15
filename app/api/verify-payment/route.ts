export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('=== VERIFY API START ===');

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    console.log('Verify payload:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      has_signature: !!razorpay_signature,
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing parameters', success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Razorpay secret not configured', success: false },
        { status: 500 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest('hex');

    if (generated !== razorpay_signature) {
      console.error('Signature mismatch');
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }

    console.log('Signature valid');

    // Update DB
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        await supabase
          .from('payments')
          .update({
            status: 'paid',
            razorpay_payment_id: razorpay_payment_id,
            paid_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpay_order_id);
        console.log('DB updated');
      } catch (e: any) {
        console.error('DB update warning:', e.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });

  } catch (error: any) {
    console.error('Verify fatal error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Verification failed', success: false },
      { status: 500 }
    );
  }
}
