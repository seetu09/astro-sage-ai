'use client';

import React, { useMemo } from 'react';
import {
  LocaleCode,
  localizePlanet,
  localizeSign,
  localizePlanetAbbr,
  localizePanchangKey,
  getUILabel,
  getTableLabel,
  getChartTypeLabel,
  getDoshaLabel,
  getRemedyLabel,
  getYogaInfo,
  getGemstoneInfo,
  getRudrakshaInfo,
  getSignLord,
  getNakshatraLord,
  getNakshatraName,
  getKpSubLord,
  getDivisionalAscendant,
  getDivisionalHouse,
  computeAntardashas,
  formatLocalizedDate,
  fillTemplate,
  ChartType,
} from '@/lib/astrologyDictionary';
import { getReportDictionary, fillReportTemplate } from '@/lib/reportDictionary';
import { computeAshtakvarga } from '@/lib/ashtakvarga';
import { detectYogas } from '@/app/components/ReportContent';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfPlanet {
  name: string;
  sign: string; // English sign name
  house: number;
  degree: number;
  status: string;
}

export interface PdfKundliData {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: PdfPlanet[];
}

interface PdfTemplateProps {
  kundliData: PdfKundliData;
  selectedLanguage: LocaleCode;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

// A4 at 96dpi
const PAGE_W = 794;
const PAGE_H = 1123;

// Design tokens (light print theme)
const C = {
  bg: '#FFFFFF',
  ink: '#1E1B4B', // indigo-950
  sub: '#6B7280',
  faint: '#9CA3AF',
  accent: '#7C3AED', // violet-600
  accent2: '#4F46E5', // indigo-600
  gold: '#D97706', // amber-600
  line: '#E5E7EB',
  card: '#F8F7FC',
  cardBorder: '#E0E7FF',
  good: '#059669',
  bad: '#DC2626',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function signNum(signName: string): number {
  const idx = SIGNS.indexOf(signName);
  return idx >= 0 ? idx + 1 : 1;
}

function getSignName(signNum: number, locale: LocaleCode): string {
  return localizeSign(SIGNS[signNum - 1] ?? 'Aries', locale);
}

function getSignSymbol(signNum: number): string {
  return SIGN_SYMBOLS[signNum - 1] ?? '♈';
}

function getPanchang(ascendant: string, moonSign: string, sunSign: string, nakshatra: string, locale: LocaleCode) {
  const asc = signNum(ascendant);
  const moon = signNum(moonSign);
  const sun = signNum(sunSign);
  // Deterministic panchang derived from chart data (consistent with mock approach)
  const tithiIndex = ((moon - sun + 12) % 12) + 1;
  const tithis = locale === 'hi'
    ? ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी']
    : ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi'];
  const karans = locale === 'hi'
    ? ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि', 'शकुनि']
    : ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni'];
  const yogas = locale === 'hi'
    ? ['विष्कुम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा']
    : ['Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma'];

  return [
    { key: 'Tithi', value: tithis[(tithiIndex - 1) % tithis.length] },
    { key: 'Karan', value: karans[(asc + moon) % karans.length] },
    { key: 'Yog', value: yogas[(sun + moon) % yogas.length] },
    { key: 'Nakshatra', value: nakshatra },
  ];
}

function buildDasha(dateOfBirth: string, moonSign: string) {
  const moonSignIndex = signNum(moonSign) - 1;
  const nakshatraIndex = Math.floor((moonSignIndex * 30 + 15) / (360 / 27));
  const startLordIndex = nakshatraIndex % 9;
  const year = new Date(dateOfBirth).getFullYear() || new Date().getFullYear();

  const dasha: { planet: string; startDate: string; endDate: string }[] = [];
  let currentYear = year;
  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const years = DASHA_YEARS[lordIndex];
    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear + years, 0, 1);
    dasha.push({
      planet: DASHA_LORDS[lordIndex],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    currentYear += years;
  }
  return dasha;
}

// ---------------------------------------------------------------------------
// Print-safe North Indian Chart (inline SVG attributes — html2canvas friendly)
// ---------------------------------------------------------------------------

function PdfNorthChart({
  ascendantSign,
  ascendantDegree,
  planets,
  type,
  locale,
  lagnaLabel,
}: {
  ascendantSign: number;
  ascendantDegree: number;
  planets: { planet: string; sign: number; degree: number; retrograde?: boolean }[];
  type: ChartType;
  locale: LocaleCode;
  lagnaLabel: string;
}) {
  const divAsc = getDivisionalAscendant(ascendantSign, ascendantDegree, type);
  const positions = planets.map((p) => ({
    planet: p.planet,
    house: getDivisionalHouse(p.sign, p.degree, divAsc, type),
    retrograde: p.retrograde,
  }));

  const byHouse: Record<number, { planet: string; retrograde?: boolean }[]> = {};
  positions.forEach((p) => {
    if (!byHouse[p.house]) byHouse[p.house] = [];
    byHouse[p.house].push({ planet: p.planet, retrograde: p.retrograde });
  });

  const HOUSE_POS: Record<number, [number, number]> = {
    1: [200, 20], 2: [380, 20], 3: [380, 200], 4: [380, 380],
    5: [200, 380], 6: [20, 380], 7: [20, 200], 8: [20, 20],
    9: [200, 60], 10: [320, 60], 11: [320, 200], 12: [80, 200],
  };
  const HOUSE_POLY: Record<number, string> = {
    1: '180,20 220,20 260,60 140,60',
    2: '220,20 380,20 380,60 260,60',
    3: '340,60 380,60 380,340 340,340',
    4: '340,340 380,340 380,380 260,340',
    5: '140,340 260,340 300,380 100,380',
    6: '20,340 60,340 100,380 20,380',
    7: '60,60 100,60 100,340 60,340',
    8: '20,20 60,20 100,60 20,60',
    9: '180,60 220,60 260,140 140,140',
    10: '220,60 340,60 300,140 260,140',
    11: '260,140 300,140 300,260 260,260',
    12: '140,140 100,140 100,260 140,260',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, marginBottom: 4 }}>
        {getChartTypeLabel(type, locale)}
      </div>
      <div style={{ fontSize: 9, color: C.sub, marginBottom: 6 }}>
        {getSignSymbol(divAsc)} {getSignName(divAsc, locale)}
      </div>
      <svg width={300} height={300} viewBox="0 0 400 400" style={{ display: 'block', margin: '0 auto' }}>
        <rect x="0" y="0" width="400" height="400" rx="12" fill="#FAFAFF" />
        <rect x="20" y="20" width="360" height="360" rx="8" fill="none" stroke="#C7D2FE" strokeWidth="2" />
        <line x1="20" y1="20" x2="380" y2="380" stroke="#E0E7FF" strokeWidth="1" />
        <line x1="380" y1="20" x2="20" y2="380" stroke="#E0E7FF" strokeWidth="1" />
        <polygon points="200,60 340,200 200,340 60,200" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="2" />
        {Object.entries(HOUSE_POLY).map(([h, pts]) => {
          const hn = parseInt(h);
          const pos = HOUSE_POS[hn];
          const housePlanets = byHouse[hn] || [];
          return (
            <g key={hn}>
              <polygon points={pts} fill={hn === 1 ? '#EEF2FF' : '#F8F7FC'} stroke="#C7D2FE" strokeWidth="1" />
              <text x={pos[0] - 8} y={pos[1] - 8} fontSize="9" fill="#9CA3AF">{hn}</text>
              <text x={pos[0] + 4} y={pos[1] - 8} fontSize="9" fill="#4F46E5">
                {hn === 1 ? getSignSymbol(divAsc) : getSignSymbol(hn)}
              </text>
              {housePlanets.map((pl, idx) => {
                const yOff = 12 + idx * 14;
                return (
                  <g key={`${pl.planet}-${idx}`}>
                    <circle cx={pos[0]} cy={pos[1] + yOff} r="8" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="1" />
                    <text x={pos[0]} y={pos[1] + yOff + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#1E1B4B">
                      {localizePlanetAbbr(pl.planet, locale)}
                    </text>
                    {pl.retrograde && (
                      <text x={pos[0]} y={pos[1] + yOff + 14} textAnchor="middle" fontSize="6" fill="#DC2626">®</text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
              <text x={180} y={190} fontSize="8" fill="#9CA3AF">{lagnaLabel}</text>
        <text x={190} y={208} textAnchor="middle" fontSize="11" fontWeight="700" fill="#4F46E5">
          {getSignSymbol(divAsc)}
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page chrome (header + footer)
// ---------------------------------------------------------------------------

function PdfHeader({ title, dateLabel, date, subtitle }: { title: string; dateLabel: string; date: string; subtitle: string }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.gold}`, paddingBottom: 10, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 18, fontWeight: 800,
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: 0.5 }}>
              AstroSage <span style={{ color: C.gold }}>AI</span>
            </div>
            <div style={{ fontSize: 8.5, color: C.faint, letterSpacing: 1, textTransform: 'uppercase' }}>
              {subtitle}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{title}</div>
          <div style={{ fontSize: 9, color: C.sub }}>
            {dateLabel}: {date}
          </div>
        </div>
      </div>
    </div>
  );
}

function PdfFooter({ page, total, watermark, copyright, disclaimer, locale }: {
  page: number; total: number; watermark: string; copyright: string; disclaimer: string; locale: LocaleCode;
}) {
  const dict = getReportDictionary(locale);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: C.faint, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.5, marginBottom: 4 }}>
        {watermark}
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, color: C.faint }}>{copyright}</span>
        <span style={{ fontSize: 8, color: C.faint }}>{disclaimer}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.sub }}>
          {fillReportTemplate(dict.footer.pageOf, { x: page, y: total })}
        </span>
      </div>
    </div>
  );
}

function PdfSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <span style={{ width: 4, height: 16, background: C.gold, borderRadius: 2 }} />
      <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{children}</span>
    </div>
  );
}

function PdfCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: 12,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Template
// ---------------------------------------------------------------------------

export default function PdfTemplate({ kundliData, selectedLanguage }: PdfTemplateProps) {
  const locale = selectedLanguage;
  const dict = getReportDictionary(locale);
  const total = 5;
  const genDate = formatLocalizedDate(new Date().toISOString(), locale);
  const reportTitle = getUILabel('kundliReport', locale);
  const generatedOnLabel = getUILabel('generatedOn', locale);
  const copyright = getUILabel('pdfCopyright', locale);
  const watermark = getUILabel('pdfWatermark', locale);
  const disclaimer = dict.footer.disclaimer;

  // Defensive defaults — a partial/undefined payload must never crash html2canvas.
  const safeName = kundliData.name || '—';
  const safeDateOfBirth = kundliData.dateOfBirth || '—';
  const safeTimeOfBirth = kundliData.timeOfBirth || '—';
  const safePlaceOfBirth = kundliData.placeOfBirth || '—';
  const safeAscendant = kundliData.ascendant || 'Aries';
  const safeMoonSign = kundliData.moonSign || 'Aries';
  const safeSunSign = kundliData.sunSign || 'Aries';
  const safeNakshatra = kundliData.nakshatra || '—';
  const safePlanets = Array.isArray(kundliData.planets) ? kundliData.planets : [];

  const asc = signNum(safeAscendant);
  const moon = signNum(safeMoonSign);
  const sun = signNum(safeSunSign);

  const planets = useMemo(
    () =>
      safePlanets.map((p) => ({
        planet: p.name || 'Unknown',
        sign: signNum(p.sign || 'Aries'),
        degree: typeof p.degree === 'number' ? p.degree : 0,
        house: typeof p.house === 'number' ? p.house : 1,
        retrograde: p.status === 'Retrograde',
      })),
    [safePlanets]
  );

  const panchang = getPanchang(safeAscendant, safeMoonSign, safeSunSign, safeNakshatra, locale);
  const dasha = useMemo(() => buildDasha(safeDateOfBirth, safeMoonSign), [safeDateOfBirth, safeMoonSign]);
  const ashtakvarga = useMemo(
    () => computeAshtakvarga(asc, planets.map((p) => ({ planet: p.planet, sign: p.sign }))),
    [asc, planets]
  );
  const yogas = useMemo(
    () =>
      detectYogas(
        planets.map((p) => ({ planet: p.planet, sign: p.sign, degree: p.degree, house: p.house, retrograde: p.retrograde })),
        asc
      ).map((y) => {
        const info = getYogaInfo(y.key, locale);
        return { key: y.key, name: info.name, description: info.description, strength: info.strength };
      }),
    [planets, asc, locale]
  );

  // Gemstone recommendations (life + lucky stone)
  const lagnaLord = getSignLord(asc);
  const moonLord = getSignLord(moon);
  const gemstones = [lagnaLord, moonLord]
    .filter((v, i, a) => a.indexOf(v) === i)
    .map((planet) => ({ planet, info: getGemstoneInfo(planet, locale) }))
    .filter((g) => g.info);

  // Rudraksha recommendation (based on moon lord)
  const rudrakshaMukhi = moonLord === 'Sun' ? 1 : moonLord === 'Moon' ? 2 : moonLord === 'Mars' ? 3 : moonLord === 'Mercury' ? 4 : moonLord === 'Jupiter' ? 5 : moonLord === 'Venus' ? 6 : moonLord === 'Saturn' ? 7 : 9;
  const rudraksha = getRudrakshaInfo(rudrakshaMukhi, locale);

  const pageStyle: React.CSSProperties = {
    width: PAGE_W,
    height: PAGE_H,
    background: C.bg,
    color: C.ink,
    fontFamily: "var(--font-noto-devanagari), 'Plus Jakarta Sans', 'Inter', sans-serif",
    padding: '36px 40px 60px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    breakAfter: 'page',
    pageBreakAfter: 'always',
  };

  const lastPageStyle: React.CSSProperties = { ...pageStyle, breakAfter: 'auto', pageBreakAfter: 'auto' };

  return (
    <div style={{ background: '#fff' }}>
      {/* ================= PAGE 1 — Birth & Panchang ================= */}
      <div className="pdf-page" style={pageStyle}>
        <PdfHeader title={reportTitle} dateLabel={generatedOnLabel} date={genDate} subtitle={dict.messages.headerSubtitle} />

        <PdfSectionTitle>{getUILabel('pdfPage1Title', locale)}</PdfSectionTitle>

        {/* Personal details */}
        <PdfCard style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getUILabel('pdfPersonalDetails', locale)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { l: dict.metadata.name, v: safeName },
              { l: dict.metadata.dob, v: safeDateOfBirth },
              { l: dict.metadata.tob, v: safeTimeOfBirth },
              { l: dict.metadata.pob, v: safePlaceOfBirth },
            ].map((it) => (
              <div key={it.l} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 8.5, color: C.faint, textTransform: 'uppercase', letterSpacing: 0.5 }}>{it.l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginTop: 2 }}>{it.v || '—'}</div>
              </div>
            ))}
          </div>
        </PdfCard>

        {/* Key positions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { l: dict.messages.ascendant, v: getSignName(asc, locale), s: getSignSymbol(asc) },
            { l: dict.messages.moonSign, v: getSignName(moon, locale), s: getSignSymbol(moon) },
            { l: dict.messages.sunSign, v: getSignName(sun, locale), s: getSignSymbol(sun) },
          ].map((it) => (
            <PdfCard key={it.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{it.s}</div>
              <div style={{ fontSize: 8.5, color: C.faint, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{it.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginTop: 2 }}>{it.v}</div>
            </PdfCard>
          ))}
        </div>

        {/* Panchang */}
        <PdfCard>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getUILabel('pdfPanchangPanel', locale)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {panchang.map((p) => (
              <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ fontSize: 9, color: C.sub }}>{localizePanchangKey(p.key, locale)}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{p.value}</span>
              </div>
            ))}
          </div>
        </PdfCard>

        <PdfFooter page={1} total={total} watermark={watermark} copyright={copyright} disclaimer={disclaimer} locale={locale} />
      </div>

      {/* ================= PAGE 2 — D1, D9 & Planet Table ================= */}
      <div className="pdf-page" style={pageStyle}>
        <PdfHeader title={reportTitle} dateLabel={generatedOnLabel} date={genDate} subtitle={dict.messages.headerSubtitle} />

        <PdfSectionTitle>{getUILabel('pdfPage2Title', locale)}</PdfSectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <PdfCard>
            <PdfNorthChart ascendantSign={asc} ascendantDegree={15} planets={planets} type="D1" locale={locale} lagnaLabel={dict.metadata.lagna} />
          </PdfCard>
          <PdfCard>
            <PdfNorthChart ascendantSign={asc} ascendantDegree={15} planets={planets} type="D9" locale={locale} lagnaLabel={dict.metadata.lagna} />
          </PdfCard>
        </div>

        {/* Planetary positions table */}
        <PdfCard>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getTableLabel('planet', locale)} {getTableLabel('status', locale)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5 }}>
            <thead>
              <tr style={{ background: C.accent, color: '#fff' }}>
                {[getTableLabel('planet', locale), getTableLabel('sign', locale), getTableLabel('signLord', locale), getTableLabel('degree', locale), getTableLabel('house', locale), getTableLabel('nakshatra', locale), getTableLabel('status', locale)].map((h) => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planets.map((p, i) => {
                const longitude = (p.sign - 1) * 30 + p.degree;
                const signLord = getSignLord(p.sign);
                const naksh = getNakshatraName(longitude, locale);
                return (
                  <tr key={p.planet} style={{ background: i % 2 === 0 ? '#fff' : '#F8F7FC', borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: C.ink }}>{localizePlanet(p.planet, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{getSignName(p.sign, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{localizePlanet(signLord, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{p.degree.toFixed(2)}°</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{p.house}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{naksh}</td>
                    <td style={{ padding: '5px 8px' }}>
                      <span style={{ fontSize: 8.5, padding: '2px 6px', borderRadius: 8, fontWeight: 700, color: p.retrograde ? C.bad : C.good, background: p.retrograde ? '#FEE2E2' : '#D1FAE5' }}>
                        {p.retrograde ? getTableLabel('retrograde', locale) : getTableLabel('direct', locale)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PdfCard>

        <PdfFooter page={2} total={total} watermark={watermark} copyright={copyright} disclaimer={disclaimer} locale={locale} />
      </div>

      {/* ================= PAGE 3 — KP & Dasha ================= */}
      <div className="pdf-page" style={pageStyle}>
        <PdfHeader title={reportTitle} dateLabel={generatedOnLabel} date={genDate} subtitle={dict.messages.headerSubtitle} />

        <PdfSectionTitle>{getUILabel('pdfPage3Title', locale)}</PdfSectionTitle>

        {/* KP table */}
        <PdfCard style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getTableLabel('starLord', locale)} / {getTableLabel('subLord', locale)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5 }}>
            <thead>
              <tr style={{ background: C.accent, color: '#fff' }}>
                {[getTableLabel('planet', locale), getTableLabel('sign', locale), getTableLabel('degree', locale), getTableLabel('nakshatra', locale), getTableLabel('starLord', locale), getTableLabel('subLord', locale)].map((h) => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planets.map((p, i) => {
                const longitude = (p.sign - 1) * 30 + p.degree;
                const naksh = getNakshatraName(longitude, locale);
                const starLord = getNakshatraLord(longitude);
                const subLord = getKpSubLord(longitude);
                return (
                  <tr key={p.planet} style={{ background: i % 2 === 0 ? '#fff' : '#F8F7FC', borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: '5px 8px', fontWeight: 700, color: C.ink }}>{localizePlanet(p.planet, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{getSignName(p.sign, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{p.degree.toFixed(2)}°</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{naksh}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{localizePlanet(starLord, locale)}</td>
                    <td style={{ padding: '5px 8px', color: C.sub }}>{localizePlanet(subLord, locale)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PdfCard>

        {/* Vimshottari Dasha */}
        <PdfCard>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getTableLabel('mahadasha', locale)} ({getTableLabel('period', locale)})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dasha.map((d, i) => {
              const ad = computeAntardashas(d.planet, d.startDate, d.endDate);
              return (
                <div key={d.planet} style={{ border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: i % 2 === 0 ? '#EEF2FF' : '#F8F7FC', padding: '6px 10px' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.ink }}>
                      {localizePlanet(d.planet, locale)}
                    </span>
                    <span style={{ fontSize: 9, color: C.sub }}>
                      {formatLocalizedDate(d.startDate, locale)} — {formatLocalizedDate(d.endDate, locale)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 10px', background: '#fff' }}>
                    {ad.map((a) => (
                      <span key={a.planet} style={{ fontSize: 8, color: C.sub, background: '#F8F7FC', border: `1px solid ${C.line}`, borderRadius: 6, padding: '2px 6px' }}>
                        {localizePlanet(a.planet, locale)} {formatLocalizedDate(a.startDate, locale).slice(0, 4)}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </PdfCard>

        <PdfFooter page={3} total={total} watermark={watermark} copyright={copyright} disclaimer={disclaimer} locale={locale} />
      </div>

      {/* ================= PAGE 4 — Divisional Charts & Ashtakvarga ================= */}
      <div className="pdf-page" style={pageStyle}>
        <PdfHeader title={reportTitle} dateLabel={generatedOnLabel} date={genDate} subtitle={dict.messages.headerSubtitle} />

        <PdfSectionTitle>{getUILabel('pdfPage4Title', locale)}</PdfSectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {(['D3', 'D4', 'D7', 'D10'] as ChartType[]).map((ct) => (
            <PdfCard key={ct}>
              <PdfNorthChart ascendantSign={asc} ascendantDegree={15} planets={planets} type={ct} locale={locale} lagnaLabel={dict.metadata.lagna} />
            </PdfCard>
          ))}
        </div>

        {/* Ashtakvarga table */}
        <PdfCard>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getUILabel('ashtakvargaTable', locale)}
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8.5 }}>
            <thead>
              <tr style={{ background: C.accent, color: '#fff' }}>
                <th style={{ padding: '4px 6px', textAlign: 'left' }}>{getTableLabel('planet', locale)}</th>
                {Array.from({ length: 12 }, (_, i) => (
                  <th key={i} style={{ padding: '4px 2px', textAlign: 'center' }}>{i + 1}</th>
                ))}
                <th style={{ padding: '4px 6px', textAlign: 'center' }}>{dict.tableHeaders.total}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ashtakvarga.bhinnashtakvarga).map(([planet, row], i) => (
                <tr key={planet} style={{ background: i % 2 === 0 ? '#fff' : '#F8F7FC', borderBottom: `1px solid ${C.line}` }}>
                  <td style={{ padding: '4px 6px', fontWeight: 700, color: C.ink }}>{localizePlanet(planet, locale)}</td>
                  {row.map((b, h) => (
                    <td key={h} style={{ padding: '4px 2px', textAlign: 'center', color: b > 0 ? C.good : C.faint, fontWeight: b > 0 ? 700 : 400 }}>
                      {b}
                    </td>
                  ))}
                  <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 800, color: C.ink }}>
                    {row.reduce((a, b) => a + b, 0)}
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#EEF2FF', borderTop: `2px solid ${C.accent}` }}>
                <td style={{ padding: '4px 6px', fontWeight: 800, color: C.accent }}>
                  {getUILabel('sarvashtakvargaTotal', locale)}
                </td>
                {ashtakvarga.sarvashtakvarga.map((b, h) => (
                  <td key={h} style={{ padding: '4px 2px', textAlign: 'center', fontWeight: 800, color: C.accent }}>{b}</td>
                ))}
                <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 800, color: C.accent }}>
                  {ashtakvarga.sarvashtakvarga.reduce((a, b) => a + b, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </PdfCard>

        <PdfFooter page={4} total={total} watermark={watermark} copyright={copyright} disclaimer={disclaimer} locale={locale} />
      </div>

      {/* ================= PAGE 5 — Yogas, Doshas & Remedies ================= */}
      <div className="pdf-page" style={lastPageStyle}>
        <PdfHeader title={reportTitle} dateLabel={generatedOnLabel} date={genDate} subtitle={dict.messages.headerSubtitle} />

        <PdfSectionTitle>{getUILabel('pdfPage5Title', locale)}</PdfSectionTitle>

        {/* Yogas */}
        <PdfCard style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getRemedyLabel('activeYogas', locale)}
          </div>
          {yogas.length === 0 ? (
            <div style={{ fontSize: 10, color: C.sub }}>{dict.messages.noActiveYogas}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {yogas.map((y) => (
                <div key={y.key} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: C.ink }}>{y.name}</span>
                    <span style={{ fontSize: 8.5, padding: '2px 6px', borderRadius: 8, fontWeight: 700, color: C.good, background: '#D1FAE5' }}>
                      {y.strength}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: C.sub, marginTop: 3 }}>{y.description}</div>
                </div>
              ))}
            </div>
          )}
        </PdfCard>

        {/* Doshas */}
        <PdfCard style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getRemedyLabel('doshaStatus', locale)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { l: getDoshaLabel('manglik', locale), present: safePlanets.find((p) => p.name === 'Mars' && [1, 2, 4, 7, 8, 12].includes(p.house)) !== undefined },
              { l: getDoshaLabel('kaalSarp', locale), present: false },
              { l: getDoshaLabel('sadeSati', locale), present: false },
            ].map((d) => (
              <div key={d.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: C.ink }}>{d.l}</span>
                <span style={{ fontSize: 8.5, padding: '2px 8px', borderRadius: 8, fontWeight: 700, color: d.present ? C.bad : C.good, background: d.present ? '#FEE2E2' : '#D1FAE5' }}>
                  {d.present ? getDoshaLabel('present', locale) : getDoshaLabel('absent', locale)}
                </span>
              </div>
            ))}
          </div>
        </PdfCard>

        {/* Gemstones */}
        <PdfCard style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
            {getRemedyLabel('gemstoneGuide', locale)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {gemstones.map((g) => (
              <div key={g.planet} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: C.ink }}>
                  {g.info?.gemName} <span style={{ color: C.sub, fontWeight: 600 }}>({localizePlanet(g.planet, locale)})</span>
                </div>
                <div style={{ fontSize: 9, color: C.sub, marginTop: 3 }}>
                  {getRemedyLabel('wearingGuidelines', locale)}: {g.info?.metal} • {g.info?.finger} • {g.info?.day}
                </div>
                <div style={{ fontSize: 9, color: C.accent, marginTop: 3, fontWeight: 700 }}>
                  {getRemedyLabel('mantra', locale)}: {g.info?.mantra} ({g.info?.mantraTransliteration})
                </div>
              </div>
            ))}
          </div>
        </PdfCard>

        {/* Rudraksha */}
        {rudraksha && (
          <PdfCard>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, marginBottom: 8 }}>
              {getRemedyLabel('rudraksha', locale)}
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: C.ink }}>{rudraksha.name}</div>
              <div style={{ fontSize: 9, color: C.sub, marginTop: 3 }}>{rudraksha.benefits}</div>
              <div style={{ fontSize: 9, color: C.sub, marginTop: 3 }}>{rudraksha.wearingRules}</div>
            </div>
          </PdfCard>
        )}

        <PdfFooter page={5} total={total} watermark={watermark} copyright={copyright} disclaimer={disclaimer} locale={locale} />
      </div>
    </div>
  );
}