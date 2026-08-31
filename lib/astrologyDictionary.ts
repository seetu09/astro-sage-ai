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

/**
 * Sanskrit planetary nomenclature → canonical Western key.
 * Lets callers pass either 'Surya' or 'Sun' and get the same localized output.
 */
export const PLANET_SANJNA_MAP: Record<string, string> = {
  Surya: 'Sun', सूर्य: 'Sun',
  Chandra: 'Moon', चंद्र: 'Moon', चन्द्र: 'Moon', सोम: 'Moon',
  Mangal: 'Mars', मंगल: 'Mars', मंग: 'Mars', कुज: 'Mars',
  Budha: 'Mercury', बुध: 'Mercury', सोम्य: 'Mercury',
  Guru: 'Jupiter', गुरु: 'Jupiter', बृहस्पति: 'Jupiter',
  Shukra: 'Venus', शुक्र: 'Venus',
  Shani: 'Saturn', शनि: 'Saturn',
  Rahu: 'Rahu', राहु: 'Rahu',
  Ketu: 'Ketu', केतु: 'Ketu',
};

/** Canonicalize a planet identifier to its Western key (or pass through). */
export function canonicalPlanet(planet: string): string {
  return PLANET_SANJNA_MAP[planet] ?? planet;
}

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
// RASHIS — Vedic (Sanskrit) sign names: Mesha/मेष → Meena/मीन
// ---------------------------------------------------------------------------
// RASHI_NAMES is the standard Jyotish operand list used when describing a
// birth chart in Sanskrit-derived terminology (as opposed to the Western
// ZODIAC_SIGNS above). Index 0 = Mesha … 11 = Meena.
export const RASHI_NAMES: Record<LocaleCode, string[]> = {
  en: [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
    'Simha', 'Kanya', 'Tula', 'Vrishchika',
    'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ],
  hi: [
    'मेष', 'वृषभ', 'मिथुन', 'कर्क',
    'सिंह', 'कन्या', 'तुला', 'वृश्चिक',
    'धनु', 'मकर', 'कुंभ', 'मीन',
  ],
};

// A map from both Sanskrit and Western sign spellings to their index (1-12).
// This lets callers resolve "Mesha", "Aries", "Karka", "Cancer" etc.
const RASHI_INDEX_BY_NAME: Record<string, number> = {
  Mesha: 1, Aries: 1, मेष: 1,
  Vrishabha: 2, Taurus: 2, वृषभ: 2, वृष: 2,
  Mithuna: 3, Gemini: 3, मिथुन: 3,
  Karka: 4, Cancer: 4, कर्क: 4,
  Simha: 5, Leo: 5, सिंह: 5,
  Kanya: 6, Virgo: 6, कन्या: 6,
  Tula: 7, Libra: 7, तुला: 7,
  Vrishchika: 8, Scorpio: 8, वृश्चिक: 8,
  Dhanu: 9, Sagittarius: 9, धनु: 9,
  Makara: 10, Capricorn: 10, मकर: 10,
  Kumbha: 11, Aquarius: 11, कुंभ: 11,
  Meena: 12, Pisces: 12, मीन: 12,
};

/** Localized chart-specific glyph for each sign (U+2648 ZODIAC symbols). */
export const RASHI_GLYPHS: string[] = [
  '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓',
];

// ---------------------------------------------------------------------------
// HOUSES — 1st … 12th, both Sanskrit (Bhava) and English ordinal names
// ---------------------------------------------------------------------------
export const HOUSE_NAMES: Record<LocaleCode, Record<number, string>> = {
  en: {
    1: '1st House', 2: '2nd House', 3: '3rd House', 4: '4th House',
    5: '5th House', 6: '6th House', 7: '7th House', 8: '8th House',
    9: '9th House', 10: '10th House', 11: '11th House', 12: '12th House',
  },
  hi: {
    1: 'प्रथम भाव', 2: 'द्वितीय भाव', 3: 'तृतीय भाव', 4: 'चतुर्थ भाव',
    5: 'पंचम भाव', 6: 'षष्ठ भाव', 7: 'सप्तम भाव', 8: 'अष्टम भाव',
    9: 'नवम भाव', 10: 'दशम भाव', 11: 'एकादश भाव', 12: 'द्वादश भाव',
  },
};

// ---------------------------------------------------------------------------
// REPORT METRICS — localized titles used for scorecard / summary metrics
// ---------------------------------------------------------------------------
export type MetricKey =
  | 'overallStrength' | 'planetaryStrength' | 'ascendantStrength'
  | 'risingStrength' | 'moonStrength' | 'sunStrength' | 'marsStrength'
  | 'jupiterStrength' | 'saturnStrength' | 'mercuryStrength'
  | 'careerImpact' | 'loveHarmony' | 'financialOutlook'
  | 'healthVitality' | 'educationGrowth' | 'spiritualEvolution';

export const METRIC_TITLES: Record<LocaleCode, Record<MetricKey, string>> = {
  en: {
    overallStrength: 'Overall Chart Strength',
    planetaryStrength: 'Planetary Strength',
    ascendantStrength: 'Ascendant Strength',
    risingStrength: 'Rising Sign Strength',
    moonStrength: 'Moon Strength',
    sunStrength: 'Sun Strength',
    marsStrength: 'Mars Strength',
    jupiterStrength: 'Jupiter Strength',
    saturnStrength: 'Saturn Strength',
    mercuryStrength: 'Mercury Strength',
    careerImpact: 'Career Impact',
    loveHarmony: 'Love & Relationship Harmony',
    financialOutlook: 'Financial Outlook',
    healthVitality: 'Health & Vitality',
    educationGrowth: 'Education & Growth',
    spiritualEvolution: 'Spiritual Evolution',
  },
  hi: {
    overallStrength: 'संपूर्ण चार्ट शक्ति',
    planetaryStrength: 'ग्रह शक्ति',
    ascendantStrength: 'लग्न शक्ति',
    risingStrength: 'उदय राशि शक्ति',
    moonStrength: 'चंद्र शक्ति',
    sunStrength: 'सूर्य शक्ति',
    marsStrength: 'मंगल शक्ति',
    jupiterStrength: 'गुरु शक्ति',
    saturnStrength: 'शनि शक्ति',
    mercuryStrength: 'बुध शक्ति',
    careerImpact: 'करियर प्रभाव',
    loveHarmony: 'प्रेम एवं संबंध सामंजस्य',
    financialOutlook: 'आर्थिक दृष्टिकोण',
    healthVitality: 'स्वास्थ्य एवं जीवनशक्ति',
    educationGrowth: 'शिक्षा एवं विकास',
    spiritualEvolution: 'आध्यात्मिक विकास',
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
  | 'unlockSuccess'
  // --- Batch 3: branded multilingual PDF export ---
  | 'generatingPdf'
  | 'pdfError'
  | 'pageOf'
  | 'generatedOn'
  | 'pdfCopyright'
  | 'pdfWatermark'
  | 'pdfDisclaimer'
  | 'pdfPage1Title'
  | 'pdfPage2Title'
  | 'pdfPage3Title'
  | 'pdfPage4Title'
  | 'pdfPage5Title'
  | 'pdfPersonalDetails'
  | 'pdfPanchangPanel'
  | 'ashtakvargaTable'
  | 'sarvashtakvargaTotal';

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
    // --- Batch 3: branded multilingual PDF export ---
    generatingPdf: 'Generating {lang} Kundli…',
    pdfError: 'Failed to generate PDF. Please try again.',
    pageOf: 'Page {x} of {y}',
    generatedOn: 'Generated on',
    pdfCopyright: '© AstroSage AI. All rights reserved.',
    pdfWatermark: 'AstroSage AI',
    pdfDisclaimer: 'This report is for informational purposes only.',
    pdfPage1Title: 'Birth Details & Panchang',
    pdfPage2Title: 'Birth Chart & Planetary Positions',
    pdfPage3Title: 'KP Details & Vimshottari Dasha',
    pdfPage4Title: 'Divisional Charts & Ashtakvarga',
    pdfPage5Title: 'Yogas, Doshas & Remedies',
    pdfPersonalDetails: 'Personal Details',
    pdfPanchangPanel: 'Panchang at Birth',
    ashtakvargaTable: 'Ashtakvarga Bindus',
    sarvashtakvargaTotal: 'Sarvashtakvarga',
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
    // --- Batch 3: branded multilingual PDF export ---
    generatingPdf: '{lang} कुंडली बनाई जा रही है…',
    pdfError: 'PDF बनाने में विफल। कृपया पुनः प्रयास करें।',
    pageOf: 'पृष्ठ {x} / {y}',
    generatedOn: 'जारी तिथि',
    pdfCopyright: '© AstroSage AI. सर्वाधिकार सुरक्षित।',
    pdfWatermark: 'AstroSage AI',
    pdfDisclaimer: 'यह रिपोर्ट केवल सूचना के उद्देश्य से है।',
    pdfPage1Title: 'जन्म विवरण एवं पंचांग',
    pdfPage2Title: 'जन्म कुंडली एवं ग्रह स्थिति',
    pdfPage3Title: 'केपी विवरण एवं विंशोत्तरी दशा',
    pdfPage4Title: 'शोडश वर्ग एवं अष्टकवर्ग',
    pdfPage5Title: 'योग, दोष एवं उपाय',
    pdfPersonalDetails: 'व्यक्तिगत विवरण',
    pdfPanchangPanel: 'जन्म के समय पंचांग',
    ashtakvargaTable: 'अष्टकवर्ग बिंदु',
    sarvashtakvargaTotal: 'सर्वाष्टकवर्ग',
  },
};

// ---------------------------------------------------------------------------
// PDF LABEL HELPERS — template-string interpolation for the branded export
// ---------------------------------------------------------------------------

/** Interpolate "{key}" placeholders in a label, e.g. fill('Page {x} of {y}', { x: 1, y: 5 }). */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}

/** Localized "Generating Hindi Kundli…" style status for the download button. */
export function getPdfGeneratingLabel(locale: LocaleCode): string {
  const langName = locale === 'hi' ? 'हिन्दी' : 'English';
  return fillTemplate(getUILabel('generatingPdf', locale), { lang: langName });
}

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

/** Localize a planet's full name (e.g., 'Sun'/'Surya' → 'सूर्य'). Falls back to input. */
export function localizePlanet(planet: string, locale: LocaleCode): string {
  const canonical = canonicalPlanet(planet);
  return PLANET_NAMES[locale]?.[canonical] ?? planet;
}

/** Localize a planet's chart abbreviation (e.g., 'Sun'/'Surya' → 'सू'). */
export function localizePlanetAbbr(planet: string, locale: LocaleCode): string {
  const canonical = canonicalPlanet(planet);
  return (
    PLANET_ABBREVIATIONS[locale]?.[canonical] ??
    PLANET_ABBREVIATIONS.en[canonical] ??
    canonical.slice(0, 2)
  );
}

/** Localize a zodiac sign (e.g., 'Aries' → 'मेष'). Falls back to input. */
export function localizeSign(sign: string, locale: LocaleCode): string {
  return ZODIAC_SIGNS[locale]?.[sign] ?? sign;
}

/**
 * Resolve a sign descriptor to a 1-12 index.
 * Accepts Western ('Aries'), Sanskrit ('Mesha'), or Hindi ('मेष') spellings.
 * Returns the zero-based array index + 1 (i.e. 1-12), or 0 if unknown.
 */
export function getSignIndex(sign: string | number | undefined | null): number {
  if (typeof sign === 'number') {
    return Number.isFinite(sign) && sign >= 1 && sign <= 12 ? Math.round(sign) : 0;
  }
  if (!sign) return 0;
  const cleaned = String(sign).trim();
  return RASHI_INDEX_BY_NAME[cleaned] ?? 0;
}

/** Localize a Rashi (Sanskrit sign name) by 1-12 index: 'Mesha' → 'मेष'. */
export function localizeRashi(signIndex: number, locale: LocaleCode): string {
  const idx = (signIndex - 1 + 12) % 12;
  return RASHI_NAMES[locale]?.[idx] ?? RASHI_NAMES.en[idx] ?? '';
}

/** Localize a house number (1-12): '1st House' → 'प्रथम भाव'. */
export function localizeHouse(houseNum: number, locale: LocaleCode): string {
  const normalized = ((houseNum - 1) % 12) + 1;
  return HOUSE_NAMES[locale]?.[normalized] ?? HOUSE_NAMES.en[normalized] ?? String(houseNum);
}

/** Get the localized chart-type glyph for a sign index (1-12). */
export function getRashiGlyph(signIndex: number): string {
  const idx = ((signIndex - 1) % 12 + 12) % 12;
  return RASHI_GLYPHS[idx] ?? '♈';
}

/** Get a localized report-metric title by key. Falls back to English. */
export function getMetricTitle(key: MetricKey, locale: LocaleCode): string {
  return METRIC_TITLES[locale]?.[key] ?? METRIC_TITLES.en[key] ?? key;
}

/** Localize a Panchang/Avakhada key (e.g., 'Nakshatra' → 'नक्षत्र'). Falls back to input. */
export function localizePanchangKey(key: string, locale: LocaleCode): string {
  return PANCHANG_KEYS[locale]?.[key] ?? key;
}

/** Get a localized UI label by key. Falls back to English, then the key itself. */
export function getUILabel(key: UIKey, locale: LocaleCode): string {
  return UI_LABELS[locale]?.[key] ?? UI_LABELS.en[key] ?? key;
}

// ---------------------------------------------------------------------------
// NAKSHATRAS — 27 lunar mansions (Ashwini/अश्विनी → Revati/रेवती)
// ---------------------------------------------------------------------------
export const NAKSHATRA_NAMES: Record<LocaleCode, string[]> = {
  en: [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
    'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati',
  ],
  hi: [
    'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मिगाशिरा', 'अरुद्रा', 'पुनर्वसु',
    'पूषन', 'अश्लेषा', 'मघा', 'पूर्व फाल्गुनी', 'उत्तर फाल्गुनी', 'हस्त',
    'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल', 'पूर्वाषड़ा',
    'उत्तराषड़ा', 'श्रावण', 'धनिष्ठा', 'शतभिषा', 'पूर्व भाद्रपदा',
    'उत्तर भाद्रपदा', 'रेवती',
  ],
};

// ---------------------------------------------------------------------------
// SIGN LORDS — Aries(1) → Mars … Pisces(12) → Jupiter
// ---------------------------------------------------------------------------
export const SIGN_LORDS: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
  5: 'Jupiter', 6: 'Saturn', 7: 'Saturn', 8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter',
};

// ---------------------------------------------------------------------------
// NAKSHATRA LORDS — 27-entry cycle starting Ashwini → Ketu
// ---------------------------------------------------------------------------
export const NAKSHATRA_LORDS: string[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Mercury', 'Saturn',
  'Jupiter', 'Saturn', 'Jupiter', 'Moon', 'Sun', 'Venus',
  'Mercury', 'Saturn', 'Jupiter', 'Mercury', 'Saturn', 'Mercury',
  'Jupiter', 'Moon', 'Sun', 'Venus', 'Sun', 'Mercury', 'Venus', 'Jupiter',
];

// ---------------------------------------------------------------------------
// TABLE LABELS — localized column headers for all tables
// ---------------------------------------------------------------------------
export type TableLabelKey =
  | 'planet' | 'sign' | 'signLord' | 'degree' | 'house' | 'nakshatra' | 'nakshLord'
  | 'starLord' | 'subLord' | 'cusp' | 'mahadasha' | 'antardasha' | 'period'
  | 'status' | 'retrograde' | 'direct' | 'strength' | 'description' | 'pada';

export const TABLE_LABELS: Record<LocaleCode, Record<TableLabelKey, string>> = {
  en: {
    planet: 'Planet', sign: 'Sign', signLord: 'Sign Lord', degree: 'Degree',
    house: 'House', nakshatra: 'Nakshatra', nakshLord: 'Naksh Lord',
    starLord: 'Star Lord', subLord: 'Sub Lord', cusp: 'Cusp',
    mahadasha: 'Mahadasha', antardasha: 'Antardasha', period: 'Period',
    status: 'Status', retrograde: 'Retrograde', direct: 'Direct',
    strength: 'Strength', description: 'Description',
    pada: 'Pada',
  },
  hi: {
    planet: 'ग्रह', sign: 'राशि', signLord: 'राशि स्वामी', degree: 'अंश',
    house: 'भाव', nakshatra: 'नक्षत्र', nakshLord: 'नक्षत्र स्वामी',
    starLord: 'तारा स्वामी', subLord: 'उप स्वामी', cusp: 'संधि',
    mahadasha: 'महादशा', antardasha: 'अंतर्दशा', period: 'अवधि',
    status: 'स्थिति', retrograde: 'रिट्रो', direct: 'डायरेक्ट',
    strength: 'शक्ति', description: 'विवरण',
    pada: 'पाद',
  },
};

// ---------------------------------------------------------------------------
// CHART TYPE LABELS
// ---------------------------------------------------------------------------
export type ChartType = 'D1' | 'D9' | 'BhavChalit' | 'D3' | 'D4' | 'D7' | 'D10' | 'D12';

export const CHART_TYPE_LABELS: Record<LocaleCode, Record<ChartType, string>> = {
  en: {
    D1: 'Lagna (D1)', D9: 'Navamsa (D9)', BhavChalit: 'Bhav Chalit',
    D3: 'Drekkana (D3)', D4: 'Chaturthamsa (D4)', D7: 'Saptamsa (D7)',
    D10: 'Dasamsa (D10)', D12: 'Dwadashamsa (D12)',
  },
  hi: {
    D1: 'लग्न (D1)', D9: 'नवमांश (D9)', BhavChalit: 'भाव चलित',
    D3: 'द्रेष्काण (D3)', D4: 'चतुर्थांश (D4)', D7: 'सप्तमांश (D7)',
    D10: 'दशमांश (D10)', D12: 'द्वादशांश (D12)',
  },
};

// ---------------------------------------------------------------------------
// DOSHA LABELS
// ---------------------------------------------------------------------------
export type DoshaKey = 'manglik' | 'kaalSarp' | 'sadeSati' | 'rising' | 'peak' | 'setting' | 'present' | 'absent' | 'cancelled';

export const DOSHA_LABELS: Record<LocaleCode, Record<DoshaKey, string>> = {
  en: {
    manglik: 'Manglik Dosha', kaalSarp: 'Kaal Sarp Dosha', sadeSati: 'Sade Sati',
    rising: 'Rising', peak: 'Peak', setting: 'Setting',
    present: 'Present', absent: 'Absent', cancelled: 'Cancelled',
  },
  hi: {
    manglik: 'मांगलिक दोष', kaalSarp: 'काल सर्प दोष', sadeSati: 'साड़े साती',
    rising: 'उदय', peak: 'पीक', setting: 'अस्त',
    present: 'वर्तमान', absent: 'निष्प्राप्त', cancelled: 'रद्द',
  },
};

// ---------------------------------------------------------------------------
// YOGA LIBRARY — localized name + description + strength
// ---------------------------------------------------------------------------
export interface YogaInfo {
  name: string;
  description: string;
  strength: string;
}

export const YOGA_LIBRARY: Record<LocaleCode, Record<string, YogaInfo>> = {
  en: {
    gajakesari: {
      name: 'Gajakesari Yoga',
      description: 'Moon and Jupiter in mutual kendras — brings wisdom, wealth, and fame.',
      strength: 'Strong',
    },
    budhaditya: {
      name: 'Budha-Aditya Yoga',
      description: 'Sun and Mercury conjunction — indicates intelligence and communication skills.',
      strength: 'Moderate',
    },
    lakshmi: {
      name: 'Lakshmi Yoga',
      description: 'Lakshmi Yoga is formed when the 9th and 10th lords are well-placed — brings prosperity and fortune.',
      strength: 'Strong',
    },
    sasa: {
      name: 'Sasa Yoga',
      description: 'Moon in a kendra from Saturn — grants longevity, authority, and respect.',
      strength: 'Strong',
    },
    viparita: {
      name: 'Viparita Raja Yoga',
      description: 'Lords of 6th, 8th, or 12th placed in dusthana — obstacles turn into success.',
      strength: 'Strong',
    },
    chandrabhang: {
      name: 'Chandrabhang Yoga',
      description: 'Moon aspected by or conjunct with benefics — emotional resilience and success.',
      strength: 'Moderate',
    },
    rajayoga: {
      name: 'Raja Yoga',
      description: 'Formed by the combination of kendra and trikona lords — brings success and recognition.',
      strength: 'Strong',
    },
  },
  hi: {
    gajakesari: {
      name: 'गजकेसरी योग',
      description: 'चंद्र और गुरु के परस्पर केंद्र में — बुद्धि, धन और प्रसिद्धि प्राप्त कराता है।',
      strength: 'शक्तिशाली',
    },
    budhaditya: {
      name: 'बुधादित्य योग',
      description: 'सूर्य और बुध एक साथ — बुद्धि और संवाद कौशल का संकेत।',
      strength: 'मध्यम',
    },
    lakshmi: {
      name: 'लक्ष्मी योग',
      description: 'जब ९वीं और १०वीं स्वामी अच्छी तरह स्थित हों — समृद्धि और भाग्य प्राप्त कराता है।',
      strength: 'शक्तिशाली',
    },
    sasa: {
      name: 'शस योग',
      description: 'शनि के केंद्र से चंद्र — लंबी आयु, प्रामुख्यता और सम्मान प्राप्त कराता है।',
      strength: 'शक्तिशाली',
    },
    viparita: {
      name: 'विपरीत राज योग',
      description: '६वीं, ८वीं या १२वीं के स्वामी दोषपूर्ण भाव में — बाधाएं सफलता में बदलती हैं।',
      strength: 'शक्तिशाली',
    },
    chandrabhang: {
      name: 'चंद्रभंग योग',
      description: 'चंद्र को शुभ ग्रहों द्वारा दृष्टा या संयुक्त — भावनात्मक लचीलापन और सफलता।',
      strength: 'मध्यम',
    },
    rajayoga: {
      name: 'राज योग',
      description: 'केंद्र और त्रिकोण स्वामियों के संयोजन से — सफलता और मान्यता प्राप्त कराता है।',
      strength: 'शक्तिशाली',
    },
  },
};

// ---------------------------------------------------------------------------
// GEMSTONE DATA — per planet: gem, metal, finger, day, weight, mantra
// ---------------------------------------------------------------------------
export interface GemstoneInfo {
  gemName: string;
  metal: string;
  finger: string;
  day: string;
  weight: string;
  mantra: string;
  mantraTransliteration: string;
}

export const GEMSTONE_DATA: Record<LocaleCode, Record<string, GemstoneInfo>> = {
  en: {
    Sun: {
      gemName: 'Ruby (Manikya)',
      metal: 'Gold',
      finger: 'Ring finger',
      day: 'Sunday',
      weight: '1.0–1.25 carats',
      mantra: 'ॐ सूर्याय नमः',
      mantraTransliteration: 'Om Suryaya Namah',
    },
    Moon: {
      gemName: 'Pearl (Moti)',
      metal: 'Silver',
      finger: 'Little finger',
      day: 'Monday',
      weight: '2.0–2.5 carats',
      mantra: 'ॐ चंद्राय नमः',
      mantraTransliteration: 'Om Chandraya Namah',
    },
    Mars: {
      gemName: 'Red Coral (Moonga)',
      metal: 'Gold or Silver',
      finger: 'Ring finger',
      day: 'Tuesday',
      weight: '1.5–2.0 carats',
      mantra: 'ॐ अंगारकाय नमः',
      mantraTransliteration: 'Om Angarakaya Namah',
    },
    Mercury: {
      gemName: 'Emerald (Panna)',
      metal: 'Silver or Gold',
      finger: 'Little finger',
      day: 'Wednesday',
      weight: '2.0–2.5 carats',
      mantra: 'ॐ बुधाय नमः',
      mantraTransliteration: 'Om Budhayana Namah',
    },
    Jupiter: {
      gemName: 'Yellow Sapphire (Pukhraj)',
      metal: 'Gold',
      finger: 'Index finger',
      day: 'Thursday',
      weight: '2.0–2.5 carats',
      mantra: 'ॐ गुरुं नमः',
      mantraTransliteration: 'Om Gurave Namah',
    },
    Venus: {
      gemName: 'Diamond (Hira)',
      metal: 'Platinum or Silver',
      finger: 'Ring finger',
      day: 'Friday',
      weight: '1.0–1.5 carats',
      mantra: 'ॐ शुक्राय नमः',
      mantraTransliteration: 'Om Shukraya Namah',
    },
    Saturn: {
      gemName: 'Blue Sapphire (Neelam)',
      metal: 'Iron or Silver',
      finger: 'Middle finger',
      day: 'Saturday',
      weight: '2.0–2.5 carats',
      mantra: 'ॐ शनिश्चराय नमः',
      mantraTransliteration: 'Om Shani Shcharaya Namah',
    },
    Rahu: {
      gemName: 'Hessonite (Gomed)',
      metal: 'Silver',
      finger: 'Middle finger',
      day: 'Saturday',
      weight: '2.0–2.5 carats',
      mantra: 'ॐ राहु नमः',
      mantraTransliteration: 'Om Rahu Namah',
    },
    Ketu: {
      gemName: 'Cat\'s Eye (Lehsunia)',
      metal: 'Silver',
      finger: 'Ring finger',
      day: 'Thursday',
      weight: '1.5–2.0 carats',
      mantra: 'ॐ केतवे नमः',
      mantraTransliteration: 'Om Ketave Namah',
    },
  },
  hi: {
    Sun: {
      gemName: 'रूबी (माणिक्य)',
      metal: 'सोना',
      finger: 'तीसरी उंगली',
      day: 'रविवार',
      weight: '१.०–१.२५ कैरेट',
      mantra: 'ॐ सूर्याय नमः',
      mantraTransliteration: 'Om Suryaya Namah',
    },
    Moon: {
      gemName: 'मोती (मोती)',
      metal: 'चांदी',
      finger: 'छोटी उंगली',
      day: 'सोमवार',
      weight: '२.०–२.५ कैरेट',
      mantra: 'ॐ चंद्राय नमः',
      mantraTransliteration: 'Om Chandraya Namah',
    },
    Mars: {
      gemName: 'लाल मूंगा (मोंगा)',
      metal: 'सोना या चांदी',
      finger: 'तीसरी उंगली',
      day: 'मंगवार',
      weight: '१.५–२.० कैरेट',
      mantra: 'ॐ अंगारकाय नमः',
      mantraTransliteration: 'Om Angarakaya Namah',
    },
    Mercury: {
      gemName: 'हीरा (पन्ना)',
      metal: 'चांदी या सोना',
      finger: 'छोटी उंगली',
      day: 'बुधवार',
      weight: '२.०–२.५ कैरेट',
      mantra: 'ॐ बुधाय नमः',
      mantraTransliteration: 'Om Budhayana Namah',
    },
    Jupiter: {
      gemName: 'पीला सैप्पलाइर (पुखराज)',
      metal: 'सोना',
      finger: 'सूची उंगली',
      day: 'गुरुवार',
      weight: '२.०–२.५ कैरेट',
      mantra: 'ॐ गुरुं नमः',
      mantraTransliteration: 'Om Gurave Namah',
    },
    Venus: {
      gemName: 'हीरा (हीरा)',
      metal: 'प्लैटिनम या चांदी',
      finger: 'तीसरी उंगली',
      day: 'शुक्रवार',
      weight: '१.०–१.५ कैरेट',
      mantra: 'ॐ शुक्राय नमः',
      mantraTransliteration: 'Om Shukraya Namah',
    },
    Saturn: {
      gemName: 'नीलमणि (नीलम)',
      metal: 'लोहा या चांदी',
      finger: 'मध्य उंगली',
      day: 'शनिवार',
      weight: '२.०–२.५ कैरेट',
      mantra: 'ॐ शनिश्चराय नमः',
      mantraTransliteration: 'Om Shani Shcharaya Namah',
    },
    Rahu: {
      gemName: 'गोमेद (हेसनाइट)',
      metal: 'चांदी',
      finger: 'मध्य उंगली',
      day: 'शनिवार',
      weight: '२.०–२.५ कैरेट',
      mantra: 'ॐ राहु नमः',
      mantraTransliteration: 'Om Rahu Namah',
    },
    Ketu: {
      gemName: 'कैट्स आइ (लेसुनिया)',
      metal: 'चांदी',
      finger: 'तीसरी उंगली',
      day: 'गुरुवार',
      weight: '१.५–२.० कैरेट',
      mantra: 'ॐ केतवे नमः',
      mantraTransliteration: 'Om Ketave Namah',
    },
  },
};

// ---------------------------------------------------------------------------
// RUDAKSHSHA DATA — 1 to 14 Mukhi (focus on 1–9 as per task)
// ---------------------------------------------------------------------------
export interface RudrakshaInfo {
  name: string;
  planet: string;
  benefits: string;
  wearingRules: string;
}

export const RUDRAKSHA_DATA: Record<LocaleCode, Record<number, RudrakshaInfo>> = {
  en: {
    1: {
      name: '1-Mukhi Rudraksha (Rahu)',
      planet: 'Rahu',
      benefits: 'Improves focus, eliminates illusion, aids meditation.',
      wearingRules: 'Wear on Sunday morning after purification. Keep it on a silk or wool thread.',
    },
    2: {
      name: '2-Mukhi Rudraksha (Moon)',
      planet: 'Moon',
      benefits: 'Balances emotions, improves relationships and mental clarity.',
      wearingRules: 'Wear on Monday morning on a silver or white thread.',
    },
    3: {
      name: '3-Mukhi Rudraksha (Mars)',
      planet: 'Mars',
      benefits: 'Boosts confidence, courage, and physical strength.',
      wearingRules: 'Wear on Tuesday morning on a red thread or gold.',
    },
    4: {
      name: '4-Mukhi Rudraksha (Mercury)',
      planet: 'Mercury',
      benefits: 'Enhances communication, intelligence, and learning ability.',
      wearingRules: 'Wear on Wednesday morning on a green thread.',
    },
    5: {
      name: '5-Mukhi Rudraksha (Jupiter)',
      planet: 'Jupiter',
      benefits: 'Brings wisdom, prosperity, and spiritual growth.',
      wearingRules: 'Wear on Thursday morning on a yellow thread.',
    },
    6: {
      name: '6-Mukhi Rudraksha (Venus)',
      planet: 'Venus',
      benefits: 'Improves artistic ability, harmony, and relationships.',
      wearingRules: 'Wear on Friday morning on a white or silver thread.',
    },
    7: {
      name: '7-Mukhi Rudraksha (Saturn)',
      planet: 'Saturn',
      benefits: 'Reduces Saturn\'s malefic effects, brings discipline and success.',
      wearingRules: 'Wear on Saturday morning on a black thread or iron.',
    },
    8: {
      name: '8-Mukhi Rudraksha (Rahu-Ketu)',
      planet: 'Rahu-Ketu',
      benefits: 'Overcomes obstacles, removes fear, and provides protection.',
      wearingRules: 'Wear on Saturday or Tuesday on a black or blue thread.',
    },
    9: {
      name: '9-Mukhi Rudraksha (Navagraha)',
      planet: 'Navagraha',
      benefits: 'Balances all nine planets, provides ultimate protection and spiritual awakening.',
      wearingRules: 'Wear on Tuesday or Saturday. Energize with Durga Saptashati mantra. Do not wear while sleeping.',
    },
  },
  hi: {
    1: {
      name: '१-मुखी रुद्राक्ष (राहु)',
      planet: 'राहु',
      benefits: 'ध्यान को सुधरता है, भ्रम को दूर करता है, ध्यान में मदद करता है।',
      wearingRules: 'रविवार की सुबह शुद्ध करके पहनें। सिल्क या ऊन की धागे पर।',
    },
    2: {
      name: '२-मुखी रुद्राक्ष (चंद्र)',
      planet: 'चंद्र',
      benefits: 'भावनाओं को संतुलित करता है, संबंधों और मानसी शुद्धि में सुधर।',
      wearingRules: 'सोमवार की सुबह चांदी या सफेद धागे पर पहनें।',
    },
    3: {
      name: '३-मुखी रुद्राक्ष (मंगल)',
      planet: 'मंगल',
      benefits: 'आत्मविश्वास, साहस और शारीरिक शक्ति बढ़ाता है।',
      wearingRules: 'मंगवार की सुबह रंगी धागे या सोने पर पहनें।',
    },
    4: {
      name: '४-मुखी रुद्राक्ष (बुध)',
      planet: 'बुध',
      benefits: 'संवाद, बुद्धि और सीखने की क्षमता में सुधर।',
      wearingRules: 'बुधवार की सुबह हरे धागे पर पहनें।',
    },
    5: {
      name: '५-मुखी रुद्राक्ष (गुरु)',
      planet: 'गुरु',
      benefits: 'ज्ञान, समृद्धि और आध्यात्मिक विकास।',
      wearingRules: 'गुरुवार की सुबह पीले धागे पर पहनें।',
    },
    6: {
      name: '६-मुखी रुद्राक्ष (शुक्र)',
      planet: 'शुक्र',
      benefits: 'कलात्मक क्षमता, सामंजस्य और संबंधों में सुधर।',
      wearingRules: 'शुक्रवार की सुबह सफेद या चांदी के धागे पर पहनें।',
    },
    7: {
      name: '७-मुखी रुद्राक्ष (शनि)',
      planet: 'शनि',
      benefits: 'शनि के नकारात्मक प्रभाव कम करता है, अनुशासन और सफलता लाता है।',
      wearingRules: 'शनिवार की सुबह काली धागे या लोहे पर पहनें।',
    },
    8: {
      name: '८-मुखी रुद्राक्ष (राहु-केतु)',
      planet: 'राहु-केतु',
      benefits: 'बाधाओं को दूर करता है, डर को हटाता है, और सुरक्षा प्रदान करता है।',
      wearingRules: 'शनिवार या मंगवार को काली या नीली धागे पर पहनें।',
    },
    9: {
      name: '९-मुखी रुद्राक्ष (नवग्रह)',
      planet: 'नवग्रह',
      benefits: 'सभी नौ ग्रहों को संतुलित करता है, पूरी तरह से सुरक्षा और आध्यात्मिक जागरूकता प्रदान करता है।',
      wearingRules: 'मंगवार या शनिवार को पहनें। दुर्गा सप्तशती मंत्र से ऊर्जा दें। सोने मत पहनें।',
    },
  },
};

// ---------------------------------------------------------------------------
// ASCENDANT NARRATIVES — 12 signs × en/hi
// ---------------------------------------------------------------------------
export const ASCENDANT_NARRATIVES: Record<LocaleCode, Record<number, string>> = {
  en: {
    1: 'With Aries Ascendant, you are bold, energetic, and a natural leader. Your chart emphasizes initiative and pioneering spirit.',
    2: 'With Taurus Ascendant, you are grounded, patient, and value stability. Sensual pleasures and material comfort appeal to you.',
    3: 'With Gemini Ascendant, you are communicative, curious, and adaptable. Learning and networking are key themes in your life.',
    4: 'With Cancer Ascendant, you are nurturing, intuitive, and home-oriented. Family and emotional security are central to your well-being.',
    5: 'With Leo Ascendant, you are confident, creative, and charismatic. Self-expression and recognition drive your actions.',
    6: 'With Virgo Ascendant, you are analytical, detail-oriented, and service-minded. Perfection and health are important to you.',
    7: 'With Libra Ascendant, you are diplomatic, balanced, and relationship-focused. Harmony and partnership are your natural strengths.',
    8: 'With Scorpio Ascendant, you are intense, resourceful, and transformative. Deep truths and shared resources shape your journey.',
    9: 'With Sagittarius Ascendant, you are philosophical, adventurous, and truth-seeking. Higher learning and travel expand your horizons.',
    10: 'With Capricorn Ascendant, you are ambitious, disciplined, and career-focused. Structure and achievement define your path.',
    11: 'With Aquarius Ascendant, you are innovative, humanitarian, and intellectually driven. Social reform and originality mark your approach.',
    12: 'With Pisces Ascendant, you are intuitive, compassionate, and spiritually inclined. Imagination and empathy guide your steps.',
  },
  hi: {
    1: 'मेष लग्न से, आप साहसी, ऊर्जावान और एक प्राकृतिक नेता हैं। आपका चार्ट पहल और अग्रणी आत्मा पर ज़ोर देता है।',
    2: 'वृषभ लग्न से, आप स्थिर, धैर्यपूर्ण और स्थिरता की कदर करते हैं। इंद्रीय आनंद और भौतिक सुविधाएं आपको आकर्षित करती हैं।',
    3: 'मिथुन लग्न से, आप संवादी, जिज्ञासु और अनुकूल हैं। सीखना और नेटवर्किंग आपके जीवन के प्रमुख विषय हैं।',
    4: 'कर्क लग्न से, आप पोषक, अंतर्ज्ञ और घर की ओर झुके हैं। परिवार और भावनात्मक सुरक्षा आपके कल्याण के केंद्र में हैं।',
    5: 'सिंह लग्न से, आप आत्मविश्वासी, रचनात्मक और आकर्षक हैं। आत्म-अभिव्यक्ति और मान्यता आपके कार्यों को चलाती हैं।',
    6: 'कन्या लग्न से, आप विश्लेषणात्मक, विस्तृत और सेवा-मूल्लत्व वाले हैं। पूर्णता और स्वास्थ्य आपके लिए महत्वपूर्ण है।',
    7: 'तुला लग्न से, आप राजनैतिक, संतुलित और संबंध-केंद्रित हैं। सामंजस्य और साझेदारी आपकी प्राकृतिक शक्ति हैं।',
    8: 'वृश्चिक लग्न से, आप तीव्र, संसाधनी और रूपांतरक हैं। गहरे सत्य और साझा संसाधन आपकी यात्रा को आकार देते हैं।',
    9: 'धनु लग्न से, आप दार्शनिक, साहसी और सत्य खोजने वाले हैं। उच्च शिक्षा और यात्रा आपके दृष्टिकोण को विस्तार देते हैं।',
    10: 'मकर लग्न से, आप महत्वाकांक्षी, अनुशासित और करियर-केंद्रित हैं। संरचना और उपलब्धि आपके मार्ग को परिभाषित करते हैं।',
    11: 'कुंभ लग्न से, आप नवीन, मानवतावादी और बौद्धिक रूप से प्रेरित हैं। सामाजिक सुधार और मूलतः महत्वपूर्ण हैं।',
    12: 'मीन लग्न से, आप अंतर्ज्ञ, करुणापूर्ण और आध्यात्मिक रूप से झुके हैं। कल्पना और सहानुभूति आपके कदमों को मार्गदर्शन करते हैं।',
  },
};

// ---------------------------------------------------------------------------
// DOSHA NARRATIVES
// ---------------------------------------------------------------------------
export const DOSHA_NARRATIVES: Record<LocaleCode, Record<string, string>> = {
  en: {
    manglikPresent: 'Mars is placed in a Manglik house, indicating the presence of Mangal Dosha. This can affect marriage and relationships.',
    manglikCancelled: 'Mars is in a Manglik house but the dosha is cancelled due to beneficial placement.',
    manglikAbsent: 'Mars is not placed in a Manglik house. No Mangal Dosha is present.',
    kaalSarpPresent: 'Kaal Sarp Dosha is present when all planets are on one side of the Rahu-Ketu axis. This creates karmic obstacles.',
    kaalSarpAbsent: 'No Kaal Sarp Dosha detected. Planetary energy is well-balanced.',
    sadeSatiRising: 'Saturn is entering the 12th house from your Moon sign. This is the beginning phase of Sade Sati.',
    sadeSatiPeak: 'Saturn is transiting your Moon sign. This is the most intense phase of Sade Sati.',
    sadeSatiSetting: 'Saturn is moving into the 2nd house from your Moon sign. Challenges begin to ease.',
    sadeSatiInactive: 'Saturn is not currently transiting the Sade Sati houses. You are free from this influence.',
  },
  hi: {
    manglikPresent: 'मंगल एक मांगलिक भाव में स्थित है, जो मांगलिक दोष की उपस्थिति का संकेत देता है। यह विवाह और संबंधों को प्रभावित कर सकता है।',
    manglikCancelled: 'मंगल एक मांगलिक भाव में है लेकिन दोष लाभदायक स्थिति के कारण रद्द हो गया है।',
    manglikAbsent: 'मंगल एक मांगलिक भाव में नहीं स्थित है। कोई मांगलिक दोष नहीं है।',
    kaalSarpPresent: 'काल सर्प दोष तभी उत्पन्न होता है जब सभी ग्रह राहु-केतु अक्ष के एक पक्ष में होते हैं। यह कार्मिक बाधाएं पैदा करता है।',
    kaalSarpAbsent: 'कोई काल सर्प दोष नहीं पाया गया। ग्रह ऊर्जा संतुलित है।',
    sadeSatiRising: 'शनि आपके चंद्र के १२वीं भाव में प्रवेश कर रहा है। यह साड़े साती की शुरुआती ध्येय है।',
    sadeSatiPeak: 'शनि आपके चंद्र राशि में संक्रमण कर रहा है। यह साड़े साती की सबसे तीव्र अवस्था है।',
    sadeSatiSetting: 'शनि आपके चंद्र के २वीं भाव में चला जा रहा है। चुनौतियां कम होने लगती हैं।',
    sadeSatiInactive: 'शनि वर्तमान में साड़े साती भावों में संक्रमण नहीं कर रहा है। आप इस प्रभाव से मुक्त हैं।',
  },
};

// ---------------------------------------------------------------------------
// REMEDY SECTION LABELS
// ---------------------------------------------------------------------------
export type RemedyLabelKey =
  | 'lifeStone' | 'luckyStone' | 'fortuneStone' | 'gemstoneGuide' | 'mantra'
  | 'wearingGuidelines' | 'rudraksha' | 'rudrakshaGuide' | 'recommended'
  | 'ascendantAnalysis' | 'planetaryConjunctions' | 'activeYogas' | 'doshaStatus';

export const REMEDY_LABELS: Record<LocaleCode, Record<RemedyLabelKey, string>> = {
  en: {
    lifeStone: 'Life Stone',
    luckyStone: 'Lucky Stone',
    fortuneStone: 'Fortune Stone',
    gemstoneGuide: 'Gemstone Guide',
    mantra: 'Mantra',
    wearingGuidelines: 'Wearing Guidelines',
    rudraksha: 'Rudraksha',
    rudrakshaGuide: 'Rudraksha Guide',
    recommended: 'Recommended',
    ascendantAnalysis: 'Ascendant Analysis',
    planetaryConjunctions: 'Planetary Conjunctions',
    activeYogas: 'Active Yogas',
    doshaStatus: 'Dosha Status',
  },
  hi: {
    lifeStone: 'जीवन रत्न',
    luckyStone: 'भाग्य रत्न',
    fortuneStone: 'भाग्यशाली रत्न',
    gemstoneGuide: 'रत्न गाइड',
    mantra: 'मंत्र',
    wearingGuidelines: 'पहनने के नियम',
    rudraksha: 'रुद्राक्ष',
    rudrakshaGuide: 'रुद्राक्ष गाइड',
    recommended: 'अनुशंसित',
    ascendantAnalysis: 'लग्न विश्लेषण',
    planetaryConjunctions: 'ग्रह युक्ति',
    activeYogas: 'सक्रिय योग',
    doshaStatus: 'दोष स्थिति',
  },
};

// ---------------------------------------------------------------------------
// CALCULATION HELPERS
// ---------------------------------------------------------------------------

/** Get the ruling planet (lord) of a sign number (1-12). */
export function getSignLord(sign: number): string {
  return SIGN_LORDS[sign] ?? 'Moon';
}

/** Get the Nakshatra lord for a given longitude (0-360). */
export function getNakshatraLord(longitude: number): string {
  const span = 360 / 27;
  const index = Math.floor(longitude / span);
  return NAKSHATRA_LORDS[index] ?? 'Ketu';
}

/** Get the Nakshatra index (1-27) for a longitude. */
export function getNakshatraIndex(longitude: number): number {
  const span = 360 / 27;
  return Math.floor(longitude / span) + 1;
}

/** Get the Nakshatra name for a longitude. */
export function getNakshatraName(longitude: number, locale: LocaleCode): string {
  const index = getNakshatraIndex(longitude) - 1;
  return NAKSHATRA_NAMES[locale]?.[index] ?? NAKSHATRA_NAMES.en[index] ?? 'Revati';
}

/**
 * Get the KP sub-lord for a given longitude.
 * Uses the standard Vimshottari proportional subdivision of the Nakshatra.
 */
export function getKpSubLord(longitude: number): string {
  const span = 360 / 27;
  const nakIndex = Math.floor(longitude / span);
  const remainder = longitude - nakIndex * span;
  const subSpan = span / 9;
  const subIndex = Math.floor(remainder / subSpan);
  const subLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  return subLords[subIndex] ?? 'Mercury';
}

/**
 * Compute divisional sign for a given type.
 * Returns sign number 1-12.
 */
export function getDivisionalSign(
  sign: number,
  degree: number,
  type: ChartType
): number {
  const totalDeg = (sign - 1) * 30 + degree;
  switch (type) {
    case 'D1':
      return sign;
    case 'D9': {
      // Navamsa: each sign divided into 9 parts of 3°20'
      const part = Math.floor(degree / (30 / 9));
      // Movable signs begin from themselves, fixed signs from the 9th sign,
      // and dual signs from the 5th sign.
      const modality = (sign - 1) % 3;
      const base = modality === 0 ? sign : modality === 1 ? ((sign + 8 - 1) % 12) + 1 : ((sign + 4 - 1) % 12) + 1;
      return ((base + part - 1) % 12) + 1;
    }
    case 'D3': {
      // Drekkana: each sign divided into 3 parts of 10°
      const part = Math.floor(degree / 10);
      if (sign % 3 === 1) return sign;
      if (sign % 3 === 2) return ((sign + 8) % 12) + 1;
      return ((sign + 4) % 12) + 1;
    }
    case 'D4': {
      // Chaturthamsa: each sign divided into 4 parts of 7.5°
      const part = Math.floor(degree / 7.5);
      return ((sign + part - 1) % 12) + 1;
    }
    case 'D7': {
      // Saptamsa: odd signs count from themselves; even signs from the 7th.
      const part = Math.floor(degree / (30 / 7));
      const base = sign % 2 === 1 ? sign : ((sign + 6 - 1) % 12) + 1;
      return ((base + part - 1) % 12) + 1;
    }
    case 'D10': {
      // Dasamsa: odd signs count from themselves; even signs from the 9th.
      const part = Math.floor(degree / 3);
      const base = sign % 2 === 1 ? sign : ((sign + 8 - 1) % 12) + 1;
      return ((base + part - 1) % 12) + 1;
    }
    case 'D12': {
      // Dwadashamsa: each sign divided into 12 parts of 2°30'.
      // Counting begins from the natal sign for both odd and even signs.
      const part = Math.floor(degree / (30 / 12));
      return ((sign + part - 1) % 12) + 1;
    }
    case 'BhavChalit':
      return sign;
    default:
      return sign;
  }
}

/**
 * Compute the house number for a planet in a divisional chart.
 * Uses the divisional ascendant to determine house placement.
 */
export function getDivisionalHouse(
  planetSign: number,
  planetDegree: number,
  divAscSign: number,
  type: ChartType
): number {
  const divSign = getDivisionalSign(planetSign, planetDegree, type);
  let house = ((divSign - divAscSign + 12) % 12) + 1;
  if (house === 0) house = 12;
  return house;
}

/**
 * Compute the divisional ascendant sign for a given type.
 * For D1, it's the birth ascendant. For others, derived from ascendant degree.
 */
export function getDivisionalAscendant(
  ascSign: number,
  ascDegree: number,
  type: ChartType
): number {
  if (type === 'D1' || type === 'BhavChalit') return ascSign;
  return getDivisionalSign(ascSign, ascDegree, type);
}

/**
 * Compute Vimshottari Antardashas for a given Mahadasha.
 * Returns array of {planet, startDate, endDate} in ISO date strings.
 */
export function computeAntardashas(
  mahadashaPlanet: string,
  mahadashaStart: string,
  mahadashaEnd: string
): { planet: string; startDate: string; endDate: string }[] {
  const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  const totalYears = dashaYears.reduce((a, b) => a + b, 0); // 120

  const startIndex = dashaLords.indexOf(mahadashaPlanet);
  if (startIndex === -1) return [];

  const start = new Date(mahadashaStart);
  const end = new Date(mahadashaEnd);
  const totalMs = end.getTime() - start.getTime();

  const result: { planet: string; startDate: string; endDate: string }[] = [];
  let cursor = new Date(start);

  for (let i = 0; i < 9; i++) {
    const lordIndex = (startIndex + i) % 9;
    const years = dashaYears[lordIndex];
    const proportion = years / totalYears;
    const durationMs = totalMs * proportion;
    const adEnd = new Date(cursor.getTime() + durationMs);

    result.push({
      planet: dashaLords[lordIndex],
      startDate: cursor.toISOString().split('T')[0],
      endDate: adEnd.toISOString().split('T')[0],
    });
    cursor = adEnd;
  }

  return result;
}

/**
 * Format a date string localized for the given locale.
 * e.g., "12 Mar 2024" (en) / "१२ मार्च २०२४" (hi)
 */
export function formatLocalizedDate(dateStr: string, locale: LocaleCode): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const localeMap: Record<LocaleCode, string> = { en: 'en-IN', hi: 'hi-IN' };
    return new Intl.DateTimeFormat(localeMap[locale] ?? 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Get the retrograde marker for the given locale.
 * en: '®'  hi: '(व)'
 */
export function getRetrogradeMarker(locale: LocaleCode): string {
  return locale === 'hi' ? '(व)' : '®';
}

/**
 * Get the localized yoga info by key.
 */
export function getYogaInfo(key: string, locale: LocaleCode): YogaInfo {
  return YOGA_LIBRARY[locale]?.[key] ?? YOGA_LIBRARY.en[key] ?? { name: key, description: '', strength: '' };
}

/**
 * Get the localized table label by key.
 */
export function getTableLabel(key: TableLabelKey, locale: LocaleCode): string {
  return TABLE_LABELS[locale]?.[key] ?? TABLE_LABELS.en[key] ?? key;
}

/**
 * Get the localized chart type label.
 */
export function getChartTypeLabel(type: ChartType, locale: LocaleCode): string {
  return CHART_TYPE_LABELS[locale]?.[type] ?? CHART_TYPE_LABELS.en[type] ?? type;
}

/**
 * Get the localized dosha label.
 */
export function getDoshaLabel(key: DoshaKey, locale: LocaleCode): string {
  return DOSHA_LABELS[locale]?.[key] ?? DOSHA_LABELS.en[key] ?? key;
}

/**
 * Get the localized remedy label.
 */
export function getRemedyLabel(key: RemedyLabelKey, locale: LocaleCode): string {
  return REMEDY_LABELS[locale]?.[key] ?? REMEDY_LABELS.en[key] ?? key;
}

/**
 * Get the localized ascendant narrative for a sign number (1-12).
 */
export function getAscendantNarrative(sign: number, locale: LocaleCode): string {
  return ASCENDANT_NARRATIVES[locale]?.[sign] ?? ASCENDANT_NARRATIVES.en[sign] ?? '';
}

/**
 * Get the localized dosha narrative.
 */
export function getDoshaNarrative(key: string, locale: LocaleCode): string {
  return DOSHA_NARRATIVES[locale]?.[key] ?? DOSHA_NARRATIVES.en[key] ?? '';
}

/**
 * Get gemstone info for a planet.
 */
export function getGemstoneInfo(planet: string, locale: LocaleCode): GemstoneInfo | undefined {
  return GEMSTONE_DATA[locale]?.[planet] ?? GEMSTONE_DATA.en[planet];
}

/**
 * Get Rudraksha info for a given mukhi count (1-14).
 */
export function getRudrakshaInfo(mukhi: number, locale: LocaleCode): RudrakshaInfo | undefined {
  return RUDRAKSHA_DATA[locale]?.[mukhi] ?? RUDRAKSHA_DATA.en[mukhi];
}

/** All supported locales, in display order. */
export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'hi'];

/** Type-guard for safe locale parsing from storage/URL. */
export function isLocale(value: unknown): value is LocaleCode {
  return typeof value === 'string' && (SUPPORTED_LOCALES as string[]).includes(value);
}
