import crypto from "crypto";

/**
 * Server-side payment-unlock tokens.
 *
 * The paywall must be enforced on the server, not just in localStorage. When
 * Razorpay verification succeeds we mint a short-lived signed token proving a
 * real payment happened; the PDF/report download routes require and verify it.
 * A client that only sets `isPaid` in localStorage has no token and is refused.
 */

const UNLOCK_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const TOKEN_SEPARATOR = ".";

function secret(): string {
  const s = process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_UNLOCK_SECRET;
  if (!s) {
    throw new Error(
      "PAYMENT_UNLOCK_SECRET (or RAZORPAY_KEY_SECRET) is not configured."
    );
  }
  return s;
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Mint a signed token after a successfully verified Razorpay payment. */
export function issueUnlockToken(orderId: string, paymentId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ orderId, paymentId, iat: Date.now() })
  ).toString("base64url");
  return `${payload}${TOKEN_SEPARATOR}${hmac(payload)}`;
}

/**
 * Verify an unlock token. Returns the payment identifiers when the token is
 * authentic and unexpired, otherwise `null`.
 */
export function verifyUnlockToken(
  token: string | undefined | null
): { orderId: string; paymentId: string } | null {
  if (!token || typeof token !== "string") return null;
  const sep = token.lastIndexOf(TOKEN_SEPARATOR);
  if (sep <= 0 || sep === token.length - 1) return null;

  const payload = token.slice(0, sep);
  const sig = token.slice(sep + 1);

  let expected: Buffer;
  try {
    expected = Buffer.from(hmac(payload));
  } catch {
    return null;
  }
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as { orderId?: unknown; paymentId?: unknown; iat?: unknown };
    if (
      typeof parsed.orderId !== "string" ||
      typeof parsed.paymentId !== "string" ||
      typeof parsed.iat !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.iat > UNLOCK_TTL_MS) return null;
    return { orderId: parsed.orderId, paymentId: parsed.paymentId };
  } catch {
    return null;
  }
}
