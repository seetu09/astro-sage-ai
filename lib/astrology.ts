// ─── Astronomy Helpers ────────────────────────────────────────────────────
// Deterministic Vedic calculation engine using Lahiri Ayanamsa (Chitra Paksha).
// No external HTTP calls — all positions computed from Keplerian orbital
// elements with a Newton–Raphson eccentric-anomaly solver, giving geocentric
// ecliptic longitudes accurate to a fraction of a degree for modern dates.

import { NAKSHATRA_NAMES } from "@/lib/astrologyDictionary";

export const DEFAULT_NOON_TIME = "12:00";

/**
 * Resolve the birth time for calculations.
 * When the time is unknown or missing, default to 12:00 (noon),
 * which is the conventional reference time for Surya/Chandra chart estimation.
 */
export function resolveBirthTime(birthTime: string, timeUnknown: boolean): string {
  return timeUnknown || !birthTime ? DEFAULT_NOON_TIME : birthTime;
}

/**
 * Parse a timezone offset string like "+05:30" or "-08:00" into signed minutes.
 */
export function parseTimezoneOffset(offset: string): number {
  const match = String(offset || "+05:30").match(/^([+-])(\d{2}):(\d{2})$/);
  if (!match) return 330; // default IST
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (parseInt(match[2], 10) * 60 + parseInt(match[3], 10));
}

/**
 * Calculate the Julian Day (UT) from a local calendar date and time,
 * converting local → UT by subtracting the timezone offset.
 */
export function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  offsetMinutes: number = 0
): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  // Local clock time → UT (subtract offset), then to JD fraction
  jd += (hour - offsetMinutes / 60 - 12) / 24 + minute / 1440;
  return jd;
}

/**
 * Lahiri Ayanamsa (Chitra Paksha) in degrees.
 * Anchored so that Spica (Chitra) sits at exactly 180°00' sidereal.
 * Formula: 23.85 + 0.0137 * T, where T is centuries since J2000.0.
 */
export function calculateAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  return 23.85 + 0.0137 * t;
}

// ─── Orbital elements (J2000, with per-century rates) ──────────────────────
// [a(AU), e, i(deg), L(deg), longPeri(deg), longNode(deg)] + rates/century

interface OrbitElements {
  a: number; e: number; i: number; L: number; peri: number; node: number;
  da: number; de: number; di: number; dL: number; dPeri: number; dNode: number;
}

const ORBITS: Record<string, OrbitElements> = {
  Mercury: { a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.25032350, peri: 77.45779628, node: 48.33076593,
             da: 0.00000037, de: 0.00001906, di: -0.00594749, dL: 149472.67411175, dPeri: 0.16047689, dNode: -0.12534081 },
  Venus:   { a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.97909950, peri: 131.60246718, node: 76.67984255,
             da: 0.00000390, de: -0.00004107, di: -0.00078890, dL: 58517.81538729, dPeri: 0.00268329, dNode: -0.27769418 },
  Earth:   { a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, peri: 102.93768193, node: 0.0,
             da: 0.00000562, de: -0.00004392, di: -0.01294668, dL: 35999.37244981, dPeri: 0.32327364, dNode: 0.0 },
  Mars:    { a: 1.52371034, e: 0.09339410, i: 1.84969142, L: -4.55343205, peri: -23.94362959, node: 49.55953891,
             da: 0.00001847, de: 0.00007882, di: -0.00813131, dL: 19140.30268499, dPeri: 0.44441088, dNode: -0.29257343 },
  Jupiter: { a: 5.20288700, e: 0.04838624, i: 1.30439695, L: 34.39644051, peri: 14.72847983, node: 100.47390909,
             da: -0.00011607, de: -0.00013253, di: -0.00183714, dL: 3034.74612775, dPeri: 0.21252668, dNode: 0.20469106 },
  Saturn:  { a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, peri: 92.59887831, node: 113.66242448,
             da: -0.00125060, de: -0.00050991, di: 0.00193609, dL: 1222.49362201, dPeri: -0.41897216, dNode: -0.28867794 },
};

const DEG = Math.PI / 180;

/** Normalize an angle to [0, 360). */
function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

/** Solve Kepler's equation M = E − e·sin(E) via Newton–Raphson. */
function solveKepler(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let k = 0; k < 8; k++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

/**
 * Heliocentric ecliptic longitude of a planet at Julian Day jd (UT).
 */
function heliocentricLongitude(planet: keyof typeof ORBITS | "Earth", jd: number): number {
  const o = ORBITS[planet];
  const T = (jd - 2451545.0) / 36525;

  const a = o.a + o.da * T;
  const e = o.e + o.de * T;
  const i = (o.i + o.di * T) * DEG;
  const L = norm360(o.L + o.dL * T);
  const w = (o.peri + o.dPeri * T) * DEG; // longitude of perihelion
  const O = (o.node + o.dNode * T) * DEG; // longitude of ascending node

  const M = norm360(L - w / DEG) * DEG; // mean anomaly
  const nu = solveKepler(M, e);          // eccentric anomaly ≈ true anomaly here
  const r = a * (1 - e * Math.cos(nu));  // heliocentric distance

  // Argument of latitude & heliocentric longitude in the orbital plane
  const xp = a * (Math.cos(nu) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(nu);

  // Rotate to ecliptic coordinates
  const cosO = Math.cos(O), sinO = Math.sin(O);
  const cosI = Math.cos(i), sinI = Math.sin(i);

  const x = (cosO * cosW(w) - sinO * sinW(w) * cosI) * xp + (-cosO * sinW(w) - sinO * cosW(w) * cosI) * yp;
  const y = (sinO * cosW(w) + cosO * sinW(w) * cosI) * xp + (-sinO * sinW(w) + cosO * cosW(w) * cosI) * yp;

  return norm360(Math.atan2(y, x) / DEG);
}

// helper to avoid recomputing trig of w repeatedly
function cosW(w: number): number { return Math.cos(w); }
function sinW(w: number): number { return Math.sin(w); }

/**
 * Geocentric apparent ecliptic longitude of a planet (tropical, degrees).
 * Uses light-time correction (~ minutes) and simple aberration-free model.
 */
function geocentricLongitude(planet: "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn", jd: number): number {
  const earthLon = heliocentricLongitude("Earth", jd);
  const planetLon = heliocentricLongitude(planet, jd);

  const earthR = heliocentricDistance("Earth", jd);
  const planetR = heliocentricDistance(planet, jd);

  // Convert both to cartesian in the ecliptic plane (ignore small latitudes)
  const ex = earthR * Math.cos(earthLon * DEG);
  const ey = earthR * Math.sin(earthLon * DEG);
  const px = planetR * Math.cos(planetLon * DEG);
  const py = planetR * Math.sin(planetLon * DEG);

  // Geocentric vector
  const gx = px - ex;
  const gy = py - ey;

  return norm360(Math.atan2(gy, gx) / DEG);
}

function heliocentricDistance(planet: keyof typeof ORBITS | "Earth", jd: number): number {
  const o = ORBITS[planet];
  const T = (jd - 2451545.0) / 36525;

  const a = o.a + o.da * T;
  const e = o.e + o.de * T;
  const L = norm360(o.L + o.dL * T);
  const w = (o.peri + o.dPeri * T) * DEG;

  const M = norm360(L - w / DEG) * DEG;
  const nu = solveKepler(M, e);
  return a * (1 - e * Math.cos(nu));
}

/**
 * Apparent tropical longitude of the Sun (degrees).
 */
export function getSunLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  let longitude = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const meanAnomaly = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const rad = meanAnomaly * DEG;
  const center =
    (1.914602 - 0.004789 * t - 0.000014 * t * t) * Math.sin(rad) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * rad) +
    0.000289 * Math.sin(3 * rad);
  longitude += center;
  return norm360(longitude);
}

/**
 * Apparent tropical longitude of the Moon (degrees).
 * Truncated ELP series — good to ~0.3°.
 */
export function getMoonLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const Lp =
    218.3164477 +
    481267.88123421 * t -
    0.0015786 * t * t +
    t * t * t / 538841 -
    t * t * t * t / 65194000;
  const D = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;      // mean elongation
  const M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;       // Sun mean anomaly
  const Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;     // Moon mean anomaly
  const F = 93.2720950 + 483202.0175233 * t - 0.0036539 * t * t;       // argument of latitude

  let longitude =
    Lp +
    6.288774 * Math.sin(Mp * DEG) +
    1.274027 * Math.sin((2 * D - Mp) * DEG) +
    0.658314 * Math.sin(2 * D * DEG) +
    0.213618 * Math.sin(2 * Mp * DEG) -
    0.185116 * Math.sin(M * DEG) -
    0.114332 * Math.sin(2 * F * DEG) +
    0.058793 * Math.sin((2 * D - 2 * Mp) * DEG) +
    0.057066 * Math.sin((2 * D - M - Mp) * DEG) +
    0.053322 * Math.sin((2 * D + Mp) * DEG) +
    0.045758 * Math.sin((2 * D - M) * DEG) -
    0.040923 * Math.sin((M - Mp) * DEG) -
    0.034720 * Math.sin(D * DEG) -
    0.030383 * Math.sin((M + Mp) * DEG);

  return norm360(longitude);
}

/**
 * Mean tropical longitude of Rahu (Moon's ascending node, degrees).
 * Moves retrograde ~19.3°/year.
 */
export function getRahuLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  return norm360(125.04452 - 1934.136261 * t + 0.0020708 * t * t + t * t * t / 450000);
}

/**
 * Convert a longitude (0-360) to a sign number (1-12).
 */
export function longitudeToSign(longitude: number): number {
  return Math.floor(norm360(longitude) / 30) + 1;
}

const SIGN_NAMES_EN = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_NAMES_HI = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन",
];

/** Get the sign name (English) for a sign number (1-12). */
export function signNumberToName(signNum: number): string {
  return SIGN_NAMES_EN[(signNum - 1 + 12) % 12] ?? "Aries";
}

/** Get the sign name with Hindi transliteration, e.g. "Aquarius (कुंभ)". */
export function signNameWithHindi(signNum: number): string {
  const en = signNumberToName(signNum);
  const hi = SIGN_NAMES_HI[(signNum - 1 + 12) % 12] ?? en;
  return `${en} (${hi})`;
}

/**
 * Get the nakshatra index (1-27) and pada (1-4) for a longitude.
 */
export function getNakshatra(longitude: number): { index: number; pada: number } {
  const span = 360 / 27;
  const lon = norm360(longitude);
  const index = Math.floor(lon / span); // 0-26
  const pada = Math.floor((lon % span) / (span / 4)) + 1; // 1-4
  return { index: index + 1, pada }; // 1-27
}

/** Get the nakshatra name (English) for a longitude. */
export function getNakshatraName(longitude: number): string {
  const { index } = getNakshatra(longitude);
  return NAKSHATRA_NAMES.en[index - 1] ?? "Revati";
}

/** Get the nakshatra name with Hindi, e.g. "Shravana (श्रवण)". */
export function getNakshatraNameWithHindi(longitude: number): string {
  const { index } = getNakshatra(longitude);
  const en = NAKSHATRA_NAMES.en[index - 1] ?? "Revati";
  const hi = NAKSHATRA_NAMES.hi[index - 1] ?? en;
  return `${en} (${hi})`;
}

/** Format a degree (0-30) as a zero-padded DMS string like "23°14'" / "04°05'". */
export function formatDegreeDMS(degree: number): string {
  const d = Math.min(29, Math.max(0, Math.floor(degree)));
  const m = Math.round((degree - d) * 60);
  const mm = m === 60 ? 59 : m;
  return `${String(d).padStart(2, "0")}°${String(mm).padStart(2, "0")}'`;
}

/**
 * Calculate the Ascendant (Lagna) for a given Julian Day (UT),
 * geographic latitude and east-positive longitude, using Lahiri Ayanamsa.
 *
 * ASC = arctan2( cos(LST), −[sin(LST)·cos ε + tan φ · sin ε] )
 * then converted to sidereal by subtracting the ayanamsa.
 */
export function calculateAscendant(
  jd: number,
  latitude: number,
  longitudeEast: number
): { sign: number; degree: number; longitude: number } {
  const ayanamsa = calculateAyanamsa(jd);

  // Greenwich Mean Sidereal Time (degrees)
  const T = (jd - 2451545.0) / 36525;
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;

  // Local Sidereal Time (degrees)
  const lst = norm360(gmst + longitudeEast);
  const lstRad = lst * DEG;
  const phi = latitude * DEG;
  const eps = 23.4392911 * DEG; // obliquity of the ecliptic

  // Ascendant formula (eastern horizon)
  const ascTropical = norm360(
    Math.atan2(
      Math.cos(lstRad),
      -(Math.sin(lstRad) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))
    ) / DEG
  );

  const siderealAsc = norm360(ascTropical - ayanamsa);
  const sign = longitudeToSign(siderealAsc);
  const degree = siderealAsc - (sign - 1) * 30;

  return { sign, degree, longitude: siderealAsc };
}

/**
 * Sidereal longitude of any supported body at Julian Day jd (UT).
 */
export function getSiderealLongitude(jd: number, body: string): number {
  let tropical: number;
  switch (body) {
    case "Sun": tropical = getSunLongitude(jd); break;
    case "Moon": tropical = getMoonLongitude(jd); break;
    case "Rahu": tropical = getRahuLongitude(jd); break;
    case "Ketu": tropical = norm360(getRahuLongitude(jd) + 180); break;
    default:
      tropical = geocentricLongitude(body as "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn", jd);
  }
  return norm360(tropical - calculateAyanamsa(jd));
}

/**
 * Determine which house a planet occupies based on its sidereal longitude
 * and the ascendant longitude, using Vedic whole-sign houses: the entire
 * sign containing the ascendant is house 1, the next sign house 2, etc.
 */
export function getHouseFromLongitude(planetLong: number, ascLong: number): number {
  const planetSign = longitudeToSign(planetLong);
  const ascSign = longitudeToSign(ascLong);
  return ((planetSign - ascSign + 12) % 12) + 1;
}

/**
 * Retrograde detection via finite difference of the geocentric longitude.
 * Rahu/Ketu are always retrograde by definition.
 */
export function isPlanetRetrograde(jd: number, body: string): boolean {
  if (body === "Rahu" || body === "Ketu") return true;
  const before = getSiderealLongitude(jd - 1, body);
  const after = getSiderealLongitude(jd + 1, body);
  let delta = after - before;
  delta = ((delta + 180) % 360 + 360) % 360 - 180;
  return delta < 0;
}

/**
 * Sign number (1-12) reached by counting `steps` signs ahead of `baseSign`.
 * Negative `steps` walk backward; the arithmetic is modulo-12 with 1-based
 * output, so `signFrom(1, -1)` === 12.
 */
export function signFrom(baseSign: number, steps: number): number {
  return (((baseSign - 1 + steps) % 12 + 12) % 12) + 1;
}

/**
 * Mean (monotonic) sidereal longitude of Saturn in degrees.
 *
 * Uses the J2000 mean longitude + secular rate from the orbital-element table
 * with the Lahiri Ayanamsa removed. Mean motion is deliberately monotonic
 * (no retrograde wobble), which makes it the correct choice for transit-timing
 * work such as Sade Sati boundary detection, where the 2.5-year-per-sign
 * sign changes would otherwise produce spurious crossings near the limits.
 */
export function getSaturnMeanSiderealLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const meanTropical = norm360(ORBITS.Saturn.L + ORBITS.Saturn.dL * t);
  return norm360(meanTropical - calculateAyanamsa(jd));
}

/**
 * Current sign (1-12) of Saturn's *mean* sidereal position at a UTC date.
 * Used for deterministic Sade Sati / Dhaiya transit evaluation.
 */
export function getSaturnMeanSign(date: Date): number {
  const jdUT = calculateJulianDay(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    0,
    0,
    0
  );
  return longitudeToSign(getSaturnMeanSiderealLongitude(jdUT));
}

// ─── MoonDetails (legacy interface, kept for backward compatibility) ───────

export interface MoonDetails {
  rashi: number; // 1-12
  nakshatra: number; // 1-27
  pada: number; // 1-4
}

/**
 * Derive Moon sign (rashi), nakshatra, and pada from birth date/time.
 * If timeUnknown is true, defaults to 12:00 PM (noon).
 */
export function deriveMoonDetails(
  birthDate: string,
  birthTime: string,
  timeUnknown: boolean
): MoonDetails {
  const [year, month, day] = birthDate.split("-").map(Number);
  const time = resolveBirthTime(birthTime, timeUnknown);
  const [hour, minute] = time.split(":").map(Number);

  const jd = calculateJulianDay(year, month, day, hour, minute, 330); // IST
  const moonLong = getSiderealLongitude(jd, "Moon");

  const { index, pada } = getNakshatra(moonLong);
  return {
    rashi: longitudeToSign(moonLong),
    nakshatra: index,
    pada,
  };
}

// ─── Full Chart Computation ────────────────────────────────────────────────

export interface BirthDetails {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
  timezoneOffset: string; // e.g. "+05:30"
}

export interface PlanetResult {
  name: string;
  sign: string;
  house: number;
  degree: string; // "DD°MM'"
  nakshatra: string;
  retrograde: boolean;
  longitude: number; // exact sidereal longitude in degrees (0-360)
}

export interface HouseResult {
  house: number;
  sign: string;
  planets: string[];
}

export interface ChartData {
  lagna: string;
  ascendant: string;
  /** Sidereal Ascendant longitude (0-360), decimal degrees — exact value used for
   *  divisional chart derivation. Added in lahiri-v3. */
  ascendantLongitude: number;
  rashi: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  timezone: string;
  houses: HouseResult[];
  planets: PlanetResult[];
  /** Engine stamp — bumped whenever calculation logic changes so cached charts invalidate safely */
  engineVersion?: string;
}

/** Current chart-engine revision. Cached payloads stamped with an older
 *  value (or none, e.g. legacy VedAstro-era rows) are treated as misses. */
export const CHART_ENGINE_VERSION = "lahiri-v3";

/**
 * Strict runtime validation for cached chart payloads.
 * Guards the Supabase cache against legacy/stale/corrupt rows: any payload
 * that doesn't match the current flat structure is treated as a cache miss
 * so the route recomputes and overwrites the row (self-healing cache).
 */
export function isValidChartData(data: unknown): data is ChartData {
  if (!data || typeof data !== "object") return false;
  const c = data as Partial<ChartData>;
  const str = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

  // Summary fields must all be present
  if (!str(c.lagna) || !str(c.rashi) || !str(c.sunSign) || !str(c.nakshatra) || !str(c.timezone)) {
    return false;
  }
  // Ascendant longitude is required from lahiri-v3 onward (divisional charts)
  if (typeof c.ascendantLongitude !== "number" || c.ascendantLongitude < 0 || c.ascendantLongitude >= 360) {
    return false;
  }
  // Engine stamp must match the current revision
  if (c.engineVersion !== CHART_ENGINE_VERSION) return false;

  // Houses: exactly 12, each with valid house number, sign name and planets array
  if (!Array.isArray(c.houses) || c.houses.length !== 12) return false;
  for (const h of c.houses) {
    if (!h || typeof h.house !== "number" || h.house < 1 || h.house > 12) return false;
    if (!str(h.sign)) return false;
    if (!Array.isArray(h.planets)) return false;
  }

  // Planets: exactly 9, each fully populated
  if (!Array.isArray(c.planets) || c.planets.length !== 9) return false;
  const DEGREE_RE = /^\d{1,2}°\d{2}'$/;
  for (const p of c.planets) {
    if (!p || !str(p.name) || !str(p.sign) || !str(p.nakshatra)) return false;
    if (typeof p.house !== "number" || p.house < 1 || p.house > 12) return false;
    if (typeof p.degree !== "string" || !DEGREE_RE.test(p.degree)) return false;
    if (typeof p.retrograde !== "boolean") return false;
    if (typeof p.longitude !== "number" || p.longitude < 0 || p.longitude >= 360) return false;
  }
  return true;
}

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

/**
 * Compute a complete Vedic birth chart deterministically using Lahiri Ayanamsa.
 *
 * Replaces flaky external HTTP calls with a pure-math engine that produces
 * identical results for identical inputs (cacheable & testable).
 */
export function computeChart(details: BirthDetails): ChartData {
  const [year, month, day] = details.birthDate.split("-").map(Number);
  const time = details.birthTime || DEFAULT_NOON_TIME;
  const [hour, minute] = time.split(":").map(Number);

  const offsetMinutes = parseTimezoneOffset(details.timezoneOffset || "+05:30");
  const jdUT = calculateJulianDay(year, month, day, hour, minute, offsetMinutes);

  const lat = details.latitude ?? 0;
  const lonEast = details.longitude ?? 0;

  // ── Ascendant (Lagna) ──────────────────────────────────────────────────
  const asc = calculateAscendant(jdUT, lat, lonEast);
  const lagnaStr = signNameWithHindi(asc.sign);

  // ── Planet positions ───────────────────────────────────────────────────
  const planetResults: PlanetResult[] = PLANET_ORDER.map((name) => {
    const sidLong = getSiderealLongitude(jdUT, name);
    const signNum = longitudeToSign(sidLong);
    const degreeInSign = sidLong - (signNum - 1) * 30;
    return {
      name,
      sign: signNumberToName(signNum),
      house: getHouseFromLongitude(sidLong, asc.longitude),
      degree: formatDegreeDMS(degreeInSign),
      nakshatra: getNakshatraName(sidLong),
      retrograde: isPlanetRetrograde(jdUT, name),
      longitude: sidLong,
    };
  });

  // ── Summary values ─────────────────────────────────────────────────────
  const moon = planetResults.find((p) => p.name === "Moon")!;
  const sun = planetResults.find((p) => p.name === "Sun")!;
  const moonSignNum = longitudeToSign(getSiderealLongitude(jdUT, "Moon"));
  const sunSignNum = longitudeToSign(getSiderealLongitude(jdUT, "Sun"));

  // ── Houses (whole-sign cusps from the ascendant) ───────────────────────
  const houses: HouseResult[] = Array.from({ length: 12 }, (_, idx) => ({
    house: idx + 1,
    sign: signNumberToName(((asc.sign - 1 + idx) % 12) + 1),
    planets: [],
  }));
  for (const p of planetResults) {
    houses[p.house - 1]?.planets.push(p.name);
  }

  return {
    engineVersion: CHART_ENGINE_VERSION,
    lagna: lagnaStr,
    ascendant: signNumberToName(asc.sign),
    ascendantLongitude: asc.longitude,
    rashi: signNameWithHindi(moonSignNum),
    moonSign: moon.sign,
    sunSign: signNameWithHindi(sunSignNum),
    nakshatra: getNakshatraNameWithHindi(getSiderealLongitude(jdUT, "Moon")),
    timezone: `IST (+05:30)`,
    houses,
    planets: planetResults,
  };
}
