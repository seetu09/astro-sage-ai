'use client';

import type { ReportData } from '@/lib/pdfHtmlTemplate';
import type { KundliCalculations } from '@/types/kundali';
import {
  ZODIAC_SIGNS,
  PLANET_NAMES,
  NAKSHATRA_NAMES,
  NAKSHATRA_LORDS,
  SIGN_LORDS,
} from '@/lib/astrologyDictionary';

/**
 * ReportModel — the single normalized shape the modular A4 report consumes.
 *
 * It transparently maps the existing `ReportData` (screen/PDF contract) and the
 * deterministic `KundliCalculations` layer into one object, so every section
 * component stays decoupled from the API shape. All fields are optional so the
 * renderer degrades gracefully for partial data.
 */
export interface ReportModel {
  clientName: string;
  chartType: string;
  language: 'en' | 'hi';
  birthDetails?: ReportData['birthDetails'];
  /** Planetary positions (Graha Sthiti): body/sign/degree/house. */
  planetaryPositions: ReportData['planetaryPositions'];
  houseCusps: ReportData['houseCusps'];
  dashaPeriods: ReportData['dashaPeriods'];
  yogas: ReportData['yogas'];
  remedies: ReportData['remedies'];
  domainInsights: ReportData['domainInsights'];
  northIndianChartSvg: string;
  /** Deterministic calculation layer (ashtakavarga, vimshottari, doshas…). */
  calculations?: KundliCalculations;
  /** Marked premium when unlocked via payment. */
  isPaidTier: boolean;
}

/**
 * Build a normalized ReportModel from the raw ReportData + optional
 * KundliCalculations payload.
 */
export function buildReportModel(
  data: ReportData,
  calcs?: KundliCalculations,
  language: 'en' | 'hi' = 'en'
): ReportModel {
  return {
    clientName: data.clientName,
    chartType: data.chartType,
    language,
    birthDetails: data.birthDetails,
    planetaryPositions: data.planetaryPositions || [],
    houseCusps: data.houseCusps || [],
    dashaPeriods: data.dashaPeriods || [],
    yogas: data.yogas || [],
    remedies: data.remedies || [],
    domainInsights: data.domainInsights || [],
    northIndianChartSvg: data.northIndianChartSvg || '',
    calculations: calcs,
    isPaidTier: data.isPaidTier,
  };
}

/* Small display helpers reused by multiple sections. */

export function localizeSign(locale: 'en' | 'hi', signName: string): string {
  return ZODIAC_SIGNS[locale]?.[signName] ?? signName;
}

export function localizePlanet(locale: 'en' | 'hi', name: string): string {
  return PLANET_NAMES[locale]?.[name] ?? name;
}

export function localizeNakshatra(locale: 'en' | 'hi', name: string): string {
  // name may already be localized (Devanagari) — only remap if it matches a
  // known English nakshatra.
  if (!NAKSHATRA_NAMES.en.includes(name)) return name;
  const idx = NAKSHATRA_NAMES.en.indexOf(name);
  return NAKSHATRA_NAMES[locale][idx] ?? name;
}

/** Lord of a sign number (1-12). */
export function signLordName(locale: 'en' | 'hi', signIndex: number): string {
  return localizePlanet(locale, SIGN_LORDS[signIndex] ?? 'Moon');
}

/** Lord of a nakshatra index (0-26, or 1-27 which we normalize). */
export function nakshatraLordName(locale: 'en' | 'hi', nakIndex: number): string {
  const idx = ((nakIndex - 1) % 27 + 27) % 27; // robust to 1- vs 0-based input
  return localizePlanet(locale, NAKSHATRA_LORDS[idx] ?? 'Ketu');
}