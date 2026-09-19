import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ArtifactCatalogSchema } from '@/lib/catalogSchema';

export const runtime = 'nodejs';

const CATALOG_FILE = path.join(process.cwd(), 'data', 'artifacts.json');

/**
 * Public, read-only endpoint for the artifact catalog.
 *
 * This exists outside the `/api/admin/*` tree so that the public storefront
 * (app/store/page.tsx) can render product listings without authentication.
 * Inactive artifacts (isActive === false) are filtered out here; admin editors
 * see the full catalog via the authenticated /api/admin/artifacts endpoint.
 */
export async function GET() {
  try {
    const raw = await fs.readFile(CATALOG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const result = ArtifactCatalogSchema.safeParse(parsed);

    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error('[GET /api/artifacts] catalog validation failed:', result.error.message);
      return NextResponse.json({ message: 'Catalog validation failed' }, { status: 500 });
    }

    // Public storefront view: only active artifacts, sorted by priority desc.
    // Only expose the fields the storefront needs — do NOT leak internal
    // catalog metadata (e.g. _note, doshaAliases) to unauthenticated callers.
    const publicArtifacts = result.data.artifacts
      .filter((a) => a.isActive !== false)
      .sort((a, b) => b.priority - a.priority);

    return NextResponse.json({
      artifacts: publicArtifacts,
      version: result.data.version,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[GET /api/artifacts]', error);
    return NextResponse.json({ message: 'Failed to read catalog' }, { status: 500 });
  }
}

