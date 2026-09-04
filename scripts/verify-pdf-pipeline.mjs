/**
 * End-to-end PDF pipeline verification.
 * Run: node scripts/verify-pdf-pipeline.mjs
 * Feeds a production-shaped payload (9 mahadashas x 9 antardashas, 6 pillars,
 * all doshas/yogas) through generatePdfHtml + html-pdf-lite with the route's
 * exact options, then reports pages/bytes/timing.
 */
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

// Compile lib/pdfHtmlTemplate.ts to JS in-memory (no build step needed).
const source = require("fs").readFileSync(
  path.join(projectRoot, "lib", "pdfHtmlTemplate.ts"),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const templateModule = { exports: {} };
new Function("module", "exports", "require", outputText)(
  templateModule,
  templateModule.exports,
  require
);
const { generatePdfHtml } = templateModule;
const { renderPdfFromHtml } = require("html-pdf-lite");

// ─── Production-shaped payload ────────────────────────────────────────────
const PLANETS = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"];
const paragraph = (domain, i) =>
  `${domain} narrative paragraph ${i + 1}: The interplay of planetary periods and house lords suggests a decisive phase. ` +
  `Transits of Jupiter and Saturn through the relevant bhavas will crystallize long-pending ambitions. ` +
  `Remedial measures and disciplined effort compound favorably during this window, producing measurable momentum.`;

const payload = {
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
    planets: PLANETS.map((p, i) => ({
      name: p,
      sign: ["Leo","Scorpio","Capricorn","Aquarius","Cancer","Sagittarius","Gemini","Aquarius","Pisces"][i],
      degree: `${10 + i}° ${12 + i}'`,
      house: (i % 12) + 1,
      retrograde: i % 4 === 0,
    })),
  },
  calculations: {
    divisionalCharts: {
      D1: { houseCusps: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: i + 1 })) },
    },
    vimshottari: {
      mahadashas: PLANETS.map((lord, i) => ({
        lord,
        startDate: `199${i}-06-01`,
        endDate: `200${i + 5}-06-01`,
        years: [6, 10, 7, 18, 16, 19, 17, 7, 20][i],
        antardashas: PLANETS.map((p, j) => ({
          planet: p,
          startDate: `199${i}-0${(j % 9) + 1}-01`,
          endDate: `199${i}-1${(j % 3) + 1}-01`,
        })),
      })),
      currentDasha: { mahadasha: "Jupiter", antardasha: "Rahu", startDate: "2024-01-01", endDate: "2026-01-01" },
    },
    doshas: {
      mangal: {
        isPresent: true,
        severity: "moderate",
        isNeutralized: false,
        description: "Mars occupies the 7th house counted from the Lagna, forming Manglik Dosha. Its placement in a fiery sign amplifies assertiveness in partnerships, which requires conscious tempering.",
        remedies: ["Observe fasts on Tuesdays", "Recite the Hanuman Chalisa daily", "Donate red lentils to a temple on Tuesdays"],
      },
      sadeSati: {
        isActive: true,
        phase: "peak",
        activePeriod: { startDate: "2023-01-17", endDate: "2025-03-29" },
        description: "Saturn is currently transiting the natal Moon sign — the peak phase of Sade Sati. Discipline, patience and health routines are emphasized during this window.",
        remedies: ["Offer mustard-oil lamps to Shani Dev on Saturdays", "Donate black sesame seeds", "Serve elderly people and workers"],
      },
      kaalSarp: {
        isPresent: false,
        description: "No Kaal Sarp Dosha: Rahu and Ketu do not hem all planets.",
        remedies: [],
      },
    },
    yogas: {
      gajakesari: {
        name: "Gajakesari Yoga",
        isPresent: true,
        strength: "strong",
        description: "Jupiter occupies a kendra from the Moon, forming the auspicious Gajakesari Yoga.",
        impact: "Bestows wisdom, reputation and leadership; support from mentors arrives at decisive moments.",
        planets: ["Jupiter", "Moon"],
      },
      budhaditya: {
        name: "Budhaditya Yoga",
        isPresent: true,
        strength: "moderate",
        description: "Sun and Mercury conjoin in the 10th house of career.",
        impact: "Sharpens analytical intellect and favors strategy, commerce and communication careers.",
        planets: ["Sun", "Mercury"],
      },
      dhanaYogas: [
        {
          name: "Dhana Yoga (2-11)",
          isPresent: true,
          planets: ["Venus", "Jupiter"],
          houses: [2, 11],
          description: "The lords of the 2nd and 11th houses exchange influences, generating sustained wealth.",
          impact: "Multiple income streams strengthen after the mid-30s.",
        },
      ],
    },
  },
  pillars: [],
  freeTier: {},
  paidTier: {
// Six AI Life-Pillar narratives with 5 full paragraphs + 4 milestones each.
const HI_DOMAINS = ["करियर", "विवाह", "धन", "स्वास्थ्य", "शिक्षा", "अध्यात्म"];
payload.pillars = ["Career", "Marriage", "Wealth", "Health", "Education", "Spirituality"].map(
  (domain, i) => ({
    key: domain.toLowerCase(),
    titleEn: `${domain} & Life Path`,
    titleHi: `${HI_DOMAINS[i]} एवं जीवन पथ`,
    badges: { score: `${72 + i * 3}/100`, timeframe: "2025–2030", lord: PLANETS[i] },
    narrativeEn: Array.from({ length: 5 }, (_, p) => paragraph(domain, p)).join("\n\n"),
    narrativeHi: Array.from(
      { length: 5 },
      (_, p) =>
        `${HI_DOMAINS[i]} अनुच्छेद ${p + 1}: ग्रहों की दशाएँ और भाव स्वामी अनुकूल संकेत देते हैं। अनुशासित प्रयास और उपायों से स्थिर उन्नति संभव है।`
    ).join("\n\n"),
    milestones: Array.from({ length: 4 }, (_, k) => ({
      period: `202${k + 5} Q${(k % 4) + 1}`,
      event: `${domain} milestone ${k + 1}`,
      note: k % 2 === 0 ? "Favorable window opens" : "Exercise measured caution",
      outcome: k % 2 === 0 ? "positive" : "caution",
    })),
  })
);

// ─── Route-identical render options ───────────────────────────────────────
const FONTS_DIR = path.join(projectRoot, "public", "fonts");
const PDF_FONTS = {
  Mukta: {
    regular: path.join(FONTS_DIR, "Mukta-Regular.ttf"),
    bold: path.join(FONTS_DIR, "Mukta-Bold.ttf"),
  },
};

async function run(lang) {
  const html = generatePdfHtml(payload, lang);
  const t0 = Date.now();
  const pdf = await renderPdfFromHtml(html, {
    margins: { top: 24, right: 24, bottom: 24, left: 24 },
    fonts: PDF_FONTS,
    autoResolveEmojiFont: false,
  });
  const ms = Date.now() - t0;
  const pageCount = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  const out = path.join(projectRoot, `verify-${lang}.pdf`);
  require("fs").writeFileSync(out, pdf);
  console.log(`[${lang}] pages=${pageCount} bytes=${pdf.length} renderMs=${ms}`);
  return pageCount;
}

const en = await run("en");
const hi = await run("hi");
console.log(en >= 25 && hi >= 25 ? "PASS: 25+ pages in both languages" : "NOTE: check page count");
    remedies: [{ type: "Mantra", description: "Chant the Gayatri mantra daily at sunrise." }],
    remedyKit: {
      gemstones: ["Ruby (Manik) in gold on the ring finger", "Yellow Sapphire (Pukhraj) for Jupiter"],
      dailyMantras: ["Om Namah Shivaya", "Om Brihaspataye Namah"],
    },
  },
};
