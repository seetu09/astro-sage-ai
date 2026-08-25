'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  LocaleCode,
  ChartType,
  getChartTypeLabel,
  getRetrogradeMarker,
  localizePlanetAbbr,
  localizePlanet,
  localizeSign,
  getTableLabel,
  getDivisionalSign,
  getDivisionalAscendant,
  getDivisionalHouse,
} from '@/lib/astrologyDictionary';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartPlanet {
  planet: string;
  sign: number; // 1-12
  degree: number; // 0-30
  retrograde?: boolean;
  nakshatra?: string;
  pada?: number;
}

export interface ChartHouse {
  house: number; // 1-12
  sign: number; // 1-12 (Bhava Chalit sign for this house)
}

export interface ChartData {
  ascendantSign: number; // 1-12
  ascendantDegree?: number; // 0-30
  planets: ChartPlanet[];
  /** Optional deterministic house→sign mapping from the backend (D1). */
  houses?: ChartHouse[];
}

export interface NorthIndianChartProps {
  chartData: ChartData;
  type?: ChartType;
  selectedLanguage: LocaleCode;
  className?: string;
}

// ---------------------------------------------------------------------------
// North Indian house layout (SVG polygon points)
// The chart is a 400×400 viewBox. The outer square (20,20)→(380,380) is split
// into a 3×3 grid of 120-unit cells; the eight outer cells hold houses 1–8 and
// the centre cell is divided into a diamond of four triangles (houses 9–12)
// meeting at (200,200). Every polygon shares its edges with its neighbours so
// the shape tiles perfectly with no gaps or stretching.
// ---------------------------------------------------------------------------

const CHART_SIZE = 400;
const CENTER = CHART_SIZE / 2;

// 12 house center positions in North Indian layout
// Houses 1-12 arranged clockwise starting from top-center
const HOUSE_POSITIONS: Record<number, [number, number]> = {
  1: [200, 74], // top center
  2: [320, 74], // top right
  3: [320, 200], // right
  4: [320, 326], // bottom right
  5: [200, 326], // bottom center
  6: [80, 326], // bottom left
  7: [80, 200], // left
  8: [80, 74], // top left
  9: [200, 165], // upper middle (diamond top triangle)
  10: [238, 200], // right middle (diamond right triangle)
  11: [200, 235], // lower middle (diamond bottom triangle)
  12: [162, 200], // left middle (diamond left triangle)
};

// House polygon points for the North Indian chart
// Each outer house is a quadrilateral; the four centre houses are triangles.
const HOUSE_POLYGONS: Record<number, string> = {
  1: '140,20 260,20 260,140 140,140', // top center
  2: '260,20 380,20 380,140 260,140', // top right
  3: '260,140 380,140 380,260 260,260', // right
  4: '260,260 380,260 380,380 260,380', // bottom right
  5: '140,260 260,260 260,380 140,380', // bottom center
  6: '20,260 140,260 140,380 20,380', // bottom left
  7: '20,140 140,140 140,260 20,260', // left
  8: '20,20 140,20 140,140 20,140', // top left
  9: '140,140 260,140 200,200', // centre top triangle
  10: '260,140 260,260 200,200', // centre right triangle
  11: '260,260 140,260 200,200', // centre bottom triangle
  12: '140,260 140,140 200,200', // centre left triangle
};

// Sign names for sign number lookup (1-12)
const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Format a DMS-style degree string like "12°34'". */
function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.round((degree - d) * 60);
  return `${d}°${String(m % 60).padStart(2, '0')}'`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  chartData,
  type = 'D1',
  selectedLanguage,
  className = '',
}) => {
  const retroMarker = getRetrogradeMarker(selectedLanguage);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Compute divisional ascendant and planet positions
  const { divAscSign, planetPositions } = useMemo(() => {
    const ascDeg = chartData.ascendantDegree ?? 15;
    const divAsc = getDivisionalAscendant(chartData.ascendantSign, ascDeg, type);

    const positions = chartData.planets.map((p) => {
      const divSign = getDivisionalSign(p.sign, p.degree, type);
      const house = getDivisionalHouse(p.sign, p.degree, divAsc, type);
      return {
        planet: p.planet,
        sign: divSign,
        house,
        degree: p.degree,
        retrograde: p.retrograde,
        nakshatra: p.nakshatra,
        pada: p.pada,
      };
    });

    return { divAscSign: divAsc, planetPositions: positions };
  }, [chartData, type]);

  // Group planets by house
  const planetsByHouse = useMemo(() => {
    const map: Record<number, typeof planetPositions> = {};
    planetPositions.forEach((p) => {
      if (!map[p.house]) map[p.house] = [];
      map[p.house].push(p);
    });
    return map;
  }, [planetPositions]);

  // Resolve each house's sign:
  // - D1 + backend houses provided → use the deterministic Bhava Chalit mapping
  // - otherwise → fall back to the classic whole-sign rotation from the ascendant
  const houseSigns = useMemo(() => {
    if (type === 'D1' && chartData.houses && chartData.houses.length === 12) {
      const map: Record<number, number> = {};
      chartData.houses.forEach((h) => {
        map[h.house] = h.sign;
      });
      return map;
    }
    const map: Record<number, number> = {};
    for (let i = 1; i <= 12; i++) {
      map[i] = ((chartData.ascendantSign + i - 2) % 12) + 1;
    }
    return map;
  }, [chartData.houses, chartData.ascendantSign, type]);

  // Get sign name for a sign number
  const getSignName = (signNum: number): string => {
    const signName = SIGN_NAMES_EN[signNum - 1] ?? 'Aries';
    return localizeSign(signName, selectedLanguage);
  };

  // Get sign symbol
  const getSignSymbol = (signNum: number): string => {
    const symbols = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    return symbols[signNum - 1] ?? '♈';
  };

  // Full details of the currently selected planet (for the detail card)
  const selectedDetails = selectedPlanet
    ? planetPositions.find((p) => p.planet === selectedPlanet) ?? null
    : null;

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      {/* Chart Title */}
      <div className="text-center mb-4">
        <h3 className="text-sm font-serif font-semibold text-indigo-900 dark:text-[#FFD166] tracking-wide">
          {getChartTypeLabel(type, selectedLanguage)}
        </h3>
        <p className="text-xs text-slate-400 dark:text-[#6B7280] mt-0.5">
          {getSignSymbol(divAscSign)} {getSignName(divAscSign)}
        </p>
      </div>

      {/* SVG Chart */}
      <div className="relative bg-white dark:bg-[#0D0C1D] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sunlit-soft dark:shadow-glow-violet">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 400"
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${getChartTypeLabel(type, selectedLanguage)} — ${getSignName(divAscSign)}`}
        >
          {/* Background */}
          <rect x="0" y="0" width="400" height="400" rx="12" className="fill-slate-50 dark:fill-[#121026]" />

          {/* Outer square border */}
          <rect
            x="20" y="20" width="360" height="360" rx="8"
            className="fill-transparent stroke-slate-300/60 dark:stroke-[#FFD166]/30 stroke-2"
          />

          {/* Centre-square diagonals forming the diamond of houses 9–12 */}
          <line x1="140" y1="140" x2="260" y2="260" className="stroke-slate-300/40 dark:stroke-[#FFD166]/20 stroke-1" />
          <line x1="260" y1="140" x2="140" y2="260" className="stroke-slate-300/40 dark:stroke-[#FFD166]/20 stroke-1" />

          {/* House polygons */}
          {Object.entries(HOUSE_POLYGONS).map(([houseNum, points]) => {
            const h = parseInt(houseNum);
            const pos = HOUSE_POSITIONS[h];
            const housePlanets = planetsByHouse[h] || [];
            const isAscendant = h === 1;
            const houseSign = houseSigns[h] ?? ((chartData.ascendantSign + h - 2) % 12) + 1;

            return (
              <g key={h}>
                {/* House polygon */}
                <polygon
                  points={points}
                  className={`stroke-slate-200/60 dark:stroke-white/10 fill-slate-50/30 dark:fill-[#121026]/30 ${
                    isAscendant ? 'dark:fill-[#FFD166]/5' : ''
                  }`}
                >
                  <title>{`House ${h} — ${getSignName(houseSign)}`}</title>
                </polygon>

                {/* House number */}
                <text
                  x={pos[0] - 8}
                  y={pos[1] - 8}
                  className="text-[8px] sm:text-[9px] fill-slate-400 dark:fill-[#6B7280]"
                  fontWeight="normal"
                >
                  {h}
                </text>

                {/* Sign symbol — bound to the actual house sign */}
                <text
                  x={pos[0] + 4}
                  y={pos[1] - 8}
                  className={`text-[8px] sm:text-[9px] ${
                    isAscendant
                      ? 'fill-indigo-500 dark:fill-[#4CC9F0]'
                      : 'fill-indigo-400 dark:fill-[#4CC9F0]/70'
                  }`}
                  fontWeight="normal"
                >
                  {getSignSymbol(houseSign)}
                </text>

                {/* Planets in this house */}
                {housePlanets.map((planet, idx) => {
                  const abbr = localizePlanetAbbr(planet.planet, selectedLanguage);
                  const isRetro = planet.retrograde;
                  const isSelected = selectedPlanet === planet.planet;
                  const yOffset = 12 + idx * 14;

                  return (
                    <g
                      key={`${planet.planet}-${idx}`}
                      onClick={() => setSelectedPlanet(isSelected ? null : planet.planet)}
                      className="cursor-pointer"
                      role="button"
                      aria-label={localizePlanet(planet.planet, selectedLanguage)}
                    >
                      {/* Native hover tooltip */}
                      <title>
                        {`${localizePlanet(planet.planet, selectedLanguage)} • ${getSignName(planet.sign)} ${formatDegree(planet.degree)}${isRetro ? ` ${retroMarker}` : ''}`}
                      </title>
                      <circle
                        cx={pos[0]}
                        cy={pos[1] + yOffset}
                        r={isSelected ? 10 : 8}
                        className={`transition-all ${
                          isSelected
                            ? 'fill-violet-100 dark:fill-[#FFD166]/25 stroke-violet-500 dark:stroke-[#FFD166] stroke-2'
                            : 'fill-indigo-50 dark:fill-[#FFD166]/10 stroke-indigo-200 dark:stroke-[#FFD166]/30 stroke-1 hover:fill-violet-50 dark:hover:fill-[#FFD166]/20'
                        }`}
                      />
                      <text
                        x={pos[0]}
                        y={pos[1] + yOffset + 3}
                        textAnchor="middle"
                        pointerEvents="none"
                        className="text-[7px] sm:text-[8px] font-semibold fill-indigo-900 dark:fill-[#FFD166]"
                      >
                        {abbr}
                      </text>
                      {isRetro && (
                        <text
                          x={pos[0]}
                          y={pos[1] + yOffset + 14}
                          textAnchor="middle"
                          pointerEvents="none"
                          className="text-[5px] sm:text-[6px] fill-red-500 dark:fill-red-400"
                        >
                          {retroMarker}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Ascendant label in center diamond */}
          <text
            x={CENTER - 20}
            y={CENTER - 10}
            className="text-[7px] sm:text-[8px] fill-slate-400 dark:fill-[#6B7280]"
          >
            {selectedLanguage === 'hi' ? 'लग्न' : 'Lagna'}
          </text>
          <text
            x={CENTER - 10}
            y={CENTER + 8}
            textAnchor="middle"
            className="text-[10px] sm:text-xs font-semibold fill-indigo-700 dark:fill-[#FFD166]"
          >
            {getSignSymbol(divAscSign)}
          </text>
        </svg>

        {/* Selected Planet Detail Card */}
        <AnimatePresence>
          {selectedDetails && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="mt-3 relative rounded-xl border border-violet-200/60 dark:border-[#FFD166]/25 bg-gradient-to-br from-violet-50/80 to-indigo-50/60 dark:from-[#FFD166]/[0.07] dark:to-[#E0A96D]/[0.04] backdrop-blur-sm p-3"
            >
              <button
                onClick={() => setSelectedPlanet(null)}
                aria-label="Close"
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/70 dark:bg-white/10 text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-900 dark:hover:text-[#F3F4F6] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2 mb-2 pr-6">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-[10px] font-bold">
                  {localizePlanetAbbr(selectedDetails.planet, selectedLanguage)}
                </span>
                <p className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6]">
                  {localizePlanet(selectedDetails.planet, selectedLanguage)}
                </p>
                {selectedDetails.retrograde && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500">
                    {retroMarker} {selectedLanguage === 'hi' ? 'वक्री' : 'Retrograde'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">{getTableLabel('sign', selectedLanguage)}</span>
                  <span className="font-medium text-indigo-950 dark:text-[#F3F4F6]">
                    {getSignSymbol(selectedDetails.sign)} {getSignName(selectedDetails.sign)}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">{getTableLabel('degree', selectedLanguage)}</span>
                  <span className="font-medium text-indigo-950 dark:text-[#F3F4F6]">{formatDegree(selectedDetails.degree)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">{getTableLabel('nakshatra', selectedLanguage)}</span>
                  <span className="font-medium text-indigo-950 dark:text-[#F3F4F6] truncate max-w-[110px]">
                    {selectedDetails.nakshatra ?? '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">Pada</span>
                  <span className="font-medium text-indigo-950 dark:text-[#F3F4F6]">{selectedDetails.pada ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">{getTableLabel('house', selectedLanguage)}</span>
                  <span className="font-medium text-indigo-950 dark:text-[#F3F4F6]">{selectedDetails.house}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 dark:text-[#6B7280]">{getTableLabel('status', selectedLanguage)}</span>
                  <span className={`font-medium ${selectedDetails.retrograde ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {selectedDetails.retrograde
                      ? `${retroMarker} ${selectedLanguage === 'hi' ? 'वक्री' : 'Retrograde'}`
                      : selectedLanguage === 'hi' ? 'सीधा' : 'Direct'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend — clickable to select a planet too */}
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {chartData.planets.map((p) => (
            <button
              key={p.planet}
              onClick={() => setSelectedPlanet(selectedPlanet === p.planet ? null : p.planet)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] transition-colors cursor-pointer ${
                selectedPlanet === p.planet
                  ? 'bg-violet-100 dark:bg-[#FFD166]/15 border-violet-300 dark:border-[#FFD166]/40 text-indigo-950 dark:text-[#FFD166]'
                  : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200/60 dark:border-white/10 text-slate-500 dark:text-[#9CA3AF] hover:border-violet-300 dark:hover:border-[#FFD166]/30'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-[#FFD166] dark:to-[#E0A96D]" />
              {localizePlanetAbbr(p.planet, selectedLanguage)}
            </button>
          ))}
        </div>

        {/* Interaction hint */}
        <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-[#6B7280]">
          {selectedLanguage === 'hi'
            ? 'विवरण देखने के लिए किसी ग्रह पर टैप करें'
            : 'Tap any planet to view its full details'}
        </p>
      </div>
    </div>
  );
};

export default NorthIndianChart;