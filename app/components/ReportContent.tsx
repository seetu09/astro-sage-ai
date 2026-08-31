'use client';

import React, { useMemo } from 'react';
import {
  LocaleCode,
  getRemedyLabel,
  getDoshaLabel,
  getYogaInfo,
  getAscendantNarrative,
  getDoshaNarrative,
  localizePlanet,
  localizeSign,
  getSignLord,
  getNakshatraLord,
  getNakshatraName,
  getRetrogradeMarker,
  ChartType,
} from '@/lib/astrologyDictionary';
import { calculateManglik, calculateSadeSati, BirthDetails, ManglikResult, SadeSatiResult } from '@/lib/dosha-checker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReportPlanet {
  planet: string;
  sign: number; // 1-12
  degree: number; // 0-30
  house?: number;
  retrograde?: boolean;
}

export interface ReportData {
  ascendantSign: number;
  ascendantDegree?: number;
  moonSign: number;
  marsSign: number;
  planets: ReportPlanet[];
  yogas?: { key: string; name: string; description: string; strength: string }[];
}

// ---------------------------------------------------------------------------
// Yoga Detection (client-side)
// ---------------------------------------------------------------------------

export function detectYogas(planets: ReportPlanet[], ascendantSign: number): { key: string; name: string; description: string; strength: string }[] {
  const planetMap = new Map(planets.map((p) => [p.planet, p]));
  const houseMap = new Map(planets.map((p) => [p.planet, p.house ?? 0]));

  const results: { key: string; name: string; description: string; strength: string }[] = [];

  // Gajakesari: Moon in kendra (1,4,7,10) from Jupiter
  const moon = planetMap.get('Moon');
  const jupiter = planetMap.get('Jupiter');
  if (moon && jupiter && moon.house && jupiter.house) {
    const diff = Math.abs(moon.house - jupiter.house);
    if ([3, 6, 9, 0].includes(diff)) {
      results.push({ key: 'gajakesari', name: 'Gajakesari Yoga', description: '', strength: 'Strong' });
    }
  }

  // Budhaditya: Sun and Mercury in same sign
  const sun = planetMap.get('Sun');
  const mercury = planetMap.get('Mercury');
  if (sun && mercury && sun.sign === mercury.sign) {
    results.push({ key: 'budhaditya', name: 'Budha-Aditya Yoga', description: '', strength: 'Moderate' });
  }

  // Lakshmi Yoga: 9th and 10th lords well-placed (in kendra or own sign)
  const ninthLord = getSignLord(9);
  const tenthLord = getSignLord(10);
  const ninthPlanet = planetMap.get(ninthLord);
  const tenthPlanet = planetMap.get(tenthLord);
  if (ninthPlanet && tenthPlanet) {
    const ninthKendra = [1, 4, 7, 10].includes(ninthPlanet.house ?? 0);
    const tenthKendra = [1, 4, 7, 10].includes(tenthPlanet.house ?? 0);
    if (ninthKendra && tenthKendra) {
      results.push({ key: 'lakshmi', name: 'Lakshmi Yoga', description: '', strength: 'Strong' });
    }
  }

  // Sasa Yoga: Moon in kendra from Saturn
  const saturn = planetMap.get('Saturn');
  if (moon && saturn && moon.house && saturn.house) {
    const diff = Math.abs(moon.house - saturn.house);
    if ([3, 6, 9, 0].includes(diff)) {
      results.push({ key: 'sasa', name: 'Sasa Yoga', description: '', strength: 'Strong' });
    }
  }

  // Viparita Raja Yoga: lords of 6th, 8th, 12th in dusthana
  const dusthanaLords = planets.filter((p) => p.house && [6, 8, 12].includes(p.house));
  if (dusthanaLords.length >= 2) {
    results.push({ key: 'viparita', name: 'Viparita Raja Yoga', description: '', strength: 'Strong' });
  }

  // Chandra-Mangala: Moon and Mars in same sign
  const mars = planetMap.get('Mars');
  if (moon && mars && moon.sign === mars.sign) {
    results.push({ key: 'chandrabhang', name: 'Chandrabhang Yoga', description: '', strength: 'Moderate' });
  }

  // Raja Yoga: kendra + trikona lords combined
  const kendraLords = [1, 4, 7, 10].map((h) => {
    const planet = planets.find((p) => p.house === h);
    return planet ? planet.planet : null;
  }).filter(Boolean);
  const trikonaLords = [1, 5, 9].map((h) => {
    const planet = planets.find((p) => p.house === h);
    return planet ? planet.planet : null;
  }).filter(Boolean);
  if (kendraLords.length > 0 && trikonaLords.length > 0) {
    results.push({ key: 'rajayoga', name: 'Raja Yoga', description: '', strength: 'Strong' });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Conjunction Detection
// ---------------------------------------------------------------------------

function detectConjunctions(planets: ReportPlanet[]): { sign: number; planets: string[] }[] {
  const signMap: Record<number, string[]> = {};
  planets.forEach((p) => {
    if (!signMap[p.sign]) signMap[p.sign] = [];
    signMap[p.sign].push(p.planet);
  });

  return Object.entries(signMap)
    .filter(([, ps]) => ps.length > 1)
    .map(([sign, ps]) => ({ sign: parseInt(sign), planets: ps }));
}

// ---------------------------------------------------------------------------
// Kaal Sarp Detection
// ---------------------------------------------------------------------------

function detectKaalSarp(planets: ReportPlanet[]): boolean {
  // Kaal Sarp: all planets on one side of Rahu-Ketu axis
  const rahu = planets.find((p) => p.planet === 'Rahu');
  const ketu = planets.find((p) => p.planet === 'Ketu');
  if (!rahu || !ketu) return false;

  const axis = rahu.sign;
  const otherSide = ((axis + 5) % 12) + 1; // 7th sign from Rahu

  const onOneSide = planets.filter((p) => {
    const dist = Math.abs(p.sign - axis);
    return dist <= 6;
  });

  return onOneSide.length === planets.length;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ReportContentProps {
  data: ReportData;
  selectedLanguage: LocaleCode;
}

const ReportContent: React.FC<ReportContentProps> = ({ data, selectedLanguage }) => {
  const retroMarker = getRetrogradeMarker(selectedLanguage);

  // Detect yogas
  const activeYogas = useMemo(() => {
    const detected = detectYogas(data.planets, data.ascendantSign);
    return detected.map((y) => {
      const info = getYogaInfo(y.key, selectedLanguage);
      return {
        key: y.key,
        name: info.name,
        description: info.description,
        strength: info.strength,
      };
    });
  }, [data, selectedLanguage]);

  // Detect conjunctions
  const conjunctions = useMemo(() => detectConjunctions(data.planets), [data.planets]);

  // Dosha calculations
  const manglikResult = useMemo(() => {
    const details: BirthDetails = {
      name: '',
      moonSign: data.moonSign,
      marsSign: data.marsSign,
      ascendantSign: data.ascendantSign,
    };
    return calculateManglik(details, selectedLanguage);
  }, [data]);

  const sadeSatiResult = useMemo(() => {
    const details: BirthDetails = {
      name: '',
      moonSign: data.moonSign,
      marsSign: data.marsSign,
      ascendantSign: data.ascendantSign,
    };
    return calculateSadeSati(details, selectedLanguage);
  }, [data]);

  const hasKaalSarp = useMemo(() => detectKaalSarp(data.planets), [data.planets]);

  // Sign name helper
  const signNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const getSignName = (signNum: number) => localizeSign(signNames[signNum - 1] ?? 'Aries', selectedLanguage);

  return (
    <div className="space-y-6">
      {/* ── Ascendant Analysis ── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
            <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">★</span>
          </span>
          {getRemedyLabel('ascendantAnalysis', selectedLanguage)}
        </h3>
        <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
          {getAscendantNarrative(data.ascendantSign, selectedLanguage)}
        </p>
      </div>

      {/* ── Planetary Conjunctions ── */}
      {conjunctions.length > 0 && (
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
              <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">⊕</span>
            </span>
            {getRemedyLabel('planetaryConjunctions', selectedLanguage)}
          </h3>
          <div className="space-y-2">
            {conjunctions.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50/50 dark:bg-white/[0.03] rounded-lg">
                <span className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6]">
                  {getSignName(c.sign)}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">
                  {c.planets.map((p) => localizePlanet(p, selectedLanguage)).join(' + ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Active Yogas ── */}
      {activeYogas.length > 0 && (
        <div className="glass-card rounded-xl p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
              <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">✦</span>
            </span>
            {getRemedyLabel('activeYogas', selectedLanguage)}
          </h3>
          <div className="space-y-3">
            {activeYogas.map((yoga) => (
              <div key={yoga.key} className="p-3 bg-slate-50/50 dark:bg-white/[0.03] rounded-lg border border-slate-200/60 dark:border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">{yoga.name}</h4>
                   <span
                     className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                       yoga.strength === 'Strong' || yoga.strength === 'शक्तिशाली'
                         ? 'bg-emerald-500/10 text-emerald-500'
                         : yoga.strength === 'Moderate' || yoga.strength === 'मध्यम'
                         ? 'bg-amber-500/10 text-amber-500'
                         : 'bg-slate-500/10 text-slate-500'
                     }`}
                   >
                    {yoga.strength}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] leading-relaxed">
                  {yoga.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dosha Status Badges ── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
            <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">⚠</span>
          </span>
          {getRemedyLabel('doshaStatus', selectedLanguage)}
        </h3>

        {/* Manglik Dosha */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6]">
              {getDoshaLabel('manglik', selectedLanguage)}
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                manglikResult.isManglik
                  ? 'bg-red-500/10 text-red-500'
                  : manglikResult.affectedHouses.length > 0
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {manglikResult.isManglik
                ? getDoshaLabel('present', selectedLanguage)
                : manglikResult.affectedHouses.length > 0
                ? getDoshaLabel('cancelled', selectedLanguage)
                : getDoshaLabel('absent', selectedLanguage)}
          </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] leading-relaxed">
            {manglikResult.description}
          </p>
          {manglikResult.cancellations.length > 0 && (
            <div className="mt-2 space-y-1">
              {manglikResult.cancellations.map((c, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400">
                  {c}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Kaal Sarp Dosha */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6]">
              {getDoshaLabel('kaalSarp', selectedLanguage)}
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                hasKaalSarp
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
              {hasKaalSarp
                ? getDoshaLabel('present', selectedLanguage)
                : getDoshaLabel('absent', selectedLanguage)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] leading-relaxed">
            {hasKaalSarp
              ? getDoshaNarrative('kaalSarpPresent', selectedLanguage)
              : getDoshaNarrative('kaalSarpAbsent', selectedLanguage)}
          </p>
        </div>

        {/* Sade Sati Timeline */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6]">
              {getDoshaLabel('sadeSati', selectedLanguage)}
            </span>
            <span
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                sadeSatiResult.isActive
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}
            >
            {sadeSatiResult.isActive
              ? sadeSatiResult.phase === 'peak'
                ? getDoshaLabel('peak', selectedLanguage)
                : sadeSatiResult.phase === 'rising'
                ? getDoshaLabel('rising', selectedLanguage)
                : getDoshaLabel('setting', selectedLanguage)
              : getDoshaLabel('absent', selectedLanguage)}
          </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] leading-relaxed mb-3">
            {sadeSatiResult.description}
          </p>

          {/* Timeline */}
          <div className="grid grid-cols-3 gap-2">
            {sadeSatiResult.timeline.map((phase) => (
              <div
                key={phase.phase}
                className={`p-2.5 rounded-lg border text-center ${
                  phase.active
                    ? 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-400/5'
                    : 'bg-slate-50/50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/10'
                }`}
              >
                <p className="text-[10px] font-medium text-slate-500 dark:text-[#6B7280] uppercase tracking-wide">
                  {phase.label}
                </p>
                <p className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6] mt-0.5">
                  {phase.active ? getDoshaLabel('present', selectedLanguage) : getDoshaLabel('absent', selectedLanguage)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportContent;
