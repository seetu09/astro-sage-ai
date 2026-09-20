import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TIMEZONE,
  parseFixedOffsetMinutes,
  resolveOffsetMinutes,
} from '@/lib/timezone';

describe('DEFAULT_TIMEZONE', () => {
  it("is 'Asia/Kolkata'", () => {
    expect(DEFAULT_TIMEZONE).toBe('Asia/Kolkata');
  });
});

describe('parseFixedOffsetMinutes', () => {
  it('parses "+05:30" → 330', () => {
    expect(parseFixedOffsetMinutes('+05:30')).toBe(330);
  });

  it('parses "-04:00" → -240', () => {
    expect(parseFixedOffsetMinutes('-04:00')).toBe(-240);
  });

  it('parses "+00:00" → 0', () => {
    expect(parseFixedOffsetMinutes('+00:00')).toBe(0);
  });

  it('returns null for "America/New_York"', () => {
    expect(parseFixedOffsetMinutes('America/New_York')).toBeNull();
  });

  it('returns null for "" and null and undefined', () => {
    expect(parseFixedOffsetMinutes('')).toBeNull();
    expect(parseFixedOffsetMinutes(null)).toBeNull();
    expect(parseFixedOffsetMinutes(undefined)).toBeNull();
  });

  it('returns null for "+5:30" (missing leading zero)', () => {
    expect(parseFixedOffsetMinutes('+5:30')).toBeNull();
  });

  it('returns null for "05:30" (missing sign)', () => {
    expect(parseFixedOffsetMinutes('05:30')).toBeNull();
  });
});

describe('resolveOffsetMinutes', () => {
  it('2024-01-15T12:00:00Z in "America/New_York" → -300 (EST)', () => {
    const at = new Date('2024-01-15T12:00:00Z');
    expect(resolveOffsetMinutes('America/New_York', at)).toBe(-300);
  });

  it('2024-07-15T12:00:00Z in "America/New_York" → -240 (EDT)', () => {
    const at = new Date('2024-07-15T12:00:00Z');
    expect(resolveOffsetMinutes('America/New_York', at)).toBe(-240);
  });

  it('2024-01-15T12:00:00Z in "Asia/Kolkata" → 330 (no DST)', () => {
    const at = new Date('2024-01-15T12:00:00Z');
    expect(resolveOffsetMinutes('Asia/Kolkata', at)).toBe(330);
  });

  it('2024-01-15T12:00:00Z in "UTC" → 0', () => {
    const at = new Date('2024-01-15T12:00:00Z');
    expect(resolveOffsetMinutes('UTC', at)).toBe(0);
  });

  it('returns null for "Not/AZone"', () => {
    const at = new Date('2024-01-15T12:00:00Z');
    expect(resolveOffsetMinutes('Not/AZone', at)).toBeNull();
  });

  it('returns null for "" and null and undefined', () => {
    const at = new Date('2024-01-15T12:00:00Z');
    expect(resolveOffsetMinutes('', at)).toBeNull();
    expect(resolveOffsetMinutes(null, at)).toBeNull();
    expect(resolveOffsetMinutes(undefined, at)).toBeNull();
  });
});
