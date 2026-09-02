'use client';

import { SectionHeading, Badge, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet } from '../reportModel';
import type { MahadashaNode, CurrentDashaInfo } from '@/types/kundali';

function yearOf(iso?: string): string {
  return iso ? new Date(iso).getFullYear().toString() : '—';
}

export function DashaDetailSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const vma = model.calculations?.vimshottari;
  const cur: CurrentDashaInfo | undefined = vma?.currentDasha;
  const mahadashas: MahadashaNode[] = vma?.mahadashas ?? [];

  if (!mahadashas.length) {
    return (
      <div className="rpt-empty">
        {t('Dasha data unavailable.', 'दशा डेटा उपलब्ध नहीं है।')}
      </div>
    );
  }

  return (
    <>
      <SectionHeading
        title={t('Complete Dasha Hierarchy', 'पूर्ण दशा पदानुक्रम')}
        subtitle={t('Mahadasha → Antardasha breakdown for all 9 periods', 'सभी 9 अवधियों के लिए महादशा → अंतरदशा विश्लेषण')}
      />

      {cur && (
        <div className="rpt-badge-group">
          <Badge label={t('Running', 'चल रही')} value={localizePlanet(model.language, cur.mahadasha)} tone="rose" />
          <Badge label={t('Antardasha', 'अंतरदशा')} value={localizePlanet(model.language, cur.antardasha)} tone="violet" />
          <Badge label={t('Window', 'खिड़की')} value={`${yearOf(cur.startDate)} – ${yearOf(cur.endDate)}`} tone="gold" />
        </div>
      )}

      <Hr />

      <div className="rpt-dasha-hierarchy">
        {mahadashas.map((maha, mi) => {
          const isCurrent = maha.lord === cur?.mahadasha;
          const antardashas = maha.antardashas ?? [];
          return (
            <div key={mi} className={isCurrent ? 'rpt-dasha-block-current' : 'rpt-dasha-block'}>
              <div className="rpt-dasha-header">
                <span className="rpt-dasha-num">{mi + 1}</span>
                <span className="rpt-dasha-lord">{localizePlanet(model.language, maha.lord)}</span>
                <span className="rpt-dasha-years">{t('Mahadasha', 'महादशा')} · {maha.years} {t('years', 'वर्ष')} · {yearOf(maha.startDate)} – {yearOf(maha.endDate)}</span>
              </div>
              {antardashas.length > 0 && (
                <table className="rpt-table rpt-table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('Antardasha', 'अंतरदशा')}</th>
                      <th>{t('Start', 'प्रारंभ')}</th>
                      <th>{t('End', 'समाप्ति')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {antardashas.map((ad, ai) => {
                      const isCur = ad.planet === cur?.antardasha && isCurrent;
                      return (
                        <tr key={ai} className={isCur ? 'rpt-row-current' : ''}>
                          <td>{ai + 1}</td>
                          <td className={isCur ? 'rpt-strong' : ''}>{localizePlanet(model.language, ad.planet)}</td>
                          <td>{yearOf(ad.startDate)}</td>
                          <td>{yearOf(ad.endDate)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>

      <p className="rpt-note">
        {t(
          'Each Mahadasha hosts 9 Antardashas in the same Vimshottari order, sized proportionally (Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 years). The running Antardasha colours the current experience within the running Mahadasha.',
          'प्रत्येक महादशा में समानुपातिक आकार में 9 अंतरदशाएँ होती हैं। चल रही अंतरदशा चल रही महादशा के भीतर वर्तमान अनुभव को रंगती है।'
        )}
      </p>
    </>
  );
}