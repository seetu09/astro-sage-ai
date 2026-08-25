'use client';

import PageShell from '../PageShell';
import { SectionHeading, StatTile, NarrativeCard, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizeSign, localizePlanet, signLordName } from '../reportModel';

/**
 * PAGE 5 — Lagna & Moon Sign Deep Dive.
 * Detailed treatment of the Ascendant (Lagna) and Rashi (Moon sign),
 * including lords, elemental nature and thematic influence.
 */
export function LagnaMoonPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations?.lagna;

  const ascName = calc ? localizeSign(model.language, signFromIndex(calc.ascendantSign)) : '—';
  const moonName = calc ? localizeSign(model.language, signFromIndex(calc.moonSign)) : '—';
  const ascLord = calc ? signLordName(model.language, calc.ascendantSign) : '—';
  const moonLord = calc ? signLordName(model.language, calc.moonSign) : '—';

  return (
    <PageShell
      title={t('Lagna & Moon Deep Dive', 'लग्न एवं चंद्र विश्लेषण')}
      chapter="05"
      subject={model.clientName}
      page={5}
      totalPages={24}
    >
      <SectionHeading title={t('Ascendant (Lagna)', 'लग्न')} subtitle={t(`${ascName} • ruled by ${ascLord}`, `${ascName} • स्वामी ${ascLord}`)} />

      <div className="rpt-stat-grid">
        <StatTile label={t('Ascendant', 'लग्न')} value={ascName} />
        <StatTile label={t('Lord', 'स्वामी')} value={ascLord} />
        {calc && <StatTile label={t('Asc. Degree', 'लग्न अंश')} value={calc.ascendantDegree ? `${calc.ascendantDegree.toFixed(1)}°` : '—'} />}
      </div>

      <NarrativeCard label={t('Lagna Narrative', 'लग्न विवरण')} tone="gold">
        <p className="rpt-prose">
          {t(
            `The {sign} ascendant places the lord {lord} in direct command of the personality frame. This shapes physical vitality, life direction and how the world first perceives you.`,
            `{sign} लग्न स्वामी {lord} को चार्ट का प्रमुख नियंत्रक बनाता है, जो शारीरिक जीवन-शक्ति, दिशा एवं प्रथम-छाप को निर्धारित करता है।`
          ).replace('{sign}', ascName).replace('{lord}', ascLord)}
        </p>
      </NarrativeCard>

      <Hr />

      <SectionHeading title={t('Moon Sign (Rashi)', 'चंद्र राशि')} subtitle={t('The emotional and mental disposition', 'भावनात्मक एवं मानसिक स्वभाव')} accent="cyan" />

      <NarrativeCard label={t('Rashi Narrative', 'राशि विवरण')} tone="cyan">
        <p className="rpt-prose">
          {t(
            `With your Moon in {moon}, ruled by {moonLord}, emotions are attuned to the {moon} temperament — shaping daily moods, adaptability and inner security.`,
            `चंद्र {moon} राशि में होने तथा स्वामी {lord} के कारण भावनाएँ {moon} स्वभाव की ओर झुकती हैं — दैनिक मनोदशा, अनुकूलनशीलता एवं आंतरिक सुरक्षा को राहत देती हैं।`
          ).replace(/\{moon\}/g, moonName).replace(/\{lord\}/g, moonLord)}
        </p>
      </NarrativeCard>

      <div className="rpt-badge-group" style={{ marginTop: 12 }}>
        <StatTile label={t('Moon Lord', 'चंद्र स्वामी')} value={moonLord} />
        <StatTile label={t('Element', 'तत्त्व')} value={elementOf(calc?.moonSign)} />
      </div>
    </PageShell>
  );
}

const SIGN_NAMES: string[] = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
function signFromIndex(i?: number): string {
  return SIGN_NAMES[Math.max(0, Math.min(11, (i ?? 1) - 1))];
}
function elementOf(sign?: number): string {
  const e = ['Fire', 'Earth', 'Air', 'Water'];
  return sign ? e[Math.max(0, Math.min(3, (sign - 1) % 4))] : '—';
}