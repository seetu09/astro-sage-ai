import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  console.log('=== VERIFY PAYMENT API START ===');

  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    console.log('Verify request body:', { razorpay_order_id, razorpay_payment_id, razorpay_signature: razorpay_signature ? 'present' : 'missing' });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required parameters', success: false },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET not configured');
      return NextResponse.json(
        { error: 'Payment verification not configured', success: false },
        { status: 500 }
      );
    }

    // Generate signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    console.log('Generated signature:', generatedSignature);
    console.log('Received signature:', razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      console.log('Signature verified successfully');

      // Update payment status in Supabase (non-blocking)
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (supabaseUrl && serviceRoleKey) {
          const supabase = createClient(supabaseUrl, serviceRoleKey);
          const { error: dbError } = await supabase
            .from('payments')
            .update({ 
              status: 'paid',
              razorpay_payment_id: razorpay_payment_id,
              paid_at: new Date().toISOString(),
            })
            .eq('razorpay_order_id', razorpay_order_id);

          if (dbError) {
            console.error('Supabase update warning:', dbError);
          } else {
            console.log('Payment status updated in Supabase');
          }
        }
      } catch (dbError: any) {
        console.error('Supabase update warning:', dbError);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
      });
    } else {
      console.error('Signature mismatch');
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed: ' + error.message, success: false },
      { status: 500 }
    );
  }
}
