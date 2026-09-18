import { describe, it, expect } from "vitest";
import {
  checkDoshas,
  checkDoshasFromBirthDetails,
  extractPositionsFromChart,
  type BirthDetails,
  type BirthDetailsFromDate,
  type DoshaCheckResult,
  type DoshaCheckResultWithPositions,
  type CalculatedPositions,
} from "@/lib/dosha-checker";

describe("dosha-checker", () => {
  describe("extractPositionsFromChart", () => {
    it("extracts correct positions from a chart with Moon in Cancer, Mars in Libra, Aries ascendant", () => {
      const chartData = {
        moonSign: "Karka (Cancer)",
        ascendant: "Mesha (Aries)",
        planets: [
          { name: "Sun", sign: "Simha (Leo)" },
          { name: "Moon", sign: "Karka (Cancer)" },
          { name: "Mars", sign: "Tula (Libra)" },
        ],
      };

      const positions: CalculatedPositions = extractPositionsFromChart(chartData);

      expect(positions.moonSign).toBe(4);
      expect(positions.marsSign).toBe(7);
      expect(positions.ascendantSign).toBe(1);
    });

    it("handles chart with English-only sign names", () => {
      const chartData = {
        moonSign: "Cancer",
        ascendant: "Aries",
        planets: [
          { name: "Moon", sign: "Cancer" },
          { name: "Mars", sign: "Libra" },
        ],
      };

      const positions: CalculatedPositions = extractPositionsFromChart(chartData);

      expect(positions.moonSign).toBe(4);
      expect(positions.marsSign).toBe(7);
      expect(positions.ascendantSign).toBe(1);
    });
  });

  describe("checkDoshasFromBirthDetails", () => {
    it("returns a DoshaCheckResultWithPositions with calculated positions", () => {
      const details: BirthDetailsFromDate = {
        name: "Test User",
        birthDate: "1990-06-15",
        birthTime: "14:30",
        birthPlace: "New Delhi, India",
        latitude: 28.6139,
        longitude: 77.2090,
        timezoneOffset: "+05:30",
      };

      const result: DoshaCheckResultWithPositions = checkDoshasFromBirthDetails(details, "en");

      expect(result).toHaveProperty("positions");
      expect(result).toHaveProperty("manglik");
      expect(result).toHaveProperty("sadeSati");
      expect(result.positions).toHaveProperty("moonSign");
      expect(result.positions).toHaveProperty("marsSign");
      expect(result.positions).toHaveProperty("ascendantSign");

      expect(result.positions.moonSign).toBeGreaterThanOrEqual(1);
      expect(result.positions.moonSign).toBeLessThanOrEqual(12);
    });
  });

  describe("bilingual support", () => {
    it("returns Hindi descriptions when locale is 'hi'", () => {
      const details: BirthDetails = {
        name: "परीक्षण",
        moonSign: 4,
        marsSign: 7,
        ascendantSign: 1,
      };

      const result = checkDoshas(details, "hi");
      expect(result.manglik.description).toBeTruthy();
    });
  });
});