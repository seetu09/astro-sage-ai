import { describe, it, expect, vi } from "vitest";
import { recommendArtifacts, type Artifact } from "@/lib/artifactRecommender";

/** Minimal, complete catalog row for the mocked-catalog specs. */
function makeArtifact(id: string, doshas: string[], priority: number): Artifact {
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
  };
}

describe("artifactRecommender — contextual artifact suggestions", () => {
  it("returns [] for an empty dosha list", () => {
    expect(recommendArtifacts([])).toEqual([]);
  });

  it("returns the matching artifact for a single dosha", () => {
    const results = recommendArtifacts(["mangal_dosh"]);
    expect(results).toHaveLength(1);
    expect(results[0].artifact.id).toBe("example-rudraksha");
    expect(results[0].matchedDoshas).toContain("mangal_dosh");
    expect(results[0].score).toBe(results[0].artifact.priority + results[0].matchedDoshas.length * 2);
  });

  it("returns [] when no artifact covers the dosha", () => {
    expect(recommendArtifacts(["nadi_dosh"])).toEqual([]);
    expect(recommendArtifacts(["totally_unknown_dosha"])).toEqual([]);
  });

  it("deduplicates artifacts sharing a primary dosha, keeping the higher score", async () => {
    // The shipped catalog has one artifact per primary dosha, so this case is
    // exercised against a controlled catalog injected via vi.doMock.
    vi.resetModules();
    vi.doMock("@/data/artifacts.json", () => ({
      default: {
        version: 1,
        artifacts: [
          makeArtifact("dedup-high", ["sade_sati", "shani_dosh"], 30),
          makeArtifact("dedup-low", ["sade_sati"], 25),
          makeArtifact("dedup-other", ["mangal_dosh"], 20),
        ],
        doshaAliases: {
          sade_sati: ["sade_sati", "sadesati"],
          shani_dosh: ["shani", "shani_dosha"],
          mangal_dosh: ["mangal", "manglik"],
        },
      },
    }));

    try {
      const mod = await import("@/lib/artifactRecommender");

      // Only the primary dosha is shared ⇒ exactly one survives, the higher one.
      const deduped = mod.recommendArtifacts(["sade_sati"]);
      expect(deduped).toHaveLength(1);
      expect(deduped[0].artifact.id).toBe("dedup-high");

      // A second, different primary dosha still yields a second suggestion.
      const mixed = mod.recommendArtifacts(["sade_sati", "mangal_dosh"]);
      expect(mixed.map((r) => r.artifact.id)).toEqual(["dedup-high", "dedup-other"]);
    } finally {
      vi.doUnmock("@/data/artifacts.json");
      vi.resetModules();
    }
  });

  it("caps output at maxResults", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"], { maxResults: 1 });
    expect(results).toHaveLength(1);
    expect(results[0].artifact.id).toBe("example-neelam");
  });

  it("never returns more than 2, even when a larger cap is requested", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"], { maxResults: 50 });
    expect(results).toHaveLength(2);
    expect(results.length).toBeLessThanOrEqual(2);
    expect(recommendArtifacts(["sade_sati", "mangal_dosh"]).length).toBeLessThanOrEqual(2);
    expect(recommendArtifacts(["sade_sati"], { maxResults: 0 })).toEqual([]);
  });

  it("matches every dosha key the report can emit", () => {
    // These are the exact keys produced by `calculations.doshas`.
    const mangal = recommendArtifacts(["mangal_dosh"]).map((r) => r.artifact.id);
    const sadeSati = recommendArtifacts(["sade_sati"]).map((r) => r.artifact.id);
    const kaalSarp = recommendArtifacts(["kaal_sarp_dosh"]).map((r) => r.artifact.id);

    expect(mangal).toEqual(["example-rudraksha"]);
    expect(sadeSati).toEqual(["example-neelam"]);
    expect(kaalSarp).toEqual(["example-rudraksha"]);

    // All three active at once still respects the cap and score ordering.
    const all = recommendArtifacts(["mangal_dosh", "sade_sati", "kaal_sarp_dosh"]);
    expect(all).toHaveLength(2);
    expect(all.map((r) => r.artifact.id).sort()).toEqual(["example-neelam", "example-rudraksha"]);
    expect(all[0].score).toBeGreaterThanOrEqual(all[1].score);
  });

  it("resolves aliases — 'manglik' and 'kuja_dosh' match an artifact tagged 'mangal_dosh'", () => {
    const results = recommendArtifacts(["manglik"]);
    expect(results.map((r) => r.artifact.id)).toContain("example-rudraksha");
    expect(results[0].matchedDoshas).toContain("manglik");

    const altSpelling = recommendArtifacts(["kuja_dosh"]);
    expect(altSpelling.map((r) => r.artifact.id)).toContain("example-rudraksha");

    // Aliases also work in reverse: "shani" resolves to the shani_dosh artifact.
    expect(recommendArtifacts(["shani"]).map((r) => r.artifact.id)).toContain("example-neelam");
  });

  it("ranks higher-priority artifacts first", () => {
    const results = recommendArtifacts(["sade_sati", "mangal_dosh"]);
    expect(results).toHaveLength(2);
    expect(results[0].artifact.id).toBe("example-neelam"); // priority 10
    expect(results[1].artifact.id).toBe("example-rudraksha"); // priority 8
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it("never throws — malformed input degrades to []", () => {
    expect(recommendArtifacts(null as unknown as string[])).toEqual([]);
    expect(recommendArtifacts(undefined as unknown as string[])).toEqual([]);
    expect(recommendArtifacts("mangal_dosh" as unknown as string[])).toEqual([]);
    expect(recommendArtifacts({} as unknown as string[])).toEqual([]);
    expect(recommendArtifacts(["", "   "])).toEqual([]);
    expect(recommendArtifacts([123 as unknown as string, null as unknown as string])).toEqual([]);
    expect(recommendArtifacts(["mangal_dosh"], null as unknown as { maxResults?: number })).toHaveLength(1);
    expect(recommendArtifacts(["mangal_dosh"], { maxResults: Number.NaN })).toHaveLength(1);
  });
});
