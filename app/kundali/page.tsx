'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Info,
  Sparkles,
  Share2,
  Loader2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Sun,
  Moon,
  Star,
  ArrowUp,
} from 'lucide-react';
import ShareCard from '@/app/components/ShareCard';
import PdfTemplate from '@/app/components/PdfTemplate';
import { generateKundliPdf } from '@/lib/pdfService';
import { getUILabel } from '@/lib/astrologyDictionary';
import NorthIndianChart from '@/app/components/NorthIndianChart';
import {
  PlanetaryPositionsTable,
  KPDetailsTable,
  VimshottariDashaTimeline,
  DashaEntry,
} from '@/app/components/AstrologyTables';
import ReportContent from '@/app/components/ReportContent';
import Remedies from '@/app/components/Remedies';
import PlaceAutocomplete from '@/app/components/PlaceAutocomplete';
import ReportContainer from '@/app/components/ReportContainer';
import MarkdownView from '@/app/components/MarkdownView';
import KundaliLoadingSkeleton from '@/app/components/KundaliLoadingSkeleton';
import { useLanguage } from '@/app/context/LanguageContext';
import { useApp } from '@/app/context/AppContext';
import {
  localizePlanet,
  localizeSign,
  getChartTypeLabel,
  ChartType,
  NAKSHATRA_NAMES,
} from '@/lib/astrologyDictionary';
import { useAuth } from '@/app/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { resolveBirthTime } from '@/lib/astrology';
import { saveKundaliHistory } from '@/lib/user-history';
import { trackEvent } from '@/lib/analytics';

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
}

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

// Shown when the AI interpretation is unavailable (e.g. Gemini 404/500)
const INTERPRETATION_FALLBACK =
  'Your chart was generated successfully. Astrological reading is temporarily unavailable.';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

// Vimshottari Dasha lords and years
const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

function generateMockDasha(moonSign: string): DashaEntry[] {
  // Clamp to 0 so an unknown/empty moonSign degrades gracefully instead of
  // producing negative indices and undefined dasha lords downstream.
  const moonSignIndex = Math.max(0, signs.indexOf(moonSign));
  const nakshatraIndex = Math.floor((moonSignIndex * 30 + 15) / (360 / 27));
  const startLordIndex = ((nakshatraIndex % 9) + 9) % 9;

  const dasha: DashaEntry[] = [];
  let currentDate = new Date();

  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const years = DASHA_YEARS[lordIndex];
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    end.setFullYear(end.getFullYear() + years);

    dasha.push({
      planet: DASHA_LORDS[lordIndex],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    currentDate = end;
  }

  return dasha;
}

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

// --- Helper: localize a sign and clean up "Unknown" ---
function localizeSignClean(sign: string | undefined | null, locale: 'en' | 'hi'): string {
  const cleaned = cleanAstroValue(sign);
  if (!cleaned) return '';
  return localizeSign(cleaned, locale);
}

// --- Helper: localize a nakshatra and clean up "Unknown" ---
function localizeNakshatraClean(nakshatra: string | undefined | null, locale: 'en' | 'hi'): string {
  const cleaned = cleanAstroValue(nakshatra);
  if (!cleaned) return '';
  return localizeNakshatra(cleaned, locale);
}

// --- Helper: safely convert a sign name to a 1-12 index (0 if unknown) ---
function signToIndex(sign: string | undefined | null): number {
  const cleaned = cleanAstroValue(sign);
  if (!cleaned) return 0;
  const idx = signs.indexOf(cleaned);
  return idx === -1 ? 0 : idx + 1;
}

export default function KundaliPage() {
  const { language, t } = useLanguage();
  const { selectedLanguage } = useApp();
  const { user } = useAuth();
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
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activeChartType, setActiveChartType] = useState<ChartType>('D1');
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
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
    trackEvent('kundali_generated', { has_birth_time: !timeUnknown });
    // Graceful guard: geocoded coordinates are required for accurate computation
    if (latitude == null || longitude == null) {
      setErrorKind('geocode');
      setError(
        language === 'hi'
          ? 'कृपया सुझावों में से अपना जन्म स्थान चुनें ताकि सही निर्देशांक मिल सकें।'
          : 'Please pick your birth place from the suggestions so we get accurate coordinates.'
      );
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
        ascendant: cleanAstroValue(chartData?.ascendant) || '',
        moonSign: cleanAstroValue(chartData?.moonSign) || '',
        sunSign: cleanAstroValue(chartData?.sunSign) || '',
        nakshatra: cleanAstroValue(chartData?.nakshatra) || '',
        planets: (chartData?.planets ?? []).map((p: any) => ({
          name: p?.name || '',
          sign: cleanAstroValue(p?.sign) || '',
          house: p?.house ?? 0,
          degree: p?.degree ?? 0,
          status: p?.status || '',
          nakshatra: cleanAstroValue(p?.nakshatra) || undefined,
          pada: p?.pada,
        })),
        houses: Array.isArray(chartData?.houses)
          ? chartData.houses.map((h: any) => ({ house: h?.house ?? 0, sign: signToIndex(h?.sign) }))
          : undefined,
        interpretation: typeof result.interpretation === 'string' ? result.interpretation : '',
      };

      setKundliData(data);
      setShowResult(true);

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
        });
      }
    } catch (err) {
      console.error('Kundali generation error:', err);
      // Network failures surface as TypeError from fetch — show a friendlier banner
      const isNetworkError = err instanceof TypeError;
      setErrorKind(isNetworkError ? 'network' : 'generic');
      setError(
        isNetworkError
          ? language === 'hi'
            ? 'नेटवर्क कनेक्शन उपलब्ध नहीं है। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।'
            : 'Network request failed. Please check your connection and try again.'
          : language === 'hi'
            ? 'कुंडली बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Failed to generate kundali. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
  };

  // Defensive rendering guard: only draw the SVG chart, planet tables and
  // analysis sections when a non-empty planets array actually exists.
  const hasPlanets =
    !!kundliData && Array.isArray(kundliData.planets) && kundliData.planets.length > 0;

  // Quick "Copy Reading" — copies the full AI interpretation to the clipboard
  const handleCopyReading = async () => {
    if (!kundliData) return;
    const text = kundliData.interpretation || INTERPRETATION_FALLBACK;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — legacy fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    trackEvent('kundali_reading_copied');
    setTimeout(() => setCopied(false), 2000);
  };

  // Branded multilingual PDF export (Batch 3)
  const handleDownloadPdf = async () => {
    if (!kundliData || !pdfTemplateRef.current) return;
    setDownloadProgress({ current: 0, total: 5 });
    try {
      await generateKundliPdf({
        root: pdfTemplateRef.current,
        userName: kundliData.name,
        language: selectedLanguage,
        onProgress: (p) => setDownloadProgress(p),
      });
    } catch (err) {
      console.error("PDF Export Detailed Error:", err);
      alert(getUILabel('pdfError', selectedLanguage));
    } finally {
      setDownloadProgress(null);
    }
  };

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
                {t.kundali.generateTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-[#9CA3AF] px-2">
                {t.kundali.subtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 glass-card p-4 sm:p-6 lg:p-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t.kundali.fullName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.kundali.namePlaceholder}
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t.kundali.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.kundali.emailPlaceholder}
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t.kundali.dateOfBirth}</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm [color-scheme:light] dark:[color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t.kundali.timeOfBirth}</label>
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
                    {t.kundali.timeUnknown}
                  </label>
                  {timeUnknown && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
                      <Info className="w-3 h-3 shrink-0" />
                      {t.kundali.noonReferenceBadge}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1">{t.kundali.placeOfBirth}</label>
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
                    placeholder={language === 'hi' ? 'शहर, कस्बा या पिन कोड दर्ज करें...' : 'Enter city, town, or PIN code...'}
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
                    aria-label="Dismiss error"
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
                    {language === 'hi' ? 'कुंडली बनाई जा रही है...' : 'Generating your kundali...'}
                  </span>
                ) : (
                  t.kundali.generateButton
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <ReportContainer
            userEmail={kundliData?.email || email}
            userName={kundliData?.name || name}
            onDownload={handleDownloadPdf}
            downloadProgress={downloadProgress}
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-700 dark:hover:text-[#F3F4F6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.kundali.backToForm}
            </button>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
                {t.kundali.birthChart}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                {t.kundali.generatedFor.replace('{name}', kundliData?.name || '')}
              </p>
              {timeUnknown && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
                  <Info className="w-3 h-3 shrink-0" />
                  {t.kundali.noonReferenceBadge}
                </p>
              )}
            </div>

            {/* Summary Badge Bar — Lagna / Rashi / Sun Sign / Birth Nakshatra */}
            {kundliData && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { icon: <ArrowUp className="w-4 h-4" />, label: t.kundali.ascendant, value: localizeSignClean(kundliData.ascendant, selectedLanguage) || '--' },
                  { icon: <Moon className="w-4 h-4" />, label: t.kundali.moonSign, value: localizeSignClean(kundliData.moonSign, selectedLanguage) || '--' },
                  { icon: <Sun className="w-4 h-4" />, label: t.kundali.sunSign, value: localizeSignClean(kundliData.sunSign, selectedLanguage) || '--' },
                  { icon: <Star className="w-4 h-4" />, label: t.kundali.nakshatra, value: localizeNakshatraClean(kundliData.nakshatra, selectedLanguage) || '--' },
                ].map((badge) => (
                  <div key={badge.label} className="glass-card rounded-xl p-3 flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/15 dark:to-[#E0A96D]/10 text-violet-700 dark:text-[#FFD166]">
                      {badge.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide truncate">{badge.label}</p>
                      <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] truncate">{badge.value || '--'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: t.kundali.dateOfBirth, value: kundliData?.dateOfBirth || '--' },
                { label: t.kundali.timeOfBirth, value: kundliData?.timeOfBirth || '--' },
                { label: t.kundali.placeOfBirth, value: kundliData?.placeOfBirth || '--' },
                { label: t.kundali.coordinates, value: kundliData?.latitude != null && kundliData?.longitude != null ? `${kundliData.latitude.toFixed(2)}, ${kundliData.longitude.toFixed(2)}` : '--' },
                { label: t.kundali.timeZone, value: kundliData?.timezone || '--' },
                { label: t.kundali.ascendant, value: localizeSignClean(kundliData?.ascendant, selectedLanguage) || '--' },
                { label: t.kundali.moonSign, value: localizeSignClean(kundliData?.moonSign, selectedLanguage) || '--' },
                { label: t.kundali.sunSign, value: localizeSignClean(kundliData?.sunSign, selectedLanguage) || '--' },
                { label: t.kundali.nakshatra, value: localizeNakshatraClean(kundliData?.nakshatra, selectedLanguage) || '--' },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5 truncate">{item.value || '--'}</p>
                </div>
              ))}
            </div>

            {/* Chart Type Tab Switcher + North Indian Chart */}
            {hasPlanets && (
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto">
                  {(['D1', 'D9', 'BhavChalit', 'D3', 'D4', 'D7', 'D10'] as ChartType[]).map((ct) => (
                    <button
                      key={ct}
                      onClick={() => setActiveChartType(ct)}
                      className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                        activeChartType === ct
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] shadow-sunlit-soft'
                          : 'bg-slate-50/50 dark:bg-white/[0.03] text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-950 dark:hover:text-[#F3F4F6] border border-slate-200/60 dark:border-white/10'
                      }`}
                    >
                      {getChartTypeLabel(ct, selectedLanguage)}
                    </button>
                  ))}
                </div>

                <NorthIndianChart
                  chartData={{
                    ascendantSign: signToIndex(kundliData?.ascendant),
                    ascendantDegree: 15,
                    planets: (kundliData?.planets ?? []).map((p) => ({
                      planet: p.name,
                      sign: signToIndex(p.sign),
                      degree: p.degree,
                      retrograde: p.status === 'Retrograde',
                      nakshatra: p.nakshatra,
                      pada: p.pada,
                    })),
                    houses: kundliData?.houses,
                  }}
                  type={activeChartType}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            )}

            {/* Planetary Positions Table */}
            {hasPlanets && (
              <PlanetaryPositionsTable
                planets={(kundliData?.planets ?? []).map((p) => ({
                  planet: p.name,
                  sign: signToIndex(p.sign),
                  degree: p.degree,
                  house: p.house,
                  retrograde: p.status === 'Retrograde',
                  nakshatra: p.nakshatra,
                }))}
                ascendantSign={signToIndex(kundliData?.ascendant)}
                ascendantDegree={15}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* KP Details Table */}
            {hasPlanets && (
              <KPDetailsTable
                planets={(kundliData?.planets ?? []).map((p) => ({
                  planet: p.name,
                  sign: signToIndex(p.sign),
                  degree: p.degree,
                  house: p.house,
                  retrograde: p.status === 'Retrograde',
                  nakshatra: p.nakshatra,
                }))}
                ascendantSign={signToIndex(kundliData?.ascendant)}
                ascendantDegree={15}
                selectedLanguage={selectedLanguage}
                chartType={activeChartType}
              />
            )}

            {/* Vimshottari Dasha Timeline */}
            {kundliData && (
              <VimshottariDashaTimeline
                dasha={generateMockDasha(kundliData?.moonSign || '')}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* AI Interpretation — structured markdown rendering + quick copy */}
            {kundliData && (
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 min-w-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
                    <span className="truncate">{language === 'hi' ? 'आपकी कुंडली का विश्लेषण' : 'Your Kundali Analysis'}</span>
                  </h2>
                  <button
                    onClick={handleCopyReading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-[#9CA3AF] hover:border-violet-300 dark:hover:border-[#FFD166]/30 hover:text-indigo-900 dark:hover:text-[#F3F4F6]'
                    }`}
                    aria-live="polite"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'कॉपी हो गया!' : 'Copied!'}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {language === 'hi' ? 'रीडिंग कॉपी करें' : 'Copy Reading'}
                      </>
                    )}
                  </button>
                </div>
                <MarkdownView content={kundliData.interpretation || INTERPRETATION_FALLBACK} />
              </div>
            )}

            {/* Report Content (Narratives, Yogas, Dosha Badges) */}
            {hasPlanets && (
              <ReportContent
                data={{
                  ascendantSign: signToIndex(kundliData?.ascendant),
                  ascendantDegree: 15,
                  moonSign: signToIndex(kundliData?.moonSign),
                  marsSign: signToIndex(kundliData?.planets?.find((p) => p.name === 'Mars')?.sign || 'Aries'),
                  planets: (kundliData?.planets ?? []).map((p) => ({
                    planet: p.name,
                    sign: signToIndex(p.sign),
                    degree: p.degree,
                    house: p.house,
                    retrograde: p.status === 'Retrograde',
                  })),
                }}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* Remedies (Gemstones + Rudraksha) */}
            {hasPlanets && (
              <Remedies
                data={{
                  ascendantSign: signToIndex(kundliData?.ascendant),
                  ascendantDegree: 15,
                  moonSign: signToIndex(kundliData?.moonSign),
                  planets: (kundliData?.planets ?? []).map((p) => ({
                    planet: p.name,
                    sign: signToIndex(p.sign),
                    degree: p.degree,
                    house: p.house,
                    retrograde: p.status === 'Retrograde',
                  })),
                  hasManglik: false,
                  hasKaalSarp: false,
                  sadeSatiActive: false,
                }}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* PDF + Share Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleDownloadPdf}
                disabled={!!downloadProgress}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-medium rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadProgress ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    {getUILabel('generatingPdf', selectedLanguage).replace('{lang}', selectedLanguage === 'hi' ? 'हिन्दी' : 'English')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t.kundali.downloadPDF}
                  </>
                )}
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-violet-300/60 dark:border-[#FFD166]/30 text-indigo-950 dark:text-[#FFD166] text-sm sm:text-base font-medium rounded-xl hover:bg-violet-50 dark:hover:bg-[#FFD166]/10 hover:shadow-glow-gold transition-all"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'hi' ? 'मेरी कॉस्मिक प्रोफ़ाइल साझा करें' : 'Share My Cosmic Profile'}
              </button>
            </div>

            {kundliData && (
              <ShareCard
                open={showShare}
                onClose={() => setShowShare(false)}
                mode="kundali"
                lang={language}
                data={{
                  name: kundliData.name,
                  sunSign: kundliData.sunSign,
                  moonSign: kundliData.moonSign,
                  ascendant: kundliData.ascendant,
                  nakshatra: kundliData.nakshatra,
                }}
              />
            )}

            {/* Hidden off-screen PDF template — captured by pdfService */}
            {hasPlanets && (
              <div ref={pdfTemplateRef} className="pdf-offscreen" aria-hidden="true">
                <PdfTemplate
                  kundliData={{
                    name: kundliData.name,
                    dateOfBirth: kundliData.dateOfBirth,
                    timeOfBirth: kundliData.timeOfBirth,
                    placeOfBirth: kundliData.placeOfBirth,
                    ascendant: kundliData.ascendant,
                    moonSign: kundliData.moonSign,
                    sunSign: kundliData.sunSign,
                    nakshatra: kundliData.nakshatra,
                    planets: kundliData?.planets ?? [],
                  }}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            )}
          </motion.div>
          </ReportContainer>
        )}
      </div>
    </div>
  );
}
