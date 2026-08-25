'use client';

import PageShell from '../PageShell';
import { SectionHeading } from '../primitives';
import type { ReportModel } from '../reportModel';
import { renderKundliChartSvg } from '@/lib/kundliChart';
import type { ChartPlanetInput } from '@/lib/kundliChart';

/**
 * PAGE 4 — D1/D9 Charts + Ashtakavarga.
 * Renders the Lagna (D1) and Navamsa (D9) SVG charts from the deterministic
 * divisional matrices, then the Sarvashtakavarga bindu totals per house.
 */
export function ChartsPage({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const calc = model.calculations;
  const d1 = calc?.divisionalCharts?.D1;
  const d9 = calc?.divisionalCharts?.D9;
  const ashtak = calc?.ashtakavarga;

  const d1Svg = d1 ? renderD1Svg(d1, model.language) : null;
  const d9Svg = d9 ? renderD9Svg(d9, model.language) : null;

  return (
    <PageShell
      title={t('Charts & Ashtakavarga', 'चार्ट एवं अष्टकवर्ग')}
      chapter="04"
      subject={model.clientName}
      page={4}
      totalPages={24}
    >
      <SectionHeading
        title={t('Lagna & Navamsa Charts', 'लग्न एवं नवांश चार्ट')}
        subtitle={t('D1 (Rashi) and D9 (Navamsa) harmonic charts', 'D1 (राशि) एवं D9 (नवांश) सूक्ष्म चार्ट')}
      />

      <div className="rpt-chart-row">
        <div className="rpt-chart-col">
          <div className="rpt-chart-title">{t('D1 – Birth Chart', 'D1 – जन्म कुंडली')}</div>
          <div className="rpt-chart-svg" dangerouslySetInnerHTML={{ __html: d1Svg || '' }} />
        </div>
        <div className="rpt-chart-col">
          <div className="rpt-chart-title">{t('D9 – Navamsa', 'D9 – नवांश')}</div>
          <div className="rpt-chart-svg" dangerouslySetInnerHTML={{ __html: d9Svg || '' }} />
        </div>
      </div>
      {!d1Svg && !d9Svg && (
        <p className="rpt-empty">{t('Chart data unavailable.', 'चार्ट डेटा उपलब्ध नहीं है।')}</p>
      )}

      <SectionHeading
        title={t('Sarvashtakavarga', 'सर्वाष्टकवर्ग')}
        subtitle={t('Bindu strength per house (house 1 → 12)', 'प्रति भाव बिंदु शक्ति (भाव 1 → 12)')}
        accent="violet"
      />

      {ashtak?.sarvashtakavarga?.length ? (
        <>
          <div className="rpt-av-grid">
            {ashtak.sarvashtakavarga.map((bind, idx) => (
              <div
                key={idx}
                className={`rpt-av-cell ${ashtak.beneficialHouses?.includes(idx + 1) ? 'rpt-av-strong' : ''}`}
              >
                <span className="rpt-av-house">{t('H', 'भ')} {idx + 1}</span>
                <span className="rpt-av-bind">{bind}</span>
              </div>
            ))}
          </div>
          {ashtak.beneficialHouses?.length > 0 && (
            <p className="rpt-note">
              {t('Strong houses: ', 'शक्तिशाली भाव: ')}
              {ashtak.beneficialHouses.join(', ')}
            </p>
          )}
        </>
      ) : (
        <p className="rpt-empty">{t('Ashtakavarga data unavailable.', 'अष्टकवर्ग डेटा उपलब्ध नहीं है।')}</p>
      )}
    </PageShell>
  );
}

/* ------------------------------------------------------------------ */
/* SVG helpers                                                         */
/* ------------------------------------------------------------------ */

function renderD1Svg(
  matrix: { ascendantSign: number; planetCoordinates: { planet: string; sign: number; house: number; retrograde: boolean }[] },
  lang: 'en' | 'hi'
): string {
  const planets: ChartPlanetInput[] = matrix.planetCoordinates.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    house: p.house,
    retrograde: p.retrograde,
  }));
  return renderKundliChartSvg({ style: 'north', language: lang, ascendantSign: matrix.ascendantSign, planets });
}

function renderD9Svg(
  d: { ascendantSign: number; planetCoordinates: { planet: string; sign: number; house: number; retrograde: boolean }[] },
  lang: 'en' | 'hi'
): string {
  const planets: ChartPlanetInput[] = d.planetCoordinates.map((p) => ({
    planet: p.planet,
    sign: p.sign,
    house: p.house,
    retrograde: p.retrograde,
  }));
  return renderKundliChartSvg({ style: 'north', language: lang, ascendantSign: d.ascendantSign, planets });
}