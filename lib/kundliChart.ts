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
  cx: number;
  cy: number;
  /** Top-left text anchor for the sign glyph (inside the polygon bbox). */
  glyphX: number;
  glyphY: number;
}

// x,y for each house drawn from the established North-Indian polygon layout.
// glyphX/glyphY sit just inside each polygon's top-left bounding corner.
const NORTH_CELLS: HouseCell[] = [
  { house: 1, poly: '180,20 220,20 260,60 140,60', cx: 200, cy: 46, glyphX: 148, glyphY: 27 },
  { house: 2, poly: '220,20 380,20 380,60 260,60', cx: 320, cy: 46, glyphX: 228, glyphY: 27 },
  { house: 3, poly: '340,60 380,60 380,340 340,340', cx: 360, cy: 200, glyphX: 348, glyphY: 67 },
  { house: 4, poly: '340,340 380,340 380,380 260,340', cx: 320, cy: 356, glyphX: 348, glyphY: 307 },
  { house: 5, poly: '100,380 140,340 260,340 300,380', cx: 200, cy: 356, glyphX: 228, glyphY: 307 },
  { house: 6, poly: '20,340 60,340 100,380 20,380', cx: 60, cy: 356, glyphX: 28, glyphY: 347 },
  { house: 7, poly: '60,60 100,60 100,340 60,340', cx: 80, cy: 200, glyphX: 68, glyphY: 67 },
  { house: 8, poly: '20,20 60,20 100,60 20,60', cx: 40, cy: 46, glyphX: 28, glyphY: 27 },
  { house: 9, poly: '180,60 220,60 260,140 140,140', cx: 200, cy: 106, glyphX: 148, glyphY: 67 },
  { house: 10, poly: '220,60 260,60 300,140 260,140', cx: 280, cy: 106, glyphX: 248, glyphY: 67 },
  { house: 11, poly: '260,140 300,140 300,260 260,260', cx: 280, cy: 200, glyphX: 268, glyphY: 147 },
  { house: 12, poly: '140,140 100,140 100,260 140,260', cx: 120, cy: 200, glyphX: 108, glyphY: 147 },
];

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

  const cells = NORTH_CELLS.slice().sort((a, b) => a.house - b.house);

  const houseBlocks = cells
    .map((cell) => {
      const sign = houseMap[cell.house];
      const cellPlanets = byHouse[cell.house] || [];
      const signs = `<text x="${cell.glyphX}" y="${cell.glyphY}" font-size="9" fill="${stroke}" text-anchor="start">${signSymbol(sign)}</text>`;
      const num = `<text x="${cell.glyphX + 14}" y="${cell.glyphY - 1}" font-size="8" fill="${stroke}" text-anchor="start">${cell.house}</text>`;
      // Planet glyphs centred in the cell, one row that grows to fit up to 3.
      const n = Math.min(cellPlanets.length, 6);
      const glyphs = cellPlanets
        .slice(0, n)
        .map((p, i) => {
          const gx = cell.cx - (n - 1) * 9 + i * 18;
          const gy = cell.cy + 12;
          return `<text x="${gx}" y="${gy}" font-size="9" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(planetGlyph(p, language))}</text>`;
        })
        .join('');
      // Lagna (house 1) shows the rashi name in the diamond.
      const lagna =
        cell.house === 1
          ? `<text x="${cell.cx}" y="${cell.cy - 2}" font-size="10" font-weight="700" fill="${textColor}" text-anchor="middle">${escapeXml(localizeRashi(asc, language))}</text>`
          : '';
      return `<g>${signs}${num}${glyphs}${lagna}</g>`;
    })
    .join('');

  const gridLines = NORTH_CELLS.map(
    (c) => `<polygon points="${c.poly}" fill="${background}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`
  ).join('');

  const titleBlock = showTitle
    ? `<text x="${VIEW / 2}" y="14" font-size="12" font-weight="600" fill="${textColor}" text-anchor="middle">${escapeXml(title || (language === 'hi' ? 'उत्तर भारतीय चार्ट' : 'North Indian Chart'))}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" width="${VIEW}" height="${VIEW}" role="img" aria-label="${escapeXml(title || 'Kundli chart')}">
<rect width="${VIEW}" height="${VIEW}" fill="${background}"/>
${titleBlock}
${gridLines}
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