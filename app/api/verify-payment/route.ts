import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('=== VERIFY PAYMENT API START ===');

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    console.log('Verify request:', { razorpay_order_id, razorpay_payment_id, signature_present: !!razorpay_signature });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required parameters', success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET missing');
      return NextResponse.json(
        { error: 'Payment verification not configured', success: false },
        { status: 500 }
      );
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpay_signature) {
      console.log('Signature verified');

      // Update Supabase
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey) {
          const supabase = createClient(supabaseUrl, serviceRoleKey);
          await supabase
            .from('payments')
            .update({ 
              status: 'paid',
              razorpay_payment_id: razorpay_payment_id,
              paid_at: new Date().toISOString(),
            })
            .eq('razorpay_order_id', razorpay_order_id);
        }
      } catch (e) {
        console.error('DB update warning:', e);
      }

      return NextResponse.json({ success: true, message: 'Payment verified' });
    } else {
      console.error('Signature mismatch');
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed', success: false },
      { status: 500 }
    );
  }
}
