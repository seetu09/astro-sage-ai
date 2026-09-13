import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getUserFromAuthHeader } from "@/lib/serverWallet";
import {
  listPurchasedReports,
  updatePurchasedReportPayload,
} from "@/lib/serverPurchasedReports";

/**
 * GET /api/profile/reports — purchased kundli reports for the signed-in user.
 *
 * Backs the profile "Downloaded Reports" tab. Ownership is stored server-side
 * in `purchased_kundli_reports` (written only after a verified Razorpay
 * payment), so a user can re-open/download any report they paid for at any
 * time — no browser flags, no re-payment.
 *
 * Auth: Bearer Supabase access token (mirrors /api/wallet). The signed-in user's
 * account email is also used as a recovery key so reports bought before the
 * account was created (with the same email) surface automatically.
 */
export async function GET(req: Request) {
  const { allowed, retryAfter } = checkRateLimit(`profile-reports:${getClientIp(req)}`, 60, 60_000);
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

  // List by account id AND by email so purchases tied to this email (even from
  // before the account existed) appear in the profile tab.
  const reports = await listPurchasedReports(user.email ?? "", user.id);
  return NextResponse.json({ reports });
}

/**
 * POST /api/profile/reports — publish the full paid report payload onto an
 * owned row. Called by the kundli page after a purchase once the user's unlock
 * token lets them re-fetch the complete report. The owned row (created at
 * verify time) is updated in place so the profile's "Downloaded Reports" tab
 * can re-render/download the full report.
 *
 * Body: { chartFingerprint: string, report: object }
 */
export async function POST(req: Request) {
  const { allowed, retryAfter } = checkRateLimit(`profile-reports:${getClientIp(req)}`, 60, 60_000);
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

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const fingerprint =
    typeof body.chartFingerprint === "string" ? body.chartFingerprint.trim() : "";
  if (!fingerprint) {
    return NextResponse.json({ error: "chartFingerprint is required" }, { status: 400 });
  }
  if (!body.report || typeof body.report !== "object") {
    return NextResponse.json({ error: "report payload is required" }, { status: 400 });
  }

  const ok = await updatePurchasedReportPayload(
    user.email ?? "",
    fingerprint,
    body.report,
    user.id
  );
  return NextResponse.json({ ok });
}