// lib/pdfHtmlTemplate.ts - COMPLETE REPLACEMENT

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

  const escapeHTML = (str: string) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  const signNames: Record<string, string> = {
    'Aries': 'मेष', 'Taurus': 'वृष', 'Gemini': 'मिथुन', 'Cancer': 'कर्क',
    'Leo': 'सिंह', 'Virgo': 'कन्या', 'Libra': 'तुला', 'Scorpio': 'वृश्चिक',
    'Sagittarius': 'धनु', 'Capricorn': 'मकर', 'Aquarius': 'कुंभ', 'Pisces': 'मीन'
  };

  const getSign = (sign: string) => lang === 'hi' ? (signNames[sign] || sign) : sign;

  // PAGE 1: TITLE
  let html = `<!DOCTYPE html>
  <html><head><meta charset="UTF-8"><style>
    @page { margin: 8mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Sans', Arial, sans-serif; padding: 10px; color: #1a1a2e; font-size: 11px; line-height: 1.5; background: #fff; }
    .page { page-break-after: always; padding: 8px 0; min-height: 90vh; }
    .title-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 80vh; }
    .title-page h1 { font-size: 26px; color: #1a1a2e; margin-bottom: 8px; }
    .title-page .subtitle { font-size: 16px; color: #4a4a6a; margin-bottom: 20px; }
    .title-page .details { background: #f5f5fa; padding: 15px 25px; border-radius: 6px; font-size: 12px; max-width: 380px; margin: 0 auto; }
    .title-page .details table { width: 100%; border-collapse: collapse; }
    .title-page .details td { padding: 3px 6px; border-bottom: 1px solid #e0e0e8; }
    .title-page .details td:first-child { font-weight: bold; width: 38%; }
    .section-title { font-size: 18px; color: #1a1a2e; border-bottom: 2px solid #6c63ff; padding-bottom: 4px; margin-bottom: 10px; }
    .badge { background: #6c63ff; color: white; padding: 3px 10px; border-radius: 10px; display: inline-block; font-size: 10px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10px; }
    th { background: #f0f0f5; text-align: left; padding: 4px 6px; border: 1px solid #d0d0d8; }
    td { padding: 4px 6px; border: 1px solid #d0d0d8; }
    .narrative { margin: 6px 0; padding: 6px 10px; background: #f8f8fc; border-radius: 4px; font-size: 11px; line-height: 1.6; }
    .narrative-hi { font-family: 'Noto Sans Devanagari', sans-serif; margin: 6px 0; padding: 6px 10px; background: #f8f8fc; border-radius: 4px; font-size: 11px; line-height: 1.6; }
    .footer { margin-top: 15px; font-size: 9px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 8px; }
    .remedy-list { list-style: none; padding: 0; }
    .remedy-list li { padding: 3px 8px; margin: 2px 0; background: #f0f8f0; border-radius: 4px; font-size: 10px; }
    .dasha-block { margin-bottom: 10px; }
    .dasha-title { font-weight: bold; background: #6c63ff; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; }
    .outcome-positive { color: #2e7d32; }
    .outcome-neutral { color: #f57f17; }
  </style></head><body>`;

  // PAGE 1: Title
  html += `
    <div class="page title-page">
      <h1>✨ जन्म कुंडली विशद् विश्लेषण</h1>
      <div class="subtitle">${lang === 'hi' ? 'प्रीमियम रिपोर्ट' : 'Premium Report'}</div>
      <h2 style="font-size: 22px; margin: 8px 0;">${escapeHTML(name)}</h2>
      <div class="details">
        <table>
          <tr><td>${lang === 'hi' ? 'क्लाइंट नाम' : 'Client'}</td><td>${escapeHTML(name)}</td></tr>
          <tr><td>${lang === 'hi' ? 'जन्म' : 'Birth'}</td><td>${escapeHTML(birthDate)} · ${escapeHTML(birthTime)}</td></tr>
          <tr><td>${lang === 'hi' ? 'समय क्षेत्र' : 'Timezone'}</td><td>${escapeHTML(timezone)}</td></tr>
          <tr><td>${lang === 'hi' ? 'स्थान' : 'Location'}</td><td>${escapeHTML(String(latitude))}, ${escapeHTML(String(longitude))}</td></tr>
        </table>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #666;">
        ${lang === 'hi' ? 'लग्न: ' : 'Asc: '} <strong>${getSign(chartData?.lagna || '')}</strong>
        &nbsp;|&nbsp; ${lang === 'hi' ? 'चंद्र: ' : 'Moon: '} <strong>${getSign(chartData?.moonSign || '')}</strong>
        &nbsp;|&nbsp; ${lang === 'hi' ? 'सूर्य: ' : 'Sun: '} <strong>${getSign(chartData?.sunSign || '')}</strong>
        &nbsp;|&nbsp; ${lang === 'hi' ? 'नक्षत्र: ' : 'Nakshatra: '} <strong>${chartData?.nakshatra || ''}</strong>
      </div>
    </div>`;
// PAGE 2: Planets
  html += `
    <div class="page">
      <h2 class="section-title">${lang === 'hi' ? '🌍 ग्रह स्थिति' : '🌍 Planet Positions'}</h2>
      <table>
        <tr><th>${lang === 'hi' ? 'ग्रह' : 'Planet'}</th><th>${lang === 'hi' ? 'राशि' : 'Sign'}</th><th>${lang === 'hi' ? 'डिग्री' : 'Degree'}</th><th>${lang === 'hi' ? 'घर' : 'House'}</th><th>${lang === 'hi' ? 'तीनो' : 'Retro'}</th></tr>
        ${(chartData?.planets || []).map((p: any) => `
          <tr><td>${escapeHTML(p.name)}</td><td>${getSign(p.sign)}</td><td>${escapeHTML(p.degree)}</td><td>${p.house}</td><td>${p.retrograde ? '✓' : '-'}</td></tr>
        `).join('')}
      </table>
      <h2 class="section-title" style="margin-top: 15px;">${lang === 'hi' ? '🏠 घर कस्प' : '🏠 House Cusps'}</h2>
      <table>
        <tr><th>${lang === 'hi' ? 'घर' : 'House'}</th><th>${lang === 'hi' ? 'राशि' : 'Sign'}</th></tr>
        ${(calculations?.divisionalCharts?.D1?.houseCusps || []).map((c: any) => `
          <tr><td>${c.house}</td><td>${getSign(['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'][c.sign - 1])}</td></tr>
        `).join('')}
      </table>
    </div>`;
// PAGE 3: Dasha with Antardashas
  html += `
    <div class="page">
      <h2 class="section-title">${lang === 'hi' ? '📅 दशा अवधि' : '📅 Dasha Periods'}</h2>
      ${(calculations?.vimshottari?.mahadashas || []).map((d: any) => `
        <div class="dasha-block">
          <div class="dasha-title">${d.lord} Mahadasha (${d.startDate} - ${d.endDate})</div>
          <table style="font-size: 9px;">
            <tr><th>${lang === 'hi' ? 'उप-अवधि' : 'Sub-Period'}</th><th>${lang === 'hi' ? 'प्रारंभ' : 'Start'}</th><th>${lang === 'hi' ? 'समाप्ति' : 'End'}</th></tr>
            ${(d.antardashas || []).map((a: any) => `
              <tr><td>${a.planet}</td><td>${a.startDate}</td><td>${a.endDate}</td></tr>
            `).join('')}
          </table>
        </div>
      `).join('')}
      ${calculations?.vimshottari?.currentDasha ? `
        <div style="background: #e8f5e9; padding: 8px; border-radius: 4px; margin-top: 8px;">
          <strong>${lang === 'hi' ? 'वर्तमान अंतदशा:' : 'Current Dasha:'}</strong>
          ${calculations.vimshottari.currentDasha.mahadasha} - ${calculations.vimshottari.currentDasha.antardasha}
        </div>
      ` : ''}
    </div>`;
// PAGE 4: Doshas
  html += `
    <div class="page">
      <h2 class="section-title">${lang === 'hi' ? '⚠️ दोष विश्लेषण' : '⚠️ Dosha Analysis'}</h2>
      ${calculations?.doshas?.mangal ? `
        <h3 style="font-size: 14px; margin: 6px 0;">${lang === 'hi' ? 'मांगलिक दोष' : 'Manglik Dosha'}</h3>
        <div class="narrative">${escapeHTML(calculations.doshas.mangal.description || '')}</div>
        <div style="margin: 4px 0;"><strong>${lang === 'hi' ? 'गंभीरता:' : 'Severity:'}</strong> ${calculations.doshas.mangal.severity || 'unknown'}</div>
        ${calculations.doshas.mangal.remedies?.length ? `
          <strong>${lang === 'hi' ? 'उपाय:' : 'Remedies:'}</strong>
          <ul class="remedy-list">${calculations.doshas.mangal.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join('')}</ul>
        ` : ''}
      ` : ''}
      ${calculations?.doshas?.sadeSati?.isActive ? `
        <h3 style="font-size: 14px; margin: 10px 0 4px;">${lang === 'hi' ? 'साढे साती' : 'Sade Sati'}</h3>
        <div class="narrative">${escapeHTML(calculations.doshas.sadeSati.description || '')}</div>
        <div style="margin: 4px 0;">
          <strong>${lang === 'hi' ? 'चरण:' : 'Phase:'}</strong> ${calculations.doshas.sadeSati.phase || 'active'}
          <br><strong>${lang === 'hi' ? 'अवधि:' : 'Period:'}</strong> ${calculations.doshas.sadeSati.activePeriod?.startDate} - ${calculations.doshas.sadeSati.activePeriod?.endDate}
        </div>
        ${calculations.doshas.sadeSati.remedies?.length ? `
          <strong>${lang === 'hi' ? 'उपाय:' : 'Remedies:'}</strong>
          <ul class="remedy-list">${calculations.doshas.sadeSati.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join('')}</ul>
        ` : ''}
      ` : ''}
    </div>`;
// PAGE 5: Yogas
  html += `
    <div class="page">
      <h2 class="section-title">${lang === 'hi' ? '✨ योग विश्लेषण' : '✨ Yoga Analysis'}</h2>
      ${calculations?.yogas?.gajakesari?.isPresent ? `
        <h3 style="font-size: 14px; margin: 6px 0;">${calculations.yogas.gajakesari.name}</h3>
        <div class="narrative">${escapeHTML(calculations.yogas.gajakesari.description || '')}</div>
        <div style="margin: 4px 0;"><strong>${lang === 'hi' ? 'शक्ति:' : 'Strength:'}</strong> ${calculations.yogas.gajakesari.strength || 'present'}</div>
      ` : ''}
      ${(calculations?.yogas?.dhanaYogas || []).filter((y: any) => y.isPresent).map((y: any) => `
        <h3 style="font-size: 14px; margin: 10px 0 4px;">${y.name}</h3>
        <div class="narrative">${escapeHTML(y.description || '')}</div>
        <div style="font-size: 10px; color: #555;">${lang === 'hi' ? 'ग्रह:' : 'Planets:'} ${(y.planets || []).join(', ')}</div>
      `).join('')}
    </div>`;
// PAGES 6-11: Life Domains from Pillars
  (pillars || []).forEach((pillar: any) => {
    html += `
      <div class="page">
        <h2 class="section-title">${escapeHTML(pillar.titleEn)} (${escapeHTML(pillar.titleHi)})</h2>
        <div class="badge">${escapeHTML(pillar.badges?.score || '')} · ${escapeHTML(pillar.badges?.timeframe || '')} · ${escapeHTML(pillar.badges?.lord || '')}</div>
        <div class="narrative">${escapeHTML(pillar.narrativeEn || '')}</div>
        <div class="narrative-hi">${escapeHTML(pillar.narrativeHi || '')}</div>
        ${pillar.milestones?.length ? `
          <h3 style="font-size: 13px; margin: 8px 0 4px;">${lang === 'hi' ? '📌 प्रमुख मील के पत्थर' : '📌 Key Milestones'}</h3>
          <table>
            <tr><th>${lang === 'hi' ? 'अवधि' : 'Period'}</th><th>${lang === 'hi' ? 'घटना' : 'Event'}</th><th>${lang === 'hi' ? 'टिप्पणी' : 'Note'}</th></tr>
            ${pillar.milestones.map((m: any) => `
              <tr><td>${escapeHTML(m.period)}</td><td>${escapeHTML(m.event)}</td><td>${escapeHTML(m.note)}</td></tr>
            `).join('')}
          </table>
        ` : ''}
        <div class="footer">${lang === 'hi' ? 'यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।' : 'This chapter is AI-assisted Vedic astrology guidance.'}</div>
      </div>
    `;
  });
// PAGE 12: Remedies Summary
  html += `
    <div class="page">
      <h2 class="section-title">${lang === 'hi' ? '💎 रत्न एवं उपाय' : '💎 Gemstones & Remedies'}</h2>
      ${calculations?.doshas?.mangal?.remedies?.length ? `
        <h3 style="font-size: 14px; margin: 6px 0;">${lang === 'hi' ? 'मांगलिक दोष उपाय' : 'Manglik Remedies'}</h3>
        <ul class="remedy-list">${calculations.doshas.mangal.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join('')}</ul>
      ` : ''}
      ${calculations?.doshas?.sadeSati?.remedies?.length ? `
        <h3 style="font-size: 14px; margin: 10px 0 4px;">${lang === 'hi' ? 'साढे साती उपाय' : 'Sade Sati Remedies'}</h3>
        <ul class="remedy-list">${calculations.doshas.sadeSati.remedies.map((r: string) => `<li>✅ ${escapeHTML(r)}</li>`).join('')}</ul>
      ` : ''}
      <div style="margin-top: 15px; padding: 12px; background: #f0f4ff; border-radius: 6px;">
        <h3 style="font-size: 14px;">${lang === 'hi' ? '🕉️ सामान्य उपाय' : '🕉️ General Remedies'}</h3>
        <ul class="remedy-list">
          <li>${lang === 'hi' ? 'प्रतिदिन गायत्री मंत्र का जाप करें।' : 'Chant the Gayatri mantra daily.'}</li>
          <li>${lang === 'hi' ? 'बुजुर्गों का सम्मान करें और अनुशासित दिनचर्या बनाए रखें।' : 'Respect elders and maintain a disciplined routine.'}</li>
        </ul>
      </div>
    </div>`;
// PAGE 13: Summary
  html += `
    <div class="page" style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
      <h2 class="section-title">${lang === 'hi' ? '📋 रिपोर्ट सारांश' : '📋 Report Summary'}</h2>
      <p style="font-size: 12px; max-width: 500px; margin: 15px auto;">${lang === 'hi' 
        ? 'यह रिपोर्ट लाहिरी अयनांश वैदिक गणना पर आधारित है। व्यक्तिगत मार्गदर्शन के लिए, एक प्रमाणित ज्योतिषी से परामर्श लें।'
        : 'This report is based on Lahiri Ayanamsa Vedic calculations. For personalized guidance, consult a certified Jyotish practitioner.'}</p>
      <p style="color: #888; font-size: 10px; margin-top: 20px;">${lang === 'hi' ? 'जनरेट किया गया:' : 'Generated on:'} ${new Date().toLocaleDateString()}</p>
      <p style="font-size: 10px; color: #aaa; margin-top: 30px;">${lang === 'hi' ? 'धन्यवाद। शुभ भविष्य की कामना।' : 'Thank you. Wishing you a bright future.'}</p>
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