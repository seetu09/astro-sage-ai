// Shared Kundali response contract — split into a free tier (always returned
// and rendered on top) and a paid tier (gated behind payment and powering the
// "Unlock Full 20-Page Report" experience).

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
}

export interface KundaliResponse {
  success: boolean;
  chartData: unknown;
  interpretation: string;
  freeTier: FreeTierData;
  paidTier: PaidTierData;
}
