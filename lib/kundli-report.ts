/**
 * Kundli Report — deterministic calculation layer
 * ------------------------------------------------
 * Pure-TypeScript re-implementation of the divisional charts, ashtakavarga,
 * full Vimshottari Dasha hierarchy, dosha checkers and major yoga detectors.
 *
 * Every function here is synchronous, dependency-free and uses only `Math` /
 * `Date` — so it runs identically under the Next.js Edge runtime, Node
 * Serverless, the browser, or any JS engine. No AI / no network calls.
 *
 * Inputs come straight from the cached `ChartData` produced by
 * `@/lib/astrology` (`computeChart`), which carries exact sidereal
 * longitudes (0-360) for every planet and the Ascendant.
 */

import {
  CHART_ENGINE_VERSION,
  getHouseFromLongitude,
  getSaturnMeanSign,
  longitudeToSign,
  signFrom,
  type ChartData,
  type PlanetResult,
} from "@/lib/astrology";
import {
  computeAntardashas,
  getDivisionalAscendant,
  getDivisionalHouse,
  getDivisionalSign,
  SIGN_LORDS,
  type ChartType,
} from "@/lib/astrologyDictionary";
import { computeAshtakvarga, type PlanetPosition } from "@/lib/ashtakvarga";
import type {
  AntardashaNode,
  AshtakavargaReport,
  CalculationMetadata,
  CurrentDashaInfo,
  DashaDateRange,
  DhaiyaPhase,
  DhanaYoga,
  DoshaReport,
  KaalSarpReport,
  DivisionalChartMatrix,
  DivisionalChartType,
  HouseCusp,
  KundliCalculations,
  LagnaSummary,
  MahadashaNode,
  MangalDoshaReport,
  MangalSeverity,
  PlanetCoordinate,
  PlanetName,
  SadeSatiPhase,
  SadeSatiReport,
  VimshottariReport,
  YogaCheck,
  YogaReport,
  YogaStrength,
} from "../types/kundali";

// ─── Constants ────────────────────────────────────────────────────────────

/** The seven natural/visible planets used for Kaal Sarp hemming. */
const NATURAL_PLANETS: PlanetName[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

/** Houses (whole-sign, from Lagna) in which Mars produces Mangal Dosha. */
const MANGAL_HOUSES = [1, 4, 7, 8, 12];

/** Mars's own signs (Aries 1, Scorpio 8) and exaltation sign (Capricorn 10). */
const MARS_OWN_SIGNS = [1, 8];
const MARS_EXALTED_SIGN = 10;

/** Kendra (angular) houses, 1-based. */
const KENDRA_HOUSES = [1, 4, 7, 10];
const TRIKONA_HOUSES = [1, 5, 9];

/** Amsa count per divisional chart — drives the coordinate sub-matrix. */
const AMSA_COUNT: Record<DivisionalChartType, number> = {
  D1: 1,
  D4: 4,
  D7: 7,
  D9: 9,
  D10: 10,
  D12: 12,
};

const DIVISIONAL_TYPES: DivisionalChartType[] = ["D1", "D4", "D7", "D9", "D10", "D12"];

const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

/** Max days to scan when locating a Saturn sign-change boundary (~30y window). */
const MAX_SCAN_DAYS = 30 * 400;

// ─── Small utilities ─────────────────────────────────────────────────────

function planetByName(chart: ChartData, name: PlanetName): PlanetResult | undefined {
  return chart.planets.find((p) => p.name === name);
}

/** Whole-sign house (1-12) that `longitude` occupies, anchored at `baseLongitude`. */
function houseFrom(longitude: number, baseLongitude: number): number {
  return getHouseFromLongitude(longitude, baseLongitude);
}

/** Degrees of `longitude` within its own sign (0-30). */
function degWithinSign(longitude: number): number {
  const sign = longitudeToSign(longitude);
  return longitude - (sign - 1) * 30;
}

/** Degree-within-sign (0-30) of a body's position inside a divisional chart. */
function divisionalDegreeWithin(totalDeg: number, chartType: DivisionalChartType): number {
  const count = AMSA_COUNT[chartType];
  const amsaSize = 30 / count;
  const remainder = ((totalDeg % amsaSize) + amsaSize) % amsaSize;
  return (remainder / amsaSize) * 30;
}

function isoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86400000);
}

function mod360(v: number): number {
  return ((v % 360) + 360) % 360;
}

/** Moon's birth Nakshatra index (1-27) from the Moon's sidereal longitude. */
function moonNakshatraIndex(chart: ChartData): number {
  const moon = planetByName(chart, "Moon");
  const lon = moon?.longitude ?? 0;
  const span = 360 / 27;
  return Math.min(27, Math.max(1, Math.floor(lon / span) + 1));
}

function asRange(start: Date | null, end: Date | null): DashaDateRange | null {
  if (!start || !end) return null;
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

// ─── Divisional Charts ───────────────────────────────────────────────────

/**
 * Build coordinate matrices for D1, D4, D7, D9, D10 and D12 from the cached
 * birth chart. Each matrix holds the Ascendant + all 9 planets with their
 * divisional sign, degree/minutes, whole-sign house and retrograde flag,
 * plus the 12 cusp signs derived from the divisional ascendant.
 */
export function computeDivisionalCharts(chart: ChartData): Record<DivisionalChartType, DivisionalChartMatrix> {
  const out = {} as Record<DivisionalChartType, DivisionalChartMatrix>;
  const lagnaLon = chart.ascendantLongitude;
  const lagnaSign = longitudeToSign(lagnaLon);
  const lagnaDeg = degWithinSign(lagnaLon);

  for (const type of DIVISIONAL_TYPES) {
    const divAscSign = getDivisionalAscendant(lagnaSign, lagnaDeg, type as ChartType);
    const ascDivDeg = type === "D1" ? lagnaDeg : divisionalDegreeWithin(lagnaLon, type);

    const coordinates: PlanetCoordinate[] = [];

    coordinates.push({
      planet: "ASC",
      sign: divAscSign,
      degree: Math.floor(ascDivDeg),
      minute: Math.round((ascDivDeg - Math.floor(ascDivDeg)) * 60) % 60,
      house: 1,
      retrograde: false,
    });

    for (const p of chart.planets) {
      const pDeg = degWithinSign(p.longitude);
      const divSign = getDivisionalSign(longitudeToSign(p.longitude), pDeg, type as ChartType);
      const divHouse = getDivisionalHouse(longitudeToSign(p.longitude), pDeg, divAscSign, type as ChartType);
      const divDeg = divisionalDegreeWithin(p.longitude, type);
      coordinates.push({
        planet: p.name as PlanetName,
        sign: divSign,
        degree: Math.floor(divDeg),
        minute: Math.round((divDeg - Math.floor(divDeg)) * 60) % 60,
        house: divHouse,
        retrograde: p.retrograde,
      });
    }

    const houseCusps: HouseCusp[] = [];
    for (let h = 1; h <= 12; h++) {
      houseCusps.push({ house: h, sign: signFrom(divAscSign, h - 1) });
    }

    out[type] = {
      chartType: type,
      ascendantSign: divAscSign,
      ascendantDegree: Math.floor(ascDivDeg),
      planetCoordinates: coordinates,
      houseCusps,
    };
  }

  return out;
}

// ─── Ashtakavarga ────────────────────────────────────────────────────────

/**
 * Sarvashtakavarga totals + per-planet Bhinnashtakavarga matrix.
 * `beneficialHouses` are those scoring above the 12-house average — a
 * scale-invariant rule so the result is meaningful regardless of internal
 * conventions used by the ashtakavarga engine.
 */
export function computeAshtakavargaReport(chart: ChartData): AshtakavargaReport {
  const ascSign = longitudeToSign(chart.ascendantLongitude);
  const positions: PlanetPosition[] = chart.planets.map((p) => ({
    planet: p.name,
    sign: longitudeToSign(p.longitude),
  }));

  const result = computeAshtakvarga(ascSign, positions);
  const sarvashtakavarga: number[] = result.sarvashtakvarga;
  const bhinnashtakvarga = result.bhinnashtakvarga;

  const average = sarvashtakavarga.reduce((a: number, b: number) => a + b, 0) / 12;
  const beneficialHouses: number[] = [];
  for (let h = 0; h < 12; h++) {
    if (sarvashtakavarga[h] > average) beneficialHouses.push(h + 1);
  }

  return {
    sarvashtakavarga: sarvashtakavarga.slice(),
    bhinnashtakvarga: { ...bhinnashtakvarga },
    beneficialHouses,
  };
}

// ─── Vimshottari Dasha ───────────────────────────────────────────────────

/**
 * Full 120-year Vimshottari hierarchy: 9 Mahadashas, each with its 9
 * Antardashas (nested start/end dates). The Mahadasha running at birth is
 * determined by the Moon's Nakshatra index (1-27 → 0-8 via modulo 9).
 */
export function computeVimshottari(
  birthDate: string,
  chart: ChartData,
  referenceDate: Date = new Date()
): VimshottariReport {
  const nak = moonNakshatraIndex(chart);
  const startLord = (nak - 1) % 9;

  const birth = new Date(birthDate);
  let cursor = new Date(birth);

  const mahadashas: MahadashaNode[] = [];
  for (let i = 0; i < 9; i++) {
    const lordIdx = (startLord + i) % 9;
    const years = DASHA_YEARS[lordIdx];
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + years);
    const startISO = isoDate(cursor);
    const endISO = isoDate(end);

    const antardashas: AntardashaNode[] = computeAntardashas(
      DASHA_LORDS[lordIdx],
      startISO,
      endISO
    ).map((ad) => ({ planet: ad.planet, startDate: ad.startDate, endDate: ad.endDate }));

    mahadashas.push({ lord: DASHA_LORDS[lordIdx], startDate: startISO, endDate: endISO, years, antardashas });
    cursor = end;
  }

  // Currently-running Mahadasha + Antardasha at the reference date.
  let current: CurrentDashaInfo | null = null;
  for (const m of mahadashas) {
    const ms = new Date(m.startDate);
    const me = new Date(m.endDate);
    if (referenceDate >= ms && referenceDate <= me) {
      let adMatch: AntardashaNode | null = null;
      for (const a of m.antardashas) {
        if (referenceDate >= new Date(a.startDate) && referenceDate <= new Date(a.endDate)) {
          adMatch = a;
          break;
        }
      }
      if (!adMatch && m.antardashas.length) adMatch = m.antardashas[0];
      current = {
        mahadasha: m.lord,
        antardasha: adMatch?.planet ?? "",
        startDate: adMatch?.startDate ?? m.startDate,
        endDate: adMatch?.endDate ?? m.endDate,
      };
      break;
    }
  }
  if (!current) {
    const m0 = mahadashas[0];
    const ad0 = m0.antardashas[0];
    current = { mahadasha: m0.lord, antardasha: ad0?.planet ?? "", startDate: m0.startDate, endDate: ad0?.endDate ?? m0.endDate };
  }

  return {
    mahadashas,
    currentDasha: current,
    birthMahadasha: DASHA_LORDS[startLord],
  };
}

// ─── Dosha checks ────────────────────────────────────────────────────────

/**
 * Deterministic Mangal (Kuja) Dosha from three bases — Lagna, Moon and Venus —
 * plus the classical cancellation rules (own/exalted sign, Mangal-Shukra
 * conjunction, Jupiter in kendra, Mars in kendra from Lagna & Moon).
 */
export function computeMangalDosha(chart: ChartData): MangalDoshaReport {
  const ascLon = chart.ascendantLongitude;
  const mars = planetByName(chart, "Mars");
  const moon = planetByName(chart, "Moon");
  const venus = planetByName(chart, "Venus");
  const jupiter = planetByName(chart, "Jupiter");

  const marsLon = mars ? mars.longitude : ascLon;
  const marsSign = longitudeToSign(marsLon);
  const moonLon = moon ? moon.longitude : ascLon;
  const venusLon = venus ? venus.longitude : ascLon;

  const lagnaH = houseFrom(marsLon, ascLon);
  const moonH = houseFrom(marsLon, moonLon);
  const venusH = houseFrom(marsLon, venusLon);

  const lagnaBase = { base: "Lagna", marsHouse: lagnaH, inManglikHouse: MANGAL_HOUSES.includes(lagnaH) };
  const moonBase = { base: "Moon", marsHouse: moonH, inManglikHouse: MANGAL_HOUSES.includes(moonH) };
  const venusBase = { base: "Venus", marsHouse: venusH, inManglikHouse: MANGAL_HOUSES.includes(venusH) };

  const isPresent = lagnaBase.inManglikHouse || moonBase.inManglikHouse || venusBase.inManglikHouse;

  const cancellations: string[] = [];
  if (MARS_OWN_SIGNS.includes(marsSign)) {
    cancellations.push("Mars is in its own sign (Aries/Scorpio), which cancels Mangal Dosha.");
  }
  if (marsSign === MARS_EXALTED_SIGN) {
    cancellations.push("Mars is exalted in Capricorn, which neutralises the Dosha.");
  }
  if (mars && venus && marsSign === longitudeToSign(venusLon)) {
    cancellations.push("Mars conjoins Venus (Mangal-Shukra yuti), a classic cancellation.");
  }
  if (mars && jupiter) {
    const jupiterFromMars = houseFrom(jupiter.longitude, marsLon);
    if (KENDRA_HOUSES.includes(jupiterFromMars)) {
      cancellations.push("Jupiter occupies a kendra from Mars, providing natural cancellation.");
    }
  }
  if (KENDRA_HOUSES.includes(lagnaH) && KENDRA_HOUSES.includes(moonH)) {
    cancellations.push("Mars sits in a kendra from both Lagna and Moon, balancing its energy.");
  }

  let severity: MangalSeverity = "none";
  if (isPresent) {
    if (cancellations.length > 0) {
      severity = "mild";
    } else if ([1, 4].includes(lagnaH)) {
      severity = "severe";
    } else if ([7, 8].includes(lagnaH)) {
      severity = "moderate";
    } else {
      severity = "mild";
    }
  }

  let description = "";
  if (!isPresent) {
    description = "Mars does not occupy a Manglik house from the Lagna, Moon or Venus — no Mangal Dosha is present.";
  } else if (cancellations.length > 0) {
    description = `Mars is in house ${lagnaH} from Lagna (house ${moonH} from Moon), but the Dosha is neutralised: ${cancellations[0]}`;
  } else {
    description = `Mars occupies house ${lagnaH} from the Lagna (house ${moonH} from the Moon, house ${venusH} from Venus), triggering Mangal Dosha.`;
  }

  const isNeutralized = isPresent && cancellations.length > 0;

  const strongRemedies = [
    "Recite Hanuman Chalisa every Tuesday for 43 days.",
    "Worship Lord Hanuman and offer sindoor at the temple.",
    "Consider Kumbh Vivah (symbolic marriage to a water-pot) before the final wedding.",
    "Donate wheat, jaggery and red cloth on Tuesdays.",
    "Wear a properly-charged red coral (Moonga) ring on the ring finger of the dominant hand.",
  ];
  const lightRemedies = [
    "No strong Manglik remedies are required; maintain regular spiritual practice.",
    "Avoid unnecessary delays or doubts in partnerships.",
  ];

  return {
    isPresent,
    severity,
    bases: { lagna: lagnaBase, moon: moonBase, venus: venusBase },
    cancellations,
    isNeutralized,
    description,
    remedies: isNeutralized || !isPresent ? lightRemedies : strongRemedies,
  };
}

/* Scan Saturn's *mean* sign one day at a time. Returns the date of the first
 * sign transition satisfying `predicate(prevInArc, curInArc)`, or null.
 * Using mean Saturn (monotonic) keeps boundary detection clean. */
function scanSaturnTransition(
  from: Date,
  direction: 1 | -1,
  arc: Set<number>,
  predicate: (prevIn: boolean, curIn: boolean) => boolean,
  maxDays: number
): Date | null {
  let prev = new Date(from);
  let prevIn = arc.has(getSaturnMeanSign(prev));
  let cur = addDays(prev, direction);
  for (let i = 0; i < maxDays; i++) {
    const curIn = arc.has(getSaturnMeanSign(cur));
    if (curIn !== prevIn && predicate(prevIn, curIn)) return new Date(cur);
    prevIn = curIn;
    prev = cur;
    cur = addDays(cur, direction);
  }
  return null;
}

/* Walk forward from `from` until Saturn's mean sign equals `targetSign`. */
function findSignEquals(from: Date, targetSign: number, maxDays: number): Date | null {
  let cur = new Date(from);
  for (let i = 0; i < maxDays; i++) {
    if (getSaturnMeanSign(cur) === targetSign) return new Date(cur);
    cur = addDays(cur, 1);
  }
  return null;
}

/**
 * Deterministic Sade Sati (Saturn's 12th/1st/2nd transit from the natal Moon)
 * and Dhaiya (11th/3rd) evaluation with ISO date-range boundaries.
 *
 * Boundaries are computed from Saturn's *mean* sidereal longitude (monotonic,
 * no retrograde wobble) so the half-open phase windows are reproducible.
 */
export function computeSadeSati(chart: ChartData, referenceDate: Date = new Date()): SadeSatiReport {
  const moon = planetByName(chart, "Moon");
  const moonSign = longitudeToSign(moon ? moon.longitude : 0);

  const risingSign = signFrom(moonSign, -1);
  const peakSign = moonSign;
  const settingSign = signFrom(moonSign, 1);
  const sadeArc = new Set<number>([risingSign, peakSign, settingSign]);
  const dhaiyaArc = new Set<number>([signFrom(moonSign, -2), signFrom(moonSign, 2)]);

  const satNow = getSaturnMeanSign(referenceDate);
  const inSadeArc = sadeArc.has(satNow);
  const inDhaiyaArc = dhaiyaArc.has(satNow);

  let entry: Date | null = null;
  let exit: Date | null = null;

  if (inSadeArc) {
    // Walk back to the last day Saturn was OUTSIDE the arc; +1 day = entry day.
    const outside = scanSaturnTransition(referenceDate, -1, sadeArc, (_prev, cur) => !cur, MAX_SCAN_DAYS);
    if (outside) entry = addDays(outside, 1);
    if (entry) exit = scanSaturnTransition(entry, 1, sadeArc, (prev) => prev, MAX_SCAN_DAYS) ?? null;
  } else {
    entry = scanSaturnTransition(referenceDate, 1, sadeArc, (_prev, cur) => cur, MAX_SCAN_DAYS) ?? null;
    if (entry) exit = scanSaturnTransition(entry, 1, sadeArc, (prev) => prev, MAX_SCAN_DAYS) ?? null;
  }

  const phaseRanges: Record<SadeSatiPhase, DashaDateRange | null> = {
    rising: null,
    peak: null,
    setting: null,
    inactive: null,
  };
  if (entry && exit) {
    const peakDate = findSignEquals(entry, peakSign, MAX_SCAN_DAYS);
    const settingDate = peakDate ? findSignEquals(peakDate, settingSign, MAX_SCAN_DAYS) : null;
    phaseRanges.rising = asRange(entry, peakDate);
    phaseRanges.peak = asRange(peakDate, settingDate);
    phaseRanges.setting = asRange(settingDate, exit);
  }

  let phase: SadeSatiPhase = "inactive";
  if (inSadeArc) {
    if (satNow === risingSign) phase = "rising";
    else if (satNow === peakSign) phase = "peak";
    else if (satNow === settingSign) phase = "setting";
    else phase = "inactive";
  }

  // Dhaiya window around the reference date.
  let dhaiyaActive = false;
  let dhaiyaPhase: DhaiyaPhase = "inactive";
  let dhaiyaStart: Date | null = null;
  let dhaiyaEnd: Date | null = null;
  if (inDhaiyaArc) {
    dhaiyaActive = true;
    dhaiyaPhase = satNow === signFrom(moonSign, -2) ? "pre" : "post";
    const outside = scanSaturnTransition(referenceDate, -1, dhaiyaArc, (_prev, cur) => !cur, MAX_SCAN_DAYS);
    if (outside) dhaiyaStart = addDays(outside, 1);
    if (dhaiyaStart) dhaiyaEnd = scanSaturnTransition(dhaiyaStart, 1, dhaiyaArc, (prev) => prev, MAX_SCAN_DAYS) ?? null;
  }

  const remedies = inSadeArc
    ? [
        "Recite Shani Chalisa daily, especially on Saturdays.",
        "Offer mustard oil, black sesame and urad dal to Lord Shani at the temple every Saturday.",
        "Donate black cloth, iron articles and black sesame on Saturdays.",
        "Observe a Saturday fast or eat a single satvik meal.",
        "Serve the elderly and underprivileged through regular seva.",
      ]
    : ["Maintain your regular spiritual practice; no special Sade Sati remedy is required right now."];

  let description: string;
  if (inSadeArc) {
    description = `Saturn is transiting the ${phase} phase of Sade Sati (12th/1st/2nd from the natal Moon in sign ${moonSign}).`;
  } else {
    const next = entry ? isoDate(entry) : "a coming date";
    description = `Saturn is not currently in Sade Sati from the natal Moon (sign ${moonSign}). The next cycle begins around ${next}.`;
  }

  return {
    isActive: inSadeArc,
    phase,
    moonSign,
    saturnSignNow: satNow,
    activePeriod: inSadeArc ? asRange(entry, exit) : null,
    phaseRanges,
    dhaiya: { isActive: dhaiyaActive, phase: dhaiyaPhase, period: asRange(dhaiyaStart, dhaiyaEnd) },
    remedies,
    description,
  };
}

// ─── Kaal Sarp ───────────────────────────────────────────────────────────

/**
 * Deterministic Kaal Sarp Dosha: all 7 natural planets sit on one
 * 180° semicircle between Rahu and Ketu.
 */
export function computeKaalSarp(chart: ChartData): KaalSarpReport {
  const rahu = planetByName(chart, "Rahu");
  const ketu = planetByName(chart, "Ketu");
  if (!rahu || !ketu) {
    return {
      isPresent: false,
      RahuSign: 0,
      KetuSign: 0,
      description: "Insufficient planet data to evaluate Kaal Sarp Dosha.",
      remedies: [],
    };
  }

  const rahuLon = rahu.longitude;
  const offsets = NATURAL_PLANETS.map((p) => {
    const planet = planetByName(chart, p);
    return planet ? mod360(planet.longitude - rahuLon) : null;
  }).filter((o): o is number => o !== null);

  // All planets on the same side of the Rahu-Ketu axis (<180° or >180°).
  const sideA = offsets.every((o) => o < 180);
  const sideB = offsets.every((o) => o > 180);
  const isPresent = sideA || sideB;

  const rahuSign = longitudeToSign(rahuLon);
  const ketuSign = longitudeToSign(ketu.longitude);

  const description = isPresent
    ? "All seven natural planets sit on one side of the Rahu-Ketu axis, forming Kaal Sarp Dosha."
    : "The seven planets are distributed on both sides of the Rahu-Ketu axis; no Kaal Sarp Dosha is formed.";

  const remedies = isPresent
    ? [
        "Recite the Kaal Sarp mantra 'Om Hraam Hreem Hoom Hanu Hanat Hanapathakaya Sarvadosha Kshaya Hreem Shreem Mahalakshaye Namaha' daily.",
        "Perform Rudra Abhishek on Maha Shivaratri and every Shukla Paksha Trayodashi.",
        "Keep a crystal or rudraksha in the south-west corner of the home.",
        "Complete the Navratri Kanya Puja and Durga Saptashati path.",
      ]
    : ["No Kaal Sarp Dosha remedies are required."];

  return { isPresent, RahuSign: rahuSign, KetuSign: ketuSign, description, remedies };
}

/** Aggregate of all deterministic dosha checks. */
export function computeDoshaReport(chart: ChartData, referenceDate: Date = new Date()): DoshaReport {
  return {
    mangal: computeMangalDosha(chart),
    sadeSati: computeSadeSati(chart, referenceDate),
    kaalSarp: computeKaalSarp(chart),
  };
}

// ─── Yogas ───────────────────────────────────────────────────────────────

/** True if two signs are kendra (0/3/6/9) apart. */
function inKendra(a: number, b: number): boolean {
  return KENDRA_HOUSES.includes(((a - b + 12) % 12) + 1);
}

function planetSign(chart: ChartData, name: PlanetName): number | null {
  const p = planetByName(chart, name);
  return p ? longitudeToSign(p.longitude) : null;
}

function planetHouse(chart: ChartData, name: PlanetName): number | null {
  const p = planetByName(chart, name);
  return p ? getHouseFromLongitude(p.longitude, chart.ascendantLongitude) : null;
}

/** Lord planet of a whole-sign house counted from `baseSign`. */
function lordOfHouse(baseSign: number, house: number): string | null {
  const sign = signFrom(baseSign, house - 1);
  return SIGN_LORDS[sign] ?? null;
}

function yogaStrength(present: boolean, strong = false): YogaStrength {
  if (!present) return "weak";
  return strong ? "strong" : "moderate";
}

/**
 * Deterministic major yoga detection: Gajakesari, Budha-Aditya and a set of
 * classic Dhana (wealth) yogas, all derived from the birth chart positions.
 */
export function computeYogaReport(chart: ChartData): YogaReport {
  const moonSign = planetSign(chart, "Moon");
  const jupiterSign = planetSign(chart, "Jupiter");
  const sunSign = planetSign(chart, "Sun");
  const mercurySign = planetSign(chart, "Mercury");
  const venusSign = planetSign(chart, "Venus");
  const ascSign = longitudeToSign(chart.ascendantLongitude);

  // Gajakesari: Moon & Jupiter in mutual kendra (or conjunction).
  const gajakesariPresent =
    !!moonSign && !!jupiterSign && (moonSign === jupiterSign || inKendra(moonSign, jupiterSign));
  const gajakesari: YogaCheck = {
    name: "Gajakesari Yoga",
    isPresent: gajakesariPresent,
    strength: yogaStrength(gajakesariPresent, true),
    description: gajakesariPresent
      ? "Moon and Jupiter are in mutual kendra (or conjunction), bestowing wisdom, wealth and fame."
      : "Moon and Jupiter are not in mutual kendra; Gajakesari Yoga is not formed.",
  };

  // Budha-Aditya: Sun & Mercury conjunct in the same sign and house.
  const sunHouse = planetHouse(chart, "Sun");
  const mercuryHouse = planetHouse(chart, "Mercury");
  const budhadityaPresent =
    !!sunSign &&
    !!mercurySign &&
    sunSign === mercurySign &&
    sunHouse !== null &&
    sunHouse === mercuryHouse;
  const budhaditya: YogaCheck = {
    name: "Budha-Aditya Yoga",
    isPresent: budhadityaPresent,
    strength: yogaStrength(budhadityaPresent),
    description: budhadityaPresent
      ? "Sun and Mercury are conjunct in the same sign and house, indicating sharp intellect and communication prowess."
      : "Sun and Mercury are not conjunct; Budha-Aditya Yoga is not formed.",
  };

  const dhanaYogas: DhanaYoga[] = [];

  // 1. Eleventh-lord in 11th from Lagna.
  const eleventhLord = lordOfHouse(ascSign, 11);
  if (eleventhLord) {
    const h = planetHouse(chart, eleventhLord as PlanetName);
    const present = h === 11;
    dhanaYogas.push({
      name: "Eleventh-lord in 11th",
      planets: present ? [eleventhLord] : [],
      houses: present ? [11] : [],
      isPresent: present,
      description: present
        ? `The lord of the 11th house (${eleventhLord}) is placed in the 11th house, a classic Dhana Yoga.`
        : `The lord of the 11th house (${eleventhLord}) is not placed in the 11th.`,
    });
  }

  // 2. Second-lord in a kendra from Lagna.
  const secondLord = lordOfHouse(ascSign, 2);
  if (secondLord) {
    const h = planetHouse(chart, secondLord as PlanetName);
    const present = h !== null && KENDRA_HOUSES.includes(h);
    dhanaYogas.push({
      name: "Second-lord in Kendra",
      planets: present ? [secondLord] : [],
      houses: present ? [h!] : [],
      isPresent: present,
      description: present
        ? `The 2nd lord (${secondLord}) occupies a kendra (house ${h}), strengthening wealth creation.`
        : `The 2nd lord (${secondLord}) is not placed in a kendra.`,
    });
  }

  // 3. Lakshmi Yoga: 9th & 10th lords both in kendras from Lagna.
  const ninthLord = lordOfHouse(ascSign, 9);
  const tenthLord = lordOfHouse(ascSign, 10);
  const ninthH = ninthLord ? planetHouse(chart, ninthLord as PlanetName) : null;
  const tenthH = tenthLord ? planetHouse(chart, tenthLord as PlanetName) : null;
  const lakshmiPresent =
    ninthH !== null && KENDRA_HOUSES.includes(ninthH) &&
    tenthH !== null && KENDRA_HOUSES.includes(tenthH);
  dhanaYogas.push({
    name: "Lakshmi Yoga",
    planets: lakshmiPresent ? [ninthLord!, tenthLord!] : [],
    houses: lakshmiPresent ? [ninthH!, tenthH!] : [],
    isPresent: lakshmiPresent,
    description: lakshmiPresent
      ? "The 9th and 10th lords are both well-placed in kendras, forming Lakshmi Yoga (prosperity)."
      : "The 9th and 10th lords are not both in kendras; Lakshmi Yoga is not formed.",
  });

  // 4. Parardhi Dhan Yoga: Moon in a kendra/trikona from Lagna.
  const moonH = planetHouse(chart, "Moon");
  const parardhiPresent = moonH !== null && (KENDRA_HOUSES.includes(moonH) || TRIKONA_HOUSES.includes(moonH));
  dhanaYogas.push({
    name: "Parardhi Dhan Yoga",
    planets: parardhiPresent ? ["Moon"] : [],
    houses: parardhiPresent ? [moonH!] : [],
    isPresent: parardhiPresent,
    description: parardhiPresent
      ? `The Moon occupies a kendra/trikona (house ${moonH}), a Parardhi Dhan Yoga.`
      : "The Moon is not placed in a kendra/trikona from the Lagna.",
  });

  // 5. Chamunda Yoga: Jupiter in 11th from the Moon.
  const jupiterFromMoon =
    moonSign !== null && jupiterSign !== null
      ? ((jupiterSign - moonSign + 12) % 12) + 1
      : 0;
  const chamundaPresent = jupiterFromMoon === 11;
  dhanaYogas.push({
    name: "Chamunda Yoga",
    planets: chamundaPresent ? ["Jupiter"] : [],
    houses: chamundaPresent ? [11] : [],
    isPresent: chamundaPresent,
    description: chamundaPresent
      ? "Jupiter is placed in the 11th from the Moon, forming Chamunda (Dhana) Yoga."
      : "Jupiter is not in the 11th from the Moon.",
  });

  // 6. Venus in 2nd/11th from Moon (wealth via relationships).
  const venusFromMoon =
    moonSign !== null && venusSign !== null
      ? ((venusSign - moonSign + 12) % 12) + 1
      : 0;
  const venusDhanaPresent = venusFromMoon === 11 || venusFromMoon === 2;
  dhanaYogas.push({
    name: "Venus in 2nd/11th from Moon",
    planets: venusDhanaPresent ? ["Venus"] : [],
    houses: venusDhanaPresent ? [venusFromMoon] : [],
    isPresent: venusDhanaPresent,
    description: venusDhanaPresent
      ? "Venus occupies the 2nd or 11th from the Moon, reinforcing wealth and relationships."
      : "Venus is not in the 2nd/11th from the Moon.",
  });

  const presentDhana = dhanaYogas.filter((d) => d.isPresent);
  return {
    gajakesari,
    budhaditya,
    dhanaYogas: presentDhana.length ? presentDhana : dhanaYogas,
  };
}

// ─── Aggregate ───────────────────────────────────────────────────────────

/**
 * Assemble the deterministic calculations layer for one birth chart.
 * Returns the `KundliCalculations` payload (the `calculations` field of
 * `FullKundliReportData`).
 */
export function computeKundliCalculations(
  chart: ChartData,
  birthDate: string,
  referenceDate: Date = new Date()
): KundliCalculations {
  const lagna: LagnaSummary = {
    ascendantSign: longitudeToSign(chart.ascendantLongitude),
    ascendantDegree: degWithinSign(chart.ascendantLongitude),
    moonSign: longitudeToSign(planetByName(chart, "Moon")?.longitude ?? chart.ascendantLongitude),
    sunSign: longitudeToSign(planetByName(chart, "Sun")?.longitude ?? chart.ascendantLongitude),
    moonNakshatraIndex: moonNakshatraIndex(chart),
    moonNakshatra: planetByName(chart, "Moon")?.nakshatra ?? "",
  };

  return {
    lagna,
    divisionalCharts: computeDivisionalCharts(chart),
    ashtakavarga: computeAshtakavargaReport(chart),
    vimshottari: computeVimshottari(birthDate, chart, referenceDate),
    doshas: computeDoshaReport(chart, referenceDate),
    yogas: computeYogaReport(chart),
    metadata: {
      engineVersion: CHART_ENGINE_VERSION,
      referenceDate: isoDate(new Date(referenceDate)),
      birthDate,
      moonNakshatraIndex: lagna.moonNakshatraIndex,
      saturnMeanSidereal: true,
    },
  };
}
