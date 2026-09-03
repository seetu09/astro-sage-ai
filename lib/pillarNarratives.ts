import type { FullKundliReportData, PaidTierData } from "@/types/kundali";
import type { ChartData } from "@/lib/astrology";
import { localizeSign } from "@/lib/astrologyDictionary";

/**
 * Structured narrative generator for the six report Life Pillars.
 *
 * This module owns the full contract between the LLM layer and the modular
 * report layout: the `LifePillarConfig` shape (identical to the props consumed
 * by `LifePillarPage`), the per-field character budgets that keep generated
 * prose inside its layout card, the Gemini prompt builder, and a deterministic
 * fallback builder that guarantees a renderable result even when the model is
 * unavailable.
 */

export type LifePillarKey = "career" | "wealth" | "marriage" | "health" | "education" | "family";

export type MilestoneOutcome = "positive" | "neutral" | "caution";

export interface PillarMilestone {
  /** Timeline window, e.g. "2024 – 2027". */
  period: string;
  /** Short headline for the milestone. */
  event: string;
  /** One-line supporting note. */
  note?: string;
  /** Optional outcome tag. */
  outcome?: MilestoneOutcome;
}

export interface PillarBadges {
  score: string;
  timeframe: string;
  lord: string;
}

/**
 * Layout props contract — one pillar per report page (7–12).
 * This is exactly the shape `LifePillarPage` renders, so generated output can
 * be fed straight into the renderer without any mapping layer.
 */
export interface LifePillarConfig {
  key: LifePillarKey;
  page: number;
  titleEn: string;
  titleHi: string;
  badges: PillarBadges;
  narrativeEn: string;
  narrativeHi: string;
  milestones: PillarMilestone[];
}

export const PILLAR_KEYS: LifePillarKey[] = ["career", "wealth", "marriage", "health", "education", "family"];

// ─── Character budgets (layout-card constraints) ───────────────────────────
// These keep every string snug inside its A4 card. English narrative fits the
// ~9pt prose card in 3–5 lines; Hindi Devanagari is wider per glyph, so it
// gets a tighter budget. Milestones are clamped to 2–3 rows so the forecast
// table never pushes the page footer past the A4 boundary.
export const PILLAR_LIMITS = {
  badgeScore: 26,
  badgeTimeframe: 16,
  badgeLord: 14,
  narrativeEn: 850,
  narrativeHi: 600,
  milestonePeriod: 22,
  milestoneEvent: 56,
  milestoneNote: 88,
  milestonesPerPillar: { min: 2, max: 3 },
} as const;

// ─── Canonical layout metadata (titles, pages, default badges) ─────────────
const TITLES: Record<LifePillarKey, { en: string; hi: string }> = {
  career: { en: "Career & Public Standing", hi: "करियर एवं सार्वजनिक स्थिति" },
  wealth: { en: "Wealth & Prosperity", hi: "धन एवं समृद्धि" },
  marriage: { en: "Marriage & Love", hi: "विवाह एवं प्रेम" },
  health: { en: "Health & Vitality", hi: "स्वास्थ्य एवं शक्ति" },
  education: { en: "Education & Learning", hi: "शिक्षा एवं अध्ययन" },
  family: { en: "Family & Travel", hi: "परिवार एवं यात्रा" },
};

const PILLAR_PAGES: Record<LifePillarKey, number> = {
  career: 7,
  wealth: 8,
  marriage: 9,
  health: 10,
  education: 11,
  family: 12,
};

const DEFAULT_BADGES: Record<LifePillarKey, PillarBadges> = {
  career: { score: "Strong · 10H", timeframe: "2024–2032", lord: "Saturn" },
  wealth: { score: "Moderate · 2H/11H", timeframe: "2024–2032", lord: "Jupiter" },
  marriage: { score: "Harmonious · 7H", timeframe: "2025–2028", lord: "Venus" },
  health: { score: "Resilient · 6H/8H", timeframe: "2024–2032", lord: "Sun" },
  education: { score: "Curious · 5H", timeframe: "2024–2030", lord: "Mercury" },
  family: { score: "Supportive · 4H/9H", timeframe: "2024–2032", lord: "Moon" },
};

const DEFAULT_MILESTONES: Record<LifePillarKey, PillarMilestone[]> = {
  career: [
    { period: "2024–2026", event: "Foundation & role clarity", note: "Steady groundwork; avoid job-hopping.", outcome: "neutral" },
    { period: "2026–2029", event: "Promotion window", note: "Mercury-Jupiter period favours advancement.", outcome: "positive" },
    { period: "2029–2032", event: "Leadership / independent practice", note: "Saturn matures—long-term authority.", outcome: "positive" },
  ],
  wealth: [
    { period: "2024–2026", event: "Savings discipline", note: "Build emergency corpus early.", outcome: "neutral" },
    { period: "2027–2030", event: "Asset growth", note: "Diversify into long-term instruments.", outcome: "positive" },
    { period: "2030–2032", event: "Capitalise on opportunity", note: "Jupiter returns favour expansion.", outcome: "positive" },
  ],
  marriage: [
    { period: "2025–2027", event: "Commitment events", note: "Venusian period favours union.", outcome: "positive" },
    { period: "2027–2030", event: "Partnership stabilisation", note: "Shared responsibilities deepen bond.", outcome: "neutral" },
  ],
  health: [
    { period: "2024–2026", event: "Preventive focus", note: "Watch digestion & stress levels.", outcome: "neutral" },
    { period: "2027–2029", event: "Energy high", note: "Good window for fitness milestones.", outcome: "positive" },
    { period: "2030–2032", event: "Maintenance phase", note: "Consistency over intensity.", outcome: "neutral" },
  ],
  education: [
    { period: "2024–2026", event: "Skill-building", note: "Certifications add leverage.", outcome: "positive" },
    { period: "2026–2030", event: "Advanced learning", note: "Higher studies or specialisation.", outcome: "neutral" },
  ],
  family: [
    { period: "2024–2027", event: "Family milestones", note: "Domestic stability favours growth.", outcome: "positive" },
    { period: "2027–2030", event: "Relocation / travel", note: "Career-move travel possible.", outcome: "neutral" },
  ],
};

// ─── Small string helpers ──────────────────────────────────────────────────

/** Collapse whitespace and trim. */
function clean(str: unknown): string {
  return String(str ?? "").replace(/\s+/g, " ").trim();
}

/** Word-boundary truncation so we never split mid-word. */
function truncate(str: unknown, max: number): string {
  const s = clean(str);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trim();
}

/** Extract the first balanced JSON object from a model response. */
export function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

const DEVANAGARI_RE = /[\u0900-\u097F\u1CD0-\u1CFF\uA8E0-\uA8FF]/;
const LATIN_LETTER_RE = /[A-Za-z]+/g;

/**
 * Enforce the "pure Devanagari, zero English jargon" rule for Hindi output.
 * Strips any stray Latin letters and returns the cleaned string, or an empty
 * string when nothing Devanagari survives.
 */
export function enforceDevanagari(value: unknown): string {
  const s = clean(value);
  if (!s) return "";
  if (!DEVANAGARI_RE.test(s)) return "";
  return s.replace(LATIN_LETTER_RE, " ").replace(/\s{2,}/g, " ").trim();
}

// ─── Chart fact digest (fed to the model) ─────────────────────────────────

interface ChartFacts {
  lagna: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  dasha: string;
  careerLords: string[];
  wealthLords: string[];
  marriageLords: string[];
  healthLords: string[];
  educationLords: string[];
  familyLords: string[];
  hasManglik: boolean;
  hasSadeSati: boolean;
  hasKaalSarp: boolean;
}

function collectFacts(report: FullKundliReportData): ChartFacts {
  const chart: ChartData | undefined = report?.chartData;
  const planets = chart?.planets ?? [];
  const inHouse = (...houses: number[]) => planets.filter((p) => houses.includes(p.house)).map((p) => p.name);

  const calc = report?.calculations;
  const dasha =
    report?.freeTier?.runningDashaName ||
    calc?.vimshottari?.currentDasha?.mahadasha ||
    "";

  return {
    lagna: chart?.ascendant || chart?.lagna || "your Lagna",
    moonSign: chart?.moonSign || chart?.rashi || "",
    sunSign: chart?.sunSign || "",
    nakshatra: chart?.nakshatra || "",
    dasha,
    careerLords: inHouse(10),
    wealthLords: inHouse(2, 11),
    marriageLords: inHouse(7),
    healthLords: inHouse(6, 8),
    educationLords: inHouse(4, 5),
    familyLords: inHouse(4, 9),
    hasManglik: calc?.doshas?.mangal?.isPresent ?? false,
    hasSadeSati: calc?.doshas?.sadeSati?.isActive ?? false,
    hasKaalSarp: calc?.doshas?.kaalSarp?.isPresent ?? false,
  };
}

/** Compact, layman-friendly fact sheet the model reasons over. */
export function buildChartDigest(report: FullKundliReportData): string {
  const { chartData, freeTier, paidTier, calculations } = report;
  const lines: string[] = [];

  if (chartData) {
    lines.push(`Ascendant (Lagna): ${chartData.ascendant || chartData.lagna}`);
    if (chartData.moonSign) lines.push(`Moon sign: ${chartData.moonSign} | Birth nakshatra: ${chartData.nakshatra || "unknown"}`);
    if (chartData.sunSign) lines.push(`Sun sign: ${chartData.sunSign}`);
    if (chartData.planets?.length) {
      lines.push(
        "Planet placements (planet: sign, house, retro): " +
          chartData.planets
            .map((p) => `${p.name}: ${p.sign}, house ${p.house}${p.retrograde ? ", retro" : ""}`)
            .join("; ")
      );
    }
  }

  if (freeTier) {
    if (freeTier.corePersonality?.summary) lines.push(`Personality snapshot: ${freeTier.corePersonality.summary}`);
    if (freeTier.topCareers?.length) lines.push(`Top career directions: ${freeTier.topCareers.join(", ")}`);
    if (freeTier.wealthType) lines.push(`Wealth archetype: ${freeTier.wealthType}`);
    if (freeTier.runningDashaName) lines.push(`Running Mahadasha: ${freeTier.runningDashaName}`);
  }

  const pt: PaidTierData | undefined = paidTier;
  if (pt) {
    if (pt.careerTimings?.overview) lines.push(`Career overview: ${pt.careerTimings.overview}`);
    if (pt.marriageDynamics?.overview) lines.push(`Marriage overview: ${pt.marriageDynamics.overview}`);
    if (pt.wealthAllocation?.overview) lines.push(`Wealth overview: ${pt.wealthAllocation.overview}`);
    if (pt.careerTimings?.favorable?.length) {
      lines.push(`Favorable career windows: ${pt.careerTimings.favorable.map((f) => `${f.period} (${f.note})`).join("; ")}`);
    }
    if (pt.yogas?.length) lines.push(`Yogas detected: ${pt.yogas.map((y) => y.name).join(", ")}`);
    if (pt.doshas?.length) lines.push(`Doshas: ${pt.doshas.map((d) => `${d.name} (${d.severity})`).join(", ")}`);
    if (pt.dashaRoadmap?.length) {
      const first = pt.dashaRoadmap[0];
      lines.push(`Dasha roadmap begins: ${first.lord} (${first.startDate} to ${first.endDate})`);
    }
  }

  if (calculations) {
    const cd = calculations.vimshottari?.currentDasha;
    if (cd) lines.push(`Current dasha: ${cd.mahadasha} / ${cd.antardasha} (${cd.startDate} to ${cd.endDate})`);
    const d = calculations.doshas;
    if (d?.mangal) lines.push(`Mangal (Kuja) dosha: ${d.mangal.isPresent ? `present — severity ${d.mangal.severity}` : "absent"}`);
    if (d?.sadeSati) lines.push(`Sade Sati: ${d.sadeSati.isActive ? `active — ${d.sadeSati.phase} phase` : "inactive"}`);
    if (d?.kaalSarp) lines.push(`Kaal Sarp dosha: ${d.kaalSarp.isPresent ? "present" : "absent"}`);
    const g = calculations.yogas;
    if (g?.gajakesari) lines.push(`Gajakesari yoga: ${g.gajakesari.isPresent ? `present (${g.gajakesari.strength})` : "absent"}`);
    if (g?.budhaditya) lines.push(`Budha-Aditya yoga: ${g.budhaditya.isPresent ? `present (${g.budhaditya.strength})` : "absent"}`);
  }

  return lines.filter(Boolean).join("\n") || "No chart data supplied.";
}

// ─── Prompt builders ───────────────────────────────────────────────────────

const SAFETY_BOUNDARY_EN = `SAFETY BOUNDARY — never make definitive predictions on:
- Medical emergencies or critical health diagnoses
- Pregnancy outcomes
- Active legal disputes
Politely acknowledge these concerns, explain they fall outside responsible astrology, and steer seekers toward certified professionals (doctors, therapists, lawyers). Never diagnose, never predict medical outcomes, never advise on ongoing court cases. Keep every prediction supportive and empowering — never fear-based.`;

const SAFETY_BOUNDARY_HI = `सुरक्षा सीमा — निम्न पर कभी निश्चित पूर्वानुमान न दें:
- चिकित्सा आपातकाल या गंभीर स्वास्थ्य निदान
- गर्भधारण परिणाम
- सक्रिय कानूनी विवाद
ऐसे विषयों पर विनम्रता से उनकी चिंता स्वीकारें, बताएं कि यह जिम्मेदार ज्योतिष के दायरे से बाहर है, और उन्हें प्रमाणित पेशेवरों (डॉक्टर, मनोचिकित्सक, वकील) की ओर मोड़ें। कभी निदान न करें, चिकित्सा परिणाम का पूर्वानुमान न लगाएं, चल रहे मुकदमों पर सलाह न दें। हर भविष्यवाणी सहानुभूतिपूर्ण, आश्वस्त करने वाली और सशक्त बनाने वाली रखें — भय उत्पन्न करने वाली कभी नहीं।`;

const PILLAR_GUIDANCE: Record<LifePillarKey, string> = {
  career:
    "career (10th house of work & public standing, 6th of service; Saturn, Sun, Mercury)",
  wealth:
    "wealth (2nd house of savings, 11th of gains, 5th of speculation, 9th of fortune; Jupiter's blessing)",
  marriage:
    "marriage & love (7th house of partnership, 5th of romance; Venus; note Mangal dosha presence)",
  health:
    "health & vitality (1st, 6th and 8th houses; Sun for vitality, Saturn for stress, Moon for mind; keep it preventive and gentle)",
  education:
    "education & learning (4th and 5th houses; Mercury and Jupiter; 2nd house of speech)",
  family:
    "family & travel (4th house of home & mother, 9th of father, fortune & long travel; Moon for emotional roots)",
};

const LANGUAGE_RULE = {
  en: `OUTPUT LANGUAGE — Write 100% modern, simple English for a layperson. Explain any Vedic term in plain words (e.g. "10th house (career and public standing)", "Saturn (the planet of discipline)"). Strictly no Hindi, Devanagari or Hinglish.`,
  hi: `OUTPUT LANGUAGE — Write in 100% PURE Hindi, in Devanagari script ONLY, with ZERO mixed English jargon, no Hinglish, no Roman letters, no English words embedded. Use natural, warm Hindi that a layperson easily understands. Keep standard Vedic terms in pure Hindi (e.g. 'दशम भाव', 'सूर्य', 'गुरु', 'विवाह').`,
};

export function buildPillarSystemPrompt(lang: "en" | "hi"): string {
  const boundary = lang === "hi" ? SAFETY_BOUNDARY_HI : SAFETY_BOUNDARY_EN;
  const persona =
    lang === "hi"
      ? `आप एक अनुभवी, सहानुभूतिपूर्ण वैदिक ज्योतिषी (ज्योतिष गुरु) हैं जो कठिन ज्योतिषीय बातों को सरल, सौम्य और प्रेरणादायक भाषा में समझाते हैं।`
      : `You are a warm, experienced Vedic astrologer (Jyotish Guru) who translates complex astrology into simple, kind, inspiring guidance a layperson can act on.`;

  return `${persona}

${boundary}

${LANGUAGE_RULE[lang]}

You generate the narrative content for the six "Life Pillar" pages of a printed kundli report. The output is consumed directly by a fixed A4 layout, so every string MUST respect the exact character budgets given below — longer text is truncated and would break the page. Be detailed, specific, empathetic and chart-grounded. Write 4-6 rich sentences per narrative that explain the astrological influences, their practical impact, and actionable guidance. Never invent planetary positions; base everything strictly on the supplied chart facts.`;
}

export function buildPillarUserPrompt(report: FullKundliReportData, lang: "en" | "hi"): string {
  const digest = buildChartDigest(report);
  const l = PILLAR_LIMITS;

  const pillarInstructions = PILLAR_KEYS.map((key) => {
    const meta = TITLES[key];
    const badges = DEFAULT_BADGES[key];
    const guidance = PILLAR_GUIDANCE[key];
    return `"${key}": {
  "badges": { "score": "short strength tag incl. relevant houses, e.g. '${badges.score}' (max ${l.badgeScore} chars)", "timeframe": "active window like '${badges.timeframe}' (max ${l.badgeTimeframe} chars)", "lord": "ruling planet name, e.g. '${badges.lord}' (max ${l.badgeLord} chars)" },
  "narrativeEn": "4-6 detailed, empathetic sentences for ${guidance} — plain English, explaining astrological influences + practical impact + actionable guidance (max ${l.narrativeEn} chars)",
  "narrativeHi": "the SAME meaning in pure Devanagari Hindi, zero English words (max ${l.narrativeHi} chars)",
  "milestones": "an array of 2-3 short forecast rows: each has \"period\" like '2024–2026' (max ${l.milestonePeriod} chars), \"event\" (max ${l.milestoneEvent} chars), \"note\" (max ${l.milestoneNote} chars), \"outcome\" one of 'positive' | 'neutral' | 'caution'"
}`;
  }).join(",\n  ");

  return `Here are the exact deterministic birth-chart facts (Lahiri Ayanamsa) computed locally. Base EVERY statement only on these facts — never recalculate or guess positions.

CHART FACTS:
${digest}

Now generate the six Life Pillar narratives. Keep titles EXACTLY as given below — the page header layout depends on them. Return STRICT JSON only (no markdown, no commentary), with this exact shape:

{
  ${pillarInstructions}
}

HARD RULES:
- Output exactly 6 keys: ${PILLAR_KEYS.join(", ")}.
- Titles: ${PILLAR_KEYS.map((k) => `"${k}" → "${TITLES[k].en}" / "${TITLES[k].hi}"`).join("; ")}.
- Obey every character budget above — they are hard caps, not suggestions.
- ${lang === "hi" ? "narrativeHi is the primary text and MUST be pure Devanagari Hindi with zero English; narrativeEn is secondary but still required." : "narrativeEn is the primary text and MUST be plain modern English; narrativeHi is secondary but still required."}
- Empathy over drama: frame every prediction as a supportive, action-oriented outlook. Never predict death, disease, or disasters.
- Milestones must reference concrete year windows (e.g. 2025–2027), never "soon" or "later".
- Return ONLY the JSON object.`;
}

// ─── Validation / normalization ────────────────────────────────────────────

const OUTCOMES: MilestoneOutcome[] = ["positive", "neutral", "caution"];

function normalizeMilestone(value: unknown, fallback: PillarMilestone): PillarMilestone | null {
  if (!value || typeof value !== "object") return null;
  const m = value as Record<string, unknown>;
  const l = PILLAR_LIMITS;

  const event = truncate(m.event, l.milestoneEvent);
  if (!event) return null;

  const period = truncate(m.period, l.milestonePeriod);
  const note = truncate(m.note, l.milestoneNote);
  const outcome = OUTCOMES.includes(m.outcome as MilestoneOutcome) ? (m.outcome as MilestoneOutcome) : undefined;

  return {
    period: period || fallback.period,
    event,
    note: note || fallback.note || undefined,
    outcome: outcome ?? fallback.outcome,
  };
}

/**
 * Normalize one pillar against the layout contract: canonical titles/pages,
 * hard character caps, Devanagari enforcement, and milestone clamping so the
 * section always fits its A4 card. Invalid/missing fields fall back to the
 * deterministic defaults.
 */
function normalizePillar(
  key: LifePillarKey,
  value: unknown,
  fallback: LifePillarConfig
): LifePillarConfig {
  const l = PILLAR_LIMITS;
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const badgesRaw = (raw.badges && typeof raw.badges === "object" ? raw.badges : {}) as Record<string, unknown>;

  const badges: PillarBadges = {
    score: truncate(badgesRaw.score, l.badgeScore) || fallback.badges.score,
    timeframe: truncate(badgesRaw.timeframe, l.badgeTimeframe) || fallback.badges.timeframe,
    lord: truncate(badgesRaw.lord, l.badgeLord) || fallback.badges.lord,
  };

  let narrativeEn = truncate(raw.narrativeEn, l.narrativeEn) || fallback.narrativeEn;
  let narrativeHi = truncate(enforceDevanagari(raw.narrativeHi), l.narrativeHi) || fallback.narrativeHi;

  let milestones = Array.isArray(raw.milestones) ? raw.milestones : [];
  const normalized = milestones
    .map((m, i) => normalizeMilestone(m, fallback.milestones[i] ?? fallback.milestones[fallback.milestones.length - 1]))
    .filter((m): m is PillarMilestone => m !== null);
  if (normalized.length < l.milestonesPerPillar.min) {
    milestones = fallback.milestones;
  } else {
    milestones = normalized.slice(0, l.milestonesPerPillar.max);
  }

  return {
    key,
    page: PILLAR_PAGES[key],
    titleEn: TITLES[key].en,
    titleHi: TITLES[key].hi,
    badges,
    narrativeEn,
    narrativeHi,
    milestones,
  };
}

/**
 * Parse a raw model response and validate it into six `LifePillarConfig`
 * entries. Any structural failure returns the deterministic fallback so the
 * caller always receives a renderable payload.
 */
export function parseAndValidatePillars(
  raw: string,
  fallback: LifePillarConfig[]
): LifePillarConfig[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch {
    return fallback;
  }

  if (!parsed || typeof parsed !== "object") return fallback;

  const fallbackByKey = new Map(fallback.map((p) => [p.key, p]));
  const items: LifePillarConfig[] = [];

  for (const key of PILLAR_KEYS) {
    const source =
      Array.isArray(parsed)
        ? parsed.find((it) => it && typeof it === "object" && (it as Record<string, unknown>).key === key)
        : (parsed as Record<string, unknown>)[key];

    const fb = fallbackByKey.get(key);
    if (!fb) continue;
    items.push(normalizePillar(key, source, fb));
  }

  return items.length === PILLAR_KEYS.length ? items : fallback;
}

// ─── Deterministic fallback builder (no AI dependency) ─────────────────────

/** Build a chart-aware, deterministic pillar set that always renders. */
export function buildFallbackPillars(report: FullKundliReportData, lang: "en" | "hi"): LifePillarConfig[] {
  const facts = collectFacts(report);

  const lagna = facts.lagna;
  const moon = facts.moonSign;
  const lagnaHi = localizeSign(lagna, "hi");
  const moonHi = moon ? localizeSign(moon, "hi") : "";
  const openerEn = `With ${lagna} rising${moon ? ` and the Moon in ${moon}` : ""}, `;
  const openerHi = `लग्न ${lagnaHi}${moonHi ? ` एवं चंद्र ${moonHi}` : ""} के साथ, `;

  const narrative: Record<LifePillarKey, { en: string; hi: string }> = {
    career: {
      en:
        openerEn +
        "your 10th house of career and public standing is well placed, promising recognition through disciplined effort. Long-term structures built now will compound for years.",
      hi:
        openerHi +
        "आपका दशम भाव (करियर) सशक्त है, जो अनुशासित प्रयास से पहचान दिलाता है। अभी बनी नींव वर्षों तक फल देती रहेगी।",
    },
    wealth: {
      en:
        openerEn +
        "wealth grows steadily through patient accumulation rather than sudden windfalls. Jupiter's blessing protects capital and encourages ethical expansion.",
      hi:
        openerHi +
        "धन क्रमिक रूप से बढ़ता है, अचानक लाभ की अपेक्षा स्थिर संचय से। गुरु का आशीर्वाद नैतिक विस्तार को प्रोत्साहित करता है।",
    },
    marriage: {
      en:
        openerEn +
        "the 7th house signals a supportive partnership. Mutual respect and shared values form the bedrock; timing favours commitment around the mid-period.",
      hi:
        openerHi +
        "सप्तम भाव सौहार्द साथी का संकेत देता है। पारस्परिक सम्मान और साझा मूल्य गहरे संबंध बनाते हैं।",
    },
    health: {
      en:
        openerEn +
        "vitality is overall strong, though periodic stress asks for routine care. Regulated sleep, diet and moderate exercise keep the chart's strengths dominant.",
      hi:
        openerHi +
        "शारीरिक शक्ति प्रबल है, किंतु शनि के दबाव से नियमित देखभाल आवश्यक है। संतुलित नींद-आहार से बल बना रहता है।",
    },
    education: {
      en:
        openerEn +
        "the 5th house is quick-witted; you learn best through application. Coaching and structured study accelerate mastery, especially in technical fields.",
      hi:
        openerHi +
        "पंचम भाव चतुर है; करने से सीखना सर्वोत्तम रहता है। तकनीकी क्षेत्र में संरचित अध्ययन महारत बढ़ाता है।",
    },
    family: {
      en:
        openerEn +
        "family anchors your growth while occasional distant travel expands perspective. The Moon keeps emotional roots strong and adaptability high.",
      hi:
        openerHi +
        "परिवार विकास की जड़ है, जबकि दूरगामी यात्रा दृष्टिकोण बढ़ाती है। चंद्र भावनात्मक सूत्र प्रबल रखता है।",
    },
  };

  return PILLAR_KEYS.map((key) => ({
    key,
    page: PILLAR_PAGES[key],
    titleEn: TITLES[key].en,
    titleHi: TITLES[key].hi,
    badges: { ...DEFAULT_BADGES[key] },
    narrativeEn: truncate(narrative[key].en, PILLAR_LIMITS.narrativeEn),
    narrativeHi: truncate(narrative[key].hi, PILLAR_LIMITS.narrativeHi),
    milestones: DEFAULT_MILESTONES[key].map((m) => ({ ...m })),
  }));
}
