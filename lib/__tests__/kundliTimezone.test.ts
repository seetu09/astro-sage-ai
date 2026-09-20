import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock rate limiting so the route can be exercised without state bleed.
vi.mock('@/lib/rateLimit', () => ({
  getClientIp: vi.fn(),
  checkRateLimit: vi.fn(),
}));

// Mock Supabase so the route never touches the network (cache read/write both
// fail gracefully in the route and never block a deterministic recompute).
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: vi.fn(() => {
    throw new Error('Supabase not configured in tests');
  }),
}));

// Mock the Gemini retry helper at the module boundary. Individual callers bail
// out early when GEMINI_API_KEY is unset, but mocking here guarantees the test
// stays hermetic even on a dev machine that has the key exported.
vi.mock('@/lib/geminiRetry', () => ({
  geminiWithRetry: vi.fn(),
}));

import { getClientIp, checkRateLimit } from '@/lib/rateLimit';
import { computeChart } from '@/lib/astrology';
import { POST } from '@/app/api/kundali/generate/route';

function buildRequest(body: object) {
  return new Request('http://localhost/api/kundali/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const BASE_BODY = {
  birthDate: '1990-01-15',
  birthTime: '00:00',
  birthPlace: 'New York, USA',
  latitude: 40.71,
  longitude: -74.01,
  language: 'en',
};

describe('kundali generate timezone handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getClientIp as any).mockReturnValue('127.0.0.1');
    (checkRateLimit as any).mockReturnValue({ allowed: true, retryAfter: 0 });
    // No API key → deterministic fallbacks, no outbound AI calls.
    delete process.env.GEMINI_API_KEY;
  });

  it("kundli generate with IANA timezone 'America/New_York' produces a chart", async () => {
    const res = await POST(
      buildRequest({
        ...BASE_BODY,
        timezoneOffset: 'America/New_York',
      }) as any,
    );

    expect(res.status).toBe(200);

    const json = await res.json();
    const chart = json.chartData ?? json.chart;
    expect(chart).toBeTruthy();
    expect(typeof chart.ascendant).toBe('string');
    expect(chart.ascendant.length).toBeGreaterThan(0);

    // The route must have resolved the IANA zone to a real fixed offset — NOT
    // the old IST fallback ("IST (+05:30)").
    expect(chart.timezone).not.toBe('IST (+05:30)');
    expect(chart.timezone).toBe('-05:00'); // 1990-01-15 in New York is EST

    // Cross-check against the engine directly: the resolved offset (not IST)
    // drives the ascendant. Midnight is chosen because NY and IST ascendants
    // land in genuinely different signs at that moment.
    const istChart = computeChart({
      birthDate: BASE_BODY.birthDate,
      birthTime: BASE_BODY.birthTime,
      birthPlace: BASE_BODY.birthPlace,
      latitude: BASE_BODY.latitude,
      longitude: BASE_BODY.longitude,
      timezoneOffset: '+05:30',
    });
    const nyChart = computeChart({
      birthDate: BASE_BODY.birthDate,
      birthTime: BASE_BODY.birthTime,
      birthPlace: BASE_BODY.birthPlace,
      latitude: BASE_BODY.latitude,
      longitude: BASE_BODY.longitude,
      timezoneOffset: '-05:00',
    });
    expect(chart.ascendant).toBe(nyChart.ascendant);
    expect(chart.ascendant).not.toBe(istChart.ascendant);
  });

  it('kundli generate with an unresolvable timezone returns 400', async () => {
    const res = await POST(
      buildRequest({
        ...BASE_BODY,
        timezoneOffset: 'Not/AZone',
      }) as any,
    );

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe(
      'Could not resolve the timezone for the birth place. Please try a nearby city.',
    );
  });
});
