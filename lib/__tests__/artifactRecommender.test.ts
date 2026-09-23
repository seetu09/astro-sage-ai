import { describe, it, expect } from "vitest";
import { recommendArtifacts, type Artifact } from "@/lib/artifactRecommender";
import type { ArtifactCatalog, CatalogArtifact } from "@/lib/catalogSchema";

/**
 * The recommender no longer imports a catalog — it takes one as an argument —
 * so these specs pass fixtures directly instead of mocking module resolution.
 */

/** Minimal, complete catalog row. */
function makeArtifact(
  id: string,
  doshas: string[],
  priority: number,
  overrides: Partial<Artifact> = {}
): CatalogArtifact {
  return {
    id,
    name: { en: id, hi: id },
    doshas,
    pitch: { en: "pitch", hi: "pitch" },
    benefits: { en: ["b1"], hi: ["b1"] },
    imageUrl: "",
    productUrl: `/store/${id}`,
    priority,
    disclaimer: { en: "disclaimer", hi: "disclaimer" },
    category: "Other",
    priceInr: 0,
    currency: "INR",
    ...overrides,
  };
}

/** The alias map the shipped catalog used to carry, kept for alias specs. */
const DOSHA_ALIASES: Record<string, string[]> = {
  mangal_dosh: ["mangal", "manglik", "kuja_dosh", "mars_affliction", "mangal"],
  sade_sati: ["sade_sati", "sadesati", "shani_sade_sati", "sade-sati"],
  kaal_sarp_dosh: ["kaal_sarp", "kal_sarp", "kaal_sarp_dosh", "naga_dosh"],
  shani_dosh: ["shani", "saturn_affliction", "shani_dosha"],
};

/** The two seeded placeholder rows (both is_active = false in the DB). */
const SHIPPED: ArtifactCatalog = {
  artifacts: [
    makeArtifact("example-neelam", ["sade_sati", "shani_dosh"], 10, { category: "Gemstones" }),
    makeArtifact("example-rudraksha", ["mangal_dosh", "kaal_sarp_dosh"], 8, {
      category: "Rudraksha",
    }),
  ],
  doshaAliases: DOSHA_ALIASES,
};

/** A controlled catalog for the dedup spec. */
const DEDUP: ArtifactCatalog = {
  artifacts: [
    makeArtifact("dedup-high", ["sade_sati", "shani_dosh"], 30),
    makeArtifact("dedup-low", ["sade_sati"], 25),
    makeArtifact("dedup-other", ["mangal_dosh"], 20),
  ],
  doshaAliases: DOSHA_ALIASES,
};

describe("artifactRecommender — contextual artifact suggestions", () => {
  it("returns [] for an empty dosha list", () => {
    expect(recommendArtifacts([], SHIPPED)).toEqual([]);
  });

  it("returns [] for an empty catalog", () => {
    expect(recommendArtifacts(["mangal_dosh"], { artifacts: [], doshaAliases: {} })).toEqual([]);
  });

  it("returns the matching artifact for a single dosha", () => {
    const results = recommendArtifacts(["mangal_dosh"], SHIPPED);
    expect(results).toHaveLength(1);
    expect(results[0].artifact.id).toBe("example-rudraksha");
    expect(results[0].matchedDoshas).toContain("mangal_dosh");
    expect(results[0].score).toBe(results[0].artifact.priority + results[0].matchedDoshas.length * 2);
  });

  it("returns [] when no artifact covers the dosha", () => {
    expect(recommendArtifacts(["nadi_dosh"], SHIPPED)).toEqual([]);
    expect(recommendArtifacts(["totally_unknown_dosha"], SHIPPED)).toEqual([]);
  });


  it("deduplicates artifacts sharing a primary dosha, keeping the higher score", () => {
    // Only the primary dosha is shared ⇒ exactly one survives, the higher one.
    const deduped = recommendArtifacts(["sade_sati"], DEDUP);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].artifact.id).toBe("dedup-high");

    // A second, different primary dosha still yields a second suggestion.
    const mixed = recommendArtifacts(["sade_sati", "mangal_dosh"], DEDUP);
    expect(mixed.map((r) => r.artifact.id)).toEqual(["dedup-high", "dedup-other"]);
  });

  it("caps output at maxResults", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"], SHIPPED, { maxResults: 1 });
    expect(results).toHaveLength(1);
    expect(results[0].artifact.id).toBe("example-neelam");
  });

  it("never returns more than 2, even when a larger cap is requested", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"], SHIPPED, { maxResults: 50 });
    expect(results).toHaveLength(2);
    expect(results.length).toBeLessThanOrEqual(2);
    expect(recommendArtifacts(["sade_sati", "mangal_dosh"], SHIPPED).length).toBeLessThanOrEqual(2);
    expect(recommendArtifacts(["sade_sati"], SHIPPED, { maxResults: 0 })).toEqual([]);
  });

  it("matches every dosha key the report can emit", () => {
    // These are the exact keys produced by `calculations.doshas`.
    const mangal = recommendArtifacts(["mangal_dosh"], SHIPPED).map((r) => r.artifact.id);
    const sadeSati = recommendArtifacts(["sade_sati"], SHIPPED).map((r) => r.artifact.id);
    const kaalSarp = recommendArtifacts(["kaal_sarp_dosh"], SHIPPED).map((r) => r.artifact.id);

    expect(mangal).toEqual(["example-rudraksha"]);
    expect(sadeSati).toEqual(["example-neelam"]);
    expect(kaalSarp).toEqual(["example-rudraksha"]);

    // All three active at once still respects the cap and score ordering.
    const all = recommendArtifacts(["mangal_dosh", "sade_sati", "kaal_sarp_dosh"], SHIPPED);
    expect(all).toHaveLength(2);
    expect(all.map((r) => r.artifact.id).sort()).toEqual(["example-neelam", "example-rudraksha"]);
    expect(all[0].score).toBeGreaterThanOrEqual(all[1].score);
  });

  it("resolves aliases — 'manglik' and 'kuja_dosh' match an artifact tagged 'mangal_dosh'", () => {
    const results = recommendArtifacts(["manglik"], SHIPPED);
    expect(results.map((r) => r.artifact.id)).toContain("example-rudraksha");
    expect(results[0].matchedDoshas).toContain("manglik");

    const altSpelling = recommendArtifacts(["kuja_dosh"], SHIPPED);
    expect(altSpelling.map((r) => r.artifact.id)).toContain("example-rudraksha");

    // Aliases also work in reverse: "shani" resolves to the shani_dosh artifact.
    expect(recommendArtifacts(["shani"], SHIPPED).map((r) => r.artifact.id)).toContain("example-neelam");
  });

  it("ranks higher-priority artifacts first", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"], SHIPPED);
    expect(results).toHaveLength(2);
    expect(results[0].artifact.id).toBe("example-neelam"); // priority 10
    expect(results[1].artifact.id).toBe("example-rudraksha"); // priority 8
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it("never throws — malformed input degrades to []", () => {
    expect(recommendArtifacts(null as unknown as string[], SHIPPED)).toEqual([]);
    expect(recommendArtifacts(undefined as unknown as string[], SHIPPED)).toEqual([]);
    expect(recommendArtifacts("mangal_dosh" as unknown as string[], SHIPPED)).toEqual([]);
    expect(recommendArtifacts({} as unknown as string[], SHIPPED)).toEqual([]);
    expect(recommendArtifacts(["", "   "], SHIPPED)).toEqual([]);
    expect(recommendArtifacts([123 as unknown as string, null as unknown as string], SHIPPED)).toEqual([]);
    expect(
      recommendArtifacts(["mangal_dosh"], SHIPPED, null as unknown as { maxResults?: number })
    ).toHaveLength(1);
    expect(recommendArtifacts(["mangal_dosh"], SHIPPED, { maxResults: Number.NaN })).toHaveLength(1);
  });

  it("never throws — a missing or malformed catalog degrades to []", () => {
    expect(recommendArtifacts(["mangal_dosh"], null as unknown as ArtifactCatalog)).toEqual([]);
    expect(recommendArtifacts(["mangal_dosh"], undefined as unknown as ArtifactCatalog)).toEqual([]);
    expect(recommendArtifacts(["mangal_dosh"], {} as ArtifactCatalog)).toEqual([]);
    expect(
      recommendArtifacts(["mangal_dosh"], { artifacts: "nope" } as unknown as ArtifactCatalog)
    ).toEqual([]);
  });
});
