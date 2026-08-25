'use client';

import { SectionHeading, Badge, MilestoneTable, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet } from '../reportModel';
import type { MahadashaNode, CurrentDashaInfo } from '@/types/kundali';

/** Extract a year string from an ISO date ("2024-01-01" → "2024"). */
function yearOf(iso?: string): string {
  return iso ? new Date(iso).getFullYear().toString() : '—';
}

/**
 * DASHA OVERVIEW — bare section.
 * The 9 Vimshottari Mahadashas with their lord, start/end years and the
 * currently-running dasha highlighted.
 */
export function DashaOverviewSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const vma = model.calculations?.vimshottari;
  const cur: CurrentDashaInfo | undefined = vma?.currentDasha;
  const mahadashas: MahadashaNode[] = vma?.mahadashas ?? [];

  return (
    <>
      <SectionHeading
        title={t('The 120-Year Cycle', '120 वर्ष का चक्र')}
        subtitle={t('Mahadasha sequence from birth', 'जन्म से दशा क्रम')}
      />

      {cur && (
        <div className="rpt-badge-group">
          <Badge label={t('Running', 'चल रही')} value={localizePlanet(model.language, cur.mahadasha)} tone="rose" />
          <Badge label={t('Antardasha', 'अंतरदशा')} value={localizePlanet(model.language, cur.antardasha)} tone="violet" />
          <Badge label={t('Window', 'खिड़की')} value={`${yearOf(cur.startDate)} – ${yearOf(cur.endDate)}`} tone="gold" />
        </div>
      )}

      <Hr />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('Mahadasha', 'महादशा')}</th>
            <th>{t('Lord', 'स्वामी')}</th>
            <th>{t('Start', 'प्रारंभ')}</th>
            <th>{t('End', 'समाप्ति')}</th>
            <th>{t('Years', 'वर्ष')}</th>
          </tr>
        </thead>
        <tbody>
          {mahadashas.length === 0 ? (
            <tr>
              <td colSpan={6} className="rpt-empty">
                {t('Dasha data unavailable.', 'दशा डेटा उपलब्ध नहीं है।')}
              </td>
            </tr>
          ) : (
            mahadashas.map((m, i) => {
              const isCurrent = m.lord === cur?.mahadasha;
              return (
                <tr key={i} className={isCurrent ? 'rpt-row-current' : ''}>
                  <td>{i + 1}</td>
                  <td className="rpt-strong">{localizePlanet(model.language, m.lord)}</td>
                  <td>{localizePlanet(model.language, m.lord)}</td>
                  <td>{yearOf(m.startDate)}</td>
                  <td>{yearOf(m.endDate)}</td>
                  <td>{m.years}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <p className="rpt-note">
        {t(
          `The cycle begins at birth with the Mahadasha of ${vma?.birthMahadasha ? localizePlanet(model.language, vma.birthMahadasha) : '—'}, determined by the birth Nakshatra.`,
          `चक्र जन्म नक्षत्र द्वारा निर्धारित ${vma?.birthMahadasha ? localizePlanet(model.language, vma.birthMahadasha) : '—'} महादशा से शुरू होता है।`
        )}
            </p>
    </>
  );
}

/**
 * CURRENT MAHADASHA — bare section.
 * Expands the running Mahadasha into its 9 Antardashas with their date ranges.
 */
export function MahadashaDetailSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const vma = model.calculations?.vimshottari;
  const cur = vma?.currentDasha;
  const curMaha = vma?.mahadashas.find((m) => m.lord === cur?.mahadasha);
  const antardashas = curMaha?.antardashas ?? [];

  const lordName = cur ? localizePlanet(model.language, cur.mahadasha) : '—';

  return (
    <>
      <SectionHeading
        title={t(`${lordName} Mahadasha`, `${lordName} महादशा`)}
        subtitle={t('The major period now operating', 'जो महादशा अभी सक्रिय है')}
      />

      <Badge
        label={t('Period', 'अवधि')}
        value={`${yearOf(cur?.startDate)} – ${yearOf(cur?.endDate)}`}
        tone="violet"
      />

      <Hr />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('Antardasha', 'अंतरदशा')}</th>
            <th>{t('Start', 'प्रारंभ')}</th>
            <th>{t('End', 'समाप्ति')}</th>
            <th>{t('Lord', 'स्वामी')}</th>
          </tr>
        </thead>
        <tbody>
          {antardashas.length === 0 ? (
            <tr>
              <td colSpan={5} className="rpt-empty">
                {t('Antardasha detail unavailable.', 'अंतरदशा विवरण उपलब्ध नहीं है।')}
              </td>
            </tr>
          ) : (
            antardashas.map((a, i) => {
              const isCur = a.planet === cur?.antardasha;
              return (
                <tr key={i} className={isCur ? 'rpt-row-current' : ''}>
                  <td>{i + 1}</td>
                  <td className={isCur ? 'rpt-strong' : ''}>{localizePlanet(model.language, a.planet)}</td>
                  <td>{yearOf(a.startDate)}</td>
                  <td>{yearOf(a.endDate)}</td>
                  <td className="rpt-muted">{localizePlanet(model.language, a.planet)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
}

/**
 * DASHA FORECAST — bare section.
 * Narrative milestones mapped onto the Mahadasha windows for the coming years.
 */
export function DashaForecastSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const vma = model.calculations?.vimshottari;
  const mahadashas: MahadashaNode[] = vma?.mahadashas ?? [];

  const milestones = mahadashas.map((m) => ({
    period: `${yearOf(m.startDate)} – ${yearOf(m.endDate)}`,
    event: `${localizePlanet(model.language, m.lord)} ${t('Mahadasha', 'महादशा')}`,
    note: t('Major life theme governs this span.', 'इस अवधि पर प्रमुख जीवन-थीम शासित होगी।'),
    outcome: 'neutral' as const,
  }));

  return (
    <>
      <SectionHeading
        title={t('Decade-by-Decade Outlook', 'दशक-दर-दशक दृष्टि')}
        subtitle={t('Mahadasha windows and their life themes', 'महादशा खिड़कियाँ एवं उनके जीवन-स्वरूप')}
      />

      <MilestoneTable milestones={milestones} />

      <Hr />
      <p className="rpt-prose">
        {t(
          'Each Mahadasha is a 6–20 year chapter governed by its lord. The running period sets the dominant life theme; Antardashas (sub-periods) colour the experience within it.',
          'प्रत्येक महादशा एक ६–२० वर्ष का अध्याय है जो उसके स्वामी द्वारा शासित है। चल रही अवधि प्रभावशाली जीवन-थीम तय करती है; अंतरदशा उसके भीतर अनुभव को रंगती है।'
        )}
      </p>
    </>
  );
}