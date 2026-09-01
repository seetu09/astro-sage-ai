import type { NextRequest } from "next/server";

/**
 * Shared server-side IP-based rate limiting for expensive / abuse-prone routes
 * (AI generation, PDF rendering, payments). Uses an in-memory sliding window,
 * which is correct for a single serverless instance; for multi-region Vercel
 * deployments this still meaningfully cuts per-instance abuse but is NOT a
 * hard global quota — pair with a Vercel WAF / Upstash for a strict ceiling.
 */

type Entry = { count: number; resetAt: number };

// Held across lambda warm invocations for the module's lifetime.
const buckets = new Map<string, Entry>();

/** When the map grows past this, expired entries are purged in-line. */
const MAX_ENTRIES = 5_000;

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the caller may retry (0 when allowed). */
  retryAfter: number;
}

/** Best-effort client IP extraction honoring reverse-proxy headers. */
export function getClientIp(request: Request | NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check + consume one request against the given keyed bucket.
 *
 * @param key  Unique bucket key — combine scope + IP (e.g. `chat:1.2.3.4`).
 * @param limit  Max requests allowed within the window.
 * @param windowMs  Window length in milliseconds.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Opportunistic purge so the map can't grow unbounded.
  if (buckets.size > MAX_ENTRIES) {
    buckets.forEach((entry, key) => {
      if (entry.resetAt < now) buckets.delete(key);
    });
  }

  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}