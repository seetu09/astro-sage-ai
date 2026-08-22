'use client';

import React, { useMemo } from 'react';
import {
  LocaleCode,
  getRemedyLabel,
  getGemstoneInfo,
  getRudrakshaInfo,
  localizePlanet,
  getSignLord,
  getRetrogradeMarker,
} from '@/lib/astrologyDictionary';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RemediesPlanet {
  planet: string;
  sign: number; // 1-12
  degree: number;
  house?: number;
  retrograde?: boolean;
}

export interface RemediesData {
  ascendantSign: number;
  ascendantDegree?: number;
  moonSign: number;
  planets: RemediesPlanet[];
  hasManglik?: boolean;
  hasKaalSarp?: boolean;
  sadeSatiActive?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface RemediesProps {
  data: RemediesData;
  selectedLanguage: LocaleCode;
}

const Remedies: React.FC<RemediesProps> = ({ data, selectedLanguage }) => {
  // Determine recommended gemstones based on chart
  const gemstoneRecommendations = useMemo(() => {
    const recommendations: { type: string; planet: string; reason: string }[] = [];

    // Life Stone: Lagna lord's gem
    const lagnaLord = getSignLord(data.ascendantSign);
    recommendations.push({
      type: 'lifeStone',
      planet: lagnaLord,
      reason: selectedLanguage === 'en'
        ? `Lords your ascendant (${lagnaLord})`
        : `आपके लग्न का स्वामी (${localizePlanet(lagnaLord, selectedLanguage)})`,
    });

    // Lucky Stone: Moon sign lord's gem
    const moonLord = getSignLord(data.moonSign);
    recommendations.push({
      type: 'luckyStone',
      planet: moonLord,
      reason: selectedLanguage === 'en'
        ? `Lords your Moon sign (${moonLord})`
        : `आपके चंद्र राशि का स्वामी (${localizePlanet(moonLord, selectedLanguage)})`,
    });

    // Fortune Stone: 10th lord's gem
    const tenthLord = getSignLord(10);
    recommendations.push({
      type: 'fortuneStone',
      planet: tenthLord,
      reason: selectedLanguage === 'en'
        ? `Lords your 10th house (${tenthLord})`
        : `आपके १०वीं भाव का स्वामी (${localizePlanet(tenthLord, selectedLanguage)})`,
    });

    return recommendations;
  }, [data, selectedLanguage]);

  // Determine recommended Rudraksha based on doshas and planets
  const rudrakshaRecommendations = useMemo(() => {
    const recs: { mukhi: number; planet: string; reason: string }[] = [];

    if (data.hasManglik) {
      recs.push({
        mukhi: 3,
        planet: 'Mars',
        reason: selectedLanguage === 'en'
          ? 'For Manglik Dosha'
          : 'मांगलिक दोष के लिए',
      });
    }

    if (data.hasKaalSarp) {
      recs.push({
        mukhi: 8,
        planet: 'Rahu-Ketu',
        reason: selectedLanguage === 'en'
          ? 'For Kaal Sarp Dosha'
          : 'काल सर्प दोष के लिए',
      });
    }

    if (data.sadeSatiActive) {
      recs.push({
        mukhi: 7,
        planet: 'Saturn',
        reason: selectedLanguage === 'en'
          ? 'For Sade Sati'
          : 'साड़े साती के लिए',
      });
    }

    // Always recommend 9-Mukhi for overall protection
    recs.push({
      mukhi: 9,
      planet: 'Navagraha',
      reason: selectedLanguage === 'en'
        ? 'For overall planetary balance'
        : 'समग्र ग्रह संतुलन के लिए',
    });

    return recs;
  }, [data, selectedLanguage]);

  return (
    <div className="space-y-6">
      {/* ── Gemstones ── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
            <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">♦</span>
          </span>
          {getRemedyLabel('gemstoneGuide', selectedLanguage)}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gemstoneRecommendations.map((rec) => {
            const info = getGemstoneInfo(rec.planet, selectedLanguage);
            if (!info) return null;

            const typeLabel =
              rec.type === 'lifeStone'
                ? getRemedyLabel('lifeStone', selectedLanguage)
                : rec.type === 'luckyStone'
                ? getRemedyLabel('luckyStone', selectedLanguage)
                : getRemedyLabel('fortuneStone', selectedLanguage);

            return (
              <div
                key={rec.type}
                className="p-4 bg-slate-50/50 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">
                    {typeLabel}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-[#FFD166]">
                    {localizePlanet(rec.planet, selectedLanguage)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-[#6B7280]">{getRemedyLabel('gemstoneGuide', selectedLanguage)}:</span>
                    <span className="ml-1 text-slate-600 dark:text-[#9CA3AF] font-medium">{info.gemName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-[#6B7280]">{getRemedyLabel('wearingGuidelines', selectedLanguage)}:</span>
                    <span className="ml-1 text-slate-600 dark:text-[#9CA3AF]">{info.metal}, {info.finger}, {info.day}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-[#6B7280]">{getRemedyLabel('mantra', selectedLanguage)}:</span>
                    <div className="mt-1 font-serif text-slate-700 dark:text-[#F3F4F6]">{info.mantra}</div>
                    <div className="text-slate-400 dark:text-[#6B7280] mt-0.5">{info.mantraTransliteration}</div>
                  </div>
                  <div className="pt-1 text-slate-500 dark:text-[#9CA3AF] italic">
                    {rec.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Rudraksha ── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center">
            <span className="text-[6px] sm:text-[7px] text-white dark:text-[#080811]">•</span>
          </span>
          {getRemedyLabel('rudrakshaGuide', selectedLanguage)}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rudrakshaRecommendations.map((rec) => {
            const info = getRudrakshaInfo(rec.mukhi, selectedLanguage);
            if (!info) return null;

            return (
              <div
                key={rec.mukhi}
                className="p-4 bg-slate-50/50 dark:bg-white/[0.03] rounded-xl border border-slate-200/60 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-indigo-950 dark:text-[#F3F4F6]">
                    {info.name}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                    {rec.mukhi} {getRemedyLabel('recommended', selectedLanguage)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-[#6B7280]">{getRemedyLabel('mantra', selectedLanguage)}:</span>
                    <span className="ml-1 text-slate-600 dark:text-[#9CA3AF] font-medium">{info.planet}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-[#6B7280]">{getRemedyLabel('wearingGuidelines', selectedLanguage)}:</span>
                    <span className="ml-1 text-slate-600 dark:text-[#9CA3AF]">{info.wearingRules}</span>
                  </div>
                  <div className="pt-1 text-slate-500 dark:text-[#9CA3AF]">
                    {info.benefits}
                  </div>
                  <div className="pt-1 text-slate-500 dark:text-[#9CA3AF] italic">
                    {rec.reason}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Remedies;
