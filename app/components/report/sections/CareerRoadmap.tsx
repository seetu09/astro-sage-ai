'use client';

import { SectionHeading, Badge, MilestoneTable, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet } from '../reportModel';
import type { MahadashaNode } from '@/types/kundali';

function yearOf(iso?: string): string {
  return iso ? new Date(iso).getFullYear().toString() : '—';
}

export function CareerRoadmapSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations;
  const vma = calc?.vimshottari;
  const mahadashas: MahadashaNode[] = vma?.mahadashas ?? [];

  const milestones = mahadashas
    .filter((m) => {
      const endYear = parseInt(yearOf(m.endDate), 10);
      return !isNaN(endYear) && endYear >= 2026;
    })
    .slice(0, 6)
    .map((m) => ({
      period: `${yearOf(m.startDate)} – ${yearOf(m.endDate)}`,
      event: `${localizePlanet(model.language, m.lord)} ${t('Mahadasha', 'महादशा')}`,
      note: t('Career growth and professional opportunities unfold during this period.', 'इस अवधि में करियर विकास और पेशेवर अवसर उभरते हैं।'),
      outcome: 'positive' as const,
    }));

  return (
    <>
      <SectionHeading
        title={t('Career Roadmap', 'करियर मार्गदर्शन')}
        subtitle={t('3-year professional milestone windows', '3 वर्ष के पेशेवर मील के पत्थर खिड़कियाँ')}
      />

      <div className="rpt-badge-group">
        <Badge label={t('Current Dasha', 'चल रही दशा')} value={vma?.currentDasha ? localizePlanet(model.language, vma.currentDasha.mahadasha) : '—'} tone="rose" />
        <Badge label={t('Active Period', 'सक्रिय अवधि')} value={vma?.currentDasha ? `${yearOf(vma.currentDasha.startDate)} – ${yearOf(vma.currentDasha.endDate)}` : '—'} tone="gold" />
      </div>

      <Hr />

      <p className="rpt-prose">
        {t(
          'Your career trajectory is shaped by the Mahadasha and Antardasha periods. The current dasha lord governs your professional life theme. Each dasha brings unique opportunities, challenges, and growth patterns.',
          'आपका करियर पथ महादशा और अंतरदशा अवधियों से प्रभावित होता है। चल रही दशा स्वामी आपके पेशेवर जीवन का थीम निर्धारित करता है।'
        )}
      </p>

      {milestones.length > 0 ? (
        <>
          <Hr />
          <MilestoneTable milestones={milestones} />
        </>
      ) : (
        <p className="rpt-note">{t('Career milestones will appear based on your chart\'s dasha timeline.', 'करियर मील के पत्थर आपके चार्ट की दशा समयरेखा के आधार पर दिखाई देंगे।')}</p>
      )}

      <Hr />

      <div className="rpt-section-grid">
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('3-Year Outlook', '3 वर्ष की दृष्टि')}</h3>
          <p className="rpt-prose">
            {t(
              'Focus on building sustainable professional foundations during the current period. Leverage the lord of your 10th house and its transits for maximum career advancement.',
              'वर्तमान अवधि के दौरान टिकाऊ पेशेवर नींव बनाने पर ध्यान दें। अधिकतम करियर प्रगति के लिए अपने 10वें भाव के स्वामी और उसके गोचरों का लाभ उठाएं।'
            )}
          </p>
        </div>
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('Key Growth Years', 'मुख्य विकास वर्ष')}</h3>
          <p className="rpt-prose">
            {t(
              'Significant career changes and promotions are likely during favorable dasha-antardasha combinations. Plan major career moves when benefic planets aspect your 10th house.',
              'अनुकूल दशा-अंतरदशा संयोजन के दौरान महत्वपूर्ण करियर परिवर्तन और पदोन्नति संभव हैं। प्रमुख करियर कदम तब योजना बनाएं जब दायव ग्रह आपके 10वें भाव को स्पर्श करें।'
            )}
          </p>
        </div>
      </div>
    </>
  );
}