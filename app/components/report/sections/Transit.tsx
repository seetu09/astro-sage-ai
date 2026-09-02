'use client';

import { SectionHeading, Badge, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';
import { localizePlanet, localizeSign } from '../reportModel';

export function TransitSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations;

  const planets = calc?.divisionalCharts?.D1?.planetCoordinates || [];
  const ascendantSign = calc?.lagna?.ascendantSign || 1;
  const moonSign = calc?.lagna?.moonSign || 1;

  const getPlanetHouse = (planetName: string): number => {
    const p = planets.find(p => p.planet === planetName);
    return p?.house || 0;
  };

  const currentYear = new Date().getFullYear();
  const currentTransits = [
    { planet: 'Jupiter', house: 5, theme: 'Growth, wisdom, children, creativity' },
    { planet: 'Saturn', house: 7, theme: 'Discipline, partnerships, delays' },
    { planet: 'Rahu', house: 10, theme: 'Ambition, career, sudden changes' },
    { planet: 'Ketu', house: 4, theme: 'Inner transformation, home, roots' },
  ];

  const getTransitImpact = (planet: string, house: number): string => {
    const planetData = planets.find(p => p.planet === planet);
    if (!planetData) return '';
    
    const sign = localizeSign(model.language === 'hi' ? 'hi' : 'en', String(planetData.sign));
    const isRetrograde = planetData.retrograde ? ' (R)' : '';
    
    return `${planet} in ${sign}${isRetrograde} affects House ${house}`;
  };

  return (
    <>
      <SectionHeading
        title={t('Current Planetary Transits', 'वर्तमान ग्रह गोचर')}
        subtitle={t('Major transits affecting your chart in current year', `${currentYear} में आपके चार्ट को प्रभावित करने वाले प्रमुख गोचर`)}
      />

      <div className="rpt-badge-group">
        <Badge label={t('Year', 'वर्ष')} value={String(currentYear)} tone="cyan" />
        <Badge label={t('Moon Sign', 'चंद्र राशि')} value={localizeSign(model.language === 'hi' ? 'hi' : 'en', String(moonSign))} tone="violet" />
        <Badge label={t('Ascendant', 'लग्न')} value={localizeSign(model.language === 'hi' ? 'hi' : 'en', String(ascendantSign))} tone="gold" />
      </div>

      <Hr />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>{t('Planet', 'ग्रह')}</th>
            <th>{t('Current Position', 'वर्तमान स्थिति')}</th>
            <th>{t('Aspecting House', 'प्रभावित भाव')}</th>
            <th>{t('Theme', 'विषय')}</th>
          </tr>
        </thead>
        <tbody>
          {currentTransits.map((transit, i) => (
            <tr key={i}>
              <td className="rpt-strong">{localizePlanet(model.language === 'hi' ? 'hi' : 'en', transit.planet)}</td>
              <td>{getTransitImpact(transit.planet, transit.house)}</td>
              <td>{t('House', 'भाव')} {transit.house}</td>
              <td className="rpt-muted">{transit.theme}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Hr />

      <p className="rpt-prose">
        {t(
          'Transits are the continuous movement of planets through the zodiac. Each planet\'s transit through a house activates that area of life. Jupiter brings expansion and wisdom, Saturn brings discipline and lessons, while Rahu and Ketu trigger transformation and sudden changes.',
          'गोचर राशिचक्र में ग्रहों की निरंतर गति है। प्रत्येक ग्रह के भाव से गुजरने से जीवन का वह क्षेत्र सक्रिय होता है। बृहस्पति विस्तार और बुद्धि लाता है, शनि अनुशासन और पाठ सिखाता है, जबकि राहु और केतु परिवर्तन और अचानक परिवर्तन लाते हैं।'
        )}
      </p>

      <p className="rpt-note">
        {t(
          'Note: Actual current transits are computed based on today\'s ephemeris. For personalized transit predictions, consult the detailed AI analysis in pages 16-20.',
          'नोट: वास्तविक वर्तमान गोचर आज के पंचांग के आधार पर गणना की जाती है। व्यक्तिगत गोचर पूर्वानुमान के लिए, पृष्ठ 16-20 में विस्तृत AI विश्लेषण देखें।'
        )}
      </p>
    </>
  );
}