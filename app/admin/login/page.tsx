'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

/**
 * Admin login form.
 *
 * Posts the password to /api/admin/login, which verifies it server-side
 * (timing-safe, rate limited) and sets the httpOnly `admin_session` cookie.
 * `middleware.ts` then admits the real admin pages. This page is the one
 * /admin path that middleware leaves public.
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        // middleware.ts set the cookie; go where the user originally intended.
        const next = searchParams.get('next');
        router.replace(next && next.startsWith('/') ? next : '/admin');
        router.refresh();
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(
        res.status === 429
          ? data.message || 'Too many attempts. Please try again later.'
          : 'Incorrect password.'
      );
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <form onSubmit={handleSubmit} className="astro-card w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">
            Admin Access
          </h1>
          <p className="astro-text-secondary text-sm mt-1">
            Enter the admin password to continue.
          </p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin Password"
          className="astro-input w-full mb-4"
          autoFocus
          autoComplete="current-password"
        />

        {error && (
          <p className="mb-4 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!password.trim() || submitting}
          className="astro-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
            </span>
          ) : (
            'Unlock Dashboard'
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * `useSearchParams()` forces this route out of static prerendering, so the
 * form must sit behind a Suspense boundary or `next build` fails the export.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[70vh]" />}>
      <LoginForm />
    </Suspense>
  );
}