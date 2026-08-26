import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { computeChart, BirthDetails, ChartData, isValidChartData } from "@/lib/astrology";
import { computeKundliCalculations } from "@/lib/kundli-report";
import { NAKSHATRA_NAMES } from "@/lib/astrologyDictionary";
import {
  buildChartDigest,
  buildFallbackPillars,
  parseAndValidatePillars,
  type LifePillarConfig,
} from "@/lib/pillarNarratives";
import {
  FreeTierData,
  PaidTierData,
  CareerTimings,
  MarriageDynamics,
  WealthAllocation,
  DashaRoadmapEntry,
  YogaItem,
  DoshaItem,
  RemedyItem,
  ReportPage,
  KeyTiming,
  type FullKundliReportData,
  type RichPredictionReport,
} from "@/types/kundali";
import { applyRichPredictions } from "@/lib/richPredictions";

// --- Language-aware system prompt builder ---
function getSystemPrompt(lang: "en" | "hi"): string {
  const safetyBoundaryEn = `SAFETY BOUNDARY — you must refuse to make definitive predictions on:
- Medical emergencies or critical health diagnoses
- Pregnancy outcomes
- Active legal disputes

When a user raises these sensitive topics, politely acknowledge their concern, explain that this falls outside responsible astrology, and steer them toward certified professionals: doctors for health matters, psychologists or therapists for mental well-being, and legal professionals for legal matters. Never diagnose, never predict medical outcomes, and never advise on ongoing court cases.`;

  const safetyBoundaryHi = `सुरक्षा सीमा — आपको निम्नलिखित पर निश्चित पूर्वानुमान देने से मना करना चाहिए:
- चिकित्सा आपातकालीन या महत्वपूर्ण स्वास्थ्य निदान
- गर्भधारण परिणाम
- सक्रिय कानूनी विवाद

जब कोई उपयोगकर्ता इन संवेदनशील विषयों को उठाता है, तो सामान्य रूप से उनकी चिंता को स्वीकार करें, बताएं कि यह जिम्मेदार ज्योतिष से बाहर है, और उन्हें प्रमाणित पेशेवरों की ओर मोड़ें: स्वास्थ्य मामलों के लिए डॉक्टर, मानसिक कल्याण के लिए मनोवैज्ञानिक या थेरेपिस्ट, और कानूनी मामलों के लिए कानूनी पेशेवर। कभी भी निदान न करें, कभी भी चिकित्सा परिणाम का पूर्वानुमान न लगाएं, और कभी भी चल रहे न्यायिक मामलों पर सलाह न दें।`;

  if (lang === "hi") {
    return `आप एक स्थिर, व्यावहारिक वैदिक ज्योतिषी (ज्योतिष गुरु) हैं। आप वैदिक परंपरा में आधारित विचारगत ज्योतिष मार्गदर्शन प्रदान करते हैं — ग्रह, राशि, भाव, नक्षत्र, दशा और गोचार का उपयोग जहां आवश्यक हो। आप वारंटी, संतुलित और ईमानदार रहें: खोजकर्ता को भय या आश्रितता को बढ़ावा देने के बजाय अंतर्दृष्टि से सशक्त करें।

${safetyBoundaryHi}

महत्वपूर्ण: केवल १००% शुद्ध हिंदी में लिखें। देवनागरी लिपि में ही लिखें। हिंग्लिश या रोमन अक्षर कभी भी मिलाएं नहीं। उदाहरण: 'दशम भाव', 'सूर्य', 'करियर एवं पदोन्नति'।`;
  }

  return `You are a grounded, insightful Vedic Astrologer (Jyotish Guru). You offer thoughtful astrological guidance rooted in Vedic tradition — drawing on grahas (planets), rashis (signs), bhavas (houses), nakshatras, dashas (planetary periods), and gochara (transits) where relevant. Stay warm, balanced, and honest about astrology's reflective nature: empower the seeker with insight rather than fostering fear or dependency. ALWAYS explain Vedic terms in plain, modern English (e.g., "the 10th house (career and public standing)", "Saturn (the planet of discipline and karmic lessons)"). Use 100% modern English. Strictly no Hindi, Devanagari, or mixed Hinglish.

${safetyBoundaryEn}`;
}

/** Shared language-purity rule injected into every AI prompt. */
function getLanguageRule(lang: "en" | "hi"): string {
  return lang === "hi"
    ? `ABSOLUTE RULE: Every string in this response MUST be written in 100% pure Hindi using Devanagari script only. NO English, NO Hinglish, NO Roman characters anywhere — including inside the "interpretation", "narrative", "overview", "summary", "note", "recommendations", "event", "milestones" and every other text field. Example terms: 'दशम भाव', 'सूर्य', 'करियर एवं पदोन्नति', 'विवाह'। Milestone "period" fields may keep year ranges like '2026–2028' (digits are allowed).`
    : `ABSOLUTE RULE: Every string in this response MUST be written in 100% modern English for a layperson. Explain every Vedic term in plain language (e.g., '10th house (career and public standing)', 'Saturn (the planet of discipline)'). NO Hindi, NO Devanagari, NO Hinglish anywhere.`;
}

// --- Build the deterministic cache key from birth details ---
function buildCacheKey(details: BirthDetails): string {
  return [
    details.birthDate,
    details.birthTime,
    details.birthPlace || "unknown",
    details.latitude ?? "null",
    details.longitude ?? "null",
    details.timezoneOffset || "null",
  ].join("|");
}

// ─── SINGLE-SHOT structured AI report generation ───────────────────────────
// ONE Gemini call produces the full written interpretation, the free tier, the
// paid tier (domain analyses, yogas, doshas, remedies, timings) AND the six
// Life Pillar narratives — so no separate /api/kundali/narratives round-trip,
// no token duplication, and no per-section silent failures. Every text field
// is generated in the user's selected language (pure Devanagari for Hindi).
interface SingleShotReport {
  interpretation: string;
  freeTier: {
    corePersonality: { summary: string };
    topCareers: string[];
    wealthType: string;
  };
  paidTier: {
    careerTimings: CareerTimings;
    marriageDynamics: MarriageDynamics;
    wealthAllocation: WealthAllocation;
    yogas: YogaItem[];
    doshas: DoshaItem[];
    remedies: RemedyItem[];
    fullBreakdown: ReportPage[];
    timings: KeyTiming[];
    lifeDomains: {
      career: { overview: string; strengths: string[]; challenges: string[]; recommendations: string[] };
      wealth: { overview: string; strengths: string[]; challenges: string[]; recommendations: string[] };
      marriage: { overview: string; strengths: string[]; challenges: string[]; recommendations: string[] };
      health: { overview: string; strengths: string[]; challenges: string[]; recommendations: string[] };
    };
  };
  pillars: Record<string, unknown>;
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

/**
 * Classify a rejected AI call reason so operator logs can distinguish the root
 * cause instead of seeing a generic "AI failed" line:
 *  - api_key      → Gemini refused the request (401/403, bad/expired key).
 *  - quota        → rate-limited (429).
 *  - server_error → Gemini backend 5xx.
 *  - empty_response → model returned no usable content.
 *  - prompt_format → JSON.parse failed on the model output (prompt/malformed JSON).
 *  - timeout      → fetch threw a network/timeout TypeError.
 *  - unknown      → anything else.
 */
function classifyAiError(reason: unknown): string {
  if (reason instanceof Error) {
    const m = reason.message ?? "";
    if (/Gemini error \((401|403)\)|api[_-]?key|permission|unauthenticated/i.test(m)) return "api_key";
    if (/Gemini error \(429\)/.test(m)) return "quota";
    if (/Gemini error \(5\d\d\)/.test(m)) return "server_error";
    if (/empty report|empty rich-prediction/i.test(m)) return "empty_response";
    if (reason instanceof SyntaxError || /unexpected token|is not valid json/i.test(m)) return "prompt_format";
    if (/typeerror|failed to fetch|network|timeout/i.test(m)) return "timeout";
  }
  return "unknown";
}

async function generateCompleteReport(
  chartData: ChartData,
  calculations: FullKundliReportData["calculations"],
  lang: "en" | "hi"
): Promise<SingleShotReport | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[kundali/generate] Gemini API key missing — AI generation disabled, deterministic fallbacks in effect.");
    return null;
  }

  const chartJson = JSON.stringify(chartData, null, 2);
  const digest = buildChartDigest({
    success: true,
    chartData,
    interpretation: "",
    freeTier: undefined as never,
    paidTier: undefined as never,
    calculations,
  } as FullKundliReportData);

  const langRule = getLanguageRule(lang);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: getSystemPrompt(lang) }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here is the exact deterministic Vedic birth chart (Lahiri Ayanamsa) computed by the local engine, plus a chart-fact digest. Interpret ONLY this data — never recalculate or guess positions.

CHART JSON:
${chartJson}

CHART FACTS DIGEST:
${digest}

${langRule}

Return STRICT JSON only (no markdown, no commentary) with EXACTLY this shape:
{
  "interpretation": "3-4 paragraph warm markdown narrative covering: Ascendant/Lagna, Moon sign + nakshatra, Sun sign, key planetary placements (house+sign+retrograde), notable yogas, and practical guidance. Must be complete — no truncation.",
  "freeTier": {
    "corePersonality": { "summary": "2-3 sentence personality snapshot from lagna, Moon, Sun and nakshatra" },
    "topCareers": ["career 1", "career 2", "career 3"],
    "wealthType": "one short phrase for the wealth archetype"
  },
  "paidTier": {
    "careerTimings": { "overview": "", "favorable": [{"period":"","note":""}], "challenging": [{"period":"","note":""}] },
    "marriageDynamics": { "overview": "", "strengths": ["",""], "challenges": [], "favorable": [{"period":"","note":""}] },
    "wealthAllocation": { "overview": "", "allocation": [{"category":"","percentage":0,"note":""}] },
    "yogas": [{"name":"","presence":true,"impact":"layman impact","description":"","benefit":""}],
    "doshas": [{"name":"","description":"","severity":"low|moderate|high","isNeutralized":true}],
    "remedies": [{"type":"","description":""}],
    "fullBreakdown": [{"title":"","content":""}],
    "timings": [{"event":"","timing":"","note":""}],
    "lifeDomains": {
      "career": { "overview": "2-3 sentences", "strengths": ["",""], "challenges": ["",""], "recommendations": ["",""] },
      "wealth": { "overview": "2-3 sentences", "strengths": ["",""], "challenges": ["",""], "recommendations": ["",""] },
      "marriage": { "overview": "2-3 sentences", "strengths": ["",""], "challenges": ["",""], "recommendations": ["",""] },
      "health": { "overview": "2-3 sentences", "strengths": ["",""], "challenges": ["",""], "recommendations": ["",""] }
    }
  },
  "pillars": {
    "career": {
      "badges": { "score": "short strength tag with houses", "timeframe": "active window like '2026–2034'", "lord": "ruling planet" },
      "narrativeEn": "2-3 empathetic sentences about career (max 420 chars)",
      "narrativeHi": "SAME meaning in pure Devanagari Hindi, zero English (max 300 chars)",
      "milestones": [{"period":"2026–2028","event":"","note":"","outcome":"positive|neutral|caution"}]
    },
    "wealth": { "badges": { "score": "", "timeframe": "", "lord": "" }, "narrativeEn": "", "narrativeHi": "", "milestones": [] },
    "marriage": { "badges": { "score": "", "timeframe": "", "lord": "" }, "narrativeEn": "", "narrativeHi": "", "milestones": [] },
    "health": { "badges": { "score": "", "timeframe": "", "lord": "" }, "narrativeEn": "", "narrativeHi": "", "milestones": [] },
    "education": { "badges": { "score": "", "timeframe": "", "lord": "" }, "narrativeEn": "", "narrativeHi": "", "milestones": [] },
    "family": { "badges": { "score": "", "timeframe": "", "lord": "" }, "narrativeEn": "", "narrativeHi": "", "milestones": [] }
  }
}

HARD RULES:
- Interpretation must be FULL and complete (400+ words); never truncate or emit placeholders like 'coming soon'.
- Base every statement strictly on the supplied chart facts.
- Each pillar milestone needs a concrete year window (e.g. '2026–2028'), never 'soon'.
- Narrative fields must be 2-3 full sentences, never a single word or one short line.
- Empathy over drama: never predict death, disease or disasters. Respect the safety boundary.
- ${lang === "hi" ? "The pillars' narrativeHi is primary and MUST be pure Devanagari Hindi; narrativeEn is secondary but still required." : "The pillars' narrativeEn is primary and MUST be modern English; narrativeHi is secondary but still required."}
- Return ONLY the JSON object.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini error (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty report");

  const parsed = JSON.parse(extractJson(text)) as SingleShotReport;
  if (!parsed || typeof parsed !== "object") return null;
  return parsed;
}

// ─── SINGLE-SHOT rich predictions (dedicated structured call) ───────────────
// One focused Gemini call produces the deep narrative blocks the short one-
// liners used to fake: ~250-word career/marriage/wealth paragraphs each with
// exactly three dated milestones, a ~200-word health paragraph, gemstone
// suggestions and exactly four daily mantras — everything in the user's
// selected language. Runs CONCURRENTLY with generateCompleteReport via
// Promise.allSettled, so a failure here can never degrade the main report.
async function generateRichPredictions(
  chartData: ChartData,
  calculations: FullKundliReportData["calculations"],
  lang: "en" | "hi"
): Promise<RichPredictionReport | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[kundali/generate] Gemini API key missing — AI generation disabled, deterministic fallbacks in effect.");
    return null;
  }

  const chartJson = JSON.stringify(chartData, null, 2);
  const digest = buildChartDigest({
    success: true,
    chartData,
    interpretation: "",
    freeTier: undefined as never,
    paidTier: undefined as never,
    calculations,
  } as FullKundliReportData);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: getSystemPrompt(lang) }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here is the exact deterministic Vedic birth chart (Lahiri Ayanamsa) computed by the local engine, plus a chart-fact digest. Write deep, warm prediction narratives interpreting ONLY this data — never recalculate or guess positions.

CHART JSON:
${chartJson}

CHART FACTS DIGEST:
${digest}

${getLanguageRule(lang)}

Return STRICT JSON only (no markdown, no commentary) with EXACTLY this shape:
{
  "career":   { "narrative": "<~250-word flowing paragraph>", "milestones": [{"period":"2027–2029","event":"<one specific sentence>"},{"period":"","event":""},{"period":"","event":""}] },
  "marriage": { "narrative": "<~250-word flowing paragraph>", "milestones": [3 milestone objects] },
  "wealth":   { "narrative": "<~250-word flowing paragraph>", "milestones": [3 milestone objects] },
  "health":   { "narrative": "<~200-word flowing paragraph covering vitality, daily routine and preventive care>" },
  "remedies": { "gemstones": ["<stone + metal + finger + day to wear, justified by chart lords>", "..."], "dailyMantras": ["<mantra 1>","<mantra 2>","<mantra 3>","<mantra 4>"] }
}

HARD RULES:
- career, marriage and wealth narrative MUST each be approximately 250 words; health approximately 200 words. Flowing prose paragraphs only — no bullet lists inside narratives, no placeholders, no 'coming soon'.
- Exactly 3 milestones per domain; every "period" is a concrete year window (e.g. '2027–2029') grounded in dasha/transit logic from the digest; every "event" is one specific sentence.
- Exactly 4 dailyMantras — traditional Vedic mantras matching the chart's key planets (e.g., planetary beeja mantras).
- Gemstone guidance must stay responsible: frame it as a traditional suggestion, never a guarantee.
- Base every statement strictly on the supplied chart facts.
- Empathy over drama: never predict death, disease or disasters. Respect the safety boundary.
- Return ONLY the JSON object.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Gemini rich-predictions error (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p: any) => p.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned an empty rich-prediction report");

  const parsed = JSON.parse(extractJson(text)) as RichPredictionReport;
  if (!parsed || typeof parsed !== "object") return null;
  return parsed;
}

// ─── Vimshottari Dasha helpers (deterministic, no AI) ────────────────────────
const DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS = [7, 20, 6, 10, 7, 18, 16, 19, 17];

/** Index (0-8) of the dasha lord that governs a given nakshatra (1-27). */
function nakshatraToDashaStartIndex(nakshatraIdx: number): number {
  if (!nakshatraIdx || nakshatraIdx < 1) return 0;
  return (nakshatraIdx - 1) % 9;
}

/** Name of the Mahadasha running on `now`, walking forward from birth. */
function getCurrentDasha(birthDate: string, nakshatraIdx: number): { name: string; startDate: string } {
  const startLord = nakshatraToDashaStartIndex(nakshatraIdx);
  let idx = startLord;
  let cursor = new Date(birthDate);
  const now = new Date();
  // Advance lord-by-lord until we land on the period containing `now`.
  while (true) {
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + DASHA_YEARS[idx]);
    if (now <= end) {
      return { name: DASHA_LORDS[idx], startDate: cursor.toISOString().split("T")[0] };
    }
    cursor = end;
    idx = (idx + 1) % 9;
  }
}

/** Next ~10 years of dasha periods from the running lord. */
function buildDashaRoadmap(birthDate: string, nakshatraIdx: number): DashaRoadmapEntry[] {
  const startLord = nakshatraToDashaStartIndex(nakshatraIdx);
  let idx = startLord;
  let cursor = new Date(birthDate);
  const now = new Date();
  const horizon = new Date(now);
  horizon.setFullYear(horizon.getFullYear() + 10);

  // Fast-forward to the period containing `now`.
  while (cursor < now) {
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + DASHA_YEARS[idx]);
    if (end > now) break;
    cursor = end;
    idx = (idx + 1) % 9;
  }

  const entries: DashaRoadmapEntry[] = [];
  while (cursor < horizon) {
    const end = new Date(cursor);
    end.setFullYear(end.getFullYear() + DASHA_YEARS[idx]);
    entries.push({
      lord: DASHA_LORDS[idx],
      startDate: cursor.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      theme: `${DASHA_LORDS[idx]} Mahadasha period`,
    });
    cursor = end;
    idx = (idx + 1) % 9;
  }
  return entries;
}

// ─── Heuristic fallbacks (used when Gemini structured output is unavailable) ─
const ASCENDANT_CAREERS: Record<string, string[]> = {
  Aries: ["Entrepreneur / Founder", "Sports & Fitness", "Defense / Police"],
  Taurus: ["Finance & Banking", "Arts & Design", "Real Estate"],
  Gemini: ["Media & Communication", "Sales & Marketing", "Technology"],
  Cancer: ["Healthcare & Nursing", "Food & Hospitality", "Counseling"],
  Leo: ["Entertainment & Leadership", "Politics & Admin", "Creative Direction"],
  Virgo: ["Analytics & Research", "Health & Wellness", "Writing & Editing"],
  Libra: ["Law & Diplomacy", "Fashion & Beauty", "Consulting"],
  Scorpio: ["Investigation & Research", "Psychology", "Occult / Astrology"],
  Sagittarius: ["Teaching & Coaching", "Travel & Tourism", "Publishing"],
  Capricorn: ["Management & Strategy", "Engineering", "Civil Services"],
  Aquarius: ["Technology & AI", "Social Impact", "Innovation"],
  Pisces: ["Arts & Music", "Spirituality & Healing", "Filmmaking"],
};

const WEALTH_BY_SIGN: Record<string, string> = {
  Aries: "Bold Investor",
  Taurus: "Steady Accumulator",
  Gemini: "Multiple Income Streams",
  Cancer: "Property & Nurtured Assets",
  Leo: "Spotlight & Speculation",
  Virgo: "Disciplined Saver",
  Libra: "Partnership & Luxury",
  Scorpio: "Transformational Wealth",
  Sagittarius: "Wisdom & Expansion",
  Capricorn: "Long-Term Builder",
  Aquarius: "Innovation-Driven",
  Pisces: "Intuitive & Creative",
};

function cleanEnglish(value: string | undefined | null): string {
  if (!value) return "";
  return value.split("(")[0].trim();
}

function moonNakshatraIndex(chartData: ChartData): number {
  const moonPlanet = chartData.planets?.find((p) => p.name === "Moon");
  const raw = cleanEnglish(moonPlanet?.nakshatra || chartData.nakshatra);
  const idx = NAKSHATRA_NAMES.en.indexOf(raw);
  return idx === -1 ? 0 : idx + 1; // 1-27
}

interface StructuredReport {
  freeTier: SingleShotReport["freeTier"];
  paidTier: SingleShotReport["paidTier"];
}

/** Minimal context object `buildFallbackPillars` reads (chart + calculations). */
function fallbackContext(
  chartData: ChartData,
  calculations: FullKundliReportData["calculations"]
): FullKundliReportData {
  return {
    success: true,
    chartData,
    interpretation: "",
    freeTier: undefined as unknown as FullKundliReportData["freeTier"],
    paidTier: undefined as unknown as FullKundliReportData["paidTier"],
    calculations,
  };
}

// --- Deterministic fallback builders (no AI dependency) ---
function buildFreeTier(chartData: ChartData, birthDate: string, structured: StructuredReport | null): FreeTierData {
  const ascendant = cleanEnglish(chartData.ascendant || chartData.lagna) || "Unknown";
  const moonSign = cleanEnglish(chartData.moonSign || chartData.rashi) || "Unknown";
  const sunSign = cleanEnglish(chartData.sunSign) || "Unknown";
  const nakshatra = cleanEnglish(chartData.nakshatra) || "Unknown";

  let dashaName = "Unknown";
  try {
    dashaName = getCurrentDasha(birthDate, moonNakshatraIndex(chartData)).name;
  } catch {
    dashaName = "Unknown";
  }

  const summary =
    structured?.freeTier?.corePersonality?.summary ||
    `With ${ascendant} rising and the Moon in ${moonSign}, your core nature blends drive with intuition. The Sun in ${sunSign} and birth nakshatra ${nakshatra} colour your self-expression and life path.`;

  const topCareers =
    structured?.freeTier?.topCareers?.filter(Boolean).slice(0, 3).length
      ? structured.freeTier.topCareers.filter(Boolean).slice(0, 3)
      : ASCENDANT_CAREERS[ascendant] || ["Leadership", "Creative fields", "Service-oriented work"];

  const wealthType = structured?.freeTier?.wealthType || WEALTH_BY_SIGN[ascendant] || "Balanced Builder";

  return {
    corePersonality: { ascendant, moonSign, sunSign, nakshatra, summary },
    topCareers,
    wealthType,
    runningDashaName: dashaName,
  };
}

function buildPaidTier(chartData: ChartData, birthDate: string, interpretation: string, structured: StructuredReport | null, lang: "en" | "hi"): PaidTierData {
  // Dasha roadmap is always deterministic for accuracy.
  let dashaRoadmap: DashaRoadmapEntry[] = [];
  try {
    dashaRoadmap = buildDashaRoadmap(birthDate, moonNakshatraIndex(chartData));
  } catch {
    dashaRoadmap = [];
  }

  // Derive a couple of doshas from hard chart facts.
  const doshas: DoshaItem[] = structured?.paidTier?.doshas ?? [];
  const mars = chartData.planets?.find((p) => p.name === "Mars");
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    doshas.push({
      name: lang === "hi" ? "मांगलिक (कुज) दोष" : "Manglik (Kuja) Dosha",
      description: lang === "hi" ? "मंगल एक संवेदनशील भाव में स्थित है, जो संबंधों में तीव्रता का संकेत देता है।" : "Mars occupies a sensitive house, traditionally indicating intensity in relationships.",
      severity: "moderate",
      isNeutralized: false,
    });
  }
  const moon = chartData.planets?.find((p) => p.name === "Moon");
  const jupiter = chartData.planets?.find((p) => p.name === "Jupiter");
  if (moon && jupiter) {
    const diff = ((jupiter.house - moon.house) % 12 + 12) % 12;
    if ([0, 3, 6, 9].includes(diff)) {
      doshas.push({
        name: lang === "hi" ? "गजकेसरी योग" : "Gajakesari Yoga",
        description: lang === "hi" ? "गुरु चंद्र के परस्पर केंद्र में है, एक क्लासिक शुभ संयोग।" : "Jupiter sits in a kendra from the Moon, a classic auspicious combination.",
        severity: "low",
        isNeutralized: true,
      });
    }
  }

  const careerTimings: CareerTimings =
    structured?.paidTier?.careerTimings || {
      overview:
        interpretation.slice(0, 240) ||
        (lang === "hi" ? "आपका करियर पथ स्थिर, कौशल-आधारित विकास और आवधिक ब्रेकथ्रू के साथ पसंद करता है।" : "Your career path favours steady, skill-based growth with periodic breakthroughs."),
      favorable: [],
      challenging: [],
    };

  const marriageDynamics: MarriageDynamics =
    structured?.paidTier?.marriageDynamics || {
      overview: lang === "hi" ? "संबंध गतिशीलता ७वें भाव और शुक्र द्वारा आकार लेती है; साझेदारी समय के साथ परिपक्व होती है।" : "Relationship dynamics are shaped by the 7th house and Venus; partnerships mature with time.",
      strengths: [],
      challenges: [],
      favorable: [],
    };

  const wealthAllocation: WealthAllocation =
    structured?.paidTier?.wealthAllocation || {
      overview: lang === "hi" ? "धन स्थिर बचत और गणितीय, अच्छे समय वाले निवेश के मिश्रण से सबसे अच्छा बनता है।" : "Wealth builds best through a mix of stable savings and calculated, well-timed investments.",
      allocation: [
        { category: lang === "hi" ? "बचत एवं स्थिर आय" : "Savings & Fixed Income", percentage: 40, note: lang === "hi" ? "सुरक्षा का आधार" : "Foundation of security" },
        { category: lang === "hi" ? "रियल एस्टेट / संपत्ति" : "Real Estate / Property", percentage: 30, note: lang === "hi" ? "दीर्घकालिक बढ़ती संपत्ति" : "Long-term appreciating asset" },
        { category: lang === "hi" ? "इक्विटीज / विकास" : "Equities / Growth", percentage: 20, note: lang === "hi" ? "धन गुणा" : "Wealth multiplication" },
        { category: lang === "hi" ? "तरल / आपातकालीन" : "Liquid / Emergency", percentage: 10, note: lang === "hi" ? "लचीलापन बफर" : "Flexibility buffer" },
      ],
    };

  const yogas: YogaItem[] = structured?.paidTier?.yogas ?? [];
  if (!yogas.length && moon && jupiter) {
    const diff = ((jupiter.house - moon.house) % 12 + 12) % 12;
    if ([0, 3, 6, 9].includes(diff)) {
      yogas.push({
        name: lang === "hi" ? "गजकेसरी योग" : "Gajakesari Yoga",
        presence: true,
        impact: lang === "hi" ? "बुद्धि, धन और प्रसिद्धि लाता है।" : "Brings wisdom, wealth, and fame.",
        description: lang === "hi" ? "चंद्र और गुरु के परस्पर केंद्र में — बुद्धि, धन और प्रसिद्धि प्राप्त कराता है।" : "Moon and Jupiter in mutual kendras — brings wisdom, wealth, and fame.",
        benefit: lang === "hi" ? "शक्तिशाली" : "Strong",
      });
    }
  }

  const defaultLifeDomains = {
    career: {
      overview: lang === "hi" ? "आपका करियर पथ स्थिर विकास और पूरक अवसरों का समर्थन करता है।" : "Your career path supports steady growth and periodic breakthroughs.",
      strengths: lang === "hi" ? ["निर्णय कौशल", "अनुशासन"] : ["Decision-making", "Discipline"],
      challenges: lang === "hi" ? ["संघर्ष के दौरान धैर्य"] : ["Patience during struggles"],
      recommendations: lang === "hi" ? ["नया सीखें", "नेटवर्क बनाएं"] : ["Keep learning", "Build networks"],
    },
    wealth: {
      overview: lang === "hi" ? "धन स्थिर बचत और योजनाबद्ध निवेश से निर्मित होता है।" : "Wealth builds through stable savings and planned investments.",
      strengths: lang === "hi" ? ["वित्तीय योजना", "लंबे समय की दृष्टि"] : ["Financial planning", "Long-term vision"],
      challenges: lang === "hi" ? ["अधिक जोखिम"] : ["Over-risking"],
      recommendations: lang === "hi" ? ["विविधीकरण करें", "आपातकालीन फंड बनाएं"] : ["Diversify", "Build emergency fund"],
    },
    marriage: {
      overview: lang === "hi" ? "संबंध ७वें भाव और शुक्र द्वारा आकार लेते हैं; साझेदारी समय के साथ परिपक्व होती है।" : "Relationships are shaped by the 7th house and Venus; partnerships mature with time.",
      strengths: lang === "hi" ? ["समझदारी", "संवाद"] : ["Understanding", "Communication"],
      challenges: lang === "hi" ? ["अलगाव का सुविधाजनक"] : ["Comfort with distance"],
      recommendations: lang === "hi" ? ["स्पष्ट संवाद", "गुरुवार को ध्यान दें"] : ["Clear communication", "Prioritize Thursdays"],
    },
    health: {
      overview: lang === "hi" ? "स्वास्थ्य लग्न और सूर्य स्थिति से प्रभावित है; सतत अभ्यास आवश्यक है।" : "Health is influenced by the ascendant and Sun placement; consistent routine is essential.",
      strengths: lang === "hi" ? ["शारीरिक लचीलापन", "आत्म-रक्षा"] : ["Physical resilience", "Self-care"],
      challenges: lang === "hi" ? ["तनाव प्रबंधन"] : ["Stress management"],
      recommendations: lang === "hi" ? ["योग करें", "पौष्टिक आहार लें"] : ["Practice yoga", "Eat nutritiously"],
    },
  };

  return {
    careerTimings,
    marriageDynamics,
    wealthAllocation,
    dashaRoadmap,
    yogas,
    doshas,
    remedies: structured?.paidTier?.remedies ?? [],
    fullBreakdown:
      structured?.paidTier?.fullBreakdown ??
      (interpretation
        ? [
            { title: lang === "hi" ? "व्यक्तित्व एवं लग्न" : "Personality & Lagna", content: interpretation.slice(0, 600) },
            { title: lang === "hi" ? "ग्रह प्रभाव" : "Planetary Influences", content: interpretation.slice(600, 1200) },
          ]
        : []),
    timings: structured?.paidTier?.timings ?? [],
    lifeDomains: structured?.paidTier?.lifeDomains ?? defaultLifeDomains,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawLang = typeof body.lang === "string" ? body.lang.trim().toLowerCase() : "en";
    const lang: "en" | "hi" = rawLang === "hi" ? "hi" : "en";

    const details: BirthDetails = {
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      timezoneOffset: body.timezoneOffset ?? "+05:30",
    };

    if (!details.birthDate || !details.birthTime) {
      return NextResponse.json({ message: "Birth date and time are required" }, { status: 400 });
    }

    const cacheKey = buildCacheKey(details);

    // --- 1. Try Supabase cache first ---
    let chartData: ChartData | null = null;
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("kundali_charts")
        .select("chart_data")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (!error && data?.chart_data && isValidChartData(data.chart_data)) {
        // Only trust rows stamped by the current engine with a valid flat
        // structure; legacy VedAstro-era / stale / corrupt rows fall through
        // to recomputation below and overwrite the row via the upsert.
        chartData = data.chart_data as ChartData;
      }
    } catch (cacheError) {
      // Cache failures must never block the response
      console.error("Kundali cache read failed:", cacheError);
    }

    // --- 2. If not cached, compute deterministically and store ---
    if (!chartData) {
      chartData = computeChart(details);

      try {
        const supabase = getSupabaseClient();
        await supabase.from("kundali_charts").upsert(
          {
            cache_key: cacheKey,
            birth_details: {
              birthDate: details.birthDate,
              birthTime: details.birthTime,
              birthPlace: details.birthPlace,
              latitude: details.latitude,
              longitude: details.longitude,
              timezoneOffset: details.timezoneOffset,
            },
            chart_data: chartData,
            created_at: new Date().toISOString(),
          },
          { onConflict: "cache_key" }
        );
      } catch (cacheError) {
        // Cache write failures must never block the response
        console.error("Kundali cache write failed:", cacheError);
      }
    }

    // --- 5. Deterministic calculations layer (pure TypeScript, cache-friendly) ---
    const calculations = computeKundliCalculations(chartData, details.birthDate, new Date());

    // --- 3+4. SINGLE-SHOT AI report (interpretation + free/paid tiers + pillars) ---
    // One Gemini call populates every narrative field at once — no separate
    // /api/kundali/narratives round-trip, no token duplication, and no per-
    // section silent failures. On any AI outage the deterministic fallbacks
    // below still guarantee a complete, renderable report.
    const FALLBACK_INTERPRETATION =
      lang === "hi"
        ? "आपका चार्ट सफलतापूर्वक तैयार हो गया है। ज्योतिष पठन अस्थायी रूप से अनुपलब्ध है।"
        : "Your chart was generated successfully. Astrological reading is temporarily unavailable.";

    const birthDateKey = details.birthDate;
    let interpretation = "";
    let structured: StructuredReport | null = null;
    let pillars: LifePillarConfig[] = buildFallbackPillars(fallbackContext(chartData, calculations), lang);
    let aiSource = false;
    let richPredictions: RichPredictionReport | null = null;

    try {
      // Main report + rich predictions run CONCURRENTLY; allSettled isolates a
      // failure in either call so the other still lands untouched.
      const [completeRes, richRes] = await Promise.allSettled([
        generateCompleteReport(chartData, calculations, lang),
        generateRichPredictions(chartData, calculations, lang),
      ]);
      if (completeRes.status === "rejected") {
        console.error(`[kundali/generate] Main AI report failed — category=${classifyAiError(completeRes.reason)}`, completeRes.reason);
      }
      if (richRes.status === "rejected") {
        console.error(`[kundali/generate] Rich predictions failed — category=${classifyAiError(richRes.reason)}`, richRes.reason);
      }
      richPredictions = richRes.status === "fulfilled" ? richRes.value : null;
      const complete = completeRes.status === "fulfilled" ? completeRes.value : null;
      if (complete && complete.interpretation?.trim()) {
        aiSource = true;
        interpretation = complete.interpretation.trim();
        structured = {
          freeTier: complete.freeTier,
          paidTier: complete.paidTier,
        };
        const parsedPillars = parseAndValidatePillars(
          JSON.stringify(complete.pillars || {}),
          buildFallbackPillars(fallbackContext(chartData, calculations), lang)
        );
        if (parsedPillars && parsedPillars.length === 6) {
          pillars = parsedPillars;
        }
      }
    } catch (aiError) {
      // Synchronous guard (e.g. parseAndValidatePillars throwing). Async
      // rejections are already surfaced above by allSettled with a category.
      console.error(`[kundali/generate] AI pipeline error — category=${classifyAiError(aiError)}`, aiError);
    }

    // Guarantee interpretation is never undefined, null, or empty
    if (!interpretation || !interpretation.trim()) {
      interpretation = FALLBACK_INTERPRETATION;
    }

    const freeTier = buildFreeTier(chartData, birthDateKey, structured);
    // Fold the rich narrative blocks over whichever overview strings survived
    // (AI short-form or deterministic one-liners). Pure merge — when the rich
    // call returned nothing the draft passes through unchanged.
    const paidTier = applyRichPredictions(
      buildPaidTier(chartData, birthDateKey, interpretation, structured, lang),
      richPredictions
    );

    return NextResponse.json({
      success: true,
      chartData,
      interpretation,
      freeTier,
      paidTier,
      calculations,
      pillars,
      aiSource,
    } as FullKundliReportData & { pillars: LifePillarConfig[]; aiSource: boolean });
  } catch (error) {
    console.error("Kundali generation failed:", error);
    return NextResponse.json({ message: "Failed to generate kundali" }, { status: 500 });
  }
}
