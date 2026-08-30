"use client";

import React, { useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

interface PlanetPosition {
  symbol: string;
  name: string;
  house: number;
  rashi: string;
  degree: number;
}

interface KundaliChartProps {
  planets?: PlanetPosition[];
  ascendant?: string;
}

const DEFAULT_PLANETS: PlanetPosition[] = [
  { symbol: "Su", name: "Sun", house: 1, rashi: "Aries", degree: 12.5 },
  { symbol: "Mo", name: "Moon", house: 4, rashi: "Cancer", degree: 8.2 },
  { symbol: "Ma", name: "Mars", house: 10, rashi: "Capricorn", degree: 22.7 },
  { symbol: "Me", name: "Mercury", house: 2, rashi: "Taurus", degree: 5.1 },
  { symbol: "Ju", name: "Jupiter", house: 7, rashi: "Libra", degree: 18.9 },
  { symbol: "Ve", name: "Venus", house: 5, rashi: "Leo", degree: 3.4 },
  { symbol: "Sa", name: "Saturn", house: 11, rashi: "Aquarius", degree: 15.8 },
  { symbol: "Ra", name: "Rahu", house: 3, rashi: "Gemini", degree: 27.3 },
  { symbol: "Ke", name: "Ketu", house: 9, rashi: "Sagittarius", degree: 27.3 },
];

const RASHI_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const RASHI_SYMBOLS = [
  "♈", "♉", "♊", "♋",
  "♌", "♍", "♎", "♏",
  "♐", "♑", "♒", "♓",
];

interface HouseInfo {
  houseNumber: number;
  rashi: string;
  rashiSymbol: string;
  planets: PlanetPosition[];
}

export default function KundaliChart({ planets = DEFAULT_PLANETS, ascendant = "Aries" }: KundaliChartProps) {
  const { t } = useLanguage();
  const [hoveredHouse, setHoveredHouse] = useState<HouseInfo | null>(null);

  // Build house data
  const ascIndex = RASHI_NAMES.indexOf(ascendant);
  const houses: HouseInfo[] = Array.from({ length: 12 }, (_, i) => {
    const rashiIndex = (ascIndex + i) % 12;
    const housePlanets = planets.filter((p) => p.house === i + 1);
    return {
      houseNumber: i + 1,
      rashi: RASHI_NAMES[rashiIndex],
      rashiSymbol: RASHI_SYMBOLS[rashiIndex],
      planets: housePlanets,
    };
  });

  // North Indian style chart layout (3x3 grid with diamond center)
  const getHousePosition = (houseNum: number) => {
    // North Indian chart layout
    const positions: Record<number, string> = {
      1: "col-start-2 row-start-2", // Top center
      2: "col-start-3 row-start-2", // Top right
      3: "col-start-3 row-start-3", // Right middle
      4: "col-start-3 row-start-4", // Bottom right
      5: "col-start-2 row-start-4", // Bottom center
      6: "col-start-1 row-start-4", // Bottom left
      7: "col-start-1 row-start-3", // Left middle
      8: "col-start-1 row-start-2", // Top left
      9: "col-start-2 row-start-1", // Top center-left
      10: "col-start-3 row-start-1", // Top right
      11: "col-start-4 row-start-2", // Right top
      12: "col-start-4 row-start-3", // Right bottom
    };
    return positions[houseNum] || "col-start-2 row-start-3";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white dark:bg-[#0D0C1D] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sunlit-soft dark:shadow-glow-violet">
        {/* Chart Title */}
        <div className="text-center mb-4">
          <h3 className="text-sm font-serif font-semibold text-indigo-900 dark:text-[#FFD166] tracking-wide">
            {t.common.vedicBirthChart}
          </h3>
          <p className="text-xs text-slate-400 dark:text-[#6B7280] mt-0.5">
            {t.common.northIndianStyle} • {t.common.lagna}: {ascendant}
          </p>
        </div>

        {/* Chart Grid */}
        <div className="relative">
          {/* Diamond center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rotate-45 border-2 border-indigo-300/60 dark:border-[#FFD166]/40 bg-white/90 dark:bg-[#121026]/50 backdrop-blur-sm flex items-center justify-center">
              <div className="-rotate-45 text-center">
                <p className="text-[10px] text-slate-400 dark:text-[#6B7280]">{t.common.lagna}</p>
                <p className="text-lg text-indigo-700 dark:text-[#FFD166]">{RASHI_SYMBOLS[ascIndex]}</p>
              </div>
            </div>
          </div>

          {/* House grid */}
          <div className="grid grid-cols-4 grid-rows-4 gap-0.5">
            {houses.map((house) => (
              <div
                key={house.houseNumber}
                className={`${getHousePosition(house.houseNumber)} relative border border-slate-200 dark:border-[#FFD166]/20 bg-slate-50/80 dark:bg-[#121026]/40 hover:bg-indigo-50 dark:hover:bg-[#7B2CBF]/20 transition-colors cursor-pointer min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-lg`}
                onMouseEnter={() => setHoveredHouse(house)}
                onMouseLeave={() => setHoveredHouse(null)}
              >
                {/* House number */}
                <span className="absolute top-1 left-1 text-[9px] sm:text-[10px] text-slate-400 dark:text-[#6B7280] font-normal">
                  {house.houseNumber}
                </span>

                {/* Rashi symbol */}
                <span className="absolute top-1 right-1 text-[10px] sm:text-xs text-indigo-400 dark:text-[#4CC9F0]/70">
                  {house.rashiSymbol}
                </span>

                {/* Planets */}
                <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-4">
                  {house.planets.map((planet) => (
                    <span
                      key={planet.symbol}
                      className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-100 dark:bg-gradient-to-br dark:from-[#FFD166]/20 dark:to-[#E0A96D]/10 dark:border-[#FFD166]/30 dark:text-[#FFD166] dark:shadow-glow-gold text-[9px] sm:text-[10px] font-semibold"
                      title={`${planet.name} • ${planet.rashi} • ${planet.degree.toFixed(1)}°`}
                    >
                      {planet.symbol}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Info Panel */}
        {hoveredHouse && (
          <div className="mt-4 p-3 bg-white/90 dark:bg-[#121026]/90 backdrop-blur-xl border border-slate-200/60 dark:border-[#FFD166]/20 rounded-xl animate-fade-in shadow-sunlit-soft dark:shadow-none">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-900 dark:text-[#FFD166]">
                House {hoveredHouse.houseNumber}
              </p>
              <p className="text-xs text-indigo-500 dark:text-[#4CC9F0]">
                {hoveredHouse.rashiSymbol} {hoveredHouse.rashi}
              </p>
            </div>
            {hoveredHouse.planets.length > 0 ? (
              <div className="space-y-1">
                {hoveredHouse.planets.map((planet) => (
                  <div key={planet.symbol} className="flex items-center justify-between text-xs">
                    <span className="text-slate-800 dark:text-[#F3F4F6] font-medium">
                      {planet.symbol} {planet.name}
                    </span>
                    <span className="text-slate-500 dark:text-[#9CA3AF]">
                      {planet.rashi} • {planet.degree.toFixed(1)}°
                    </span>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-xs text-slate-400 dark:text-[#6B7280]">{t.common.noPlanetsHere}</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {planets.map((planet) => (
            <span
              key={planet.symbol}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 text-[10px] text-slate-500 dark:text-[#9CA3AF]"
            >
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-[#FFD166] dark:to-[#E0A96D]" />
              {planet.symbol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}