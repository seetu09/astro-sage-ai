export type LocaleCode = 'en' | 'hi';

export interface ReportPageTitles {
  birthDetailsPanchang: string;
  birthChartPlanetaryPositions: string;
  kpDetailsDasha: string;
  divisionalChartsAshtakvarga: string;
  yogasDoshasRemedies: string;
  lagnaChart: string;
  navamsaChart: string;
  planetaryPositionsTable: string;
  kpAnalysis: string;
  mahadashaTimeline: string;
  antardashaDetails: string;
  drekkana: string;
  chaturthamsa: string;
  saptamsa: string;
  dasamsa: string;
  bhinnashtakvarga: string;
  sarvashtakvarga: string;
  activeYogas: string;
  doshaAnalysis: string;
  personalSummary: string;
}

export interface ReportPanchang {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  paksha: string;
}

export interface ReportTableHeaders {
  planet: string;
  degree: string;
  sign: string;
  house: string;
  retrograde: string;
  combust: string;
  total: string;
}

export interface ReportMetadata {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  lagna: string;
  rashi: string;
}

export interface ReportFooter {
  pageOf: string;
  confidentialReport: string;
  disclaimer: string;
}

export interface ReportDictionary {
  pageTitles: ReportPageTitles;
  panchang: ReportPanchang;
  tableHeaders: ReportTableHeaders;
  metadata: ReportMetadata;
  footer: ReportFooter;
  messages: ReportMessages;
}

export interface ReportMessages {
  headerSubtitle: string;
  tableTotal: string;
  noActiveYogas: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
}

export const REPORT_DICTIONARY: Record<LocaleCode, ReportDictionary> = {
  en: {
    pageTitles: {
      birthDetailsPanchang: 'Birth Details & Panchang',
      birthChartPlanetaryPositions: 'Birth Chart & Planetary Positions',
      kpDetailsDasha: 'KP Details & Vimshottari Dasha',
      divisionalChartsAshtakvarga: 'Divisional Charts & Ashtakvarga',
      yogasDoshasRemedies: 'Yogas, Doshas & Remedies',
      lagnaChart: 'Lagna Chart (D1)',
      navamsaChart: 'Navamsa Chart (D9)',
      planetaryPositionsTable: 'Planetary Positions Table',
      kpAnalysis: 'KP Analysis',
      mahadashaTimeline: 'Mahadasha Timeline',
      antardashaDetails: 'Antardasha Details',
      drekkana: 'Drekkana (D3)',
      chaturthamsa: 'Chaturthamsa (D4)',
      saptamsa: 'Saptamsa (D7)',
      dasamsa: 'Dasamsa (D10)',
      bhinnashtakvarga: 'Bhinnashtakvarga',
      sarvashtakvarga: 'Sarvashtakvarga',
      activeYogas: 'Active Yogas',
      doshaAnalysis: 'Dosha Analysis',
      personalSummary: 'Personal Horoscope Summary',
    },
    panchang: {
      tithi: 'Tithi',
      nakshatra: 'Nakshatra',
      yoga: 'Yoga',
      karana: 'Karana',
      paksha: 'Paksha',
    },
    tableHeaders: {
      planet: 'Planet',
      degree: 'Degree',
      sign: 'Sign',
      house: 'House',
      retrograde: 'Retrograde',
      combust: 'Combust',
      total: 'Total',
    },
    metadata: {
      name: 'Name',
      dob: 'Date of Birth',
      tob: 'Time of Birth',
      pob: 'Place of Birth',
      lagna: 'Lagna',
      rashi: 'Rashi',
    },
    footer: {
      pageOf: 'Page {x} of {y}',
      confidentialReport: 'Confidential Report',
      disclaimer: 'This report is for informational purposes only.',
    },
    messages: {
      headerSubtitle: 'Vedic Kundli Report',
      tableTotal: 'Total',
      noActiveYogas: 'No active yogas detected.',
      ascendant: 'Ascendant',
      moonSign: 'Moon Sign',
      sunSign: 'Sun Sign',
    },
  },
  hi: {
    pageTitles: {
      birthDetailsPanchang: 'जन्म विवरण एवं पंचांग',
      birthChartPlanetaryPositions: 'जन्म कुंडली एवं ग्रह स्थिति',
      kpDetailsDasha: 'केपी विवरण एवं विंशोत्तरी दशा',
      divisionalChartsAshtakvarga: 'शोडश वर्ग एवं अष्टकवर्ग',
      yogasDoshasRemedies: 'योग, दोष एवं उपाय',
      lagnaChart: 'लग्न चार्ट (D1)',
      navamsaChart: 'नवमांश चार्ट (D9)',
      planetaryPositionsTable: 'ग्रह स्थिति तालिका',
      kpAnalysis: 'केपी विश्लेषण',
      mahadashaTimeline: 'महादशा समयरेखा',
      antardashaDetails: 'अंतर्दशा विवरण',
      drekkana: 'द्रेष्काण (D3)',
      chaturthamsa: 'चतुर्थांश (D4)',
      saptamsa: 'सप्तमांश (D7)',
      dasamsa: 'दशमांश (D10)',
      bhinnashtakvarga: 'भिन्नाष्टकवर्ग',
      sarvashtakvarga: 'सर्वाष्टकवर्ग',
      activeYogas: 'सक्रिय योग',
      doshaAnalysis: 'दोष विश्लेषण',
      personalSummary: 'व्यक्तिगत जन्मफल सारांश',
    },
    panchang: {
      tithi: 'तिथि',
      nakshatra: 'नक्षत्र',
      yoga: 'योग',
      karana: 'करण',
      paksha: 'पक्ष',
    },
    tableHeaders: {
      planet: 'ग्रह',
      degree: 'अंश',
      sign: 'राशि',
      house: 'भाव',
      retrograde: 'वक्रीगति',
      combust: 'दग्ध',
      total: 'योग',
    },
    metadata: {
      name: 'नाम',
      dob: 'जन्म तिथि',
      tob: 'जन्म समय',
      pob: 'जन्म स्थान',
      lagna: 'लग्न',
      rashi: 'राशि',
    },
    footer: {
      pageOf: 'पृष्ठ {x} / {y}',
      confidentialReport: 'गोपनीय रिपोर्ट',
      disclaimer: 'यह रिपोर्ट केवल सूचना के उद्देश्य से है।',
    },
    messages: {
      headerSubtitle: 'वैदिक कुंडली रिपोर्ट',
      tableTotal: 'योग',
      noActiveYogas: 'कोई सक्रिय योग नहीं मिला।',
      ascendant: 'लग्न',
      moonSign: 'चंद्र राशि',
      sunSign: 'सूर्य राशि',
    },
  },
};

export function getReportDictionary(lang: LocaleCode): ReportDictionary {
  return REPORT_DICTIONARY[lang] ?? REPORT_DICTIONARY.en;
}

export function fillReportTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`
  );
}
