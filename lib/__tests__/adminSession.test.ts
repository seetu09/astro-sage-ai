import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasValidSession, SESSION_COOKIE } from '@/lib/adminSession';

/** Minimal request-shaped object that satisfies the hasValidSession contract. */
function mockReq(cookieValue?: string) {
  return {
    cookies: {
      get: (name: string) => {
        if (name === SESSION_COOKIE && cookieValue !== undefined) {
          return { value: cookieValue };
        }
        return undefined;
      },
    },
  };
}

describe('adminSession', () => {
  const origToken = process.env.ADMIN_SESSION_TOKEN;

  beforeAll(() => {
    // Ensure a known token for the "correct token" test.
    process.env.ADMIN_SESSION_TOKEN = 'test-session-token-12345';
  });

  afterAll(() => {
    // Restore original env (may be undefined) to avoid polluting other tests.
    if (origToken === undefined) {
      delete process.env.ADMIN_SESSION_TOKEN;
    } else {
      process.env.ADMIN_SESSION_TOKEN = origToken;
    }
  });

  describe('hasValidSession', () => {
    it('returns false when the cookie is missing', () => {
      const req = mockReq(undefined);
      expect(hasValidSession(req)).toBe(false);
    });

    it('returns false when the cookie value does not match the env token', () => {
      const req = mockReq('wrong-token-value');
      expect(hasValidSession(req)).toBe(false);
    });

    it('returns true when the cookie value matches the env token', () => {
      const req = mockReq('test-session-token-12345');
      expect(hasValidSession(req)).toBe(true);
    });

    it('returns false when ADMIN_SESSION_TOKEN env is unset', () => {
      delete process.env.ADMIN_SESSION_TOKEN;
      const req = mockReq('any-cookie-value');
      expect(hasValidSession(req)).toBe(false);
    });
  });
});
