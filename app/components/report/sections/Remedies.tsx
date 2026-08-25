'use client';

import { SectionHeading, NarrativeCard, MilestoneTable } from '../primitives';
import type { ReportModel } from '../reportModel';

/**
 * REMEDIES (UPAY) — bare section.
 * Consolidates the recommended remedies (gemstone, mantra, ritual, charity)
 * from the model and maps the calculation-layer's remedy list onto the
 * milestone table so each remedy has an action + timing note.
 */
export function RemediesSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const remedies = model.remedies || [];

  // Category grouping (the ReportData RemediesItem carries a `category`).
  const byCat: Record<string, typeof remedies> = {};
  for (const r of remedies) {
    const cat = r.category || t('General', 'सामान्य');
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(r);
  }

  return (
    <>
      <SectionHeading
        title={t('Vedic Remedial Measures', 'वैदिक उपाय')}
        subtitle={t('Mantra, ritual, gemstone and charitable actions', 'मंत्र, अनुष्ठान, रत्न और दान की क्रियाएँ')}
        accent="gold"
      />

      {remedies.length === 0 ? (
        <p className="rpt-empty">{t('No specific remedies were recorded.', 'कोई विशेष उपाय दर्ज नहीं गए।')}</p>
      ) : (
        <div className="rpt-panel">
          {Object.entries(byCat).map(([cat, items]) => (
            <div key={cat} className="rpt-cat">
              <div className="rpt-cat-title">{cat}</div>
              <ul className="rpt-list">
                {items.map((r, i) => (
                  <li key={i} className="rpt-list-item">{r.description || r.category}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <NarrativeCard label={t('Mantra', 'मंत्र')} tone="violet">
        <p className="rpt-prose">
          {t(
            'Reciting the prescribed mantras during the prescribed time (muhurta) on the stated days amplifies the remedial effect and stabilises the mind.',
            'निर्धारित समय एवं दिनों पर निर्धारित मंत्रों का जप उपाय प्रभाव को बढ़ाता है और मन को स्थिर करता है।'
          )}
        </p>
      </NarrativeCard>

      <SectionHeading
        title={t('Remedy Schedule', 'उपाय कार्यसूची')}
        subtitle={t('Actionable timing for each measure', 'प्रत्येक उपाय का कार्यान्वयन समय')}
        accent="cyan"
      />
      <MilestoneTable
        milestones={remedies.map((r, i) => ({
          period: t('Day', 'दिन') + ` ${i + 1}`,
          event: (r.description || r.category || t('Remedy', 'उपाय')) as string,
          note: t('Perform during the benefic window.', 'शुभ समय पर करें।'),
          outcome: 'positive' as const,
        }))}
      />
    </>
  );
}