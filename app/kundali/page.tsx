'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Info,
  Sparkles,
  Loader2,
  AlertTriangle,
  X,
  MapPin,
  Sun,
  Moon,
  Lock,
} from 'lucide-react';
import NorthIndianChart from '@/app/components/NorthIndianChart';
import KundaliPaywallBanner from '@/app/components/KundaliPaywallBanner';
import PlaceAutocomplete from '@/app/components/PlaceAutocomplete';
import ReportContainer from '@/app/components/ReportContainer';
import KundaliView from '@/app/components/KundaliView';
import KundaliLoadingSkeleton from '@/app/components/KundaliLoadingSkeleton';
import Preview from './components/Preview';
import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import { useApp } from '@/app/context/AppContext';
import { useToast } from '@/app/components/ToastProvider';
import {
  localizePlanet,
  localizeSign,
  getChartTypeLabel,
  NAKSHATRA_NAMES,
  NAKSHATRA_LORDS,
} from '@/lib/astrologyDictionary';
import { useAuth } from '@/app/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { resolveBirthTime } from '@/lib/astrology';
import { saveKundaliHistory } from '@/lib/user-history';
import { trackEvent } from '@/lib/analytics';
import { FreeTierData, PaidTierData, DashaRoadmapEntry, type KundliCalculations, type RichMilestone, type RichPredictionReport } from '@/types/kundali';
import type { PreviewBirthData } from './components/Preview';
import type { LifePillarConfig } from '@/lib/pillarNarratives';
import { ReportData } from '@/lib/pdfHtmlTemplate';

interface Planet {
  name: string;
  sign: string;
  house: number;
  degree: number;
  status: string;
  nakshatra?: string;
  pada?: number;
}

interface HouseSign {
  house: number;
  sign: number; // 1-12
}

interface KundliData {
  name: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: Planet[];
  houses?: HouseSign[];
  interpretation?: string;
  /** Raw flat chart data returned by the API (binds summary cards + SVG chart) */
  chartData?: {
    lagna?: string;
    ascendant?: string;
    rashi?: string;
    moonSign?: string;
    sunSign?: string;
    nakshatra?: string;
    timezone?: string;
    houses?: { house: number; sign: string; planets: string[] }[];
    planets?: {
      name: string;
      sign: string;
      house: number;
      degree: string;
      nakshatra: string;
      retrograde: boolean;
    }[];
  };
  /** Structured free tier (core personality, top careers, wealth type, running dasha). */
  freeTier?: FreeTierData;
  /** Structured paid tier (gated: full breakdown, timings, remedies, yogas, doshas). */
  paidTier?: PaidTierData;
  /** Six AI Life-Pillar narratives returned by the single-shot report generation. */
  pillars?: LifePillarConfig[];
  /** Dedicated rich-prediction AI output (deep ~250/200-word domain narratives). */
  richPredictions?: RichPredictionReport;
}

const EMPTY_FREE_TIER: FreeTierData = {
  corePersonality: { ascendant: '', moonSign: '', sunSign: '', nakshatra: '', summary: '' },
  topCareers: [],
  wealthType: '',
  runningDashaName: '',
};

const EMPTY_PAID_TIER: PaidTierData = {
  careerTimings: { overview: '', favorable: [], challenging: [] },
  marriageDynamics: { overview: '', strengths: [], challenges: [], favorable: [] },
  wealthAllocation: { overview: '', allocation: [] },
  dashaRoadmap: [],
  yogas: [],
  doshas: [],
  remedies: [],
  fullBreakdown: [],
  timings: [],
  lifeDomains: {
    career: { overview: '', strengths: [], challenges: [], recommendations: [] },
    wealth: { overview: '', strengths: [], challenges: [], recommendations: [] },
    marriage: { overview: '', strengths: [], challenges: [], recommendations: [] },
    health: { overview: '', strengths: [], challenges: [], recommendations: [] },
  },
};

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];


// --- Helper: localize a nakshatra name to the selected language ---
function localizeNakshatra(nakshatra: string, locale: 'en' | 'hi'): string {
  const enIndex = nakshatras.indexOf(nakshatra);
  if (enIndex !== -1) {
    return NAKSHATRA_NAMES[locale]?.[enIndex] ?? nakshatra;
  }
  return nakshatra;
}

// --- Helper: clean up "Unknown" / empty values so they never display ---
function cleanAstroValue(value: string | undefined | null): string {
  if (!value || value === 'Unknown' || value === 'unknown') return '';
  return value;
}

// --- Helper: extract the English part from a bilingual value like "Aquarius (कुंभ)" ---
function extractEnglishPart(value: string | undefined | null): string {
  const cleaned = cleanAstroValue(value);
  if (!cleaned) return '';
  // Strip the "(...)" Hindi suffix if present
  const match = cleaned.match(/^([^(]+?)(?:\s*\([^)]*\))?$/);
  return match ? match[1].trim() : cleaned;
}

// --- Helper: localize a sign and clean up "Unknown" ---
// Handles bilingual values like "Aquarius (कुंभ)" by extracting the English part first
function localizeSignClean(sign: string | undefined | null, locale: 'en' | 'hi'): string {
  const english = extractEnglishPart(sign);
  if (!english) return '';
  return localizeSign(english, locale);
}

// --- Helper: localize a nakshatra and clean up "Unknown" ---
// Handles bilingual values like "Shravana (श्रवण)" by extracting the English part first
function localizeNakshatraClean(nakshatra: string | undefined | null, locale: 'en' | 'hi'): string {
  const english = extractEnglishPart(nakshatra);
  if (!english) return '';
  return localizeNakshatra(english, locale);
}

// --- Helper: safely convert a sign name to a 1-12 index (0 if unknown) ---
function signToIndex(sign: string | undefined | null): number {
  const cleaned = cleanAstroValue(sign);
  if (!cleaned) return 0;
  const idx = signs.indexOf(cleaned);
  return idx === -1 ? 0 : idx + 1;
}

// --- Helper: parse a degree value that may be a number or "DD°MM'" string ---
function parseDegree(degree: string | number | undefined | null): number {
  if (typeof degree === 'number') return degree;
  if (typeof degree === 'string') {
    const match = degree.match(/^(\d+)°/);
    if (match) return parseFloat(match[1]);
    const parsed = parseFloat(degree);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// --- Helper: derive the weekday (Vara) from an ISO birth date ---
function weekdayFromDate(dateStr: string | undefined | null, locale: 'en' | 'hi'): string {
  const cleaned = cleanAstroValue(dateStr);
  if (!cleaned) return '--';
  const d = new Date(cleaned);
  if (isNaN(d.getTime())) return '--';
  const names: Record<'en' | 'hi', string[]> = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  };
  // Date-only ISO strings parse as UTC midnight — use getUTCDay() so the
  // calendar weekday is timezone-independent.
  return names[locale][d.getUTCDay()] ?? '--';
}

// --- Helper: Nakshatra lord (English) for a birth nakshatra value ---
function nakshatraLordFor(nakshatra: string | undefined | null): string {
  const english = extractEnglishPart(nakshatra);
  if (!english) return '';
  const idx = NAKSHATRA_NAMES.en.indexOf(english.trim());
  return idx >= 0 ? NAKSHATRA_LORDS[idx] ?? '' : '';
}

// --- Helper: localize the birth-nakshatra lord (falls back to '') ---
function localizeNakshatraLordClean(nakshatra: string | undefined | null, locale: 'en' | 'hi'): string {
  const lord = nakshatraLordFor(nakshatra);
  return lord ? localizePlanet(lord, locale) : '';
}

// --- Helper: extract the Navamsa (D9) matrix for the PDF template ---
// Reads defensively off the stored generate-response so a missing calculations
// layer simply yields undefined (the PDF skips that block).
function extractD9Chart(src: unknown): ReportData['d9Chart'] {
  const calcs = (src as { calculations?: KundliCalculations } | null | undefined)?.calculations;
  const d9 = calcs?.divisionalCharts?.D9;
  if (!d9) return undefined;
  return {
    ascendantSign: Number(d9.ascendantSign) || 1,
    planets: (d9.planetCoordinates ?? []).map((p) => ({
      planet: String(p.planet ?? ''),
      sign: Number(p.sign) || 1,
      house: Number(p.house) || 1,
      retrograde: Boolean(p.retrograde),
    })),
  };
}

// --- Helper: extract Sarvashtakavarga bindus for the PDF template ---
function extractSarvashtakavarga(src: unknown): ReportData['sarvashtakavarga'] {
  const sav = (src as { calculations?: KundliCalculations } | null | undefined)?.calculations
    ?.ashtakavarga;
  if (!sav?.sarvashtakavarga?.length) return undefined;
  return {
    bindus: sav.sarvashtakavarga.map(Number),
    beneficialHouses: (sav.beneficialHouses ?? []).map(Number),
  };
}


export default function KundaliPage() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { selectedLanguage, isPaid } = useApp();
  // State guard: isPaid defaults to false in AppContext; coerce undefined/null to false (locked)
  const isPaidSafe = !!isPaid;
  console.log("[PAYWALL] User tier:", isPaid);
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [timezone, setTimezone] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [kundliData, setKundliData] = useState<KundliData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKind, setErrorKind] = useState<'geocode' | 'network' | 'generic'>('generic');
  const { profile, saveProfile } = useUserProfile();

  // Pre-fill saved profile data on mount
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDateOfBirth(profile.dob || '');
      setTimeOfBirth(profile.tob || '');
      setTimeUnknown(profile.timeUnknown || false);
      setPlaceOfBirth(profile.city || '');
      if (profile.lat != null) setLatitude(profile.lat);
      if (profile.lon != null) setLongitude(profile.lon);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Client-side validation (before hitting the API) ──

    const dateTaken = dateOfBirth.trim();
    if (!dateTaken) {
      setErrorKind('generic');
      setError(t('kundali.errors.selectDate'));
      return;
    }
    const parsedDate = new Date(dateTaken);
    if (Number.isNaN(parsedDate.getTime())) {
      setErrorKind('generic');
      setError(t('kundali.errors.invalidDate'));
      return;
    }
    // Reject future birth dates.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate > today) {
      setErrorKind('generic');
      setError(t('kundali.errors.futureDate'));
      return;
    }

    if (!timeUnknown && !timeOfBirth.trim()) {
      setErrorKind('generic');
      setError(t('kundali.errors.selectTime'));
      return;
    }

    if (!placeOfBirth.trim()) {
      setErrorKind('generic');
      setError(t('kundali.errors.enterPlace'));
      return;
    }

    trackEvent('kundali_generated', { has_birth_time: !timeUnknown });
    // Graceful guard: geocoded coordinates are required for accurate computation
    if (latitude == null || longitude == null) {
      setErrorKind('geocode');
      setError(t('kundali.errors.geocodePlace'));
      return;
    }

    const resolvedTime = resolveBirthTime(timeOfBirth, timeUnknown);
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/kundali/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: dateOfBirth,
          birthTime: resolvedTime,
          birthPlace: placeOfBirth,
          latitude,
          longitude,
          timezoneOffset: timezone || '+05:30',
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate kundali');
      }

      const result = await response.json();
      const chartData = result.chartData;

      // Defensive guard: bail out into the catch block (which sets `error`
      // state) instead of letting a TypeError bubble up and crash React
      // when the API returns a malformed/unexpected payload.
      if (!chartData || typeof chartData !== 'object' || !Array.isArray(chartData.planets)) {
        throw new Error('Invalid chart data received from the server');
      }

      const data: KundliData = {
        name,
        email,
        dateOfBirth,
        timeOfBirth: resolvedTime,
        placeOfBirth,
        latitude,
        longitude,
        timezone,
        // Bind to both English and Hindi keys from the flat chartData.
        // extractEnglishPart strips the "(कुंभ)" suffix so signToIndex works,
        // while the raw bilingual string is preserved in data.chartData for display.
        ascendant:
          extractEnglishPart(chartData?.lagna) ||
          extractEnglishPart(chartData?.ascendant) ||
          '',
        moonSign:
          extractEnglishPart(chartData?.rashi) ||
          extractEnglishPart(chartData?.moonSign) ||
          '',
        sunSign: extractEnglishPart(chartData?.sunSign) || '',
        nakshatra: extractEnglishPart(chartData?.nakshatra) || '',
        planets: (chartData?.planets ?? []).map((p: any) => ({
          name: p?.name || '',
          sign: cleanAstroValue(p?.sign) || '',
          house: p?.house ?? 0,
          degree: typeof p?.degree === 'string' ? parseFloat(p.degree) || 0 : p?.degree ?? 0,
          status: p?.retrograde ? 'Retrograde' : 'Direct',
          nakshatra: cleanAstroValue(p?.nakshatra) || undefined,
          pada: p?.pada,
        })),
        houses: Array.isArray(chartData?.houses)
          ? chartData.houses.map((h: any) => ({ house: h?.house ?? 0, sign: signToIndex(h?.sign) }))
          : undefined,
        interpretation: typeof result.interpretation === 'string' ? result.interpretation : '',
        freeTier: (result.freeTier as FreeTierData) ?? EMPTY_FREE_TIER,
        paidTier: (result.paidTier as PaidTierData) ?? EMPTY_PAID_TIER,
        pillars: Array.isArray(result.pillars) && result.pillars.length === 6
          ? (result.pillars as LifePillarConfig[])
          : undefined,
        richPredictions: (result.richPredictions as RichPredictionReport | null | undefined) ?? undefined,
        // Store the raw flat chartData for direct binding in summary cards + SVG chart
        chartData: {
          lagna: chartData?.lagna,
          ascendant: chartData?.ascendant,
          rashi: chartData?.rashi,
          moonSign: chartData?.moonSign,
          sunSign: chartData?.sunSign,
          nakshatra: chartData?.nakshatra,
          timezone: chartData?.timezone,
          houses: Array.isArray(chartData?.houses)
            ? chartData.houses.map((h: any) => ({
                house: h?.house ?? 0,
                sign: h?.sign ?? '',
                planets: Array.isArray(h?.planets) ? h.planets : [],
              }))
            : undefined,
          planets: Array.isArray(chartData?.planets)
            ? chartData.planets.map((p: any) => ({
                name: p?.name || '',
                sign: p?.sign || '',
                house: p?.house ?? 0,
                degree: p?.degree ?? '',
                nakshatra: p?.nakshatra || '',
                retrograde: p?.retrograde ?? false,
              }))
            : undefined,
        },
      };


      setKundliData(data);
      setShowResult(true);
      toast.success(t('kundali.errors.success'));

      // Persist birth details for reuse across Kundali, Matchmaking & Chat
      saveProfile({
        name,
        dob: dateOfBirth,
        tob: resolvedTime,
        city: placeOfBirth,
        lat: latitude,
        lon: longitude,
        timeUnknown,
      });
      if (user) {
        saveKundaliHistory({
          id: `kundali-${Date.now()}`,
          userId: user.id,
          createdAt: new Date().toISOString(),
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          timeOfBirth: data.timeOfBirth,
          placeOfBirth: data.placeOfBirth,
          ascendant: data.ascendant,
          moonSign: data.moonSign,
          sunSign: data.sunSign,
          nakshatra: data.nakshatra,
          // Coordinates let the dashboard rebuild this exact chart server-side
          // for the "Download Full 25-Page Kundli" flow without re-geocoding.
          latitude,
          longitude,
          timezoneOffset: timezone || '+05:30',
        });
      }
    } catch (err) {
      console.error('Kundali generation error:', err);
      // Network failures surface as TypeError from fetch — show a friendlier banner
      const isNetworkError = err instanceof TypeError;
      setErrorKind(isNetworkError ? 'network' : 'generic');
      const errorMsg = isNetworkError
        ? t('kundali.errors.network')
        : t('kundali.errors.generic');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Defensive rendering guard: only draw the SVG chart, planet tables and
  // analysis sections when a non-empty planets array actually exists.
  const hasPlanets =
    !!kundliData && Array.isArray(kundliData.planets) && kundliData.planets.length > 0;

  // Build ReportData for the client-side iframe print-to-PDF
  const reportData: ReportData | null = kundliData ? {
    clientName: kundliData?.name || name,
    chartType: t('kundali.northIndian'),
    birthDetails: {
      date: kundliData?.dateOfBirth || '',
      time: kundliData?.timeOfBirth || '',
      latitude: kundliData?.latitude != null ? kundliData.latitude.toFixed(4) : '',
      longitude: kundliData?.longitude != null ? kundliData.longitude.toFixed(4) : '',
      timezone: kundliData?.chartData?.timezone || kundliData?.timezone || '',
    },
    planetaryPositions: (kundliData?.planets ?? []).map((p) => ({
      body: p.name || '',
      sign: p.sign || '',
      degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : String(p.degree || ''),
      house: String(p.house || ''),
      retro: p.status === 'Retrograde',
    })),
    houseCusps: (kundliData?.houses ?? []).map((h) => ({
      house: h?.house ?? 0,
      sign: String(h?.sign ?? ''),
      degree: '',
    })),
    dashaPeriods: (kundliData?.paidTier?.dashaRoadmap ?? []).map((d) => ({
      mahaDasha: d.lord,
      startYear: d.startDate.split('-')[0],
      endYear: d.endDate.split('-')[0],
      subPeriod: d.theme,
    })),
    yogas: (kundliData?.paidTier?.yogas ?? []).map((y) => ({
      name: y.name,
      description: y.description,
    })),
    remedies: [
      ...(kundliData?.paidTier?.remedies ?? []).map((r) => ({
        category: r.type,
        description: r.description,
      })),
      // Rich AI remedy kit — daily mantras + gemstone digest.
      ...(kundliData?.paidTier?.remedyKit?.dailyMantras ?? []).map((m) => ({
        category: t('kundali.dailyMantra'),
        description: m,
      })),
      ...((kundliData?.paidTier?.remedyKit?.gemstones ?? []).length
        ? [{
            category: t('kundali.gemstoneSuggestion'),
            description: (kundliData?.paidTier?.remedyKit?.gemstones ?? []).join(' · '),
          }]
        : []),
    ],
    domainInsights: Object.entries(kundliData?.paidTier?.lifeDomains ?? {})
      .filter(([domain]) => ['career', 'wealth', 'marriage', 'health'].includes(domain))
      .map(([domain, insight]) => {
        const milestones: RichMilestone[] = insight.milestones ?? [];
        return {
          domain: domain as 'career' | 'wealth' | 'marriage' | 'health',
          prediction: kundliData?.richPredictions?.[domain as 'career' | 'wealth' | 'marriage' | 'health']?.narrative || insight.overview || '',
          analysis:
            milestones.map((m) => `${m.period}: ${m.event}`).join(' • ') ||
            insight.recommendations?.join('. ') ||
            '',
          timeframe: milestones[0]?.period,
        };
      }),
    // Six AI Life-Pillar narratives → each renders as its own localized
    // appendix page in the A4 PDF (skipped entirely when absent).
    narratives: kundliData?.pillars || [],
    northIndianChartSvg: '',
    kalpurushaPhalDeepikaRefs: [],
    scorecard: [],
    // Dense-layout extras — Panchang strip, D9 matrix and Ashtakavarga grid.
    // All optional; the PDF template skips blocks whose data is absent.
    panchang: {
      varaWeekday: weekdayFromDate(kundliData?.dateOfBirth, selectedLanguage),
      nakshatra: cleanAstroValue(kundliData?.chartData?.nakshatra || kundliData?.nakshatra),
      nakshatraLord: nakshatraLordFor(
        kundliData?.chartData?.nakshatra || kundliData?.nakshatra
      ),
      moonSign: cleanAstroValue(kundliData?.chartData?.rashi || kundliData?.moonSign),
      sunSign: cleanAstroValue(kundliData?.chartData?.sunSign || kundliData?.sunSign),
      lagna: cleanAstroValue(
        kundliData?.chartData?.lagna ||
          kundliData?.chartData?.ascendant ||
          kundliData?.ascendant
      ),
    },
    d9Chart: extractD9Chart(kundliData),
        sarvashtakavarga: extractSarvashtakavarga(kundliData),
    isPaidTier: isPaidSafe,
  } : null;

  // Raw birth details handed to the free-tier <Preview> for its client-side
  // Lagna/Moon/Sun computation and the /api/kundali/generate yoga fetch.
  const previewBirthData: PreviewBirthData | null = kundliData &&
    kundliData.latitude != null && kundliData.longitude != null
    ? {
        dateOfBirth: kundliData.dateOfBirth,
        timeOfBirth: kundliData.timeOfBirth,
        latitude: kundliData.latitude,
        longitude: kundliData.longitude,
        timezoneOffset: timezone || '+05:30',
      }
    : null;
  const runningDashaEntry: DashaRoadmapEntry | null =
    kundliData?.paidTier?.dashaRoadmap?.find((d) => d.lord) ?? null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-[#F8F7FC] dark:bg-[#080811]">
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {isLoading ? (
          /* Animated skeleton while POST /api/kundali/generate is fetching */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <KundaliLoadingSkeleton />
          </motion.div>
        ) : !showResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/20 mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-violet-700 dark:text-[#FFD166]" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
                {t('kundali.generateTitle')}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-[#9CA3AF] px-2">
                {t('kundali.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 glass-card p-4 sm:p-6 lg:p-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t('kundali.fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('kundali.namePlaceholder')}
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t('kundali.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('kundali.emailPlaceholder')}
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t('kundali.dateOfBirth')}</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm [color-scheme:light] dark:[color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t('kundali.timeOfBirth')}</label>
                  <input
                    type="time"
                    value={timeUnknown ? '12:00' : timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    disabled={timeUnknown}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <label className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timeUnknown}
                      onChange={(e) => {
                        setTimeUnknown(e.target.checked);
                        if (e.target.checked) setTimeOfBirth('12:00');
                      }}
                      className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 accent-violet-600 dark:accent-[#FFD166]"
                    />
                    {t('kundali.timeUnknown')}
                  </label>
                  {timeUnknown && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
                      <Info className="w-3 h-3 shrink-0" />
                      {t('kundali.noonReferenceBadge')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t('kundali.placeOfBirth')}</label>
                <div className="relative">
                  <PlaceAutocomplete
                    value={placeOfBirth}
                    onChange={setPlaceOfBirth}
                    onSelect={(place) => {
                      setLatitude(place.latitude);
                      setLongitude(place.longitude);
                      setTimezone(place.timezone);
                    }}
                    onClear={() => {
                      setLatitude(null);
                      setLongitude(null);
                      setTimezone("");
                    }}
                    latitude={latitude}
                    longitude={longitude}
                    onLatitudeChange={setLatitude}
                    onLongitudeChange={setLongitude}
                    placeholder={t('kundali.placePlaceholder')}
                    inputClassName="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                    required
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className={`flex items-start gap-2 text-xs sm:text-sm rounded-lg px-3 py-2.5 border ${
                    errorKind === 'geocode'
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : errorKind === 'network'
                        ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/25'
                        : 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
                  }`}
                >
                  {errorKind === 'geocode' ? (
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  )}
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    aria-label={t('kundali.dismissError')}
                    className="ml-auto shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    {t('kundali.generating')}
                  </span>
                ) : (
                  t('kundali.generateButton')
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <>
          {/* ── FREE PREVIEW (basic details + panchang snapshot + D1 preview + locked grid + CTA) ── */}
          {!isPaidSafe && kundliData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
                  {t('kundali.birthChart')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {t('kundali.sections.generatedFor').replace('{name}', kundliData?.name || '')}
                </p>
                {timeUnknown && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
                    <Info className="w-3 h-3 shrink-0" />
                    {t('kundali.noonReferenceBadge')}
                  </p>
                )}
              </div>

              {/* Real-data wired preview: Lagna/Moon/Sun (client-side Lahiri),
                  Dasha, yogas fetched from the generate API, 50-char locked
                  teasers over real narratives, blur gating, /payment CTA */}
              {previewBirthData && (
                <Preview
                  birthData={previewBirthData}
                  dasha={runningDashaEntry}
                  paidTier={kundliData.paidTier}
                  richPredictions={kundliData.richPredictions}
                  showHeader={false}
                />
              )}

              {/* Basic Kundli Details card (free tier) */}
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
                  <span className="truncate">
                    {t('kundali.sections.basicDetails')}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    {
                      label: t('kundali.name'),
                      value: kundliData?.name || '--',
                    },
                    { label: t('kundali.dateOfBirth'), value: kundliData?.dateOfBirth || '--' },
                    { label: t('kundali.timeOfBirth'), value: kundliData?.timeOfBirth || '--' },
                    { label: t('kundali.placeOfBirth'), value: kundliData?.placeOfBirth || '--' },
                    {
                      label: t('kundali.coordinates'),
                      value:
                        kundliData?.latitude != null && kundliData?.longitude != null
                          ? `${kundliData.latitude.toFixed(4)}, ${kundliData.longitude.toFixed(4)}`
                          : '--',
                    },
                    {
                      label: t('kundali.ascendant'),
                      value:
                        localizeSignClean(
                          kundliData.chartData?.lagna ||
                            kundliData.chartData?.ascendant ||
                            kundliData.ascendant,
                          selectedLanguage
                        ) || '--',
                    },
                    {
                      label: t('kundali.moonSign'),
                      value:
                        localizeSignClean(
                          kundliData.chartData?.rashi || kundliData.chartData?.moonSign || kundliData.moonSign,
                          selectedLanguage
                        ) || '--',
                    },
                    {
                      label: t('kundali.nakshatra'),
                      value:
                        localizeNakshatraClean(
                          kundliData.chartData?.nakshatra || kundliData.nakshatra,
                          selectedLanguage
                        ) || '--',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-2.5 sm:p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10"
                    >
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-[#6B7280] truncate">
                        {item.label}
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5 truncate">
                        {item.value || '--'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panchang Snapshot card (free tier — Tithi/Yoga/Karana populate in premium) */}
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
                  <span className="truncate">
                    {t('kundali.panchangSnapshot')}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    {
                      label: t('kundali.tithi'),
                      value: '--',
                    },
                    {
                      label: t('kundali.vara'),
                      value: weekdayFromDate(kundliData?.dateOfBirth, selectedLanguage),
                    },
                    {
                      label: t('kundali.nakshatra'),
                      value:
                        localizeNakshatraClean(
                          kundliData?.chartData?.nakshatra || kundliData?.nakshatra,
                          selectedLanguage
                        ) || '--',
                    },
                    {
                      label: t('kundali.yoga'),
                      value: '--',
                    },
                    {
                      label: t('kundali.karana'),
                      value: '--',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl p-2.5 sm:p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10"
                    >
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-[#6B7280] truncate">
                        {item.label}
                      </p>
                      <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5 truncate">
                        {item.value || '--'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* D1 Lagna Chart preview (free tier — capped 300px, non-downloadable; D9/D10/D60 premium) */}
              {hasPlanets && (
                <div className="glass-card rounded-xl p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-violet-600 dark:text-[#FFD166] shrink-0" />
                      <span className="truncate">{getChartTypeLabel('D1', selectedLanguage)}</span>
                    </span>
                    <Lock className="w-4 h-4 text-slate-400 dark:text-[#6B7280] shrink-0" />
                  </div>

                  {/* Non-downloadable preview: interaction disabled, height capped at 300px */}
                  <div className="max-h-[300px] overflow-hidden pointer-events-none select-none">
                    <NorthIndianChart
                      chartData={{
                        ascendantSign: signToIndex(kundliData?.ascendant),
                        ascendantDegree: 15,
                        planets: (kundliData?.chartData?.planets ?? []).map((p) => ({
                          planet: p.name,
                          sign: signToIndex(p.sign),
                          degree: parseDegree(p.degree),
                          retrograde: p.retrograde,
                          nakshatra: cleanAstroValue(p.nakshatra) || undefined,
                        })),
                        houses: (kundliData?.chartData?.houses ?? []).map((h) => ({
                          house: h.house,
                          sign: signToIndex(h.sign),
                        })),
                      }}
                      type="D1"
                      language={selectedLanguage}
                    />
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#9CA3AF] text-center mt-3">
                    {t('kundali.unlockCharts')}
                  </p>
                </div>
              )}

              {/* Locked life-domain grid (free tier) — Career/Marriage/Wealth/Health/Education/Family */}
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
                  <span className="truncate">
                    {t('kundali.premiumPredictions')}
                  </span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {([ 'career', 'marriage', 'wealth', 'health', 'education', 'family' ] as const).map((domainKey) => (
                    <div
                      key={domainKey}
                      className="rounded-xl p-3 sm:p-4 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 opacity-60 flex flex-col items-center justify-center gap-1.5 text-center"
                    >
                      <Lock className="w-4 h-4 text-slate-400 dark:text-[#6B7280]" />
                      <p className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6] truncate w-full">
                        {t(`kundali.${domainKey}`)}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-[#6B7280]">
                        {t('kundali.availableInPremium')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent CTA banner (free tier) — Unlock Full 25-Page Kundli Report ₹49 */}
              <KundaliPaywallBanner
                userEmail={kundliData?.email || email}
                userName={kundliData?.name || name}
              />
            </motion.div>
          )}
          {isPaidSafe && (
            <>
            <ReportContainer
              userEmail={kundliData?.email || email}
              userName={kundliData?.name || name}
              reportData={reportData ?? undefined}
            >
          {/* ── Tabbed full premium dashboard (Career / Marriage / Wealth / Dasha + A4 report) ── */}
          <KundaliView
            freeTier={kundliData?.freeTier ?? EMPTY_FREE_TIER}
            paidTier={kundliData?.paidTier ?? EMPTY_PAID_TIER}
            pillars={kundliData?.pillars}
            userEmail={kundliData?.email || email}
            userName={kundliData?.name || name}
            birthDetails={{
              date: kundliData?.dateOfBirth || '',
              time: kundliData?.timeOfBirth || '',
              latitude: kundliData?.latitude != null ? kundliData.latitude.toFixed(2) : '',
              longitude: kundliData?.longitude != null ? kundliData.longitude.toFixed(2) : '',
              timezone: kundliData?.chartData?.timezone || 'IST (+05:30)',
            }}
            planets={kundliData?.planets?.map((p) => ({
              body: p.name || '',
              sign: p.sign || '',
              degree: typeof p.degree === 'number' ? p.degree.toFixed(2) : String(p.degree || ''),
              house: String(p.house || ''),
              retro: p.status === 'Retrograde',
            })) || []}
            houseCusps={kundliData?.houses?.map((h) => ({
              house: h.house || 0,
              sign: String(h.sign || ''),
              degree: '',
            })) || []}
          />
          </ReportContainer>
          </>
          )}
          </>
        )}
      </div>
    </div>
  );
}
