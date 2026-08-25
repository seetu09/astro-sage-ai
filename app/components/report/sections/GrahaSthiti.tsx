'use client';

import PageShell from '../PageShell';
import { SectionHeading } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet, localizeSign, signLordName } from '../reportModel';

/**
 * PAGE 3 — Graha Sthiti (Planetary Positions).
 * A full table of the nine planets with sign, sign-lord, degree, house and
 * retrograde state. Data comes from `model.planetaryPositions` and is
 * enhanced with the deterministic chart when available.
 */
export function GrahaSthitiPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const positions = model.planetaryPositions;

  return (
    <PageShell
      title={t('Graha Sthiti', 'ग्रह स्थिति')}
      chapter="03"
      subject={model.clientName}
      page={3}
      totalPages={24}
    >
      <SectionHeading
        title={t('Planetary Positions', 'ग्रहों की स्थिति')}
        subtitle={t('Sign, sign-lord, degree, house & motion', 'राशि, राशि स्वामी, अंश, भाव एवं गति')}
      />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>{t('Planet', 'ग्रह')}</th>
            <th>{t('Sign', 'राशि')}</th>
            <th>{t('Lord', 'स्वामी')}</th>
            <th>{t('Degree', 'अंश')}</th>
            <th>{t('House', 'भाव')}</th>
            <th>{t('State', 'अवस्था')}</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td colSpan={6} className="rpt-empty">
                {t('No planetary data available.', 'ग्रह स्थिति उपलब्ध नहीं है।')}
              </td>
            </tr>
          ) : (
            positions.map((p, i) => {
              const signIdx = signIndexOf(p.sign);
              return (
                <tr key={i}>
                  <td className="rpt-strong">{localizePlanet(model.language, p.body)}</td>
                  <td>{localizeSign(model.language, p.sign)}</td>
                  <td>{signLordName(model.language, signIdx)}</td>
                  <td className="rpt-mono">{p.degree || '—'}</td>
                  <td>{p.house || '—'}</td>
                  <td>
                    {p.retro ? (
                      <span className="rpt-tag rpt-tag-amber">{t('Retro', 'वक्री')}</span>
                    ) : (
                      <span className="rpt-tag rpt-tag-emerald">{t('Direct', 'सीधा')}</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <p className="rpt-note">
        {t(
          'Houses are counted whole-sign from the ascendant in the North-Indian convention.',
          'भाव की गणना लग्न से सम्पूर्ण-राशि पद्धति (उत्तर भारतीय) से की गई है।'
        )}
      </p>
    </PageShell>
  );
}

function signIndexOf(sign: string): number {
  const names = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const idx = names.indexOf(sign);
  return idx < 0 ? 1 : idx + 1;
}