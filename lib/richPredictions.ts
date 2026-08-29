/**
 * Pure merge layer for the rich-prediction AI output.
 *
 * `applyRichPredictions` folds a (possibly partial / malformed) RichPredictionReport
 * into a PaidTierData draft: the deterministic one-line fallback strings are
 * REPLACED by full generated narrative paragraphs wherever valid data exists,
 * and milestone windows + the gemstone/mantra remedy kit are attached. Anything
 * missing or invalid is skipped so the input draft always stays renderable.
 */
import type {
  DomainInsight,
  LifeDomains,
  PaidTierData,
  RichMilestone,
  RichPredictionReport,
} from "@/types/kundali";

const cleanText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Milestones: keep at most 3 fully-formed { period, event } entries. */
const cleanMilestones = (value: unknown): RichMilestone[] =>
  Array.isArray(value)
    ? value
        .map((m) => ({
          period: cleanText((m as Record<string, unknown>)?.period),
          event: cleanText((m as Record<string, unknown>)?.event),
        }))
        .filter((m) => m.period && m.event)
        .slice(0, 3)
    : [];

const cleanStringList = (value: unknown, max: number): string[] =>
  Array.isArray(value)
    ? value
        .map((item) => cleanText(item))
        .filter(Boolean)
        .slice(0, max)
    : [];

/** Replace an insight's short overview with the rich narrative when present. */
const enrichInsight = (
  insight: DomainInsight | undefined,
  narrative: string,
  milestones: RichMilestone[]
): DomainInsight =>
  ({
    ...insight,
    overview: narrative || insight?.overview || "",
    ...(narrative ? { narrative } : {}),
    ...(milestones.length ? { milestones } : {}),
  }) as DomainInsight;

export function applyRichPredictions(
  paidTier: PaidTierData,
  rich: RichPredictionReport | null | undefined
): PaidTierData {
  if (!rich || typeof rich !== "object") return paidTier;

  const careerNarrative = cleanText(rich.career?.narrative);
  const marriageNarrative = cleanText(rich.marriage?.narrative);
  const wealthNarrative = cleanText(rich.wealth?.narrative);
  const healthNarrative = cleanText(rich.health?.narrative);
  const careerMs = cleanMilestones(rich.career?.milestones);
  const marriageMs = cleanMilestones(rich.marriage?.milestones);
  const wealthMs = cleanMilestones(rich.wealth?.milestones);
  const gemstones = cleanStringList(rich.remedies?.gemstones, 5);
  const dailyMantras = cleanStringList(rich.remedies?.dailyMantras, 4);

  const lifeDomains: LifeDomains = {
    career: enrichInsight(paidTier.lifeDomains?.career, careerNarrative, careerMs),
    marriage: enrichInsight(paidTier.lifeDomains?.marriage, marriageNarrative, marriageMs),
    wealth: enrichInsight(paidTier.lifeDomains?.wealth, wealthNarrative, wealthMs),
    health: enrichInsight(paidTier.lifeDomains?.health, healthNarrative, []),
    // No rich narratives exist for these domains — pass the guaranteed
    // non-empty deterministic overviews through unchanged.
    education: paidTier.lifeDomains?.education,
    family: paidTier.lifeDomains?.family,
  };

  return {
    ...paidTier,
    // The tab panels render `.overview` directly — upgrade it to the full
    // paragraph so the one-line fallbacks disappear everywhere at once.
    careerTimings: {
      ...paidTier.careerTimings,
      ...(careerNarrative ? { overview: careerNarrative } : {}),
    },
    marriageDynamics: {
      ...paidTier.marriageDynamics,
      ...(marriageNarrative ? { overview: marriageNarrative } : {}),
    },
    wealthAllocation: {
      ...paidTier.wealthAllocation,
      ...(wealthNarrative ? { overview: wealthNarrative } : {}),
    },
    lifeDomains,
    ...(gemstones.length || dailyMantras.length
      ? { remedyKit: { gemstones, dailyMantras } }
      : {}),
  };
}