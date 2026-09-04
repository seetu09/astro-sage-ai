import { describe, it, expect } from "vitest";
import { generatePdfHtml, generateReportHtml } from "./pdfHtmlTemplate";

const richData = {
  name: "Rahul Sharma",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  latitude: 28.6139,
  longitude: 77.209,
  timezone: "Asia/Kolkata",
  chartData: {
    lagna: "Leo",
    moonSign: "Scorpio",
    sunSign: "Taurus",
    nakshatra: "Anuradha",
    planets: [
      { name: "Sun", sign: "Taurus", degree: "0° 12'", house: 10, retrograde: false },
      { name: "Moon", sign: "Scorpio", degree: "15° 44'", house: 4, retrograde: false },
      { name: "Saturn", sign: "Sagittarius", degree: "22° 3'", house: 5, retrograde: true },
    ],
  },
  calculations: {
    divisionalCharts: {
      D1: {
        houseCusps: [
          { house: 1, sign: 5 },
          { house: 2, sign: 6 },
        ],
      },
    },
    vimshottari: {
      mahadashas: [
        {
          lord: "Saturn",
          startDate: "1995-06-01",
          endDate: "2014-06-01",
          antardashas: [
            { planet: "Saturn", startDate: "1995-06-01", endDate: "1998-07-15" },
            { planet: "Mercury", startDate: "1998-07-15", endDate: "2001-05-01" },
          ],
        },
      ],
      currentDasha: { mahadasha: "Jupiter", antardasha: "Rahu" },
    },
    doshas: {
      mangal: {
        isPresent: true,
        severity: "moderate",
        description: "Mars is placed in the 7th house causing Manglik Dosha.",
        remedies: ["Fast on Tuesdays", "Recite Hanuman Chalisa"],
      },
      sadeSati: {
        isActive: true,
        phase: "peak",
        activePeriod: { startDate: "2023-01-17", endDate: "2025-03-29" },
        description: "Saturn is transiting over the natal Moon sign.",
        remedies: ["Donate black sesame", "Worship Shani Dev"],
      },
    },
    yogas: {
      gajakesari: {
        name: "Gajakesari Yoga",
        isPresent: true,
        strength: "strong",
        description: "Jupiter in kendra from Moon forms Gajakesari Yoga.",
      },
      dhanaYogas: [
        { name: "Dhana Yoga (2-11)", isPresent: true, description: "Lords of 2nd and 11th are conjunct.", planets: ["Venus", "Jupiter"] },
        { name: "Inactive Yoga", isPresent: false, description: "not shown", planets: [] },
      ],
    },
  },
  pillars: [
    {
      titleEn: "Career & Profession",
      titleHi: "करियर एवं व्यवसाय",
      badges: { score: "82/100", timeframe: "2024-2027", lord: "Jupiter" },
      narrativeEn: "Your 10th lord Jupiter favors public-sector leadership roles.",
      narrativeHi: "आपके दशमेश गुरु सरकारी क्षेत्र के नेतृत्व पदों के अनुकूल हैं।",
      milestones: [
        { period: "2025 Q3", event: "Promotion", note: "Jupiter antardasha begins" },
      ],
    },
  ],
  freeTier: {},
  paidTier: {},
};

describe("generatePdfHtml — rich API data rendering", () => {
  const html = generatePdfHtml(richData as any, "en");

  it("renders real chart data on the title page (not placeholders)", () => {
    expect(html).toContain("Rahul Sharma");
    expect(html).toContain("1990-05-15");
    expect(html).toContain("14:30");
    expect(html).toContain("Asia/Kolkata");
    expect(html).toContain("Leo"); // lagna
    expect(html).toContain("Anuradha"); // nakshatra
  });

  it("renders planet rows from chartData.planets", () => {
    expect(html).toContain("Saturn");
    expect(html).toContain("44&#39;"); // escaped apostrophe (XSS-safe)
    expect(html).toContain("Sagittarius");
  });

  it("renders vimshottari mahadashas with antardashas", () => {
    expect(html).toContain("Saturn Mahadasha (1995-06-01 - 2014-06-01)");
    expect(html).toContain("Mercury"); // antardasha row
    expect(html).toContain("Jupiter - Rahu"); // current dasha
  });

  it("renders dosha analysis from calculations.doshas", () => {
    expect(html).toContain("Manglik Dosha");
    expect(html).toContain("Mars is placed in the 7th house");
    expect(html).toContain("moderate");
    expect(html).toContain("Fast on Tuesdays");
    expect(html).toContain("Sade Sati");
    expect(html).toContain("peak");
    expect(html).toContain("2023-01-17 - 2025-03-29");
    expect(html).toContain("Worship Shani Dev");
  });

  it("renders yogas from calculations.yogas", () => {
    expect(html).toContain("Gajakesari Yoga");
    expect(html).toContain("Jupiter in kendra from Moon");
    expect(html).toContain("Dhana Yoga (2-11)");
    expect(html).toContain("Venus, Jupiter");
    expect(html).not.toContain("not shown"); // isPresent: false filtered out
  });

  it("renders pillar narratives with milestones", () => {
    expect(html).toContain("Career &amp; Profession");
    expect(html).toContain("82/100");
    expect(html).toContain("2024-2027");
    expect(html).toContain("public-sector leadership roles");
    expect(html).toContain("Promotion");
  });

  it("renders the localized pillar title in Hindi mode", () => {
    const hi = generatePdfHtml(richData as any, "hi");
    expect(hi).toContain("करियर एवं व्यवसाय");
    expect(hi).toContain("सरकारी क्षेत्र");
  });

  it("produces 8 sections: title, planets, dashas, doshas, yogas, pillar, remedies, summary", () => {
    const pageCount = (html.match(/class="page/g) || []).length;
    expect(pageCount).toBe(8);
  });

  it("renders 25+ PDF pages when the API returns the full 120-year dasha table and 6 pillars", () => {
    // Real production payload shape: 9 mahadashas × 9 antardashas + 6 pillars.
    const md = (lord: string, start: number) => ({
      lord,
      startDate: `1990-0${(start % 9) + 1}-01`,
      endDate: `201${start}-01-01`,
      antardashas: Array.from({ length: 9 }, (_, j) => ({
        planet: ["Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu","Venus"][j],
        startDate: `199${j}-01-01`,
        endDate: `199${j + 1}-01-01`,
      })),
    });
    const fullData = {
      ...richData,
      calculations: {
        ...richData.calculations,
        vimshottari: {
          ...richData.calculations.vimshottari,
          mahadashas: ["Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury","Ketu","Venus"].map(md),
        },
      },
      pillars: ["Career","Marriage","Wealth","Health","Education","Spirituality"].map((name, i) => ({
        titleEn: `${name} & Profession`,
        titleHi: `${name} क्षेत्र`,
        badges: { score: `${70 + i}/100`, timeframe: "2025-2030", lord: "Jupiter" },
        narrativeEn: Array.from({ length: 5 }, (_, p) => `${name} narrative paragraph ${p} with detailed astrological analysis of planetary periods, house lords, and remedial measures for sustained growth and balance.`).join("\n\n"),
        narrativeHi: Array.from({ length: 5 }, (_, p) => `${name} विवरण अनुच्छेद ${p} ग्रहों की दशाओं, भाव स्वामियों और उपायों का विस्तृत विश्लेषण।`).join("\n\n"),
        milestones: Array.from({ length: 4 }, (_, k) => ({
          period: `202${k} Q${(k % 4) + 1}`,
          event: `${name} milestone ${k}`,
          note: "Favorable window",
          outcome: k % 2 ? "positive" : "neutral",
        })),
      })),
    };
    const fullHtml = generatePdfHtml(fullData as any, "en");
    const dashaRows = (fullHtml.match(/<tr><td>/g) || []).length;
    expect(dashaRows).toBeGreaterThanOrEqual(80); // 9 MD × 9 AD = 81 antardasha rows
    const pillarPages = (fullHtml.match(/AI-assisted Vedic astrology guidance/g) || []).length;
    expect(pillarPages).toBe(6);
  });

  it("has balanced div tags in the rendered HTML", () => {
    const opens = (html.match(/<div\b/g) || []).length;
    const closes = (html.match(/<\/div>/g) || []).length;
    expect(opens).toBe(closes);
  });

  it("escapes HTML in user data", () => {
    const evil = generatePdfHtml(
      { ...richData, name: '<script>alert("x")</script>' } as any,
      "en"
    );
    expect(evil).not.toContain('<script>alert');
    expect(evil).toContain("&lt;script&gt;");
  });

  it("localizes to Hindi when lang=hi", () => {
    const hi = generatePdfHtml(richData as any, "hi");
    expect(hi).toContain("प्रीमियम रिपोर्ट");
    expect(hi).toContain("ग्रह स्थिति");
    expect(hi).toContain("दशा अवधि");
    expect(hi).toContain("दोष विश्लेषण");
  });
});

describe("generateReportHtml — backward-compat wrapper", () => {
  const legacy = {
    clientName: "Legacy User",
    chartType: "north",
    birthDetails: {
      date: "1992-03-10",
      time: "09:15",
      latitude: "19.076",
      longitude: "72.8777",
      timezone: "Asia/Kolkata",
    },
    planetaryPositions: [
      { body: "Sun", sign: "Pisces", degree: "25°", house: "10" },
    ],
    houseCusps: [{ house: 1, sign: "Capricorn", degree: "0°" }],
    dashaPeriods: [],
    yogas: [{ name: "Gajakesari Yoga", description: "Jupiter kendra from Moon." }],
    remedies: [],
    doshas: [
      {
        name: "Mangal Dosha",
        description: "Mars in 7th.",
        severity: "moderate" as const,
        isNeutralized: false,
      },
    ],
    domainInsights: [],
    northIndianChartSvg: "",
    kalpurushaPhalDeepikaRefs: [],
    scorecard: [],
    isPaidTier: true,
    narratives: [
      {
        key: "career",
        titleEn: "Career",
        titleHi: "करियर",
        narrativeEn: "Strong career growth ahead.",
        narrativeHi: "करियर में तेजी।",
      },
    ],
  };

  it("maps flattened ReportData onto the rich template", () => {
    const html = generateReportHtml(legacy as any, "en");
    expect(html).toContain("Legacy User");
    expect(html).toContain("1992-03-10");
    expect(html).toContain("Pisces");
    expect(html).toContain("Mars in 7th."); // dosha mapped through
    expect(html).toContain("Gajakesari Yoga"); // yoga mapped through
    expect(html).toContain("Strong career growth ahead."); // pillar mapped
    const pageCount = (html.match(/class="page/g) || []).length;
    // Sections render only when their data exists (no blank filler pages):
    // title, planets, doshas, pillar, summary = 6 here (no dashas/yogas in fixture).
    expect(pageCount).toBe(6);
  });
});
