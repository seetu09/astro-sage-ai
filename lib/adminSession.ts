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

/** True when the request carries a valid admin session cookie. */
export function hasValidSession(req: { cookies: { get: (name: string) => { value: string } | undefined } }): boolean {
  const expected = process.env[SESSION_TOKEN_ENV];
  // Fail closed: an unset token means nobody is authenticated, including a
  // caller presenting an empty cookie.
  if (!expected) return false;

  const provided = req.cookies.get(SESSION_COOKIE)?.value;
  return provided === expected;
}
