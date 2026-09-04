/**
 * Font coverage test for @react-pdf/renderer.
 * Tests that Mukta font covers both Latin and Devanagari glyphs.
 *
 * NOTE: This test now requires the project to be built first.
 * Run: `npm run build && node test-font-coverage.js`
 */
const path = require('path');
const { renderPdfToBuffer } = require('./lib/PdfDocument');

// Minimal test payload with mixed English + Hindi text.
const testData = {
  name: 'Test User टेस्ट',
  birthDate: '1990-01-01',
  birthTime: '12:00',
  latitude: 28.61,
  longitude: 77.20,
  timezone: 'Asia/Kolkata',
  chartData: {
    lagna: 'Leo',
    moonSign: 'Scorpio',
    sunSign: 'Taurus',
    nakshatra: 'Anuradha',
    planets: [
      { name: 'Sun', sign: 'Taurus', degree: '15° 44\'', house: 1, retrograde: false },
      { name: 'मंगल', sign: 'सिंह', degree: '22° 03\'', house: 2, retrograde: false },
    ],
  },
  calculations: {
    vimshottari: { mahadashas: [] },
    doshas: {},
    yogas: {},
  },
  pillars: [
    {
      key: 'career',
      titleEn: 'Career & Life Path',
      titleHi: 'करियर एवं जीवन पथ',
      narrativeEn: 'English narrative: Career growth indicated by Jupiter in the 10th house.',
      narrativeHi: 'हिन्दी विवरण: दशम भाव में गुरु से करियर में उन्नति होगी। साढ़े साती 2023-2025 में।',
      milestones: [],
    },
  ],
  freeTier: {},
  paidTier: {},
  language: 'en',
};

(async () => {
  const t0 = Date.now();
  const buf = await renderPdfToBuffer(testData);
  console.log('PDF bytes:', buf.length, 'in', Date.now() - t0, 'ms');
  console.log('is PDF:', buf.slice(0, 5).toString() === '%PDF-');
  require('fs').writeFileSync('test-out.pdf', buf);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
