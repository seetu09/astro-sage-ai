import { describe, it, expect } from "vitest";
import {
  reduceToSingleDigit,
  lettersToNumber,
  calculateNumerology,
  getNumberMeaning,
  ALL_NUMBERS,
} from "@/lib/numerology";

describe("numerology — pure math helpers", () => {
  it("reduceToSingleDigit reduces any positive integer to a single digit 1-9", () => {
    expect(reduceToSingleDigit(9)).toBe(9);
    expect(reduceToSingleDigit(10)).toBe(1);
    expect(reduceToSingleDigit(38)).toBe(2); // 3+8=11 → 1+1=2
    expect(reduceToSingleDigit(1990)).toBe(1); // 1+9+9+0=19 → 1+9=10 → 1
  });

  it("lettersToNumber maps A=1 … Z=26 and reduces", () => {
    expect(lettersToNumber("")).toBe(0);
    expect(lettersToNumber("A")).toBe(1);
    expect(lettersToNumber("Z")).toBe(8); // 26 → 2+6=8
    expect(lettersToNumber("virat")).toBe(7); // 22+9+18+1+20=70 → 7
  });

  it("ignores non-alphabetic characters", () => {
    expect(lettersToNumber("A-123 B!")).toBe(lettersToNumber("AB")); // → 3
  });

  it("calculateNumerology rejects invalid input and stays deterministic", () => {
    expect(calculateNumerology({ name: "A", day: 0, month: 8, year: 1990 })).toBeNull();
    const profile = calculateNumerology({ name: "A", day: 15, month: 8, year: 1990 });
    expect(profile).not.toBeNull();
    expect(profile!.moolank.number).toBe(6); // reduce(15) = 6
    expect(profile!.bhagyank.number).toBe(6); // 15+8+1990 digits → 33 → 6
    expect(profile!.namank.number).toBe(1); // "A" → 1
    expect(profile!.dob).toBe("15/8/1990");
    expect(profile!.name).toBe("A");
  });

  it("getNumberMeaning returns the requested number", () => {
    expect(getNumberMeaning(3).number).toBe(3);
    const info = getNumberMeaning(1);
    expect(info.number).toBe(1);
    expect(typeof info.planet).toBe("string");
    expect(info.planet.length).toBeGreaterThan(0);
  });

  it("ALL_NUMBERS contains exactly 1-9", () => {
    expect([...ALL_NUMBERS].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});