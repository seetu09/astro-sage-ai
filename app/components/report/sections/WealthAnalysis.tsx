'use client';

import { SectionHeading, Badge, MilestoneTable, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet } from '../reportModel';
import type { MahadashaNode } from '@/types/kundali';

function yearOf(iso?: string): string {
  return iso ? new Date(iso).getFullYear().toString() : '—';
}

export function WealthAnalysisSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations;
  const vma = calc?.vimshottari;
  const mahadashas: MahadashaNode[] = vma?.mahadashas ?? [];

  const milestones = mahadashas
    .filter((m) => {
      const endYear = parseInt(yearOf(m.endDate), 10);
      return !isNaN(endYear) && endYear >= 2026;
    })
    .slice(0, 5)
    .map((m) => ({
      period: `${yearOf(m.startDate)} – ${yearOf(m.endDate)}`,
      event: `${localizePlanet(model.language, m.lord)} ${t('Mahadasha', 'महादशा')}`,
      note: t('Wealth accumulation and financial growth period.', 'धन संचय और वित्तीय विकास अवधि।'),
      outcome: 'positive' as const,
    }));

  return (
    <>
      <SectionHeading
        title={t('Wealth Analysis', 'धन विश्लेषण')}
        subtitle={t('Financial growth patterns and wealth-building strategies', 'वित्तीय वृद्धि पैटर्न और धन-निर्माण रणनीतियाँ')}
      />

      <div className="rpt-badge-group">
        <Badge label={t('Current Dasha', 'चल रही दशा')} value={vma?.currentDasha ? localizePlanet(model.language, vma.currentDasha.mahadasha) : '—'} tone="gold" />
        <Badge label={t('Wealth Houses', 'धन भाव')} value="2, 11" tone="emerald" />
      </div>

      <Hr />

      <p className="rpt-prose">
        {t(
          'Your wealth potential is determined by the strength of the 2nd house (savings, accumulated wealth) and 11th house (income, gains, investments). The dasha periods activate these areas, bringing opportunities for financial growth.',
          'आपकी धन क्षमता दूसरे भाव (बचत, संचित धन) और 11वें भाव (आय, लाभ, निवेश) की शक्ति से निर्धारित होती है। दशा अवधियां इन क्षेत्रों को सक्रिय करती हैं।'
        )}
      </p>

      {milestones.length > 0 && (
        <>
          <Hr />
          <MilestoneTable milestones={milestones} />
        </>
      )}

      <Hr />

      <div className="rpt-section-grid">
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('Investment Strategy', 'निवेश रणनीति')}</h3>
          <p className="rpt-prose">
            {t(
              'Focus on diversified investments during favorable dasha periods. Real estate and fixed deposits offer stability while equities can accelerate growth during Jupiter dasas.',
              'अनुकूल दशा अवधियों के दौरान विविधीकृत निवेश पर ध्यान दें। रियल एस्टेट और सावधि जमा स्थिरता प्रदान करते हैं जबकि इक्विटी बृहस्पति दशा के दौरान विकास को गति दे सकती है।'
            )}
          </p>
        </div>
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('Savings Pattern', 'बचत पैटर्न')}</h3>
          <p className="rpt-prose">
            {t(
              'Your natural savings temperament is reflected by the 2nd house lord placement. Build an emergency fund equivalent to 6 months of expenses regardless of market conditions.',
              'आपका स्वाभाविक बचत स्वभाव दूसरे भाव के स्वामी की स्थिति से प्रतिबिंबित होता है। बाजार की स्थिति से निपटने के बावजूद 6 महीने के खर्चों के बराबर आपातकालीन निधि बनाएं।'
            )}
          </p>
        </div>
      </div>
    </>
  );
}