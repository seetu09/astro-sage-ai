import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    api_works: true,
    has_razorpay_key_id: !!process.env.RAZORPAY_KEY_ID,
    has_razorpay_secret: !!process.env.RAZORPAY_KEY_SECRET,
    has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    key_id_preview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...' : null,
    timestamp: Date.now(),
  });
}
