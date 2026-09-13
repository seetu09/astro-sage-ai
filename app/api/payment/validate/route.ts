import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyUnlockToken } from "@/lib/paymentUnlock";

/**
 * POST /api/payment/validate
 *
 * Server-side re-validation of the unlock token persisted in localStorage.
 * `AppContext` calls this on mount: a token can pass its client-side 30-day
 * expiry check yet be stale/invalid on the server (rotated secret, tampered
 * payload, clock skew across devices). When the server says invalid, the
 * context clears localStorage and flips `isPaid` back to false.
 *
 * Request body: { "token": "<signed unlock token from /api/payment/verify>" }
 * Response:     { "valid": boolean }
 *
 * Note: the token is stateless (signed HMAC, 30-day TTL) — this endpoint
 * performs cryptographic + expiry verification; it does not (yet) consult a
 * payments table. Adding one is a drop-in inside `verifyUnlockToken`.
 */
export async function POST(req: NextRequest) {
  // Brute-force resistance — forgery attempts are capped per IP.
  const { allowed, retryAfter } = checkRateLimit(
    `payment-validate:${getClientIp(req)}`,
    30,
    60_000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly.", valid: false },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let token: unknown;
  try {
    const body = await req.json();
    token = (body as Record<string, unknown>)?.token;
  } catch {
    // Malformed body → treated as an invalid token below.
    token = undefined;
  }

  const valid = verifyUnlockToken(
    typeof token === "string" ? token : undefined
  );

  return NextResponse.json({ valid: valid !== null });
}
