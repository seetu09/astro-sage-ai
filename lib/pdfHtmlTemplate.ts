import {
  renderKundliChartSvg,
  ChartPlanetInput,
  ChartHouseInput,
} from "@/lib/kundliChart";
import { getSignIndex, SIGN_LORDS, localizePlanet, localizeSign, localizeRashi, canonicalPlanet } from "@/lib/astrologyDictionary";
import { getTranslation, translations, type Language } from "@/lib/i18n/translations";

export interface ReportData {
  clientName: string;
  chartType: string;
  birthDetails: { date: string; time: string; latitude: string; longitude: string; timezone: string };
  planetaryPositions: { body: string; sign: string; degree: string; house: string; retro?: boolean }[];
  houseCusps: { house: number; sign: string; degree: string }[];
  dashaPeriods: { mahaDasha: string; startYear: string; endYear: string; subPeriod?: string }[];
  yogas: { name: string; description: string }[];
  remedies: { category: string; description: string }[];
  domainInsights: { domain: "career" | "marriage" | "wealth" | "health" | "finance" | "education"; prediction: string; analysis: string; timeframe?: string }[];
  northIndianChartSvg: string;
  kalpurushaPhalDeepikaRefs: { verse: string; interpretation: string }[];
  scorecard: { parameter: string; score: number; maxScore: number }[];
  /**
   * Compact Panchang strip rendered on Page 1 of the consolidated layout.
   * Every field is optional — tiles are omitted when absent.
   */
  panchang?: {
    varaWeekday?: string;
    nakshatra?: string;
    nakshatraLord?: string;
    moonSign?: string;
    sunSign?: string;
    lagna?: string;
  };
  /** Raw Navamsa (D9) matrix — rendered as an inline SVG diamond chart on Page 2. */
  d9Chart?: {
    ascendantSign: number;
    planets: { planet: string; sign: number; house: number; retrograde: boolean }[];
  };
  /** Sarvashtakavarga total bindus per house (index 0 = House 1) for the Page-2 grid. */
  sarvashtakavarga?: { bindus: number[]; beneficialHouses?: number[] };
  isPaidTier: boolean;
  /**
   * Optional AI Life-Pillar narratives (`POST /api/kundali/narratives` →
   * `LifePillarConfig[]`). When present, each pillar is rendered as its own
   * localized appendix page right after the Summary — this is what takes the
   * report from the 20 deterministic pages up to the full "25-page" edition.
   */
  narratives?: ReportNarrative[];
}

/**
 * Localized AI narrative for one of the six Life Pillars, as consumed by the
 * PDF template appendix. Field names mirror `LifePillarConfig` from
 * `@/lib/pillarNarratives` so payloads can be passed through unmodified.
 */
export interface ReportNarrative {
  key: string;
  titleEn: string;
  titleHi: string;
  badges?: { score?: string; timeframe?: string; lord?: string };
  narrativeEn: string;
  narrativeHi: string;
  milestones?: { period: string; event: string; note?: string; outcome?: "positive" | "neutral" | "caution" }[];
}

/** All template labels live under `pdf.template` in the i18n dictionary. */
type PdfTemplateKey = keyof typeof translations.en.pdf.template;

const escapeHTML = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const L = (key: PdfTemplateKey, lang: Language): string => getTranslation(lang, `pdf.template.${key}`);

/** Localize a planet name (English/Sanskrit/Hindi → target language). */
const localizePlanetName = (name: string, lang: Language): string =>
  localizePlanet(canonicalPlanet(name), lang);

/** Localize a sign descriptor (name or 1-12 index → target language). */
const localizeSignName = (sign: string | number, lang: Language): string => {
  const idx = getSignIndex(sign);
  return idx ? localizeRashi(idx, lang) : localizeSign(String(sign), lang);
};

/** Domain key → localized LABEL lookup key for the life-domain pages. */
const DOMAIN_LABEL_KEYS: Record<string, PdfTemplateKey> = {
  career: "domainCareer",
  marriage: "domainMarriage",
  wealth: "domainWealth",
  health: "domainHealth",
  finance: "domainFinance",
  education: "domainEducation",
  family: "domainFamily",
};

const CSS = `
@page { margin: 0; padding: 0; size: A4; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  /* Client fallback (window.print): hard breaks so every dense .page-container
     lands on its own physical sheet, chrome included. */
  html, body { width: 210mm; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-container {
    page-break-after: always;
    break-after: page;
    width: 210mm;
    height: auto;
    /* REMOVED: max-height and overflow: hidden — these clip content and create artificial blank space */
  }
  .page-container:last-child { page-break-after: auto; break-after: auto; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; background: #fff; }
html, body { overflow: hidden; }
@page :first { margin: 0; }

/* Dense A4 sheet — standard 210mm × 297mm portrait with uniform 12mm padding.
   Sheets GROUP multiple sections; only the container carries the page break,
   so small standalone components never force a near-empty page anymore. */
.page-container {
  width: 210mm;
  height: auto;
  padding: 12mm;
  margin: 0 auto;
  page-break-after: always;
  position: relative;
  background: #fff;
}
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
/* Inner cards/tables intentionally carry NO page-break rules — each .page-container
   is the strict A4 boundary (1 page = 1 A4 unit). Related sections are simply
   grouped inside that single wrapper so the renderer never forces a mid-card
   split or emits a near-empty overflow sheet. */
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.25cm; border-bottom: 3pt solid #999; margin-bottom: 0.35cm; }
.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 16pt; font-weight: 700; }
.header h1.en { font-family: 'Inter', sans-serif; }
.header .meta { text-align: right; font-size: 9pt; color: #555; }
.header .meta span { display: block; }
.cover-band { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1pt solid #ddd; padding-bottom: 0.2cm; margin-bottom: 0.3cm; }
.cover-band .client-name { font-size: 15pt; font-weight: 700; font-family: 'Noto Sans Devanagari', sans-serif; }
.footer { position: absolute; bottom: 10mm; width: calc(100% - 24mm); text-align: center; font-size: 8pt; color: #777; border-top: 1pt solid #ddd; padding-top: 0.25cm; }
.footer .page-number { display: inline-block; }
.h2 { font-size: 11pt; font-weight: 700; margin-bottom: 0.25cm; color: #333; }
.h2.en { font-family: 'Inter', sans-serif; }
.p { font-size: 9.5pt; margin-bottom: 0.25cm; text-align: justify; }
.p.en { font-family: 'Inter', sans-serif; }
.two-col { column-count: 2; column-gap: 0.5cm; }
.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.3cm; }
.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 3px 5px; text-align: left; font-size: 8.5pt; }
.table-0 th { background: #f0f0f0; }
.chart-container { text-align: center; margin: 0.25cm auto; }
.chart-container svg { max-width: 100%; height: auto; }
.chart-sm { max-width: 82mm; margin-left: auto; margin-right: auto; }
.section-title { font-size: 10pt; font-weight: 700; margin: 0.2cm 0 0.1cm; display: inline-block; }
.score-bar { height: 6pt; background: #eee; border-radius: 2px; overflow: hidden; display: inline-block; width: 60%; vertical-align: middle; margin-left: 5px; }
.score-fill { height: 100%; background: #3b82f6; }
.score-text { font-size: 8.5pt; font-weight: 700; }
.tag { display: inline-block; padding: 1pt 6px; border-radius: 3px; font-size: 8pt; font-weight: 700; }
.tag.paid { background: #fbbf24; color: #78350f; }
.tag.basic { background: #9ca3af; color: #374151; }
.badge-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 0.25cm; }
.divider { border-top: 1pt dashed #bbb; margin: 0.2cm 0; }
.note { font-size: 8pt; font-style: italic; color: #666; }

/* Panchang strip — compact key/value tiles (Page 1). */
.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 0.25cm; }
.tile { border: 0.5pt solid #bbb; border-radius: 3px; padding: 4px 6px; }
.tile-k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.tile-v { font-size: 9.5pt; font-weight: 700; color: #1a1a1a; }

/* Two-up layout for house-cusps table + D9 chart (Page 2). */
.grid-2 { display: flex; gap: 6mm; align-items: flex-start; }
.grid-2 > div { flex: 1; min-width: 0; }
.grid-2 > table { flex: 1; min-width: 0; align-self: flex-start; }

/* Sarvashtakavarga bindu grid (Page 2). */
.av-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; max-width: 150mm; margin: 0 auto 0.2cm; }
.av-cell { border: 0.5pt solid #bbb; border-radius: 3px; text-align: center; padding: 3px 0; }
.av-cell.av-strong { background: #ecfdf5; border-color: #059669; }
.av-h { display: block; font-size: 7pt; color: #666; }
.av-b { display: block; font-size: 11pt; font-weight: 700; }

/* Dual-domain layout — two life domains packed onto ONE A4 sheet. */
.dual-domain-grid { display: flex; flex-direction: column; gap: 4mm; }
.domain-half { flex: 1; min-height: 0; }
.domain-title { font-size: 11.5pt; font-weight: 700; margin-bottom: 0.15cm; color: #333; }
.domain-title.en { font-family: 'Inter', sans-serif; }
.domain-badges { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; margin-bottom: 0.2cm; }
.domain-badges .tag { text-align: center; padding: 2pt 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.domain-narrative { font-size: 9pt; text-align: justify; line-height: 1.5; max-height: 65mm; overflow: hidden; margin-bottom: 0.2cm; }
.mini-table { width: 100%; border-collapse: collapse; }
.mini-table th, .mini-table td { border: 0.5pt solid #bbb; padding: 2mm 4px; text-align: left; font-size: 8.5pt; }
.mini-table th { background: #f0f0f0; }
.domain-divider { border-top: 0.6pt solid rgba(0, 0, 0, 0.1); margin: 4mm 0; }

/* ── New premium sections: dosha verdict card, remedy grid, dasha deep-dive,
   Sade Sati tracker and the 120-year master table ── */
.verdict-card { border: 1pt solid #cbd5e1; border-left: 3pt solid #3b82f6; border-radius: 3px; padding: 2mm 3mm; margin-bottom: 0.25cm; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.verdict-card .status-badge { font-size: 8pt; font-weight: 700; padding: 1pt 5px; border-radius: 3px; }
.status-ok { background: #dcfce7; color: #166534; }
.status-warn { background: #fef3c7; color: #92400e; }
.prescript-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 0.25cm; }
.prescript-card { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }
.prescript-k { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.prescript-v { font-size: 10.5pt; font-weight: 700; margin-top: 1pt; }
.prescript-line { font-size: 8.5pt; margin-top: 1pt; }
.dasha-focus-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 0.25cm; }
.dasha-focus { border: 1pt solid #d1d5db; border-radius: 3px; padding: 2mm 3mm; flex: 1 1 30%; min-width: 55mm; }
.dasha-focus.active { background: #eff6ff; border-color: #2563eb; }
.dasha-focus .k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }
.dasha-focus .v { font-size: 11pt; font-weight: 700; margin-top: 0.05cm; }
.dasha-cycle { list-style: none; margin: 0; padding: 0; }
.dasha-cycle li { display: flex; justify-content: space-between; border-bottom: 0.4pt dashed #ddd; padding: 1.5mm 0; font-size: 8.5pt; }
.dasha-cycle li.active { font-weight: 700; color: #1d4ed8; }
.tracker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; align-items: stretch; }
.tracker-box { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }
.tracker-box .tracker-title { font-size: 10.5pt; font-weight: 700; margin-bottom: 0.12cm; color: #333; }
.tracker-table { width: 100%; border-collapse: collapse; font-size: 8pt; }
.tracker-table th, .tracker-table td { border: 0.4pt solid #ccc; padding: 1.5mm 2mm; text-align: left; }
.tracker-table th { background: #f0f0f0; }
`;

const PAGE_CHROME = (title: string, lang: Language, pageNumber: number, data: Pick<ReportData, "clientName" | "isPaidTier">): string => `<div class="page-container">
<div class="header">
  <h1 class="${lang === 'en' ? 'en' : ''}">${escapeHTML(title)}</h1>
  <div class="meta">
    <span><span class="section-title">${L("clientName", lang)}:</span> ${escapeHTML(data.clientName)}</span>
    <span class="tag ${data.isPaidTier ? "paid" : "basic"}">${data.isPaidTier ? L("paid", lang) : L("basic", lang)}</span>
  </div>
</div>
<div class="page-content">
`;

const PAGE_FOOTER = (pageNumber: number, lang: Language): string => `
</div>
<div class="footer">
  <span class="page-number">${L("page", lang)} ${pageNumber}</span>
</div>
</div>`;

/**
 * Map ReportData into the pure-SSR Kundli chart renderer input.
 * Planetary `body`/`sign` are normalized through the localization dictionary so
 * that English, Sanskrit and Hindi spellings all resolve to the same glyphs.
 */
const buildChartInput = (
  data: ReportData
): { planets: ChartPlanetInput[]; houses: ChartHouseInput[]; ascendantSign: number } => {
  // Lagna = house-1 cusp sign when available (falls back to Mesha/Aries).
  const ascendantSign =
    (data.houseCusps && data.houseCusps.length
      ? getSignIndex(data.houseCusps[0].sign)
      : 0) || 1;

  const planets: ChartPlanetInput[] = (data.planetaryPositions || []).map((p) => ({
    planet: p.body,
    sign: getSignIndex(p.sign) || 1,
    house: parseInt(String(p.house), 10) || 1,
    retrograde: !!p.retro,
  }));

  const houses: ChartHouseInput[] = (data.houseCusps || []).map((h) => ({
    house: h.house,
    sign: getSignIndex(h.sign) || 1,
  }));

  return { planets, houses, ascendantSign };
};

/**
 * Render a pure inline-SVG Kundli chart (North or South Indian) for the PDF.
 * Falls back to the pre-rendered `northIndianChartSvg` when a caller has
 * already supplied one (preserving existing behaviour).
 */
const renderChartSvg = (data: ReportData, lang: Language, style: "north" | "south"): string => {
  if (style === "north" && /^<svg/.test(data.northIndianChartSvg || "")) {
    return data.northIndianChartSvg;
  }
  const { planets, houses, ascendantSign } = buildChartInput(data);
  return renderKundliChartSvg({
    style,
    language: lang,
    ascendantSign,
    planets,
    houses,
    showTitle: true,
  });
};

// ─── Dense consolidated sheets ──────────────────────────────────────────────
// Sheets GROUP related sections onto one A4 page; only the .page-container
// itself carries the page break, eliminating the sparse one-section-per-sheet
// blank space of the previous layout.

/** Shared compact key/value tile used by the Panchang strip. */
const tile = (key: PdfTemplateKey, lang: Language, value?: string): string =>
  value
    ? `<div class="tile"><div class="tile-k">${escapeHTML(L(key, lang))}</div><div class="tile-v">${escapeHTML(value)}</div></div>`
    : "";

/**
 * PAGE 1 — Nativity details + Panchang strip (Lagna / Moon Sign / Sun Sign /
 * Nakshatra / Weekday) + D1 diamond chart + core planetary table. Absorbs the
 * old near-empty cover, birth-details and planetary-positions sheets into one
 * standard A4 sheet.
 */
const buildNativityPanchangChartPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const bd = data.birthDetails;
  const pc = data.panchang;
  const nativityTable = bd
    ? `<table class="table-0">
<tr><th>${L("clientName", lang)}</th><td>${escapeHTML(data.clientName)}</td><th>${L(
        "chartType",
        lang
      )}</th><td>${escapeHTML(data.chartType)}</td></tr>
<tr><th>${L("birthDetails", lang)}</th><td>${escapeHTML(bd.date)} · ${escapeHTML(
        bd.time
      )}</td><th>${L("tz", lang)}</th><td>${escapeHTML(bd.timezone)}</td></tr>
<tr><th>${L("latLong", lang)}</th><td colspan="3">${escapeHTML(bd.latitude)}${
        bd.longitude ? `, ${escapeHTML(bd.longitude)}` : ""
      }</td></tr>
</table>`
    : "";
  const panchangGrid = pc
    ? `<div class="tile-grid">${[
        tile("varaWeekday", lang, pc.varaWeekday),
        tile("nakshatra", lang, pc.nakshatra),
        tile("nakshatraLord", lang, pc.nakshatraLord ? localizePlanetName(pc.nakshatraLord, lang) : undefined),
        tile("moonSign", lang, pc.moonSign ? localizeSignName(pc.moonSign, lang) : undefined),
        tile("sunSign", lang, pc.sunSign ? localizeSignName(pc.sunSign, lang) : undefined),
        tile("lagna", lang, pc.lagna ? localizeSignName(pc.lagna, lang) : undefined),
      ].join("")}</div>`
    : "";
  const planetRows = (data.planetaryPositions || [])
    .map(p => `<tr><td>${escapeHTML(localizePlanetName(p.body, lang))}</td><td>${escapeHTML(localizeSignName(p.sign, lang))}</td><td>${escapeHTML(p.degree)}</td><td>${escapeHTML(p.house)}</td><td>${p.retro ? "✓" : "-"}</td></tr>`)
    .join("");
  return `
${PAGE_CHROME(L("title", lang), lang, pageNumber, data)}
<div class="cover-band"><span class="client-name">${escapeHTML(
    data.clientName
  )}</span><span class="tag ${data.isPaidTier ? "paid" : "basic"}">${
    data.isPaidTier ? L("paid", lang) : L("basic", lang)
  }</span></div>
${nativityTable}
${panchangGrid ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("panchang", lang)}</h2>
${panchangGrid}
</div>` : ""}
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("lagnaD1Chart", lang)}</h2>
<div class="chart-container chart-sm">${renderChartSvg(data, lang, "north")}</div>
</div>
${planetRows ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("planetaryPositions", lang)}</h2>
<table class="table-0">
<tr><th>${L("bodyCol", lang)}</th><th>${L("signCol", lang)}</th><th>${L("degreeCol", lang)}</th><th>${L("houseCol", lang)}</th><th>${L("retroCol", lang)}</th></tr>
${planetRows}
</table>
</div>` : ""}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE 2 — House-cusps table + Navamsa (D9) diamond chart side by side,
 * followed by the Sarvashtakavarga bindu grid when calculation data exists.
 */
const buildHousesNavamsaAshtakavargaPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const sav = data.sarvashtakavarga?.bindus?.length ? data.sarvashtakavarga : null;
  const d9Svg = data.d9Chart
    ? renderKundliChartSvg({
        style: "north",
        language: lang,
        ascendantSign: data.d9Chart.ascendantSign || 1,
        planets: data.d9Chart.planets,
        showTitle: false,
      })
    : "";
  const avCells = sav
    ? sav.bindus
        .map((b, i) => `<div class="av-cell${
          sav.beneficialHouses?.includes(i + 1) ? " av-strong" : ""
        }"><span class="av-h">${escapeHTML(L("houseShort", lang))}${i + 1}</span><span class="av-b">${Number(b) || 0}</span></div>`)
        .join("")
    : "";
  const houseRows = (data.houseCusps || [])
    .map(h => `<tr><td>${escapeHTML(String(h.house))}</td><td>${escapeHTML(localizeSignName(h.sign, lang))}</td><td>${escapeHTML(h.degree || "-")}</td></tr>`)
    .join("");
  // Split the 12 cusps into two side-by-side tables so the block stays compact.
  const half = Math.ceil((data.houseCusps || []).length / 2) || 6;
  const houseCols = data.houseCusps?.length
    ? `<div class="grid-2">
<table class="table-0"><tr><th>${L("houseCol", lang)}</th><th>${L("signCol", lang)}</th><th>${L("degreeCol", lang)}</th></tr>${houseRows.slice(0, half)}</table>
<table class="table-0"><tr><th>${L("houseCol", lang)}</th><th>${L("signCol", lang)}</th><th>${L("degreeCol", lang)}</th></tr>${houseRows.slice(half)}</table>
</div>`
    : `<p class="note">${L("houseDataUnavailable", lang)}</p>`;
  return `
${PAGE_CHROME(L("housesNavamsaAshtakavarga", lang), lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("houseCusps", lang)}</h2>
${houseCols}
</div>
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("navamsaD9Chart", lang)}</h2>
${d9Svg ? `<div class="chart-container chart-sm">${d9Svg}</div>` : `<p class="note">${L("notAvailable", lang)}</p>`}
</div>
${sav ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("sarvashtakavarga", lang)}</h2>
<div class="av-grid">${avCells}</div>
${sav.beneficialHouses?.length ? `<p class="note">${L("strongHouses", lang)}: ${sav.beneficialHouses.join(", ")}</p>` : ""}
</div>` : ""}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE 3 — Vimshottari dasha table (Mahadasha / Antardasha periods) + yogas +
 * remedies packed together. Returns "" when none of the three carry data so no
 * placeholder/blank "उपाय" sheet can ever leak into the PDF.
 */
const buildDashaYogasRemediesPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const dashaRows = (data.dashaPeriods || [])
    .map(d => `<tr><td>${escapeHTML(localizePlanetName(d.mahaDasha, lang))}</td><td>${escapeHTML(d.startYear)}</td><td>${escapeHTML(d.endYear)}</td><td>${escapeHTML(d.subPeriod || "-")}</td></tr>`)
    .join("");
  const yogaItems = (data.yogas || [])
    .map(y => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(y.name)}</span> — <span class="p ${lang === "en" ? "en" : ""}">${escapeHTML(y.description)}</span></div>`)
    .join("");
  const remedyItems = (data.remedies || [])
    .map(r => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(r.category)}</span><p class="p ${lang === "en" ? "en" : ""}">${escapeHTML(r.description)}</p></div>`)
    .join("");

  const dashaSection = dashaRows
    ? `<div class="section-block"><h2 class="h2 ${lang === "en" ? "en" : ""}">${L("dashaPeriods", lang)}</h2><table class="table-0"><tr><th>${L("mahaDashaCol", lang)}</th><th>${L("startCol", lang)}</th><th>${L("endCol", lang)}</th><th>${L("subPeriodCol", lang)}</th></tr>${dashaRows}</table></div>`
    : `<p class="note">Dasha periods computed from birth nakshatra. Detailed sub-periods require exact birth time.</p>`;
  const yogaSection = yogaItems
    ? `<div class="section-block"><h2 class="h2 ${lang === "en" ? "en" : ""}">${L("yogas", lang)}</h2>${yogaItems}</div>`
    : `<p class="note">No major classical yogas are prominently indicated in this chart.</p>`;
  const remedySection = remedyItems
    ? `<div class="section-block"><h2 class="h2 ${lang === "en" ? "en" : ""}">${L("remedies", lang)}</h2><div class="two-col">${remedyItems}</div></div>`
    : `<p class="note">General remedies: chant the Gayatri mantra, respect elders, and maintain a disciplined daily routine.</p>`;

  return `
${PAGE_CHROME(L("dashasYogasRemedies", lang), lang, pageNumber, data)}
${dashaSection}
${yogaSection}
${remedySection}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/** Domain → primary bhava used for the header metric badges. */
const DOMAIN_HOUSES: Record<string, number> = {
  career: 10, marriage: 7, wealth: 2, health: 6, finance: 11, education: 4,
};

/** Clamp a narrative to at most `max` words so a dual-domain half never spills. */
const clampWords = (text: string, max: number): string => {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length <= max ? text : `${words.slice(0, max).join(" ")}…`;
};

/**
 * DUAL-DOMAIN PAGE — TWO life domains share ONE A4 sheet. Each half carries
 * the three metric badges in a horizontal grid row, a justified narrative
 * (≤180 words, hard-clipped at 65mm) and a compact 2-row milestone table of
 * only the next upcoming windows; a hairline divider separates the halves.
 * Domains: Career, Wealth, Marriage, Health, Education, Family.
 */
const buildLifeDomainsPage = (
  domains: ReportData["domainInsights"],
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const currentYear = new Date().getFullYear();
  const sectionHtml = domains
    .map((domain) => {
      const title = L(DOMAIN_LABEL_KEYS[domain.domain] ?? "domainCareer", lang);
      const focusHouse = DOMAIN_HOUSES[domain.domain] ?? 1;
      const cuspSignIdx = getSignIndex(data.houseCusps?.[focusHouse - 1]?.sign || "");
      const lord = cuspSignIdx ? SIGN_LORDS[cuspSignIdx] || "—" : "—";
      const firstWindow = data.dashaPeriods?.[0]
        ? `${data.dashaPeriods[0].startYear}–${data.dashaPeriods[0].endYear}`
        : domain.timeframe || "—";
      const badges = [
        `${L("houseWord", lang)} ${focusHouse}`,
        `${L("lordWord", lang)}: ${localizePlanetName(lord, lang)}`,
        firstWindow,
      ];
      const narrativeParts = [domain.prediction, domain.analysis].filter(Boolean);
      const narrative = narrativeParts.length
        ? escapeHTML(clampWords(narrativeParts.join(" "), 180))
        : escapeHTML(getTranslation(lang, "pdf.template.detailedPremiumAnalysis", { domain: title.toLowerCase() }));
      // Milestone table — at most TWO rows, showing only the NEXT upcoming windows.
      const upcomingWindows = (data.dashaPeriods || [])
        .filter((d) => {
          const endYear = parseInt(String(d.endYear), 10);
          return Number.isNaN(endYear) || endYear >= currentYear;
        })
        .slice(0, 2);
      const milestoneRows = upcomingWindows.length
        ? upcomingWindows.map((d) => `<tr><td>${escapeHTML(d.startYear)}–${escapeHTML(d.endYear)}</td><td>${escapeHTML([localizePlanetName(d.mahaDasha, lang), d.subPeriod].filter(Boolean).join(" · ") || "-")}</td></tr>`).join("")
        : `<tr><td>—</td><td>${escapeHTML(L("notAvailable", lang))}</td></tr>`;
      return `<div class="domain-half">
<h2 class="domain-title ${lang === "en" ? "en" : ""}">${escapeHTML(title)}</h2>
<div class="domain-badges">${badges.map((b) => `<span class="tag paid">${escapeHTML(b)}</span>`).join("")}</div>
<p class="domain-narrative ${lang === "en" ? "en" : ""}">${narrative}</p>
<table class="mini-table">
<tr><th>${L("period", lang)}</th><th>${L("influence", lang)}</th></tr>
${milestoneRows}
</table>
</div>`;
    })
    .join(`<div class="domain-divider"></div>`);
  return `
${PAGE_CHROME(L("lifeDomains", lang), lang, pageNumber, data)}
<div class="dual-domain-grid">
${sectionHtml}
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};


// ─── Vimshottari + dosha derivation used by the new premium pages ─────────────
const VIMSHOTTARI_YEARS: [string, number][] = [
  ["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10],
  ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17],
];
const CANON: Record<string, string> = {
  sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", rahu: "Rahu",
  jupiter: "Jupiter", saturn: "Saturn", venus: "Venus", ketu: "Ketu",
  lagna: "Lagna", ascendant: "Lagna",
};
const canonPlanet = (name: string): string =>
  CANON[name.trim().toLowerCase()] || name.trim();
const findPlanet = (data: ReportData, name: string) =>
  (data.planetaryPositions || []).find((p) => canonPlanet(p.body) === canonPlanet(name));
const houseNum = (p?: { house?: string | number }): number => {
  const n = parseInt(String(p?.house ?? "0"), 10);
  return Number.isNaN(n) ? 0 : n;
};

/** Which dasha period (ReportData span) covers `year`, if any. */
const activeDasha = (data: ReportData, year: number) =>
  (data.dashaPeriods || []).find((d) => {
    const s = parseInt(String(d.startYear), 10);
    const e = parseInt(String(d.endYear), 10);
    return !Number.isNaN(s) && !Number.isNaN(e) && year >= s && year <= e;
  });

/** Canonical name of the currently running Maha Dasha ("" if unknown). */
const currentDashaName = (data: ReportData, year: number): string =>
  canonPlanet(activeDasha(data, year)?.mahaDasha || "");

/** Full Vimshottari cycle with year spans (uses exact periods when available). */
const vimshottariCycle = (data: ReportData, year: number) => {
  const exact = (data.dashaPeriods || []).map((d) => ({
    name: canonPlanet(d.mahaDasha),
    years: VIMSHOTTARI_YEARS.find(([n]) => n === canonPlanet(d.mahaDasha))?.[1] ?? 0,
    from: parseInt(String(d.startYear), 10),
    to: parseInt(String(d.endYear), 10),
  }));
  if (exact.length >= 9 && exact.every((e) => !Number.isNaN(e.from) && !Number.isNaN(e.to))) {
    return exact;
  }
  const base = parseInt(String(data.dashaPeriods?.[0]?.startYear), 10) || year;
  let acc = 0;
  return VIMSHOTTARI_YEARS.map(([name, yrs]) => {
    const from = base + acc;
    acc += yrs;
    return { name, years: yrs, from, to: from + yrs - 1 };
  });
};

const severityLabel = (count: number): PdfTemplateKey => {
  if (count >= 3) return "severityHigh";
  if (count === 2) return "severityMedium";
  if (count === 1) return "severityMild";
  return "severityNone";
};

// Returns "" when there is no yoga content to render.
const buildYogasDoshasPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const yogaItems = (data.yogas || [])
    .map((y) => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(y.name)}</span><p class="p ${lang === "en" ? "en" : ""}">${escapeHTML(y.description || "-")}</p></div>`)
    .join("");

  const mars = findPlanet(data, "Mars");
  const moon = findPlanet(data, "Moon");
  const sat = findPlanet(data, "Saturn");
  const manglikHouses = mars ? [1, 2, 4, 7, 8, 12].filter((h) => houseNum(mars) === h) : [];
  const mangLik = manglikHouses.length > 0;
  const manglikCard = mars
    ? `<div class="verdict-card"><span class="status-badge ${mangLik ? "status-warn" : "status-ok"}">${L("manglik", lang)}</span><span>${mangLik ? L("manglikYes", lang) : L("manglikNo", lang)}</span><span>· ${L("doshaSeverity", lang)}: ${L(severityLabel(manglikHouses.length), lang)}</span></div>`
    : `<div class="verdict-card"><span class="status-badge status-ok">${L("manglik", lang)}</span><span>Mars placement data unavailable — Manglik status cannot be determined.</span></div>`;
  const satiPhase = (() => {
    if (!moon || !sat) return -1;
    const m = houseNum(moon);
    const s = houseNum(sat);
    if (m === s) return 2;
    if (m === (s % 12) + 1) return 3;
    if (m === ((s + 10) % 12) + 1) return 1;
    return -1;
  })();
  const satiCard = moon && sat
    ? `<div class="verdict-card"><span class="status-badge ${satiPhase >= 0 ? "status-warn" : "status-ok"}">${L("sadeSati", lang)}</span><span>${satiPhase >= 0 ? L(`satiPhase${satiPhase}` as PdfTemplateKey, lang) : L("noSadeSati", lang)}</span></div>`
    : `<div class="verdict-card"><span class="status-badge status-ok">${L("sadeSati", lang)}</span><span>Sade Sati status requires Moon and Saturn positions.</span></div>`;

  const doshaHtml = `<div class="section-block"><h2 class="h2 ${lang === "en" ? "en" : ""}">${L("doshaSection", lang)}</h2>${manglikCard}${satiCard}</div>`;

  const yogaSection = yogaItems
    ? `<div class="section-block"><h2 class="h2 ${lang === "en" ? "en" : ""}">${L("yogas", lang)}</h2><div class="two-col">${yogaItems}</div></div>`
    : `<p class="note">No dominant yogas detected.</p>`;

  return `
${PAGE_CHROME(L("yogDoshTitle", lang), lang, pageNumber, data)}
${yogaSection}
${doshaHtml}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/** Canonical gemstone / rudraksha / mantra mapping per strengthening planet. */
const GEM_PRESCRIPT: Record<string, { gemKey: PdfTemplateKey; mukhi: number; dayKey: PdfTemplateKey; mantra: string; goalKey: PdfTemplateKey }> = {
  Sun: { gemKey: "gemRuby", mukhi: 1, dayKey: "daySunday", mantra: "Om Suryaya Namaha", goalKey: "goalConfidence" },
  Moon: { gemKey: "gemPearl", mukhi: 2, dayKey: "dayMonday", mantra: "Om Somaya Namaha", goalKey: "goalEmotional" },
  Mars: { gemKey: "gemRedCoral", mukhi: 3, dayKey: "dayTuesday", mantra: "Om Mangalaya Namaha", goalKey: "goalStrength" },
  Mercury: { gemKey: "gemEmerald", mukhi: 4, dayKey: "dayWednesday", mantra: "Om Budhaya Namaha", goalKey: "goalIntellect" },
  Jupiter: { gemKey: "gemYellowSapphire", mukhi: 5, dayKey: "dayThursday", mantra: "Om Guru Devaya Namaha", goalKey: "goalFortune" },
  Venus: { gemKey: "gemDiamond", mukhi: 6, dayKey: "dayFriday", mantra: "Om Shukraya Namaha", goalKey: "goalRelationships" },
  Saturn: { gemKey: "gemBlueSapphire", mukhi: 7, dayKey: "daySaturday", mantra: "Om Shanaischaraya Namaha", goalKey: "goalDiscipline" },
  Rahu: { gemKey: "gemHessonite", mukhi: 10, dayKey: "daySaturday", mantra: "Om Rahave Namaha", goalKey: "goalAmbition" },
  Ketu: { gemKey: "gemCatsEye", mukhi: 9, dayKey: "dayTuesday", mantra: "Om Ketave Namaha", goalKey: "goalSpiritual" },
};

const PRESCRIPT_ALIASES: Record<string, string[]> = {
  Sun: ["sun", "surya", "sury"],
  Moon: ["moon", "chandra", "chand"],
  Mars: ["mars", "mangal", "manglik"],
  Mercury: ["mercury", "budha", "budh"],
  Jupiter: ["jupiter", "guru", "brihaspati"],
  Venus: ["venus", "shukra"],
  Saturn: ["saturn", "shani"],
  Rahu: ["rahu"],
  Ketu: ["ketu"],
};

/** Find the canonical prescription entry whose planet alias appears in `text`. */
const findPrescript = (text: string): { planet: string; prescript: typeof GEM_PRESCRIPT[string] } | null => {
  const lower = text.toLowerCase();
  for (const [planet, aliases] of Object.entries(PRESCRIPT_ALIASES)) {
    if (aliases.some((a) => lower.includes(a))) {
      return { planet, prescript: GEM_PRESCRIPT[planet] };
    }
  }
  return null;
};

const prescriptLines = (prescript: typeof GEM_PRESCRIPT[string], lang: Language): string =>
  `<div class="prescript-line"><strong>${escapeHTML(L(prescript.gemKey, lang))}</strong> · ${escapeHTML(getTranslation(lang, "pdf.template.mukhi", { count: prescript.mukhi }))} · ${escapeHTML(L(prescript.dayKey, lang))}</div><div class="prescript-line">${escapeHTML(prescript.mantra)}</div><div class="prescript-line">${escapeHTML(L(prescript.goalKey, lang))}</div>`;

/**
 * PAGE — Gemstone / Rudraksha prescription. Renders rows only when the remedy
 * data actually describes gem or rudraksha material. When a remedy references
 * a strengthening planet, the canonical gem / mukhi / day / mantra / goal is
 * appended to the card. Returns "" when no gem-related remedy exists.
 */
const buildRemedyPrescriptPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const rows = (data.remedies || [])
    .filter((r) => /gem|rudraksh|ratna|रत्न|रुद्राक्ष|ruby|pearl|sapphire|gemstone/i.test(`${r.category} ${r.description}`))
    .slice(0, 6)
    .map((r) => {
      const match = findPrescript(`${r.category} ${r.description}`);
      return `<div class="prescript-card"><div class="prescript-k">${escapeHTML(r.category || L("gemRudhSection", lang))}</div>${r.description ? `<div class="prescript-v">${escapeHTML(r.description)}</div>` : ""}${match ? prescriptLines(match.prescript, lang) : ""}</div>`;
    })
    .join("");

  const prescriptRows = rows
    ? rows
    : `<div class="prescript-card"><div class="prescript-k">${escapeHTML(L("gemRudhSection", lang))}</div><div class="prescript-v">General Prescription</div><div class="prescript-line">Wear a yellow sapphire (Jupiter) on Thursday or a pearl (Moon) on Monday after consulting a jeweler. Chant 'Om Namah Shivaya' daily.</div></div>`;

  return `
${PAGE_CHROME(L("gemRudhSection", lang), lang, pageNumber, data)}
<div class="prescript-grid">${prescriptRows}</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE — Current Dasha deep dive: highlights the running Maha Dasha window and
 * the remaining Vimshottari cycle. Returns "" when no dasha data exists.
 */
const buildCurrentDashaPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const year = new Date().getFullYear();
  const cycle = vimshottariCycle(data, year);
  const current = currentDashaName(data, year);
  const focusCards = cycle
    .map((c) => {
      const on = c.name.toLowerCase() === current.toLowerCase();
      return `<div class="dasha-focus${on ? " active" : ""}"><div class="k">${escapeHTML(localizePlanetName(c.name, lang))}</div><div class="v">${c.from}–${c.to}</div>${on ? ` <span class="status-badge status-warn">${L("onDashaNow", lang)}</span>` : ""}</div>`;
    })
    .join("");
  const active = activeDasha(data, year);
  const sub = active?.subPeriod
    ? `<p class="p"><span class="section-title">${L("currAntardasha", lang)}:</span> ${escapeHTML(active.subPeriod)} · ${L("activeWindow", lang)}: ${active.startYear}–${active.endYear}</p>`
    : "";

  return `
${PAGE_CHROME(L("currDashaTitle", lang), lang, pageNumber, data)}
<div class="dasha-focus-row">${focusCards}</div>
${sub}
<p class="note">${escapeHTML(L("currentRemark", lang))}</p>
<div class="divider"></div>
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("dashaCycle", lang)}</h2>
<ul class="dasha-cycle">${cycle.map((c) => `<li${c.name.toLowerCase() === current.toLowerCase() ? " class=\"active\"" : ""}><span>${escapeHTML(localizePlanetName(c.name, lang))}</span><span>${c.from}–${c.to}</span></li>`).join("")}</ul>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE — Manglik / Sade Sati tracker: two side-by-side trackers with the active
 * phase highlighted and house-by-house Mars placement. Returns "" when neither
 * Mars nor Moon data exists.
 */
const buildManglikSadeTrackerPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const mars = findPlanet(data, "Mars");
  const moon = findPlanet(data, "Moon");
  const sat = findPlanet(data, "Saturn");

  const doshaHouses = [1, 2, 4, 7, 8, 12];
  const manglikHouse = mars && doshaHouses.includes(houseNum(mars)) ? houseNum(mars) : 0;
  const manglik = manglikHouse > 0;
  const manglikRows = mars
    ? doshaHouses
        .map((h) => {
          const placing = (data.planetaryPositions || []).filter((p) => houseNum(p) === h);
          const hasMars = placing.some((p) => canonPlanet(p.body) === canonPlanet("Mars"));
          const rowStyle = hasMars ? " style=\"background:#fef3c7\"" : "";
          return `<tr${rowStyle}><td>${h}</td><td>${placing.map((p) => escapeHTML(localizePlanetName(p.body, lang))).join(", ") || "—"}</td><td>${hasMars ? "●" : "—"}</td></tr>`;
        })
        .join("")
    : `<tr><td colspan="3">Mars data unavailable</td></tr>`;

  const satiPhaseIndex = ((): -1 | 0 | 1 | 2 => {
    if (!moon || !sat) return -1;
    const m = houseNum(moon);
    const s = houseNum(sat);
    if (m === s) return 1;              // Phase 2
    if (m === (s % 12) + 1) return 2;   // Phase 3 (2nd from Saturn)
    if (m === ((s + 10) % 12) + 1) return 0; // Phase 1 (12th from Saturn)
    return -1;
  })();
  const satiPhaseLabels: PdfTemplateKey[] = [
    "satiPhase1", "satiPhase2", "satiPhase3",
  ];
  const satiPhaseLabel = (idx: -1 | 0 | 1 | 2): PdfTemplateKey | undefined =>
    idx >= 0 ? satiPhaseLabels[idx] : undefined;
  const satiActiveLabel = satiPhaseLabel(satiPhaseIndex);
  const satiRows = (moon && sat)
    ? (satiPhaseIndex >= 0 && satiActiveLabel
        ? `<tr style="background:#eff6ff"><td>${escapeHTML(L(satiActiveLabel, lang))}</td><td>${L("activePhase", lang)}</td></tr>`
        : "")
    : `<tr><td colspan="2">Requires Moon and Saturn positions</td></tr>`;

  return `
${PAGE_CHROME(L("manglikSadeTitle", lang), lang, pageNumber, data)}
<p class="p">${escapeHTML(L("manglik", lang))}: <strong>${manglik ? `${L("manglikYes", lang)} (${L("houseWord", lang)} ${manglikHouse})` : L("manglikNo", lang)}</strong> · ${L("sadeSati", lang)}: ${satiActiveLabel ? L(satiActiveLabel, lang) : L("noSadeSati", lang)}</p>
<div class="tracker-grid">
  <div class="tracker-box">
    <div class="tracker-title">${L("manglikTracker", lang)}</div>
    <table class="tracker-table"><tr><th>${L("maleficKarm", lang)}</th><th>${L("planet", lang)}</th><th>●</th></tr>${manglikRows}</table>
  </div>
  <div class="tracker-box">
    <div class="tracker-title">${L("satiTracker", lang)}</div>
    <table class="tracker-table"><tr><th>${L("sadeSati", lang)}</th><th>${L("phaseStart", lang)}</th></tr>${satiRows}</table>
  </div>
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE — 120-Year Vimshottari Maha Dasha master table. Renders the full 9-period
 * cycle with year spans; returns "" when there is no dasha data at all.
 */
const buildDashaMasterPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const year = new Date().getFullYear();
  const cycle = vimshottariCycle(data, year);
  const current = currentDashaName(data, year);
  const rows = cycle
    .map((c, i) => {
      const on = c.name.toLowerCase() === current.toLowerCase();
      const rowStyle = on ? " style=\"background:#eff6ff\"" : "";
      return `<tr${rowStyle}><td>${i + 1}</td><td>${escapeHTML(localizePlanetName(c.name, lang))}</td><td>${c.years}</td><td>${c.from}</td><td>${c.to}</td>${on ? `<td>${L("onDashaNow", lang)}</td>` : ""}</tr>`;
    })
    .join("");
  return `
${PAGE_CHROME(L("dashaMasterTitle", lang), lang, pageNumber, data)}
<p class="note">${escapeHTML(L("vimshottari", lang))} · ${escapeHTML(L("dashaMasterTitle", lang))}</p>
<table class="table-0">
<tr><th>${L("seqNo", lang)}</th><th>${L("mahaDashaCol", lang)}</th><th>${L("mahaYears", lang)}</th><th>${L("fromYear", lang)}</th><th>${L("toYear", lang)}</th><th></th></tr>
${rows}
</table>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * FINAL SHEET — guarded appendix: Phal-Deepika references + scorecard + a
 * one-line closing note. Omitted entirely when neither dataset exists,
 * replacing the old boilerplate standalone Summary sheet.
 */
const buildAppendixSummaryPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const refs = data.kalpurushaPhalDeepikaRefs || [];
  const score = data.scorecard || [];
  const hasContent = refs.length > 0 || score.length > 0;
  if (!hasContent) {
    const generatedDate = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US");
    return `
${PAGE_CHROME(L("references", lang), lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${escapeHTML("Report Summary")}</h2>
<p>This report is based on Lahiri Ayanamsa Vedic calculations. For personalized guidance, consult a certified Jyotish practitioner.</p>
<p class="note">${escapeHTML(getTranslation(lang, "pdf.template.generatedOn", { date: generatedDate }))}</p>
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
  }
  const refItems = refs
    .map(ref => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(ref.verse)}</span><p class="p ${lang === "en" ? "en" : ""}">${escapeHTML(ref.interpretation)}</p></div>`)
    .join("");
  const scoreRows = score
    .map(s => `<tr><td>${escapeHTML(s.parameter)}</td><td><span class="score-text">${s.score}/${s.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100, Math.max(0, (s.score / s.maxScore) * 100))}%"></div></div></td></tr>`)
    .join("");
  return `
${PAGE_CHROME(L("references", lang), lang, pageNumber, data)}
${refItems ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("references", lang)}</h2>
${refItems}
</div>` : ""}
${scoreRows ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("scorecard", lang)}</h2>
<table class="table-0">
<tr><th>${L("parameter", lang)}</th><th>${L("score", lang)}</th><th></th></tr>
${scoreRows}
</table>
</div>` : ""}
<p class="note">${escapeHTML(getTranslation(lang, "pdf.template.generatedOn", { date: new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US") }))}</p>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

// ─── AI Life-Pillar appendix (pages 21+) ───────────────────────────────────
// Each narrative becomes its own localized A4 page appended after the
// deterministic Summary. With all six pillars present the report reaches the
// full "25-page" edition (20 base + up to 6 appendix pages).
const OUTCOME_TAG_COLOR: Record<string, string> = {
  positive: "#059669",
  neutral: "#6b7280",
  caution: "#d97706",
};

const buildNarrativePage = (
  n: ReportNarrative,
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const title = lang === "hi" ? n.titleHi || n.titleEn : n.titleEn || n.titleHi;
  const narrative = lang === "hi" ? n.narrativeHi || n.narrativeEn : n.narrativeEn || n.narrativeHi;
  const badges = n.badges || {};
  const badgeCells = [
    badges.score,
    badges.timeframe,
    badges.lord,
  ].filter(Boolean) as string[];
  const badgeHtml = badgeCells.length
    ? `<p class="p"><span class="tag paid">${badgeCells.map((b) => escapeHTML(b)).join('</span> <span class="tag paid">')}</span></p>`
    : "";
  const milestoneRows = (n.milestones || [])
    .map((m) => {
      const outcomeDot = m.outcome
        ? ` <span style="color:${OUTCOME_TAG_COLOR[m.outcome] || "#6b7280"};font-weight:700;">●</span>`
        : "";
      return `<tr><td>${escapeHTML(m.period)}</td><td>${escapeHTML(m.event)}${outcomeDot}</td><td>${escapeHTML(m.note || "-")}</td></tr>`;
    })
    .join("");
  const milestonesHtml = n.milestones?.length
    ? `
<div class="divider"></div>
<h2 class="${lang === "en" ? "en" : ""}">${escapeHTML(L("milestones", lang))}</h2>
<table class="table-0">
<tr><th>${L("period", lang)}</th><th>${L("event", lang)}</th><th>${L("note", lang)}</th></tr>
${milestoneRows}
</table>`
    : "";

  return `
${PAGE_CHROME(title, lang, pageNumber, data)}
<p class="note">${escapeHTML(L("appendix", lang))}</p>
<h1 class="${lang === 'en' ? 'en' : ''}">${escapeHTML(title)}</h1>
${badgeHtml}
<h2 class="${lang === 'en' ? 'en' : ''}">${L("domainInsights", lang)}</h2>
<p class="p${lang === "en" ? " en" : ""}" style="font-size:10pt;">${escapeHTML(narrative)}</p>
${milestonesHtml}
<p class="note">${escapeHTML(L("aiNote", lang))}</p>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

export function generateReportHtml(reportData: ReportData, language: Language): string {
  const lang = language;
  let pageNo = 0;
  const pages: string[] = [];
  // Only non-empty sheets enter the document — blank placeholder pages
  // (empty remedies / gochar-style fillers) can never leak into the PDF.
  const push = (html: string): void => {
    if (html && html.trim()) pages.push(html);
  };

  /* Sheet 1 — Nativity + Panchang + D1 diamond chart + planetary table.
     Absorbs the old standalone cover sheet. */
  push(buildNativityPanchangChartPage(reportData, lang, ++pageNo));
  /* Sheet 2 — House cusps + D9 Navamsa chart + Ashtakavarga grid. */
  push(buildHousesNavamsaAshtakavargaPage(reportData, lang, ++pageNo));
  /* Sheet 3 — Dashas + yogas + remedies (skipped when all three are empty). */
  const coreSheet = buildDashaYogasRemediesPage(reportData, lang, pageNo + 1);
  if (coreSheet) {
    pageNo += 1;
    pages.push(coreSheet);
  }
  // Dense dual-domain pages — Career+Wealth and Marriage+Health (plus
  // Education+Family when present) each share ONE A4 sheet instead of one
  // sparse page per domain. Only pairs carrying real predictions are emitted.
  const domainPairs: [string, string][] = [
    ["career", "wealth"],
    ["marriage", "health"],
    ["education", "family"],
  ];
  domainPairs.forEach(([keyA, keyB]) => {
    const domA = reportData.domainInsights.find((d) => d.domain === keyA);
    const domB = reportData.domainInsights.find((d) => d.domain === keyB);
    if (((domA?.prediction?.length ?? 0) > 20) || ((domB?.prediction?.length ?? 0) > 20)) {
      push(
        buildLifeDomainsPage(
          [domA, domB].filter((d): d is ReportData["domainInsights"][0] => Boolean(d)),
          reportData,
          lang,
          ++pageNo
        )
      );
    }
  });
  // ── New premium detail pages (only rendered when their data exists) ──
  push(buildYogasDoshasPage(reportData, lang, ++pageNo));
  push(buildRemedyPrescriptPage(reportData, lang, ++pageNo));
  push(buildCurrentDashaPage(reportData, lang, ++pageNo));
  push(buildManglikSadeTrackerPage(reportData, lang, ++pageNo));
  push(buildDashaMasterPage(reportData, lang, ++pageNo));
  // Guarded appendix — references + scorecard + closing summary on one sheet.
  const appendix = buildAppendixSummaryPage(reportData, lang, pageNo + 1);
  if (appendix) {
    pageNo += 1;
    pages.push(appendix);
  }
  // AI Life-Pillar appendix — one dense localized page per provided narrative.
  (reportData.narratives || []).forEach((n) =>
    pages.push(buildNarrativePage(n, reportData, lang, ++pageNo))
  );
  console.log(`[PDF Template] Total pages generated: ${pages.length}`);
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${L("title", lang)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
${CSS}
</style>
</head>
<body>
${pages.join("")}
</body>
</html>
`.trim();
}

export const PDF_HTML_TEMPLATE_VERSION = "2.1.0";
