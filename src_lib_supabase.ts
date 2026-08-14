import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to save a payment record
export async function savePayment(
  userEmail: string,
  razorpayOrderId: string,
  amount: number,
  paymentType: string = 'kundli_report',
  status: string = 'pending'
) {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      user_email: userEmail,
      razorpay_order_id: razorpayOrderId,
      amount: amount,
      currency: 'INR',
      status: status,
      payment_type: paymentType,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving payment:', error);
    return null;
  }
  return data;
}

// Helper to update payment status after verification
export async function updatePaymentStatus(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    return null;
  }
  return data;
}

// Helper to check if user has already paid for a report
export async function hasUserPaidForReport(userEmail: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_email', userEmail)
    .eq('payment_type', 'kundli_report')
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error checking payment:', error);
    return false;
  }

  return data && data.length > 0;
}
