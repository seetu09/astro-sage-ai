import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/payment/reset
 *
 * Client-side companion to `resetPayment()` in `app/context/AppContext.tsx`.
 * Clears any server-side view of the unlock session for this caller.
 *
 * The unlock token itself is a stateless signed HMAC (see
 * `lib/paymentUnlock.ts`) — it carries no server-side session record, so
 * "invalidation" is effectively: the client discards its copy and this route
 * acknowledges the reset. Rate-limited to keep it from being hammered.
 *
 * Response: { success: true, resetAt: ISO-string }
 */
export async function POST(req: NextRequest) {
  // Light rate limit — reset is a trivial op, but never an open spam target.
  const { allowed, retryAfter } = checkRateLimit(
    `payment-reset:${getClientIp(req)}`,
    30,
    60_000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly.", success: false },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Payment state reset. The unlock token is now discarded client-side.",
    resetAt: new Date().toISOString(),
  });
}
