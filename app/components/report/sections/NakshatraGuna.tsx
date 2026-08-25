'use client';

import PageShell from '../PageShell';
import { SectionHeading, StatTile } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizeNakshatra, localizePlanet, nakshatraLordName } from '../reportModel';

/** Guna (quality) descriptors used in the compatibility breakdown. */
export interface GunaRow {
  name: string;
  /** Points scored out of the max for this guna. */
  points: number;
}

/**
 * PAGE 6 — Nakshatra & Guna Breakdown.
 * Details the birth Nakshatra and its lord, then the five-fold Guna
 * (Varna, Vashya, Tara, Yoni, Varna now consolidated into a compact table)
 * used in traditional compatibility (Ashtakoota) analysis.
 */
export function NakshatraGunaPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations?.lagna;
  const nakIndex = calc?.moonNakshatraIndex ?? 1;
  const nakName = calc?.moonNakshatra
    ? localizeNakshatra(model.language, calc.moonNakshatra)
    : '—';
  const nakLord = nakshatraLordName(model.language, nakIndex);

  const gunas: GunaRow[] = [
    { name: t('Varna (Caste)', 'वर्ण'), points: 1 },
    { name: t('Vashya (Attraction)', 'वश्य'), points: 2 },
    { name: t('Tara (Star)', 'तारा'), points: 3 },
    { name: t('Yoni (Species)', 'योनि'), points: 4 },
    { name: t('Gana (Nature)', 'गण'), points: 6 },
  ];

  return (
    <PageShell
      title={t('Nakshatra & Guna', 'नक्षत्र एवं गुण')}
      chapter="06"
      subject={model.clientName}
      page={6}
      totalPages={24}
    >
      <SectionHeading
        title={t('Birth Nakshatra', 'जन्म नक्षत्र')}
        subtitle={t('Lunar mansion and its ruling deity', 'नक्षत्र एवं उसके अधिष्ठाता देवता')}
      />

      <div className="rpt-stat-grid">
        <StatTile label={t('Nakshatra', 'नक्षत्र')} value={nakName} />
        <StatTile label={t('Lord', 'स्वामी')} value={nakLord} />
        <StatTile label={t('Pada Range', 'चरण')} value={String(((nakIndex - 1) % 4) + 1)} />
      </div>

      <SectionHeading
        title={t('Guna (Quality) Breakdown', 'गुण विश्लेषण')}
        subtitle={t('Classic Ashtagari scoring ingredients', 'अष्टगति स्कोरिंग के अंग')}
        accent="violet"
      />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>{t('Guna', 'गुण')}</th>
            <th>{t('Max Points', 'अधिकतम अंक')}</th>
            <th>{t('Note', 'टिप्पणी')}</th>
          </tr>
        </thead>
        <tbody>
          {gunas.map((g, i) => (
            <tr key={i}>
              <td className="rpt-strong">{g.name}</td>
              <td>{g.points}</td>
              <td className="rpt-muted">
                {i === 0 ? t('Brahmin wisdom, Kshatriya power, etc.', 'ब्राह्मण ज्ञान, क्षत्रिय शक्ति, आदि') :
                 i === 1 ? t('Mutual attraction nature', 'पारस्परिक आकर्षण स्वभाव') :
                 i === 2 ? t('Destiny stars relation', 'भाग्य तारों का संबंध') :
                 i === 3 ? t('Animal association', 'पशु संगति') :
                 t('Elemental nature', 'तत्त्व स्वभाव')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="rpt-note">
        {t(
          'Guna points are allocated per traditional matching tables; a total score guides compatibility in Vedic matching.',
          'गुण अंक पारंपरिक मिलान सारणी से दिए जाते हैं; कुल अंक वैदिक मिलान की दिशा बताते हैं।'
        )}
      </p>
    </PageShell>
  );
}