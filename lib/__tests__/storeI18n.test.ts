import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getTranslation, translations } from '@/lib/i18n/translations';
// The path Server Components use — must stay a real, callable function.
import { getTranslation as barrelGetTranslation } from '@/lib/i18n';

/**
 * Store-page i18n contract.
 *
 * The storefront used to carry its own inline `_t('en', 'hi')` tuples, which
 * meant a missing/typo'd key rendered as literal chrome text and the Hindi
 * branches were unreachable (getLangForSSR() was hardcoded to 'en'). Both pages
 * now go through `t('store.*')`, whose runtime lookup silently returns the KEY
 * on a miss — so coverage has to be pinned here instead of by the type system.
 */

/** Every key the store pages (app/store/page.tsx, app/store/[id]/page.tsx) use. */
const STORE_KEYS = [
  'store.loading',
  'store.heading',
  'store.description',
  'store.comingSoon',
  'store.emptyCatalog',
  'store.viewDetails',
  'store.recommended',
  'store.backToStore',
  'store.notFound',
  'store.detail.priority',
  'store.detail.benefits',
  'store.detail.addToCartSoon',
] as const;

/** The four strings that were ROMANIZED ("prathaminat", "labh", ...) before. */
const PREVIOUSLY_ROMANIZED = [
  'store.detail.priority',
  'store.detail.benefits',
  'store.recommended',
  'store.backToStore',
] as const;

/** True when the string contains at least one Devanagari code point. */
function hasDevanagari(value: string): boolean {
  return /[\u0900-\u097F]/.test(value);
}

describe('storeI18n', () => {
  describe('key coverage', () => {
    it.each(STORE_KEYS)('%s resolves in BOTH en and hi', (key) => {
      const en = getTranslation('en', key);
      const hi = getTranslation('hi', key);

      expect(en, `${key} (en)`).toBeTypeOf('string');
      expect(hi, `${key} (hi)`).toBeTypeOf('string');
      expect(en.length, `${key} (en) is non-empty`).toBeGreaterThan(0);
      expect(hi.length, `${key} (hi) is non-empty`).toBeGreaterThan(0);
    });

    it('never leaks the raw key into either language (catches typos)', () => {
      for (const key of STORE_KEYS) {
        expect(getTranslation('en', key), `${key} (en)`).not.toBe(key);
        expect(getTranslation('hi', key), `${key} (hi)`).not.toBe(key);
      }
    });

    it('keeps the new keys inside the `store` namespace only', () => {
      // The pre-existing, currently-unused values must survive untouched.
      expect(translations.en.store.title).toBe('AstroVeda Store');
      expect(translations.en.store.subtitle).toBe(
        'Spiritual products curated for your cosmic journey'
      );
      expect(translations.en.store.addToCart).toBe('Add to Cart');
      expect(translations.hi.store.title).toBe('AstroVeda स्टोर');
      expect(translations.hi.store.addToCart).toBe('कार्ट में जोड़ें');
    });
  });

  describe('Devanagari enforcement', () => {
    it.each(PREVIOUSLY_ROMANIZED)('%s is Devanagari, not romanized Hindi', (key) => {
      const hi = getTranslation('hi', key);
      expect(hasDevanagari(hi), `"${hi}" should contain U+0900–U+097F`).toBe(true);
    });

    it('renders every store key in Hindi with Devanagari script', () => {
      for (const key of STORE_KEYS) {
        const hi = getTranslation('hi', key);
        expect(hasDevanagari(hi), `${key} (hi) = "${hi}"`).toBe(true);
      }
    });

    it('keeps the exact corrected Hindi strings for the four fixed values', () => {
      expect(getTranslation('hi', 'store.detail.priority')).toBe('प्राथमिकता');
      expect(getTranslation('hi', 'store.detail.benefits')).toBe('लाभ');
      expect(getTranslation('hi', 'store.recommended')).toBe('आपके लिए अनुशंसित');
      expect(getTranslation('hi', 'store.backToStore')).toBe('स्टोर पर वापस जाएं');
    });

    it('uses the U+2014 em-dash in store.emptyCatalog (both languages)', () => {
      expect(getTranslation('en', 'store.emptyCatalog')).toContain('\u2014');
      expect(getTranslation('hi', 'store.emptyCatalog')).toContain('\u2014');
    });
  });

  describe('silent fallback behaviour', () => {
    it('returns the key itself for an unknown key (documents: do NOT rely on throwing)', () => {
      // Built at runtime on purpose: `npm run check:i18n` scans source for
      // literal `getTranslation('en', '...')` call sites and would flag this
      // deliberately-missing key as a typo.
      const missingKey = ['store', 'nonexistent'].join('.');
      expect(getTranslation('en', missingKey)).toBe('store.nonexistent');
      expect(getTranslation('hi', missingKey)).toBe('store.nonexistent');
    });

    it('resolves dotted paths and drops the trailing arrow from viewDetails', () => {
      expect(getTranslation('en', 'store.detail.priority')).toBe('Priority');
      expect(getTranslation('en', 'store.viewDetails')).toBe('View details');
      expect(getTranslation('en', 'store.viewDetails')).not.toContain('→');
      expect(getTranslation('hi', 'store.viewDetails')).not.toContain('→');
    });
  });

  describe('Server Component import safety (regression: 129428a broke /store/[id])', () => {
    /**
     * `lib/i18n/translations.ts` once began with `"use client"`. The store
     * LISTING page is a Client Component and kept working, but the detail page
     * is a Server Component — for it, Next.js replaced the named
     * `getTranslation` export with a client-reference proxy, so the call
     * compiled to `(0, f.i)(...)` and threw at request time:
     *
     *   TypeError: (0 , f.i) is not a function
     *     at i (.next/server/app/store/[id]/page.js:11:4109)
     *
     * producing a 500 + error boundary (digest 4019489461). Unit tests could
     * not see it: importing the module directly in Node always yields the real
     * function, so only a source-level assertion catches a reintroduced
     * directive. Server-rendered pages depend on this staying true.
     */
    it('translations.ts carries NO "use client" directive', () => {
      const source = readFileSync(
        path.join(process.cwd(), 'lib/i18n/translations.ts'),
        'utf8'
      );
      // A directive must be a bare top-of-file statement, not a mention in a
      // comment — match only the line-initial form.
      expect(source).not.toMatch(/^\s*['"]use client['"]\s*;?/m);
    });

    it('the barrel re-exports getTranslation as a callable function', () => {
      // Server Components import from '@/lib/i18n'; that path must resolve to
      // the real implementation, not a client-reference stub.
      expect(typeof barrelGetTranslation).toBe('function');
      expect(barrelGetTranslation('en', 'store.heading')).toBe('Cosmic Remedies Store');
      expect(barrelGetTranslation('hi', 'store.heading')).toBe('कॉज़मिक रिमीडीज़ स्टोर');
    });
  });
});
