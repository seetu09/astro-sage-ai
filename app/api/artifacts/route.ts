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
 * The catalog is read from Supabase via `loadArtifactCatalog`, which already
 * returns validated, typed data and never throws — hence no safeParse here.
 */
export async function GET() {
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
    // eslint-disable-next-line no-console
    console.error('[GET /api/artifacts]', error);
    return NextResponse.json({ message: 'Failed to read catalog' }, { status: 500 });
  }
}

