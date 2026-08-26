import {
  renderKundliChartSvg,
  ChartPlanetInput,
  ChartHouseInput,
} from "@/lib/kundliChart";
import { getSignIndex, SIGN_LORDS } from "@/lib/astrologyDictionary";

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

const LABEL = {
  hi: {
    title: "जन्म कुंडली विशद़ विश्लेषण",
    clientName: "क्लाइंट नाम",
    chartType: "चार्ट प्रकार",
    birthDetails: "जन्म विवरण",
    planetaryPositions: "ग्रह स्थिति",
    houseCusps: "घर कस्स",
    dashaPeriods: "दशा अवधि",
    yogas: "योग",
    remedies: "उपाय",
    domainInsights: "डोमेन अंतर्दृष्टि",
    scorecard: "स्कोरकार्ड",
    page: "पृष्ठ",
    northIndian: "उत्तर भारतीय",
    southIndian: "दक्षिण भारतीय",
    paid: "प्रीमियम रिपोर्ट",
    basic: "मूलभूत रिपोर्ट",
  },
  en: {
    title: "Birth Chart Detailed Analysis",
    clientName: "Client Name",
    chartType: "Chart Type",
    birthDetails: "Birth Details",
    planetaryPositions: "Planetary Positions",
    houseCusps: "House Cusps",
    dashaPeriods: "Dasha Periods",
    yogas: "Yogas",
    remedies: "Remedies",
    domainInsights: "Domain Insights",
    scorecard: "Scorecard",
    page: "Page",
    northIndian: "North Indian",
    southIndian: "South Indian",
    paid: "Premium Report",
    basic: "Basic Report",
  },
};

const escapeHTML = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const L = (key: keyof typeof LABEL.hi, lang: "hi" | "en"): string => LABEL[lang][key];

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
    min-height: 296mm; /* 297mm minus a hair avoids blank overflow sheets in Chrome */
    max-height: 297mm;
    overflow: hidden;
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
  min-height: 297mm;
  padding: 12mm;
  margin: 0 auto;
  page-break-after: always;
  position: relative;
  background: #fff;
}
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
/* Keep each logical section intact on one physical sheet where possible. */
.section-block { break-inside: avoid; page-break-inside: avoid; }
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
`;

const PAGE_CHROME = (title: string, lang: "hi" | "en", pageNumber: number, data: Pick<ReportData, "clientName" | "isPaidTier">): string => `<div class="page-container">
<div class="header">
  <h1 class="${lang === 'en' ? 'en' : ''}">${escapeHTML(title)}</h1>
  <div class="meta">
    <span><span class="section-title">${L("clientName", lang)}:</span> ${escapeHTML(data.clientName)}</span>
    <span class="tag ${data.isPaidTier ? "paid" : "basic"}">${data.isPaidTier ? L("paid", lang) : L("basic", lang)}</span>
  </div>
</div>
<div class="page-content">
`;

const PAGE_FOOTER = (pageNumber: number, lang: "hi" | "en"): string => `
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
const renderChartSvg = (data: ReportData, lang: "hi" | "en", style: "north" | "south"): string => {
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
const tile = (
  labelEn: string,
  labelHi: string,
  lang: "hi" | "en",
  value?: string
): string =>
  value
    ? `<div class="tile"><div class="tile-k">${escapeHTML(
        lang === "hi" ? labelHi : labelEn
      )}</div><div class="tile-v">${escapeHTML(value)}</div></div>`
    : "";

/**
 * PAGE 1 — Nativity details + Panchang strip + D1 diamond chart + core
 * planetary table. Absorbs the old near-empty cover, birth-details and
 * planetary-positions sheets into one standard A4 sheet.
 */
const buildNativityPanchangChartPage = (
  data: ReportData,
  lang: "hi" | "en",
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
      )}</td><th>TZ</th><td>${escapeHTML(bd.timezone)}</td></tr>
<tr><th>Lat / Long</th><td colspan="3">${escapeHTML(bd.latitude)}${
        bd.longitude ? `, ${escapeHTML(bd.longitude)}` : ""
      }</td></tr>
</table>`
    : "";
  const panchangGrid = pc
    ? `<div class="tile-grid">${[
        tile("Vara (Weekday)", "वार", lang, pc.varaWeekday),
        tile("Nakshatra", "नक्षत्र", lang, pc.nakshatra),
        tile("Nakshatra Lord", "नक्षत्र स्वामी", lang, pc.nakshatraLord),
        tile("Moon Sign", "चंद्र राशि", lang, pc.moonSign),
        tile("Sun Sign", "सूर्य राशि", lang, pc.sunSign),
        tile("Lagna", "लग्न", lang, pc.lagna),
      ].join("")}</div>`
    : "";
  return `
${PAGE_CHROME(L("title", lang), lang, pageNumber, data)}
<div class="cover-band"><span class="client-name">${escapeHTML(
    data.clientName
  )}</span><span class="tag ${data.isPaidTier ? "paid" : "basic"}">${
    data.isPaidTier ? L("paid", lang) : L("basic", lang)
  }</span></div>
${nativityTable}
${panchangGrid ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${lang === "hi" ? "जन्म पंचांग" : "Panchang at Birth"}</h2>
${panchangGrid}
</div>` : ""}
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${lang === "hi" ? "लग्न कुंडली (D1)" : "Lagna (D1) Chart"}</h2>
<div class="chart-container chart-sm">${renderChartSvg(data, lang, "north")}</div>
</div>
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("planetaryPositions", lang)}</h2>
<table class="table-0">
<tr><th>ग्रह/Body</th><th>राशि/Sign</th><th>डिग्री/Degree</th><th>घर/House</th><th>रीत्रो/Retro</th></tr>
${data.planetaryPositions.map(p => `<tr><td>${escapeHTML(p.body)}</td><td>${escapeHTML(p.sign)}</td><td>${escapeHTML(p.degree)}</td><td>${escapeHTML(p.house)}</td><td>${p.retro ? "✓" : "-"}</td></tr>`).join("")}
</table>
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE 2 — House-cusps table + Navamsa (D9) diamond chart side by side,
 * followed by the Sarvashtakavarga bindu grid when calculation data exists.
 */
const buildHousesNavamsaAshtakavargaPage = (
  data: ReportData,
  lang: "hi" | "en",
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
        }"><span class="av-h">H${i + 1}</span><span class="av-b">${Number(b) || 0}</span></div>`)
        .join("")
    : "";
  const houseRows = data.houseCusps
    .map(h => `<tr><td>${escapeHTML(String(h.house))}</td><td>${escapeHTML(h.sign)}</td><td>${escapeHTML(h.degree || "-")}</td></tr>`)
    .join("");
  // Split the 12 cusps into two side-by-side tables so the block stays compact.
  const half = Math.ceil(data.houseCusps.length / 2) || 6;
  const houseCols = data.houseCusps.length
    ? `<div class="grid-2">
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${houseRows.slice(0, half)}</table>
<table class="table-0"><tr><th>H</th><th>राशि/Sign</th><th>Deg</th></tr>${houseRows.slice(half)}</table>
</div>`
    : `<p class="note">${lang === "hi" ? "भाव डेटा उपलब्ध नहीं।" : "House data unavailable."}</p>`;
  return `
${PAGE_CHROME(lang === "hi" ? "भाव, नवांश एवं अष्टकवर्ग" : "Houses, Navamsa & Ashtakavarga", lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("houseCusps", lang)}</h2>
${houseCols}
</div>
<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${lang === "hi" ? "नवांश (D9) चार्ट" : "Navamsa (D9) Chart"}</h2>
${d9Svg ? `<div class="chart-container chart-sm">${d9Svg}</div>` : `<p class="note">${lang === "hi" ? "नवांश डेटा उपलब्ध नहीं।" : "Navamsa data unavailable."}</p>`}
</div>
${sav ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${lang === "hi" ? "सर्वाष्टकवर्ग बिंदु" : "Sarvashtakavarga Bindus"}</h2>
<div class="av-grid">${avCells}</div>
${sav.beneficialHouses?.length ? `<p class="note">${lang === "hi" ? "प्रबल भाव: " : "Strong houses: "}${sav.beneficialHouses.join(", ")}</p>` : ""}
</div>` : ""}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/**
 * PAGE 3 — Vimshottari dasha table + yogas + remedies packed together.
 * Returns "" when none of the three carry data so no placeholder/blank
 * "उपाय" sheet can ever leak into the PDF.
 */
const buildDashaYogasRemediesPage = (
  data: ReportData,
  lang: "hi" | "en",
  pageNumber: number
): string => {
  const dashaRows = (data.dashaPeriods || [])
    .map(d => `<tr><td>${escapeHTML(d.mahaDasha)}</td><td>${escapeHTML(d.startYear)}</td><td>${escapeHTML(d.endYear)}</td><td>${escapeHTML(d.subPeriod || "-")}</td></tr>`)
    .join("");
  const yogaItems = (data.yogas || [])
    .map(y => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(y.name)}</span> — <span class="p en">${escapeHTML(y.description)}</span></div>`)
    .join("");
  const remedyItems = (data.remedies || [])
    .map(r => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(r.category)}</span><p class="p en">${escapeHTML(r.description)}</p></div>`)
    .join("");
  if (!dashaRows && !yogaItems && !remedyItems) return "";
  return `
${PAGE_CHROME(lang === "hi" ? "दशा, योग एवं उपाय" : "Dashas, Yogas & Remedies", lang, pageNumber, data)}
${dashaRows ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("dashaPeriods", lang)}</h2>
<table class="table-0">
<tr><th>महादशा/Maha Dasha</th><th>Start</th><th>End</th><th>Sub Period</th></tr>
${dashaRows}
</table>
</div>` : ""}
${yogaItems ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("yogas", lang)}</h2>
${yogaItems}
</div>` : ""}
${remedyItems ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("remedies", lang)}</h2>
<div class="two-col">${remedyItems}</div>
</div>` : ""}
${PAGE_FOOTER(pageNumber, lang)}
`;
};

/** Domain → primary bhava used for the header metric badges. */
const DOMAIN_HOUSES: Record<string, number> = {
  career: 10, marriage: 7, wealth: 2, health: 6, finance: 11, education: 4,
};

/**
 * Domain page — Career / Marriage / Wealth / Health … Each keeps its THREE
 * header metric badges (focus bhava, cusp-sign lord, running window), the
 * merged prediction+analysis narrative and the milestone-window table on ONE
 * dense sheet.
 */
const buildDomainPage = (
  domain: ReportData["domainInsights"][0],
  data: ReportData,
  lang: "hi" | "en",
  pageNumber: number
): string => {
  const title = domain.domain.charAt(0).toUpperCase() + domain.domain.slice(1);
  const focusHouse = DOMAIN_HOUSES[domain.domain] ?? 1;
  const cuspSignIdx = getSignIndex(data.houseCusps?.[focusHouse - 1]?.sign || "");
  const lord = cuspSignIdx ? SIGN_LORDS[cuspSignIdx] || "—" : "—";
  const firstWindow = data.dashaPeriods?.[0]
    ? `${data.dashaPeriods[0].startYear}–${data.dashaPeriods[0].endYear}`
    : domain.timeframe || "—";
  const badges = [
    `${lang === "hi" ? "भाव" : "House"} ${focusHouse}`,
    `${lang === "hi" ? "स्वामी" : "Lord"}: ${lord}`,
    firstWindow,
  ];
  const narrativeParts = [domain.prediction, domain.analysis].filter(Boolean);
  return `
${PAGE_CHROME(title, lang, pageNumber, data)}
<h1 style="font-size:14pt;font-weight:700;margin-bottom:0.25cm;" class="${lang === "en" ? "en" : ""}">${escapeHTML(title)}</h1>
<div class="badge-row">${badges.map(b => `<span class="tag paid">${escapeHTML(b)}</span>`).join("")}</div>
${narrativeParts.length
    ? `<p class="p ${lang === "en" ? "en" : ""}" style="font-size:9.5pt;">${narrativeParts.map(n => escapeHTML(n)).join(" ")}</p>`
    : `<p class="p en">${lang === "hi" ? "विस्तृत विश्लेषण प्रीमियम रिपोर्ट में शामिल है।" : `Detailed ${escapeHTML(domain.domain)} analysis is included in the premium report.`}</p>`}
<div class="divider"></div>
<h2 class="h2 ${lang === "en" ? "en" : ""}">${lang === "hi" ? "मुख्य समय-अवधियाँ" : "Key Milestone Windows"}</h2>
<table class="table-0">
<tr><th>${lang === "hi" ? "अवधि" : "Period"}</th><th>${lang === "hi" ? "प्रभाव" : "Influence"}</th></tr>
${data.dashaPeriods.slice(0, 4).map((d) => `<tr><td>${escapeHTML(d.startYear)}–${escapeHTML(d.endYear)}</td><td>${escapeHTML([d.mahaDasha, d.subPeriod].filter(Boolean).join(" · ") || "-")}</td></tr>`).join("") || `<tr><td>—</td><td>${lang === "hi" ? "उपलब्ध नहीं" : "Not available"}</td></tr>`}
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
  lang: "hi" | "en",
  pageNumber: number
): string => {
  const refs = data.kalpurushaPhalDeepikaRefs || [];
  const score = data.scorecard || [];
  if (!refs.length && !score.length) return "";
  return `
${PAGE_CHROME(lang === "hi" ? "संदर्भ एवं सारांश" : "References & Summary", lang, pageNumber, data)}
${refs.length ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">कल्पुरुश पुस्तक / Sources</h2>
${refs.map(ref => `<div style="margin-bottom:0.18cm;"><span class="section-title">${escapeHTML(ref.verse)}</span><p class="p en">${escapeHTML(ref.interpretation)}</p></div>`).join("")}
</div>` : ""}
${score.length ? `<div class="section-block">
<h2 class="h2 ${lang === "en" ? "en" : ""}">${L("scorecard", lang)}</h2>
<table class="table-0">
<tr><th>Parameter</th><th>Score</th><th></th></tr>
${score.map(s => `<tr><td>${escapeHTML(s.parameter)}</td><td><span class="score-text">${s.score}/${s.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${Math.min(100, Math.max(0, (s.score / s.maxScore) * 100))}%"></div></div></td></tr>`).join("")}
</table>
</div>` : ""}
<p class="note">${lang === "hi"
    ? `${escapeHTML(data.clientName)} के लिए ${new Date().toLocaleDateString("hi-IN")} को जनरेट किया गया।`
    : `Generated for ${escapeHTML(data.clientName)} on ${new Date().toLocaleDateString("en-US")}.`}</p>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

// ─── AI Life-Pillar appendix (pages 21+) ───────────────────────────────────
// Each narrative becomes its own localized A4 page appended after the
// deterministic Summary. With all six pillars present the report reaches the
// full "25-page" edition (20 base + up to 6 appendix pages).
const NARRATIVE_LABEL = {
  hi: {
    appendix: "परिशिष्ट — जीवन स्तंभ",
    milestones: "प्रमुख मील के पत्थर",
    aiNote: "यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।",
  },
  en: {
    appendix: "Appendix — Life Pillars",
    milestones: "Key Milestones",
    aiNote: "This chapter is based on AI-assisted Vedic astrology guidance.",
  },
} as const;

const OUTCOME_TAG_COLOR: Record<string, string> = {
  positive: "#059669",
  neutral: "#6b7280",
  caution: "#d97706",
};

const buildNarrativePage = (
  n: ReportNarrative,
  data: ReportData,
  lang: "hi" | "en",
  pageNumber: number
): string => {
  const title = lang === "hi" ? n.titleHi || n.titleEn : n.titleEn || n.titleHi;
  const narrative = lang === "hi" ? n.narrativeHi || n.narrativeEn : n.narrativeEn || n.narrativeHi;
  const label = NARRATIVE_LABEL[lang];
  const badges = n.badges || {};
  const badgeCells = [
    badges.score,
    badges.timeframe,
    badges.lord,
  ].filter(Boolean) as string[];

  return `
${PAGE_CHROME(title, lang, pageNumber, data)}
<p class="note">${escapeHTML(label.appendix)}</p>
<h1 class="${lang === 'en' ? 'en' : ''}">${escapeHTML(title)}</h1>
${badgeCells.length ? `<p class="p"><span class="tag paid">${badgeCells.map(b => escapeHTML(b)).join("</span> <span class=\"tag paid\">")}</span></p>` : ""}
<h2 class="${lang === 'en' ? 'en' : ''}">${L("domainInsights", lang)}</h2>
<p class="p${lang === "en" ? " en" : ""}" style="font-size:10pt;">${escapeHTML(narrative)}</p>
${(n.milestones && n.milestones.length) ? `
<div class="divider"></div>
<h2 class="${lang === 'en' ? 'en' : ''}">${escapeHTML(label.milestones)}</h2>
<table class="table-0">
<tr><th>${lang === "hi" ? "अवधि" : "Period"}</th><th>${lang === "hi" ? "घटना" : "Event"}</th><th>${lang === "hi" ? "टिप्पणी" : "Note"}</th></tr>
${n.milestones.map(m => `<tr><td>${escapeHTML(m.period)}</td><td>${escapeHTML(m.event)}${m.outcome ? ` <span style="color:${OUTCOME_TAG_COLOR[m.outcome] || "#6b7280"};font-weight:700;">●</span>` : ""}</td><td>${escapeHTML(m.note || "-")}</td></tr>`).join("")}
</table>` : ""}
<p class="note">${escapeHTML(label.aiNote)}</p>
${PAGE_FOOTER(pageNumber, lang)}
`;
};

export function generateReportHtml(reportData: ReportData, lang: "hi" | "en"): string {
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
  // Dense domain pages — only emit the ones carrying actual insights so no
  // placeholder/blank pages leak into the PDF.
  reportData.domainInsights
    .filter((d) => d.prediction || d.analysis)
    .forEach((d) => push(buildDomainPage(d, reportData, lang, ++pageNo)));
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

export const PDF_HTML_TEMPLATE_VERSION = "2.0.0";