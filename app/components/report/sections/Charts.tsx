'use client';

import { SectionHeading } from '../primitives';
import type { ReportModel } from '../reportModel';
import { renderKundliChartSvg } from '@/lib/kundliChart';
import type { ChartPlanetInput } from '@/lib/kundliChart';

/**
 * CHART SECTIONS — bare chart blocks (composed into grouped pages).
 * `D1ChartSection` renders the Lagna (D1) chart, `D9ChartSection` renders the
 * Navamsa (D9) chart, and `AshtakavargaSection` renders the Sarvashtakavarga
 * bindu totals per house.
 */

export function D1ChartSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const d1 = model.calculations?.divisionalCharts?.D1;
  const d1Svg = d1 ? renderD1Svg(d1, model.language) : null;

  return (
    <>
      <SectionHeading
        title={t('Lagna (D1) Chart', 'लग्न (D1) चार्ट')}
        subtitle={t('The birth chart with the ascendant at the top', 'लग्न शीर्ष पर रहते हुए जन्म कुंडली')}
      />
      {d1Svg ? (
        <div className="rpt-chart-svg" dangerouslySetInnerHTML={{ __html: d1Svg }} />
      ) : (
        <p className="rpt-empty">{t('Chart data unavailable.', 'चार्ट डेटा उपलब्ध नहीं है।')}</p>
      )}
    </>
  );
}

export function D9ChartSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const d9 = model.calculations?.divisionalCharts?.D9;
  const d9Svg = d9 ? renderD9Svg(d9, model.language) : null;

  return (
    <>
      <SectionHeading
        title={t('Navamsa (D9) Chart', 'नवांश (D9) चार्ट')}
        subtitle={t('The D9 harmonic chart — marriage & inner soul', 'D9 सूक्ष्म चार्ट — विवाह एवं आंतरिक आत्मा')}
        accent="violet"
      />
      {d9Svg ? (
        <div className="rpt-chart-svg" dangerouslySetInnerHTML={{ __html: d9Svg }} />
      ) : (
        <p className="rpt-empty">{t('Chart data unavailable.', 'चार्ट डेटा उपलब्ध नहीं है।')}</p>
      )}
    </>
  );
}

export function AshtakavargaSection({ model }: { model: ReportModel }) {
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const ashtak = model.calculations?.ashtakavarga;

  return (
    <>
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
    </>
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