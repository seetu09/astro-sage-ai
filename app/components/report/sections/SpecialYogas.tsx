'use client';

import { SectionHeading, MilestoneTable, Milestone } from '../primitives';
import type { ReportModel } from '../reportModel';

/**
 * SPECIAL YOGAS — bare section.
 * Surfaces the major combination yogae detected in the calculation layer and
 * any domain insights flagged as yogas on the ReportData.
 */
export function SpecialYogasSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const report = model.calculations?.yogas;
  const reportedYogas = model.yogas;

  // Collect present yogas from the deterministic YogaReport.
  const yogas: { name: string; description: string; strength?: string }[] = [];
  const seen = new Set<string>();

  const add = (name: string, desc: string, strength?: string) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    yogas.push({ name, description: desc || '', strength });
  };

  if (report) {
    if (report.gajakesari?.isPresent) {
      add(report.gajakesari.name, report.gajakesari.description, report.gajakesari.strength);
    }
    if (report.budhaditya?.isPresent) {
      add(report.budhaditya.name, report.budhaditya.description, report.budhaditya.strength);
    }
    for (const d of report.dhanaYogas || []) {
      if (d.isPresent) add(d.name, d.description);
    }
  }
  for (const y of reportedYogas || []) {
    add(y.name, y.description || '');
  }

  const merged = yogas;

  const fallback: Milestone[] = [
    { period: 'Natal', event: t('No major yogas were flagged.', 'कोई प्रमुख योग नहीं पाया गया।'), note: t('The natal chart still carries inherent strengths from the luminaries.', 'जन्म कुंडली में प्रकाशमान ग्रहों से संबंधित संकेत हैं।') },
  ];

  return (
    <>
      <SectionHeading
        title={t('Yoga Combinations', 'योग संयुक्त') + ` (${merged.length})`}
        subtitle={t('Major planetary combinations active at birth', 'जन्म समय सक्रिय प्रमुख ग्रह-संयोजन')}
      />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>{t('Yoga', 'योग')}</th>
            <th>{t('Description', 'विवरण')}</th>
            <th>{t('Outcome', 'फल')}</th>
          </tr>
        </thead>
        <tbody>
          {merged.length === 0 ? (
            <tr>
              <td colSpan={3} className="rpt-empty">
                {t('No major yoga combinations were detected.', 'कोई प्रमुख योग संयुक्त नहीं पाया गया।')}
              </td>
            </tr>
          ) : (
            merged.map((y, i) => (
              <tr key={i}>
                <td className="rpt-strong">{y.name}</td>
                <td className="rpt-prose">{y.description || '—'}</td>
                <td className="rpt-muted">{y.strength || t('Auspicious', 'शुभ')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <SectionHeading
        title={t('Timing & Activation', 'समय एवं सक्रियण')}
        subtitle={t('When the major yogas bear fruit', 'जब प्रमुख योग फल देते हैं')}
        accent="violet"
      />
      <MilestoneTable
        milestones={
          merged.length
            ? merged.map((y) => ({
                period: t('Variable', 'चर'),
                event: y.name,
                note: y.description,
              }))
            : fallback
        }
      />
    </>
  );
}