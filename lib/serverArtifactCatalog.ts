import { cache } from 'react';
import { getServiceSupabase } from '@/lib/serverWallet';
import type { ArtifactCatalog, CatalogArtifact } from '@/lib/catalogSchema';
/**
 * Server-side artifact catalog storage (backed by `public.artifacts`).
 *
 * Requires the `003_artifact_catalog` migration to have been applied.
 *
 * Error policy — read failures are NOT silent:
 *   - zero rows            → a valid empty catalog (the only "empty" outcome)
 *   - Supabase error object → log it in full, then THROW
 *   - transport/config throw → log it, then THROW
 * Callers surface this as a 5xx with the real reason. An earlier version
 * swallowed every failure into an empty catalog, which made a misconfigured
 * Supabase indistinguishable from an empty storefront.
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
  dosha_aliases: unknown;
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
 *
 * `dosha_aliases` is deliberately NOT mapped here. The column is catalog-level
 * metadata (see `mergeDoshaAliases` and migration 007), and `app/api/artifacts`
 * returns `catalog.artifacts` verbatim to UNAUTHENTICATED callers — mapping it
 * onto the row shape would publish the whole alias map to the storefront. This
 * mapper is the single place that decides what leaves the database, so keeping
 * the column out of it is what makes that endpoint safe by construction rather
 * than by accident.
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

/**
 * Collapse every row's `dosha_aliases` into the single catalog-level map that
 * `ArtifactCatalogSchema.doshaAliases` and the recommender expect.
 *
 * The map is stored per artifact row (migration 007) because the admin editor
 * does a full delete-then-upsert replace, so there is no singleton row to keep
 * it on. Reading it back therefore means merging. Every row holds the same map
 * after an admin save, and the merge is a lookup by canonical key — unioning is
 * idempotent, so duplicates collapse and a row with no aliases contributes
 * nothing.
 *
 * Defensive on purpose: `dosha_aliases` is free-form jsonb, so a hand-edited row
 * can hold anything at all. A value that is not a `{ string: string[] }` map is
 * skipped rather than allowed to break the read — a missing alias list means
 * "no aliases", which is exactly how the recommender behaved before this column
 * existed. Keys and aliases are normalized (trim + lowercase) to match
 * `normalizeDosha` in the recommender, so `' Mangal '` and `'mangal'` cannot
 * end up as two different entries.
 */
function mergeDoshaAliases(rows: ArtifactRow[]): Record<string, string[]> {
  const merged: Record<string, string[]> = {};
  for (const row of rows) {
    const map = row?.dosha_aliases;
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
    for (const [rawKey, rawAliases] of Object.entries(map as Record<string, unknown>)) {
      if (typeof rawKey !== 'string' || !Array.isArray(rawAliases)) continue;
      const key = rawKey.trim().toLowerCase();
      if (!key) continue;
      const list = merged[key] ?? (merged[key] = []);
      for (const alias of rawAliases) {
        if (typeof alias !== 'string') continue;
        const normalized = alias.trim().toLowerCase();
        if (normalized && !list.includes(normalized)) list.push(normalized);
      }
    }
  }
  return merged;
}

/** Map a validated artifact back to its column names for a write. */
function mapArtifactToRow(artifact: CatalogArtifact, doshaAliases: Record<string, string[]>) {
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
    // Catalog-level alias map broadcast onto EVERY row (migration 007). The
    // write path is a full replace, so a map that only some rows carried would
    // be silently lost; broadcasting keeps admin-save -> load a lossless
    // round-trip without a second table or a singleton row.
    dosha_aliases: doshaAliases,
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
 * Throws when the read fails (bad config, transport error, or a PostgREST
 * error object). Only a successful query returning zero rows produces an empty
 * catalog — see the error policy in this module's header.
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
      // PostgREST answered, but with a failure (missing table, bad key, RLS
      // denial, ...). That is a CONFIG/SCHEMA problem, not an empty catalog —
      // rethrow so the caller can answer 500 instead of a silent 200 with [].
      console.error('LOAD_ARTIFACT_CATALOG_FAILED', {
        message: error.message,
        code: (error as { code?: string }).code,
        details: (error as { details?: string }).details,
        hint: (error as { hint?: string }).hint,
      });
      throw error;
    }

    // Zero rows is a legitimate state (fresh project, everything deactivated),
    // NOT an error. This is the only path that yields an empty catalog.
    const rows = (data ?? []) as ArtifactRow[];
    return {
      version: undefined,
      artifacts: rows.map(mapRow),
      // Union of every row's `dosha_aliases` (migration 007). This is what
      // re-enables the recommender's alias expansion — the map used to come
      // from data/artifacts.json, which was deleted when the catalog moved to
      // Postgres. Until the admin sets aliases it stays `{}`, and matching
      // falls back to the canonical keys exactly as it does today.
      doshaAliases: mergeDoshaAliases(rows),
    };
  } catch (err) {
    // Covers two cases, both fatal and both reported rather than swallowed:
    //   1. getServiceSupabase() threw — Supabase env config is missing/invalid.
    //   2. the transport threw (DNS, TLS, timeout, malformed URL) or the error
    //      rethrown just above bubbled through.
    // Swallowing these made "config is broken" indistinguishable from "no
    // active rows", which is exactly the bug this change fixes.
    console.error('LOAD_ARTIFACT_CATALOG_ERR', err);
    throw err;
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
 *
 * The catalog-level `doshaAliases` map is stored per row (migration 007), so
 * it is broadcast onto every upserted row here. The editor round-trips the
 * whole catalog JSON, which means aliases the admin typed come straight back
 * out of `loadArtifactCatalog` on the next read.
 */
export async function writeArtifactCatalog(catalog: ArtifactCatalog): Promise<void> {
  const supabase = getServiceSupabase();

  const artifacts = Array.isArray(catalog.artifacts) ? catalog.artifacts : [];
  const keepIds = artifacts.map((artifact) => artifact.id);
  // Guarded like the artifacts array: a malformed payload must not write a
  // non-map into a `jsonb not null` column. An absent map writes `{}`, which
  // is the column default and keeps the recommender on canonical keys.
  const rawAliases = catalog.doshaAliases;
  const doshaAliases =
    rawAliases && typeof rawAliases === 'object' && !Array.isArray(rawAliases)
      ? (rawAliases as Record<string, string[]>)
      : {};

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
    .upsert(artifacts.map((artifact) => mapArtifactToRow(artifact, doshaAliases)), { onConflict: 'id' });
  if (upsertError) {
    console.error('WRITE_ARTIFACT_CATALOG_UPSERT_FAILED', upsertError.message);
    throw new Error(upsertError.message);
  }
}

/** An empty but well-formed catalog, used for every degraded path. */
function emptyCatalog(): ArtifactCatalog {
  return { version: undefined, artifacts: [], doshaAliases: {} };
}

/**
 * Single-row catalog read for checkout (create-order, Task 1.3).
 *
 * Deliberately NOT wrapped in the per-request `loadArtifactCatalog` cache:
 * order creation must see the current price, and caching it for the length of
 * a request is the one place a stale price actually costs money. Returns null
 * for an unknown id; THROWS on read/config failure so the route can answer 5xx
 * instead of treating a database outage as "item does not exist" (which would
 * tell buyers the wrong thing about a paid attempt).
 */
export async function getArtifactForCheckout(id: string): Promise<CatalogArtifact | null> {
  const artifactId = (id ?? '').trim();
  if (!artifactId) return null;
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('id', artifactId)
      .maybeSingle();
    if (error) {
      console.error('GET_ARTIFACT_FOR_CHECKOUT_FAILED', {
        message: error.message,
        code: (error as { code?: string }).code,
      });
      throw error;
    }
    return data ? mapRow(data as ArtifactRow) : null;
  } catch (err) {
    console.error('GET_ARTIFACT_FOR_CHECKOUT_ERR', err);
    throw err;
  }
}


