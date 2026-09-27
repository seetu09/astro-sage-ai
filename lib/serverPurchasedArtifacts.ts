import { getServiceSupabase } from '@/lib/serverWallet';

/**
 * Durable ownership records for artifact purchases (store checkout, Task 2.1).
 *
 * Mirrors `lib/serverPurchasedReports.ts`: every write goes through the
 * service-role client and the `record_purchased_artifact` RPC (005 migration),
 * which is idempotent on `order_id` — a repeated /api/payment/verify for the
 * same order can never create a second ownership row.
 *
 * Failure policy: log + return null (the caller decides how loudly to fail —
 * /api/payment/verify answers 500 with a support message, because silently
 * succeeding after a real payment would lose the buyer's purchase).
 */
export async function recordPurchasedArtifact(params: {
  ownerEmail: string;
  userId?: string | null;
  artifactId: string;
  artifactName?: string;
  priceInr: number;
  currency?: string;
  orderId: string;
  paymentId: string;
}): Promise<{ id: string } | null> {
  const email = (params.ownerEmail ?? '').trim().toLowerCase();
  if (!email || !params.artifactId || !params.orderId) {
    console.error(
      'RECORD_PURCHASED_ARTIFACT_FAILED',
      new Error('ownerEmail, artifactId and orderId are required')
    );
    return null;
  }
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('record_purchased_artifact', {
      p_owner_email: email,
      p_artifact_id: params.artifactId,
      p_artifact_name: params.artifactName ?? '',
      p_price_inr: params.priceInr,
      p_currency: params.currency ?? 'INR',
      p_order_id: params.orderId,
      p_payment_id: params.paymentId,
      p_user_id: params.userId ?? null,
    });
    if (error) {
      console.error('RECORD_PURCHASED_ARTIFACT_FAILED', error.message);
      return null;
    }
    return data ? { id: String(data) } : null;
  } catch (err) {
    console.error('RECORD_PURCHASED_ARTIFACT_ERR', err);
    return null;
  }
}
