'use client';

import PageShell from '../PageShell';
import {
  SectionHeading,
  Hr,
  StatTile,
  KeyValueRow,
  Badge,
} from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizeSign, localizePlanet, signLordName } from '../reportModel';

/* ==================================================================== */
/* PAGE 1 — Nativity Summary                                            */
/* ==================================================================== */

export function NativitySummaryPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const bd = model.birthDetails;
  const calc = model.calculations?.lagna;

  return (
    <PageShell
      title={t('Nativity Summary', 'जन्म विश्लेषण सारांश')}
      chapter="01"
      subject={model.clientName}
      page={1}
      totalPages={24}
    >
      <SectionHeading
        title={t('Birth Snapshot', 'जन्म सार के क्षण')}
        subtitle={t('Key placement + personality overview', 'प्रमुख स्थिति एवं व्यक्तित्व अवलोकन')}
      />

      <div className="rpt-stat-grid">
        {calc && (
          <>
            <StatTile
              label={t('Ascendant (Lagna)', 'लग्न')}
              value={localizeSign(model.language, signFromIndex(calc.ascendantSign))}
            />
            <StatTile
              label={t('Moon Sign', 'चंद्र राशि')}
              value={localizeSign(model.language, signFromIndex(calc.moonSign))}
            />
            <StatTile
              label={t('Sun Sign', 'सूर्य राशि')}
              value={localizeSign(model.language, signFromIndex(calc.sunSign))}
            />
            <StatTile
              label={t('Birth Nakshatra', 'जन्म नक्षत्र')}
              value={calc.moonNakshatra || '-'}
            />
          </>
        )}
      </div>

      {bd && (
        <div className="rpt-panel">
          <div className="rpt-panel-title">{t('Birth Details', 'जन्म विवरण')}</div>
          <div className="rpt-two-col">
            <KeyValueRow label={t('Date', 'दिनांक')} value={bd.date} />
            <KeyValueRow label={t('Time', 'समय')} value={bd.time} />
            <KeyValueRow label={t('Latitude', 'अक्षांश')} value={bd.latitude} />
            <KeyValueRow label={t('Longitude', 'देशान्तर')} value={bd.longitude} />
            <KeyValueRow label={t('Time Zone', 'समय क्षेत्र')} value={bd.timezone} />
            <KeyValueRow label={t('Chart Style', 'चार्ट शैली')} value={model.chartType} />
          </div>
        </div>
      )}

      <Hr />

      <SectionHeading
        title={t('Personality Overview', 'व्यक्तित्व अवलोकन')}
      />
      <p className="rpt-prose">
        {t(
          'The chart shows a balanced interplay between the ascendant energy, lunar disposition and solar identity. Key strengths emerge when the luminaries cooperate; the monthly (Moon) chart shapes emotional expression while the natal (Sun) chart anchors the core will.',
          'कुंडली लग्न, चंद्र और सूर्य की संतुलित व्यवस्था दर्शाती है। प्रकाशमान ग्रहों (चंद्र-सूर्य) की सहभागिता से भावनात्मक एवं केंद्रीय पहचान दोनों संबलित होते हैं।'
        )}
      </p>

      {model.calculations && (
        <div className="rpt-badge-group" style={{ marginTop: 12 }}>
          <Badge label={t('Running Mahadasha', 'चल रही महादशा')} value={model.calculations.vimshottari?.currentDasha?.mahadasha ?? '-'} tone="violet" />
          <Badge label={t('Solar Return', 'सौर वर्ष')} value={model.chartType} tone="cyan" />
          <Badge label={t('Tier', 'स्तर')} value={model.isPaidTier ? 'Premium' : 'Basic'} tone="gold" />
        </div>
      )}
    </PageShell>
  );
}

const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
function signFromIndex(i?: number): string {
  return SIGN_NAMES[Math.max(0, Math.min(11, (i ?? 1) - 1))];
}