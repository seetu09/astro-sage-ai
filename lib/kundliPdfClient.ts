/**
 * kundliPdfClient.ts — Additive pdfnative-based Kundli PDF builder.
 *
 * This is a NEW, additive module. It does NOT touch the existing
 * `window.print()`-based "Download PDF" flow, `lib/PdfDocument.tsx`, the
 * existing API routes, the form, or `app/globals.css`. It only adds a
 * parallel, native pdfnative code path, executed server-side by the additive
 * `/api/kundali/pdf-native` route and triggered from
 * `components/PdfNativeDownloadButton.tsx`.
 *
 * SERVER-ONLY: pdfnative bundles a literal `await import('fs')`, so this
 * module must never be imported from a client component.
 */

import {
  buildDocumentPDFBytes,
  registerFonts,
  loadFontData,
  type DocumentBlock,
  type ColumnDef,
  type FontData,
} from 'pdfnative';

import {
  PLANET_NAMES,
  ZODIAC_SIGNS,
  SIGN_LORDS,
} from '@/lib/astrologyDictionary';
import { getLocalizedYogaName } from '@/lib/localizedData';

export type KundliLang = 'en' | 'hi';

/**
 * Post-processing spell-corrections applied to every Hindi/Devanagari string
 * before it is handed to pdfnative. Fixes known model/data typos so the PDF
 * never ships corrupted or Marathi-influenced Devanagari.
 */
function fixHindi(s: string): string {
  if (!s) return '';
  return String(s)
    .replace(/शिन/g, 'शनि')
    .replace(/साढे/g, 'साढ़े')
    .replace(/वृक्षिक|वृक्षक/g, 'वृश्चिक')
    .replace(/मिशुन/g, 'मिथुन')
    .replace(/मंगली दोष/g, 'मंगल दोष')
    .replace(/अहम भाव/g, 'अष्टम भाव')
    .replace(/बकी|वकी/g, 'वक्री')
    .replace(/वतमान|वतर्मान/g, 'वर्तमान')
    .replace(/मŐ/g, 'में')
    .replace(/हœ/g, 'हैं')
    .replace(/आिथŊक/g, 'आर्थिक')
    .replace(/बृह˝ित/g, 'बृहस्पति');
}

/* -------------------------------------------------------------------------- */
/* Small typed helpers                                                        */
/* -------------------------------------------------------------------------- */

const SIGN_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

interface BuildCtx {
  kundliData: any;
  lang: KundliLang;
  isHi: boolean;
}

function safe(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v).trim();
  return s;
}

function txt(v: unknown): string {
  const s = String(v ?? '').trim();
  return s || '—';
}

function num(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  return String(v);
}

function yearOf(iso?: string): string {
  if (!iso) return '—';
  const y = new Date(iso).getFullYear();
  return Number.isFinite(y) ? String(y) : '—';
}

function signLordOf(sign: string | number): string {
  if (typeof sign === 'number') {
    if (sign >= 1 && sign <= 12) return SIGN_LORDS[sign] ?? '';
    return '';
  }
  const idx = SIGN_LIST.indexOf(sign);
  return idx >= 0 ? (SIGN_LORDS[idx + 1] ?? '') : '';
}

function locPlanet(lang: KundliLang, name: string): string {
  const key = name || '';
  return PLANET_NAMES[lang]?.[key] ?? key;
}

function locSign(lang: KundliLang, sign: string | number): string {
  if (typeof sign === 'number') {
    const idx = ((sign - 1) % 12 + 12) % 12;
    const names = lang === 'hi'
      ? ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन']
      : SIGN_LIST;
    return names[idx] ?? String(sign);
  }
  return ZODIAC_SIGNS[lang]?.[sign] ?? sign ?? '—';
}

function severityLabel(sev: unknown, lang: KundliLang): string {
  const s = String(sev ?? '').toLowerCase();
  if (lang === 'hi') {
    const m: Record<string, string> = {
      none: 'कोई नहीं', low: 'हल्का', mild: 'हल्का',
      moderate: 'मध्यम', severe: 'गंभीर', high: 'गंभीर',
    };
    return m[s] ?? s;
  }
  const m: Record<string, string> = {
    none: 'None', low: 'Low', mild: 'Mild',
    moderate: 'Moderate', severe: 'Severe', high: 'High',
  };
  return m[s] ?? s;
}

/* -------------------------------------------------------------------------- */
/* Block builders — each returns a pdfnative DocumentBlock                    */
/* -------------------------------------------------------------------------- */

type Align = 'l' | 'r' | 'c';

function H(text: string, level: 1 | 2 | 3 = 2): DocumentBlock {
  return { type: 'heading', text, level };
}
function P(text: string): DocumentBlock {
  return { type: 'paragraph', text };
}
function PB(): DocumentBlock {
  return { type: 'pageBreak' };
}
function R(cells: string[], rowType = 'data'): { cells: readonly string[]; type: string; pointed: boolean } {
  return { cells, type: rowType, pointed: false };
}
function T(
  headers: string[],
  rows: { cells: readonly string[]; type: string; pointed: boolean }[],
  columns?: readonly ColumnDef[],
): DocumentBlock {
  return { type: 'table', headers, rows, columns, cellVAlign: 'top', wrap: 'always' };
}
function L(items: string[], style: 'bullet' | 'numbered' = 'bullet'): DocumentBlock {
  return { type: 'list', items, style };
}

function eqCols(n: number, a: Align = 'l', mx = 56): readonly ColumnDef[] {
  return Array.from({ length: n }, () => ({ f: 1 / n, a, mx, mxH: mx }));
}

/** Apply fixHindi only to Hindi output; English passes through untouched. */
function F(ctx: BuildCtx, hi: string): string {
  return ctx.isHi ? fixHindi(hi) : hi;
}

/** Choose localized label. English string used as-is; Hindi is typo-fixed. */
function LBL(ctx: BuildCtx, en: string, hi: string): string {
  return ctx.isHi ? fixHindi(hi) : en;
}

/** Emit a narrative as one paragraph block per non-empty line (preserves breaks). */
function narrativeBlocks(ctx: BuildCtx, text: string | undefined | null): DocumentBlock[] {
  if (!text) return [];
  const cleaned = ctx.isHi ? fixHindi(String(text)) : String(text);
  const out: DocumentBlock[] = [];
  for (const line of cleaned.split(/\r?\n/)) {
    const t = line.trim();
    if (t) out.push(P(t));
  }
  return out;
}

/* -------------------------------------------------------------------------- */
/* Section builders                                                           */
/* -------------------------------------------------------------------------- */

function buildCoverBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const title = LBL(ctx, 'Vedic Kundli Report', 'वैदिक कुंडली रिपोर्ट');
  const name = safe(kundliData.name);
  const byline = LBL(ctx, 'Generated by AstroSage AI', 'AstroSage AI द्वारा निर्मित');
  return [
    H(title, 1),
    P(name),
    P(byline),
  ];
}

function buildBirthDetailsBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const bd = kundliData.birthDetails || {};
  const cd = kundliData.chartData || {};
  const headers = [LBL(ctx, 'Detail', 'विवरण'), LBL(ctx, 'Value', 'मान')];
  const twoCol = [
    { f: 0.42, a: 'l' as Align, mx: 50, mxH: 50 },
    { f: 0.58, a: 'l' as Align, mx: 160, mxH: 160 },
  ];
  const rows = [
    [LBL(ctx, 'Birth Date', 'जन्म तिथि'), txt(bd.birthDate)],
    [LBL(ctx, 'Birth Time', 'जन्म समय'), txt(bd.birthTime)],
    [LBL(ctx, 'Latitude', 'अक्षांश'), num(bd.latitude)],
    [LBL(ctx, 'Longitude', 'देशांतर'), num(bd.longitude)],
    [LBL(ctx, 'Timezone', 'समय क्षेत्र'), txt(bd.timezone)],
    [LBL(ctx, 'Ascendant (Lagna)', 'लग्न'), locSign(ctx.lang, cd.lagna)],
    [LBL(ctx, 'Moon Sign (Rashi)', 'चंद्र राशि'), locSign(ctx.lang, cd.moonSign)],
    [LBL(ctx, 'Sun Sign', 'सूर्य राशि'), locSign(ctx.lang, cd.sunSign)],
    [LBL(ctx, 'Nakshatra', 'नक्षत्र'), txt(cd.nakshatra)],
  ].map((r) => R(r));
  return [H(LBL(ctx, 'Birth Details', 'जन्म विवरण')), T(headers, rows, twoCol)];
}

function buildPlanetBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const planets: any[] = (kundliData.chartData && kundliData.chartData.planets) || [];
  const headers = [
    LBL(ctx, 'Planet', 'ग्रह'),
    LBL(ctx, 'Sign', 'राशि'),
    LBL(ctx, 'Sign Lord', 'राशि स्वामी'),
    LBL(ctx, 'Degree', 'अंश'),
    LBL(ctx, 'House', 'भाव'),
    LBL(ctx, 'Nakshatra', 'नक्षत्र'),
    LBL(ctx, 'State', 'अवस्था'),
  ];
  const rows = planets.map((p) => R([
    locPlanet(ctx.lang, p.name),
    locSign(ctx.lang, p.sign),
    locPlanet(ctx.lang, signLordOf(p.sign)),
    txt(p.degree),
    txt(p.house),
    txt(p.nakshatra),
    p.retrograde ? LBL(ctx, 'Retro', 'वक्री') : LBL(ctx, 'Direct', 'सीधा'),
  ]));
  return [H(LBL(ctx, 'Planetary Positions', 'ग्रह स्थिति')), T(headers, rows, eqCols(7))];
}

function buildHousesBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const houses: any[] = (kundliData.chartData && kundliData.chartData.houses) || [];
  const headers = ['', ''];
  const twoCol = [
    { f: 0.5, a: 'l' as Align, mx: 80, mxH: 80 },
    { f: 0.5, a: 'l' as Align, mx: 200, mxH: 200 },
  ];
  const cells: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const hd = houses.find((h) => Number(h.house) === i) || {};
    const sign = txt(hd.sign);
    const lord = locPlanet(ctx.lang, signLordOf(hd.sign));
    const occupants: string[] = Array.isArray(hd.planets) ? hd.planets.map((p: any) => locPlanet(ctx.lang, p)) : [];
    const cellText = `${LBL(ctx, `Bhava ${i}`, `भाव ${i}`)}: ${sign} | ${LBL(ctx, 'Lord', 'स्वामी')}: ${lord || '—'} | ${LBL(ctx, 'Occupants', 'निवासी')}: ${occupants.length ? occupants.join(', ') : '—'}`;
    cells.push(cellText);
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 2) {
    rows.push(R([cells[i], cells[i + 1] ?? '']));
  }
  return [H(LBL(ctx, 'Twelve Houses (Bhavas)', 'द्वादश भाव')), T(headers, rows, twoCol)];
}

function buildDoshaBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const doshas = (kundliData.calculations && kundliData.calculations.doshas) || {};
  const out: DocumentBlock[] = [H(LBL(ctx, 'Dosha Analysis', 'दोष विश्लेषण'))];

  const mangal = doshas.mangal;
  if (mangal) {
    const sev = severityLabel(mangal.severity, ctx.lang);
    out.push(
      H(LBL(ctx, 'Mangal Dosha (Mars)', 'मंगल दोष'), 2),
      P(mangal.description ? F(ctx, String(mangal.description)) : LBL(ctx, 'No description available.', 'कोई विवरण उपलब्ध नहीं है।')),
    );
    const remedies: string[] = Array.isArray(mangal.remedies)
      ? mangal.remedies.map((r: any) => F(ctx, String(r)))
      : [];
    if (remedies.length) out.push(L(remedies, 'bullet'));
    out.push(P(`${LBL(ctx, 'Severity', 'गंभीरता')}: ${sev}`));
  }

  const sade = doshas.sadeSati;
  if (sade) {
    const sev = sade.isActive ? severityLabel('moderate', ctx.lang) : severityLabel('none', ctx.lang);
    out.push(
      H(LBL(ctx, 'Sade Sati (Saturn)', 'साढ़े साती'), 2),
      P(sade.description ? F(ctx, String(sade.description)) : LBL(ctx, 'No description available.', 'कोई विवरण उपलब्ध नहीं है।')),
    );
    const remedies: string[] = Array.isArray(sade.remedies)
      ? sade.remedies.map((r: any) => F(ctx, String(r)))
      : [];
    if (remedies.length) out.push(L(remedies, 'bullet'));
    out.push(P(`${LBL(ctx, 'Severity', 'गंभीरता')}: ${sev}`));
  }

  const kaal = doshas.kaalSarp;
  if (kaal) {
    const sev = kaal.isPresent ? severityLabel('moderate', ctx.lang) : severityLabel('none', ctx.lang);
    out.push(
      H(LBL(ctx, 'Kaal Sarp Dosha', 'काल सर्प दोष'), 2),
      P(kaal.description ? F(ctx, String(kaal.description)) : LBL(ctx, 'No description available.', 'कोई विवरण उपलब्ध नहीं है।')),
    );
    const remedies: string[] = Array.isArray(kaal.remedies)
      ? kaal.remedies.map((r: any) => F(ctx, String(r)))
      : [];
    if (remedies.length) out.push(L(remedies, 'bullet'));
    out.push(P(`${LBL(ctx, 'Severity', 'गंभीरता')}: ${sev}`));
  }
  return out;
}

function buildYogaBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const yogas = (kundliData.calculations && kundliData.calculations.yogas) || {};
  const rows: { cells: readonly string[]; type: string; pointed: boolean }[] = [];

  const add = (name: string, desc: string, str: string) => {
    const hindiName = ctx.isHi
      ? F(ctx, getLocalizedYogaName(name, 'hi'))
      : (getLocalizedYogaName(name, 'en') || txt(name));
    rows.push(R([
      txt(name),
      hindiName,
      txt(str),
      txt(desc),
    ]));
  };

  if (yogas.gajakesari && yogas.gajakesari.isPresent) {
    add(yogas.gajakesari.name, yogas.gajakesari.description, yogas.gajakesari.strength);
  }
  if (yogas.budhaditya && yogas.budhaditya.isPresent) {
    add(yogas.budhaditya.name, yogas.budhaditya.description, yogas.budhaditya.strength);
  }
  const dhana: any[] = Array.isArray(yogas.dhanaYogas) ? yogas.dhanaYogas : [];
  for (const dy of dhana) {
    if (dy && dy.isPresent !== false) add(dy.name, dy.description, '');
  }

  const headers = [
    LBL(ctx, 'Yoga', 'योग'),
    LBL(ctx, 'Hindi Name', 'हिंदी नाम'),
    LBL(ctx, 'Strength', 'शक्ति'),
    LBL(ctx, 'Description', 'विवरण'),
  ];
  const columns = [
    { f: 0.18, a: 'l' as Align, mx: 40, mxH: 40 },
    { f: 0.22, a: 'l' as Align, mx: 50, mxH: 50 },
    { f: 0.12, a: 'c' as Align, mx: 30, mxH: 30 },
    { f: 0.48, a: 'l' as Align, mx: 120, mxH: 120 },
  ];
  const out: DocumentBlock[] = [H(LBL(ctx, 'Yoga Analysis', 'योग विश्लेषण'))];
  if (rows.length) out.push(T(headers, rows, columns));
  else out.push(P(LBL(ctx, 'No major yoga combinations were detected.', 'कोई प्रमुख योग संयुक्त नहीं पाया गया।')));
  return out;
}

function buildDashaBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const v = (kundliData.calculations && kundliData.calculations.vimshottari) || {};
  const mahadashas: any[] = Array.isArray(v.mahadashas) ? v.mahadashas : [];
  const cur = v.currentDasha;
  const out: DocumentBlock[] = [H(LBL(ctx, 'Vimshottari Dasha (120-Year Cycle)', 'विंशोत्तरी दशा (120 वर्ष चक्र)'))];

  if (cur) {
    out.push(P(
      `${LBL(ctx, 'Running Mahadasha', 'चल रही महादशा')}: ${locPlanet(ctx.lang, cur.mahadasha)} / ` +
      `${LBL(ctx, 'Antardasha', 'अंतर्दशा')}: ${locPlanet(ctx.lang, cur.antardasha)} / ` +
      `${yearOf(cur.startDate)} – ${yearOf(cur.endDate)}`
    ));
  }

  const headers = [
    LBL(ctx, 'Mahadasha', 'महादशा'),
    LBL(ctx, 'Start', 'प्रारंभ'),
    LBL(ctx, 'End', 'समाप्ति'),
    LBL(ctx, 'Years', 'वर्ष'),
  ];
  const rows = mahadashas.map((md) => R([
    locPlanet(ctx.lang, md.lord),
    yearOf(md.startDate),
    yearOf(md.endDate),
    num(md.years),
  ]));
  out.push(T(headers, rows, eqCols(4)));

  out.push(PB());
  for (const md of mahadashas) {
    const hiTxt = `${locPlanet('hi', md.lord)} महादशा (${yearOf(md.startDate)}–${yearOf(md.endDate)})`;
    const enTxt = `${locPlanet('en', md.lord)} Mahadasha (${yearOf(md.startDate)}–${yearOf(md.endDate)})`;
    out.push(H(LBL(ctx, enTxt, hiTxt), 2));
    const ads: any[] = Array.isArray(md.antardashas) ? md.antardashas : [];
    const aHeaders = [
      '#',
      LBL(ctx, 'Antardasha', 'अंतर्दशा'),
      LBL(ctx, 'Start', 'प्रारंभ'),
      LBL(ctx, 'End', 'समाप्ति'),
    ];
    const aRows = ads.map((ad, i) => R([
      String(i + 1),
      locPlanet(ctx.lang, ad.planet),
      yearOf(ad.startDate),
      yearOf(ad.endDate),
    ]));
    out.push(T(aHeaders, aRows, eqCols(4)));
    out.push(PB());
  }
  return out;
}

function buildPillarBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const pillars: any[] = Array.isArray(kundliData.pillars) ? kundliData.pillars : [];
  const out: DocumentBlock[] = [];
  for (const pillar of pillars) {
    if (!pillar || typeof pillar !== 'object') continue;
    const title = ctx.isHi ? (pillar.titleHi || pillar.titleEn || '') : (pillar.titleEn || pillar.titleHi || '');
    out.push(H(F(ctx, title || ''), 2));
    out.push(...narrativeBlocks(ctx, ctx.isHi ? pillar.narrativeHi : pillar.narrativeEn));
    const milestones: any[] = Array.isArray(pillar.milestones) ? pillar.milestones : [];
    if (milestones.length) {
      const headers = [
        LBL(ctx, 'Period', 'अवधि'),
        LBL(ctx, 'Event', 'घटना'),
        LBL(ctx, 'Note', 'टिप्पणी'),
      ];
      const columns = [
        { f: 0.25, a: 'l' as Align, mx: 50, mxH: 50 },
        { f: 0.45, a: 'l' as Align, mx: 90, mxH: 90 },
        { f: 0.3, a: 'l' as Align, mx: 80, mxH: 80 },
      ];
      const rows = milestones.map((m) => R([
        m.period ? F(ctx, String(m.period)) : '—',
        m.event ? F(ctx, String(m.event)) : '—',
        m.note ? F(ctx, String(m.note)) : '—',
      ]));
      out.push(T(headers, rows, columns));
    }
    out.push(PB());
  }
  return out;
}

function buildRemediesBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const rp = kundliData.richPredictions || {};
  const remedies = rp.remedies || {};
  const gems: string[] = Array.isArray(remedies.gemspstones) ? remedies.gemspstones : [];
  const mantras: string[] = Array.isArray(remedies.dailyMantras) ? remedies.dailyMantras : [];
  const out: DocumentBlock[] = [H(LBL(ctx, 'Remedial Measures', 'उपाय मार्गदर्शन'))];
  if (gems.length) {
    out.push(P(LBL(ctx, 'Gemstones', 'रत्न')));
    out.push(L(gems.map((g) => F(ctx, String(g))), 'bullet'));
  }
  if (mantras.length) {
    out.push(P(LBL(ctx, 'Daily Mantras', 'दैनिक मंत्र')));
    out.push(L(mantras.map((m) => F(ctx, String(m))), 'bullet'));
  }
  return out;
}

function buildGocharBlocks(ctx: BuildCtx): DocumentBlock[] {
  const { kundliData } = ctx;
  const planets: any[] = (kundliData.chartData && kundliData.chartData.planets) || [];
  const headers = [
    LBL(ctx, 'Planet', 'ग्रह'),
    LBL(ctx, 'Sign', 'राशि'),
    LBL(ctx, 'House', 'भाव'),
    LBL(ctx, 'Nakshatra', 'नक्षत्र'),
    LBL(ctx, 'Status', 'वक्री / सीधा'),
  ];
  const rows = planets.map((p) => R([
    locPlanet(ctx.lang, p.name),
    locSign(ctx.lang, p.sign),
    txt(p.house),
    txt(p.nakshatra),
    p.retrograde ? LBL(ctx, 'Retro', 'वक्री') : LBL(ctx, 'Direct', 'सीधा'),
  ]));
  return [H(LBL(ctx, 'Transits (Gochar)', 'गोचर')), T(headers, rows, eqCols(5))];
}

function buildNarrativeSection(ctx: BuildCtx, enTitle: string, hiTitle: string, enKey: 'health' | 'wealth' | 'marriage' | 'career'): DocumentBlock[] {
  const { kundliData } = ctx;
  const rp = kundliData.richPredictions || {};
  const section = rp[enKey];
  if (!section) return [];
  const narrative = section.narrative || section.narrativeEn || section.narrativeHi;
  if (!narrative) return [];
  return [H(LBL(ctx, enTitle, hiTitle)), ...narrativeBlocks(ctx, narrative)];
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Build the Kundli PDF with pdfnative and return the raw PDF bytes.
 *
 * IMPORTANT: pdfnative is a Node-targeted library — its bundle contains a
 * literal `await import('fs')`, so it can never be bundled for the browser.
 * This function must therefore only be called from a server context (the
 * `/api/kundali/pdf-native` route), never from a client component.
 */
export async function buildKundliPdfBytes(kundliData: any, lang: KundliLang): Promise<Uint8Array> {
  const ctx: BuildCtx = { kundliData, lang, isHi: lang === 'hi' };

  const blocks: DocumentBlock[] = [];

  blocks.push(...buildCoverBlocks(ctx));
  blocks.push(PB());
  blocks.push(...buildBirthDetailsBlocks(ctx));
  blocks.push(PB());
  blocks.push(...buildPlanetBlocks(ctx));
  blocks.push(PB());
  blocks.push(...buildHousesBlocks(ctx));
  blocks.push(PB());

  // Dosha analysis
  const doshaBlocks = buildDoshaBlocks(ctx);
  if (doshaBlocks.length > 1) {
    blocks.push(...doshaBlocks);
    blocks.push(PB());
  }

  // Yoga analysis
  const yogaBlocks = buildYogaBlocks(ctx);
  if (yogaBlocks.length > 1) {
    blocks.push(...yogaBlocks);
    blocks.push(PB());
  }

  // Vimshottari Dasha
  const v = (kundliData.calculations && kundliData.calculations.vimshottari) || {};
  const hasDasha = Array.isArray(v.mahadashas) && v.mahadashas.length > 0;
  if (hasDasha) {
    blocks.push(...buildDashaBlocks(ctx));
    blocks.push(PB());
  }

  // Life pillars
  const pillars: any[] = Array.isArray(kundliData.pillars) ? kundliData.pillars : [];
  if (pillars.length) {
    blocks.push(...buildPillarBlocks(ctx));
  }

  // Detailed deep-dive narratives
  const healthBlocks = buildNarrativeSection(ctx, 'Detailed Health Analysis', 'विस्तृत स्वास्थ्य विश्लेषण', 'health');
  if (healthBlocks.length) { blocks.push(...healthBlocks); blocks.push(PB()); }

  const wealthBlocks = buildNarrativeSection(ctx, 'Detailed Wealth Analysis', 'विस्तृत धन विश्लेषण', 'wealth');
  if (wealthBlocks.length) { blocks.push(...wealthBlocks); blocks.push(PB()); }

  const marriageBlocks = buildNarrativeSection(ctx, 'Detailed Marriage & Love Analysis', 'विस्तृत विवाह एवं प्रेम विश्लेषण', 'marriage');
  if (marriageBlocks.length) { blocks.push(...marriageBlocks); blocks.push(PB()); }

  const careerBlocks = buildNarrativeSection(ctx, 'Career Guidance', 'करियर मार्गदर्शन', 'career');
  if (careerBlocks.length) { blocks.push(...careerBlocks); blocks.push(PB()); }

  // Remedies
  const rp = kundliData.richPredictions || {};
  const remedies = rp.remedies || {};
  const gems: string[] = Array.isArray(remedies.gemspstones) ? remedies.gemspstones : [];
  const mantras: string[] = Array.isArray(remedies.dailyMantras) ? remedies.dailyMantras : [];
  if (gems.length || mantras.length) {
    blocks.push(...buildRemediesBlocks(ctx));
    blocks.push(PB());
  }

  // Transits (Gochar)
  const cd = kundliData.chartData || {};
  const gocharPlanets: any[] = Array.isArray(cd.planets) ? cd.planets : [];
  if (gocharPlanets.length) {
    blocks.push(...buildGocharBlocks(ctx));
    blocks.push(PB());
  }

  // Footer
  const disclaimer = LBL(
    ctx,
    'This report is generated for guidance and educational purposes only. It is not a substitute for professional medical, legal, or financial advice.',
    'यह रिपोर्ट केवल मार्गदर्शन और शैक्षिक उद्देश्य के लिए तैयार की गई है। यह पेशेवर चिकित्सा, कानूनी, या वित्तीय सलाह का स्थान नहीं लेती।',
  );
  blocks.push(P(disclaimer));
  blocks.push(P('AstroSage AI © 2026'));

  // --- Font registration (Devanagari only) + PDF build + download ---
  let fontEntries: readonly { fontData: FontData; fontRef: string; lang?: string }[] = [];
  if (ctx.isHi) {
    registerFonts({
      devanagari: () => import('pdfnative/fonts/noto-devanagari-data.js') as unknown as Promise<FontData>,
    });
    const fontData = await loadFontData('devanagari');
    if (!fontData) {
      throw new Error('Failed to load Devanagari font data from pdfnative.');
    }
    fontEntries = [{ fontData, fontRef: 'Dev', lang: 'hi' }];
  }

  const docTitle = LBL(ctx, 'Vedic Kundli Report', 'वैदिक कुंडली रिपोर्ट');
  const footerText = 'AstroSage AI © 2026';
  return buildDocumentPDFBytes({
    title: docTitle,
    blocks,
    fontEntries,
    footerText,
    layout: { normalize: 'NFC' },
  });
}
