'use client';

import { SectionHeading, NarrativeCard, MilestoneTable, Badge } from '../primitives';
import type { ReportModel } from '../reportModel';

const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

/** Map a bases object key to a localized label. */
function baseLabel(t: (a: string, b: string) => string, key: string): string {
  if (key === 'lagna') return t('Ascendant Chart', 'लग्न चार्ट');
  if (key === 'moon') return t('Moon Chart', 'चंद्र चार्ट');
  if (key === 'venus') return t('Venus Chart', 'शुक्र चार्ट');
  return key;
}

function houseLabel(num: number): string {
  return SIGN_NAMES[num - 1] ?? String(num);
}

/**
 * MANGAL DOSHA — bare section (Mars affliction).
 * Surfaces the deterministic Mangal Dosha check (presence, severity, bases,
 * cancellations) and the recommended remedies.
 */
export function MangalDoshaSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const md = model.calculations?.doshas?.mangal;

  const present = md?.isPresent ?? false;
  const severity = md?.severity ?? 'moderate';
  const neutralized = md?.isNeutralized ?? false;
  const bases = md?.bases ?? null;
  const cancellations = md?.cancellations ?? [];
  const remedies = md?.remedies ?? [];

    const severityLabel: string =
    severity === 'none' ? t('None', 'कोई नहीं') :
    severity === 'mild' ? t('Mild', 'हल्का') :
    severity === 'moderate' ? t('Moderate', 'मध्यम') :
    t('Severe', 'गंभीर');

  return (
    <>
      <SectionHeading
        title={present ? t('Mars Dosha Identified', 'मंगल दोष पाया गया') : t('No Mangal Dosha', 'कोई मंगल दोष नहीं')}
        subtitle={t(`Severity: ${severityLabel}`, `गंभीरता: ${severityLabel}`)}
      />

      <div className="rpt-badge-group">
        <Badge label={t('Present', 'वर्तमान')} value={present ? 'Yes' : 'No'} tone={present ? 'rose' : 'emerald'} />
        <Badge label={t('Severity', 'गंभीरता')} value={severityLabel} tone={present ? 'rose' : 'amber'} />
        <Badge label={t('Neutralized', 'तटस्थ')} value={neutralized ? 'Yes' : 'No'} tone={neutralized ? 'emerald' : 'rose'} />
      </div>

      {present && bases && (
        <SectionHeading
          title={t('Dosha Bases', 'दोष आधार')}
          subtitle={t('Charts where Mars Dosha is found', 'मंगल दोष कौन से चार्ट में पाया गया')}
          accent="cyan"
        />
      )}
      {present && bases && (
        <table className="rpt-table">
          <thead>
            <tr>
              <th>{t('Chart', 'चार्ट')}</th>
              <th>{t('Mars House', 'मंगल भाव')}</th>
              <th>{t('Status', 'स्थिति')}</th>
            </tr>
          </thead>
          <tbody>
                        {Object.entries(bases).map(([k, v]) => (
              <tr key={k}>
                <td className="rpt-strong">{baseLabel(t, k)}</td>
                <td>{v.marsHouse} — {houseLabel(v.marsHouse)}</td>
                <td className="rpt-muted">
                  {v.inManglikHouse ? t('Afflicting', 'आक्रामक') : t('No affliction', 'कोई दोष नहीं')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {cancellations.length > 0 && (
        <>
          <SectionHeading
            title={t('Cancellation Factors', 'दोषमुक्ति कारक')}
            accent="emerald"
          />
          <ul className="rpt-list">
            {cancellations.map((c, i) => (
              <li key={i} className="rpt-list-item">{c}</li>
            ))}
          </ul>
        </>
      )}

      <NarrativeCard label={t('Explanation', 'व्याख्या')} tone="rose">
        <p className="rpt-prose">
          {md?.description ||
            t(
              'Mars (Mangal) in a kendra or trikon from the ascendant produces the Mars-dosha. Remedies centre on pacifying Mars and strengthening the mind-lord (Moon/Venus).',
              'लग्न से केन्द्र या त्रिकोण में स्थित मंगल मंगल दोष उत्पन्न करता है। उपाय मंगल को शांत करकर और मन-स्वामी (चंद्र/शुक्र) को बल देकर हैं।'
            )}
        </p>
      </NarrativeCard>

      {remedies.length > 0 && (
        <SectionHeading
          title={t('Recommended Remedies', 'अनुशंसित उपाय')}
          subtitle={t('Traditional Mars pacification measures', 'पारंपरिक मंगल शांति उपाय')}
          accent="gold"
        />
      )}
      {remedies.length > 0 && (
        <MilestoneTable
          milestones={remedies.map((r, i) => ({
            period: t('Remedy', 'उपाय') + ` ${i + 1}`,
            event: r,
            outcome: 'positive' as const,
          }))}
        />
      )}
    </>
  );
}