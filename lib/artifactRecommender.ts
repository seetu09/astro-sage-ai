/**
 * artifactRecommender.ts
 * ----------------------
 * Deterministic, pure recommender behind the "Remedial Measures" section of the
 * Kundli report. It maps the doshas detected by the calculation layer
 * (`calculations.doshas`) onto a curated catalog of physical artifacts
 * (gemstones, rudraksha, yantras, ...) loaded from `data/artifacts.json`.
 *
 * WHY `doshaAliases` EXISTS
 * -------------------------
 * The dosha vocabulary is authored in two places that drift independently:
 *   1. the deterministic rules engine, which emits machine keys such as
 *      `mangal_dosh`, `sade_sati`, `kaal_sarp_dosh`, and
 *   2. human-authored catalog rows plus LLM narrative text, which say things
 *      like "Manglik", "Shani Sade Sati" or "Kaal Sarp".
 * The alias map lets a canonical key fan out into every spelling we have seen
 * in the wild, so matching happens on *expanded* alias sets. Adding a new
 * spelling is one line of JSON instead of touching the catalog or the engine,
 * and the recommender keeps working when either side renames a key.
 *
 * WHY THE CAP IS 2
 * ----------------
 * This block is a quiet suggestion inside a spiritual reading — not a
 * storefront. Two items read as advice that happens to link to something
 * relevant; five read as a catalog and undermine trust in the report itself.
 * The cap is a product constraint, so it is enforced HERE (not only in the
 * component): no caller can turn the report into a shop by passing a larger
 * `maxResults`.
 *
 * WHY IT NEVER THROWS
 * -------------------
 * The recommender runs while the paid report renders. A renamed JSON field, a
 * null dosha array or a malformed catalog row must never take the report down
 * or blank the section. Every failure path degrades to "no suggestions"
 * (`[]`), which the UI renders as `null`. Failing soft — no throws, no partial
 * state, no noise — is the entire error strategy.
 */

import artifactsData from '@/data/artifacts.json';

export interface ArtifactName { en: string; hi: string; }
export interface ArtifactText { en: string; hi: string; }
export interface ArtifactBenefits { en: string[]; hi: string[]; }

export interface Artifact {
  id: string;
  name: ArtifactName;
  doshas: string[];
  pitch: ArtifactText;
  benefits: ArtifactBenefits;
  imageUrl: string;
  productUrl: string;
  priority: number;
  disclaimer: ArtifactText;
}

export interface Recommendation {
  artifact: Artifact;
  /**
   * Which of the user's doshas triggered this match, in the user's own
   * vocabulary (e.g. `["manglik"]`) — the expanded-alias intersection mapped
   * back onto the input dosha strings and de-duplicated.
   */
  matchedDoshas: string[];
  score: number;
}

/** Shape of `data/artifacts.json` (kept local; the JSON is the source of truth). */
interface ArtifactCatalog {
  version?: number;
  artifacts?: Artifact[];
  doshaAliases?: Record<string, string[]>;
}

const DEFAULT_MAX_RESULTS = 2;
/** Hard product ceiling — the report must never feel like a catalog. */
const HARD_MAX_RESULTS = 2;
/** Bonus contributed by each of the user's doshas an artifact addresses. */
const MATCH_BONUS = 2;

/** Trim + lowercase so "Mangal_Dosh " and "mangal_dosh" resolve to one key. */
function normalizeDosha(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Expand one dosha into itself plus every alias declared for it. The key
 * itself is always included even if the alias list forgets it (the shipped
 * data has duplicated/missing self-references), so a canonical key can never
 * fail to match its own artifact row.
 */
function expandDosha(dosha: string, aliases: Record<string, string[]>): Set<string> {
  const expanded = new Set<string>();
  if (!dosha) return expanded;
  expanded.add(dosha);
  const list = aliases[dosha];
  if (Array.isArray(list)) {
    for (const alias of list) {
      const normalized = normalizeDosha(alias);
      if (normalized) expanded.add(normalized);
    }
  }
  return expanded;
}

/**
 * Rank catalog artifacts for the given active doshas.
 *
 * @param userDoshas Active dosha keys from `calculations.doshas`
 *                   (e.g. `["mangal_dosh", "sade_sati"]`).
 * @param options    `maxResults` is clamped to the hard cap of 2.
 * @returns 0–2 recommendations, highest score first. Never throws.
 */
export function recommendArtifacts(
  userDoshas: string[],
  options?: { maxResults?: number }
): Recommendation[] {
  try {
    if (!Array.isArray(userDoshas) || userDoshas.length === 0) return [];

    const catalog = (artifactsData ?? {}) as unknown as ArtifactCatalog;
    const artifacts = Array.isArray(catalog.artifacts) ? catalog.artifacts : [];
    const aliases =
      catalog.doshaAliases && typeof catalog.doshaAliases === 'object' ? catalog.doshaAliases : {};
    if (artifacts.length === 0) return [];

    // Step 2 — expand each user dosha, remembering the original string so
    // `matchedDoshas` reports the user's vocabulary rather than alias tokens.
    const userEntries: Array<{ original: string; tokens: Set<string> }> = [];
    for (const raw of userDoshas) {
      const normalized = normalizeDosha(raw);
      if (!normalized) continue;
      userEntries.push({ original: normalized, tokens: expandDosha(normalized, aliases) });
    }
    if (userEntries.length === 0) return [];

    const scored: Recommendation[] = [];

    for (const artifact of artifacts) {
      if (!artifact || !Array.isArray(artifact.doshas) || artifact.doshas.length === 0) continue;

      const artifactTokens = new Set<string>();
      for (const dosha of artifact.doshas) {
        const normalized = normalizeDosha(dosha);
        if (!normalized) continue;
        expandDosha(normalized, aliases).forEach((token) => artifactTokens.add(token));
      }
      if (artifactTokens.size === 0) continue;

      // Step 3 — intersection of the expanded sets, mapped back to the user's
      // own dosha strings and de-duplicated. Empty intersection ⇒ not relevant.
      const matchedDoshas: string[] = [];
      for (const entry of userEntries) {
        const hit = Array.from(entry.tokens).some((token) => artifactTokens.has(token));
        if (hit && !matchedDoshas.includes(entry.original)) matchedDoshas.push(entry.original);
      }
      if (matchedDoshas.length === 0) continue;

      // Step 4 — priority plus a bonus per matched dosha.
      const priority =
        typeof artifact.priority === 'number' && Number.isFinite(artifact.priority)
          ? artifact.priority
          : 0;
      scored.push({ artifact, matchedDoshas, score: priority + matchedDoshas.length * MATCH_BONUS });
    }

    // Step 5 — highest score first (Array#sort is stable, so catalog order
    // breaks ties deterministically).
    scored.sort((a, b) => b.score - a.score);

    // Step 6 — one suggestion per PRIMARY dosha (first entry of `doshas`):
    // after sorting, the first row kept for a primary dosha is the best one.
    const seenPrimary = new Set<string>();
    const deduped: Recommendation[] = [];
    for (const recommendation of scored) {
      const primary = normalizeDosha(recommendation.artifact.doshas[0]);
      if (primary) {
        if (seenPrimary.has(primary)) continue;
        seenPrimary.add(primary);
      }
      deduped.push(recommendation);
    }

    // Step 7 — clamp to the caller's request, never above the hard cap of 2.
    const requested = options?.maxResults;
    const limit =
      typeof requested === 'number' && Number.isFinite(requested)
        ? Math.max(0, Math.min(Math.floor(requested), HARD_MAX_RESULTS))
        : DEFAULT_MAX_RESULTS;

    return deduped.slice(0, limit);
  } catch {
    // Step 9 — the report must always render, even with a broken catalog.
    return [];
  }
}
