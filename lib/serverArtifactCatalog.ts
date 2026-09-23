import { cache } from 'react';
import { getServiceSupabase } from '@/lib/serverWallet';
import type { ArtifactCatalog, CatalogArtifact } from '@/lib/catalogSchema';
/**
 * Server-side artifact catalog storage (backed by `public.artifacts`).
 *
 * Requires the `003_artifact_catalog` migration to have been applied. Reads
 * degrade gracefully — `loadArtifactCatalog` returns an empty catalog rather
 * than throwing, so a not-yet-migrated project keeps rendering (just with no
 * suggestions) instead of 500-ing the storefront and the paid report.
 *
 * The catalog used to live at `data/artifacts.json` and be read off disk. That
 * broke the admin editor on Vercel, whose filesystem is read-only; this module
 * is the replacement read/write path.
 *
 * Writes go through the service role (bypasses RLS). No Postgres function is
 * needed at this scale: a delete-then-upsert pair is enough.
 */

/** Shapes returned flat from PostgREST; mapped explicitly to camelCase below. */
type ArtifactRow = {
  id: unknown;
  name: unknown;
  doshas: unknown;
  pitch: unknown;
  benefits: unknown;
  image_url: unknown;
  product_url: unknown;
  priority: unknown;
  disclaimer: unknown;
  category: unknown;
  price_inr: unknown;
  currency: unknown;
  is_active: unknown;
};

/**
 * `react.cache` collapses the per-request double read into one query, but it
 * only exists in the Next.js server runtime — in a bare Node environment (unit
 * tests, scripts) it is undefined. Falling back to the raw function keeps the
 * module importable everywhere while still de-duplicating in production.
 */
const perRequestCache: typeof cache = typeof cache === 'function' ? cache : ((fn) => fn);

/**
 * Map one DB row to the catalog shape the rest of the app speaks.
 *
 * Explicit and defensive on purpose: `price_inr` is `numeric(12,2)` and
 * PostgREST serializes numerics as STRINGS, so a bare spread would hand the UI
 * `"1299.00"` where it expects a number.
 */
function mapRow(row: ArtifactRow): CatalogArtifact {
  return {
    id: String(row.id ?? ''),
    name: row.name as CatalogArtifact['name'],
    doshas: Array.isArray(row.doshas) ? (row.doshas as string[]) : [],
    pitch: row.pitch as CatalogArtifact['pitch'],
    benefits: row.benefits as CatalogArtifact['benefits'],
    imageUrl: String(row.image_url ?? ''),
    productUrl: String(row.product_url ?? ''),
    priority: Number(row.priority ?? 0),
    disclaimer: row.disclaimer as CatalogArtifact['disclaimer'],
    category: String(row.category ?? 'Other'),
    priceInr: Number(row.price_inr ?? 0),
    currency: String(row.currency ?? 'INR'),
    isActive: Boolean(row.is_active),
  };
}

/** Map a validated artifact back to its column names for a write. */
function mapArtifactToRow(artifact: CatalogArtifact) {
  return {
    id: artifact.id,
    name: artifact.name,
    doshas: artifact.doshas,
    pitch: artifact.pitch,
    benefits: artifact.benefits,
    image_url: artifact.imageUrl,
    product_url: artifact.productUrl,
    priority: artifact.priority,
    disclaimer: artifact.disclaimer,
    category: artifact.category,
    price_inr: artifact.priceInr,
    currency: artifact.currency,
    // Absent means active — same convention the public endpoint applies.
    is_active: artifact.isActive !== false,
    // No DB trigger for updated_at (001/002 have none either); the writer sets
    // it explicitly so "last edited" is always truthful.
    updated_at: new Date().toISOString(),
  };
}

/**
 * The full catalog, read through the service role.
 *
 * Wrapped in React's `cache` so the two reads per request that
 * `app/store/[id]/page.tsx` performs (generateMetadata + the recommended
 * section) collapse into ONE database query. This is deliberately NOT a
 * module-level singleton: a singleton would survive across requests and serve
 * a stale catalog after an admin edits it, which is the exact bug this
 * migration exists to fix.
 *
 * Never throws — a failed read returns an empty catalog so the caller renders
 * zero recommendations rather than an error page.
 */
export const loadArtifactCatalog = perRequestCache(async (): Promise<ArtifactCatalog> => {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .order('priority', { ascending: false })
      .order('id', { ascending: true });

    if (error) {
      console.error('LOAD_ARTIFACT_CATALOG_FAILED', error.message);
      return emptyCatalog();
    }

    return {
      version: undefined,
      artifacts: ((data ?? []) as ArtifactRow[]).map(mapRow),
      // The recommender's alias expansion is still useful, but the alias map is
      // not currently stored in the DB. Returning {} keeps the catalog shape
      // stable for every consumer. (Alias storage is a follow-up.)
      doshaAliases: {},
    };
  } catch (err) {
    console.error('LOAD_ARTIFACT_CATALOG_ERR', err);
    return emptyCatalog();
  }
});


/**
 * Replace the stored catalog with `catalog` (admin only — the caller enforces
 * auth via hasValidSession + x-admin-password).
 *
 * Full replace, not a per-row diff: the catalog is a handful of rows, and
 * "delete whatever is no longer present, then upsert what is" gives the admin
 * editor exactly the JSON-in/JSON-out semantics it already had. Unlike the read
 * path this THROWS on failure, so the route can answer 500 instead of
 * pretending the save worked.
 */
export async function writeArtifactCatalog(catalog: ArtifactCatalog): Promise<void> {
  const supabase = getServiceSupabase();

  const artifacts = Array.isArray(catalog.artifacts) ? catalog.artifacts : [];
  const keepIds = artifacts.map((artifact) => artifact.id);

  // 1) Drop rows the incoming catalog no longer contains. The `in` list is
  //    built by hand so ids containing PostgREST metacharacters can't break the
  //    filter literal.
  if (keepIds.length > 0) {
    const inList = `(${keepIds.map((id) => `"${id.replace(/"/g, '\\"')}"`).join(',')})`;
    const { error: deleteError } = await supabase.from('artifacts').delete().not('id', 'in', inList);
    if (deleteError) {
      console.error('WRITE_ARTIFACT_CATALOG_DELETE_FAILED', deleteError.message);
      throw new Error(deleteError.message);
    }
  } else {
    // An empty catalog means "no artifacts at all" — clear the table.
    const { error: clearError } = await supabase.from('artifacts').delete().neq('id', '');
    if (clearError) {
      console.error('WRITE_ARTIFACT_CATALOG_CLEAR_FAILED', clearError.message);
      throw new Error(clearError.message);
    }
  }

  if (artifacts.length === 0) return;

  // 2) Upsert the incoming rows, stamping updated_at on each.
  const { error: upsertError } = await supabase
    .from('artifacts')
    .upsert(artifacts.map(mapArtifactToRow), { onConflict: 'id' });
  if (upsertError) {
    console.error('WRITE_ARTIFACT_CATALOG_UPSERT_FAILED', upsertError.message);
    throw new Error(upsertError.message);
  }
}

/** An empty but well-formed catalog, used for every degraded path. */
function emptyCatalog(): ArtifactCatalog {
  return { version: undefined, artifacts: [], doshaAliases: {} };
}
