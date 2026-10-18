import { getServiceSupabase } from '@/lib/serverWallet';
import { chartFingerprint } from '@/lib/chartFingerprint';

export { chartFingerprint };

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

/** Shape returned by `listPurchasedArtifacts` (camelCased for the client). */
export interface PurchasedArtifactSummary {
  id: string;
  artifactId: string;
  artifactName: string;
  priceInr: number;
  currency: string;
  orderId: string;
  paymentId: string;
  ownerEmail: string;
  createdAt: string;
}

/**
 * Full list of purchased artifacts for the signed-in user's profile
 * ("My Purchases" tab). Mirrors `listPurchasedReports` in
 * `lib/serverPurchasedReports.ts`: rows are listed by user id AND owner email
 * so store items bought before the account existed (same checkout email) also
 * surface for the signed-in user. Gracefully degrades to `[]` if the table is
 * missing (project not migrated yet) or the service key is absent.
 */
export async function listPurchasedArtifacts(
  ownerEmail: string,
  userId?: string | null
): Promise<PurchasedArtifactSummary[]> {
  const email = (ownerEmail ?? '').trim().toLowerCase();
  try {
    const supabase = getServiceSupabase();
    let query = supabase
      .from('purchased_artifacts')
      .select(
        'id, owner_email, artifact_id, artifact_name, price_inr, currency, order_id, payment_id, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(50);
    query = userId
      ? query.or(`owner_email.eq.${email},user_id.eq.${userId}`)
      : query.eq('owner_email', email);
    const { data, error } = await query;
    if (error) {
      console.error('LIST_PURCHASED_ARTIFACTS_FAILED', error.message);
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      artifactId: String(row.artifact_id ?? ''),
      artifactName: String(row.artifact_name ?? ''),
      priceInr: Number(row.price_inr ?? 0),
      currency: String(row.currency ?? 'INR'),
      orderId: String(row.order_id ?? ''),
      paymentId: String(row.payment_id ?? ''),
      ownerEmail: String(row.owner_email ?? email),
      createdAt: String(row.created_at ?? ''),
    }));
  } catch (err) {
    console.error('LIST_PURCHASED_ARTIFACTS_ERR', err);
    return [];
  }
}
