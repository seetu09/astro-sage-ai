'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Info, Sparkles, Share2, Loader2 } from 'lucide-react';
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
import { useLanguage } from '@/app/context/LanguageContext';
import { useApp } from '@/app/context/AppContext';
import {
  localizePlanet,
  localizeSign,
  getChartTypeLabel,
  ChartType,
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
}

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

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
  const moonSignIndex = signs.indexOf(moonSign);
  const nakshatraIndex = Math.floor((moonSignIndex * 30 + 15) / (360 / 27));
  const startLordIndex = nakshatraIndex % 9;

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

function generateMockKundli(formData: {
  name: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}): KundliData {
  const ascendant = signs[Math.floor(Math.random() * signs.length)];
  const moonSign = signs[Math.floor(Math.random() * signs.length)];
  const sunSign = signs[Math.floor(Math.random() * signs.length)];
  const nakshatra = nakshatras[Math.floor(Math.random() * nakshatras.length)];

  const planetData: Planet[] = planets.map((name) => ({
    name,
    sign: signs[Math.floor(Math.random() * signs.length)],
    house: Math.floor(Math.random() * 12) + 1,
    degree: Math.random() * 30,
    status: Math.random() > 0.7 ? 'Retrograde' : 'Direct',
  }));

  return {
    name: formData.name,
    email: formData.email,
    dateOfBirth: formData.dateOfBirth,
    timeOfBirth: formData.timeOfBirth,
    placeOfBirth: formData.placeOfBirth,
    latitude: formData.latitude,
    longitude: formData.longitude,
    timezone: formData.timezone,
    ascendant,
    moonSign,
    sunSign,
    nakshatra,
    planets: planetData,
  };
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('kundali_generated', { has_birth_time: !timeUnknown });
    const resolvedTime = resolveBirthTime(timeOfBirth, timeUnknown);
    const data = generateMockKundli({ name, email, dateOfBirth, timeOfBirth: resolvedTime, placeOfBirth, latitude, longitude, timezone });
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
  };

  const handleBack = () => {
    setShowResult(false);
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
      console.error('PDF generation error:', err);
      alert(getUILabel('pdfError', selectedLanguage));
    } finally {
      setDownloadProgress(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-[#F8F7FC] dark:bg-[#080811]">
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {!showResult ? (
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

              <button
                type="submit"
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all mt-2"
              >
                {t.kundali.generateButton}
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

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: t.kundali.dateOfBirth, value: kundliData?.dateOfBirth },
                { label: t.kundali.timeOfBirth, value: kundliData?.timeOfBirth },
                { label: t.kundali.placeOfBirth, value: kundliData?.placeOfBirth },
                { label: t.kundali.coordinates, value: kundliData?.latitude != null && kundliData?.longitude != null ? `${kundliData.latitude.toFixed(2)}, ${kundliData.longitude.toFixed(2)}` : undefined },
                { label: t.kundali.timeZone, value: kundliData?.timezone },
                { label: t.kundali.ascendant, value: kundliData ? localizeSign(kundliData.ascendant, selectedLanguage) : undefined },
                { label: t.kundali.moonSign, value: kundliData ? localizeSign(kundliData.moonSign, selectedLanguage) : undefined },
                { label: t.kundali.sunSign, value: kundliData ? localizeSign(kundliData.sunSign, selectedLanguage) : undefined },
                { label: t.kundali.nakshatra, value: kundliData?.nakshatra },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5 truncate">{item.value ?? '—'}</p>
                </div>
              ))}
            </div>

            {/* Chart Type Tab Switcher + North Indian Chart */}
            {kundliData && (
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
                    ascendantSign: signs.indexOf(kundliData.ascendant) + 1,
                    ascendantDegree: 15,
                    planets: kundliData.planets.map((p) => ({
                      planet: p.name,
                      sign: signs.indexOf(p.sign) + 1,
                      degree: p.degree,
                      retrograde: p.status === 'Retrograde',
                    })),
                  }}
                  type={activeChartType}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            )}

            {/* Planetary Positions Table */}
            {kundliData && (
              <PlanetaryPositionsTable
                planets={kundliData.planets.map((p) => ({
                  planet: p.name,
                  sign: signs.indexOf(p.sign) + 1,
                  degree: p.degree,
                  house: p.house,
                  retrograde: p.status === 'Retrograde',
                }))}
                ascendantSign={signs.indexOf(kundliData.ascendant) + 1}
                ascendantDegree={15}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* KP Details Table */}
            {kundliData && (
              <KPDetailsTable
                planets={kundliData.planets.map((p) => ({
                  planet: p.name,
                  sign: signs.indexOf(p.sign) + 1,
                  degree: p.degree,
                  house: p.house,
                  retrograde: p.status === 'Retrograde',
                }))}
                ascendantSign={signs.indexOf(kundliData.ascendant) + 1}
                ascendantDegree={15}
                selectedLanguage={selectedLanguage}
                chartType={activeChartType}
              />
            )}

            {/* Vimshottari Dasha Timeline */}
            {kundliData && (
              <VimshottariDashaTimeline
                dasha={generateMockDasha(kundliData.moonSign)}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* Report Content (Narratives, Yogas, Dosha Badges) */}
            {kundliData && (
              <ReportContent
                data={{
                  ascendantSign: signs.indexOf(kundliData.ascendant) + 1,
                  ascendantDegree: 15,
                  moonSign: signs.indexOf(kundliData.moonSign) + 1,
                  marsSign: signs.indexOf(kundliData.planets.find((p) => p.name === 'Mars')?.sign || 'Aries') + 1,
                  planets: kundliData.planets.map((p) => ({
                    planet: p.name,
                    sign: signs.indexOf(p.sign) + 1,
                    degree: p.degree,
                    house: p.house,
                    retrograde: p.status === 'Retrograde',
                  })),
                }}
                selectedLanguage={selectedLanguage}
              />
            )}

            {/* Remedies (Gemstones + Rudraksha) */}
            {kundliData && (
              <Remedies
                data={{
                  ascendantSign: signs.indexOf(kundliData.ascendant) + 1,
                  ascendantDegree: 15,
                  moonSign: signs.indexOf(kundliData.moonSign) + 1,
                  planets: kundliData.planets.map((p) => ({
                    planet: p.name,
                    sign: signs.indexOf(p.sign) + 1,
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
            {kundliData && (
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
                    planets: kundliData.planets,
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
