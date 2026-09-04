// lib/pdfHtmlTemplate.ts — rich, data-driven A4 report template.
//
// Rendered by `@react-pdf/renderer` (pure JavaScript, no native dependencies).
// Layout rules for this engine:
//   • Only the FIRST font-family in a CSS list is used — a single bundled face
//     ("Mukta", registered by the PDF route) covers Latin + Devanagari, so
//     mixed English/Hindi text renders without missing glyphs.
//   • No emoji/symbols outside the font's coverage (✓★… avoided; •, °, –,
//     ₹, Devanagari are verified present in Mukta).
//   • Page flow is automatic; `.page` sections force a break via
//     `page-break-after: always`. Long sections split cleanly across pages
//     instead of leaving blank space.

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
  language?: string;
}

export function generatePdfHtml(data: PdfData, lang: string = 'en'): string {
  const { name, birthDate, birthTime, latitude, longitude, timezone, chartData, calculations, pillars } = data;
  const isHi = lang === 'hi';

  const escapeHTML = (str: unknown): string => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const signNames: Record<string, string> = {
    'Aries': 'मेष', 'Taurus': 'वृष', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
    'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
    'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
  };

  const getSign = (sign: string) => isHi ? (signNames[sign] || sign) : sign;

  /** Safe text or an em-dash placeholder for empty values. */
  const txt = (value: unknown): string => {
    const s = String(value ?? '').trim();
    return s ? escapeHTML(s) : '-';
  };

  /** Split a (possibly multi-paragraph) narrative into escaped <p> blocks. */
  const paragraphs = (text: unknown, cls: string): string =>
    String(text ?? '')
      .split(/\r?\n\s*\r?\n|\r?\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => `<p class="${cls}">${escapeHTML(t)}</p>`)
      .join('');

  /** Bullet list from an array of strings/objects; '' when empty. */
  const bulletList = (items: unknown, cls = 'remedy-list'): string => {
    if (!Array.isArray(items) || items.length === 0) return '';
    return `<ul class="${cls}">${items
      .map((r) => `<li>${txt(typeof r === 'string' ? r : (r as any)?.description || (r as any)?.text || '')}</li>`)
      .join('')}</ul>`;
  };

  const SIGN_LIST = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const signFromNumber = (n: unknown): string => {
    const idx = Number(n);
    return idx >= 1 && idx <= 12 ? getSign(SIGN_LIST[idx - 1]) : txt(n);
  };

  const t = {
    premiumReport: isHi ? 'प्रीमियम रिपोर्ट' : 'Premium Report',
    client: isHi ? 'क्लाइंट नाम' : 'Client',
    birth: isHi ? 'जन्म' : 'Birth',
    timezone: isHi ? 'समय क्षेत्र' : 'Timezone',
    location: isHi ? 'स्थान' : 'Location',
    asc: isHi ? 'लग्न' : 'Asc',
    moon: isHi ? 'चंद्र' : 'Moon',
    sun: isHi ? 'सूर्य' : 'Sun',
    nakshatra: isHi ? 'नक्षत्र' : 'Nakshatra',
    planetsTitle: isHi ? 'ग्रह स्थिति' : 'Planet Positions',
    cuspsTitle: isHi ? 'घर कस्प' : 'House Cusps',
    planet: isHi ? 'ग्रह' : 'Planet',
    sign: isHi ? 'राशि' : 'Sign',
    degree: isHi ? 'डिग्री' : 'Degree',
    house: isHi ? 'घर' : 'House',
    retro: isHi ? 'वक्री' : 'Retro',
    dashaTitle: isHi ? 'दशा अवधि' : 'Dasha Periods',
    subPeriod: isHi ? 'उप-अवधि' : 'Sub-Period',
    start: isHi ? 'प्रारंभ' : 'Start',
    end: isHi ? 'समाप्ति' : 'End',
    currentDasha: isHi ? 'वर्तमान दशा' : 'Current Dasha',
    doshaTitle: isHi ? 'दोष विश्लेषण' : 'Dosha Analysis',
    severity: isHi ? 'गंभीरता' : 'Severity',
    remedies: isHi ? 'उपाय' : 'Remedies',
    yogasTitle: isHi ? 'योग विश्लेषण' : 'Yoga Analysis',
    strength: isHi ? 'शक्ति' : 'Strength',
    planetsInvolved: isHi ? 'संबंधित ग्रह' : 'Planets involved',
    milestones: isHi ? 'प्रमुख मील के पत्थर' : 'Key Milestones',
    period: isHi ? 'अवधि' : 'Period',
    event: isHi ? 'घटना' : 'Event',
    note: isHi ? 'टिप्पणी' : 'Note',
    remediesTitle: isHi ? 'रत्न एवं उपाय' : 'Gemstones & Remedies',
    generalRemedies: isHi ? 'सामान्य उपाय' : 'General Remedies',
    gemstones: isHi ? 'रत्न सुझाव' : 'Gemstone Suggestions',
    mantras: isHi ? 'दैनिक मंत्र' : 'Daily Mantras',
    summaryTitle: isHi ? 'रिपोर्ट सारांश' : 'Report Summary',
    generatedOn: isHi ? 'जनरेट किया गया' : 'Generated on',
    chartsTitle: isHi ? 'वर्ग कुंडली' : 'Divisional Charts',
    ashtakavargaTitle: isHi ? 'अष्टकवर्ग बिंदु' : 'Ashtakavarga Bindus',
    lord: isHi ? 'स्वामी' : 'Lord',
    years: isHi ? 'वर्ष' : 'years',
    phase: isHi ? 'चरण' : 'Phase',
    neutralized: isHi ? 'निरस्त' : 'Neutralized',
    cancellations: isHi ? 'निरस्तीकरण' : 'Cancellations',
  };

  // Font stack: Mukta is bundled by the PDF route (Latin + Devanagari).
  // @react-pdf/renderer only reads the FIRST family — keep it stable.
  const BODY_FONT = "'Mukta', sans-serif";

  let html = `<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${BODY_FONT}; color: #1a1a2e; font-size: 10pt; line-height: 1.4; background: #ffffff; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .title-page { text-align: center; padding-top: 90pt; }
    .title-pill { display: inline-block; background: #6c63ff; color: #ffffff; padding: 4pt 14pt; border-radius: 10pt; font-size: 10pt; margin-bottom: 10pt; }
    .title-page h1 { font-size: 23pt; margin-bottom: 4pt; }
    .title-page .subtitle { font-size: 13pt; color: #4a4a6a; margin-bottom: 16pt; }
    .title-page h2 { font-size: 17pt; margin: 6pt 0 12pt; }
    .details { background: #f5f5fa; padding: 10pt 16pt; border-radius: 6pt; font-size: 10pt; width: 75%; margin: 0 auto 12pt; }
    .details table { border: none; }
    .details td { border: none; padding: 2.5pt 5pt; border-bottom: 0.5pt solid #e0e0e8; }
    .details td:first-child { font-weight: bold; }
    .chart-line { font-size: 10pt; color: #4a4a6a; margin-top: 10pt; }
    .section-title { font-size: 15pt; color: #1a1a2e; border-bottom: 1.5pt solid #6c63ff; padding-bottom: 3pt; margin-bottom: 8pt; }
    .sub-title { font-size: 11.5pt; margin: 10pt 0 4pt; }
    table { width: 100%; border-collapse: collapse; margin: 5pt 0; font-size: 9pt; }
    th { background: #f0f0f5; text-align: left; padding: 3pt 5pt; border: 0.5pt solid #d0d0d8; }
    td { padding: 3pt 5pt; border: 0.5pt solid #d0d0d8; }
    .card { background: #f8f8fc; border-radius: 5pt; padding: 7pt 10pt; margin: 6pt 0; page-break-inside: avoid; }
    .card p { margin: 3pt 0; }
    .card-title { font-weight: bold; font-size: 11pt; margin-bottom: 2pt; }
    .pill { display: inline-block; background: #e8e6ff; color: #3f3d8f; border-radius: 8pt; padding: 1pt 7pt; font-size: 8.5pt; margin-right: 4pt; }
    .pill-strong { background: #6c63ff; color: #ffffff; }
    .pill-warn { background: #fff3e0; color: #b26a00; }
    .pill-danger { background: #fdecea; color: #b3261e; }
    .pill-ok { background: #e6f4ea; color: #1e7d34; }
    .remedy-list { margin: 3pt 0 3pt 14pt; }
    .remedy-list li { margin: 1.5pt 0; font-size: 9.5pt; }
    .narr-para { margin: 0 0 6pt; text-align: justify; }
    .narr-alt { background: #f8f8fc; border-left: 2.5pt solid #6c63ff; border-radius: 0 4pt 4pt 0; padding: 6pt 9pt; margin: 8pt 0; }
    .narr-alt p { margin: 0 0 4pt; text-align: justify; }
    .dasha-block { page-break-inside: avoid; margin-bottom: 8pt; }
    .dasha-title { font-weight: bold; background: #6c63ff; color: #ffffff; padding: 3pt 8pt; border-radius: 4pt; font-size: 10pt; }
    .dasha-desc { font-size: 9.5pt; margin: 3pt 0; }
    .current-dasha { background: #e8f5e9; padding: 7pt 10pt; border-radius: 5pt; margin-top: 8pt; page-break-inside: avoid; }
    .outcome-positive { color: #1e7d34; }
    .outcome-neutral { color: #b26a00; }
    .outcome-caution { color: #b3261e; }
    .footer { margin-top: 12pt; font-size: 8pt; color: #888888; text-align: center; border-top: 0.5pt solid #eeeeee; padding-top: 6pt; }
    .summary-box { background: #f0f4ff; border-radius: 6pt; padding: 10pt 14pt; margin: 10pt 0; }
    .kv { font-size: 9.5pt; margin: 2pt 0; }
    .kv b { color: #3f3d8f; }
  </style></head><body>`;


  // ─── PAGE 1: Cover ───────────────────────────────────────────────────────
  const dashas = Array.isArray(calculations?.vimshottari?.mahadashas)
    ? calculations.vimshottari.mahadashas
    : [];
  const currentDasha = calculations?.vimshottari?.currentDasha || null;
  const doshas = calculations?.doshas || {};
  const yogas = calculations?.yogas || {};
  const planets = Array.isArray(chartData?.planets) ? chartData.planets : [];
  const houseCusps =
    calculations?.divisionalCharts?.D1?.houseCusps ||
    (Array.isArray(chartData?.houses) ? chartData.houses : []);

  html += `
    <div class="page title-page">
      <div class="title-pill">${t.premiumReport}</div>
      <h1>${isHi ? 'जन्म कुंडली विशद् विश्लेषण' : 'Detailed Birth Chart Analysis'}</h1>
      <h2>${escapeHTML(name)}</h2>
      <div class="details">
        <table>
          <tr><td>${t.client}</td><td>${escapeHTML(name)}</td></tr>
          <tr><td>${t.birth}</td><td>${txt(birthDate)} - ${txt(birthTime)}</td></tr>
          <tr><td>${t.timezone}</td><td>${txt(timezone)}</td></tr>
          <tr><td>${t.location}</td><td>${txt(latitude)}, ${txt(longitude)}</td></tr>
        </table>
      </div>
      <div class="chart-line">
        ${t.asc}: <b>${getSign(chartData?.lagna || chartData?.ascendant || '')}</b>
        &nbsp;|&nbsp; ${t.moon}: <b>${getSign(chartData?.moonSign || chartData?.rashi || '')}</b>
        &nbsp;|&nbsp; ${t.sun}: <b>${getSign(chartData?.sunSign || '')}</b>
        &nbsp;|&nbsp; ${t.nakshatra}: <b>${txt(chartData?.nakshatra)}</b>
      </div>
    </div>`;

  // ─── PAGE: Planets + house cusps ─────────────────────────────────────────
  html += `
    <div class="page">
      <h2 class="section-title">${t.planetsTitle}</h2>
      ${
        planets.length
          ? `<table>
        <tr><th>${t.planet}</th><th>${t.sign}</th><th>${t.degree}</th><th>${t.house}</th><th>${t.retro}</th></tr>
        ${planets
          .map(
            (p: any) =>
              `<tr><td>${txt(p.name)}</td><td>${getSign(p.sign)}</td><td>${txt(
                p.degree
              )}</td><td>${txt(p.house)}</td><td>${p.retrograde ? 'R' : '-'}</td></tr>`
          )
          .join('')}
      </table>`
          : `<div class="card"><p>${isHi ? 'ग्रह विवरण उपलब्ध नहीं है।' : 'Planet details are not available.'}</p></div>`
      }
      ${
        Array.isArray(houseCusps) && houseCusps.length
          ? `<h3 class="sub-title">${t.cuspsTitle}</h3>
      <table>
        <tr><th>${t.house}</th><th>${t.sign}</th></tr>
        ${houseCusps
          .map(
            (c: any) =>
              `<tr><td>${txt(c.house)}</td><td>${
                typeof c.sign === 'number' ? signFromNumber(c.sign) : getSign(String(c.sign || ''))
              }</td></tr>`
          )
          .join('')}
      </table>`
          : ''
      }
      <div class="footer">${isHi ? 'लाहिरी अयनांश वैदिक गणना पर आधारित' : 'Based on Lahiri Ayanamsa Vedic calculations'}</div>
    </div>`;

  // ─── PAGES: Vimshottari Mahadashas with Antardashas ──────────────────────
  if (dashas.length) {
    html += `
    <div class="page">
      <h2 class="section-title">${t.dashaTitle}</h2>
      ${dashas
        .map(
          (d: any) => `
        <div class="dasha-block">
          <div class="dasha-title">${txt(d.lord)} ${isHi ? 'महादशा' : 'Mahadasha'} (${txt(
            d.startDate
          )} - ${txt(d.endDate)})${d.years ? ` - ${txt(d.years)} ${t.years}` : ''}</div>
          ${d.description ? `<div class="dasha-desc">${escapeHTML(d.description)}</div>` : ''}
          ${
            Array.isArray(d.antardashas) && d.antardashas.length
              ? `<table>
            <tr><th>${t.subPeriod}</th><th>${t.start}</th><th>${t.end}</th></tr>
            ${d.antardashas
              .map(
                (a: any) =>
                  `<tr><td>${txt(a.planet)}</td><td>${txt(a.startDate)}</td><td>${txt(
                    a.endDate
                  )}</td></tr>`
              )
              .join('')}
          </table>`
              : ''
          }
        </div>`
        )
        .join('')}
      ${
        currentDasha
          ? `<div class="current-dasha">
        <b>${t.currentDasha}:</b> ${txt(currentDasha.mahadasha)} - ${txt(currentDasha.antardasha)}
        ${currentDasha.startDate ? `(${txt(currentDasha.startDate)} - ${txt(currentDasha.endDate)})` : ''}
      </div>`
          : ''
      }
    </div>`;
  }

  // ─── PAGE: Doshas — iterate ALL keys in calculations.doshas ──────────────
  const doshaEntries = Object.entries(doshas) as [string, any][];
  if (doshaEntries.length) {
    html += `
    <div class="page">
      <h2 class="section-title">${t.doshaTitle}</h2>
      ${doshaEntries
        .map(([key, d]) => {
          if (!d || typeof d !== 'object') return '';
          const name =
            d.name ||
            (isHi
              ? { mangal: 'मांगलिक दोष', sadeSati: 'साढ़े साती', kaalSarp: 'काल सर्प दोष' }[key] || key
              : { mangal: 'Manglik Dosha', sadeSati: 'Sade Sati', kaalSarp: 'Kaal Sarp Dosha' }[key] || key);
          const present = d.isPresent === true || d.isActive === true;
          const severity = d.severity || (present ? d.phase || 'moderate' : 'none');
          const activePeriod = d.activePeriod;
          const cancellations = Array.isArray(d.cancellations) ? d.cancellations : [];
          return `
        <div class="card">
          <div class="card-title">${txt(name)}
            <span class="pill ${present ? 'pill-danger' : 'pill-ok'}">${
            present ? (isHi ? 'उपस्थित' : 'Present') : isHi ? 'अनुपस्थित' : 'Absent'
          }</span>
            ${d.isNeutralized ? `<span class="pill pill-ok">${t.neutralized}</span>` : ''}
          </div>
          ${d.description ? `<p>${escapeHTML(d.description)}</p>` : ''}
          <p class="kv"><b>${t.severity}:</b> ${txt(severity)}</p>
          ${
            activePeriod?.startDate
              ? `<p class="kv"><b>${t.period}:</b> ${txt(activePeriod.startDate)} - ${txt(activePeriod.endDate)}</p>`
              : ''
          }
          ${d.phase ? `<p class="kv"><b>${t.phase}:</b> ${txt(d.phase)}</p>` : ''}
          ${
            cancellations.length
              ? `<p class="kv"><b>${t.cancellations}:</b> ${escapeHTML(cancellations.join('; '))}</p>`
              : ''
          }
          ${bulletList(d.remedies) ? `<p><b>${t.remedies}:</b></p>${bulletList(d.remedies)}` : ''}
        </div>`;
        })
        .join('')}
    </div>`;
  }

  // ─── PAGE: Yogas — iterate ALL keys in calculations.yogas ────────────────
  const yogaCards = (key: string, y: any): string => {
    if (!y || typeof y !== 'object') return '';
    if (Array.isArray(y)) {
      return y.map((item: any) => yogaCards(key, item)).join('');
    }
    const present = y.isPresent === true || y.presence === true;
    if (!present) return '';
    const planetsList = Array.isArray(y.planets) ? y.planets.join(', ') : '';
    const strength = y.strength || '';
    return `
      <div class="card">
        <div class="card-title">${txt(y.name || key)}
          ${strength ? `<span class="pill pill-strong">${t.strength}: ${escapeHTML(strength)}</span>` : ''}
          ${
            Array.isArray(y.houses) && y.houses.length
              ? `<span class="pill">${isHi ? 'भाव' : 'Houses'}: ${escapeHTML(y.houses.join(', '))}</span>`
              : ''
          }
        </div>
        ${y.description ? `<p>${escapeHTML(y.description)}</p>` : ''}
        ${y.impact ? `<p class="kv"><b>${isHi ? 'प्रभाव' : 'Impact'}:</b> ${escapeHTML(y.impact)}</p>` : ''}
        ${y.benefit ? `<p class="kv"><b>${isHi ? 'लाभ' : 'Benefit'}:</b> ${escapeHTML(y.benefit)}</p>` : ''}
        ${planetsList ? `<p class="kv"><b>${t.planetsInvolved}:</b> ${escapeHTML(planetsList)}</p>` : ''}
      </div>`;
  };

  const yogaEntries = Object.entries(yogas) as [string, any][];
  const yogaHtml = yogaEntries.map(([key, y]) => yogaCards(key, y)).join('');
  if (yogaHtml) {
    html += `
    <div class="page">
      <h2 class="section-title">${t.yogasTitle}</h2>
      ${yogaHtml}
    </div>`;
  }

  // ─── PAGES: AI Life-Pillar narratives (full text + milestones) ───────────
  (Array.isArray(pillars) ? pillars : []).forEach((pillar: any, i: number) => {
    if (!pillar || typeof pillar !== 'object') return;
    const narrative = isHi ? pillar.narrativeHi : pillar.narrativeEn;
    const title = isHi ? pillar.titleHi || pillar.titleEn : pillar.titleEn || pillar.titleHi;
    const badges = pillar.badges || {};
    const milestones = Array.isArray(pillar.milestones) ? pillar.milestones : [];
    html += `
    <div class="page">
      <h2 class="section-title">${i + 1}. ${txt(title)}</h2>
      ${
        badges.score || badges.timeframe || badges.lord
          ? `<div>
        ${badges.score ? `<span class="pill pill-strong">${txt(badges.score)}</span>` : ''}
        ${badges.timeframe ? `<span class="pill">${txt(badges.timeframe)}</span>` : ''}
        ${badges.lord ? `<span class="pill">${isHi ? 'स्वामी' : 'Lord'}: ${txt(badges.lord)}</span>` : ''}
      </div>`
          : ''
      }
      <div class="narr-alt">${paragraphs(narrative, 'narr-para')}</div>
      ${
        milestones.length
          ? `<h3 class="sub-title">${t.milestones}</h3>
      <table>
        <tr><th>${t.period}</th><th>${t.event}</th><th>${t.note}</th></tr>
        ${milestones
          .map(
            (m: any) =>
              `<tr><td>${txt(m.period)}</td><td>${txt(m.event)}</td><td class="outcome-${
                m.outcome || 'neutral'
              }">${txt(m.note || m.outcome || '')}</td></tr>`
          )
          .join('')}
      </table>`
          : ''
      }
      <div class="footer">${isHi ? 'AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन' : 'AI-assisted Vedic astrology guidance'}</div>
    </div>`;
  });

  // ─── PAGE: Remedies — dosha remedy sets + gemstones + mantras ────────────
  const remedyItems = Array.isArray(data.paidTier?.remedies) ? data.paidTier.remedies : [];
  const gemstones = data.paidTier?.remedyKit?.gemstones || [];
  const mantras = data.paidTier?.remedyKit?.dailyMantras || [];
  const doshaRemedies = doshaEntries
    .filter(([, d]) => d && Array.isArray(d.remedies) && d.remedies.length)
    .map(([key, d]) => `<h3 class="sub-title">${txt(d.name || key)}</h3>${bulletList(d.remedies)}`)
    .join('');
  if (doshaRemedies || remedyItems.length || gemstones.length || mantras.length) {
    html += `
    <div class="page">
      <h2 class="section-title">${t.remediesTitle}</h2>
      ${doshaRemedies}
      ${gemstones.length ? `<h3 class="sub-title">${t.gemstones}</h3>${bulletList(gemstones)}` : ''}
      ${mantras.length ? `<h3 class="sub-title">${t.mantras}</h3>${bulletList(mantras)}` : ''}
      ${
        remedyItems.length
          ? `<h3 class="sub-title">${isHi ? 'अन्य उपाय' : 'Other Remedies'}</h3>
      ${remedyItems
        .map((r: any) => `<p class="kv"><b>${txt(r.type)}:</b> ${txt(r.description)}</p>`)
        .join('')}`
          : ''
      }
    </div>`;
  }

  // ─── PAGE: Summary ────────────────────────────────────────────────────────
  html += `
    <div class="page">
      <h2 class="section-title">${t.summaryTitle}</h2>
      <div class="summary-box">
        <p class="narr-para">${
          isHi
            ? 'यह रिपोर्ट लाहिरी अयनांश वैदिक गणना और AI-सहायता प्राप्त विश्लेषण पर आधारित है। इसमें ग्रह स्थिति, दशा चक्र, दोष, योग और छह जीवन क्षेत्रों का विस्तृत विवरण शामिल है। व्यक्तिगत मार्गदर्शन के लिए प्रमाणित ज्योतिषी से परामर्श करें।'
            : 'This report is based on Lahiri Ayanamsa Vedic calculations and AI-assisted analysis. It covers planetary positions, the full dasha cycle, doshas, yogas, and six detailed life-domain narratives. For personalized guidance, consult a certified Jyotish practitioner.'
        }</p>
      </div>
      <p style="color: #888888; font-size: 9pt; margin-top: 10pt;">${t.generatedOn}: ${new Date().toLocaleDateString()}</p>
      <p style="font-size: 9pt; color: #aaaaaa; margin-top: 20pt;">${
        isHi ? 'धन्यवाद। शुभ भविष्य की कामना।' : 'Thank you. Wishing you a bright future.'
      }</p>
    </div>`;

  html += `</body></html>`;
  return html;
}

// ─── Backward-compatible exports ─────────────────────────────────────────
// These are retained so callers of the older flattened contract still compile.
// `generateReportHtml` maps its flattened input onto the new rich `PdfData`
// shape and delegates to `generatePdfHtml`.

export interface ReportData {
  clientName: string;
  chartType: string;
  birthDetails: { date: string; time: string; latitude: string; longitude: string; timezone: string };
  planetaryPositions: { body: string; sign: string; degree: string; house: string; retro?: boolean }[];
  houseCusps: { house: number; sign: string; degree: string }[];
  dashaPeriods: { mahaDasha: string; startYear: string; endYear: string; subPeriod?: string }[];
  yogas: { name: string; description: string }[];
  remedies: { category: string; description: string }[];
  doshas: { name: string; description: string; severity: 'low' | 'moderate' | 'high'; isNeutralized: boolean }[];
  domainInsights: { domain: 'career' | 'marriage' | 'wealth' | 'health' | 'finance' | 'education'; prediction: string; analysis: string; timeframe?: string }[];
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
  milestones?: { period: string; event: string; note?: string; outcome?: 'positive' | 'neutral' | 'caution' }[];
}

export const PDF_HTML_TEMPLATE_VERSION = '6.0.0';
export const MIN_PROMISED_PAGES = 13;

// Backward-compatible wrapper for callers of the old flattened
// `generateReportHtml(reportData, language)` contract.
export function generateReportHtml(
  reportData: ReportData,
  language: 'en' | 'hi' = 'en'
): string {
  const bd = reportData.birthDetails || {
    date: '', time: '', latitude: '', longitude: '', timezone: '',
  };

  // Build chartData in the flat expected shape from the flattened ReportData
  const chartData = {
    lagna: reportData.panchang?.lagna || '',
    rashi: reportData.panchang?.moonSign || '',
    moonSign: reportData.panchang?.moonSign || '',
    sunSign: reportData.panchang?.sunSign || '',
    nakshatra: reportData.panchang?.nakshatra || '',
    planets: (reportData.planetaryPositions || []).map((p) => ({
      name: p.body,
      sign: p.sign,
      degree: p.degree,
      house: p.house,
      retrograde: Boolean(p.retro),
    })),
  };

  // Build calculations in the expected shape from flattened data
  const calc: any = {};

  if (reportData.d9Chart) {
    calc.divisionalCharts = calc.divisionalCharts || {};
    calc.divisionalCharts.D9 = {
      chartType: 'D9',
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
      const lower = String(d.name || '').toLowerCase();
      if (lower.includes('mangal') || lower.includes('kuja') || lower.includes('मांगलिक')) {
        calc.doshas.mangal = {
          isPresent: true,
          severity: d.severity || 'moderate',
          isNeutralized: Boolean(d.isNeutralized),
          description: d.description || '',
          remedies: [],
        };
      } else if (lower.includes('sade') || lower.includes('साढे') || lower.includes('शनि')) {
        calc.doshas.sadeSati = {
          isActive: true,
          phase: 'active',
          activePeriod: null,
          description: d.description || '',
          remedies: [],
          moonSign: 0,
          saturnSignNow: 0,
          phaseRanges: {},
          dhaiya: { isActive: false, phase: 'inactive', period: null },
        };
      } else if (lower.includes('kaal') || lower.includes('kal') || lower.includes('काल')) {
        calc.doshas.kaalSarp = {
          isPresent: true,
          description: d.description || '',
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
      if (String(y.name || '').toLowerCase().includes('gaja')) {
        calc.yogas.gajakesari = { name: y.name, isPresent: true, strength: 'moderate', description: y.description };
      }
      if (!calc.yogas.dhanaYogas) calc.yogas.dhanaYogas = [];
      calc.yogas.dhanaYogas.push({ name: y.name, isPresent: true, description: y.description, planets: [], houses: [] });
    }
    if (!calc.yogas.dhanaYogas) calc.yogas.dhanaYogas = [];
  }

  const pdfData: any = {
    name: reportData.clientName || 'User',
    birthDate: bd.date || '',
    birthTime: bd.time || '',
    latitude: parseFloat(bd.latitude) || 0,
    longitude: parseFloat(bd.longitude) || 0,
    timezone: bd.timezone || '',
    chartData,
    calculations: calc,
    pillars: reportData.narratives || [],
    freeTier: {},
    paidTier: {},
    language,
  };

  return generatePdfHtml(pdfData, language);
}