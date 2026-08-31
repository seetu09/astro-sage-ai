'use client';

import { SectionHeading, StatTile, KeyValueRow } from '../primitives';
import type { ReportModel } from '../reportModel';
import {
  localizeSign,
  localizePlanet,
  localizeNakshatra,
} from '../reportModel';

/**
 * PANCHANG — bare section (composed onto Page 1).
 * The five limbs (Tithi, Vara, Nakshatra, Yoga, Karana) plus the lunar-day
 * ruler and Nakshatra lord, derived from the calculation layer.
 */
export function PanchangSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations?.lagna;
  // Moon's nakshatra lord via the nakshatra index.
  const nakIndex = calc?.moonNakshatraIndex ?? 1;

  const panchang = [
    { key: t('Tithi', 'तिथि'), value: t('— (see calendar)', '— (पंचांग देखें)'), tone: 'default' },
     { key: t('Vara (Weekday)', 'वार'), value: derivedWeekday(model.birthDetails?.date, model.language), tone: 'default' },
    { key: t('Nakshatra', 'नक्षत्र'), value: calc?.moonNakshatra ? localizeNakshatra(model.language, calc.moonNakshatra) : '—', tone: 'gold' },
    { key: t('Nakshatra Lord', 'नक्षत्र स्वामी'), value: localizePlanet(model.language, nakshatraLordFromIndex(nakIndex)), tone: 'violet' },
    { key: t('Tithi Count', 'तिथि गणना'), value: '—', tone: 'default' },
    { key: t('Karana', 'करण'), value: '—', tone: 'default' },
  ];

  return (
    <>
      <SectionHeading
        title={t('Panchang at Birth', 'जन्म के समय पंचांग')}
        subtitle={t('The five limbs of time at your moment of birth', 'जन्म के क्षण के पांच अंग')}
      />

      <div className="rpt-panel">
        <div className="rpt-panel-title">{t('Five Limbs (Panchanga)', 'पंचांग के पांच अंग')}</div>
        <div className="rpt-kv-list">
          {panchang.map((p) => (
            <KeyValueRow key={p.key} label={p.key} value={p.value} />
          ))}
        </div>
      </div>

      {calc && (
        <div className="rpt-stat-grid">
          <StatTile
            label={t('Moon Sign', 'चंद्र राशि')}
            value={localizeSign(model.language, signFromIndex(calc.moonSign))}
          />
          <StatTile
            label={t('Nakshatra Lord', 'नक्षत्र स्वामी')}
            value={localizePlanet(model.language, nakshatraLordFromIndex(nakIndex))}
          />
        </div>
      )}

      <p className="rpt-note">
        {t(
          'Note: Tithi, Karana and Yoga values are placeholders until the full Panchang engine is configured; they do not affect the remaining report.',
          'नोट: तिथि, करण एवं योग मान पूर्ण पंचांग इंजन सक्षम होने पर अद्यतित होंगे; शेष रिपोर्ट पर इसका प्रभाव नहीं पड़ता।'
        )}
      </p>
    </>
  );
}

const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
function signFromIndex(i?: number): string {
  return SIGN_NAMES[Math.max(0, Math.min(11, (i ?? 1) - 1))];
}

const NAKSHATRA_LORDS_ARR = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Mercury', 'Saturn',
  'Jupiter', 'Saturn', 'Jupiter', 'Moon', 'Sun', 'Venus',
  'Mercury', 'Saturn', 'Jupiter', 'Mercury', 'Saturn', 'Mercury',
  'Jupiter', 'Moon', 'Sun', 'Venus', 'Sun', 'Mercury', 'Venus', 'Jupiter',
];
function nakshatraLordFromIndex(idx: number): string {
  return NAKSHATRA_LORDS_ARR[Math.max(0, Math.min(26, ((idx - 1) % 27 + 27) % 27))];
}

function derivedWeekday(dateStr?: string, language: 'en' | 'hi' = 'en'): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const days: Record<'en' | 'hi', string[]> = {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
  };
  return days[language][d.getDay()] ?? '—';
}