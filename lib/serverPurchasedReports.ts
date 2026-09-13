import { getServiceSupabase } from "@/lib/serverWallet";

/**
 * Server-side purchased-kundli-report ownership.
 *
 * The paid kundli report is owned server-side: when a `kundli_report` Razorpay
 * order settles, /api/payment/verify records a row in `purchased_kundli_reports`
 * (via the service role / RPC `record_purchased_kundli`). That row authorizes
 * re-downloads from the profile's "Downloaded Reports" tab at any later time —
 * it is NOT a browser flag, and a page refresh / session loss cannot lose it.
 *
 * Requires the `002_purchased_kundli_reports` migration to have been applied.
 * Every function degrades gracefully (returns null/[]) if the table is missing
 * so a not-yet-migrated project keeps working.
 */

export interface PurchasedKundliReportSummary {
  id: string;
  /** Always present; the recovery key (even for signed-in owners). */
  ownerEmail: string;
  chartFingerprint: string;
  clientName: string;
  birthDate: string;
  birthTime: string;
  orderId: string;
  paymentId: string;
  createdAt: string;
  /** Full paid report payload (chartData/calculations/pillars/paidTier/…). */
  report: unknown;
}

/**
 * Stable fingerprint for a specific chart, used to key ownership. A user who
 * buys the exact same birth details twice owns a single report (upsert).
 */
export function chartFingerprint(input: {
  latitude?: number | string | null;
  longitude?: number | string | null;
  birthDate?: string | null;
  birthTime?: string | null;
  timezone?: string | null;
}): string {
  const parts = [
    String(input.latitude ?? ""),
    String(input.longitude ?? ""),
    String(input.birthDate ?? ""),
    String(input.birthTime ?? ""),
    String(input.timezone ?? "+05:30"),
  ];
  // Content hash so the fingerprint never embeds personal detail verbatim.
  const text = parts.join("|");
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 ^= c;
    h1 = (h1 * 0x01000193) & 0xffffffff;
    h2 = (h2 * 31 + c) & 0xffffffff;
  }
  return `${h1.toString(16)}-${h2.toString(16)}`;
}

/**
 * Record a purchase (idempotent per owner+chart).
 *
 * Email-based ownership: every purchase is keyed by `ownerEmail` (the recovery
 * key). `userId` is also written when the buyer was signed in, so the profile
 * "Downloaded Reports" tab can list it under their account. Both the email and
 * a full report payload (`report`) can be passed; an empty report is fine — the
 * rich payload can be attached later via `updatePurchasedReportPayload`.
 */
export async function recordPurchasedKundliReport(params: {
  ownerEmail: string;
  userId?: string | null;
  chartFingerprint: string;
  clientName: string;
  birthDate: string;
  birthTime: string;
  orderId: string;
  paymentId: string;
  report?: unknown;
}): Promise<{ id: string } | null> {
  const email = (params.ownerEmail ?? "").trim().toLowerCase();
  if (!email) {
    console.error("RECORD_PURCHASED_KUNDLI_FAILED", new Error("ownerEmail is required"));
    return null;
  }
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc("record_purchased_kundli", {
      p_owner_email: email,
      p_chart_fingerprint: params.chartFingerprint,
      p_client_name: params.clientName,
      p_birth_date: params.birthDate,
      p_birth_time: params.birthTime,
      p_order_id: params.orderId,
      p_payment_id: params.paymentId,
      p_report: params.report ?? {},
      p_user_id: params.userId ?? null,
    });
    if (error) {
      console.error("RECORD_PURCHASED_KUNDLI_FAILED", error.message);
      return null;
    }
    return data ? { id: String(data) } : null;
  } catch (err) {
    console.error("RECORD_PURCHASED_KUNDLI_ERR", err);
    return null;
  }
}

/**
 * Does this owner (by userId OR email) own this chart? Authorizes re-download
 * for both signed-in users and anonymous purchasers who recovered their report
 * via email.
 */
export async function hasPurchasedReport(
  ownerEmail: string,
  fingerprint: string,
  userId?: string | null
): Promise<boolean> {
  const email = (ownerEmail ?? "").trim().toLowerCase();
  try {
    const supabase = getServiceSupabase();
    // Match by user_id if we have one, otherwise fall back to email. The
    // coalesce handles the case where an anonymous buyer later signed in —
    // the row may have been backfilled with user_id by the RPC.
    const { data, error } = await supabase
      .from("purchased_kundli_reports")
      .select("id")
      .eq("chart_fingerprint", fingerprint)
      .or(`owner_email.eq.${email}${userId ? `,user_id.eq.${userId}` : ""}`)
      .maybeSingle();
    if (error) {
      console.error("HAS_PURCHASED_REPORT_FAILED", error.message);
      return false;
    }
    return Boolean(data);
  } catch {
    return false;
  }
}

/** Full list of purchased reports for a signed-in user's profile tab. */
export async function listPurchasedReports(
  ownerEmail: string,
  userId?: string | null
): Promise<PurchasedKundliReportSummary[]> {
  const email = (ownerEmail ?? "").trim().toLowerCase();
  try {
    const supabase = getServiceSupabase();
    // List rows owned by this user (by id) OR by this email (so a signed-in
    // user also sees reports they bought before signing in, once backfilled).
    let query = supabase
      .from("purchased_kundli_reports")
      .select(
        "id, owner_email, chart_fingerprint, client_name, birth_date, birth_time, order_id, payment_id, created_at, report"
      )
      .order("created_at", { ascending: false })
      .limit(50);
    query = userId
      ? query.or(`owner_email.eq.${email},user_id.eq.${userId}`)
      : query.eq("owner_email", email);
    const { data, error } = await query;
    if (error) {
      console.error("LIST_PURCHASED_REPORTS_FAILED", error.message);
      return [];
    }
    return (data ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      ownerEmail: String(row.owner_email ?? email),
      chartFingerprint: String(row.chart_fingerprint ?? ""),
      clientName: String(row.client_name ?? "User"),
      birthDate: String(row.birth_date ?? ""),
      birthTime: String(row.birth_time ?? ""),
      orderId: String(row.order_id ?? ""),
      paymentId: String(row.payment_id ?? ""),
      createdAt: String(row.created_at ?? ""),
      report: row.report ?? {},
    }));
  } catch {
    return [];
  }
}

/** Attach the full paid report payload to an owned row (email-keyed). */
export async function updatePurchasedReportPayload(
  ownerEmail: string,
  chartFingerprint: string,
  report: unknown,
  userId?: string | null
): Promise<boolean> {
  const email = (ownerEmail ?? "").trim().toLowerCase();
  try {
    const supabase = getServiceSupabase();
    let query = supabase
      .from("purchased_kundli_reports")
      .update({ report })
      .eq("chart_fingerprint", chartFingerprint)
      .or(`owner_email.eq.${email}${userId ? `,user_id.eq.${userId}` : ""}`)
      .select("id");
    const { data, error } = await query;
    if (error) {
      console.error("UPDATE_PURCHASED_REPORT_FAILED", error.message);
      return false;
    }
    return Boolean(data && data.length > 0);
  } catch {
    return false;
  }
}

/** Re-bind any email-keyed reports to a newly signed-in account (one-time). */
export async function bindPurchasedKundliToUser(
  ownerEmail: string,
  userId: string
): Promise<void> {
  const email = (ownerEmail ?? "").trim().toLowerCase();
  if (!email || !userId) return;
  try {
    const supabase = getServiceSupabase();
    const { error } = await supabase.rpc("bind_purchased_kundli_to_user", {
      p_owner_email: email,
      p_user_id: userId,
    });
    if (error) console.error("BIND_PURCHASED_KUNDLI_FAILED", error.message);
  } catch (err) {
    console.error("BIND_PURCHASED_KUNDLI_ERR", err);
  }
}