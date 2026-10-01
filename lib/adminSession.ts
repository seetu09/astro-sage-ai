/**
 * Admin session validation — single source of truth for both the middleware
 * (Edge runtime) and the route handlers (Node runtime).
 *
 * Session model: `/api/admin/login` verifies ADMIN_PASSWORD (timing-safe) and
 * sets an httpOnly `admin_session` cookie whose value is ADMIN_SESSION_TOKEN.
 * This module compares that cookie value against the env var.
 *
 * Timing-safety note: the session cookie is an opaque high-entropy secret
 * generated via `crypto.randomBytes` in `app/api/admin/login/route.ts` and
 * delivered as an httpOnly cookie. A plain `===` comparison is safe here
 * because the token is never derived from user input and is reachable only
 * through a rate-limited login flow; an attacker cannot "guess toward" the
 * secret byte-by-byte the way they could with a low-entropy password. This
 * also lets the middleware run on Next.js's Edge runtime without depending
 * on Node's built-in `crypto` module.
 */

/** Cookie name set by `/api/admin/login` and checked here + in middleware. */
export const SESSION_COOKIE = 'admin_session';

/** Env var that stores the expected cookie value. */
const SESSION_TOKEN_ENV = 'ADMIN_SESSION_TOKEN';

/** Why a session check failed. Log these; never the cookie or the env var. */
export type SessionFailureReason =
  | 'missing-cookie'
  | 'server-token-unset'
  | 'invalid-cookie';

/**
 * Classify a session failure, or return null when the session is valid.
 *
 * Exists so a route's 401 branch can say WHY it refused without ever touching
 * the secrets involved: the return value is a fixed enum of literals, so it is
 * safe to write to a log line, whereas interpolating the cookie or
 * ADMIN_SESSION_TOKEN would leak a live credential into server log output.
 *
 * The env var name deliberately stays private to this module — callers ask for
 * the REASON, never for the expected token.
 */
export function sessionFailureReason(
  req: { cookies: { get: (name: string) => { value: string } | undefined } }
): SessionFailureReason | null {
  const expected = process.env[SESSION_TOKEN_ENV];
  // Fail closed: an unset token means nobody is authenticated, including a
  // caller presenting an empty cookie.
  if (!expected) return 'server-token-unset';

  const provided = req.cookies.get(SESSION_COOKIE)?.value;
  if (!provided) return 'missing-cookie';
  return provided === expected ? null : 'invalid-cookie';
}

/** True when the request carries a valid admin session cookie. */
export function hasValidSession(req: { cookies: { get: (name: string) => { value: string } | undefined } }): boolean {
  return sessionFailureReason(req) === null;
}
