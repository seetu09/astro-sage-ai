// ─── Timezone Conversion — Single Source of Truth ────────────────────────────
// All timezone logic lives here. Callers should never inline raw offset strings
// (e.g. "+05:30") elsewhere in the codebase; import from this module instead.

/**
 * The single fallback IANA zone used everywhere when a timezone cannot be
 * resolved. Kept here so there is exactly one definition — not scattered as
 * hardcoded "+05:30" strings across the app.
 */
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

const FIXED_OFFSET_RE = /^[+-]\d{2}:\d{2}$/;

/**
 * Parse a fixed-offset string like "+05:30" or "-08:00" into signed minutes.
 *
 * @returns minutes from UTC (e.g. 330, -240, 0), or null when the input does
 *   not match the exact format /^[+-]\d{2}:\d{2}$/. null means "I don't know"
 *   — the caller is responsible for deciding how to handle the unknown value.
 *   This function deliberately does NOT fall back to IST.
 */
export function parseFixedOffsetMinutes(
  offset: string | null | undefined,
): number | null {
  if (offset == null || offset === '') return null;
  if (!FIXED_OFFSET_RE.test(offset)) return null;

  const sign = offset[0] === '-' ? -1 : 1;
  const hours = parseInt(offset.slice(1, 3), 10);
  const minutes = parseInt(offset.slice(4, 6), 10);

  return sign * (hours * 60 + minutes);
}

/**
 * Resolve the UTC offset (in signed minutes) for an IANA time zone at a
 * specific moment, correctly accounting for daylight-saving time.
 *
 * Implementation uses `Intl.DateTimeFormat` with the `timeZone` and
 * `longOffset` options, which is available in Node ≥ 16 and all modern
 * browsers.
 *
 * @param ianaZone  e.g. "America/New_York", "Asia/Kolkata", "UTC"
 * @param at        the specific instant for which to compute the offset
 * @returns offset in signed minutes (e.g. 330, -300, -240, 0), or null when
 *   the zone is null/undefined/empty, invalid, or Intl throws. null means
 *   "I don't know" — the caller decides. This function deliberately does NOT
 *   fall back to IST.
 */
export function resolveOffsetMinutes(
  ianaZone: string | null | undefined,
  at: Date,
): number | null {
  if (ianaZone == null || ianaZone === '') return null;

  let raw: string;
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'longOffset',
    });
    const parts = dtf.formatToParts(at);
    const offPart = parts.find(
      (p) => p.type === 'timeZoneName',
    );
    if (!offPart) return null;
    raw = offPart.value;
  } catch {
    // Invalid IANA zone or Intl not available — treat as unknown.
    return null;
  }

  // Intl emits "GMT+05:30", "GMT-04:00", "GMT+00:00", etc.
  const match = raw.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) return null;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);

  return sign * (hours * 60 + minutes);
}
