'use client';

import { SectionHeading, StatTile, KeyValueRow, Badge } from '../primitives';
import type { ReportModel } from '../reportModel';

const DAY_INFOS = [
  { en: 'Monday', hi: 'सोमवार', planet: 'Moon', color: 'cyan' as const },
  { en: 'Tuesday', hi: 'मंगलवार', planet: 'Mars', color: 'rose' as const },
  { en: 'Wednesday', hi: 'बुधवार', planet: 'Mercury', color: 'violet' as const },
  { en: 'Thursday', hi: 'गुरुवार', planet: 'Jupiter', color: 'amber' as const },
  { en: 'Friday', hi: 'शुक्रवार', planet: 'Venus', color: 'gold' as const },
  { en: 'Saturday', hi: 'शनिवार', planet: 'Saturn', color: 'slate' as const },
  { en: 'Sunday', hi: 'रविवार', planet: 'Sun', color: 'rose' as const },
];

/**
 * DAILY GUIDANCE — bare section.
 * A quick-reference guide: the benefic day + planet, a short action note, and
 * the running dasha summary so the reader can orient day-to-day practice.
 */
export function DailyGuidanceSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
    const today = new Date();
  const dayIdx = today.getDay(); // 0 = Sunday → 6 = Saturday
  const infoMap = {
    0: DAY_INFOS[6], // Sunday
    1: DAY_INFOS[0], // Monday
    2: DAY_INFOS[1], // Tuesday
    3: DAY_INFOS[2], // Wednesday
    4: DAY_INFOS[3], // Thursday
    5: DAY_INFOS[4], // Friday
    6: DAY_INFOS[5], // Saturday
  };
    const todayInfo = infoMap[dayIdx as 0 | 1 | 2 | 3 | 4 | 5 | 6];
  // BadgeTone is a subset of DayInfo['color']; remap 'slate' → 'gold'.
  const dayTone = (todayInfo.color === 'slate' ? 'gold' : todayInfo.color) as 'gold' | 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';

  const cur = model.calculations?.vimshottari?.currentDasha;

  return (
    <>
      <SectionHeading
        title={t('Today\'s Orientation', 'आज का सारांश')}
        subtitle={t('Your benefic day and the running dasha', 'आपका शुभ दिवस एवं चल रही दशा')}
      />

            <div className="rpt-stat-grid">
        <StatTile label={t('Day', 'दिवस')} value={t(todayInfo.en, todayInfo.hi)} />
        <StatTile label={t('Benefic Planet', 'दैवत')} value={todayInfo.planet} />
      </div>

      <div className="rpt-badge-group">
        <Badge label={t('Day Lord', 'दिवस स्वामी')} value={todayInfo.planet} tone={dayTone} />
        {cur && <Badge label={t('Running', 'चल रही')} value={cur.mahadasha} tone="violet" />}
        {cur && <Badge label={t('Sub-Period', 'उप-अवधि')} value={cur.antardasha} tone="cyan" />}
      </div>

      <SectionHeading
        title={t('Suggested Practice', 'सुझावित अभ्यास')}
        subtitle={t('Simple daily alignment', 'सरल दैनिक समंजय')}
        accent="gold"
      />
      <KeyValueRow label={t('Morning', 'सुबह')} value={t('Sincere mantra repetition at sunrise', 'सूर्योदय पर उत्साहपूर्वक मंत्र जप')} />
      <KeyValueRow label={t('Midday', 'दोपहर')} value={t('Balanced meals; mindful work', 'संतुलित भोजन; सचेतन कार्य')} />
      <KeyValueRow label={t('Evening', 'शाम')} value={t('Gratitude review and reset', 'कृतज्ञता समीक्षा एवं पुनर्स्थापना')} />

      <p className="rpt-note">
        {t('Align daily actions with the benefic planet of the day and the running Mahadasha lord for best results.', 'दैनिक कार्यों को दिवस के दैवत और चल रही महादशा स्वामी के साथ मिलाकर सर्वोत्तम परिणाम प्राप्त करें।')}
      </p>
    </>
  );
}

// Re-export the table so it stays tree-shakeable for consumers.
export { DAY_INFOS };