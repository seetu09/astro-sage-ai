'use client';

import { SectionHeading, Badge, Hr } from '../primitives';
import type { ReportModel } from '../reportModel';

export function HealthAnalysisSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations;

  const planets = calc?.divisionalCharts?.D1?.planetCoordinates || [];
  const sunHouse = planets.find(p => p.planet === 'Sun')?.house || 0;
  const moonHouse = planets.find(p => p.planet === 'Moon')?.house || 0;
  const saturnHouse = planets.find(p => p.planet === 'Saturn')?.house || 0;

  const healthIndicators = [
    { planet: 'Sun', house: sunHouse, theme: 'Vitality, constitution, father/senior figures' },
    { planet: 'Moon', house: moonHouse, theme: 'Emotional health, mind, mother/nurturing' },
    { planet: 'Saturn', house: saturnHouse, theme: 'Chronic issues, discipline, longevity' },
  ];

  return (
    <>
      <SectionHeading
        title={t('Health Analysis', 'स्वास्थ्य विश्लेषण')}
        subtitle={t('Vitality patterns and wellness guidance', 'जीवनी शक्ति पैटर्न और कल्याण मार्गदर्शन')}
      />

      <div className="rpt-badge-group">
        <Badge label={t('6th House', 'छठा भाव')} value={t('Health & Disease', 'स्वास्थ्य एवं रोग')} tone="rose" />
        <Badge label={t('8th House', 'आठवां भाव')} value={t('Longevity & Transformation', 'दीर्घायु एवं परिवर्तन')} tone="violet" />
      </div>

      <Hr />

      <p className="rpt-prose">
        {t(
          'Health in Vedic astrology is analyzed through the 6th house (disease, daily routines), 8th house (longevity, transformation), and the strength of the luminaries Sun and Moon. Planets placed in these houses indicate areas of health focus.',
          'वैदिक ज्योतिष में स्वास्थ्य का विश्लेषण छठे भाव (रोग, दिनचर्या), आठवें भाव (दीर्घायु, परिवर्तन), और प्रकाशित्रों सूर्य और चंद्र की शक्ति के माध्यम से किया जाता है।'
        )}
      </p>

      <Hr />

      <table className="rpt-table">
        <thead>
          <tr>
            <th>{t('Planet', 'ग्रह')}</th>
            <th>{t('House', 'भाव')}</th>
            <th>{t('Health Theme', 'स्वास्थ्य विषय')}</th>
          </tr>
        </thead>
        <tbody>
          {healthIndicators.map((ind, i) => (
            <tr key={i}>
              <td className="rpt-strong">{ind.planet}</td>
              <td>{t('House', 'भाव')} {ind.house}</td>
              <td className="rpt-muted">{ind.theme}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Hr />

      <div className="rpt-section-grid">
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('Wellness Focus', 'कल्याण ध्यान')}</h3>
          <p className="rpt-prose">
            {t(
              'Maintain regular sleep patterns and stress management routines. The Moon\'s placement suggests emotional well-being practices like meditation can significantly improve overall health.',
              'नियमित नींद पैटर्न और तनाव प्रबंधन दिनचर्या बनाए रखें। चंद्र की स्थिति सुझाव देती है कि ध्यान जैसी भावनात्मक कल्याण प्रथाएं समग्र स्वास्थ्य में महत्वपूर्ण सुधार कर सकती हैं।'
            )}
          </p>
        </div>
        <div className="rpt-card">
          <h3 className="rpt-section-title">{t('Preventive Care', 'निवारक देखभाल')}</h3>
          <p className="rpt-prose">
            {t(
              'Focus on preventive health check-ups aligned with the areas indicated by Saturn and the 6th house. Early detection and regular monitoring can prevent chronic issues from developing.',
              'शनि और छठे भाव द्वारा इंगित क्षेत्रों के साथ संरेखित निवारक स्वास्थ्य जांच पर ध्यान दें। प्रारंभिक पहचान और नियमित निगरानी से पुरानी समस्याओं को विकसित होने से रोका जा सकता है।'
            )}
          </p>
        </div>
      </div>
    </>
  );
}