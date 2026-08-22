/**
 * AstrologyDictionary — Centralized Universal Localization Engine
 * ---------------------------------------------------------------
 * Single source of truth for all astrology terminology across the app.
 * Supports 'en' (English) and 'hi' (Hindi), extensible to more locales.
 *
 * Usage:
 *   import { localizePlanet, localizeSign, getUILabel } from '@/lib/astrologyDictionary';
 */

export type LocaleCode = 'en' | 'hi';

// ---------------------------------------------------------------------------
// PLANETS — full names + chart abbreviations (Su/सू, Mo/चं, Ma/मं ...)
// ---------------------------------------------------------------------------
export const PLANET_NAMES: Record<LocaleCode, Record<string, string>> = {
  en: {
    Sun: 'Sun',
    Moon: 'Moon',
    Mars: 'Mars',
    Mercury: 'Mercury',
    Jupiter: 'Jupiter',
    Venus: 'Venus',
    Saturn: 'Saturn',
    Rahu: 'Rahu',
    Ketu: 'Ketu',
  },
  hi: {
    Sun: 'सूर्य',
    Moon: 'चंद्र',
    Mars: 'मंगल',
    Mercury: 'बुध',
    Jupiter: 'गुरु',
    Venus: 'शुक्र',
    Saturn: 'शनि',
    Rahu: 'राहु',
    Ketu: 'केतु',
  },
};

export const PLANET_ABBREVIATIONS: Record<LocaleCode, Record<string, string>> = {
  en: {
    Sun: 'Su',
    Moon: 'Mo',
    Mars: 'Ma',
    Mercury: 'Me',
    Jupiter: 'Ju',
    Venus: 'Ve',
    Saturn: 'Sa',
    Rahu: 'Ra',
    Ketu: 'Ke',
  },
  hi: {
    Sun: 'सू',
    Moon: 'चं',
    Mars: 'मं',
    Mercury: 'बु',
    Jupiter: 'गु',
    Venus: 'शु',
    Saturn: 'श',
    Rahu: 'रा',
    Ketu: 'के',
  },
};

// ---------------------------------------------------------------------------
// ZODIAC SIGNS — Aries/मेष → Pisces/मीन
// ---------------------------------------------------------------------------
export const ZODIAC_SIGNS: Record<LocaleCode, Record<string, string>> = {
  en: {
    Aries: 'Aries',
    Taurus: 'Taurus',
    Gemini: 'Gemini',
    Cancer: 'Cancer',
    Leo: 'Leo',
    Virgo: 'Virgo',
    Libra: 'Libra',
    Scorpio: 'Scorpio',
    Sagittarius: 'Sagittarius',
    Capricorn: 'Capricorn',
    Aquarius: 'Aquarius',
    Pisces: 'Pisces',
  },
  hi: {
    Aries: 'मेष',
    Taurus: 'वृषभ',
    Gemini: 'मिथुन',
    Cancer: 'कर्क',
    Leo: 'सिंह',
    Virgo: 'कन्या',
    Libra: 'तुला',
    Scorpio: 'वृश्चिक',
    Sagittarius: 'धनु',
    Capricorn: 'मकर',
    Aquarius: 'कुंभ',
    Pisces: 'मीन',
  },
};

// ---------------------------------------------------------------------------
// PANCHANG / AVAKHADA KEYS
// ---------------------------------------------------------------------------
export const PANCHANG_KEYS: Record<LocaleCode, Record<string, string>> = {
  en: {
    Tithi: 'Tithi',
    Karan: 'Karan',
    Yog: 'Yog',
    Nakshatra: 'Nakshatra',
    Varna: 'Varna',
    Yoni: 'Yoni',
    Nadi: 'Nadi',
    Gana: 'Gana',
  },
  hi: {
    Tithi: 'तिथि',
    Karan: 'करण',
    Yog: 'योग',
    Nakshatra: 'नक्षत्र',
    Varna: 'वर्ण',
    Yoni: 'योनि',
    Nadi: 'नाड़ी',
    Gana: 'गण',
  },
};

// ---------------------------------------------------------------------------
// UI LABELS — report chrome & action bar
// ---------------------------------------------------------------------------
export type UIKey =
  | 'birthDetails'
  | 'kundliReport'
  | 'dosha'
  | 'remedies'
  | 'mahadasha'
  | 'downloadPdf'
  | 'unlockFullReport'
  | 'previewLabel'
  | 'lockedFeaturePlanets'
  | 'lockedFeatureDosha'
  | 'lockedFeatureRemedies'
  | 'lockedFeatureMahadasha'
  | 'unlockHint'
  | 'languageLabel'
  | 'unlockSuccess';

export const UI_LABELS: Record<LocaleCode, Record<UIKey, string>> = {
  en: {
    birthDetails: 'Birth Details',
    kundliReport: 'Kundli Report',
    dosha: 'Dosha',
    remedies: 'Remedies',
    mahadasha: 'Mahadasha',
    downloadPdf: 'Download Kundli (PDF)',
    unlockFullReport: 'Unlock Full Report',
    previewLabel: 'Preview',
    lockedFeaturePlanets: 'Complete planetary positions table',
    lockedFeatureDosha: 'Detailed Dosha analysis',
    lockedFeatureRemedies: 'Personalized Remedies',
    lockedFeatureMahadasha: 'Full Mahadasha timeline',
    unlockHint: 'One-time payment • Instant access • Lifetime report',
    languageLabel: 'Language',
    unlockSuccess: 'Payment successful! Your full report is unlocked.',
  },
  hi: {
    birthDetails: 'जन्म विवरण',
    kundliReport: 'कुंडली रिपोर्ट',
    dosha: 'दोष',
    remedies: 'उपाय',
    mahadasha: 'महादशा',
    downloadPdf: 'कुंडली डाउनलोड करें (PDF)',
    unlockFullReport: 'पूरी रिपोर्ट अनलॉक करें',
    previewLabel: 'पूर्वावलोकन',
    lockedFeaturePlanets: 'संपूर्ण ग्रह स्थिति तालिका',
    lockedFeatureDosha: 'विस्तृत दोष विश्लेषण',
    lockedFeatureRemedies: 'वैयक्तिकृत उपाय',
    lockedFeatureMahadasha: 'पूरी महादशा टाइमलाइन',
    unlockHint: 'एक बार भुगतान • तुरंत एक्सेस • आजीवन रिपोर्ट',
    languageLabel: 'भाषा',
    unlockSuccess: 'भुगतान सफल! आपकी पूरी रिपोर्ट अनलॉक हो गई है।',
  },
};

// ---------------------------------------------------------------------------
// LANGUAGE DISPLAY NAMES (for dropdowns)
// ---------------------------------------------------------------------------
export const LANGUAGE_DISPLAY_NAMES: Record<LocaleCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

// ---------------------------------------------------------------------------
// HELPERS — graceful fallbacks so missing keys never crash the UI
// ---------------------------------------------------------------------------

/** Localize a planet's full name (e.g., 'Sun' → 'सूर्य'). Falls back to input. */
export function localizePlanet(planet: string, locale: LocaleCode): string {
  return PLANET_NAMES[locale]?.[planet] ?? planet;
}

/** Localize a planet's chart abbreviation (e.g., 'Sun' → 'सू'). Falls back to English abbr or input. */
export function localizePlanetAbbr(planet: string, locale: LocaleCode): string {
  return (
    PLANET_ABBREVIATIONS[locale]?.[planet] ??
    PLANET_ABBREVIATIONS.en[planet] ??
    planet.slice(0, 2)
  );
}

/** Localize a zodiac sign (e.g., 'Aries' → 'मेष'). Falls back to input. */
export function localizeSign(sign: string, locale: LocaleCode): string {
  return ZODIAC_SIGNS[locale]?.[sign] ?? sign;
}

/** Localize a Panchang/Avakhada key (e.g., 'Nakshatra' → 'नक्षत्र'). Falls back to input. */
export function localizePanchangKey(key: string, locale: LocaleCode): string {
  return PANCHANG_KEYS[locale]?.[key] ?? key;
}

/** Get a localized UI label by key. Falls back to English, then the key itself. */
export function getUILabel(key: UIKey, locale: LocaleCode): string {
  return UI_LABELS[locale]?.[key] ?? UI_LABELS.en[key] ?? key;
}

/** All supported locales, in display order. */
export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'hi'];

/** Type-guard for safe locale parsing from storage/URL. */
export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value);
}