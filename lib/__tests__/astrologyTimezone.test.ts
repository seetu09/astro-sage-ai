/**
 * Pins the CURRENT (buggy) behavior of parseTimezoneOffset().
 *
 * Phase 3 will change these expectations deliberately and update this file.
 * After Phase 3, this function should return null for unparseable input
 * instead of silently falling back to 330 (IST).
 */
import { describe, it, expect } from 'vitest';
import { parseTimezoneOffset } from '@/lib/astrology';

describe('parseTimezoneOffset — current (buggy) behavior pin', () => {
  it('parses "+05:30" → 330', () => {
    expect(parseTimezoneOffset('+05:30')).toBe(330);
  });

  it('parses "-04:00" → -240', () => {
    expect(parseTimezoneOffset('-04:00')).toBe(-240);
  });

  it('parses "+00:00" → 0', () => {
    expect(parseTimezoneOffset('+00:00')).toBe(0);
  });

  it('returns 330 (fallback) for "America/New_York"', () => {
    expect(parseTimezoneOffset('America/New_York')).toBe(330);
  });

  it('returns 330 (fallback) for "Asia/Kolkata"', () => {
    expect(parseTimezoneOffset('Asia/Kolkata')).toBe(330);
  });

  it('returns 330 (fallback) for ""', () => {
    expect(parseTimezoneOffset('')).toBe(330);
  });

  it('returns 330 (fallback) for null', () => {
    expect(parseTimezoneOffset(null as unknown as string)).toBe(330);
  });

  it('returns 330 (fallback) for undefined', () => {
    expect(parseTimezoneOffset(undefined as unknown as string)).toBe(330);
  });

  it('returns 330 (fallback) for "+5:30" (missing leading zero)', () => {
    expect(parseTimezoneOffset('+5:30')).toBe(330);
  });

  it('returns 330 (fallback) for "05:30" (missing sign)', () => {
    expect(parseTimezoneOffset('05:30')).toBe(330);
  });

  it('returns 330 (fallback) for "IST"', () => {
    expect(parseTimezoneOffset('IST')).toBe(330);
  });
});
