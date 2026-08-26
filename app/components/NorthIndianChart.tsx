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
  /** Chart glyph language: 'en' → Su/Mo/Ma…, 'hi' → सू/चं/मं…. Defaults to 'en'. */
  language?: LocaleCode;
  /** @deprecated Legacy alias — prefer `language`. Kept for backward compatibility. */
  selectedLanguage?: LocaleCode;
  className?: string;
}

// ---------------------------------------------------------------------------
// North Indian house layout — mathematically exact diamond geometry
// ---------------------------------------------------------------------------
// The classic figure on the 400×400 viewBox is built from exactly three
// primitives: the outer box, both corner-to-corner diagonals, and the centre
// diamond joining the four side midpoints. Together they carve the square
// into 12 regions: 8 outer triangles + 4 central kites.
//
//   Corners   A(0,0) B(400,0) C(400,400) D(0,400)
//   Midpoints T(200,0) R(400,200) Bo(200,400) L(0,200)      → centre diamond
//   Diagonal ∩ diamond edges: P(100,100) Q(300,100) S(300,300) U(100,300)
//   Centre    M(200,200)
//
// Houses use the traditional fixed layout: house 1 (Lagna) is always the top
// diamond quadrant, numbered counter-clockwise around the chart. Every anchor
// below is the exact polygon centroid of its region.
// ---------------------------------------------------------------------------

const CHART_SIZE = 400;
const CENTER = CHART_SIZE / 2;

/** Max planet chips rendered per house before a "+n" overflow badge shows. */
const MAX_PLANETS_PER_HOUSE = 4;

/**
 * Per-house planet-chip layout, tuned so every chip stays inside its region:
 *  - kites have full quadrant depth below their centroid (spec anchors),
 *  - corner triangles hug the top/bottom edge → horizontal rows fit,
 *  - slim side triangles take a tighter vertical column.
 */
interface HouseChipLayout {
  /** 'col' stacks chips vertically; 'row' spreads them horizontally. */
  mode: 'col' | 'row';
  /** First-chip offset from the anchor along the stacking axis (signed). */
  start: number;
  /** Centre-to-centre spacing between chips. */
  step: number;
  /** Chip radius (selected chips render at r + 2). */
  r: number;
  /** Overflow-badge offset from the LAST visible chip centre. */
  badgeDx: number;
  badgeDy: number;
}

const HOUSE_CHIP_LAYOUT: Record<number, HouseChipLayout> = {
  // Kites — generous vertical stacks; badge drops straight below.
  1: { mode: 'col', start: 16, step: 14, r: 7, badgeDx: 0, badgeDy: 13 },
  4: { mode: 'col', start: 16, step: 14, r: 7, badgeDx: 0, badgeDy: 13 },
  7: { mode: 'col', start: 16, step: 14, r: 7, badgeDx: 0, badgeDy: 13 },
  10: { mode: 'col', start: 16, step: 14, r: 7, badgeDx: 0, badgeDy: 13 },
  // Side-edge triangles — compact columns; badge sits beside/below the last
  // chip, shifted toward the chart interior so it never crosses a hypotenuse.
  3: { mode: 'col', start: 16, step: 12, r: 5, badgeDx: -11, badgeDy: 0 },
  5: { mode: 'col', start: 16, step: 12, r: 5, badgeDx: -4, badgeDy: 11 },
  9: { mode: 'col', start: 16, step: 12, r: 5, badgeDx: 4, badgeDy: 11 },
  11: { mode: 'col', start: 16, step: 12, r: 5, badgeDx: 11, badgeDy: 0 },
  // Top/bottom-edge corner triangles — horizontal rows; badge trails right.
  2: { mode: 'row', start: 17, step: 13, r: 6, badgeDx: 12, badgeDy: 0 },
  12: { mode: 'row', start: 17, step: 13, r: 6, badgeDx: 12, badgeDy: 0 },
  6: { mode: 'row', start: -17, step: 13, r: 6, badgeDx: 12, badgeDy: 0 },
  8: { mode: 'row', start: -17, step: 13, r: 6, badgeDx: 12, badgeDy: 0 },
};

// Exact centroid of each house region (text anchor for number + glyphs).
const HOUSE_POSITIONS: Record<number, [number, number]> = {
  1: [200, 100],       // top kite (Lagna / ascendant)
  2: [100, 33.33],     // outer triangle — top edge, left half
  3: [33.33, 100],     // outer triangle — left edge, upper half
  4: [100, 200],       // left kite
  5: [33.33, 300],     // outer triangle — left edge, lower half
  6: [100, 366.67],    // outer triangle — bottom edge, left half
  7: [200, 300],       // bottom kite
  8: [300, 366.67],    // outer triangle — bottom edge, right half
  9: [366.67, 300],    // outer triangle — right edge, lower half
  10: [300, 200],      // right kite
  11: [366.67, 100],   // outer triangle — right edge, upper half
  12: [300, 33.33],    // outer triangle — top edge, right half
};

// Exact region outlines: kites are quads through the centre M, outers triangles.
const HOUSE_POLYGONS: Record<number, string> = {
  1: '100,100 200,0 300,100 200,200',    // top kite
  2: '0,0 200,0 100,100',                // top-left triangle
  3: '0,0 100,100 0,200',                // left-top triangle
  4: '100,300 0,200 100,100 200,200',    // left kite
  5: '0,200 100,300 0,400',              // left-bottom triangle
  6: '0,400 100,300 200,400',            // bottom-left triangle
  7: '300,300 200,400 100,300 200,200',  // bottom kite
  8: '200,400 300,300 400,400',          // bottom-right triangle
  9: '400,400 400,200 300,300',          // right-bottom triangle
  10: '300,100 400,200 300,300 200,200', // right kite
  11: '400,200 300,100 400,0',           // right-top triangle
  12: '400,0 200,0 300,100',             // top-right triangle
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
  language,
  selectedLanguage: legacySelectedLanguage,
  className = '',
}) => {
  // Active locale: new `language` prop wins, then the legacy alias, then 'en'.
  const selectedLanguage: LocaleCode = language ?? legacySelectedLanguage ?? 'en';
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
          {/* Background wash (theme-aware, sits under the exact figure) */}
          <rect x="0" y="0" width="400" height="400" className="fill-slate-50 dark:fill-[#121026]" />

          {/* Outer Box */}
          <rect x="0" y="0" width="400" height="400" fill="none" stroke="#8c1d1d" strokeWidth="2" />

          {/* Cross lines — corner-to-corner diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke="#8c1d1d" strokeWidth="1.5" />
          <line x1="400" y1="0" x2="0" y2="400" stroke="#8c1d1d" strokeWidth="1.5" />

          {/* Center Diamond — joins the four side midpoints */}
          <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="#8c1d1d" strokeWidth="1.5" />

          {/* House regions — outlines come from the exact figure above */}
          {Object.entries(HOUSE_POLYGONS).map(([houseNum, points]) => {
            const h = parseInt(houseNum);
            const [cx, cy] = HOUSE_POSITIONS[h];
            const housePlanets = planetsByHouse[h] || [];
            const isAscendant = h === 1;
            const houseSign = houseSigns[h] ?? ((chartData.ascendantSign + h - 2) % 12) + 1;
            const overflow = housePlanets.length - MAX_PLANETS_PER_HOUSE;
            const chipLayout = HOUSE_CHIP_LAYOUT[h];
            const visibleCount = Math.min(housePlanets.length, MAX_PLANETS_PER_HOUSE);

            return (
              <g key={h}>
                {/* Region hit-area + hover title */}
                <polygon
                  points={points}
                  className={`fill-slate-50/30 dark:fill-[#121026]/30 ${
                    isAscendant ? 'dark:fill-[#FFD166]/5' : ''
                  }`}
                >
                  <title>{`House ${h} — ${getSignName(houseSign)}`}</title>
                </polygon>

                {/* Sign symbol — bound to the actual house sign */}
                <text
                  x={cx}
                  y={cy - 18}
                  textAnchor="middle"
                  fontWeight="normal"
                  className={`text-[8px] sm:text-[9px] ${
                    isAscendant
                      ? 'fill-indigo-500 dark:fill-[#4CC9F0]'
                      : 'fill-indigo-400 dark:fill-[#4CC9F0]/70'
                  }`}
                >
                  {getSignSymbol(houseSign)}
                </text>

                {/* House number — pinned exactly at the region centroid */}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight="normal"
                  className="text-[8px] sm:text-[9px] fill-slate-400 dark:fill-[#6B7280]"
                >
                  {h}
                </text>

                {/* Planets in this house — laid out per-region to stay in-quadrant */}
                {housePlanets.slice(0, MAX_PLANETS_PER_HOUSE).map((planet, idx) => {
                  const abbr = localizePlanetAbbr(planet.planet, selectedLanguage);
                  const label = planet.retrograde ? `${abbr}${retroMarker}` : abbr;
                  const isSelected = selectedPlanet === planet.planet;
                  const px =
                    chipLayout.mode === 'row'
                      ? cx + (idx - (visibleCount - 1) / 2) * chipLayout.step
                      : cx;
                  const py =
                    chipLayout.mode === 'row'
                      ? cy + chipLayout.start
                      : cy + chipLayout.start + idx * chipLayout.step;

                  return (
                    <g
                      key={`${planet.planet}-${idx}`}
                      onClick={() => setSelectedPlanet(isSelected ? null : planet.planet)}
                      className="cursor-pointer"
                      role="button"
                      aria-label={`${localizePlanet(planet.planet, selectedLanguage)} — House ${h}`}
                    >
                      {/* Native hover tooltip */}
                      <title>
                        {`${localizePlanet(planet.planet, selectedLanguage)} • ${getSignName(planet.sign)} ${formatDegree(planet.degree)}${planet.retrograde ? ` ${retroMarker}` : ''}`}
                      </title>
                      <circle
                        cx={px}
                        cy={py}
                        r={isSelected ? chipLayout.r + 2 : chipLayout.r}
                        className={`transition-all ${
                          isSelected
                            ? 'fill-violet-100 dark:fill-[#FFD166]/25 stroke-violet-500 dark:stroke-[#FFD166] stroke-2'
                            : 'fill-indigo-50 dark:fill-[#FFD166]/10 stroke-indigo-200 dark:stroke-[#FFD166]/30 stroke-1 hover:fill-violet-50 dark:hover:fill-[#FFD166]/20'
                        }`}
                      />
                      <text
                        x={px}
                        y={py}
                        textAnchor="middle"
                        dominantBaseline="central"
                        pointerEvents="none"
                        className="text-[7px] sm:text-[8px] font-semibold fill-indigo-900 dark:fill-[#FFD166]"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Overflow badge when more planets share one house */}
                {overflow > 0 && (
                  <text
                    x={
                      (chipLayout.mode === 'row'
                        ? cx + ((visibleCount - 1) / 2) * chipLayout.step
                        : cx) + chipLayout.badgeDx
                    }
                    y={
                      (chipLayout.mode === 'row'
                        ? cy + chipLayout.start
                        : cy + chipLayout.start + (visibleCount - 1) * chipLayout.step) +
                      chipLayout.badgeDy
                    }
                    textAnchor="middle"
                    dominantBaseline="central"
                    pointerEvents="none"
                    className="text-[6px] sm:text-[7px] fill-slate-400 dark:fill-[#6B7280]"
                  >
                    {`+${overflow}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Ascendant marker at the exact centre where the four kites meet */}
          <g pointerEvents="none">
            <text
              x={CENTER}
              y={CENTER - 6}
              textAnchor="middle"
              className="text-[6px] sm:text-[7px] fill-slate-400 dark:fill-[#6B7280]"
            >
              {selectedLanguage === 'hi' ? 'लग्न' : 'Lagna'}
            </text>
            <text
              x={CENTER}
              y={CENTER + 12}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] sm:text-xs font-semibold fill-indigo-700 dark:fill-[#FFD166]"
            >
              {getSignSymbol(divAscSign)}
            </text>
          </g>
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