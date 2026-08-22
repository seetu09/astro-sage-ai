// ─── Astronomy Helpers ────────────────────────────────────────────────────
// Extracted from app/api/kundali/generate/route.ts for reuse in matchmaking.

export const DEFAULT_NOON_TIME = "12:00";

/**
 * Resolve the birth time for calculations.
 * When the time is unknown or missing, default to 12:00 (noon),
 * which is the conventional reference time for Surya/Chandra chart estimation.
 */
export function resolveBirthTime(birthTime: string, timeUnknown: boolean): string {
  return timeUnknown || !birthTime ? DEFAULT_NOON_TIME : birthTime;
}

export function calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  jd += (hour - 12) / 24 + minute / 1440;
  return jd;
}

export function calculateAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  return 23.85 + 0.0137 * t;
}

export function getMoonLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const meanLongitude = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  let longitude = meanLongitude + 6.289 * Math.sin((134.963 + 477198.867 * t) * Math.PI / 180);
  longitude = ((longitude % 360) + 360) % 360;
  return longitude;
}

export function longitudeToSign(longitude: number): number {
  return Math.floor(longitude / 30) + 1; // 1-12
}

export function getNakshatra(longitude: number): { index: number; pada: number } {
  const span = 360 / 27;
  const index = Math.floor(longitude / span); // 0-26
  const pada = Math.floor((longitude % span) / (span / 4)) + 1; // 1-4
  return { index: index + 1, pada }; // 1-27
}

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

  const jd = calculateJulianDay(year, month, day, hour, minute);
  const ayanamsa = calculateAyanamsa(jd);
  const moonLong = getMoonLongitude(jd);
  const siderealLong = (moonLong - ayanamsa + 360) % 360;

  const { index, pada } = getNakshatra(siderealLong);
  return {
    rashi: longitudeToSign(siderealLong),
    nakshatra: index,
    pada,
  };
}