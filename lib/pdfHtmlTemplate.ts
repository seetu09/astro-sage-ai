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
  isPaidTier: boolean;
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
  @page { size: A4 portrait; margin: 8mm; }
  .page-container { page-break-after: always; height: 100vh; }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; background: #fff; }
html, body { overflow: hidden; }
@page :first { margin: 0; }
.page-container { width: 21cm; min-height: 29.7cm; height: 29.7cm; padding: 1.5cm 1.2cm; margin: 0 auto; page-break-after: always; position: relative; }
.page-container:last-child { page-break-after: auto; }
.page-content { width: 100%; }
.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.3cm; border-bottom: 3pt solid #999; margin-bottom: 0.4cm; }
.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 16pt; font-weight: 700; }
.header h1.en { font-family: 'Inter', sans-serif; }
.header .meta { text-align: right; font-size: 9pt; color: #555; }
.header .meta span { display: block; }
.footer { position: absolute; bottom: 1.2cm; width: calc(100% - 2.4cm); text-align: center; font-size: 8pt; color: #777; border-top: 1pt solid #ddd; padding-top: 0.3cm; }
.footer .page-number { display: inline-block; }
.h1 { font-size: 14pt; font-weight: 700; margin-bottom: 0.4cm; padding-bottom: 0.2cm; border-bottom: 1pt solid #ccc; }
.h1.en { font-family: 'Inter', sans-serif; }
.h2 { font-size: 11pt; font-weight: 700; margin-bottom: 0.3cm; color: #333; }
.h2.en { font-family: 'Inter', sans-serif; }
.p { font-size: 9.5pt; margin-bottom: 0.25cm; text-align: justify; }
.p.en { font-family: 'Inter', sans-serif; }
.two-col { column-count: 2; column-gap: 0.5cm; }
.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.3cm; }
.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 3px 5px; text-align: left; font-size: 8.5pt; }
.table-0 th { background: #f0f0f0; }
.chart-container { text-align: center; margin: 0.3cm 0; }
.chart-container svg { max-width: 100%; height: auto; }
.logo-placeholder { text-align: center; font-size: 8pt; color: #999; margin-bottom: 0.3cm; }
.section-title { font-size: 10pt; font-weight: 700; margin: 0.2cm 0 0.1cm; display: inline-block; }
.score-bar { height: 6pt; background: #eee; border-radius: 2px; overflow: hidden; display: inline-block; width: 60%; vertical-align: middle; margin-left: 5px; }
.score-fill { height: 100%; background: #3b82f6; }
.score-text { font-size: 8.5pt; font-weight: 700; }
.tag { display: inline-block; padding: 1pt 6px; border-radius: 3px; font-size: 8pt; font-weight: 700; }
.tag.paid { background: #fbbf24; color: #78350f; }
.tag.basic { background: #9ca3af; color: #374151; }
.divider { border-top: 1pt dashed #bbb; margin: 0.2cm 0; }
.note { font-size: 8pt; font-style: italic; color: #666; }
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

const renderChartSvg = (data: ReportData): string => {
  if (/^<svg/.test(data.northIndianChartSvg || "")) {
    return data.northIndianChartSvg;
  }
  const signs = ["Mesh", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanus", "Makara", "Kumbha", "Meena"];
  const r1 = 80;
  const cx = 150;
  const cy = 150;
  const labels = LABELS_HI;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 330" width="300" height="330"><rect width="300" height="330" fill="#fff"/><g transform="translate(${cx},${cy})">`;
  svg += `<circle r="${r1}" fill="#fff" stroke="#333" stroke-width="1"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const a2 = ((i + 1) * 30 - 90) * Math.PI / 180;
    const x1 = r1 * Math.cos(a);
    const y1 = r1 * Math.sin(a);
    const x2 = r1 * Math.cos(a2);
    const y2 = r1 * Math.sin(a2);
    svg += `<path d="M0,0 L${x1},${y1} L${x2},${y2} Z" fill="none" stroke="#999" stroke-width="0.5"/>`;
    const rLbl = r1 + 12;
    svg += `<text x="${rLbl * Math.cos((a + a2) / 2)}" y="${rLbl * Math.sin((a + a2) / 2)}" font-size="8" text-anchor="middle" dominant-baseline="middle" font-family="'Noto Sans Devanagari' sans-serif">${i < 12 ? (labels[i] || signs[i]) : ""}</text>`;
  }
  svg += `<circle r="${r1 / 2}" fill="#f9f9f9" stroke="#333" stroke-width="1"/>`;
  const midSigns = [signs[0], signs[3], signs[6], signs[9]];
  for (let i = 0; i < 4; i++) {
    const a = (i * 90 - 90) * Math.PI / 180;
    const x = (r1 / 2) * Math.cos(a);
    const y = (r1 / 2) * Math.sin(a);
    svg += `<text x="${x}" y="${y}" font-size="7" text-anchor="middle" dominant-baseline="middle" font-family="'Inter' sans-serif">${midSigns[i]}</text>`;
  }
  svg += "</g></svg>";
  return svg;
};

const LABELS_HI = ["मेष", "वृशाभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"];

const buildCoverPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("title", lang), lang, 1, data)}
<div class="logo-placeholder">ASTROLOGICAL REPORT PORTAL</div>
<div class="chart-container">
${renderChartSvg(data)}
</div>
<h2 class="${lang === 'en' ? 'en' : ''}" style="text-align:center; font-size:18pt; margin:0.5cm 0;">${escapeHTML(data.clientName)}</h2>
<p class="p en" style="text-align:center; font-size:10pt; margin-top:0.3cm;">${L("northIndian", lang)} ${data.chartType === "north-indian" ? L("northIndian", lang) : L("southIndian", lang)} — ${data.isPaidTier ? L("paid", lang) : L("basic", lang)}</p>
<p class="p en" style="text-align:center; font-size:8pt; margin-top:0.6cm; color:#777;">${new Date().getFullYear()}</p>
${PAGE_FOOTER(1, lang)}
`;

const buildBirthDetailsPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("birthDetails", lang), lang, 2, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("birthDetails", lang)}</h1>
<table class="table-0">
<tr><th>${L("clientName", lang)}</th><td>${escapeHTML(data.clientName)}</td></tr>
<tr><th>${L("birthDetails", lang)} - Date</th><td>${escapeHTML(data.birthDetails.date)}</td></tr>
<tr><th>${L("birthDetails", lang)} - Time</th><td>${escapeHTML(data.birthDetails.time)}</td></tr>
<tr><th>Latitude</th><td>${escapeHTML(data.birthDetails.latitude)}</td></tr>
<tr><th>Longitude</th><td>${escapeHTML(data.birthDetails.longitude)}</td></tr>
<tr><th>Timezone</th><td>${escapeHTML(data.birthDetails.timezone)}</td></tr>
</table>
${PAGE_FOOTER(2, lang)}
`;

const buildPlanetaryPositionsPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("planetaryPositions", lang), lang, 3, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("planetaryPositions", lang)}</h1>
<table class="table-0">
<tr><th>ग्रह/Body</th><th>राशि/Sign</th><th>डिग्री/Degree</th><th>घर/House</th><th>रीत्रो/Retro</th></tr>
${data.planetaryPositions.map(p => `<tr><td>${escapeHTML(p.body)}</td><td>${escapeHTML(p.sign)}</td><td>${escapeHTML(p.degree)}</td><td>${escapeHTML(p.house)}</td><td>${p.retro ? "✓" : "-"}</td></tr>`).join("")}
</table>
${PAGE_FOOTER(3, lang)}
`;

const buildHouseCuspsPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("houseCusps", lang), lang, 4, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("houseCusps", lang)}</h1>
<table class="table-0">
<tr><th>घर/House</th><th>राशि/Sign</th><th>डिग्री/Degree</th></tr>
${data.houseCusps.map(h => `<tr><td>${escapeHTML(String(h.house))}</td><td>${escapeHTML(h.sign)}</td><td>${escapeHTML(h.degree)}</td></tr>`).join("")}
</table>
${PAGE_FOOTER(4, lang)}
`;

const buildDashaPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("dashaPeriods", lang), lang, 5, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("dashaPeriods", lang)}</h1>
<table class="table-0">
<tr><th>महादशा/Maha Dasha</th><th>Start Year</th><th>End Year</th><th>Sub Period</th></tr>
${data.dashaPeriods.map(d => `<tr><td>${escapeHTML(d.mahaDasha)}</td><td>${escapeHTML(d.startYear)}</td><td>${escapeHTML(d.endYear)}</td><td>${escapeHTML(d.subPeriod || "-")} </td></tr>`).join("")}
</table>
${PAGE_FOOTER(5, lang)}
`;

const buildYogasPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("yogas", lang), lang, 6, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("yogas", lang)}</h1>
${data.yogas.length ? data.yogas.map(y => `<div style="margin-bottom:0.2cm;"><span class="section-title">${escapeHTML(y.name)}</span> — <span class="p en">${escapeHTML(y.description)}</span></div>`).join("") : `<p class="p en">No significant yogas found.</p>`}
${PAGE_FOOTER(6, lang)}
`;

const buildRemediesPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("remedies", lang), lang, 7, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("remedies", lang)}</h1>
<div class="two-col">
${data.remedies.map(r => `<div style="margin-bottom:0.2cm;"><span class="section-title">${escapeHTML(r.category)}</span><p class="p en">${escapeHTML(r.description)}</p></div>`).join("")}
</div>
${PAGE_FOOTER(7, lang)}
`;

const buildDomainPage = (domain: ReportData["domainInsights"][0], idx: number, data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(domain.domain.charAt(0).toUpperCase() + domain.domain.slice(1), lang, 8 + idx, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${domain.domain.charAt(0).toUpperCase() + domain.domain.slice(1)}</h1>
<h2 class="${lang === 'en' ? 'en' : ''}">${L("domainInsights", lang)}:</h2>
<p class="p en">${escapeHTML(domain.prediction)}</p>
<h2 class="${lang === 'en' ? 'en' : ''}">${L("planetaryPositions", lang)}:</h2>
<p class="p en">${escapeHTML(domain.analysis)}</p>
${domain.timeframe ? `<p class="p en" style="font-weight:700;">${escapeHTML(domain.timeframe)}</p>` : ""}
${PAGE_FOOTER(8 + idx, lang)}
`;

const buildReferencesPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME("कल्पुरुश पुस्तक/Sources", lang, 13, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">कल्पुरुश पुस्तक / Sources</h1>
${data.kalpurushaPhalDeepikaRefs.map(ref => `<div style="margin-bottom:0.2cm;"><span class="section-title">${escapeHTML(ref.verse)}</span><p class="p en">${escapeHTML(ref.interpretation)}</p></div>`).join("")}
${PAGE_FOOTER(13, lang)}
`;

const buildNorthIndianChartPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("northIndian", lang), lang, 14, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("northIndian", lang)} ${L("planetaryPositions", lang)}</h1>
<div class="chart-container">${renderChartSvg(data)}</div>
${PAGE_FOOTER(14, lang)}
`;

const buildSouthIndianChartPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("southIndian", lang), lang, 15, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("southIndian", lang)} ${L("planetaryPositions", lang)}</h1>
<div class="chart-container">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240"><rect width="240" height="240" fill="#fff"/><text x="120" y="120" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="#777">South Indian Chart Placeholder</text></svg>
</div>
${PAGE_FOOTER(15, lang)}
`;

const buildTransitPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME("गोचर/F Gochar", lang, 16, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">गोचर / Gochar</h1>
<p class="p en">Transit analysis will be populated from current planetary positions. This section examines gochar effects on the natal chart and timing of results.</p>
${PAGE_FOOTER(16, lang)}
`;

const buildVargaPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME("वर्ग/D9", lang, 17, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">वर्ग / Varga Charts (D-9)</h1>
<p class="p en">Harmonic subdivision charts used for event timing precision. Navamsa chart details will be rendered here for comprehensive prediction.</p>
${PAGE_FOOTER(17, lang)}
`;

const buildMuhurtaPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME("मuhurta/Election", lang, 18, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">मुहूर्त / Muhurta</h1>
<p class="p en">Electional astrology recommendations for optimal timing of events, based on tithi, nakshatra, yoga, and karana strength.</p>
${PAGE_FOOTER(18, lang)}
`;

const buildScorecardPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME(L("scorecard", lang), lang, 19, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">${L("scorecard", lang)}</h1>
<table class="table-0">
<tr><th>Parameter</th><th>Score</th><th>Details</th></tr>
${data.scorecard.map(s => `<tr><td>${escapeHTML(s.parameter)}</td><td><span class="score-text">${s.score}/${s.maxScore}</span></td><td><div class="score-bar"><div class="score-fill" style="width:${(s.score/s.maxScore)*100}%"></div></div></td></tr>`).join("")}
</table>
${PAGE_FOOTER(19, lang)}
`;

const buildSummaryPage = (data: ReportData, lang: "hi" | "en"): string => `
${PAGE_CHROME("सारांश/Summary", lang, 20, data)}
<h1 class="${lang === 'en' ? 'en' : ''}">सारांश / Summary</h1>
<p class="p en">This comprehensive report analyzed the birth chart for ${escapeHTML(data.clientName)} using ${data.chartType} methodology. Key insights across planetary positions, house cusps, dasha periods, yogas, and domain-specific predictions have been documented.</p>
<p class="p en">Domain insights covered: ${data.domainInsights.map(d => d.domain).join(", ")}.</p>
<p class="note">Report generated for ${new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US")}.</p>
${PAGE_FOOTER(20, lang)}
`;

export function generateReportHtml(reportData: ReportData, lang: "hi" | "en"): string {
  const pages: string[] = [
    buildCoverPage(reportData, lang),
    buildBirthDetailsPage(reportData, lang),
    buildPlanetaryPositionsPage(reportData, lang),
    buildHouseCuspsPage(reportData, lang),
    buildDashaPage(reportData, lang),
    buildYogasPage(reportData, lang),
    buildRemediesPage(reportData, lang),
  ];
  reportData.domainInsights.forEach((d, i) => pages.push(buildDomainPage(d, i, reportData, lang)));
  pages.push(buildReferencesPage(reportData, lang));
  pages.push(buildNorthIndianChartPage(reportData, lang));
  pages.push(buildSouthIndianChartPage(reportData, lang));
  pages.push(buildTransitPage(reportData, lang));
  pages.push(buildVargaPage(reportData, lang));
  pages.push(buildMuhurtaPage(reportData, lang));
  pages.push(buildScorecardPage(reportData, lang));
  pages.push(buildSummaryPage(reportData, lang));
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

export const PDF_HTML_TEMPLATE_VERSION = "1.0.0";