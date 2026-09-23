import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Unit tests for `loadArtifactCatalog`'s row mapping and degraded behavior.
 *
 * `react` is mocked with a passthrough `cache` and `@/lib/serverWallet` with a
 * minimal fake of the supabase-js query builder, so
 * `.from(...).select(...).order(...)` resolves to a fixed row set and we can
 * assert the snake_case -> camelCase translation without a database.
 *
 * The fake lives inside `vi.hoisted` because `vi.mock` factories are hoisted
 * above the module body: a plain top-level `const` would not be initialized yet
 * when the factory runs.
 *
 * NOTE: `writeArtifactCatalog` is intentionally NOT covered here — it needs a
 * real database (or a far heavier mock of the delete/upsert builders), so it is
 * integration-tested manually through the admin editor.
 */

const SHIPPED_ROWS = [
  {
    id: 'example-neelam',
    name: { en: 'Blue Sapphire (Neelam)', hi: 'नीलम' },
    doshas: ['sade_sati', 'shani_dosh'],
    pitch: { en: 'Shani influence.', hi: 'शनि प्रभाव।' },
    benefits: { en: ['Focus'], hi: ['एकाग्रता'] },
    image_url: '/store/example-neelam.jpg',
    product_url: '/store/example-neelam',
    priority: 10,
    disclaimer: { en: 'Traditional remedy.', hi: 'पारंपरिक उपाय।' },
    category: 'Gemstones',
    price_inr: '1299.00', // PostgREST serializes numeric as a string
    currency: 'INR',
    is_active: false,
  },
];

type QueryResult = { data: unknown; error: { message: string } | null };

const h = vi.hoisted(() => {
  const state: { result: QueryResult | null } = { result: null };
  // The loader chains two `.order()` calls (priority desc, then id asc), so each
  // order() must return the same chainable object, and awaiting the chain must
  // resolve to `state.result`.
  const chain = {
    order: () => chain,
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => {
      if (state.result === null) return Promise.reject(new Error('boom')).then(resolve, reject);
      return Promise.resolve(state.result).then(resolve, reject);
    },
  };
  const fakeSupabase = {
    from: () => ({
      select: () => chain,
    }),
  };
  return { state, fakeSupabase };
});

// React ships `cache` only in the Next.js server runtime; in a plain Node test
// environment it is undefined, so stub it with a passthrough.
vi.mock('react', () => ({
  cache: (fn: unknown) => fn,
}));

vi.mock('@/lib/serverWallet', () => ({
  getServiceSupabase: () => h.fakeSupabase,
}));

import { loadArtifactCatalog } from '@/lib/serverArtifactCatalog';

describe('loadArtifactCatalog — snake_case to camelCase mapping', () => {
  beforeEach(() => {
    h.state.result = { data: SHIPPED_ROWS, error: null };
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('maps the column names onto the catalog shape', async () => {
    const catalog = await loadArtifactCatalog();
    expect(catalog.artifacts).toHaveLength(1);

    const artifact = catalog.artifacts[0];
    expect(artifact.id).toBe('example-neelam');
    expect(artifact.imageUrl).toBe('/store/example-neelam.jpg');
    expect(artifact.productUrl).toBe('/store/example-neelam');
    expect(artifact.isActive).toBe(false);
    expect(artifact.category).toBe('Gemstones');
    expect(artifact.currency).toBe('INR');
  });

  it('coerces price_inr to a NUMBER, not the string PostgREST returns', async () => {
    const catalog = await loadArtifactCatalog();
    const artifact = catalog.artifacts[0];
    expect(typeof artifact.priceInr).toBe('number');
    expect(artifact.priceInr).toBe(1299);
  });

  it('returns the stable catalog shape with an empty alias map', async () => {
    const catalog = await loadArtifactCatalog();
    expect(catalog.version).toBeUndefined();
    expect(catalog.doshaAliases).toEqual({});
  });

  it('returns an empty catalog (and does not throw) when the query returns an error', async () => {
    // Simulate PostgREST returning `{ data: null, error }` rather than throwing.
    h.state.result = { data: null, error: { message: 'relation "artifacts" does not exist' } };

    await expect(loadArtifactCatalog()).resolves.toEqual({
      artifacts: [],
      doshaAliases: {},
    });
    expect(console.error).toHaveBeenCalled();
    expect(
      String((console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0])
    ).toContain('LOAD_ARTIFACT_CATALOG_FAILED');
  });

  it('returns an empty catalog (and does not throw) when the client rejects', async () => {
    h.state.result = null;

    await expect(loadArtifactCatalog()).resolves.toEqual({
      artifacts: [],
      doshaAliases: {},
    });
    expect(console.error).toHaveBeenCalled();
    expect(
      String((console.error as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0])
    ).toContain('LOAD_ARTIFACT_CATALOG_ERR');
  });
});
