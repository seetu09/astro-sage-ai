/**
 * KundliChart — Pure SSR inline-SVG Kundli (birth-chart) renderer.
 * ---------------------------------------------------------------------------
 * Renders only SVG markup strings. It has NO React, NO 'use client', NO
 * `window`/`document`/`canvas` references, so it renders identically inside
 * server components, headless PDF generators, and static HTML templates.
 *
 * Two styles are supported:
 *   • 'north' — the classic North-Indian diamond layout (ascendant on top).
 *   • 'south' — the South-Indian 4×4 grid layout (fixed sign boxes).
 *
 * All glyphs/naming accept a `language` of 'en' | 'hi' and are localized via
 * the shared `@/lib/astrologyDictionary` store (native-script glyphs for hi).
 */
import {
  LocaleCode,
  localizePlanetAbbr,
  localizeRashi,
  RASHI_GLYPHS,
} from '@/lib/astrologyDictionary';

/** Single planet placement for chart rendering. */
export interface ChartPlanetInput {
  /** Planet identifier: 'Sun' / 'Surya' / etc. */
  planet: string;
  /** 1-12 sign number. */
  sign: number;
  /** 1-12 house number (used for North Indian placement). */
  house?: number;
  /** 0-30 degree within sign (optional, informational). */
  degree?: number;
  retrograde?: boolean;
}

/** House→sign mapping (1-12). Optional; derived from ascendant when absent. */
export interface ChartHouseInput {
  house: number;
  sign: number;
}

export interface KundliChartInput {
  style: 'north' | 'south';
  language: LocaleCode;
  /** 1-12 lagna/ascendant sign. Defaults to 1 (Mesha/Aries). */
  ascendantSign?: number;
  /** Optional explicit house→sign map. Derived from ascendant otherwise. */
  houses?: ChartHouseInput[];
  planets?: ChartPlanetInput[];
  /** Show the localized chart-type label as a small text header. */
  showTitle?: boolean;
  /** Optional override for the title text. */
  title?: string;
  /** Stroke color for chart geometry lines. */
  stroke?: string;
  /** Background fill color. */
  background?: string;
  /** Primary text fill color. */
  textColor?: string;
}

// ---------------------------------------------------------------------------
// Geometry / helpers
// ---------------------------------------------------------------------------
const VIEW = 400; // square viewBox for both styles.

/** Normalize a house/sign number into 1-12 (0 rolls to 12). */
function normHouse(h: number): number {
  return ((h - 1) % 12 + 12) % 12 + 1;
}

function normSign(s: number): number {
  return ((s - 1) % 12 + 12) % 12 + 1;
}

function escapeXml(s: string): string {
  return s
    .replace(/\&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Zodiac glyph for a sign index (1-12). */
function signSymbol(signIndex: number): string {
  const idx = ((signIndex - 1) % 12 + 12) % 12;
  return RASHI_GLYPHS[idx] ?? '♈';
}

/** Localized glyph for a planet, with retrograde marker when applicable. */
function planetGlyph(p: ChartPlanetInput, lang: LocaleCode): string {
  const abbr = localizePlanetAbbr(p.planet, lang) || p.planet.slice(0, 2);
  if (p.retrograde) {
    return lang === 'hi' ? `${abbr}(व)` : `${abbr}®`;
  }
  return abbr;
}

// ---------------------------------------------------------------------------
// House → sign resolution
// ---------------------------------------------------------------------------

/** Build a 1-12 → sign lookup. Without explicit houses, house h = asc + h - 1. */
function buildHouseMap(
  ascendantSign: number | undefined,
  houses: ChartHouseInput[] | undefined
): Record<number, number> {
  const asc = normSign(ascendantSign || 1);
  const map: Record<number, number> = {};
  for (let i = 1; i <= 12; i++) map[i] = normSign(asc + i - 1);
  if (houses && houses.length) {
    for (const h of houses) {
      if (h && h.house >= 1 && h.house <= 12 && h.sign >= 1 && h.sign <= 12) {
        map[normHouse(h.house)] = normSign(h.sign);
      }
    }
  }
  return map;
}

function groupPlanetsByHouse(
  planets: ChartPlanetInput[] | undefined
): Record<number, ChartPlanetInput[]> {
  const byHouse: Record<number, ChartPlanetInput[]> = {};
  for (const p of planets || []) {
    const h = normHouse(p.house || 1);
    (byHouse[h] ||= []).push(p);
  }
  return byHouse;
}
// ---------------------------------------------------------------------------
// North Indian chart (diamond layout)
// ---------------------------------------------------------------------------
// Classic 400×400 North-Indian shape: a diamond at the top-centre holds the
// lagna (house 1); the other houses fan out clockwise. All geometry is drawn
// as SVG <path> elements so headless rasterisers produce a consistent shape.

interface HouseCell {
  house: number;
  poly: string;
  /** Exact region centroid — anchor for the sign/number column. */
  cx: number;
  cy: number;
  /** Planet-row centre (nudged inward inside slim side triangles). */
  px: number;
}

// Exact North-Indian diamond decomposition on the 400×400 viewBox:
//   corners A(0,0) B(400,0) C(400,400) D(0,400)
//   side midpoints T(200,0) R(400,200) Bo(200,400) L(0,200) → centre diamond
//   diagonal ∩ diamond edge: P(100,100) Q(300,100) S(300,300) U(100,300)
//   centre M(200,200)
// 8 outer triangles + 4 central kites; houses numbered counter-clockwise from
// the top kite (house 1 = Lagna). Anchors are exact polygon centroids; `px`
// keeps planet rows inside their quadrant in the narrow side triangles.
const NORTH_CELLS: HouseCell[] = [
  { house: 1, poly: '100,100 200,0 300,100 200,200', cx: 200, cy: 100, px: 200 },     // top kite — Lagna
  { house: 2, poly: '0,0 200,0 100,100', cx: 100, cy: 33.33, px: 100 },               // top edge, left half
  { house: 3, poly: '0,0 100,100 0,200', cx: 33.33, cy: 100, px: 49.33 },             // left edge, upper half
  { house: 4, poly: '100,300 0,200 100,100 200,200', cx: 100, cy: 200, px: 100 },     // left kite
  { house: 5, poly: '0,200 100,300 0,400', cx: 33.33, cy: 300, px: 49.33 },           // left edge, lower half
  { house: 6, poly: '0,400 100,300 200,400', cx: 100, cy: 366.67, px: 100 },          // bottom edge, left half
  { house: 7, poly: '300,300 200,400 100,300 200,200', cx: 200, cy: 300, px: 200 },   // bottom kite
  { house: 8, poly: '200,400 300,300 400,400', cx: 300, cy: 366.67, px: 300 },        // bottom edge, right half
  { house: 9, poly: '400,400 400,200 300,300', cx: 366.67, cy: 300, px: 350.67 },     // right edge, lower half
  { house: 10, poly: '300,100 400,200 300,300 200,200', cx: 300, cy: 200, px: 300 },  // right kite
  { house: 11, poly: '400,200 300,100 400,0', cx: 366.67, cy: 100, px: 350.67 },      // right edge, upper half
  { house: 12, poly: '400,0 200,0 300,100', cx: 300, cy: 33.33, px: 300 },            // top edge, right half
];

/** Max planet glyphs on one row before a "+n" note is appended. */
const MAX_ROW_PLANETS = 5;
/** Horizontal spacing between planet glyphs in a row. */
const PLANET_STEP = 14;

function renderNorthIndian(input: KundliChartInput): string {
  const {
    language,
    ascendantSign = 1,
    planets = [],
    houses,
    showTitle = false,
    title,
    stroke = '#3b3b4d',
    background = '#ffffff',
    textColor = '#1a1a2e',
  } = input;

  const asc = normSign(ascendantSign);
  const houseMap = buildHouseMap(asc, houses);
  const byHouse = groupPlanetsByHouse(planets);

  // Column layout per region: sign glyph above the house number, planets below.
  const houseBlocks = NORTH_CELLS
    .map((cell) => {
      const sign = houseMap[cell.house];
      const cellPlanets = byHouse[cell.house] || [];
      const signs = `<text x="${cell.cx}" y="${cell.cy - 20}" font-size="10" fill="${stroke}" text-anchor="middle">${signSymbol(sign)}</text>`;
      const num = `<text x="${cell.cx}" y="${cell.cy - 8}" font-size="8" fill="${stroke}" text-anchor="middle">${cell.house}</text>`;

      const visible = cellPlanets.slice(0, MAX_ROW_PLANETS);
      const n = visible.length;
      const glyphs = visible
        .map((p, i) => {
          const gx = cell.px - (n - 1) * (PLANET_STEP / 2) + i * PLANET_STEP;
          return `<text x="${gx}" y="${cell.cy + 14}" font-size="9" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(planetGlyph(p, language))}</text>`;
        })
        .join('');
      const overflowNote =
        cellPlanets.length > MAX_ROW_PLANETS
          ? `<text x="${cell.px}" y="${cell.cy + 26}" font-size="7" fill="${stroke}" text-anchor="middle">+${cellPlanets.length - MAX_ROW_PLANETS}</text>`
          : '';

      // Lagna (house 1) shows the rashi name inside the top kite.
      const lagna =
        cell.house === 1
          ? `<text x="${cell.cx}" y="${cell.cy + 34}" font-size="10" font-weight="700" fill="${textColor}" text-anchor="middle">${escapeXml(localizeRashi(asc, language))}</text>`
          : '';
      return `<g>${signs}${num}${glyphs}${overflowNote}${lagna}</g>`;
    })
    .join('');

  // The exact North-Indian figure: outer box + both corner diagonals +
  // centre diamond joining the four side midpoints.
  const figure = `<rect x="0" y="0" width="${VIEW}" height="${VIEW}" fill="none" stroke="${stroke}" stroke-width="2"/>
<line x1="0" y1="0" x2="${VIEW}" y2="${VIEW}" stroke="${stroke}" stroke-width="1.5"/>
<line x1="${VIEW}" y1="0" x2="0" y2="${VIEW}" stroke="${stroke}" stroke-width="1.5"/>
<polygon points="200,0 ${VIEW},200 200,${VIEW} 0,200" fill="none" stroke="${stroke}" stroke-width="1.5"/>`;

  const titleBlock = showTitle
    ? `<text x="${VIEW / 2}" y="14" font-size="12" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(title || (language === 'hi' ? 'उत्तर भारतीय चार्ट' : 'North Indian Chart'))}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}" role="img" aria-label="${escapeXml(title || 'Kundli chart')}">
<rect width="${VIEW}" height="${VIEW}" fill="${background}"/>
${titleBlock}
${figure}
${houseBlocks}
</svg>`;
}
// ---------------------------------------------------------------------------
// South Indian chart (4×4 fixed grid)
// ---------------------------------------------------------------------------
// The South-Indian chart keeps the 12 zodiac signs in a fixed border layout
// (Aries top-left, cycling clockwise along the perimeter). The four centre
// cells are reserved — the lagna glyph is drawn in the middle. Each sign cell
// shows the sign glyph, the rashi name, the house number that falls on that
// sign (starting with house 1 on the lagna), and any planets in that sign.

// Sign → (row, col) for the 4×4 grid in the classic South-Indian arrangement.
const SOUTH_GRID: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 0 }, // Aries
  2: { row: 0, col: 1 }, // Taurus
  3: { row: 0, col: 2 }, // Gemini
  4: { row: 0, col: 3 }, // Cancer
  5: { row: 1, col: 3 }, // Leo
  6: { row: 2, col: 3 }, // Virgo
  7: { row: 3, col: 3 }, // Libra
  8: { row: 3, col: 2 }, // Scorpio
  9: { row: 3, col: 1 }, // Sagittarius
  10: { row: 3, col: 0 }, // Capricorn
  11: { row: 2, col: 0 }, // Aquarius
  12: { row: 1, col: 0 }, // Pisces
};

function renderSouthIndian(input: KundliChartInput): string {
  const {
    language,
    ascendantSign = 1,
    planets = [],
    showTitle = false,
    title,
    stroke = '#333333',
    background = '#ffffff',
    textColor = '#1a1a2e',
  } = input;

  const asc = normSign(ascendantSign);
  const cellW = VIEW / 4;
  const cellH = VIEW / 4;
  const centreX = VIEW / 2;
  const centreY = VIEW / 2;

  // Group planets by sign (for placement in the fixed sign cells).
  const bySign: Record<number, ChartPlanetInput[]> = {};
  for (const p of planets || []) {
    const s = normSign(p.sign);
    (bySign[s] ||= []).push(p);
  }

  // Border sign cells.
  const signCells = Object.keys(SOUTH_GRID)
    .map(Number)
    .sort((a, b) => a - b)
    .map((sign) => {
      const { row, col } = SOUTH_GRID[sign];
      const cx = col * cellW + cellW / 2;
      const cy = row * cellH + cellH / 2;
      const house = ((sign - asc + 12) % 12) + 1;
      const n = Math.min((bySign[sign] || []).length, 4);
      const planetText = (bySign[sign] || [])
        .slice(0, n)
        .map((p, i) => {
          const px = cx + (i - (n - 1) / 2) * 15;
          const py = cy + 15;
          return `<text x="${px}" y="${py}" font-size="9" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(planetGlyph(p, language))}</text>`;
        })
        .join('');

      const rashiText = `<text x="${cx}" y="${cy - 6}" font-size="8" fill="${stroke}" text-anchor="middle">${escapeXml(localizeRashi(sign, language))}</text>`;
      const glyphText = `<text x="${cx}" y="${cy - 16}" font-size="10" fill="${textColor}" text-anchor="middle">${signSymbol(sign)}</text>`;

      // House number pinned to the outer-top edge of the cell (readable).
      const numY = row === 0 ? row * cellH + 12 : row === 3 ? row * cellH + cellH - 8 : cy;
      const houseNum = `<text x="${cx}" y="${numY}" font-size="8" fill="${stroke}" text-anchor="middle">${house}</text>`;

      return `<g>
  <rect x="${col * cellW + 1}" y="${row * cellH + 1}" width="${cellW - 2}" height="${cellH - 2}" fill="${background}" stroke="${stroke}" stroke-width="1"/>
  ${glyphText}${rashiText}${planetText}${houseNum}
</g>`;
    })
    .join('');

  // Empty centre block — South Indian charts put the lagna well; we mark it.
  const centreLabel = language === 'hi' ? 'लग्न' : 'Lagna';
  const centreBlock = `<g>
  <text x="${centreX}" y="${centreY - 8}" font-size="9" fill="${stroke}" text-anchor="middle">${escapeXml(centreLabel)}</text>
  <text x="${centreX}" y="${centreY + 10}" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle">${signSymbol(asc)} ${escapeXml(localizeRashi(asc, language))}</text>
</g>`;

  const titleBlock = showTitle
    ? `<text x="${centreX}" y="14" font-size="12" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(title || (language === 'hi' ? 'दक्षिण भारतीय चार्ट' : 'South Indian Chart'))}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}" role="img" aria-label="${escapeXml(title || 'Kundli chart')}">
<rect width="${VIEW}" height="${VIEW}" fill="${background}"/>
${titleBlock}
<g stroke="${stroke}" stroke-width="1" fill="none">
  <path d="M0,${cellH} H400 M0,${cellH * 2} H400 M0,${cellH * 3} H400"/>
  <path d="M${cellW},0 V400 M${cellW * 2},0 V400 M${cellW * 3},0 V400"/>
</g>
${signCells}
${centreBlock}
</svg>`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Render a Kundli birth-chart as a pure SVG string.
 *
 * Pure SSR by construction: the returned markup depends only on the input and
 * the shared localization dictionary — there are no browser globals, no
 * canvas, and no React, so it renders identically in server components and in
 * headless PDF generators (html2canvas, headless Chrome, jsPDF, etc.).
 *
 * @example
 *   const svg = renderKundliChartSvg({
 *     style: 'north',
 *     language: 'hi',
 *     ascendantSign: 1,
 *     planets: [{ planet: 'Sun', sign: 1, house: 1 }],
 *   });
 */
export function renderKundliChartSvg(input: KundliChartInput): string {
  return input.style === 'south'
    ? renderSouthIndian(input)
    : renderNorthIndian(input);
}

/** Convenience helper: render a North-Indian chart SVG. */
export function renderNorthIndianChartSvg(input: Omit<KundliChartInput, 'style'>): string {
  return renderKundliChartSvg({ ...input, style: 'north' });
}

/** Convenience helper: render a South-Indian chart SVG. */
export function renderSouthIndianChartSvg(input: Omit<KundliChartInput, 'style'>): string {
  return renderKundliChartSvg({ ...input, style: 'south' });
}

export const KUNDLI_CHART_LIB_VERSION = '1.0.0';