/**
 * Pins the CURRENT (buggy) behavior of parseTimezoneOffset().
 *
 * Phase 3 will change these expectations deliberately and update this file.
 * After Phase 3, this function should return null for unparseable input
 * instead of silently falling back to 330 (IST).
 */
import { describe, it, expect } from 'vitest';
import { computeChart, parseTimezoneOffset } from '@/lib/astrology';
import type { BirthDetailsFromDate } from '@/lib/dosha-checker';

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

describe('computeChart — timezone label', () => {
  const baseDetails: BirthDetailsFromDate = {
    name: 'Test User',
    birthDate: '1990-06-15',
    birthTime: '12:00',
    birthPlace: 'Test Place',
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffset: '+05:30',
  };

  it("computeChart returns 'IST (+05:30)' when offset is +05:30", () => {
    const chart = computeChart({ ...baseDetails, timezoneOffset: '+05:30' });
    expect(chart.timezone).toBe('IST (+05:30)');
  });

  it('computeChart returns offset string for non-IST timezones', () => {
    const chart = computeChart({ ...baseDetails, timezoneOffset: '-05:00' });
    expect(chart.timezone).toBe('-05:00');
  });

  it('computeChart returns offset string for +09:00', () => {
    const chart = computeChart({ ...baseDetails, timezoneOffset: '+09:00' });
    expect(chart.timezone).toBe('+09:00');
  });
});
