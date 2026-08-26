// Shared Kundali response contract — split into a free tier (always returned
// and rendered on top) and a paid tier (gated behind payment and powering the
// "Unlock Full 20-Page Report" experience).
//
// The deterministic, pure-TS calculation layer lives in `@/lib/kundli-report`
// and its output is modelled here as `KundliCalculations` / `FullKundliReportData`.

import type { ChartData } from "../lib/astrology";


export interface CorePersonality {
  /** Lagna / Ascendant sign (English). */
  ascendant: string;
  /** Moon sign / Rashi (English). */
  moonSign: string;
  /** Sun sign (English). */
  sunSign: string;
  /** Birth nakshatra (English). */
  nakshatra: string;
  /** One-to-two sentence personality snapshot derived from the lagna + luminaries. */
  summary: string;
}

export interface FreeTierData {
  corePersonality: CorePersonality;
  /** Top 3 career directions suggested by the chart. */
  topCareers: string[];
  /** Wealth archetype, e.g. "Steady Accumulator" or "Entrepreneurial Builder". */
  wealthType: string;
  /** Name of the currently running Mahadasha lord. */
  runningDashaName: string;
}

export interface PeriodInsight {
  period: string;
  note: string;
}

export interface CareerTimings {
  overview: string;
  favorable: PeriodInsight[];
  challenging: PeriodInsight[];
}

export interface MarriageDynamics {
  overview: string;
  strengths: string[];
  challenges: string[];
  favorable: PeriodInsight[];
}

export interface WealthSlice {
  category: string;
  percentage: number;
  note: string;
}

export interface WealthAllocation {
  overview: string;
  allocation: WealthSlice[];
}

export interface DashaRoadmapEntry {
  lord: string;
  startDate: string;
  endDate: string;
  theme: string;
}

export interface YogaItem {
  name: string;
  presence: boolean;
  impact: string;
  description: string;
  benefit: string;
}

export interface DoshaItem {
  name: string;
  description: string;
  severity: "low" | "moderate" | "high";
  isNeutralized: boolean;
}

export interface RemedyItem {
  type: string;
  description: string;
}

export interface DomainInsight {
  overview: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  /** Full ~250/200-word generated paragraph from the rich AI layer, when available. */
  narrative?: string;
  /** Up to three dated milestone windows for this domain. */
  milestones?: RichMilestone[];
}

/** A dated milestone window produced by the rich-prediction AI layer. */
export interface RichMilestone {
  /** Concrete year window, e.g. "2026–2028" (digits allowed in Hindi mode). */
  period: string;
  event: string;
}

/**
 * Structured output of the dedicated single-shot rich-prediction LLM call
 * (`generateRichPredictions`). When that call fails or is unavailable the
 * deterministic one-line fallbacks remain in place — every consumer treats
 * this as an enhancement, never a requirement.
 */
export interface RichPredictionReport {
  career: { narrative: string; milestones: RichMilestone[] };
  marriage: { narrative: string; milestones: RichMilestone[] };
  wealth: { narrative: string; milestones: RichMilestone[] };
  health: { narrative: string };
  remedies: { gemstones: string[]; dailyMantras: string[] };
}

export interface LifeDomains {
  career: DomainInsight;
  wealth: DomainInsight;
  marriage: DomainInsight;
  health: DomainInsight;
}

export interface ReportPage {
  title: string;
  content: string;
}

export interface KeyTiming {
  event: string;
  timing: string;
  note: string;
}

export interface PaidTierData {
  careerTimings: CareerTimings;
  marriageDynamics: MarriageDynamics;
  wealthAllocation: WealthAllocation;
  /** Sliced to roughly the next 10 years from the running dasha. */
  dashaRoadmap: DashaRoadmapEntry[];
  yogas: YogaItem[];
  doshas: DoshaItem[];
  remedies: RemedyItem[];
  /** The full 20-page structured breakdown. */
  fullBreakdown: ReportPage[];
  timings: KeyTiming[];
  lifeDomains: LifeDomains;
  /**
   * Gemstone suggestions + exactly four daily mantras from the rich AI layer.
   * Optional — absent whenever the rich-prediction call did not run/succeed.
   */
  remedyKit?: { gemstones: string[]; dailyMantras: string[] };
}

export interface KundaliResponse {
  success: boolean;
  chartData: unknown;
  interpretation: string;
  freeTier: FreeTierData;
  paidTier: PaidTierData;
  /**
   * Deterministic, pure-TypeScript calculations layer. Always present and
   * computed without any AI/external HTTP dependency — safe to run in
   * Vercel Edge/Serverless runtimes. Contains the divisional charts,
   * ashtakavarga, full Vimshottari hierarchy, doshas and yogas.
   */
  calculations?: KundliCalculations;
}

// ─── Full deterministic report schema (KundliCalculations layer) ───────────

/** The nine Vedic bodies plus the Ascendant (Lagna). */
export type PlanetName =
  | "Sun"
  | "Moon"
  | "Mars"
  | "Mercury"
  | "Jupiter"
  | "Venus"
  | "Saturn"
  | "Rahu"
  | "Ketu";

/** Divisional (Varga) chart types produced by the report layer. */
export type DivisionalChartType = "D1" | "D4" | "D7" | "D9" | "D10" | "D12";

/** A planet's (or the Lagna's) position inside a single divisional chart. */
export interface PlanetCoordinate {
  /** Body key: one of the nine planets or "ASC" for the Ascendant. */
  planet: PlanetName | "ASC";
  /** Zodiacal sign number (1-12) occupied in this divisional chart. */
  sign: number;
  /** Degrees within the sign (0-30), decimal. */
  degree: number;
  /** Whole minutes (0-59), zero-padded derived from `degree`. */
  minute: number;
  /** Whole-sign house (1-12) from the divisional ascendant. */
  house: number;
  /** Retrograde motion flag. */
  retrograde: boolean;
}

/** A whole-sign house cusp: house number → sign it falls on. */
export interface HouseCusp {
  house: number;
  sign: number;
}

/**
 * Coordinate matrix for one divisional chart.
 * `planetCoordinates` is the full per-body placement table; `houseCusps`
 * gives the 12 sign-on-cusp mapping derived from the divisional ascendant.
 */
export interface DivisionalChartMatrix {
  chartType: DivisionalChartType;
  ascendantSign: number;
  ascendantDegree: number;
  planetCoordinates: PlanetCoordinate[];
  houseCusps: HouseCusp[];
}

/**
 * Ashtakavarga report.
 * `sarvashtakavarga` holds the total bindus per house (index 0 = House 1);
 * `bhinnashtakvarga` is the per-planet 12-house bindu matrix.
 */
export interface AshtakavargaReport {
  sarvashtakavarga: number[];
  bhinnashtakvarga: Record<string, number[]>;
  /** Houses scoring at/above the chart-average bindu total (scale-invariant). */
  beneficialHouses: number[];
}

/** One of the 9 Vimshottari Antardashas nested inside a Mahadasha. */
export interface AntardashaNode {
  planet: string;
  startDate: string;
  endDate: string;
}

/** One of the 9 Vimshottari Mahadashas spanning the 120-year cycle. */
export interface MahadashaNode {
  lord: string;
  startDate: string;
  endDate: string;
  /** Duration in years (Mahadasha years, 6-20). */
  years: number;
  antardashas: AntardashaNode[];
}

/** The currently-running dasha (relative to `referenceDate`). */
export interface CurrentDashaInfo {
  mahadasha: string;
  antardasha: string;
  startDate: string;
  endDate: string;
}

/**
 * Complete 120-year Vimshottari Dasha hierarchy, computed deterministically
 * from the birth nakshatra and birth date.
 */
export interface VimshottariReport {
  /** All 9 Mahadashas from birth, each with its full Antardasha set. */
  mahadashas: MahadashaNode[];
  /** The Mahadasha + Antardasha running at the reference date. */
  currentDasha: CurrentDashaInfo;
  /** The first Mahadasha running at birth (driven by the birth nakshatra). */
  birthMahadasha: string;
}

/** A single-base check of Mars from a sensitive point (Lagna/Moon/Venus). */
export interface PlanetDoshaBase {
  /** "Lagna" | "Moon" | "Venus" */
  base: string;
  /** Mars's whole-sign house counted from this base (1-12). */
  marsHouse: number;
  /** True when Mars sits in a Manglik house (1,4,7,8,12). */
  inManglikHouse: boolean;
}

export type MangalSeverity = "none" | "mild" | "moderate" | "severe";

/** Deterministic Mangal (Kuja) Dosha analysis from Lagna, Moon and Venus. */
export interface MangalDoshaReport {
  isPresent: boolean;
  severity: MangalSeverity;
  bases: { lagna: PlanetDoshaBase; moon: PlanetDoshaBase; venus: PlanetDoshaBase };
  cancellations: string[];
  isNeutralized: boolean;
  description: string;
  remedies: string[];
}

export type SadeSatiPhase = "rising" | "peak" | "setting" | "inactive";
export type DhaiyaPhase = "pre" | "post" | "inactive";

export interface DashaDateRange {
  startDate: string;
  endDate: string;
}

/** Deterministic Sade Sati (Saturn's 12-1/1-2 transit from Moon) + Dhaiya. */
export interface SadeSatiReport {
  isActive: boolean;
  phase: SadeSatiPhase;
  moonSign: number;
  saturnSignNow: number;
  /** Full Sade Sati window that is active / next upcoming (ISO date range). */
  activePeriod: DashaDateRange | null;
  /** Sub-phase boundaries within the active Sade Sati window. */
  phaseRanges: Record<SadeSatiPhase, DashaDateRange | null>;
  dhaiya: { isActive: boolean; phase: DhaiyaPhase; period: DashaDateRange | null };
  remedies: string[];
  description: string;
}

/** Deterministic Kaal Sarp Dosha (all natural planets hemmed between Rahu-Ketu). */
export interface KaalSarpReport {
  isPresent: boolean;
  RahuSign: number;
  KetuSign: number;
  description: string;
  remedies: string[];
}

/** Aggregate of all deterministic dosha checks. */
export interface DoshaReport {
  mangal: MangalDoshaReport;
  sadeSati: SadeSatiReport;
  kaalSarp: KaalSarpReport;
}

export type YogaStrength = "weak" | "moderate" | "strong";

/** A single major yoga detection result. */
export interface YogaCheck {
  name: string;
  isPresent: boolean;
  strength: YogaStrength;
  description: string;
}

/** Classic Dhana (wealth) yoga with the planets/houses that anchor it. */
export interface DhanaYoga {
  name: string;
  planets: string[];
  houses: number[];
  isPresent: boolean;
  description: string;
}

/** Deterministic major-yoga report. */
export interface YogaReport {
  gajakesari: YogaCheck;
  budhaditya: YogaCheck;
  dhanaYogas: DhanaYoga[];
}

/** Key summary positions used to anchor the deterministic calculations. */
export interface LagnaSummary {
  ascendantSign: number;
  ascendantDegree: number;
  moonSign: number;
  sunSign: number;
  moonNakshatraIndex: number;
  moonNakshatra: string;
}

/** Bookkeeping for the calculation engine. */
export interface CalculationMetadata {
  engineVersion: string;
  referenceDate: string;
  birthDate: string;
  moonNakshatraIndex: number;
  saturnMeanSidereal: boolean;
}

/**
 * The complete deterministic calculation payload — the `calculations` slice
 * of `FullKundliReportData`. Every field here is derived purely from the
 * birth chart with no AI/external HTTP, so it is safe under Vercel Edge and
 * Serverless runtimes.
 */
export interface KundliCalculations {
  lagna: LagnaSummary;
  divisionalCharts: Record<DivisionalChartType, DivisionalChartMatrix>;
  ashtakavarga: AshtakavargaReport;
  vimshottari: VimshottariReport;
  doshas: DoshaReport;
  yogas: YogaReport;
  metadata: CalculationMetadata;
}

/**
 * Standardized, strictly-typed envelope for the complete Kundli report.
 * Models the full calculation response: the birth chart plus the deterministic
 * calculations layer. Used as the canonical contract for `@/lib/kundli-report`.
 */
export interface FullKundliReportData {
  success: boolean;
  chartData: ChartData;
  interpretation: string;
  freeTier: FreeTierData;
  paidTier: PaidTierData;
  calculations: KundliCalculations;
}
