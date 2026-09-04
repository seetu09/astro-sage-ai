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
  doshas: { name: string; description: string; severity: "low" | "moderate" | "high"; isNeutralized: boolean }[];
  domainInsights: { domain: "career" | "marriage" | "wealth" | "health" | "finance" | "education"; prediction: string; analysis: string; timeframe?: string }[];
  northIndianChartSvg: string;
  kalpurushaPhalDeepikaRefs: { verse: string; interpretation: string }[];
  scorecard: { parameter: string; score: number; maxScore: number }[];
  panchang?: {
    varaWeekday?: string;
    nakshatra?: string;
    nakshatraLord?: string;
    moonSign?: string;
    sunSign?: string;
    lagna?: string;
  };
  d9Chart?: {
    ascendantSign: number;
    planets: { planet: string; sign: number; house: number; retrograde: boolean }[];
  };
  sarvashtakavarga?: { bindus: number[]; beneficialHouses?: number[] };
  isPaidTier: boolean;
  narratives?: ReportNarrative[];
}

export interface ReportNarrative {
  key: string;
  titleEn: string;
  titleHi: string;
  badges?: { score?: string; timeframe?: string; lord?: string };
  narrativeEn: string;
  narrativeHi: string;
  milestones?: { period: string; event: string; note?: string; outcome?: "positive" | "neutral" | "caution" }[];
}

type PdfTemplateKey = keyof typeof translations.en.pdf.template;

const escapeHTML = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const L = (key: PdfTemplateKey, lang: Language): string => getTranslation(lang, `pdf.template.${String(key)}`);

const localizePlanetName = (name: string, lang: Language): string =>
  localizePlanet(canonicalPlanet(name), lang);

const localizeSignName = (sign: string | number, lang: Language): string => {
  const idx = getSignIndex(sign);
  return idx ? localizeRashi(idx, lang) : localizeSign(String(sign), lang);
};




const CSS = `
@page { margin: 0; padding: 0; size: A4; }
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { width: 210mm; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page-container { page-break-after: always; break-after: page; width: 210mm; height: auto; }
  .page-container:last-child { page-break-after: auto; break-after: auto; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; font-size: 10pt; line-height: 1.3; color: #1a1a1a; background: #fff; }
.page-container { width: 210mm; height: auto; padding: 8mm; margin: 0 auto; page-break-after: always; position: relative; background: #fff; }
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.1cm; border-bottom: 2pt solid #999; margin-bottom: 0.15cm; }
.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 13pt; font-weight: 700; }
.header h1.en { font-family: 'Inter', sans-serif; }
.header .meta { text-align: right; font-size: 7.5pt; color: #555; }
.header .meta span { display: block; }
.footer { position: absolute; bottom: 5mm; width: calc(100% - 16mm); text-align: center; font-size: 7pt; color: #777; border-top: 0.5pt solid #ddd; padding-top: 0.1cm; }
.h2 { font-size: 10pt; font-weight: 700; margin-bottom: 0.1cm; color: #333; }
.h1-pillar { font-size: 14pt; font-weight: 700; margin-bottom: 0.15cm; }
.p { font-size: 8.5pt; margin-bottom: 0.1cm; text-align: justify; }
.narrative-text { font-size: 8.5pt; text-align: justify; line-height: 1.45; margin-bottom: 0.15cm; }
.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.1cm; }
.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 2px 3px; text-align: left; font-size: 7.5pt; }
.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 0.1cm; }
.tile { border: 0.5pt solid #bbb; border-radius: 2px; padding: 1.5px 3px; }
.tile-k { font-size: 6pt; color: #666; text-transform: uppercase; }
.tile-v { font-size: 8pt; font-weight: 700; }
.section-block { margin-bottom: 0.15cm; }
.divider { border-top: 0.5pt dashed #bbb; margin: 0.1cm 0; }
.note { font-size: 7pt; font-style: italic; color: #666; }
.badge-row { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 0.1cm; }
.tag { display: inline-block; padding: 1pt 5px; border-radius: 2px; font-size: 7pt; font-weight: 700; }
.tag.paid { background: #fbbf24; color: #78350f; }
.tag.basic { background: #9ca3af; color: #374151; }
.pillar-badge { display: inline-block; background: #eff6ff; border: 0.5pt solid #2563eb; color: #1d4ed8; padding: 1px 6px; border-radius: 2px; font-size: 7pt; font-weight: 700; margin-right: 3px; }
.milestones-table { width: 100%; border-collapse: collapse; margin-top: 0.1cm; }
.milestones-table th, .milestones-table td { border: 0.4pt solid #ccc; padding: 1.5px 3px; font-size: 7pt; }
.milestones-table th { background: #f0f0f0; }
.chart-container { margin: 0.1cm 0; text-align: center; }
.chart-sm svg { max-width: 50mm; max-height: 50mm; }
.grid-2 { display: flex; gap: 4mm; align-items: flex-start; }
.av-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; max-width: 140mm; margin: 0 auto 0.1cm; }
.av-cell { border: 0.5pt solid #bbb; border-radius: 2px; text-align: center; padding: 1.5px 0; }
.av-cell.av-strong { background: #ecfdf5; border-color: #059669; }
.av-h { display: block; font-size: 6pt; color: #666; }
.av-b { display: block; font-size: 9pt; font-weight: 700; }
.verdict-card { border: 0.5pt solid #cbd5e1; border-left: 2pt solid #3b82f6; border-radius: 2px; padding: 1.5mm 2mm; margin-bottom: 0.1cm; }
.status-badge { font-size: 7pt; font-weight: 700; padding: 0.5pt 4px; border-radius: 2px; }
.status-ok { background: #dcfce7; color: #166534; }
.status-warn { background: #fef3c7; color: #92400e; }
.dosha-block { margin-bottom: 0.15cm; padding: 2mm; border: 0.5pt solid #e5e7eb; border-radius: 2px; }
.dosha-name { font-size: 9pt; font-weight: 700; margin-bottom: 0.08cm; }
.dosha-desc { font-size: 8pt; text-align: justify; line-height: 1.4; }
.yoga-block { margin-bottom: 0.12cm; padding: 1.5mm; border-left: 2pt solid #8b5cf6; background: #faf5ff; }
.yoga-name { font-size: 9pt; font-weight: 700; margin-bottom: 0.05cm; }
.yoga-desc { font-size: 8pt; text-align: justify; line-height: 1.4; }
.remedy-card { border: 0.5pt solid #bbb; border-radius: 2px; padding: 2mm; margin-bottom: 0.1cm; }
.remedy-k { font-size: 7pt; color: #666; text-transform: uppercase; }
.remedy-v { font-size: 8.5pt; font-weight: 700; }
.score-fill { height: 100%; background: #3b82f6; }
.score-text { font-size: 8pt; font-weight: 700; }
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

const tile = (key: PdfTemplateKey, lang: Language, value?: string): string =>
  value
    ? `<div class="tile"><div class="tile-k">${escapeHTML(L(key, lang))}</div><div class="tile-v">${escapeHTML(value)}</div></div>`
    : "";


const buildChartInput = (
  data: ReportData
): { planets: ChartPlanetInput[]; houses: ChartHouseInput[]; ascendantSign: number } => {
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
 * PAGE 3 — Vimshottari Dasha with antardashas. Shows the full dasha sequence
 * with all antardasha sub-periods expanded for each mahadasha.
 */
const buildDashaDetailPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const dashaRows = (data.dashaPeriods || [])
    .map((d) => {
      const sub = d.subPeriod ? `<td>${escapeHTML(d.subPeriod)}</td>` : `<td>-</td>`;
      return `<tr><td>${escapeHTML(localizePlanetName(d.mahaDasha, lang))}</td><td>${escapeHTML(d.startYear)}</td><td>${escapeHTML(d.endYear)}</td>${sub}</tr>`;
    })
    .join("");

  return `
${PAGE_CHROME(L("dashaCycle", lang), lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2">${L("dashaCycle", lang)}</h2>
<table class="table-0">
<tr><th>${L("mahaDashaCol", lang)}</th><th>${L("fromYear", lang)}</th><th>${L("toYear", lang)}</th><th>${L("antardasha", lang)}</th></tr>
${dashaRows}
</table>
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};



/**
 * PAGE 4 — Doshas section with detailed descriptions and remedies from the
 * calculations.doshas data (Manglik, Sade Sati, Kaal Sarp, etc.).
 */
const buildDoshasPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const doshaBlocks = (data.doshas || [])
    .map((d) => {
      const severityClass = d.severity === "high" ? "status-warn" : "status-ok";
      const neutralized = d.isNeutralized ? ` <span class="status-badge status-ok">${lang === "hi" ? "शांत" : "Neutralized"}</span>` : "";
      return `<div class="dosha-block">
<div class="dosha-name">${escapeHTML(d.name)}${neutralized} <span class="status-badge ${severityClass}">${escapeHTML(d.severity)}</span></div>
<div class="dosha-desc">${escapeHTML(d.description || "-")}</div>
</div>`;
    })
    .join("");

  const content = doshaBlocks || `<p class="note">${lang === "hi" ? "कोई दोष नहीं पाया गया।" : "No significant doshas detected."}</p>`;

  return `
${PAGE_CHROME(lang === "hi" ? "दोष विश्लेषण" : "Dosha Analysis", lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2">${lang === "hi" ? "दोष विश्लेषण" : "Dosha Analysis"}</h2>
${content}
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};



/**
 * PAGE 5 — Yogas section with detailed descriptions from calculations.yogas data.
 */
const buildYogasPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const yogaBlocks = (data.yogas || [])
    .map((y) => `<div class="yoga-block">
<div class="yoga-name">${escapeHTML(y.name)}</div>
<div class="yoga-desc">${escapeHTML(y.description || "-")}</div>
</div>`)
    .join("");

  const content = yogaBlocks || `<p class="note">${lang === "hi" ? "कोई योग नहीं पाया गया।" : "No significant yogas detected."}</p>`;

  return `
${PAGE_CHROME(lang === "hi" ? "योग विश्लेषण" : "Yoga Analysis", lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2">${lang === "hi" ? "योग विश्लेषण" : "Yoga Analysis"}</h2>
${content}
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};



/**
 * PAGE — Remedies & gemstone recommendations from the remedies data.
 */
const buildRemediesPage = (
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const remedyCards = (data.remedies || [])
    .slice(0, 8)
    .map((r) => `<div class="remedy-card">
<div class="remedy-k">${escapeHTML(r.category || (lang === "hi" ? "उपाय" : "Remedy"))}</div>
<div class="remedy-v">${escapeHTML(r.description || "-")}</div>
</div>`)
    .join("");

  const content = remedyCards || `<p class="note">${lang === "hi" ? "कोई विशेष उपाय नहीं।" : "No specific remedies recommended."}</p>`;

  return `
${PAGE_CHROME(lang === "hi" ? "उपाय एवं रत्न" : "Remedies & Gemstones", lang, pageNumber, data)}
<div class="section-block">
<h2 class="h2">${lang === "hi" ? "उपाय एवं रत्न सुझाव" : "Remedies & Gemstone Recommendations"}</h2>
${content}
</div>
${PAGE_FOOTER(pageNumber, lang)}
`;
};



/**
 * PAGE — One page per life pillar (career, wealth, marriage, health, education, family).
 * Shows: Title, Badge (score/timeframe/lord), Narrative (3-5 sentences), Milestones table.
 */
const buildNarrativePage = (
  n: ReportNarrative,
  data: ReportData,
  lang: Language,
  pageNumber: number
): string => {
  const title = lang === "hi" ? n.titleHi || n.titleEn : n.titleEn || n.titleHi;
  const narrative = lang === "hi" ? n.narrativeHi || n.narrativeEn : n.narrativeEn || n.narrativeHi;
  const badges = n.badges || {};
  const badgeCells = [badges.score, badges.timeframe, badges.lord].filter(Boolean) as string[];
  const badgeHtml = badgeCells.length
    ? `<div class="badge-row">${badgeCells.map((b) => `<span class="pillar-badge">${escapeHTML(b)}</span>`).join("")}</div>`
    : "";

  const milestoneRows = (n.milestones || [])
    .map((m) => {
      const outcomeDot = m.outcome
        ? ` <span style="color:${m.outcome === "positive" ? "#059669" : m.outcome === "caution" ? "#d97706" : "#6b7280"};font-weight:700;">●</span>`
        : "";
      return `<tr><td>${escapeHTML(m.period)}</td><td>${escapeHTML(m.event)}${outcomeDot}</td><td>${escapeHTML(m.note || "-")}</td></tr>`;
    })
    .join("");

  const milestonesHtml = n.milestones?.length
    ? `<div class="divider"></div>
<h2 class="h2">${lang === "hi" ? "मुख्य मोड़" : "Key Milestones"}</h2>
<table class="milestones-table">
<tr><th>${lang === "hi" ? "अवधि" : "Period"}</th><th>${lang === "hi" ? "घटना" : "Event"}</th><th>${lang === "hi" ? "टिप्पणी" : "Note"}</th></tr>
${milestoneRows}
</table>`
    : "";

  const footerNote = lang === "hi"
    ? "यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।"
    : "This chapter is AI-assisted Vedic astrology guidance.";

  return `
${PAGE_CHROME(title, lang, pageNumber, data)}
<h1 class="h1-pillar">${escapeHTML(title)}</h1>
${badgeHtml}
<div class="narrative-text">${escapeHTML(narrative)}</div>
${milestonesHtml}
<p class="note" style="margin-top:0.2cm;">${escapeHTML(footerNote)}</p>
${PAGE_FOOTER(pageNumber, lang)}
`;
};



export function generateReportHtml(reportData: ReportData, language: Language): string {
  const lang = language;
  let pageNo = 0;
  const pages: string[] = [];
  const push = (html: string): void => {
    if (html && html.trim()) pages.push(html);
  };

  /* Page 1 — Title page with user name and birth details + Panchang + D1 chart */
  push(buildNativityPanchangChartPage(reportData, lang, ++pageNo));

  /* Page 2 — Planet positions table + Navamsa + Ashtakavarga */
  push(buildHousesNavamsaAshtakavargaPage(reportData, lang, ++pageNo));

  /* Page 3 — Dasha table with antardashas */
  push(buildDashaDetailPage(reportData, lang, ++pageNo));

  /* Page 4 — Doshas section (detailed descriptions + remedies) */
  push(buildDoshasPage(reportData, lang, ++pageNo));

  /* Page 5 — Yogas section (detailed descriptions) */
  push(buildYogasPage(reportData, lang, ++pageNo));

  /* Pages 6+ — One page per life pillar (career, wealth, marriage, health, education, family) */
  (reportData.narratives || []).forEach((n) => {
    push(buildNarrativePage(n, reportData, lang, ++pageNo));
  });

  /* Remedies & gemstone recommendations */
  push(buildRemediesPage(reportData, lang, ++pageNo));

  console.log(`[PDF Template] Total pages generated: ${pages.length}`);

  return `<!DOCTYPE html>
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

export const PDF_HTML_TEMPLATE_VERSION = "4.0.0";
export const MIN_PROMISED_PAGES = 14;
