import { describe, it, expect } from 'vitest';
import { ArtifactCatalogSchema, ARTIFACT_CATEGORIES } from '@/lib/catalogSchema';

/**
 * Catalog shape validation.
 *
 * This suite used to read `data/artifacts.json` off disk; the catalog now lives
 * in the `public.artifacts` table, so the fixtures are defined IN CODE. Nothing
 * here touches the filesystem or Supabase — it is a pure schema contract test.
 */
function makeArtifact(overrides: Record<string, unknown> = {}) {
  return {
    id: 'example-neelam',
    name: { en: 'Blue Sapphire (Neelam)', hi: 'नीलम' },
    doshas: ['sade_sati', 'shani_dosh'],
    pitch: { en: 'Shani influence.', hi: 'शनि प्रभाव।' },
    benefits: { en: ['Focus'], hi: ['एकाग्रता'] },
    imageUrl: '/store/example-neelam.jpg',
    productUrl: '/store/example-neelam',
    priority: 10,
    disclaimer: { en: 'Traditional remedy.', hi: 'पारंपरिक उपाय।' },
    ...overrides,
  };
}

function makeCatalog(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    artifacts: [makeArtifact()],
    doshaAliases: { sade_sati: ['sade_sati', 'sadesati'] },
    ...overrides,
  };
}

describe('storeCatalog', () => {
  describe('schema validation', () => {
    it('accepts a minimal valid catalog fixture', () => {
      const result = ArtifactCatalogSchema.safeParse(makeCatalog());
      expect(result.success).toBe(true);
    });

    it('keeps every field the recommender and storefront rely on', () => {
      const result = ArtifactCatalogSchema.safeParse(makeCatalog());
      expect(result.success).toBe(true);
      if (!result.success) return;
      for (const art of result.data.artifacts) {
        expect(art.id).toBeTruthy();
        expect(typeof art.name.en).toBe('string');
        expect(typeof art.name.hi).toBe('string');
        expect(Array.isArray(art.doshas)).toBe(true);
        expect(typeof art.pitch.en).toBe('string');
        expect(Array.isArray(art.benefits.en)).toBe(true);
        expect(Array.isArray(art.benefits.hi)).toBe(true);
        expect(typeof art.imageUrl).toBe('string');
        expect(typeof art.productUrl).toBe('string');
        expect(typeof art.priority).toBe('number');
        expect(typeof art.disclaimer.en).toBe('string');
        expect(typeof art.disclaimer.hi).toBe('string');
      }
    });

    it('rejects a fixture missing `name`', () => {
      const { name: _omit, ...withoutName } = makeArtifact();
      const result = ArtifactCatalogSchema.safeParse(
        makeCatalog({ artifacts: [withoutName] })
      );
      expect(result.success).toBe(false);
    });

    it('rejects a negative priceInr', () => {
      const result = ArtifactCatalogSchema.safeParse(
        makeCatalog({ artifacts: [makeArtifact({ priceInr: -1 })] })
      );
      expect(result.success).toBe(false);
    });

    it('defaults a missing category to Other, priceInr to 0 and currency to INR', () => {
      const result = ArtifactCatalogSchema.safeParse(makeCatalog());
      expect(result.success).toBe(true);
      if (!result.success) return;
      const art = result.data.artifacts[0];
      expect(art.category).toBe('Other');
      expect(art.priceInr).toBe(0);
      expect(art.currency).toBe('INR');
    });

    it('accepts a category outside the suggested list (free text, not an enum)', () => {
      const result = ArtifactCatalogSchema.safeParse(
        makeCatalog({ artifacts: [makeArtifact({ category: 'Crystals' })] })
      );
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.artifacts[0].category).toBe('Crystals');
      // The suggestion list is intentionally NOT a whitelist.
      expect((ARTIFACT_CATEGORIES as readonly string[]).includes('Crystals')).toBe(false);
    });
  });
});
