'use client';

import PageShell from '../PageShell';
import { SectionHeading, BadgeGroup, NarrativeCard, MilestoneTable } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizeSign } from '../reportModel';
import type { SadeSatiPhase, DhaiyaPhase } from '@/types/kundali';

const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const PHASE_LABELS = {
  rising: { en: 'Rising (Armbandh)', hi: 'उदय (अर्धबंध)' },
  peak: { en: 'Peak (Kṣetra)', hi: 'चरम (क्षेत्र)' },
  setting: { en: 'Setting (Punarjanma Bandhan)', hi: 'अस्तम (पुनर्जन्म बंधन)' },
  inactive: { en: 'Inactive (Viṇāśikhya)', hi: 'निष्क्रिय (विनाशिख्य)' },
};
const DAIHYA_LABELS: Record<DhaiyaPhase, { en: string; hi: string }> = {
  pre: { en: 'Pre-Dhaiya', hi: 'पूर्व-धैव्य' },
  post: { en: 'Post-Dhaiya', hi: 'पश्चात-धैव्य' },
  inactive: { en: 'Inactive', hi: 'निष्क्रिय' },
};

/**
 * PAGE 19 — Sade Sati & Dhaiya.
 * Reports Saturn's 2½-life Sade Sati (rising/peak/setting) and the sub-period
 * Dhaiya window, derived deterministically from the calculation layer.
 */
export function SadeSatiPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const ss = model.calculations?.doshas?.sadeSati;
  const active = ss?.isActive ?? false;
  const phase: SadeSatiPhase = ss?.phase ?? 'inactive';
  const phaseLabel = PHASE_LABELS[phase][model.language === 'hi' ? 'hi' : 'en'];
    const moonSign = localizeSign(model.language, SIGN_NAMES[(ss?.moonSign ?? 1) - 1] ?? 'Moon');
  const satSign = localizeSign(model.language, SIGN_NAMES[(ss?.saturnSignNow ?? 1) - 1] ?? 'Saturn');

  return (
    <PageShell
      title={t('Sade Sati', 'साढ़े साती')}
      chapter="19"
      subject={model.clientName}
      page={19}
      totalPages={24}
    >
      <SectionHeading
        title={active ? t('Active Sade Sati Period', 'सक्रिय साढ़े साती अवधि') : t('No Active Sade Sati', 'कोई सक्रिय साढ़े साती नहीं')}
        subtitle={t(`Phase: ${phaseLabel}`, `चरण: ${phaseLabel}`)}
      />

      <BadgeGroup
        badges={[
          { label: t('Active', 'सक्रिय'), value: active ? 'Yes' : 'No', tone: active ? 'rose' : 'emerald' },
          { label: t('Phase', 'चरण'), value: phaseLabel, tone: active ? 'amber' : 'cyan' },
          { label: t('Saturn Sign', 'शनि राशि'), value: satSign, tone: 'gold' },
        ]}
      />

      {ss && (
        <>
          <SectionHeading
            title={t('Saturn Transit Context', 'शनि के संक्रमण संदर्भ')}
            subtitle={t(`Moon sign ${moonSign} | Saturn currently in ${satSign}`, `चंद्र ${moonSign} | शनि अभी ${satSign} में`)}
            accent="violet"
          />
          <p className="rpt-prose">
            {t(
              `The Sade Sati (Saturn's 2½-sign transit from the natal Moon) is currently ${phaseLabel}. With the natal Moon in ${moonSign} and Saturn transiting ${satSign}, this phase emphasises discipline through challenge and the maturation of long-term structures.`,
              `साढ़े साती (जन्म चंद्र से शनि का २½ राशि संक्रमण) वर्तमान में ${phaseLabel} चरण में है। जन्म चंद्र ${moonSign} और शनि ${satSign} में से संक्रमण कर रहा है, जो लंबे समय की संकल्पना और अवसंरचना की परिपक्वता पर ज़ोर देता है।`
            )}
          </p>

          {ss.activePeriod && (
            <NarrativeCard label={t('Active Window', 'सक्रिय अवधि')} tone="amber">
              <p className="rpt-prose">
                {t('Start', 'प्रारंभ')}: {ss.activePeriod.startDate} — {t('End', 'समाप्ति')}: {ss.activePeriod.endDate}
              </p>
            </NarrativeCard>
          )}
        </>
      )}

      <SectionHeading
        title={t('Dhaiya Sub-Period', 'धैव्य उपावधि')}
        subtitle={t('Saturn\'s 1-life sub-phase', 'शनि का १ जीवन उप-चरण')}
        accent="cyan"
      />
            {ss && ss.dhaiya && (
        <MilestoneTable
          milestones={[
            {
              period: t('Status', 'स्थिति'),
              event: ss.dhaiya.isActive ? t('Dhaiya Active', 'धैव्य सक्रिय') : t('Dhaiya Inactive', 'धैव्य निष्क्रिय'),
              note: `${t('Phase', 'चरण')}: ${DAIHYA_LABELS[ss.dhaiya.phase][model.language === 'hi' ? 'hi' : 'en']}`,
              outcome: 'neutral',
            },
            ...(ss.dhaiya.period
              ? [{
                  period: t('Window', 'खिड़की'),
                  event: `${ss.dhaiya.period.startDate} → ${ss.dhaiya.period.endDate}`,
                }]
              : []),
          ]}
        />
      )}
    </PageShell>
  );
}