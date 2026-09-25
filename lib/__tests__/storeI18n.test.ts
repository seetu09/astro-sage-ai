import { describe, it, expect } from 'vitest';
import { getTranslation, translations } from '@/lib/i18n/translations';

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
});
