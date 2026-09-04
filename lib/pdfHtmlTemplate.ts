// lib/pdfHtmlTemplate.ts
//
// Rich A4 Kundli PDF template that consumes the full `FullKundliReportData`
// payload from `/api/kundali/generate` (chartData, calculations, pillars,
// freeTier, paidTier). The primary entry point is `generatePdfHtml`.
//
// Backward-compatible exports (`ReportData`, `ReportNarrative`,
// `generateReportHtml`) are retained so callers of the older flattened
// contract still compile; `generateReportHtml` simply maps its flattened
// input onto the new rich `PdfData` shape and delegates to `generatePdfHtml`.

/** Rich data contract consumed by the new template. */
export interface PdfData {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: any;
  calculations: any;
  pillars: any[];
  freeTier: any;
  paidTier: any;
}

/** Legacy flattened contract — kept for backward compatibility. */
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
type Lang = "en" | "hi";

const SIGN_NAMES: string[] = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const SIGN_HI: Record<string, string> = {
  "Aries": "मेष", "Taurus": "वृष", "Gemini": "मिथुन", "Cancer": "कर्क",
  "Leo": "सिंह", "Virgo": "कन्या", "Libra": "तुला", "Scorpio": "वृश्चिक",
  "Sagittarius": "धनु", "Capricorn": "मकर", "Aquarius": "कुंभ", "Pisces": "मीन",
};

function escapeHTML(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Translate a sign to Hindi when lang is 'hi'. */
function getSign(sign: string, lang: Lang): string {
  if (!sign) return "";
  return lang === "hi" ? (SIGN_HI[sign] || sign) : sign;
}

/** Sign index (1-12) -> sign name helper. */
function signIndexName(idx: number): string {
  return SIGN_NAMES[(idx - 1 + 12) % 12] || "";
}

/**
 * Generate a rich, multi-page HTML document from the full Kundli report
 * payload returned by `/api/kundali/generate`. Inclusive of:
 *   - Title page (birth details, lagna/moon/sun)
 *   - Planetary positions table (from chartData.planets)
 *   - House lords table (from calculations.divisionalCharts.D1.houseCusps)
 *   - Dasha periods w/ antardashas (from calculations.vimshottari.mahadashas)
 *   - Dosha analysis (Mangal, Sade Sati, Kaal Sarp w/ remedies)
 *   - Yoga analysis (Gajakesari, Dhana yogas)
 *   - One page per life pillar (both EN + HI narratives + milestones)
 *   - Remedies & gemstones page
 *   - Report summary page
 */
export function generatePdfHtml(data: PdfData, lang: Lang = "en"): string {
  const { name, birthDate, birthTime, latitude, longitude, timezone, chartData, calculations, pillars, freeTier, paidTier } = data;
  const tHi = lang === "hi";
// ── Page 1: Title page ─────────────────────────────────────────────
  let html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  @page { margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Noto Sans', 'Devanagari', Arial, sans-serif;
    padding: 15px; background: #fff; color: #1a1a2e;
    font-size: 11px; line-height: 1.5;
  }
  .page { page-break-after: always; break-after: page; padding: 10px 5px; min-height: 100vh; }
  .page:last-child { page-break-after: auto; break-after: auto; }
  .title-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 90vh; }
  .title-page h1 { font-size: 28px; color: #1a1a2e; margin-bottom: 10px; }
  .title-page .subtitle { font-size: 18px; color: #4a4a6a; margin-bottom: 30px; }
  .title-page .details { background: #f5f5fa; padding: 20px 30px; border-radius: 8px; font-size: 13px; max-width: 400px; margin: 0 auto; }
  .title-page .details table { width: 100%; border-collapse: collapse; }
  .title-page .details td { padding: 4px 8px; border-bottom: 1px solid #e0e0e8; }
  .title-page .details td:first-child { font-weight: bold; width: 40%; }
  .section-title { font-size: 20px; color: #1a1a2e; border-bottom: 2px solid #6c63ff; padding-bottom: 6px; margin-bottom: 12px; }
  .badge { background: #6c63ff; color: white; padding: 4px 12px; border-radius: 12px; display: inline-block; font-size: 11px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 10px; }
  th { background: #f0f0f5; text-align: left; padding: 6px 8px; border: 1px solid #d0d0d8; font-weight: bold; }
  td { padding: 5px 8px; border: 1px solid #d0d0d8; }
  .narrative { margin: 8px 0; padding: 8px 12px; background: #f8f8fc; border-radius: 4px; font-size: 11px; line-height: 1.6; }
  .narrative-hi { font-family: 'Noto Sans Devanagari', 'Devanagari', sans-serif; margin: 8px 0; padding: 8px 12px; background: #f8f8fc; border-radius: 4px; font-size: 11px; line-height: 1.6; }
  .footer { margin-top: 20px; font-size: 9px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
  .remedy-list { list-style: none; padding: 0; }
  .remedy-list li { padding: 4px 8px; margin: 3px 0; background: #f0f8f0; border-radius: 4px; font-size: 10px; }
  .milestone-table td { font-size: 10px; }
  .milestone-table .outcome-positive { color: #2e7d32; }
  .milestone-table .outcome-neutral { color: #f57f17; }
</style>
</head>
<body>`;

  // ── PAGE 1: TITLE ──────────────────────────────────────
  html += `
  <div class="page title-page">
    <h1>✨ जन्म कुंडली विशद् विश्लेषण</h1>
    <div class="subtitle">${tHi ? "प्रीमियम रिपोर्ट" : "Premium Birth Chart Report"}</div>
    <h2 style="font-size: 24px; margin: 10px 0;">${escapeHTML(name)}</h2>
    <div class="details">
      <table>
        <tr><td>${tHi ? "क्लाइंट नाम" : "Client Name"}</td><td>${escapeHTML(name)}</td></tr>
        <tr><td>${tHi ? "चार्ट प्रकार" : "Chart Type"}</td><td>${tHi ? "उत्तर भारतीय" : "North Indian"}</td></tr>
        <tr><td>${tHi ? "जन्म विवरण" : "Birth Details"}</td><td>${escapeHTML(birthDate)} · ${escapeHTML(birthTime)}</td></tr>
        <tr><td>${tHi ? "समय क्षेत्र" : "Timezone"}</td><td>${escapeHTML(timezone)}</td></tr>
        <tr><td>${tHi ? "अक्षांश / द्वामांश" : "Lat / Long"}</td><td>${escapeHTML(String(latitude))}, ${escapeHTML(String(longitude))}</td></tr>
      </table>
    </div>
    <div style="margin-top: 30px; font-size: 12px; color: #888;">
      ${tHi ? "लग्न: " : "Ascendant: "} <strong>${getSign(chartData?.lagna || "", lang)}</strong>
      &nbsp;|&nbsp; ${tHi ? "चंद्र राशि: " : "Moon Sign: "} <strong>${getSign(chartData?.moonSign || chartData?.rashi || "", lang)}</strong>
      &nbsp;|&nbsp; ${tHi ? "सूर्य राशि: " : "Sun Sign: "} <strong>${getSign(chartData?.sunSign || "", lang)}</strong>
    </div>
  </div>`;
// ── PAGE 2: PLANET POSITIONS + HOUSE CUSPS ─────────────────────
  const planetRows = (chartData?.planets || []).map((p: any) => {
    let degree = String(p?.degree ?? "");
    if (typeof p?.longitude === "number" && !degree) {
      const d = Math.floor(p.longitude % 30);
      const m = Math.floor(((p.longitude % 30) - d) * 60);
      degree = `${d}°${String(m).padStart(2, "0")}'`;
    }
    return `
      <tr>
        <td>${escapeHTML(String(p?.name ?? ""))}</td>
        <td>${getSign(String(p?.sign ?? ""), lang)}</td>
        <td>${escapeHTML(degree)}</td>
        <td>${p?.house ?? ""}</td>
        <td>${p?.retrograde ? "✓" : "-"}</td>
      </tr>`;
  }).join("");

  // House cusps from D1 divisional chart
  const d1 = calculations?.divisionalCharts?.D1;
  const houseRows = (d1?.houseCusps || []).map((c: any) =>
    `<tr><td>${c?.house ?? ""}</td><td>${getSign(signIndexName(Number(c?.sign) || 1), lang)}</td></tr>`
  ).join("");

  // Fallback: derive house signs from chartData.houses when calculations missing
  const fallbackHouseRows = houseRows || (chartData?.houses || []).map((h: any) =>
    `<tr><td>${h?.house ?? ""}</td><td>${getSign(String(h?.sign ?? ""), lang)}</td></tr>`
  ).join("");

  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "🌍 ग्रह स्थिति" : "🌍 Planetary Positions"}</h2>
    <table>
      <tr>
        <th>${tHi ? "ग्रह" : "Planet"}</th><th>${tHi ? "राशि" : "Sign"}</th>
        <th>${tHi ? "डिग्री" : "Degree"}</th><th>${tHi ? "घर" : "House"}</th>
        <th>${tHi ? "तीनो" : "Retrograde"}</th>
      </tr>
      ${planetRows || "<tr><td colspan='5'>No planetary data available</td></tr>"}
    </table>
    <h2 class="section-title" style="margin-top: 20px;">${tHi ? "🏠 घर कस्स" : "🏠 House Cusps"}</h2>
    <table>
      <tr><th>${tHi ? "घर" : "House"}</th><th>${tHi ? "राशि" : "Sign"}</th></tr>
      ${fallbackHouseRows || "<tr><td colspan='2'>No house data available</td></tr>"}
    </table>
  </div>`;
// ── PAGE 3: DASHA PERIODS ─────────────────────────────────────
  const mahadashas = calculations?.vimshottari?.mahadashas || [];
  const dashaBlocks = mahadashas.map((d: any) => `
    <div style="margin-bottom: 12px;">
      <div style="font-weight: bold; background:#6c63ff; color:white; padding:4px 10px; border-radius:4px;">
        ${escapeHTML(String(d?.lord ?? ""))} Mahadasha (${escapeHTML(String(d?.startDate ?? ""))} - ${escapeHTML(String(d?.endDate ?? ""))})
      </div>
      <table style="font-size:9px;">
        <tr><th>${tHi ? "उप-अवधि" : "Sub-Period"}</th><th>${tHi ? "प्रारंभ" : "Start"}</th><th>${tHi ? "समाप्ति" : "End"}</th></tr>
        ${(d?.antardashas || []).map((a: any) => `
          <tr><td>${escapeHTML(String(a?.planet ?? ""))}</td><td>${escapeHTML(String(a?.startDate ?? ""))}</td><td>${escapeHTML(String(a?.endDate ?? ""))}</td></tr>
        `).join("")}
      </table>
    </div>
  `).join("");

  const currentDasha = calculations?.vimshottari?.currentDasha;

  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "📅 दशा अवधि" : "📅 Dasha Periods"}</h2>
    ${dashaBlocks || `<p class="narrative">${tHi ? "कोई दशा डेटा उपलब्ध नहीं है।" : "No dasha data available."}</p>`}
    ${currentDasha ? `
      <div style="background:#e8f5e9; padding:10px; border-radius:4px; margin-top:10px;">
        <strong>${tHi ? "वतमान अंतदशा:" : "Current Dasha:"}</strong>
        ${escapeHTML(String(currentDasha?.mahadasha ?? ""))} - ${escapeHTML(String(currentDasha?.antardasha ?? ""))}
        (${escapeHTML(String(currentDasha?.startDate ?? ""))} - ${escapeHTML(String(currentDasha?.endDate ?? ""))})
      </div>
    ` : ""}
  </div>`;
// ── PAGE 4: DOSHA ANALYSIS ─────────────────────────────────────
  const doshas = calculations?.doshas || {};
  const mangal = doshas?.mangal;
  const sadeSati = doshas?.sadeSati;
  const kaalSarp = doshas?.kaalSarp;

  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "⚠️ दोष विश्लेषण" : "⚠️ Dosha Analysis"}</h2>

    ${mangal && mangal?.isPresent ? `
      <h3 style="font-size:14px; margin:8px 0;">${tHi ? "मांगलिक दोष" : "Manglik Dosha"}</h3>
      <div class="narrative">${escapeHTML(String(mangal?.description ?? ""))}</div>
      <div style="margin:6px 0;">
        <strong>${tHi ? "गंभीरता:" : "Severity:"}</strong> ${escapeHTML(String(mangal?.severity ?? "unknown"))}
        ${mangal?.isNeutralized ? `(${tHi ? "न्यूट्रलाइज़्ड" : "Neutralized"})` : ""}
      </div>
      ${mangal?.remedies?.length ? `
        <strong>${tHi ? "उपाय:" : "Remedies:"}</strong>
        <ul class="remedy-list">
          ${mangal.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
        </ul>
      ` : ""}
    ` : ""}

    ${sadeSati && sadeSati?.isActive ? `
      <h3 style="font-size:14px; margin:12px 0 4px;">${tHi ? "साढे साती" : "Sade Sati"}</h3>
      <div class="narrative">${escapeHTML(String(sadeSati?.description ?? ""))}</div>
      <div style="margin:4px 0;">
        <strong>${tHi ? "चरण:" : "Phase:"}</strong> ${escapeHTML(String(sadeSati?.phase ?? "active"))}
        <br>
        <strong>${tHi ? "अवधि:" : "Period:"}</strong>
        ${escapeHTML(String(sadeSati?.activePeriod?.startDate ?? ""))} - ${escapeHTML(String(sadeSati?.activePeriod?.endDate ?? ""))}
      </div>
      ${sadeSati?.remedies?.length ? `
        <strong>${tHi ? "उपाय:" : "Remedies:"}</strong>
        <ul class="remedy-list">
          ${sadeSati.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
        </ul>
      ` : ""}
    ` : ""}

    ${kaalSarp && kaalSarp?.isPresent ? `
      <h3 style="font-size:14px; margin:12px 0 4px;">${tHi ? "काल सर्प दोष" : "Kaal Sarp Dosha"}</h3>
      <div class="narrative">${escapeHTML(String(kaalSarp?.description ?? ""))}</div>
      ${kaalSarp?.remedies?.length ? `
        <strong>${tHi ? "उपाय:" : "Remedies:"}</strong>
        <ul class="remedy-list">
          ${kaalSarp.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
        </ul>
      ` : ""}
    ` : ""}

    ${!mangal?.isPresent && !sadeSati?.isActive && !kaalSarp?.isPresent ? `
      <p class="narrative">${tHi ? "कोई महत्वपूर्ण दोष नहीं पाया गया।" : "No significant doshas detected."}</p>
    ` : ""}
  </div>`;
// ── PAGE 5: YOGA ANALYSIS ─────────────────────────────────────
  const yogas = calculations?.yogas || {};
  const gajakesari = yogas?.gajakesari;
  const dhanaYogas = Array.isArray(yogas?.dhanaYogas) ? yogas.dhanaYogas : [];

  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "✨ योग विश्लेषण" : "✨ Yoga Analysis"}</h2>

    ${gajakesari && gajakesari?.isPresent ? `
      <h3 style="font-size:14px; margin:8px 0;">${escapeHTML(String(gajakesari?.name ?? ""))}</h3>
      <div class="narrative">${escapeHTML(String(gajakesari?.description ?? ""))}</div>
      <div style="margin:4px 0;">
        <strong>${tHi ? "शक्ति:" : "Strength:"}</strong> ${escapeHTML(String(gajakesari?.strength ?? "present"))}
      </div>
    ` : ""}

    ${dhanaYogas.filter((y: any) => y?.isPresent !== false).map((y: any) => `
      <h3 style="font-size:14px; margin:12px 0 4px;">${escapeHTML(String(y?.name ?? ""))}</h3>
      <div class="narrative">${escapeHTML(String(y?.description ?? ""))}</div>
      <div style="font-size:10px; color:#555;">
        ${tHi ? "ग्रह:" : "Planets:"} ${Array.isArray(y?.planets) ? y.planets.join(", ") : ""}
      </div>
    `).join("")}

    ${!gajakesari?.isPresent && !dhanaYogas.length ? `
      <p class="narrative">${tHi ? "कोई महत्वपूर्ण योग नहीं पाया गया।" : "No significant yogas detected."}</p>
    ` : ""}
  </div>`;
// ── PAGES 6+: LIFE DOMAINS (PILLARS) ─────────────────────────
  (pillars || []).forEach((pillar: any) => {
    html += `
  <div class="page">
    <h2 class="section-title">${escapeHTML(String(pillar?.titleEn ?? ""))} (${escapeHTML(String(pillar?.titleHi ?? ""))})</h2>
    <div class="badge">
      ${escapeHTML(String(pillar?.badges?.score ?? ""))} ·
      ${escapeHTML(String(pillar?.badges?.timeframe ?? ""))} ·
      ${escapeHTML(String(pillar?.badges?.lord ?? ""))}
    </div>
    <div class="narrative">${escapeHTML(String(pillar?.narrativeEn ?? ""))}</div>
    <div class="narrative-hi">${escapeHTML(String(pillar?.narrativeHi ?? ""))}</div>
    ${Array.isArray(pillar?.milestones) && pillar.milestones.length ? `
      <h3 style="font-size:13px; margin:10px 0 4px;">${tHi ? "📌 प्रमुख मील के पत्थर" : "📌 Key Milestones"}</h3>
      <table class="milestone-table">
        <tr><th>${tHi ? "अवधि" : "Period"}</th><th>${tHi ? "घटना" : "Event"}</th><th>${tHi ? "टिप्पणी" : "Note"}</th></tr>
        ${pillar.milestones.map((m: any) => `
          <tr>
            <td>${escapeHTML(String(m?.period ?? ""))}</td>
            <td>${escapeHTML(String(m?.event ?? ""))}</td>
            <td>${escapeHTML(String(m?.note ?? ""))}</td>
          </tr>
        `).join("")}
      </table>
    ` : ""}
    <div class="footer">${tHi
      ? "यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।"
      : "This chapter is AI-assisted Vedic astrology guidance."}</div>
  </div>`;
  });
// ── NEXT-TO-LAST PAGE: REMEDIES & GEMSTONES ─────────────────
  const mangalRemedies = mangal?.remedies || [];
  const sadeSatiRemedies = sadeSati?.remedies || [];

  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "💎 रत्न एवं उपाय" : "💎 Gemstones & Remedies"}</h2>

    ${mangalRemedies.length ? `
      <h3 style="font-size:14px; margin:8px 0;">${tHi ? "मांगलिक दोष उपाय" : "Manglik Dosha Remedies"}</h3>
      <ul class="remedy-list">
        ${mangalRemedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
      </ul>
    ` : ""}

    ${sadeSatiRemedies.length ? `
      <h3 style="font-size:14px; margin:12px 0 4px;">${tHi ? "साढे साती उपाय" : "Sade Sati Remedies"}</h3>
      <ul class="remedy-list">
        ${sadeSatiRemedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
      </ul>
    ` : ""}

    ${kaalSarp?.remedies?.length ? `
      <h3 style="font-size:14px; margin:12px 0 4px;">${tHi ? "काल सर्प दोष उपाय" : "Kaal Sarp Remedies"}</h3>
      <ul class="remedy-list">
        ${kaalSarp.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join("")}
      </ul>
    ` : ""}

    <div style="margin-top:20px; padding:15px; background:#f0f4ff; border-radius:8px;">
      <h3 style="font-size:14px;">${tHi ? "🕉️ सामान्य उपाय" : "🕉️ General Remedies"}</h3>
      <ul class="remedy-list">
        <li>${tHi ? "प्रतिदिन गायत्री मंत्र का जाप करें।" : "Chant the Gayatri mantra daily."}</li>
        <li>${tHi ? "बुजुर्गों का सम्मान करें और अनुशासित दिनचर्या बनाए रखें।" : "Respect elders and maintain a disciplined daily routine."}</li>
      </ul>
    </div>
  </div>`;
// ── LAST PAGE: REPORT SUMMARY ────────────────────────────────
  html += `
  <div class="page">
    <h2 class="section-title">${tHi ? "📋 रिपोर्ट सारांश" : "📋 Report Summary"}</h2>
    <p>${tHi
      ? "यह रिपोर्ट लाहिरी अयनांश वैदिक गणना पर आधारित है। व्यक्तिगत मार्गदर्शन के लिए, एक प्रमाणित ज्योतिषी से परामर्श लें।"
      : "This report is based on Lahiri Ayanamsa Vedic calculations. For personalized guidance, consult a certified Jyotish practitioner."
    }</p>
    <p style="margin-top:10px; color:#888; font-size:10px;">
      ${tHi ? "जनरेट किया गया:" : "Generated on:"} ${new Date().toLocaleDateString()}
    </p>
    <p style="margin-top:20px; font-size:10px; color:#aaa; text-align:center;">
      ${tHi ? "धन्यवाद। शुभ भविष्य की कामना।" : "Thank you. Wishing you a bright future."}
    </p>
  </div>`;

  html += `
  </body>
  </html>`;

  return html;
}

export const PDF_HTML_TEMPLATE_VERSION = "5.0.0";
export const MIN_PROMISED_PAGES = 14;

// ─── Backward-compatible wrapper for callers of the old flattened ─────────
// `generateReportHtml(reportData, language)` contract. It maps the flattened
// ReportData onto the new rich PdfData shape that `generatePdfHtml` consumes.
export function generateReportHtml(
  reportData: ReportData,
  language: "en" | "hi" = "en"
): string {
  const bd = reportData.birthDetails || {
    date: "", time: "", latitude: "", longitude: "", timezone: "",
  };

  // Build chartData in the flat expected shape from the flattened ReportData
  const chartData = {
    lagna: bd.latitude && reportData.panchang?.lagna ? reportData.panchang.lagna : (reportData.domainInsights?.[0]?.domain || ""),
    rashi: reportData.panchang?.moonSign || "",
    moonSign: reportData.panchang?.moonSign || "",
    sunSign: reportData.panchang?.sunSign || "",
    planets: (reportData.planetaryPositions || []).map((p) => ({
      name: p.body,
      sign: p.sign,
      degree: p.degree,
      house: p.house,
      retrograde: Boolean(p.retro),
    })),
    houses: (reportData.houseCusps || []).map((h) => ({
      house: h.house,
      sign: h.sign,
    })),
  };

  // Build calculations in the expected shape from flattened data
  const calc: any = {};
  if (reportData.d9Chart) {
    calc.divisionalCharts = calc.divisionalCharts || {};
    calc.divisionalCharts.D9 = {
      chartType: "D9",
      ascendantSign: reportData.d9Chart.ascendantSign || 1,
      ascendantDegree: 0,
      planetCoordinates: (reportData.d9Chart.planets || []).map((p) => ({
        planet: p.planet,
        sign: p.sign,
        degree: 0,
        minute: 0,
        house: p.house,
        retrograde: p.retrograde,
      })),
    };
  }
  if (reportData.sarvashtakavarga) {
    calc.ashtakavarga = {
      sarvashtakavarga: reportData.sarvashtakavarga.bindus || [],
      bhinnashtakvarga: {},
      beneficialHouses: reportData.sarvashtakavarga.beneficialHouses || [],
    };
  }
  // Build doshas from flattened list
  if (reportData.doshas?.length) {
    calc.doshas = {};
    for (const d of reportData.doshas) {
      const lower = String(d.name || "").toLowerCase();
      if (lower.includes("mangal") || lower.includes("kuja") || lower.includes("मांगलिक")) {
        calc.doshas.mangal = {
          isPresent: true,
          severity: d.severity || "moderate",
          isNeutralized: Boolean(d.isNeutralized),
          description: d.description || "",
          remedies: [],
          bases: { lagna: {}, moon: {}, venus: {} },
          cancellations: [],
        };
      } else if (lower.includes("sade") || lower.includes("साढे") || lower.includes("शनि")) {
        calc.doshas.sadeSati = {
          isActive: true,
          phase: "active",
          activePeriod: null,
          description: d.description || "",
          remedies: [],
          moonSign: 0,
          saturnSignNow: 0,
          phaseRanges: {},
          dhaiya: { isActive: false, phase: "inactive", period: null },
        };
      } else if (lower.includes("kaal") || lower.includes("kal") || lower.includes("काल")) {
        calc.doshas.kaalSarp = {
          isPresent: true,
          description: d.description || "",
          remedies: [],
          RahuSign: 0,
          KetuSign: 0,
        };
      }
    }
  }
  // Build yogas from flattened list
  if (reportData.yogas?.length) {
    calc.yogas = {};
    for (const y of reportData.yogas) {
      if (calc.yogas.gajakesari?.isPresent) continue;
      if (String(y.name || "").toLowerCase().includes("gaja")) {
        calc.yogas.gajakesari = { name: y.name, isPresent: true, strength: "moderate", description: y.description };
      }
      if (!calc.yogas.dhanaYogas) calc.yogas.dhanaYogas = [];
      calc.yogas.dhanaYogas.push({ name: y.name, isPresent: true, description: y.description, planets: [], houses: [] });
    }
    if (!calc.yogas.dhanaYogas) calc.yogas.dhanaYogas = [];
  }

  const pdfData: PdfData = {
    name: reportData.clientName || "User",
    birthDate: bd.date || "",
    birthTime: bd.time || "",
    latitude: parseFloat(bd.latitude) || 0,
    longitude: parseFloat(bd.longitude) || 0,
    timezone: bd.timezone || "",
    chartData,
    calculations: calc,
    pillars: reportData.narratives || [],
    freeTier: {},
    paidTier: {},
  };

  return generatePdfHtml(pdfData, language);
}
