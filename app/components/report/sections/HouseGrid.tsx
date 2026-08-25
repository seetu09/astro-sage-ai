'use client';

import PageShell from '../PageShell';
import { SectionHeading, StatTile, KeyValueRow } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizeSign, localizePlanet } from '../reportModel';

const H12: string[] = [
  'Self, vitality, appearance',
  'Wealth, resources, speech',
  ' siblings, courage, communication',
  'Home, mother, property',
  'Children, creativity, intellect',
  'Service, health, daily work',
  'Partnership, marriage, contracts',
  'Transformation, shared resources',
  'Higher learning, philosophy, travel',
  'Career, father, public image',
  'Friends, gains, community',
  'Hidden enemies, isolation, moksha',
];
const H12_HI: string[] = [
  'आत्म, शक्ति, दिखावा',
  'धन, संसाधन, भाषण',
  'भाई/बहन, साहस, संवाद',
  'घर, मातृ, संपत्ति',
  'संतान, रचनात्मकता, बुद्धि',
  'सेवा, स्वास्थ्य, दैनिक कार्य',
  'साथी, विवाह, समझौते',
  'परिवर्तन, साझा संसाधन',
  'उच्च शिक्षा, दर्शन, यात्रा',
  'करियर, पितृ, सार्वजनिक छवि',
  'मित्र, लाभ, समुदाय',
  'गोपनीय शत्रु, अलगाव, मोक्ष',
];

/**
 * Pages 15-16 — Twelve House Grid.
 * Each page renders six houses in a 2-column grid, pulling planet occupants
 * from houseCusps and planetaryPositions on the model.
 */
export function HouseGridPage({
  model,
  page,
  startHouse,
}: {
  model: ReportModel;
  page: 15 | 16;
  startHouse: 1 | 7;
}) {
    const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const houses = model.houseCusps;
  const planets = model.planetaryPositions;

  const slice = Array.from({ length: 6 }, (_, i) => startHouse + i);

  return (
    <PageShell
      title={t('Twelve Houses', 'द्वादश भाव')}
      chapter={String(page).padStart(2, '0')}
      subject={model.clientName}
      page={page}
      totalPages={24}
    >
            <SectionHeading
        title={t(
          page === 15 ? 'Houses 1–6 (Self → Service)' : 'Houses 7–12 (Partner → Liberation)',
          page === 15 ? 'भाव 1–6 (आत्म → सेवा)' : 'भाव 7–12 (साथी → मोक्ष)'
        )}
        subtitle={t('The twelve life domains and their significators', 'जीवन के दोन क्षेत्र और उनके संकेतक')}
      />

      <div className="rpt-house-grid">
        {slice.map((h) => {
          const cusp = houses?.[h - 1];
          const signName = cusp?.sign ?? '';
          const occupying = (planets || []).filter((p) => planetHouseOf(p, h)).map((p) => p.body);
          const lord = signName ? signLordFromSign(model.language, signIndex(signName)) : '';
          const desc = model.language === 'hi' ? H12_HI[h - 1] : H12[h - 1];

          return (
            <div key={h} className="rpt-house-card">
              <div className="rpt-house-head">
                <span className={`rpt-badge rpt-badge-gold`} style={{ width: 'auto' }}>
                  <span className="rpt-badge-value">bh.{h}</span>
                </span>
                <span className="rpt-house-sign">{localizeSign(model.language, signName)}</span>
              </div>
              <div className="rpt-house-body">
                <KeyValueRow
                  label={t('Domain', 'क्षेत्र')}
                  value={<span className="rpt-muted">{desc}</span>}
                />
                <StatTile label={t('Lord', 'स्वामी')} value={lord || '--'} />
                <StatTile
                  label={t('Occupants', 'निवासी')}
                  value={(occupying.length ? occupying.join(', ') : '--') as string}
                />
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function planetHouseOf(p: { body: string; house?: string | number }, h: number): boolean {
  return Number(p.house ?? 0) === h;
}
function signIndex(sign: string): number {
  const names = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const i = names.indexOf(sign);
  return i < 0 ? 1 : i + 1;
}
function signLordFromSign(locale: 'en' | 'hi', signIdx: number): string {
  const lords = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
  const lord = lords[Math.max(0, Math.min(11, signIdx - 1))] ?? '';
  return localizePlanet(locale, lord);
}