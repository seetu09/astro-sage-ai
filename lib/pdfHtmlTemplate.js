"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDF_HTML_TEMPLATE_VERSION = void 0;
exports.generateReportHtml = generateReportHtml;
var kundliChart_1 = require("@/lib/kundliChart");
var astrologyDictionary_1 = require("@/lib/astrologyDictionary");
var translations_1 = require("@/lib/i18n/translations");
var escapeHTML = function (str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};
var L = function (key, lang) { return (0, translations_1.getTranslation)(lang, "pdf.template.".concat(key)); };
/** Localize a planet name (English/Sanskrit/Hindi → target language). */
var localizePlanetName = function (name, lang) {
    return (0, astrologyDictionary_1.localizePlanet)((0, astrologyDictionary_1.canonicalPlanet)(name), lang);
};
/** Localize a sign descriptor (name or 1-12 index → target language). */
var localizeSignName = function (sign, lang) {
    var idx = (0, astrologyDictionary_1.getSignIndex)(sign);
    return idx ? (0, astrologyDictionary_1.localizeRashi)(idx, lang) : (0, astrologyDictionary_1.localizeSign)(String(sign), lang);
};
/** Domain key → localized LABEL lookup key for the life-domain pages. */
var DOMAIN_LABEL_KEYS = {
    career: "domainCareer",
    marriage: "domainMarriage",
    wealth: "domainWealth",
    health: "domainHealth",
    finance: "domainFinance",
    education: "domainEducation",
    family: "domainFamily",
};
var CSS = "\n@page { margin: 0; padding: 0; size: A4; }\n@media print {\n  @page { size: A4 portrait; margin: 0; }\n  /* Client fallback (window.print): hard breaks so every dense .page-container\n     lands on its own physical sheet, chrome included. */\n  html, body { width: 210mm; overflow: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }\n  .page-container {\n    page-break-after: always;\n    break-after: page;\n    width: 210mm;\n    height: auto;\n    /* REMOVED: max-height and overflow: hidden \u2014 these clip content and create artificial blank space */\n  }\n  .page-container:last-child { page-break-after: auto; break-after: auto; }\n}\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: 'Inter', sans-serif; font-size: 12pt; line-height: 1.4; color: #1a1a1a; background: #fff; }\nhtml, body { overflow: hidden; }\n@page :first { margin: 0; }\n\n/* Dense A4 sheet \u2014 standard 210mm \u00D7 297mm portrait with uniform 12mm padding.\n   Sheets GROUP multiple sections; only the container carries the page break,\n   so small standalone components never force a near-empty page anymore. */\n.page-container {\n  width: 210mm;\n  height: auto;\n  padding: 12mm;\n  margin: 0 auto;\n  page-break-after: always;\n  position: relative;\n  background: #fff;\n}\n.page-container:last-child { page-break-after: auto; }\n.page-content { width: 100%; }\n/* Inner cards/tables intentionally carry NO page-break rules \u2014 each .page-container\n   is the strict A4 boundary (1 page = 1 A4 unit). Related sections are simply\n   grouped inside that single wrapper so the renderer never forces a mid-card\n   split or emits a near-empty overflow sheet. */\n.header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.25cm; border-bottom: 3pt solid #999; margin-bottom: 0.35cm; }\n.header h1 { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 16pt; font-weight: 700; }\n.header h1.en { font-family: 'Inter', sans-serif; }\n.header .meta { text-align: right; font-size: 9pt; color: #555; }\n.header .meta span { display: block; }\n.cover-band { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1pt solid #ddd; padding-bottom: 0.2cm; margin-bottom: 0.3cm; }\n.cover-band .client-name { font-size: 15pt; font-weight: 700; font-family: 'Noto Sans Devanagari', sans-serif; }\n.footer { position: absolute; bottom: 10mm; width: calc(100% - 24mm); text-align: center; font-size: 8pt; color: #777; border-top: 1pt solid #ddd; padding-top: 0.25cm; }\n.footer .page-number { display: inline-block; }\n.h2 { font-size: 11pt; font-weight: 700; margin-bottom: 0.25cm; color: #333; }\n.h2.en { font-family: 'Inter', sans-serif; }\n.p { font-size: 9.5pt; margin-bottom: 0.25cm; text-align: justify; }\n.p.en { font-family: 'Inter', sans-serif; }\n.two-col { column-count: 2; column-gap: 0.5cm; }\n.table-0 { width: 100%; border-collapse: collapse; margin-bottom: 0.3cm; }\n.table-0 th, .table-0 td { border: 0.5pt solid #bbb; padding: 3px 5px; text-align: left; font-size: 8.5pt; }\n.table-0 th { background: #f0f0f0; }\n.chart-container { text-align: center; margin: 0.25cm auto; }\n.chart-container svg { max-width: 100%; height: auto; }\n.chart-sm { max-width: 82mm; margin-left: auto; margin-right: auto; }\n.section-title { font-size: 10pt; font-weight: 700; margin: 0.2cm 0 0.1cm; display: inline-block; }\n.score-bar { height: 6pt; background: #eee; border-radius: 2px; overflow: hidden; display: inline-block; width: 60%; vertical-align: middle; margin-left: 5px; }\n.score-fill { height: 100%; background: #3b82f6; }\n.score-text { font-size: 8.5pt; font-weight: 700; }\n.tag { display: inline-block; padding: 1pt 6px; border-radius: 3px; font-size: 8pt; font-weight: 700; }\n.tag.paid { background: #fbbf24; color: #78350f; }\n.tag.basic { background: #9ca3af; color: #374151; }\n.badge-row { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 0.25cm; }\n.divider { border-top: 1pt dashed #bbb; margin: 0.2cm 0; }\n.note { font-size: 8pt; font-style: italic; color: #666; }\n\n/* Panchang strip \u2014 compact key/value tiles (Page 1). */\n.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 0.25cm; }\n.tile { border: 0.5pt solid #bbb; border-radius: 3px; padding: 4px 6px; }\n.tile-k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }\n.tile-v { font-size: 9.5pt; font-weight: 700; color: #1a1a1a; }\n\n/* Two-up layout for house-cusps table + D9 chart (Page 2). */\n.grid-2 { display: flex; gap: 6mm; align-items: flex-start; }\n.grid-2 > div { flex: 1; min-width: 0; }\n.grid-2 > table { flex: 1; min-width: 0; align-self: flex-start; }\n\n/* Sarvashtakavarga bindu grid (Page 2). */\n.av-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; max-width: 150mm; margin: 0 auto 0.2cm; }\n.av-cell { border: 0.5pt solid #bbb; border-radius: 3px; text-align: center; padding: 3px 0; }\n.av-cell.av-strong { background: #ecfdf5; border-color: #059669; }\n.av-h { display: block; font-size: 7pt; color: #666; }\n.av-b { display: block; font-size: 11pt; font-weight: 700; }\n\n/* Dual-domain layout \u2014 two life domains packed onto ONE A4 sheet. */\n.dual-domain-grid { display: flex; flex-direction: column; gap: 4mm; }\n.domain-half { flex: 1; min-height: 0; }\n.domain-title { font-size: 11.5pt; font-weight: 700; margin-bottom: 0.15cm; color: #333; }\n.domain-title.en { font-family: 'Inter', sans-serif; }\n.domain-badges { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; margin-bottom: 0.2cm; }\n.domain-badges .tag { text-align: center; padding: 2pt 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n.domain-narrative { font-size: 9pt; text-align: justify; line-height: 1.5; max-height: 65mm; overflow: hidden; margin-bottom: 0.2cm; }\n.mini-table { width: 100%; border-collapse: collapse; }\n.mini-table th, .mini-table td { border: 0.5pt solid #bbb; padding: 2mm 4px; text-align: left; font-size: 8.5pt; }\n.mini-table th { background: #f0f0f0; }\n.domain-divider { border-top: 0.6pt solid rgba(0, 0, 0, 0.1); margin: 4mm 0; }\n\n/* \u2500\u2500 New premium sections: dosha verdict card, remedy grid, dasha deep-dive,\n   Sade Sati tracker and the 120-year master table \u2500\u2500 */\n.verdict-card { border: 1pt solid #cbd5e1; border-left: 3pt solid #3b82f6; border-radius: 3px; padding: 2mm 3mm; margin-bottom: 0.25cm; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }\n.verdict-card .status-badge { font-size: 8pt; font-weight: 700; padding: 1pt 5px; border-radius: 3px; }\n.status-ok { background: #dcfce7; color: #166534; }\n.status-warn { background: #fef3c7; color: #92400e; }\n.prescript-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 0.25cm; }\n.prescript-card { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }\n.prescript-k { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }\n.prescript-v { font-size: 10.5pt; font-weight: 700; margin-top: 1pt; }\n.prescript-line { font-size: 8.5pt; margin-top: 1pt; }\n.dasha-focus-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 0.25cm; }\n.dasha-focus { border: 1pt solid #d1d5db; border-radius: 3px; padding: 2mm 3mm; flex: 1 1 30%; min-width: 55mm; }\n.dasha-focus.active { background: #eff6ff; border-color: #2563eb; }\n.dasha-focus .k { font-size: 7.5pt; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }\n.dasha-focus .v { font-size: 11pt; font-weight: 700; margin-top: 0.05cm; }\n.dasha-cycle { list-style: none; margin: 0; padding: 0; }\n.dasha-cycle li { display: flex; justify-content: space-between; border-bottom: 0.4pt dashed #ddd; padding: 1.5mm 0; font-size: 8.5pt; }\n.dasha-cycle li.active { font-weight: 700; color: #1d4ed8; }\n.tracker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; align-items: stretch; }\n.tracker-box { border: 0.5pt solid #bbb; border-radius: 3px; padding: 3mm; }\n.tracker-box .tracker-title { font-size: 10.5pt; font-weight: 700; margin-bottom: 0.12cm; color: #333; }\n.tracker-table { width: 100%; border-collapse: collapse; font-size: 8pt; }\n.tracker-table th, .tracker-table td { border: 0.4pt solid #ccc; padding: 1.5mm 2mm; text-align: left; }\n.tracker-table th { background: #f0f0f0; }\n";
var PAGE_CHROME = function (title, lang, pageNumber, data) { return "<div class=\"page-container\">\n<div class=\"header\">\n  <h1 class=\"".concat(lang === 'en' ? 'en' : '', "\">").concat(escapeHTML(title), "</h1>\n  <div class=\"meta\">\n    <span><span class=\"section-title\">").concat(L("clientName", lang), ":</span> ").concat(escapeHTML(data.clientName), "</span>\n    <span class=\"tag ").concat(data.isPaidTier ? "paid" : "basic", "\">").concat(data.isPaidTier ? L("paid", lang) : L("basic", lang), "</span>\n  </div>\n</div>\n<div class=\"page-content\">\n"); };
var PAGE_FOOTER = function (pageNumber, lang) { return "\n</div>\n<div class=\"footer\">\n  <span class=\"page-number\">".concat(L("page", lang), " ").concat(pageNumber, "</span>\n</div>\n</div>"); };
/**
 * Map ReportData into the pure-SSR Kundli chart renderer input.
 * Planetary `body`/`sign` are normalized through the localization dictionary so
 * that English, Sanskrit and Hindi spellings all resolve to the same glyphs.
 */
var buildChartInput = function (data) {
    // Lagna = house-1 cusp sign when available (falls back to Mesha/Aries).
    var ascendantSign = (data.houseCusps && data.houseCusps.length
        ? (0, astrologyDictionary_1.getSignIndex)(data.houseCusps[0].sign)
        : 0) || 1;
    var planets = (data.planetaryPositions || []).map(function (p) { return ({
        planet: p.body,
        sign: (0, astrologyDictionary_1.getSignIndex)(p.sign) || 1,
        house: parseInt(String(p.house), 10) || 1,
        retrograde: !!p.retro,
    }); });
    var houses = (data.houseCusps || []).map(function (h) { return ({
        house: h.house,
        sign: (0, astrologyDictionary_1.getSignIndex)(h.sign) || 1,
    }); });
    return { planets: planets, houses: houses, ascendantSign: ascendantSign };
};
/**
 * Render a pure inline-SVG Kundli chart (North or South Indian) for the PDF.
 * Falls back to the pre-rendered `northIndianChartSvg` when a caller has
 * already supplied one (preserving existing behaviour).
 */
var renderChartSvg = function (data, lang, style) {
    if (style === "north" && /^<svg/.test(data.northIndianChartSvg || "")) {
        return data.northIndianChartSvg;
    }
    var _a = buildChartInput(data), planets = _a.planets, houses = _a.houses, ascendantSign = _a.ascendantSign;
    return (0, kundliChart_1.renderKundliChartSvg)({
        style: style,
        language: lang,
        ascendantSign: ascendantSign,
        planets: planets,
        houses: houses,
        showTitle: true,
    });
};
// ─── Dense consolidated sheets ──────────────────────────────────────────────
// Sheets GROUP related sections onto one A4 page; only the .page-container
// itself carries the page break, eliminating the sparse one-section-per-sheet
// blank space of the previous layout.
/** Shared compact key/value tile used by the Panchang strip. */
var tile = function (key, lang, value) {
    return value
        ? "<div class=\"tile\"><div class=\"tile-k\">".concat(escapeHTML(L(key, lang)), "</div><div class=\"tile-v\">").concat(escapeHTML(value), "</div></div>")
        : "";
};
/**
 * PAGE 1 — Nativity details + Panchang strip (Lagna / Moon Sign / Sun Sign /
 * Nakshatra / Weekday) + D1 diamond chart + core planetary table. Absorbs the
 * old near-empty cover, birth-details and planetary-positions sheets into one
 * standard A4 sheet.
 */
var buildNativityPanchangChartPage = function (data, lang, pageNumber) {
    var bd = data.birthDetails;
    var pc = data.panchang;
    var nativityTable = bd
        ? "<table class=\"table-0\">\n<tr><th>".concat(L("clientName", lang), "</th><td>").concat(escapeHTML(data.clientName), "</td><th>").concat(L("chartType", lang), "</th><td>").concat(escapeHTML(data.chartType), "</td></tr>\n<tr><th>").concat(L("birthDetails", lang), "</th><td>").concat(escapeHTML(bd.date), " \u00B7 ").concat(escapeHTML(bd.time), "</td><th>").concat(L("tz", lang), "</th><td>").concat(escapeHTML(bd.timezone), "</td></tr>\n<tr><th>").concat(L("latLong", lang), "</th><td colspan=\"3\">").concat(escapeHTML(bd.latitude)).concat(bd.longitude ? ", ".concat(escapeHTML(bd.longitude)) : "", "</td></tr>\n</table>")
        : "";
    var panchangGrid = pc
        ? "<div class=\"tile-grid\">".concat([
            tile("varaWeekday", lang, pc.varaWeekday),
            tile("nakshatra", lang, pc.nakshatra),
            tile("nakshatraLord", lang, pc.nakshatraLord ? localizePlanetName(pc.nakshatraLord, lang) : undefined),
            tile("moonSign", lang, pc.moonSign ? localizeSignName(pc.moonSign, lang) : undefined),
            tile("sunSign", lang, pc.sunSign ? localizeSignName(pc.sunSign, lang) : undefined),
            tile("lagna", lang, pc.lagna ? localizeSignName(pc.lagna, lang) : undefined),
        ].join(""), "</div>")
        : "";
    var planetRows = (data.planetaryPositions || [])
        .map(function (p) { return "<tr><td>".concat(escapeHTML(localizePlanetName(p.body, lang)), "</td><td>").concat(escapeHTML(localizeSignName(p.sign, lang)), "</td><td>").concat(escapeHTML(p.degree), "</td><td>").concat(escapeHTML(p.house), "</td><td>").concat(p.retro ? "✓" : "-", "</td></tr>"); })
        .join("");
    return "\n".concat(PAGE_CHROME(L("title", lang), lang, pageNumber, data), "\n<div class=\"cover-band\"><span class=\"client-name\">").concat(escapeHTML(data.clientName), "</span><span class=\"tag ").concat(data.isPaidTier ? "paid" : "basic", "\">").concat(data.isPaidTier ? L("paid", lang) : L("basic", lang), "</span></div>\n").concat(nativityTable, "\n").concat(panchangGrid ? "<div class=\"section-block\">\n<h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("panchang", lang), "</h2>\n").concat(panchangGrid, "\n</div>") : "", "\n<div class=\"section-block\">\n<h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">").concat(L("lagnaD1Chart", lang), "</h2>\n<div class=\"chart-container chart-sm\">").concat(renderChartSvg(data, lang, "north"), "</div>\n</div>\n").concat(planetRows ? "<div class=\"section-block\">\n<h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("planetaryPositions", lang), "</h2>\n<table class=\"table-0\">\n<tr><th>").concat(L("bodyCol", lang), "</th><th>").concat(L("signCol", lang), "</th><th>").concat(L("degreeCol", lang), "</th><th>").concat(L("houseCol", lang), "</th><th>").concat(L("retroCol", lang), "</th></tr>\n").concat(planetRows, "\n</table>\n</div>") : "", "\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * PAGE 2 — House-cusps table + Navamsa (D9) diamond chart side by side,
 * followed by the Sarvashtakavarga bindu grid when calculation data exists.
 */
var buildHousesNavamsaAshtakavargaPage = function (data, lang, pageNumber) {
    var _a, _b, _c, _d;
    var sav = ((_b = (_a = data.sarvashtakavarga) === null || _a === void 0 ? void 0 : _a.bindus) === null || _b === void 0 ? void 0 : _b.length) ? data.sarvashtakavarga : null;
    var d9Svg = data.d9Chart
        ? (0, kundliChart_1.renderKundliChartSvg)({
            style: "north",
            language: lang,
            ascendantSign: data.d9Chart.ascendantSign || 1,
            planets: data.d9Chart.planets,
            showTitle: false,
        })
        : "";
    var avCells = sav
        ? sav.bindus
            .map(function (b, i) {
            var _a;
            return "<div class=\"av-cell".concat(((_a = sav.beneficialHouses) === null || _a === void 0 ? void 0 : _a.includes(i + 1)) ? " av-strong" : "", "\"><span class=\"av-h\">").concat(escapeHTML(L("houseShort", lang))).concat(i + 1, "</span><span class=\"av-b\">").concat(Number(b) || 0, "</span></div>");
        })
            .join("")
        : "";
    var houseRows = (data.houseCusps || [])
        .map(function (h) { return "<tr><td>".concat(escapeHTML(String(h.house)), "</td><td>").concat(escapeHTML(localizeSignName(h.sign, lang)), "</td><td>").concat(escapeHTML(h.degree || "-"), "</td></tr>"); })
        .join("");
    // Split the 12 cusps into two side-by-side tables so the block stays compact.
    var half = Math.ceil((data.houseCusps || []).length / 2) || 6;
    var houseCols = ((_c = data.houseCusps) === null || _c === void 0 ? void 0 : _c.length)
        ? "<div class=\"grid-2\">\n<table class=\"table-0\"><tr><th>".concat(L("houseCol", lang), "</th><th>").concat(L("signCol", lang), "</th><th>").concat(L("degreeCol", lang), "</th></tr>").concat(houseRows.slice(0, half), "</table>\n<table class=\"table-0\"><tr><th>").concat(L("houseCol", lang), "</th><th>").concat(L("signCol", lang), "</th><th>").concat(L("degreeCol", lang), "</th></tr>").concat(houseRows.slice(half), "</table>\n</div>")
        : "<p class=\"note\">".concat(L("houseDataUnavailable", lang), "</p>");
    return "\n".concat(PAGE_CHROME(L("housesNavamsaAshtakavarga", lang), lang, pageNumber, data), "\n<div class=\"section-block\">\n<h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">").concat(L("houseCusps", lang), "</h2>\n").concat(houseCols, "\n</div>\n<div class=\"section-block\">\n<h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">").concat(L("navamsaD9Chart", lang), "</h2>\n").concat(d9Svg ? "<div class=\"chart-container chart-sm\">".concat(d9Svg, "</div>") : "<p class=\"note\">".concat(L("notAvailable", lang), "</p>"), "\n</div>\n").concat(sav ? "<div class=\"section-block\">\n<h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("sarvashtakavarga", lang), "</h2>\n<div class=\"av-grid\">").concat(avCells, "</div>\n").concat(((_d = sav.beneficialHouses) === null || _d === void 0 ? void 0 : _d.length) ? "<p class=\"note\">".concat(L("strongHouses", lang), ": ").concat(sav.beneficialHouses.join(", "), "</p>") : "", "\n</div>") : "", "\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * PAGE 3 — Vimshottari dasha table (Mahadasha / Antardasha periods) + yogas +
 * remedies packed together. Returns "" when none of the three carry data so no
 * placeholder/blank "उपाय" sheet can ever leak into the PDF.
 */
var buildDashaYogasRemediesPage = function (data, lang, pageNumber) {
    var dashaRows = (data.dashaPeriods || [])
        .map(function (d) { return "<tr><td>".concat(escapeHTML(localizePlanetName(d.mahaDasha, lang)), "</td><td>").concat(escapeHTML(d.startYear), "</td><td>").concat(escapeHTML(d.endYear), "</td><td>").concat(escapeHTML(d.subPeriod || "-"), "</td></tr>"); })
        .join("");
    var yogaItems = (data.yogas || [])
        .map(function (y) { return "<div style=\"margin-bottom:0.18cm;\"><span class=\"section-title\">".concat(escapeHTML(y.name), "</span> \u2014 <span class=\"p ").concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(y.description), "</span></div>"); })
        .join("");
    var remedyItems = (data.remedies || [])
        .map(function (r) { return "<div style=\"margin-bottom:0.18cm;\"><span class=\"section-title\">".concat(escapeHTML(r.category), "</span><p class=\"p ").concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(r.description), "</p></div>"); })
        .join("");
    var dashaSection = dashaRows
        ? "<div class=\"section-block\"><h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("dashaPeriods", lang), "</h2><table class=\"table-0\"><tr><th>").concat(L("mahaDashaCol", lang), "</th><th>").concat(L("startCol", lang), "</th><th>").concat(L("endCol", lang), "</th><th>").concat(L("subPeriodCol", lang), "</th></tr>").concat(dashaRows, "</table></div>")
        : "<p class=\"note\">Dasha periods computed from birth nakshatra. Detailed sub-periods require exact birth time.</p>";
    var yogaSection = yogaItems
        ? "<div class=\"section-block\"><h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("yogas", lang), "</h2>").concat(yogaItems, "</div>")
        : "<p class=\"note\">No major classical yogas are prominently indicated in this chart.</p>";
    var remedySection = remedyItems
        ? "<div class=\"section-block\"><h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("remedies", lang), "</h2><div class=\"two-col\">").concat(remedyItems, "</div></div>")
        : "<p class=\"note\">General remedies: chant the Gayatri mantra, respect elders, and maintain a disciplined daily routine.</p>";
    return "\n".concat(PAGE_CHROME(L("dashasYogasRemedies", lang), lang, pageNumber, data), "\n").concat(dashaSection, "\n").concat(yogaSection, "\n").concat(remedySection, "\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/** Domain → primary bhava used for the header metric badges. */
var DOMAIN_HOUSES = {
    career: 10, marriage: 7, wealth: 2, health: 6, finance: 11, education: 4,
};
/** Clamp a narrative to at most `max` words so a dual-domain half never spills. */
var clampWords = function (text, max) {
    var words = text.split(/\s+/).filter(Boolean);
    return words.length <= max ? text : "".concat(words.slice(0, max).join(" "), "\u2026");
};
/**
 * DUAL-DOMAIN PAGE — TWO life domains share ONE A4 sheet. Each half carries
 * the three metric badges in a horizontal grid row, a justified narrative
 * (≤180 words, hard-clipped at 65mm) and a compact 2-row milestone table of
 * only the next upcoming windows; a hairline divider separates the halves.
 * Domains: Career, Wealth, Marriage, Health, Education, Family.
 */
var buildLifeDomainsPage = function (keys, domains, data, lang, pageNumber) {
    var currentYear = new Date().getFullYear();
    var fallbackPrediction = function (domainKey, lang) {
        if (lang === 'hi') {
            return "".concat((0, translations_1.getTranslation)(lang, "pdf.template.domain".concat(capitalize(domainKey), "`)} \u0915\u093E \u0935\u093F\u0938\u094D\u0924\u0943\u0924 \u0935\u093F\u0936\u094D\u0932\u0947\u0937\u0923 \u092A\u0942\u0930\u094D\u0923 \u0915\u0941\u0902\u0921\u0932\u0940 \u092A\u0930\u0940\u0915\u094D\u0937\u0923 \u0915\u0947 \u0906\u0927\u093E\u0930 \u092A\u0930 \u0915\u093F\u092F\u093E \u091C\u093E\u0924\u093E \u0939\u0948\u0964 \u0938\u0902\u092C\u0902\u0927\u093F\u0924 \u092D\u093E\u0935 \u0938\u094D\u0935\u093E\u092E\u0940, \u0917\u094D\u0930\u0939 \u0926\u0943\u0937\u094D\u091F\u093F \u0914\u0930 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0926\u0936\u093E \u092A\u094D\u0930\u092D\u093E\u0935 \u0938\u0947 \u0907\u0938 \u0915\u094D\u0937\u0947\u0924\u094D\u0930 \u0915\u0940 \u0917\u0939\u0928 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0939\u094B\u0924\u0940 \u0939\u0948\u0964")));
        }
        return ;
        "A detailed ${domainKey} analysis is derived from the relevant bhava lords, planetary aspects, and current dasha influences. This section examines the specific house significations and planetary placements governing ${domainKey} outcomes.`;\n};\n\nconst domainObjects: ReportData[\"domainInsights\"][] = [];\nkeys.forEach((key) => {\n  const domain = domains.find((d) => d.domain === key);\n  if (domain && domain.prediction?.length >= 50) {\n    domainObjects.push(domain);\n  } else {\n    const fallbackPred = fallbackPrediction(key, lang);\n    const fallbackDomain: ReportData[\"domainInsights\"] = {\n      domain: key,\n      prediction: fallbackPred,\n      analysis: \"\",\n      timeframe: undefined,\n    };\n    domainObjects.push(fallbackDomain);\n  }\n});\n\nconst sectionHtml = domainObjects.map((domain) => {\n  const title = L(DOMAIN_LABEL_KEYS[domain.domain] ?? \"domainCareer\", lang);\n  const focusHouse = DOMAIN_HOUSES[domain.domain] ?? 1;\n  const cuspSignIdx = getSignIndex(data.houseCusps?.[focusHouse - 1]?.sign || \"\");\n  const lord = cuspSignIdx ? SIGN_LORDS[cuspSignIdx] || \"\u2014\" : \"\u2014\";\n  const firstWindow = data.dashaPeriods?.[0]\n    ? ";
        $;
        {
            data.dashaPeriods[0].startYear;
        }
        $;
        {
            data.dashaPeriods[0].endYear;
        }
        "\n    : domain.timeframe || \"\u2014\";\n  const badges = [\n    ";
        $;
        {
            L("houseWord", lang);
        }
        $;
        {
            focusHouse;
        }
        ",\n    ";
        $;
        {
            L("lordWord", lang);
        }
        $;
        {
            localizePlanetName(lord, lang);
        }
        ",\n    firstWindow,\n  ];\n  const narrativeParts = [domain.prediction, domain.analysis].filter(Boolean);\n  const narrative = narrativeParts.length\n    ? escapeHTML(clampWords(narrativeParts.join(\" \"), 180))\n    : escapeHTML(getTranslation(lang, \"pdf.template.detailedPremiumAnalysis\", { domain: title.toLowerCase() }));\n  // Milestone table \u2014 at most TWO rows, showing only the NEXT upcoming windows.\n  const upcomingWindows = (data.dashaPeriods || [])\n    .filter((d) => {\n      const endYear = parseInt(String(d.endYear), 10);\n      return Number.isNaN(endYear) || endYear >= currentYear;\n    })\n    .slice(0, 2);\n  const milestoneRows = upcomingWindows.length\n    ? upcomingWindows.map((d) => " < tr > $;
        {
            escapeHTML(d.startYear);
        }
        $;
        {
            escapeHTML(d.endYear);
        }
        `</td><td>${escapeHTML([localizePlanetName(d.mahaDasha, lang), d.subPeriod].filter(Boolean).join(" · ") || "-")}</td></tr>`;
        join("");
    };
};
"<tr><td>\u2014</td><td>".concat(escapeHTML(L("notAvailable", lang)), "</td></tr>");
return "<div class=\"domain-half\">\n    <h2 class=\"domain-title ".concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(title), "</h2>\n    <div class=\"domain-badges\">").concat(badges.map(function (b) { return "<span class=\"tag paid\">".concat(escapeHTML(b), "</span>"); }).join(""), "</div>\n    <p class=\"domain-narrative ").concat(lang === "en" ? "en" : "", "\">").concat(narrative, "</p>\n    <table class=\"mini-table\">\n      <tr><th>").concat(L("period", lang), "</th><th>").concat(L("influence", lang), "</th></tr>\n      ").concat(milestoneRows, "\n    </table>\n  </div>");
;
;
// ─── Vimshottari + dosha derivation used by the new premium pages ─────────────
var VIMSHOTTARI_YEARS = [
    ["Ketu", 7], ["Venus", 20], ["Sun", 6], ["Moon", 10],
    ["Mars", 7], ["Rahu", 18], ["Jupiter", 16], ["Saturn", 19], ["Mercury", 17],
];
var CANON = {
    sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", rahu: "Rahu",
    jupiter: "Jupiter", saturn: "Saturn", venus: "Venus", ketu: "Ketu",
    lagna: "Lagna", ascendant: "Lagna",
};
var canonPlanet = function (name) {
    return CANON[name.trim().toLowerCase()] || name.trim();
};
var findPlanet = function (data, name) {
    return (data.planetaryPositions || []).find(function (p) { return canonPlanet(p.body) === canonPlanet(name); });
};
var houseNum = function (p) {
    var _a;
    var n = parseInt(String((_a = p === null || p === void 0 ? void 0 : p.house) !== null && _a !== void 0 ? _a : "0"), 10);
    return Number.isNaN(n) ? 0 : n;
};
/** Which dasha period (ReportData span) covers `year`, if any. */
var activeDasha = function (data, year) {
    return (data.dashaPeriods || []).find(function (d) {
        var s = parseInt(String(d.startYear), 10);
        var e = parseInt(String(d.endYear), 10);
        return !Number.isNaN(s) && !Number.isNaN(e) && year >= s && year <= e;
    });
};
/** Canonical name of the currently running Maha Dasha ("" if unknown). */
var currentDashaName = function (data, year) { var _a; return canonPlanet(((_a = activeDasha(data, year)) === null || _a === void 0 ? void 0 : _a.mahaDasha) || ""); };
/** Full Vimshottari cycle with year spans (uses exact periods when available). */
var vimshottariCycle = function (data, year) {
    var _a, _b;
    var exact = (data.dashaPeriods || []).map(function (d) {
        var _a, _b;
        return ({
            name: canonPlanet(d.mahaDasha),
            years: (_b = (_a = VIMSHOTTARI_YEARS.find(function (_a) {
                var n = _a[0];
                return n === canonPlanet(d.mahaDasha);
            })) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : 0,
            from: parseInt(String(d.startYear), 10),
            to: parseInt(String(d.endYear), 10),
        });
    });
    if (exact.length >= 9 && exact.every(function (e) { return !Number.isNaN(e.from) && !Number.isNaN(e.to); })) {
        return exact;
    }
    var base = parseInt(String((_b = (_a = data.dashaPeriods) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.startYear), 10) || year;
    var acc = 0;
    return VIMSHOTTARI_YEARS.map(function (_a) {
        var name = _a[0], yrs = _a[1];
        var from = base + acc;
        acc += yrs;
        return { name: name, years: yrs, from: from, to: from + yrs - 1 };
    });
};
var severityLabel = function (count) {
    if (count >= 3)
        return "severityHigh";
    if (count === 2)
        return "severityMedium";
    if (count === 1)
        return "severityMild";
    return "severityNone";
};
// Returns "" when there is no yoga content to render.
var buildYogasDoshasPage = function (data, lang, pageNumber) {
    var yogaItems = (data.yogas || [])
        .map(function (y) { return "<div style=\"margin-bottom:0.18cm;\"><span class=\"section-title\">".concat(escapeHTML(y.name), "</span><p class=\"p ").concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(y.description || "-"), "</p></div>"); })
        .join("");
    var mars = findPlanet(data, "Mars");
    var moon = findPlanet(data, "Moon");
    var sat = findPlanet(data, "Saturn");
    var manglikHouses = mars ? [1, 2, 4, 7, 8, 12].filter(function (h) { return houseNum(mars) === h; }) : [];
    var mangLik = manglikHouses.length > 0;
    var manglikCard = mars
        ? "<div class=\"verdict-card\"><span class=\"status-badge ".concat(mangLik ? "status-warn" : "status-ok", "\">").concat(L("manglik", lang), "</span><span>").concat(mangLik ? L("manglikYes", lang) : L("manglikNo", lang), "</span><span>\u00B7 ").concat(L("doshaSeverity", lang), ": ").concat(L(severityLabel(manglikHouses.length), lang), "</span></div>")
        : "<div class=\"verdict-card\"><span class=\"status-badge status-ok\">".concat(L("manglik", lang), "</span><span>Mars placement data unavailable \u2014 Manglik status cannot be determined.</span></div>");
    var satiPhase = (function () {
        if (!moon || !sat)
            return -1;
        var m = houseNum(moon);
        var s = houseNum(sat);
        if (m === s)
            return 2;
        if (m === (s % 12) + 1)
            return 3;
        if (m === ((s + 10) % 12) + 1)
            return 1;
        return -1;
    })();
    var satiCard = moon && sat
        ? "<div class=\"verdict-card\"><span class=\"status-badge ".concat(satiPhase >= 0 ? "status-warn" : "status-ok", "\">").concat(L("sadeSati", lang), "</span><span>").concat(satiPhase >= 0 ? L("satiPhase".concat(satiPhase), lang) : L("noSadeSati", lang), "</span></div>")
        : "<div class=\"verdict-card\"><span class=\"status-badge status-ok\">".concat(L("sadeSati", lang), "</span><span>Sade Sati status requires Moon and Saturn positions.</span></div>");
    var doshaHtml = "<div class=\"section-block\"><h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("doshaSection", lang), "</h2>").concat(manglikCard).concat(satiCard, "</div>");
    var yogaSection = yogaItems
        ? "<div class=\"section-block\"><h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("yogas", lang), "</h2><div class=\"two-col\">").concat(yogaItems, "</div></div>")
        : "<p class=\"note\">No dominant yogas detected.</p>";
    return "\n".concat(PAGE_CHROME(L("yogDoshTitle", lang), lang, pageNumber, data), "\n").concat(yogaSection, "\n").concat(doshaHtml, "\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/** Canonical gemstone / rudraksha / mantra mapping per strengthening planet. */
var GEM_PRESCRIPT = {
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
var PRESCRIPT_ALIASES = {
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
var findPrescript = function (text) {
    var lower = text.toLowerCase();
    for (var _i = 0, _a = Object.entries(PRESCRIPT_ALIASES); _i < _a.length; _i++) {
        var _b = _a[_i], planet = _b[0], aliases = _b[1];
        if (aliases.some(function (a) { return lower.includes(a); })) {
            return { planet: planet, prescript: GEM_PRESCRIPT[planet] };
        }
    }
    return null;
};
var prescriptLines = function (prescript, lang) {
    return "<div class=\"prescript-line\"><strong>".concat(escapeHTML(L(prescript.gemKey, lang)), "</strong> \u00B7 ").concat(escapeHTML((0, translations_1.getTranslation)(lang, "pdf.template.mukhi", { count: prescript.mukhi })), " \u00B7 ").concat(escapeHTML(L(prescript.dayKey, lang)), "</div><div class=\"prescript-line\">").concat(escapeHTML(prescript.mantra), "</div><div class=\"prescript-line\">").concat(escapeHTML(L(prescript.goalKey, lang)), "</div>");
};
/**
 * PAGE — Gemstone / Rudraksha prescription. Renders rows only when the remedy
 * data actually describes gem or rudraksha material. When a remedy references
 * a strengthening planet, the canonical gem / mukhi / day / mantra / goal is
 * appended to the card. Returns "" when no gem-related remedy exists.
 */
var buildRemedyPrescriptPage = function (data, lang, pageNumber) {
    var rows = (data.remedies || [])
        .filter(function (r) { return /gem|rudraksh|ratna|रत्न|रुद्राक्ष|ruby|pearl|sapphire|gemstone/i.test("".concat(r.category, " ").concat(r.description)); })
        .slice(0, 6)
        .map(function (r) {
        var match = findPrescript("".concat(r.category, " ").concat(r.description));
        return "<div class=\"prescript-card\"><div class=\"prescript-k\">".concat(escapeHTML(r.category || L("gemRudhSection", lang)), "</div>").concat(r.description ? "<div class=\"prescript-v\">".concat(escapeHTML(r.description), "</div>") : "").concat(match ? prescriptLines(match.prescript, lang) : "", "</div>");
    })
        .join("");
    var prescriptRows = rows
        ? rows
        : "<div class=\"prescript-card\"><div class=\"prescript-k\">".concat(escapeHTML(L("gemRudhSection", lang)), "</div><div class=\"prescript-v\">General Prescription</div><div class=\"prescript-line\">Wear a yellow sapphire (Jupiter) on Thursday or a pearl (Moon) on Monday after consulting a jeweler. Chant 'Om Namah Shivaya' daily.</div></div>");
    return "\n".concat(PAGE_CHROME(L("gemRudhSection", lang), lang, pageNumber, data), "\n<div class=\"prescript-grid\">").concat(prescriptRows, "</div>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * PAGE — Current Dasha deep dive: highlights the running Maha Dasha window and
 * the remaining Vimshottari cycle. Returns "" when no dasha data exists.
 */
var buildCurrentDashaPage = function (data, lang, pageNumber) {
    var year = new Date().getFullYear();
    var cycle = vimshottariCycle(data, year);
    var current = currentDashaName(data, year);
    var focusCards = cycle
        .map(function (c) {
        var on = c.name.toLowerCase() === current.toLowerCase();
        return "<div class=\"dasha-focus".concat(on ? " active" : "", "\"><div class=\"k\">").concat(escapeHTML(localizePlanetName(c.name, lang)), "</div><div class=\"v\">").concat(c.from, "\u2013").concat(c.to, "</div>").concat(on ? " <span class=\"status-badge status-warn\">".concat(L("onDashaNow", lang), "</span>") : "", "</div>");
    })
        .join("");
    var active = activeDasha(data, year);
    var sub = (active === null || active === void 0 ? void 0 : active.subPeriod)
        ? "<p class=\"p\"><span class=\"section-title\">".concat(L("currAntardasha", lang), ":</span> ").concat(escapeHTML(active.subPeriod), " \u00B7 ").concat(L("activeWindow", lang), ": ").concat(active.startYear, "\u2013").concat(active.endYear, "</p>")
        : "";
    return "\n".concat(PAGE_CHROME(L("currDashaTitle", lang), lang, pageNumber, data), "\n<div class=\"dasha-focus-row\">").concat(focusCards, "</div>\n").concat(sub, "\n<p class=\"note\">").concat(escapeHTML(L("currentRemark", lang)), "</p>\n<div class=\"divider\"></div>\n<h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">").concat(L("dashaCycle", lang), "</h2>\n<ul class=\"dasha-cycle\">").concat(cycle.map(function (c) { return "<li".concat(c.name.toLowerCase() === current.toLowerCase() ? " class=\"active\"" : "", "><span>").concat(escapeHTML(localizePlanetName(c.name, lang)), "</span><span>").concat(c.from, "\u2013").concat(c.to, "</span></li>"); }).join(""), "</ul>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * PAGE — Manglik / Sade Sati tracker: two side-by-side trackers with the active
 * phase highlighted and house-by-house Mars placement. Returns "" when neither
 * Mars nor Moon data exists.
 */
var buildManglikSadeTrackerPage = function (data, lang, pageNumber) {
    var mars = findPlanet(data, "Mars");
    var moon = findPlanet(data, "Moon");
    var sat = findPlanet(data, "Saturn");
    var doshaHouses = [1, 2, 4, 7, 8, 12];
    var manglikHouse = mars && doshaHouses.includes(houseNum(mars)) ? houseNum(mars) : 0;
    var manglik = manglikHouse > 0;
    var manglikRows = mars
        ? doshaHouses
            .map(function (h) {
            var placing = (data.planetaryPositions || []).filter(function (p) { return houseNum(p) === h; });
            var hasMars = placing.some(function (p) { return canonPlanet(p.body) === canonPlanet("Mars"); });
            var rowStyle = hasMars ? " style=\"background:#fef3c7\"" : "";
            return "<tr".concat(rowStyle, "><td>").concat(h, "</td><td>").concat(placing.map(function (p) { return escapeHTML(localizePlanetName(p.body, lang)); }).join(", ") || "—", "</td><td>").concat(hasMars ? "●" : "—", "</td></tr>");
        })
            .join("")
        : "<tr><td colspan=\"3\">Mars data unavailable</td></tr>";
    var satiPhaseIndex = (function () {
        if (!moon || !sat)
            return -1;
        var m = houseNum(moon);
        var s = houseNum(sat);
        if (m === s)
            return 1; // Phase 2
        if (m === (s % 12) + 1)
            return 2; // Phase 3 (2nd from Saturn)
        if (m === ((s + 10) % 12) + 1)
            return 0; // Phase 1 (12th from Saturn)
        return -1;
    })();
    var satiPhaseLabels = [
        "satiPhase1", "satiPhase2", "satiPhase3",
    ];
    var satiPhaseLabel = function (idx) {
        return idx >= 0 ? satiPhaseLabels[idx] : undefined;
    };
    var satiActiveLabel = satiPhaseLabel(satiPhaseIndex);
    var satiRows = (moon && sat)
        ? (satiPhaseIndex >= 0 && satiActiveLabel
            ? "<tr style=\"background:#eff6ff\"><td>".concat(escapeHTML(L(satiActiveLabel, lang)), "</td><td>").concat(L("activePhase", lang), "</td></tr>")
            : "")
        : "<tr><td colspan=\"2\">Requires Moon and Saturn positions</td></tr>";
    return "\n".concat(PAGE_CHROME(L("manglikSadeTitle", lang), lang, pageNumber, data), "\n<p class=\"p\">").concat(escapeHTML(L("manglik", lang)), ": <strong>").concat(manglik ? "".concat(L("manglikYes", lang), " (").concat(L("houseWord", lang), " ").concat(manglikHouse, ")") : L("manglikNo", lang), "</strong> \u00B7 ").concat(L("sadeSati", lang), ": ").concat(satiActiveLabel ? L(satiActiveLabel, lang) : L("noSadeSati", lang), "</p>\n<div class=\"tracker-grid\">\n  <div class=\"tracker-box\">\n    <div class=\"tracker-title\">").concat(L("manglikTracker", lang), "</div>\n    <table class=\"tracker-table\"><tr><th>").concat(L("maleficKarm", lang), "</th><th>").concat(L("planet", lang), "</th><th>\u25CF</th></tr>").concat(manglikRows, "</table>\n  </div>\n  <div class=\"tracker-box\">\n    <div class=\"tracker-title\">").concat(L("satiTracker", lang), "</div>\n    <table class=\"tracker-table\"><tr><th>").concat(L("sadeSati", lang), "</th><th>").concat(L("phaseStart", lang), "</th></tr>").concat(satiRows, "</table>\n  </div>\n</div>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * PAGE — 120-Year Vimshottari Maha Dasha master table. Renders the full 9-period
 * cycle with year spans; returns "" when there is no dasha data at all.
 */
var buildDashaMasterPage = function (data, lang, pageNumber) {
    var year = new Date().getFullYear();
    var cycle = vimshottariCycle(data, year);
    var current = currentDashaName(data, year);
    var rows = cycle
        .map(function (c, i) {
        var on = c.name.toLowerCase() === current.toLowerCase();
        var rowStyle = on ? " style=\"background:#eff6ff\"" : "";
        return "<tr".concat(rowStyle, "><td>").concat(i + 1, "</td><td>").concat(escapeHTML(localizePlanetName(c.name, lang)), "</td><td>").concat(c.years, "</td><td>").concat(c.from, "</td><td>").concat(c.to, "</td>").concat(on ? "<td>".concat(L("onDashaNow", lang), "</td>") : "", "</tr>");
    })
        .join("");
    return "\n".concat(PAGE_CHROME(L("dashaMasterTitle", lang), lang, pageNumber, data), "\n<p class=\"note\">").concat(escapeHTML(L("vimshottari", lang)), " \u00B7 ").concat(escapeHTML(L("dashaMasterTitle", lang)), "</p>\n<table class=\"table-0\">\n<tr><th>").concat(L("seqNo", lang), "</th><th>").concat(L("mahaDashaCol", lang), "</th><th>").concat(L("mahaYears", lang), "</th><th>").concat(L("fromYear", lang), "</th><th>").concat(L("toYear", lang), "</th><th></th></tr>\n").concat(rows, "\n</table>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
/**
 * FINAL SHEET — guarded appendix: Phal-Deepika references + scorecard + a
 * one-line closing note. Omitted entirely when neither dataset exists,
 * replacing the old boilerplate standalone Summary sheet.
 */
var buildAppendixSummaryPage = function (data, lang, pageNumber) {
    var refs = data.kalpurushaPhalDeepikaRefs || [];
    var score = data.scorecard || [];
    var hasContent = refs.length > 0 || score.length > 0;
    if (!hasContent) {
        var generatedDate = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US");
        return "\n".concat(PAGE_CHROME(L("references", lang), lang, pageNumber, data), "\n<div class=\"section-block\">\n<h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML("Report Summary"), "</h2>\n<p>This report is based on Lahiri Ayanamsa Vedic calculations. For personalized guidance, consult a certified Jyotish practitioner.</p>\n<p class=\"note\">").concat(escapeHTML((0, translations_1.getTranslation)(lang, "pdf.template.generatedOn", { date: generatedDate })), "</p>\n</div>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
    }
    var refItems = refs
        .map(function (ref) { return "<div style=\"margin-bottom:0.18cm;\"><span class=\"section-title\">".concat(escapeHTML(ref.verse), "</span><p class=\"p ").concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(ref.interpretation), "</p></div>"); })
        .join("");
    var scoreRows = score
        .map(function (s) { return "<tr><td>".concat(escapeHTML(s.parameter), "</td><td><span class=\"score-text\">").concat(s.score, "/").concat(s.maxScore, "</span></td><td><div class=\"score-bar\"><div class=\"score-fill\" style=\"width:").concat(Math.min(100, Math.max(0, (s.score / s.maxScore) * 100)), "%\"></div></div></td></tr>"); })
        .join("");
    return "\n".concat(PAGE_CHROME(L("references", lang), lang, pageNumber, data), "\n").concat(refItems ? "<div class=\"section-block\">\n<h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("references", lang), "</h2>\n").concat(refItems, "\n</div>") : "", "\n").concat(scoreRows ? "<div class=\"section-block\">\n<h2 class=\"h2 ".concat(lang === "en" ? "en" : "", "\">").concat(L("scorecard", lang), "</h2>\n<table class=\"table-0\">\n<tr><th>").concat(L("parameter", lang), "</th><th>").concat(L("score", lang), "</th><th></th></tr>\n").concat(scoreRows, "\n</table>\n</div>") : "", "\n<p class=\"note\">").concat(escapeHTML((0, translations_1.getTranslation)(lang, "pdf.template.generatedOn", { date: new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US") })), "</p>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
// ─── AI Life-Pillar appendix (pages 21+) ───────────────────────────────────
// Each narrative becomes its own localized A4 page appended after the
// deterministic Summary. With all six pillars present the report reaches the
// full "25-page" edition (20 base + up to 6 appendix pages).
var OUTCOME_TAG_COLOR = {
    positive: "#059669",
    neutral: "#6b7280",
    caution: "#d97706",
};
var buildNarrativePage = function (n, data, lang, pageNumber) {
    var _a;
    var title = lang === "hi" ? n.titleHi || n.titleEn : n.titleEn || n.titleHi;
    var narrative = lang === "hi" ? n.narrativeHi || n.narrativeEn : n.narrativeEn || n.narrativeHi;
    var badges = n.badges || {};
    var badgeCells = [
        badges.score,
        badges.timeframe,
        badges.lord,
    ].filter(Boolean);
    var badgeHtml = badgeCells.length
        ? "<p class=\"p\"><span class=\"tag paid\">".concat(badgeCells.map(function (b) { return escapeHTML(b); }).join('</span> <span class="tag paid">'), "</span></p>")
        : "";
    var milestoneRows = (n.milestones || [])
        .map(function (m) {
        var outcomeDot = m.outcome
            ? " <span style=\"color:".concat(OUTCOME_TAG_COLOR[m.outcome] || "#6b7280", ";font-weight:700;\">\u25CF</span>")
            : "";
        return "<tr><td>".concat(escapeHTML(m.period), "</td><td>").concat(escapeHTML(m.event)).concat(outcomeDot, "</td><td>").concat(escapeHTML(m.note || "-"), "</td></tr>");
    })
        .join("");
    var milestonesHtml = ((_a = n.milestones) === null || _a === void 0 ? void 0 : _a.length)
        ? "\n<div class=\"divider\"></div>\n<h2 class=\"".concat(lang === "en" ? "en" : "", "\">").concat(escapeHTML(L("milestones", lang)), "</h2>\n<table class=\"table-0\">\n<tr><th>").concat(L("period", lang), "</th><th>").concat(L("event", lang), "</th><th>").concat(L("note", lang), "</th></tr>\n").concat(milestoneRows, "\n</table>")
        : "";
    return "\n".concat(PAGE_CHROME(title, lang, pageNumber, data), "\n<p class=\"note\">").concat(escapeHTML(L("appendix", lang)), "</p>\n<h1 class=\"").concat(lang === 'en' ? 'en' : '', "\">").concat(escapeHTML(title), "</h1>\n").concat(badgeHtml, "\n<h2 class=\"").concat(lang === 'en' ? 'en' : '', "\">").concat(L("domainInsights", lang), "</h2>\n<p class=\"p").concat(lang === "en" ? " en" : "", "\" style=\"font-size:10pt;\">").concat(escapeHTML(narrative), "</p>\n").concat(milestonesHtml, "\n<p class=\"note\">").concat(escapeHTML(L("aiNote", lang)), "</p>\n").concat(PAGE_FOOTER(pageNumber, lang), "\n");
};
// ─── NEW PAGE TYPES ────────────────────────────────────────────────────────
// These pages are guaranteed to render for every birth chart since they use
// deterministic planetary/house data, not AI-generated content.
/**
 * PAGE — Planetary status table showing each planet's sign, house, degree,
 * retrograde status, and sign lord. Uses deterministic planetaryPositions data.
 */
var buildPlanetaryStatusPage = function (data, lang, pageNumber) {
    var planetRows = (data.planetaryPositions || [])
        .map(function (p) {
        var signIndex = (0, astrologyDictionary_1.getSignIndex)(p.sign);
        var signLord = astrologyDictionary_1.SIGN_LORDS[signIndex] || "Moon";
        return "<tr>\n          <td>".concat(escapeHTML(localizePlanetName(p.body, lang)), "</td>\n          <td>").concat(escapeHTML(localizeSignName(p.sign, lang)), "</td>\n          <td>").concat(escapeHTML(p.house), "</td>\n          <td>").concat(escapeHTML(p.degree), "</td>\n          <td>").concat(p.retro ? "R" : "-", "</td>\n          <td>").concat(escapeHTML(signLord), "</td>\n        </tr>");
    })
        .join("");
    return "\n      ".concat(PAGE_CHROME("Planetary Status", lang, pageNumber, data), "\n      <div class=\"section-block\">\n        <h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">Planetary Positions</h2>\n        <table class=\"table-0\">\n          <tr>\n            <th>").concat(L("planet", lang), "</th>\n            <th>").concat(L("sign", lang), "</th>\n            <th>").concat(L("house", lang), "</th>\n            <th>").concat(L("degree", lang), "</th>\n            <th>").concat(L("retrograde", lang), "</th>\n            <th>").concat(L("signLord", lang), "</th>\n          </tr>\n          ").concat(planetRows || "<tr><td colspan=\"6\">No planetary data available</td></tr>", "\n        </table>\n      </div>\n      ").concat(PAGE_FOOTER(pageNumber, lang), "\n    ");
};
/**
 * PAGE — Bhava lords table showing which planet rules each house,
 * the sign of each house, and which planets occupy each house.
 */
var buildBhavaLordsPage = function (data, lang, pageNumber) {
    var _a, _b;
    // Build house-to-planet mapping from planetary positions
    var housePlanets = {};
    (data.planetaryPositions || []).forEach(function (p) {
        var houseNum = parseInt(p.house, 10);
        if (!isNaN(houseNum) && houseNum >= 1 && houseNum <= 12) {
            var signIndex = (0, astrologyDictionary_1.getSignIndex)(p.sign);
            var houseLord = astrologyDictionary_1.SIGN_LORDS[signIndex] || "Moon";
            if (!housePlanets[houseNum])
                housePlanets[houseNum] = [];
            housePlanets[houseNum].push(p.body);
        }
    });
    var houseRows = Object.entries(housePlanets)
        .map(function (_a) {
        var _b, _c;
        var houseNum = _a[0], planets = _a[1];
        var signIndex = (0, astrologyDictionary_1.getSignIndex)(((_c = (_b = data.houseCusps) === null || _b === void 0 ? void 0 : _b.find(function (c) { return c.house === houseNum; })) === null || _c === void 0 ? void 0 : _c.sign) || "1");
        var houseLord = astrologyDictionary_1.SIGN_LORDS[signIndex] || "Moon";
        var planetList = planets.length > 0 ? planets.join(", ") : "—";
        return "<tr>\n          <td>".concat(houseNum, "</td>\n          <td>").concat(escapeHTML(localizeSignName(signIndex, lang)), "</td>\n          <td>").concat(escapeHTML(houseLord), "</td>\n          <td>").concat(escapeHTML(planetList), "</td>\n        </tr>");
    })
        .join("");
    var _loop_1 = function (i) {
        if (!housePlanets[i]) {
            var signIndex = (0, astrologyDictionary_1.getSignIndex)(((_b = (_a = data.houseCusps) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.house === i; })) === null || _b === void 0 ? void 0 : _b.sign) || "1");
            var houseLord = astrologyDictionary_1.SIGN_LORDS[signIndex] || "Moon";
            houseRows.push("<tr><td>".concat(i, "</td><td>").concat(escapeHTML(localizeSignName(signIndex, lang)), "</td><td>").concat(escapeHTML(houseLord), "</td><td>\u2014</td></tr>"));
        }
    };
    // Add houses with no planets
    for (var i = 1; i <= 12; i++) {
        _loop_1(i);
    }
    return "\n      ".concat(PAGE_CHROME("Bhava Lords", lang, pageNumber, data), "\n      <div class=\"section-block\">\n        <h2 class=\"h2 ").concat(lang === "en" ? "en" : "", "\">House Lords & Planets</h2>\n        <table class=\"table-0\">\n          <tr>\n            <th>").concat(L("house", lang), "</th>\n            <th>").concat(L("sign", lang), "</th>\n            <th>").concat(L("bhavaLord", lang), "</th>\n            <th>").concat(L("planets", lang), "</th>\n          </tr>\n          ").concat(houseRows || "<tr><td colspan=\"4\">No house data available</td></tr>", "\n        </table>\n      </div>\n      ").concat(PAGE_FOOTER(pageNumber, lang), "\n    ");
};
function generateReportHtml(reportData, language) {
    var lang = language;
    var pageNo = 0;
    var pages = [];
    // Only non-empty sheets enter the document — blank placeholder pages
    // (empty remedies / gochar-style fillers) can never leak into the PDF.
    var push = function (html) {
        if (html && html.trim())
            pages.push(html);
    };
    /* Sheet 1 — Nativity + Panchang + D1 diamond chart + planetary table.
       Absorbs the old standalone cover sheet. */
    push(buildNativityPanchangChartPage(reportData, lang, ++pageNo));
    /* Sheet 2 — House cusps + D9 Navamsa chart + Ashtakavarga grid. */
    push(buildHousesNavamsaAshtakavargaPage(reportData, lang, ++pageNo));
    /* Sheet 3 — Dashas + yogas + remedies (skipped when all three are empty). */
    var coreSheet = buildDashaYogasRemediesPage(reportData, lang, pageNo + 1);
    if (coreSheet) {
        pageNo += 1;
        pages.push(coreSheet);
    }
    // Dense dual-domain pages — Career+Wealth and Marriage+Health (plus
    // Education+Family when present) each share ONE A4 sheet instead of one
    // sparse page per domain. Only pairs carrying real predictions are emitted.
    var domainPairs = [
        ["career", "wealth"],
        ["marriage", "health"],
        ["education", "family"],
    ];
    domainPairs.forEach(function (_a) {
        var _b, _c, _d, _e;
        var keyA = _a[0], keyB = _a[1];
        var domA = reportData.domainInsights.find(function (d) { return d.domain === keyA; });
        var domB = reportData.domainInsights.find(function (d) { return d.domain === keyB; });
        if ((((_c = (_b = domA === null || domA === void 0 ? void 0 : domA.prediction) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0) > 20) || (((_e = (_d = domB === null || domB === void 0 ? void 0 : domB.prediction) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0) > 20)) {
            push(buildLifeDomainsPage([keyA, keyB], [domA, domB].filter(function (d) { return Boolean(d); }), reportData, lang, ++pageNo));
        }
    });
    // ── New premium detail pages (only rendered when their data exists) ──
    push(buildYogasDoshasPage(reportData, lang, ++pageNo));
    push(buildRemedyPrescriptPage(reportData, lang, ++pageNo));
    push(buildCurrentDashaPage(reportData, lang, ++pageNo));
    push(buildManglikSadeTrackerPage(reportData, lang, ++pageNo));
    push(buildDashaMasterPage(reportData, lang, ++pageNo));
    push(buildPlanetaryStatusPage(reportData, lang, ++pageNo));
    push(buildBhavaLordsPage(reportData, lang, ++pageNo));
    // Guarded appendix — references + scorecard + closing summary on one sheet.
    var appendix = buildAppendixSummaryPage(reportData, lang, pageNo + 1);
    if (appendix) {
        pageNo += 1;
        pages.push(appendix);
    }
    // AI Life-Pillar appendix — one dense localized page per provided narrative.
    (reportData.narratives || []).forEach(function (n) {
        return pages.push(buildNarrativePage(n, reportData, lang, ++pageNo));
    });
    console.log("[PDF Template] Total pages generated: ".concat(pages.length));
    return "\n<!DOCTYPE html>\n<html lang=\"".concat(lang, "\">\n<head>\n<meta charset=\"UTF-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n<title>").concat(L("title", lang), "</title>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"/>\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin/>\n<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap\" rel=\"stylesheet\"/>\n<style>\n").concat(CSS, "\n</style>\n</head>\n<body>\n").concat(pages.join(""), "\n</body>\n</html>\n").trim();
}
exports.PDF_HTML_TEMPLATE_VERSION = "2.1.0";
