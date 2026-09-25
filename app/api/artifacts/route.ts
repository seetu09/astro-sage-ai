import { NextResponse } from 'next/server';
import { loadArtifactCatalog } from '@/lib/serverArtifactCatalog';

export const runtime = 'nodejs';
// REQUIRED: without it Next 14 may statically render this route at build time,
// freezing the catalog and hiding admin edits until the next deploy.
export const dynamic = 'force-dynamic';
// Belt-and-braces on top of `force-dynamic`: in Next 14 `force-dynamic` alone
// is not a documented cache opt-out for GET route handlers, so `revalidate = 0`
// is set here too. It costs nothing and guarantees the catalog is re-read on
// every request. (The same reason is why stale catalog reads are never served
// from a module-level Supabase client — see lib/serverArtifactCatalog.ts.)
export const revalidate = 0;

/**
 * Public, read-only endpoint for the artifact catalog.
 *
 * This exists outside the `/api/admin/*` tree so that the public storefront
 * (app/store/page.tsx) can render product listings without authentication.
 * Inactive artifacts (isActive === false) are filtered out here; admin editors
 * see the full catalog via the authenticated /api/admin/artifacts endpoint.
 *
 * The catalog is read from Supabase via `loadArtifactCatalog`, which throws on
 * config/transport failure so this route can answer 500 with the real reason.
 */
export async function GET(request: Request) {
  // ── Diagnostics ─────────────────────────────────────────────────────────
  // ?debug=1 reports env-var HEALTH ONLY — booleans and lengths, never values.
  // Reports health for BOTH SUPABASE_URL (the server-preferred var, read at
  // runtime) and NEXT_PUBLIC_SUPABASE_URL (the build-inlined fallback), so a
  // healthy public var can't mask a malformed server var.
  // Safe to leave on permanently: no secret, no key fragment, and no query
  // leaves the process. Exists so a broken deploy is diagnosable from a URL.
  const debug = new URL(request.url).searchParams.get('debug') === '1';

  if (debug) {
    const pubUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const srvUrl = process.env.SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    return NextResponse.json({
      // The one the server actually uses:
      serverUrlPresent: srvUrl.length > 0,
      serverUrlStartsWithHttps: srvUrl.startsWith('https://'),
      serverUrlEndsWithSupabaseCo: srvUrl.endsWith('.supabase.co'),
      serverUrlLength: srvUrl.length,
      serverUrlHasQuotes: srvUrl.includes('"') || srvUrl.includes("'"),
      serverUrlHasWhitespace: /\s/.test(srvUrl),

      // The public fallback, for comparison:
      publicUrlPresent: pubUrl.length > 0,
      publicUrlStartsWithHttps: pubUrl.startsWith('https://'),
      publicUrlEndsWithSupabaseCo: pubUrl.endsWith('.supabase.co'),
      publicUrlLength: pubUrl.length,
      publicUrlHasQuotes: pubUrl.includes('"') || pubUrl.includes("'"),
      publicUrlHasWhitespace: /\s/.test(pubUrl),

      // Keys (unchanged):
      serviceKeyPresent: key.length > 0,
      serviceKeyLength: key.length,
      serviceKeyStartsWithEyJ: key.startsWith('eyJ'),
      anonKeyPresent: anon.length > 0,
      anonKeyStartsWithEyJ: anon.startsWith('eyJ'),
    });
  }

  try {
    const catalog = await loadArtifactCatalog();

    // Public storefront view: only active artifacts, sorted by priority desc.
    // Only expose the fields the storefront needs — do NOT leak internal
    // catalog metadata (e.g. _note, doshaAliases) to unauthenticated callers.
    const publicArtifacts = catalog.artifacts
      .filter((a) => a.isActive !== false)
      .sort((a, b) => b.priority - a.priority);

    return NextResponse.json({
      artifacts: publicArtifacts,
      version: catalog.version,
    });
  } catch (error) {
    // Surface the real cause. A generic message here is what made a broken
    // Supabase config look identical to an empty catalog for an hour.
    const message = error instanceof Error ? error.message : String(error);
    // eslint-disable-next-line no-console
    console.error('[GET /api/artifacts]', message);
    return NextResponse.json({ message: 'Catalog read failed', error: message }, { status: 500 });
  }
}

