'use client';

import React, { useMemo } from 'react';
import {
  LocaleCode,
  ChartType,
  getChartTypeLabel,
  getRetrogradeMarker,
  localizePlanetAbbr,
  localizeSign,
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
}

export interface ChartData {
  ascendantSign: number; // 1-12
  ascendantDegree?: number; // 0-30
  planets: ChartPlanet[];
}

export interface NorthIndianChartProps {
  chartData: ChartData;
  type?: ChartType;
  selectedLanguage: LocaleCode;
  className?: string;
}

// ---------------------------------------------------------------------------
// North Indian house layout (SVG polygon points)
// The chart is a 400×400 viewBox. Houses are arranged in the classic
// North Indian diamond pattern with the ascendant at the top-center.
// ---------------------------------------------------------------------------

const CHART_SIZE = 400;
const CENTER = CHART_SIZE / 2;
const OUTER = 180; // distance from center to outer corners
const MID = 120; // distance to mid-edge points
const INNER = 60; // distance to inner diamond corners

// 12 house center positions in North Indian layout
// Houses 1-12 arranged clockwise starting from top-center
const HOUSE_POSITIONS: Record<number, [number, number]> = {
  1: [CENTER, CENTER - OUTER], // top center
  2: [CENTER + OUTER, CENTER - OUTER], // top right
  3: [CENTER + OUTER, CENTER], // right
  4: [CENTER + OUTER, CENTER + OUTER], // bottom right
  5: [CENTER, CENTER + OUTER], // bottom center
  6: [CENTER - OUTER, CENTER + OUTER], // bottom left
  7: [CENTER - OUTER, CENTER], // left
  8: [CENTER - OUTER, CENTER - OUTER], // top left
  9: [CENTER, CENTER - MID], // upper middle
  10: [CENTER + MID, CENTER - MID], // upper right
  11: [CENTER + MID, CENTER], // right middle
  12: [CENTER - MID, CENTER], // left middle
};

// House polygon points for the North Indian chart
// Each house is a quadrilateral defined by 4 points
const HOUSE_POLYGONS: Record<number, string> = {
  1: '180,20 220,20 260,60 140,60', // top center diamond
  2: '220,20 380,20 380,60 260,60', // top right
  3: '340,60 380,60 380,340 340,340', // right
  4: '340,340 380,340 380,380 260,340', // bottom right
  5: '140,340 260,340 300,380 100,380', // bottom center
  6: '20,340 60,340 100,380 20,380', // bottom left
  7: '60,60 100,60 100,340 60,340', // left
  8: '20,20 60,20 100,60 20,60', // top left
  9: '180,60 220,60 260,140 140,140', // upper middle
  10: '220,60 340,60 300,140 260,140', // upper right
  11: '260,140 300,140 300,260 260,260', // right middle
  12: '140,140 100,140 100,260 140,260', // left middle
};

// Sign names for sign number lookup (1-12)
const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

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
        retrograde: p.retrograde,
      };
    });

    return { divAscSign: divAsc, planetPositions: positions };
  }, [chartData, type]);

  // Group planets by house
  const planetsByHouse = useMemo(() => {
    const map: Record<number, ChartPlanet[]> = {};
    planetPositions.forEach((p) => {
      if (!map[p.house]) map[p.house] = [];
      map[p.house].push({
        planet: p.planet,
        sign: p.sign,
        degree: 0,
        retrograde: p.retrograde,
      });
    });
    return map;
  }, [planetPositions]);

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
        >
          {/* Background */}
          <rect x="0" y="0" width="400" height="400" rx="12" className="fill-slate-50 dark:fill-[#121026]" />

          {/* Outer square border */}
          <rect
            x="20" y="20" width="360" height="360" rx="8"
            className="fill-transparent stroke-slate-300/60 dark:stroke-[#FFD166]/30 stroke-2"
          />

          {/* Diagonal lines forming the diamond */}
          <line x1="20" y1="20" x2="380" y2="380" className="stroke-slate-300/40 dark:stroke-[#FFD166]/20 stroke-1" />
          <line x1="380" y1="20" x2="20" y2="380" className="stroke-slate-300/40 dark:stroke-[#FFD166]/20 stroke-1" />

          {/* Inner diamond (center) */}
          <polygon
            points="200,60 340,200 200,340 60,200"
            className="fill-white/90 dark:fill-[#121026]/50 stroke-slate-300/60 dark:stroke-[#FFD166]/40 stroke-2"
          />

          {/* House polygons */}
          {Object.entries(HOUSE_POLYGONS).map(([houseNum, points]) => {
            const h = parseInt(houseNum);
            const pos = HOUSE_POSITIONS[h];
            const housePlanets = planetsByHouse[h] || [];
            const isAscendant = h === 1;

            return (
              <g key={h}>
                {/* House polygon */}
                <polygon
                  points={points}
                  className={`stroke-slate-200/60 dark:stroke-white/10 fill-slate-50/30 dark:fill-[#121026]/30 ${
                    isAscendant ? 'dark:fill-[#FFD166]/5' : ''
                  }`}
                />

                {/* House number */}
                <text
                  x={pos[0] - 8}
                  y={pos[1] - 8}
                  className="text-[8px] sm:text-[9px] fill-slate-400 dark:fill-[#6B7280]"
                  fontWeight="normal"
                >
                  {h}
                </text>

                {/* Sign symbol */}
                {isAscendant ? (
                  <text
                    x={pos[0] + 4}
                    y={pos[1] - 8}
                    className="text-[8px] sm:text-[9px] fill-indigo-400 dark:fill-[#4CC9F0]/70"
                    fontWeight="normal"
                  >
                    {getSignSymbol(divAscSign)}
                  </text>
                ) : (
                  <text
                    x={pos[0] + 4}
                    y={pos[1] - 8}
                    className="text-[8px] sm:text-[9px] fill-indigo-400 dark:fill-[#4CC9F0]/70"
                    fontWeight="normal"
                  >
                    {getSignSymbol(h)}
                  </text>
                )}

                {/* Planets in this house */}
                {housePlanets.map((planet, idx) => {
                  const abbr = localizePlanetAbbr(planet.planet, selectedLanguage);
                  const isRetro = planet.retrograde;
                  const yOffset = 12 + idx * 14;

                  return (
                    <g key={`${planet.planet}-${idx}`}>
                      <circle
                        cx={pos[0]}
                        cy={pos[1] + yOffset}
                        r="8"
                        className="fill-indigo-50 dark:fill-gradient-to-br dark:from-[#FFD166]/20 dark:to-[#E0A96D]/10 stroke-indigo-200 dark:stroke-[#FFD166]/30 stroke-1"
                      />
                      <text
                        x={pos[0]}
                        y={pos[1] + yOffset + 3}
                        textAnchor="middle"
                        className="text-[7px] sm:text-[8px] font-semibold fill-indigo-900 dark:fill-[#FFD166]"
                      >
                        {abbr}
                      </text>
                      {isRetro && (
                        <text
                          x={pos[0]}
                          y={pos[1] + yOffset + 14}
                          textAnchor="middle"
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
            {selectedLanguage === 'en' ? 'Lagna' : 'लग्न'}
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

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {chartData.planets.map((p) => (
            <span
              key={p.planet}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 text-[9px] text-slate-500 dark:text-[#9CA3AF]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-[#FFD166] dark:to-[#E0A96D]" />
              {localizePlanetAbbr(p.planet, selectedLanguage)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NorthIndianChart;
