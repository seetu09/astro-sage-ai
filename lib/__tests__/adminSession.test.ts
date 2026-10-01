import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { hasValidSession, sessionFailureReason, SESSION_COOKIE } from '@/lib/adminSession';

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

  /**
   * Added with the Task 4.3 upload route, whose 401 branch logs WHY it refused.
   * The reason is what makes that log line safe: it is an enum of literals, never
   * the cookie or the expected token, so the route can explain a 401 without
   * writing a live credential into server logs.
   */
  describe('sessionFailureReason', () => {
    beforeAll(() => {
      // Re-assert the token: the case above deliberately DELETES it to prove
      // `hasValidSession` fails closed and does not put it back, so without this
      // every reason here would read 'server-token-unset'.
      process.env.ADMIN_SESSION_TOKEN = 'test-session-token-12345';
    });

    it('returns null for a valid session', () => {
      expect(sessionFailureReason(mockReq('test-session-token-12345'))).toBeNull();
    });

    it('reports "missing-cookie" when no cookie is presented', () => {
      expect(sessionFailureReason(mockReq(undefined))).toBe('missing-cookie');
    });

    it('reports "invalid-cookie" when the cookie does not match', () => {
      expect(sessionFailureReason(mockReq('wrong-token-value'))).toBe('invalid-cookie');
    });

    it('reports "server-token-unset" when the env token is missing', () => {
      // Distinct from "invalid-cookie": the admin is authenticated-looking but the
      // SERVER is unconfigured, which is an operator problem, not a caller one.
      const saved = process.env.ADMIN_SESSION_TOKEN;
      delete process.env.ADMIN_SESSION_TOKEN;
      try {
        expect(sessionFailureReason(mockReq('any-cookie-value'))).toBe('server-token-unset');
      } finally {
        // Restored so this case does not silently reconfigure every test that
        // follows it in the file.
        process.env.ADMIN_SESSION_TOKEN = saved;
      }
    });

    it('never echoes the cookie or the expected token', () => {
      const reason = sessionFailureReason(mockReq('wrong-token-value'));
      expect(reason).toBe('invalid-cookie');
      expect(String(reason)).not.toContain('wrong-token-value');
      expect(String(reason)).not.toContain('test-session-token-12345');
    });
  });
});
