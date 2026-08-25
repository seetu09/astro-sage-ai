'use client';

import PageShell from '../PageShell';
import {
  SectionHeading,
  BadgeGroup,
  NarrativeCard,
  MilestoneTable,
  Milestone,
} from '../primitives';
import type { ReportModel } from '../reportModel';

/** The six life pillars covered across the report. */
export type LifePillarKey =
  | 'career'
  | 'wealth'
  | 'marriage'
  | 'health'
  | 'education'
  | 'family';

/** Config that maps each pillar to its localized labels + 3 badges. */
export interface LifePillarConfig {
  key: LifePillarKey;
  /** Page number this pillar occupies. */
  page: number;
  titleEn: string;
  titleHi: string;
  /** 3-badge header: exactly {score, timeframe, lord}. */
  badges: {
    score: string;
    timeframe: string;
    lord: string;
  };
    narrativeEn: string;
  narrativeHi: string;
  milestones: Milestone[];
}

const PILLARS: LifePillarConfig[] = [
  {
    key: 'career',
    page: 7,
    titleEn: 'Career & Public Standing',
    titleHi: 'करियर एवं सार्वजनिक स्थिति',
    badges: { score: 'Strong 10H', timeframe: '2024–2032', lord: 'Saturn' },
    narrativeEn:
      'Your 10th house of career is well-tenanted, promising recognition through disciplined effort. Long-term structures built now will compound for years.',
    narrativeHi:
      'आपका दशम भाव (करियर) सशक्त है, जो अनुशासित प्रयास से पहचान दिलाता है। अभी बनी नींव वर्षों तक फल देगी।',
    milestones: [
      { period: '2024–2026', event: 'Foundation & role clarity', note: 'Steady groundwork; avoid job-hopping.', outcome: 'neutral' },
      { period: '2026–2029', event: 'Promotion window', note: 'Mercury-Jupiter period favours advancement.', outcome: 'positive' },
      { period: '2029–2032', event: 'Leadership / independent practice', note: 'Saturn matures—long-term authority.', outcome: 'positive' },
    ],
  },
  {
    key: 'wealth',
    page: 8,
    titleEn: 'Wealth & Prosperity',
    titleHi: 'धन एवं समृद्धि',
    badges: { score: 'Moderate · 2H/11H', timeframe: '2024–2032', lord: 'Jupiter' },
    narrativeEn:
      'Wealth grows steadily through patient accumulation rather than sudden windfalls. Jupiter’s blessing protects capital and encourages ethical expansion.',
    narrativeHi:
      'धन क्रमिक रूप से बढ़ता है, अचानक लाभ की अपेक्षा स्थिर संचय से। गुरु का आशीर्वाद नैतिक विस्तार को प्रोत्साहित करता है।',
    milestones: [
      { period: '2024–2026', event: 'Savings discipline', note: 'Build emergency corpus early.', outcome: 'neutral' },
      { period: '2027–2030', event: 'Asset growth', note: 'Diversify into long-term instruments.', outcome: 'positive' },
            { period: '2030–2032', event: 'Capitalise on opportunity', note: 'Jupiter returns favour expansion.', outcome: 'positive' },
    ],
  },
  {
    key: 'marriage',
    page: 9,
    titleEn: 'Marriage & Love',
    titleHi: 'विवाह एवं प्रेम',
    badges: { score: 'Harmonious · 7H', timeframe: '2025–2028', lord: 'Venus' },
    narrativeEn:
      'The 7th house signals a supportive partnership. Mutual respect and shared values form the bedrock; timing favours commitment around the mid-period.',
    narrativeHi:
      'सप्तम भाव सौहार्द साथी का संकेत देता है। पारस्परिक सम्मान और साझा मूल्य गहरे संबंध बनाते हैं।',
    milestones: [
      { period: '2025–2027', event: 'Commitment events', note: 'Venusian period favours union.', outcome: 'positive' },
      { period: '2027–2030', event: 'Partnership stabilisation', note: 'Shared responsibilities deepen bond.', outcome: 'neutral' },
    ],
  },
  {
    key: 'health',
    page: 10,
    titleEn: 'Health & Vitality',
    titleHi: 'स्वास्थ्य एवं शक्ति',
    badges: { score: 'Resilient · 6H/8H', timeframe: '2024–2032', lord: 'Sun' },
    narrativeEn:
      'Vitality is overall strong, though periodic stress (Saturn) asks for routine care. Regulated sleep, diet and moderate exercise keep the chart’s strengths dominant.',
    narrativeHi:
      'शारीरिक शक्ति प्रबल है, किंतु शनि के दबाव से नियमित देखभाल आवश्यक है। संतुलित नींद-आहार से बल बना रहता है।',
    milestones: [
      { period: '2024–2026', event: 'Preventive focus', note: 'Watch digestion & stress levels.', outcome: 'neutral' },
      { period: '2027–2029', event: 'Energy high', note: 'Good window for fitness milestones.', outcome: 'positive' },
      { period: '2030–2032', event: 'Maintenance phase', note: 'Consistency over intensity.', outcome: 'neutral' },
    ],
  },
  {
    key: 'education',
    page: 11,
    titleEn: 'Education & Learning',
    titleHi: 'शिक्षा एवं अध्ययन',
    badges: { score: 'Curious · 5H', timeframe: '2024–2030', lord: 'Mercury' },
    narrativeEn:
      'The 5th house is quick-witted; you learn best through application. Coaching and structured study accelerate mastery, especially in technical fields.',
    narrativeHi:
      'पंचम भाव चतुर है; करने से सीखना सर्वोत्तम रहता है। तकनीकी क्षेत्र में संरचित अध्ययन महारत बढ़ाता है।',
    milestones: [
      { period: '2024–2026', event: 'Skill-building', note: 'Certifications add leverage.', outcome: 'positive' },
      { period: '2026–2030', event: 'Advanced learning', note: 'Higher studies or specialisation.', outcome: 'neutral' },
    ],
  },
  {
    key: 'family',
    page: 12,
    titleEn: 'Family & Travel',
    titleHi: 'परिवार एवं यात्रा',
    badges: { score: 'Supportive · 4H/9H', timeframe: '2024–2032', lord: 'Moon' },
    narrativeEn:
      'Family anchors your growth while occasional distant travel expands perspective. Moon in the 4H keeps emotional roots strong and adaptability high.',
    narrativeHi:
      'परिवार विकास की जड़ है, जबकि दूरगामी यात्रा दृष्टिकोण बढ़ाती है। चंद्र भावनात्मक सूत्र प्रबल रखता है।',
    milestones: [
      { period: '2024–2027', event: 'Family milestones', note: 'Domestic stability favours growth.', outcome: 'positive' },
      { period: '2027–2030', event: 'Relocation / travel', note: 'Career-move travel possible.', outcome: 'neutral' },
    ],
  },
];
/**
 * PAGE 7–14 — Life Pillars.
 * One pillar per page, each with a 3-badge header, a narrative card and a
 * milestone forecast table. The `LifePillarPage` component is config-driven.
 */
export function LifePillarPage({
  model,
  pillar,
}: {
  model: ReportModel;
  pillar: LifePillarConfig;
}) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const title = model.language === 'hi' ? pillar.titleHi : pillar.titleEn;
  const narrative = model.language === 'hi' ? pillar.narrativeHi : pillar.narrativeEn;

  return (
    <PageShell
      title={title}
      chapter={String(pillar.page).padStart(2, '0')}
      subject={model.clientName}
      page={pillar.page}
      totalPages={24}
    >
      <BadgeGroup
        badges={[
          { label: t('Strength', 'सशक्तता'), value: pillar.badges.score, tone: 'violet' },
          { label: t('Active Window', 'सक्रिय अवधि'), value: pillar.badges.timeframe, tone: 'cyan' },
          { label: t('Ruling Lord', 'नियंत्रक ग्रह'), value: pillar.badges.lord, tone: 'gold' },
        ]}
      />

      <SectionHeading title={t('Narrative', 'विश्लेषण')} />
      <NarrativeCard label={t('House Reading', 'भाव विश्लेषण')} tone="gold">
        <p className="rpt-prose">{narrative}</p>
      </NarrativeCard>

      <SectionHeading
        title={t('Milestone Forecast', 'मील के पत्थर पूर्वानुमान')}
        subtitle={t('Tabled outlook by period', 'अवधि-वार तालिका')}
        accent="violet"
      />
      <MilestoneTable milestones={pillar.milestones} />
    </PageShell>
  );
}

/**
 * Page 13 — Life Balance overview board (cross-pillar comparison).
 * Keeps the 7–14 pillar block contiguous while adding synthesis value.
 */
export function LifeBalancePage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  return (
    <PageShell
      title={t('Life Pillars — Overview', 'जीवन स्तंभ सारांश')}
      chapter="13"
      subject={model.clientName}
      page={13}
      totalPages={24}
    >
      <SectionHeading
        title={t('Six Pillars at a Glance', 'छह स्तंभ एक नज़र में')}
        subtitle={t('Relative strength across the life domains', 'जीवन के विभिन्न क्षेत्रों की सापेक्ष शक्ति')}
      />
      <div className="rpt-two-col">
        {PILLARS.map((p) => {
          const name = model.language === 'hi' ? p.titleHi : p.titleEn;
          return (
            <div key={p.key} className="rpt-synergy-card">
              <div className="rpt-synergy-name">{name}</div>
              <div className="rpt-synergy-meta">
                {p.badges.score} • Lord {p.badges.lord}
              </div>
            </div>
          );
        })}
            </div>
    </PageShell>
  );
}

/**
 * Page 14 — Consolidated milestone tracker (cross-pillar timeline).
 * Merges every pillar's forecast rows into one timeline so the reader can see
 * how the life domains interact over the decade.
 */
export function MilestoneTrackerPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const all: { period: string; event: string; pillar: string; outcome: Milestone['outcome'] }[] = [];
  for (const p of PILLARS) {
    for (const m of p.milestones) {
      all.push({
        period: m.period,
        event: m.event,
        pillar: model.language === 'hi' ? p.titleHi : p.titleEn,
        outcome: m.outcome,
      });
    }
  }
  const bands = Array.from(new Set(all.map((x) => x.period)));

  return (
    <PageShell
      title={t('Milestone Tracker', 'मील के पत्थर ट्रैकर')}
      chapter="14"
      subject={model.clientName}
      page={14}
      totalPages={24}
    >
      <SectionHeading
        title={t('Decade Timeline', 'दशक कालक्रम')}
        subtitle={t('How each pillar interacts over time', 'प्रत्येक स्तंभ समय के साथ कैसे अंतःक्रिया करता है')}
      />
      <div className="rpt-timeline">
        {bands.map((band) => (
          <div key={band} className="rpt-timeline-band">
            <div className="rpt-timeline-period">{band}</div>
            <table className="rpt-table rpt-milestone-table">
              <tbody>
                {all.filter((x) => x.period === band).map((x, i) => (
                  <tr key={i}>
                    <td>{x.pillar}</td>
                    <td>{x.event}</td>
                    <td>
                      {x.outcome && (
                        <span className={`rpt-outcome outcome-${x.outcome}`}>{x.outcome}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export { PILLARS };