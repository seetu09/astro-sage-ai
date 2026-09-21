import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Rate-limit fallback coverage.
 *
 * The limiter captures its Upstash config at MODULE LOAD, so every scenario needs
 * a fresh module registry (`vi.resetModules()`) plus a `vi.doMock` registered
 * BEFORE `await import('@/lib/rateLimit')`. Mocking the `@upstash/ratelimit`
 * package itself (rather than `@upstash/redis`) is the cleanest seam: the module
 * under test only ever touches `Ratelimit` and `Ratelimit.slidingWindow`, so a
 * stubbed `limit()` lets us assert both the happy path and the throwing path.
 */

/** Counters let each test use unique keys — bucket state is module-scoped. */
let uniqueKey = 0;
function nextKey(scope: string) {
  uniqueKey += 1;
  return `${scope}:${uniqueKey}`;
}

describe('checkRateLimit — in-memory fallback', () => {
  beforeEach(() => {
    vi.resetModules();
    uniqueKey = 0;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.restoreAllMocks();
  });

  it('allows up to `limit` requests then denies with retryAfter > 0 (no env vars)', async () => {
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const key = nextKey('memory');
    const limit = 3;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i += 1) {
      const result = await checkRateLimit(key, limit, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBe(0);
    }

    const denied = await checkRateLimit(key, limit, windowMs);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfter).toBeGreaterThan(0);
  });

  it('falls back to in-memory when the Redis call throws', async () => {
    // Env vars present → the module constructs a Redis client and its Upstash
    // limiter. `limit()` is mocked to reject so we exercise the catch branch.
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

    const limitMock = vi.fn().mockRejectedValue(new Error('redis down'));
    vi.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        class {
          limit = limitMock;
        },
        {
          slidingWindow: vi.fn((limit: number) => (limit: number) => ({ limit })),
        },
      ),
    }));
    vi.doMock('@upstash/redis', () => ({
      Redis: class {
        constructor(_config: unknown) {}
      },
    }));

    // Silences the intentional `console.error` from the catch branch.
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { checkRateLimit } = await import('@/lib/rateLimit');
    const key = nextKey('throws');
    const limit = 2;
    const windowMs = 60_000;

    // Must not throw — Redis failing never rejects the request.
    const first = await checkRateLimit(key, limit, windowMs);
    expect(first).toEqual({ allowed: true, retryAfter: 0 });

    const second = await checkRateLimit(key, limit, windowMs);
    expect(second).toEqual({ allowed: true, retryAfter: 0 });

    // The in-memory bucket was driven by the fallback, not Redis.
    const third = await checkRateLimit(key, limit, windowMs);
    expect(third.allowed).toBe(false);
    expect(third.retryAfter).toBeGreaterThan(0);

    // Each call hit Redis, failed, and fell back.
    expect(limitMock).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  });
});
