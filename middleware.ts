import { NextRequest, NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/adminSession';

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
 * Public exceptions (see PUBLIC_ADMIN_API below):
 *   - /admin/login          the login form itself
 *   - /api/admin/login      the credential-exchange endpoint
 *
 * All other `/api/admin/*` routes require a valid session cookie. Read-only
 * catalog data that is legitimately public (consumed by the storefront) is
 * served from `/api/artifacts` — a route outside the admin tree that the
 * middleware intentionally leaves unprotected.
 */


/** Paths under /api/admin that must stay reachable without the session cookie. */
const PUBLIC_ADMIN_API = new Set([
  '/api/admin/login',
]);

/** The only page under /admin that is allowed to render unauthenticated. */
const PUBLIC_ADMIN_PAGE = '/admin/login';

/**
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