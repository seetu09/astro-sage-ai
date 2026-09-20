import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock rate limiting so the route can be exercised without state bleed.
vi.mock('@/lib/rateLimit', () => ({
  getClientIp: vi.fn(),
  checkRateLimit: vi.fn(),
}));

import {
  calculatePositionsFromBirthDetails,
  type BirthDetailsFromDate,
} from '@/lib/dosha-checker';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';
import { POST } from '@/app/api/dosha-check/route';

function buildRequest(body: object) {
  return new Request('http://localhost/api/dosha-check', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('dosha-check timezone handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any) = vi.fn();
    (getClientIp as any).mockReturnValue('127.0.0.1');
    (checkRateLimit as any).mockReturnValue({ allowed: true, retryAfter: 0 });
  });

  it('same local clock in different timezones produces different ascendants', () => {
    // Both inputs share the identical wall-clock birth moment. Only the
    // geographic location and the timezone offset differ.
    //
    // NOTE: 1990-01-15 00:00 is chosen deliberately. In this engine the
    // ascendant depends on BOTH the offset-shifted Julian Day and the birth
    // longitude, and for the NY<->Kolkata pair those two contributions nearly
    // cancel for much of the day (e.g. at 12:00 both land in Aries). Midnight
    // is a moment where they do not cancel, so the two charts land in
    // genuinely different signs — making this a meaningful regression guard
    // for the original bug, where the timezone was hardcoded to IST.
    const newYork: BirthDetailsFromDate = {
      name: 'NY',
      birthDate: '1990-01-15',
      birthTime: '00:00',
      birthPlace: 'New York, USA',
      latitude: 40.71,
      longitude: -74.01,
      timezoneOffset: '-05:00', // New York EST
    };

    const kolkata: BirthDetailsFromDate = {
      name: 'Kolkata',
      birthDate: '1990-01-15',
      birthTime: '00:00',
      birthPlace: 'Kolkata, India',
      latitude: 22.57,
      longitude: 88.36,
      timezoneOffset: '+05:30', // Kolkata IST
    };

    const a = calculatePositionsFromBirthDetails(newYork);
    const b = calculatePositionsFromBirthDetails(kolkata);

    // Regression guard for the original bug: the same wall-clock birth time
    // in two different zones must not yield the same ascendant.
    expect(a.ascendantSign).not.toBe(b.ascendantSign);
    expect(a.ascendantSign).toBe(6); // Virgo
    expect(b.ascendantSign).toBe(7); // Libra
  });

  it('unparseable timezone returns an error from the route', async () => {
    const res = await POST(
      buildRequest({
        name: 'Test User',
        dob: '1990-01-15',
        tob: '12:00',
        place: 'New York, USA',
        latitude: 40.71,
        longitude: -74.01,
        timezone: 'Not/AZone',
      }) as any,
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe(
      'Could not resolve the timezone for the birth place. Please try a nearby city.',
    );

    // The client supplied coordinates, so the server must NOT geocode.
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
