import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { computeChart, BirthDetails, ChartData, isValidChartData } from "@/lib/astrology";
import { computeKundliCalculations } from "@/lib/kundli-report";
import { NAKSHATRA_NAMES } from "@/lib/astrologyDictionary";
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
} from "@/types/kundali";

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

// --- Generate the written interpretation via Gemini (temperature 0.2, chart-data-only) ---
async function generateInterpretation(chartData: ChartData, lang: "en" | "hi"): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const chartJson = JSON.stringify(chartData, null, 2);

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${getSystemPrompt(lang)}\n\nYou are given the exact, deterministic Vedic chart data (Lahiri Ayanamsa) computed by the local calculation engine. Interpret ONLY the provided planetary and house data. Do not recalculate, modify, or guess any astronomical positions. Base every statement strictly on the JSON chart data supplied.`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here is the birth chart data (JSON):\n\n${chartJson}\n\nPlease provide a warm, insightful Vedic astrology interpretation covering: the Ascendant/Lagna and its significance, the Moon sign and nakshatra, the Sun sign, key planetary placements (house + sign + retrograde status), notable yogas, and practical guidance. Keep it structured and readable.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!geminiResponse.ok) {
    const body = await geminiResponse.text().catch(() => "");
    throw new Error(`Gemini API error (${geminiResponse.status}): ${body.slice(0, 300)}`);
  }

  const json = await geminiResponse.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty interpretation");
  }

  return text;
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
      career: {
        overview: string;
        strengths: string[];
        challenges: string[];
        recommendations: string[];
      };
      wealth: {
        overview: string;
        strengths: string[];
        challenges: string[];
        recommendations: string[];
      };
      marriage: {
        overview: string;
        strengths: string[];
        challenges: string[];
        recommendations: string[];
      };
      health: {
        overview: string;
        strengths: string[];
        challenges: string[];
        recommendations: string[];
      };
    };
  };
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

// --- Generate the structured free/paid breakdown via Gemini (structured JSON) ---
async function generateStructuredReport(
  chartData: ChartData,
  interpretation: string,
  lang: "en" | "hi"
): Promise<StructuredReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const chartJson = JSON.stringify(chartData, null, 2);

  const langInstruction =
    lang === "hi"
      ? "ABSOLUTE RULE: Output MUST be 100% pure Hindi in Devanagari script. NO English, NO Hinglish, NO Roman characters anywhere. Example terms: 'दशम भाव', 'सूर्य', 'करियर एवं पदोन्नति'."
      : "ABSOLUTE RULE: Output MUST be 100% modern English. Explain all Vedic terms in plain language (e.g., '10th house = career and public standing'). Strictly no Hindi or Devanagari.";

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
                text: `Here is the exact deterministic birth chart JSON:\n\n${chartJson}\n\n${interpretation}\n\n${langInstruction}\n\nReturn STRICT JSON (no markdown, no commentary) of this exact shape:
{
  "freeTier": {
    "corePersonality": { "summary": "2-3 sentence personality snapshot from lagna, Moon, Sun and nakshatra" },
    "topCareers": ["career 1", "career 2", "career 3"],
    "wealthType": "one short phrase describing the wealth archetype"
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
      "career": { "overview": "", "strengths": [], "challenges": [], "recommendations": [] },
      "wealth": { "overview": "", "strengths": [], "challenges": [], "recommendations": [] },
      "marriage": { "overview": "", "strengths": [], "challenges": [], "recommendations": [] },
      "health": { "overview": "", "strengths": [], "challenges": [], "recommendations": [] }
    }
  }
}
Base every statement strictly on the chart. Be concise. Return ONLY JSON.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini structured error (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty structured report");

  const parsed = JSON.parse(extractJson(text)) as StructuredReport;
  if (!parsed?.freeTier || !parsed?.paidTier) throw new Error("Malformed structured report");
  return parsed;
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

    // --- 3. Generate the written interpretation via Gemini (always fresh) ---
    const FALLBACK_INTERPRETATION =
      lang === "hi"
        ? "आपका चार्ट सफलतापूर्वक तैयार हो गया है। ज्योतिष पठन अस्थायी रूप से अनुपलब्ध है।"
        : "Your chart was generated successfully. Astrological reading is temporarily unavailable.";

    let interpretation = "";
    try {
      interpretation = await generateInterpretation(chartData, lang);
    } catch (geminiError) {
      // Gemini failures (404/500/network) must never break the chart response
      console.error("Kundali interpretation failed:", geminiError);
    }

    // Guarantee interpretation is never undefined, null, or empty
    if (!interpretation || !interpretation.trim()) {
      interpretation = FALLBACK_INTERPRETATION;
    }

    // --- 4. Build the structured free/paid tiers (always present) ---
    // Gemini structured output is best-effort; deterministic fallbacks below
    // guarantee a complete, renderable response even if it fails.
    const birthDateKey = details.birthDate;
    let structured: StructuredReport | null = null;
    try {
      structured = await generateStructuredReport(chartData, interpretation, lang);
    } catch (structuredError) {
      console.error("Kundali structured report failed:", structuredError);
    }

    const freeTier = buildFreeTier(chartData, birthDateKey, structured);
    const paidTier = buildPaidTier(chartData, birthDateKey, interpretation, structured, lang);

    // --- 5. Deterministic calculations layer (pure TypeScript, cache-friendly) ---
    const calculations = computeKundliCalculations(chartData, details.birthDate, new Date());

    return NextResponse.json({
      success: true,
      chartData,
      interpretation,
      freeTier,
      paidTier,
      calculations,
    } as FullKundliReportData);
  } catch (error) {
    console.error("Kundali generation failed:", error);
    return NextResponse.json({ message: "Failed to generate kundali" }, { status: 500 });
  }
}
