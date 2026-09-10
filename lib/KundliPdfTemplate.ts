// lib/KundliPdfTemplate.ts — Generates a self-contained HTML string for the
// Kundli PDF report. Used by /api/kundli-tool/generate with html-pdf-lite.
//
// This replaces @react-pdf/renderer and pdfkit entirely, eliminating bundling
// and font path issues on Vercel.

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: string;
  house: number;
  retrograde: boolean;
  nakshatra?: string;
}

export interface HouseCusp {
  house: number;
  sign: string;
}

export interface ChartSlice {
  lagna: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: PlanetPosition[];
  houses: HouseCusp[];
}

export interface DoshaItem {
  name: string;
  isPresent: boolean;
  severity?: "low" | "moderate" | "high";
  description: string;
  remedies: string[];
}

export interface YogaItem {
  name: string;
  isPresent: boolean;
  strength?: "weak" | "moderate" | "strong";
  description: string;
  impact?: string;
  planets?: string[];
}

export interface Antardasha {
  planet: string;
  startDate: string;
  endDate: string;
}

export interface Mahadasha {
  lord: string;
  startDate: string;
  endDate: string;
  years: number;
  antardashas: Antardasha[];
}

export interface VimshottariReport {
  mahadashas: Mahadasha[];
  currentDasha: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  birthMahadasha: string;
}

export interface PillarMilestone {
  period: string;
  event: string;
  note?: string;
  outcome?: "positive" | "neutral" | "caution";
}

export interface LifePillar {
  key: string;
  titleEn: string;
  titleHi?: string;
  badges?: { score?: string; timeframe?: string; lord?: string };
  narrativeEn: string;
  narrativeHi?: string;
  milestones: PillarMilestone[];
}

export interface KundliPdfData {
  name: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: ChartSlice;
  calculations: {
    vimshottari?: VimshottariReport;
    doshas?: DoshaItem[];
    yogas?: YogaItem[];
  };
  pillars: LifePillar[];
  language?: "en" | "hi";
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function txt(s: unknown): string {
  const v = String(s ?? "").trim();
  return v ? esc(v) : "—";
}

const CSS = `
  <style>
    @page { size: A4; margin: 15mm 12mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1a1a2e;
      margin: 0;
      padding: 0;
    }
    .page-break { page-break-after: always; break-after: page; }
    .cover { text-align: center; padding-top: 120px; }
    .cover h1 { font-size: 28pt; color: #2c3e50; margin-bottom: 8px; }
    .cover .subtitle { font-size: 14pt; color: #7f8c8d; margin-bottom: 40px; }
    .cover .name { font-size: 22pt; color: #1a1a2e; font-weight: bold; margin-bottom: 30px; }
    .cover .details { font-size: 11pt; color: #4a4a6a; line-height: 2; }
    .section-title {
      font-size: 16pt;
      color: #2c3e50;
      font-weight: bold;
      border-bottom: 2px solid #3498db;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .sub-title {
      font-size: 12pt;
      color: #34495e;
      font-weight: bold;
      margin-top: 14px;
      margin-bottom: 6px;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9pt; }
    th, td { border: 1px solid #bdc3c7; padding: 5px 8px; text-align: left; vertical-align: top; }
    th { background-color: #ecf0f1; font-weight: bold; color: #2c3e50; }
    tr:nth-child(even) { background-color: #f8f9fa; }
    .card {
      background: #f8f9fa;
      border-left: 3px solid #3498db;
      padding: 10px 14px;
      margin-bottom: 12px;
      border-radius: 0 4px 4px 0;
    }
    .card-title { font-weight: bold; font-size: 11pt; color: #2c3e50; margin-bottom: 6px; }
    .narrative { text-align: justify; margin-bottom: 10px; }
    .badge {
      display: inline-block;
      background: #3498db;
      color: #fff;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 8pt;
      margin-right: 4px;
    }
    .badge-score { background: #27ae60; }
    .badge-timeframe { background: #e67e22; }
    .badge-lord { background: #9b59b6; }
    .outcome-positive { color: #27ae60; font-weight: bold; }
    .outcome-neutral { color: #7f8c8d; font-weight: bold; }
    .outcome-caution { color: #e74c3c; font-weight: bold; }
    .dosha-present { color: #e74c3c; font-weight: bold; }
    .dosha-absent { color: #27ae60; }
    .yoga-present { color: #27ae60; font-weight: bold; }
    .yoga-absent { color: #95a5a6; }
    .footer {
      text-align: center;
      font-size: 8pt;
      color: #95a5a6;
      margin-top: 20px;
      border-top: 1px solid #ecf0f1;
      padding-top: 8px;
    }
    ul { padding-left: 18px; }
    li { margin-bottom: 3px; }
  </style>
`;

/**
 * Generates a complete, self-contained HTML string for the Kundli PDF report.
 * Uses inline CSS and basic HTML tables for reliable rendering with html-pdf-lite.
 */
export function generateKundliHtml(data: KundliPdfData, lang: "en" | "hi" = "en"): string {
  const d = data;
  const isHi = lang === "hi";
  const chart = d.chartData;
  const calc = d.calculations;

  // ── Cover page ──────────────────────────────────────────────────────────────
  let html = `<!DOCTYPE html>
<html lang="${isHi ? "hi" : "en"}">
<head>
  <meta charset="UTF-8">
  <title>Kundli Report - ${txt(d.name)}</title>
  ${CSS}
</head>
<body>
  <div class="cover page-break">
    <h1>${isHi ? "वैदिक कुंडली रिपोर्ट" : "Vedic Kundli Report"}</h1>
    <div class="subtitle">${isHi ? "AstroSage AI द्वारा निर्मित" : "Generated by AstroSage AI"}</div>
    <div class="name">${txt(d.name)}</div>
    <div class="details">
      <strong>${isHi ? "जन्म तिथि" : "Birth Date"}:</strong> ${txt(d.birthDate)}<br>
      <strong>${isHi ? "जन्म समय" : "Birth Time"}:</strong> ${txt(d.birthTime)}<br>
      <strong>${isHi ? "अक्षांश" : "Latitude"}:</strong> ${txt(d.latitude)}<br>
      <strong>${isHi ? "देशांतर" : "Longitude"}:</strong> ${txt(d.longitude)}<br>
      <strong>${isHi ? "समय क्षेत्र" : "Timezone"}:</strong> ${txt(d.timezone)}<br>
      <br>
      <strong>${isHi ? "लग्न" : "Ascendant"}:</strong> ${txt(chart.lagna)}<br>
      <strong>${isHi ? "चंद्र राशि" : "Moon Sign"}:</strong> ${txt(chart.moonSign)}<br>
      <strong>${isHi ? "सूर्य राशि" : "Sun Sign"}:</strong> ${txt(chart.sunSign)}<br>
      <strong>${isHi ? "नक्षत्र" : "Nakshatra"}:</strong> ${txt(chart.nakshatra)}
    </div>
  </div>
`;
  // ── Planet positions ─────────────────────────────────────────────────────────
  html += `
  <div class="page-break">
    <h2 class="section-title">${isHi ? "ग्रह स्थिति" : "Planet Positions"}</h2>
    <table>
      <thead>
        <tr>
          <th>${isHi ? "ग्रह" : "Planet"}</th>
          <th>${isHi ? "राशि" : "Sign"}</th>
          <th>${isHi ? "डिग्री" : "Degree"}</th>
          <th>${isHi ? "भाव" : "House"}</th>
          <th>${isHi ? "नक्षत्र" : "Nakshatra"}</th>
          <th>${isHi ? "वक्री" : "Retrograde"}</th>
        </tr>
      </thead>
      <tbody>
`;
  for (const p of chart.planets) {
    html += `
        <tr>
          <td>${txt(p.name)}</td>
          <td>${txt(p.sign)}</td>
          <td>${txt(p.degree)}</td>
          <td>${txt(p.house)}</td>
          <td>${txt(p.nakshatra)}</td>
          <td>${p.retrograde ? (isHi ? "हाँ" : "Yes") : (isHi ? "नहीं" : "No")}</td>
        </tr>`;
  }
  html += `
      </tbody>
    </table>
  </div>
`;

  // ── Houses ──────────────────────────────────────────────────────────────────
  html += `
  <div class="page-break">
    <h2 class="section-title">${isHi ? "भाव (12 घर)" : "Houses (12 Cusps)"}</h2>
    <table>
      <thead>
        <tr>
          <th>${isHi ? "भाव" : "House"}</th>
          <th>${isHi ? "राशि" : "Sign"}</th>
        </tr>
      </thead>
      <tbody>
`;
  for (const h of chart.houses) {
    html += `
        <tr>
          <td>${txt(h.house)}</td>
          <td>${txt(h.sign)}</td>
        </tr>`;
  }
  html += `
      </tbody>
    </table>
  </div>
`;

  // ── Life Pillars ─────────────────────────────────────────────────────────────
  for (const pillar of d.pillars) {
    const title = isHi && pillar.titleHi ? pillar.titleHi : pillar.titleEn;
    const narrative = isHi && pillar.narrativeHi ? pillar.narrativeHi : pillar.narrativeEn;
    const badges = pillar.badges || {};

    html += `
  <div class="page-break">
    <h2 class="section-title">${txt(title)}</h2>
    <div style="margin-bottom: 10px;">`;
    if (badges.score) html += `<span class="badge badge-score">${isHi ? "स्कोर" : "Score"}: ${txt(badges.score)}</span> `;
    if (badges.timeframe) html += `<span class="badge badge-timeframe">${isHi ? "समय" : "Timeframe"}: ${txt(badges.timeframe)}</span> `;
    if (badges.lord) html += `<span class="badge badge-lord">${isHi ? "अधिपति" : "Lord"}: ${txt(badges.lord)}</span>`;
    html += `
    </div>
    <p class="narrative">${txt(narrative)}</p>`;

    if (pillar.milestones && pillar.milestones.length > 0) {
      html += `
    <div class="sub-title">${isHi ? "मुख्य मोड़" : "Key Milestones"}</div>
    <table>
      <thead>
        <tr>
          <th>${isHi ? "अवधि" : "Period"}</th>
          <th>${isHi ? "घटना" : "Event"}</th>
          <th>${isHi ? "टिप्पणी" : "Note"}</th>
          <th>${isHi ? "परिणाम" : "Outcome"}</th>
        </tr>
      </thead>
      <tbody>`;
      for (const m of pillar.milestones) {
        const outcomeClass = m.outcome === "positive" ? "outcome-positive" : m.outcome === "caution" ? "outcome-caution" : "outcome-neutral";
        const outcomeText = m.outcome === "positive" ? (isHi ? "शुभ" : "Positive") : m.outcome === "caution" ? (isHi ? "सावधान" : "Caution") : (isHi ? "तटस्थ" : "Neutral");
        html += `
        <tr>
          <td>${txt(m.period)}</td>
          <td>${txt(m.event)}</td>
          <td>${txt(m.note)}</td>
          <td class="${outcomeClass}">${outcomeText}</td>
        </tr>`;
      }
      html += `
      </tbody>
    </table>`;
    }
    html += `
  </div>`;
  }

  // ── Doshas ───────────────────────────────────────────────────────────────────
  if (calc.doshas && calc.doshas.length > 0) {
    html += `
  <div class="page-break">
    <h2 class="section-title">${isHi ? "दोष विश्लेषण" : "Dosha Analysis"}</h2>`;
    for (const dosha of calc.doshas) {
      const statusClass = dosha.isPresent ? "dosha-present" : "dosha-absent";
      const statusText = dosha.isPresent ? (isHi ? "उपस्थित" : "Present") : (isHi ? "अनुपस्थित" : "Absent");
      html += `
    <div class="card">
      <div class="card-title">
        ${txt(dosha.name)} — <span class="${statusClass}">${statusText}</span>
        ${dosha.severity ? ` (${txt(dosha.severity)})` : ""}
      </div>
      <p class="narrative">${txt(dosha.description)}</p>`;
      if (dosha.remedies && dosha.remedies.length > 0) {
        html += `
      <div class="sub-title">${isHi ? "उपाय" : "Remedies"}</div>
      <ul>`;
        for (const r of dosha.remedies) {
          html += `<li>${txt(r)}</li>`;
        }
        html += `</ul>`;
      }
      html += `</div>`;
    }
    html += `
  </div>`;
  }

  // ── Yogas ────────────────────────────────────────────────────────────────────
  if (calc.yogas && calc.yogas.length > 0) {
    html += `
  <div class="page-break">
    <h2 class="section-title">${isHi ? "योग विश्लेषण" : "Yoga Analysis"}</h2>`;
    for (const yoga of calc.yogas) {
      const statusClass = yoga.isPresent ? "yoga-present" : "yoga-absent";
      const statusText = yoga.isPresent ? (isHi ? "उपस्थित" : "Present") : (isHi ? "अनुपस्थित" : "Absent");
      html += `
    <div class="card">
      <div class="card-title">
        ${txt(yoga.name)} — <span class="${statusClass}">${statusText}</span>
        ${yoga.strength ? ` (${txt(yoga.strength)})` : ""}
      </div>
      <p class="narrative">${txt(yoga.description)}</p>`;
      if (yoga.impact) {
        html += `<p><strong>${isHi ? "प्रभाव" : "Impact"}:</strong> ${txt(yoga.impact)}</p>`;
      }
      if (yoga.planets && yoga.planets.length > 0) {
        html += `<p><strong>${isHi ? "ग्रह" : "Planets"}:</strong> ${yoga.planets.map(p => txt(p)).join(", ")}</p>`;
      }
      html += `</div>`;
    }
    html += `
  </div>`;
  }

  // ── Dashas ───────────────────────────────────────────────────────────────────
  if (calc.vimshottari && calc.vimshottari.mahadashas && calc.vimshottari.mahadashas.length > 0) {
    html += `
  <div class="page-break">
    <h2 class="section-title">${isHi ? "विम्शोत्तरी दशा" : "Vimshottari Dasha"}></h2>`;

    // Current dasha
    const cd = calc.vimshottari.currentDasha;
    if (cd && cd.mahadasha) {
      html += `
    <div class="card">
      <div class="card-title">${isHi ? "वर्तमान दशा" : "Current Dasha"}</div>
      <strong>${isHi ? "महादशा" : "Mahadasha"}:</strong> ${txt(cd.mahadasha)}<br>
      <strong>${isHi ? "अंतर्दशा" : "Antardasha"}:</strong> ${txt(cd.antardasha)}<br>
      <strong>${isHi ? "अवधि" : "Period"}:</strong> ${txt(cd.startDate)} — ${txt(cd.endDate)}
    </div>`;
    }

    // Mahadasha table
    html += `
    <div class="sub-title">${isHi ? "महादशा क्रम" : "Mahadasha Sequence"}</div>
    <table>
      <thead>
        <tr>
          <th>${isHi ? "अधिपति" : "Lord"}</th>
          <th>${isHi ? "आरंभ" : "Start"}</th>
          <th>${isHi ? "अंत" : "End"}</th>
          <th>${isHi ? "वर्ष" : "Years"}</th>
        </tr>
      </thead>
      <tbody>`;
    for (const md of calc.vimshottari.mahadashas) {
      html += `
        <tr>
          <td>${txt(md.lord)}</td>
          <td>${txt(md.startDate)}</td>
          <td>${txt(md.endDate)}</td>
          <td>${txt(md.years)}</td>
        </tr>`;
    }
    html += `
      </tbody>
    </table>`;

    // Antardashas for each mahadasha
    for (const md of calc.vimshottari.mahadashas) {
      if (md.antardashas && md.antardashas.length > 0) {
        html += `
    <div class="sub-title">${txt(md.lord)} ${isHi ? "अंतर्दशाएं" : "Antardashas"}</div>
    <table>
      <thead>
        <tr>
          <th>${isHi ? "ग्रह" : "Planet"}</th>
          <th>${isHi ? "आरंभ" : "Start"}</th>
          <th>${isHi ? "अंत" : "End"}</th>
        </tr>
      </thead>
      <tbody>`;
        for (const ad of md.antardashas) {
          html += `
        <tr>
          <td>${txt(ad.planet)}</td>
          <td>${txt(ad.startDate)}</td>
          <td>${txt(ad.endDate)}</td>
        </tr>`;
        }
        html += `
      </tbody>
    </table>`;
      }
    }
    html += `
  </div>`;
  }

  // ── Closing ──────────────────────────────────────────────────────────────────
  html += `
  <div>
    <h2 class="section-title">${isHi ? "सारांश और मार्गदर्शन" : "Summary & Guidance"}</h2>
    <div class="card">
      <div class="card-title">${isHi ? "मुख्य बातें" : "Key Takeaways"}</div>
      <ul>
        <li>${isHi ? "आपका लग्न" : "Your Ascendant (Lagna) is"} ${txt(chart.lagna)}, ${isHi ? "जो आपके बाहरी व्यक्तित्व को आकार देता है" : "shaping your outward persona"}.</li>
        <li>${isHi ? "आपकी चंद्र राशि" : "Your Moon sign (Rashi) is"} ${txt(chart.moonSign)}, ${isHi ? "जो आपकी भावनात्मक प्रकृति का केंद्र है" : "the core of your emotional nature"}.</li>
        <li>${isHi ? "आपका जन्म नक्षत्र" : "Your birth Nakshatra is"} ${txt(chart.nakshatra)}.</li>
        <li>${isHi ? "नौ ग्रह और बारह भाव इस रिपोर्ट की नींव बनाते हैं" : "The nine planets and twelve houses form the foundation of this report"}.</li>
        <li>${isHi ? "छह जीवन-क्षेत्र स्तंभ प्रमुख जीवन क्षेत्रों में निर्देशन प्रदान करते हैं" : "Six life-domain pillars offer focused guidance across major life areas"}.</li>
        <li>${isHi ? "विम्शोत्तरी दशा समयरेखा 120-वर्षीय प्रमुख अवधि चक्र को दर्शाती है" : "The Vimshottari Dasha timeline maps the 120-year major-period cycle"}.</li>
      </ul>
    </div>
    <p class="narrative">
      ${isHi
        ? "वैदिक ज्योतिष आत्म-चिंतन का दर्पण है, नियतिवाद नहीं। दोष उपाय, योग अंतर्दृष्टि और दशा समय का उपयोग सचेत योजना के व्यावहारिक उपकरण के रूप में करें। यह रिपोर्ट केवल मार्गदर्शन और व्यक्तिगत अंतर्दृष्टि के लिए है और चिकित्सा, कानूनी या वित्तीय सलाह नहीं है।"
        : "Vedic astrology is a mirror for self-reflection, not a deterministic fate. Use the dosha remedies, yoga insights, and dasha timing as practical tools for mindful planning. This report is intended for guidance and personal insight only and does not constitute medical, legal, or financial advice."}
    </p>
    <div class="footer">
      ${isHi ? "AstroSage AI द्वारा निर्मित" : "Generated by AstroSage AI"} · ${isHi ? "लाहिरी अयांश (साइडियरल)" : "Lahiri Ayanamsa (Sidereal)"} · ${isHi ? "केवल मार्गदर्शन के लिए" : "For guidance only"}
    </div>
  </div>
`;

  html += `
</body>
</html>`;

  return html;
}

