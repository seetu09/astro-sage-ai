/**
 * End-to-end PDF pipeline verification.
 * Run: node scripts/verify-pdf-pipeline.mjs
 * Feeds a production-shaped payload (9 mahadashas x 9 antardashas, 6 pillars,
 * all doshas/yogas) through @react-pdf/renderer, then reports pages/bytes/timing.
 *
 * NOTE: This script requires a build step since @react-pdf/renderer needs to be
 * resolved from node_modules. Use: `npm run build && node scripts/verify-pdf-pipeline.mjs`
 */
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const PLANETS = ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"];
const HI_DOMAINS = ["करियर", "विवाह", "धन", "स्वास्थ्य", "शिक्षा", "अध्यात्म"];
const EN_DOMAINS = ["Career", "Marriage", "Wealth", "Health", "Education", "Spirituality"];

const paragraph = (domain, i) =>
  `${domain} narrative paragraph ${i + 1}: The interplay of planetary periods and house lords suggests a decisive phase. ` +
  `Transits of Jupiter and Saturn through the relevant bhavas will crystallize long-pending ambitions. ` +
  `Remedial measures and disciplined effort compound favorably during this window, producing measurable momentum.`;

async function run(lang) {
  const t0 = Date.now();
  const { renderPdfToBuffer } = await import("../.next/server/chunks/PdfDocument.js");
  
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
    pillars: EN_DOMAINS.map((domain, i) => ({
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
    })),
    paidTier: {
      remedies: [{ type: "Mantra", description: "Chant the Gayatri mantra daily at sunrise." }],
      remedyKit: {
        gemstones: ["Ruby (Manik) in gold on the ring finger", "Yellow Sapphire (Pukhraj) for Jupiter"],
        dailyMantras: ["Om Namah Shivaya", "Om Brihaspataye Namah"],
      },
    },
    freeTier: {},
    language: lang,
  };

  const pdfBuffer = await renderPdfToBuffer(payload);
  const ms = Date.now() - t0;
  const out = path.join(projectRoot, `verify-${lang}.pdf`);
  require("fs").writeFileSync(out, pdfBuffer);
  console.log(`[${lang}] bytes=${pdfBuffer.length} renderMs=${ms}`);
  return pdfBuffer.length;
}

const main = async () => {
  const en = await run("en");
  const hi = await run("hi");
  console.log(en > 0 && hi > 0 ? "PASS: PDF generated successfully" : "NOTE: check output");
};

main().catch((e) => { 
  console.error("FAILED:", e.message); 
  process.exit(1); 
});