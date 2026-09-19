import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side gate for admin surfaces.
 *
 * Previously `/admin` was protected only by a client-side password prompt, so
 * the page markup, the publishing form, and every `/api/admin/*` handler were
 * publicly reachable. This middleware enforces the gate before any of that is
 * served or executed.
 *
 * Session model: `/api/admin/login` verifies ADMIN_PASSWORD (timing-safe) and
 * sets an httpOnly `admin_session` cookie whose value is ADMIN_SESSION_TOKEN.
 * This middleware compares that cookie — it is an opaque shared secret, so the
 * cookie never carries a user-supplied value.
 *
 * Public exceptions (see PUBLIC_ADMIN_API / isPublicAdminPage below):
 *   - /admin/login          the login form itself
 *   - /api/admin/login      the credential-exchange endpoint
 *   - /api/admin/artifacts  has its own x-admin-password header auth and is
 *                           called by the client with a header, not a cookie
 */

const SESSION_COOKIE = 'admin_session';

/** Paths under /api/admin that must stay reachable without the session cookie. */
const PUBLIC_ADMIN_API = new Set([
  '/api/admin/login',
  // Self-authenticating via `x-admin-password`; the browser never sends the
  // session cookie here, so cookie-gating it would 401 the existing UI.
  '/api/admin/artifacts',
]);

/** The only page under /admin that is allowed to render unauthenticated. */
const PUBLIC_ADMIN_PAGE = '/admin/login';

/** True when the request carries a valid admin session cookie. */
function hasValidSession(req: NextRequest): boolean {
  const expected = process.env.ADMIN_SESSION_TOKEN;
  // Fail closed: an unset token means nobody is authenticated, including a
  // caller presenting an empty cookie.
  if (!expected) return false;

  const provided = req.cookies.get(SESSION_COOKIE)?.value;
  return provided === expected;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- API routes: 401 JSON, never a redirect (fetch callers expect JSON) ---
  if (pathname.startsWith('/api/admin')) {
    if (PUBLIC_ADMIN_API.has(pathname)) return NextResponse.next();

    if (!hasValidSession(req)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // --- Page routes: bounce to the login form, preserving the destination ---
  if (pathname === PUBLIC_ADMIN_PAGE) return NextResponse.next();

  if (!hasValidSession(req)) {
    const loginUrl = new URL('/admin/login', req.url);
    // Send the user back where they were headed after a successful login.
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Kept tight on purpose: only the admin trees and the legacy `/debug-kundli`
 * diagnostics page. Static assets, images, and every public page skip
 * middleware entirely so there is no per-request cost on the marketing site.
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/debug-kundli/:path*'],
};