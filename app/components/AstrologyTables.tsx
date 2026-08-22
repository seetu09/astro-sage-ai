'use client';

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  LocaleCode,
  getTableLabel,
  localizePlanet,
  localizeSign,
  getSignLord,
  getNakshatraLord,
  getNakshatraName,
  getKpSubLord,
  getRetrogradeMarker,
  formatLocalizedDate,
  computeAntardashas,
  getDivisionalSign,
  getDivisionalAscendant,
  getDivisionalHouse,
  ChartType,
} from '@/lib/astrologyDictionary';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanetData {
  planet: string;
  sign: number; // 1-12
  degree: number; // 0-30
  house?: number; // 1-12 (optional, computed if missing)
  retrograde?: boolean;
  nakshatra?: string;
  nakshLord?: string;
}

export interface DashaEntry {
  planet: string;
  startDate: string;
  endDate: string;
}

export interface KpData {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  chartType?: ChartType;
}

// ---------------------------------------------------------------------------
// PlanetaryPositionsTable
// ---------------------------------------------------------------------------

interface PlanetaryPositionsTableProps {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  selectedLanguage: LocaleCode;
}

export const PlanetaryPositionsTable: React.FC<PlanetaryPositionsTableProps> = ({
  planets,
  ascendantSign,
  ascendantDegree = 15,
  selectedLanguage,
}) => {
  const retroMarker = getRetrogradeMarker(selectedLanguage);

  const enrichedPlanets = useMemo(() => {
    return planets.map((p) => {
      const longitude = (p.sign - 1) * 30 + p.degree;
      return {
        ...p,
        signLord: getSignLord(p.sign),
        nakshatra: p.nakshatra ?? getNakshatraName(longitude, selectedLanguage),
        nakshLord: p.nakshLord ?? localizePlanet(getNakshatraLord(longitude), selectedLanguage),
      };
    });
  }, [planets, selectedLanguage]);

  const headers = [
    { key: 'planet' as const, label: getTableLabel('planet', selectedLanguage) },
    { key: 'sign' as const, label: getTableLabel('sign', selectedLanguage) },
    { key: 'signLord' as const, label: getTableLabel('signLord', selectedLanguage) },
    { key: 'degree' as const, label: getTableLabel('degree', selectedLanguage) },
    { key: 'house' as const, label: getTableLabel('house', selectedLanguage) },
    { key: 'nakshatra' as const, label: getTableLabel('nakshatra', selectedLanguage) },
    { key: 'nakshLord' as const, label: getTableLabel('nakshLord', selectedLanguage) },
    { key: 'status' as const, label: getTableLabel('status', selectedLanguage) },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-3 sm:px-4 py-3 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6]">
          {getTableLabel('planet', selectedLanguage)} {getTableLabel('status', selectedLanguage)}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-400 dark:text-[#6B7280]"
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enrichedPlanets.map((p, i) => (
              <tr
                key={i}
                className="border-b border-slate-200/60 dark:border-white/10 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">
                  {localizePlanet(p.planet, selectedLanguage)}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {localizeSign(
                    ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][p.sign - 1] ?? 'Aries',
                    selectedLanguage
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {localizePlanet(p.signLord, selectedLanguage)}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.degree.toFixed(2)}°
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.house ?? '-'}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.nakshatra}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.nakshLord}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                      p.retrograde
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}
                  >
                    {p.retrograde ? `${retroMarker} ${getTableLabel('retrograde', selectedLanguage)}` : getTableLabel('direct', selectedLanguage)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// KPDetailsTable
// ---------------------------------------------------------------------------

interface KPDetailsTableProps {
  planets: PlanetData[];
  ascendantSign: number;
  ascendantDegree?: number;
  selectedLanguage: LocaleCode;
  chartType?: ChartType;
}

export const KPDetailsTable: React.FC<KPDetailsTableProps> = ({
  planets,
  ascendantSign,
  ascendantDegree = 15,
  selectedLanguage,
  chartType = 'D1',
}) => {
  const enriched = useMemo(() => {
    const divAsc = getDivisionalAscendant(ascendantSign, ascendantDegree, chartType);
    return planets.map((p) => {
      const longitude = (p.sign - 1) * 30 + p.degree;
      const divSign = getDivisionalSign(p.sign, p.degree, chartType);
      const house = getDivisionalHouse(p.sign, p.degree, divAsc, chartType);
      return {
        planet: p.planet,
        sign: divSign,
        house,
        starLord: localizePlanet(getNakshatraLord(longitude), selectedLanguage),
        subLord: localizePlanet(getKpSubLord(longitude), selectedLanguage),
      };
    });
  }, [planets, ascendantSign, ascendantDegree, chartType, selectedLanguage]);

  // Cusp positions for 12 houses
  const cusps = useMemo(() => {
    const divAsc = getDivisionalAscendant(ascendantSign, ascendantDegree, chartType);
    return Array.from({ length: 12 }, (_, i) => {
      const cuspSign = ((divAsc + i - 1) % 12) + 1;
      return {
        cusp: i + 1,
        sign: localizeSign(
          ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][cuspSign - 1] ?? 'Aries',
          selectedLanguage
        ),
      };
    });
  }, [ascendantSign, ascendantDegree, chartType, selectedLanguage]);

  const headers = [
    { key: 'planet' as const, label: getTableLabel('planet', selectedLanguage) },
    { key: 'sign' as const, label: getTableLabel('sign', selectedLanguage) },
    { key: 'house' as const, label: getTableLabel('house', selectedLanguage) },
    { key: 'starLord' as const, label: getTableLabel('starLord', selectedLanguage) },
    { key: 'subLord' as const, label: getTableLabel('subLord', selectedLanguage) },
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-3 sm:px-4 py-3 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6]">
          KP {getTableLabel('starLord', selectedLanguage)} & {getTableLabel('subLord', selectedLanguage)}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-200/60 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-400 dark:text-[#6B7280]"
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enriched.map((p) => (
              <tr
                key={p.planet}
                className="border-b border-slate-200/60 dark:border-white/10 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">
                  {localizePlanet(p.planet, selectedLanguage)}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {localizeSign(
                    ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][p.sign - 1] ?? 'Aries',
                    selectedLanguage
                  )}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.house}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.starLord}
                </td>
                <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  {p.subLord}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Cusp summary */}
        <div className="mt-4 px-3 sm:px-4">
          <h4 className="text-xs font-medium text-slate-400 dark:text-[#6B7280] mb-2">
            {getTableLabel('cusp', selectedLanguage)} {getTableLabel('sign', selectedLanguage)}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {cusps.map((c) => (
              <div
                key={c.cusp}
                className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-50/50 dark:bg-white/[0.03] rounded-lg border border-slate-200/60 dark:border-white/10"
              >
                <span className="text-xs font-medium text-indigo-950 dark:text-[#F3F4F6]">{c.cusp}</span>
                <span className="text-xs text-slate-500 dark:text-[#9CA3AF]">{c.sign}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// VimshottariDashaTimeline
// ---------------------------------------------------------------------------

interface VimshottariDashaTimelineProps {
  dasha: DashaEntry[];
  selectedLanguage: LocaleCode;
}

export const VimshottariDashaTimeline: React.FC<VimshottariDashaTimelineProps> = ({
  dasha,
  selectedLanguage,
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const now = new Date();

  const enrichedDasha = useMemo(() => {
    return dasha.map((d, i) => {
      const start = new Date(d.startDate);
      const end = new Date(d.endDate);
      const totalMs = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      const progress = Math.max(0, Math.min(100, (elapsed / totalMs) * 100));
      const isActive = now >= start && now <= end;
      return { ...d, progress, isActive, index: i };
    });
  }, [dasha, now]);

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="px-3 sm:px-4 py-3 border-b border-slate-200/60 dark:border-white/10">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6]">
          {getTableLabel('mahadasha', selectedLanguage)} {getTableLabel('period', selectedLanguage)}
        </h3>
      </div>
      <div className="divide-y divide-slate-200/60 dark:divide-white/10">
        {enrichedDasha.map((d) => {
          const adLords = computeAntardashas(d.planet, d.startDate, d.endDate);
          return (
            <div key={d.planet}>
              <div
                className={`px-3 sm:px-4 py-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/[0.03] transition-colors ${
                  d.isActive ? 'bg-violet-50/50 dark:bg-[#FFD166]/5' : ''
                }`}
                onClick={() => setExpanded(expanded === d.index ? null : d.index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        d.isActive
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811]'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-[#9CA3AF]'
                      }`}
                    >
                      {localizePlanet(d.planet, selectedLanguage).charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">
                        {localizePlanet(d.planet, selectedLanguage)} {getTableLabel('mahadasha', selectedLanguage)}
                      </span>
                      <div className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280]">
                        {formatLocalizedDate(d.startDate, selectedLanguage)} — {formatLocalizedDate(d.endDate, selectedLanguage)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.isActive && (
                      <span className="text-[10px] font-medium text-violet-600 dark:text-[#FFD166]">
                        {getTableLabel('period', selectedLanguage)}
                      </span>
                    )}
                    {expanded === d.index ? (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-[#6B7280]" />
                    ) : (
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 dark:text-[#6B7280]" />
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] transition-all"
                    style={{ width: `${d.progress}%` }}
                  />
                </div>
              </div>

              {/* Antardasha sub-rows */}
              {expanded === d.index && (
                <div className="bg-slate-50/30 dark:bg-white/[0.02]">
                  {adLords.map((ad) => (
                    <div
                      key={ad.planet}
                      className="flex items-center justify-between px-4 sm:px-6 py-2 text-xs"
                    >
                      <span className="text-slate-500 dark:text-[#9CA3AF]">
                        {localizePlanet(ad.planet, selectedLanguage)} {getTableLabel('antardasha', selectedLanguage)}
                      </span>
                      <span className="text-slate-400 dark:text-[#6B7280]">
                        {formatLocalizedDate(ad.startDate, selectedLanguage)} — {formatLocalizedDate(ad.endDate, selectedLanguage)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

