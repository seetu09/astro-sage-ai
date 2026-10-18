import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getUserFromAuthHeader } from "@/lib/serverWallet";
import { listPurchasedReports } from "@/lib/serverPurchasedReports";
import { listPurchasedArtifacts } from "@/lib/serverPurchasedArtifacts";

/**
 * GET /api/profile/purchases — everything the signed-in user owns, in one
 * payload: store artifacts (`purchased_artifacts`, 005) + kundli PDF reports
 * (`purchased_kundli_reports`, 002). Backs the profile "My Purchases" tab.
 *
 * Auth: Bearer Supabase access token (mirrors /api/profile/reports). Ownership
 * is matched by user id AND account email (the checkout email is the recovery
 * key, so purchases made before the account existed also surface here).
 *
 * Response: `{ artifacts: [...], reports: [...] }` — both ordered by
 * `created_at` desc, most recent first. Degrades to empty arrays if a table is
 * missing (project not migrated) so the profile tab never hard-fails.
 */
export async function GET(req: Request) {
  const { allowed, retryAfter } = await checkRateLimit(
    `profile-purchases:${getClientIp(req)}`,
    60,
    60_000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const [artifacts, reports] = await Promise.all([
    listPurchasedArtifacts(user.email ?? "", user.id),
    listPurchasedReports(user.email ?? "", user.id),
  ]);

  return NextResponse.json({ artifacts, reports });
}