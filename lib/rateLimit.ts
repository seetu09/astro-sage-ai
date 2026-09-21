import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Shared server-side IP-based rate limiting for expensive / abuse-prone routes
 * (AI generation, PDF rendering, payments).
 *
 * Primary store is Upstash Redis (a globally distributed sliding window), which
 * gives a real cross-instance quota on multi-region Vercel deployments. When the
 * Upstash env vars are absent (local dev, CI, offline tests) — or when a Redis
 * call errors — the limiter falls back to the in-memory sliding window below,
 * which is correct for a single serverless instance and never rejects a request
 * just because the shared store is unavailable (fail-open-to-memory).
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
 * In-memory sliding-window limiter — the fallback when Upstash Redis is not
 * configured or is unreachable. Kept intentionally simple; state is per-process
 * and therefore per-serverless-instance.
 */
function checkRateLimitInMemory(
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

/**
 * Upstash limiter instances, one per distinct (limit, windowMs) pair — routes
 * configure different limits, and `Ratelimit` binds a single configuration.
 */
const limiters = new Map<string, Ratelimit>();

// Captured once at module load: absent config means "never touch the network".
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis =
  upstashUrl && upstashToken
    ? new Redis({ url: upstashUrl, token: upstashToken })
    : null;

function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Check + consume one request against the given keyed bucket.
 *
 * Backed by Upstash Redis when `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` are both set. If those env vars are missing, or if
 * the Redis call throws for any reason, this transparently falls back to the
 * in-memory limiter — the request is never rejected merely because Redis is
 * unavailable (fail-open-to-memory). Redis failures are logged, not propagated.
 *
 * Now async: call sites must `await` it.
 *
 * @param key  Unique bucket key — combine scope + IP (e.g. `chat:1.2.3.4`).
 * @param limit  Max requests allowed within the window.
 * @param windowMs  Window length in milliseconds.
 * @returns The rate-limit decision; `retryAfter` is seconds until retry (0 when allowed).
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  // No shared store configured → in-memory only.
  if (!redis) {
    return checkRateLimitInMemory(key, limit, windowMs);
  }

  try {
    const { success, reset } = await getLimiter(limit, windowMs).limit(key);
    return {
      allowed: success,
      retryAfter: success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (err) {
    console.error("[rateLimit] Redis error, falling back to memory:", err);
    return checkRateLimitInMemory(key, limit, windowMs);
  }
}