import { describe, it, expect } from "vitest";
import {
  calculateAshtakoot,
  type PersonDetails,
  type MatchResult,
} from "@/lib/ashtakoot";

function person(ref: Partial<PersonDetails> = {}): PersonDetails {
  return { name: "Test", rashi: 1, nakshatra: 1, pada: 1, ...ref };
}

describe("ashtakoot — Guna Milan match engine", () => {
  it("returns a well-formed MatchResult for two individuals", () => {
    const result: MatchResult = calculateAshtakoot(person(), person());
    expect(result.kootas).toHaveLength(8); // 8 gunas
    expect(result.doshas.length).toBeGreaterThan(0);
    expect(result.totalPoints).toBeGreaterThanOrEqual(0);
    expect(result.totalPoints).toBeLessThanOrEqual(36);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
    expect(result.verdict).toBeTruthy();
  });

  it("maxPoints across the 8 kootas sums to the traditional 36 gunas", () => {
    const result = calculateAshtakoot(person(), person());
    const maxSum = result.kootas.reduce((sum, k) => sum + k.maxPoints, 0);
    expect(maxSum).toBe(36);
    expect(result.maxPoints).toBe(36);
    expect(result.totalPoints).toBeLessThanOrEqual(maxSum);
    for (const koota of result.kootas) {
      expect(koota.points).toBeGreaterThanOrEqual(0);
      expect(koota.points).toBeLessThanOrEqual(koota.maxPoints);
    }
  });

  it("identical charts score 28/36 with an excellent verdict and Nadi Dosha", () => {
    // Same rashi + nakshatra ⇒ every koota maxes out except Nadi (same nadi = 0).
    const result = calculateAshtakoot(person(), person());
    expect(result.totalPoints).toBe(28); // 1+2+3+4+5+6+7+0
    expect(result.percentage).toBe(78); // round(28/36*100)
    expect(result.verdict).toBe("Excellent Match"); // >= 28
    const nadiDosha = result.doshas.find((d) => d.name === "Nadi Dosha");
    expect(nadiDosha?.present).toBe(true);
  });

  it("different nadi avoids Nadi Dosha and same rashi avoids Bhakoot Dosha", () => {
    // Nakshatra 1 (nadi 0) vs Nakshatra 2 (nadi 1) ⇒ different nadi.
    const result = calculateAshtakoot(person({ nakshatra: 1 }), person({ nakshatra: 2 }));
    expect(result.doshas.some((d) => d.name === "Nadi Dosha" && d.present)).toBe(false);
    // Rashi 1 vs Rashi 9 → diff 8 (bad bhakoot distance).
    const badBhakoot = calculateAshtakoot(person({ rashi: 1 }), person({ rashi: 9 }));
    expect(badBhakoot.doshas.some((d) => d.name === "Bhakoot Dosha" && d.present)).toBe(true);
  });

  it("every dosha entry carries a severity and remedy", () => {
    const result = calculateAshtakoot(person({ rashi: 1 }), person({ rashi: 9 }));
    for (const dosha of result.doshas) {
      expect(dosha.name).toBeTruthy();
      expect(typeof dosha.present).toBe("boolean");
      expect(["none", "mild", "moderate", "severe"]).toContain(dosha.severity);
      expect(dosha.remedy).toBeTruthy();
    }
  });
});