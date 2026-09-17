import fs from 'fs/promises';
import path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';
import { ArtifactCatalogSchema } from '@/lib/catalogSchema';

const CATALOG_FILE = path.join(process.cwd(), 'data', 'artifacts.json');

describe('storeCatalog', () => {
  let catalog: any;

  beforeAll(async () => {
    const raw = await fs.readFile(CATALOG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const result = ArtifactCatalogSchema.safeParse(parsed);
    expect(result.success, 'Catalog must be valid according to the shared schema').toBe(true);
    catalog = result.data;
  });

  describe('schema validation', () => {
    it('every artifact satisfies the per-artifact schema', () => {
      for (const art of catalog.artifacts) {
        expect(art.id).toBeTruthy();
        expect(art.name).toBeTruthy();
        expect(typeof art.name.en).toBe('string');
        expect(typeof art.name.hi).toBe('string');
        expect(Array.isArray(art.doshas)).toBe(true);
        expect(art.doshas.every((d: string) => typeof d === 'string')).toBe(true);
        expect(art.pitch).toBeTruthy();
        expect(typeof art.pitch.en).toBe('string');
        expect(typeof art.pitch.hi).toBe('string');
        expect(Array.isArray(art.benefits.en)).toBe(true);
        expect(Array.isArray(art.benefits.hi)).toBe(true);
        expect(typeof art.imageUrl).toBe('string');
        expect(typeof art.productUrl).toBe('string');
        expect(typeof art.priority).toBe('number');
        expect(art.disclaimer).toBeTruthy();
        expect(typeof art.disclaimer.en).toBe('string');
        expect(typeof art.disclaimer.hi).toBe('string');
      }
    });
  });

  describe('productUrl consistency', () => {
    it('every productUrl starts with /store/ and the trailing segment equals the artifact id', () => {
      for (const art of catalog.artifacts) {
        const url = art.productUrl;
        expect(url.startsWith('/store/'), 'Artifact ' + art.id + ': productUrl ' + url + ' must start with /store/').toBe(true);
        const trailing = url.replace(/^\/store\//, '');
        expect(trailing).toBe(art.id);
      }
    });
  });

  describe('dosha / doshaAlias consistency', () => {
    it('every doshas entry appears in doshaAliases as either a key or an alias value', () => {
      const aliases = catalog.doshaAliases ?? {};
      const known = new Set<string>();

      for (const [key, aliasList] of Object.entries(aliases)) {
        known.add(key);
        if (Array.isArray(aliasList)) {
          for (const alias of aliasList) {
            known.add(alias);
          }
        }
      }

      for (const art of catalog.artifacts) {
        for (const dosha of art.doshas) {
          expect(known.has(dosha), 'Artifact ' + art.id + ': dosha ' + dosha + ' not in doshaAliases').toBe(true);
        }
      }
    });
  });
});
