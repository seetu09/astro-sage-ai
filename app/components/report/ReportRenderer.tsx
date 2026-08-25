'use client';

import React from 'react';
import { buildReportModel, type ReportModel } from './reportModel';
import type { ReportData } from '@/lib/pdfHtmlTemplate';
import type { KundliCalculations } from '@/types/kundali';

import { NativitySummaryPage } from './sections/NativitySummary';
import { PanchangPage } from './sections/Panchang';
import { GrahaSthitiPage } from './sections/GrahaSthiti';
import { ChartsPage } from './sections/Charts';
import { LagnaMoonPage } from './sections/LagnaMoon';
import { NakshatraGunaPage } from './sections/NakshatraGuna';
import {
  LifePillarPage,
  LifeBalancePage,
  MilestoneTrackerPage,
  PILLARS,
} from './sections/LifePillars';
import type { LifePillarConfig } from '@/lib/pillarNarratives';
import { HouseGridPage } from './sections/HouseGrid';
import { SpecialYogasPage } from './sections/SpecialYogas';
import { MangalDoshaPage } from './sections/MangalDosha';
import { SadeSatiPage } from './sections/SadeSati';
import {
  DashaOverviewPage,
  MahadashaDetailPage,
  DashaForecastPage,
} from './sections/DashaPages';
import { RemediesPage } from './sections/Remedies';
import { DailyGuidancePage } from './sections/DailyGuidance';

export interface ReportRendererProps {
  reportData: ReportData;
  calculations?: KundliCalculations;
  language?: 'en' | 'hi';
  /**
   * Optional AI-generated Life Pillar narratives (see
   * `POST /api/kundali/narratives`). When provided as a complete 6-item set it
   * replaces the static pillar config; otherwise the built-in defaults are used.
   */
  pillars?: LifePillarConfig[];
  onPrint?: () => void;
}

function buildPages(model: ReportModel, pillars?: LifePillarConfig[]): React.ReactNode[] {
  const pillarList = pillars && pillars.length === 6 ? pillars : PILLARS;
  return [
    <NativitySummaryPage key="nativity" model={model} />,
    <PanchangPage key="panchang" model={model} />,
    <GrahaSthitiPage key="graha" model={model} />,
    <ChartsPage key="charts" model={model} />,
    <LagnaMoonPage key="lagna" model={model} />,
    <NakshatraGunaPage key="nakshatra" model={model} />,
    ...pillarList.map((p) => (
      <LifePillarPage key={p.key} model={model} pillar={p} />
    )),
    <LifeBalancePage key="balance" model={model} pillars={pillarList} />,
    <MilestoneTrackerPage key="tracker" model={model} pillars={pillarList} />,
    <HouseGridPage key="houses-1" model={model} page={15} startHouse={1} />,
    <HouseGridPage key="houses-2" model={model} page={16} startHouse={7} />,
    <SpecialYogasPage key="yogas" model={model} />,
    <MangalDoshaPage key="mangal" model={model} />,
    <SadeSatiPage key="sadesati" model={model} />,
    <DashaOverviewPage key="dasha-overview" model={model} />,
    <MahadashaDetailPage key="dasha-detail" model={model} />,
    <DashaForecastPage key="dasha-forecast" model={model} />,
    <RemediesPage key="remedies" model={model} />,
    <DailyGuidancePage key="daily" model={model} />,
  ];
}

export default function ReportRenderer({
  reportData,
  calculations,
  language = 'en',
  pillars,
  onPrint,
}: ReportRendererProps) {
  const model: ReportModel = React.useMemo(
    () => buildReportModel(reportData, calculations, language),
    [reportData, calculations, language]
  );

  const pages = buildPages(model, pillars);

  return (
    <section className="report-root" data-report-pages={pages.length}>
      {pages.map((p) => p)}

      {onPrint && (
        <div className="report-print-trigger">
          <button type="button" onClick={onPrint} className="rpt-print-btn">
            {language === 'hi' ? 'प्रिंट करें' : 'Print Report'}
          </button>
        </div>
      )}
    </section>
  );
}