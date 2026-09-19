import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

/** Session cookie set on success; read and validated by `middleware.ts`. */
const SESSION_COOKIE = 'admin_session';

/** Brute-force cap for credential guessing — 5 attempts / 15 min / IP. */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Constant-time string comparison.
 *
 * `crypto.timingSafeEqual` throws when the buffers differ in length, which
 * would itself leak the password length. HMAC-ing both sides to a fixed-size
 * digest would work, but we pad both inputs to an equal length instead so the
 * comparison is safe and the length of the real value is never inferable.
 */
function safeEqual(a: string, b: string): boolean {
  const target = Math.max(a.length, b.length, 1);
  const bufA = Buffer.alloc(target);
  const bufB = Buffer.alloc(target);
  bufA.write(a, 'utf8');
  bufB.write(b, 'utf8');
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  // Rate limit before touching credentials so guessing is expensive.
  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(
    `admin-login:${ip}`,
    MAX_ATTEMPTS,
    WINDOW_MS
  );
  if (!allowed) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;
  if (!adminPassword || !sessionToken) {
    // Never echo which value is missing beyond the variable name.
    return NextResponse.json(
      { message: 'Server misconfigured: admin credentials are not set.' },
      { status: 500 }
    );
  }

  let submitted = '';
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === 'string') submitted = body.password;
  } catch {
    return NextResponse.json({ message: 'A JSON body is required' }, { status: 400 });
  }

  if (!submitted || !safeEqual(submitted, adminPassword)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const jar = cookies();
  jar.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return NextResponse.json({ success: true });
}