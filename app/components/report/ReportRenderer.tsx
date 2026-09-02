'use client';

import React from 'react';
import { buildReportModel, type ReportModel } from './reportModel';
import type { ReportData } from '@/lib/pdfHtmlTemplate';
import type { ReportPage } from '@/types/kundali';
import type { KundliCalculations } from '@/types/kundali';

import PageShell from './PageShell';
import { NativitySummarySection } from './sections/NativitySummary';
import { PanchangSection } from './sections/Panchang';
import { GrahaSthitiSection } from './sections/GrahaSthiti';
import { D1ChartSection, D9ChartSection, AshtakavargaSection } from './sections/Charts';
import { LagnaMoonSection } from './sections/LagnaMoon';
import { NakshatraGunaSection } from './sections/NakshatraGuna';
import {
  LifePillarPage,
  LifeBalanceSection,
  MilestoneTrackerSection,
  PILLARS,
} from './sections/LifePillars';
import type { LifePillarConfig } from '@/lib/pillarNarratives';
import { HouseGridSection } from './sections/HouseGrid';
import { SpecialYogasSection } from './sections/SpecialYogas';
import { MangalDoshaSection } from './sections/MangalDosha';
import { SadeSatiSection } from './sections/SadeSati';
import {
  DashaOverviewSection,
  MahadashaDetailSection,
  DashaForecastSection,
} from './sections/DashaPages';
import { RemediesSection } from './sections/Remedies';
import { DailyGuidanceSection } from './sections/DailyGuidance';
import { DashaDetailSection } from './sections/DashaDetail';
import { TransitSection } from './sections/Transit';
import { CareerRoadmapSection } from './sections/CareerRoadmap';
import { WealthAnalysisSection } from './sections/WealthAnalysis';
import { HealthAnalysisSection } from './sections/HealthAnalysis';

export interface ReportRendererProps {
  reportData: ReportData;
  calculations?: KundliCalculations;
  language?: 'en' | 'hi';
  pillars?: LifePillarConfig[];
  fullBreakdown?: ReportPage[];
  onPrint?: () => void;
}

function buildPages(model: ReportModel, pillars?: LifePillarConfig[], fullBreakdown?: ReportPage[]): React.ReactNode[] {
  const pillarList = pillars && pillars.length === 6 ? pillars : PILLARS;
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);
  const TOTAL_PAGES = 25;

  const pillarStart = 5;
  const pillarPages = pillarList.map((p, i) => (
    <LifePillarPage
      key={p.key}
      model={model}
      pillar={{ ...p, page: pillarStart + i }}
      page={pillarStart + i}
      totalPages={TOTAL_PAGES}
    />
  ));

  const breakdownPages = (fullBreakdown || []).map((page, i) => (
    <PageShell
      key={`fb-${i}`}
      title={page.title || t(`Section ${16 + i}`, `सेक्शन ${16 + i}`)}
      chapter={`${16 + i}`}
      subject={model.clientName}
      page={16 + i}
      totalPages={TOTAL_PAGES}
    >
      <div className="report-section-content">
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </PageShell>
  ));

  return [
    <PageShell
      key="p1"
      title={t('Nativity & Panchang', 'जन्म विवरण एवं पंचांग')}
      chapter="01"
      subject={model.clientName}
      page={1}
      totalPages={TOTAL_PAGES}
    >
      <NativitySummarySection model={model} />
      <PanchangSection model={model} />
      <D1ChartSection model={model} />
    </PageShell>,

    <PageShell
      key="p2"
      title={t('Graha Sthiti & Ashtakavarga', 'ग्रह स्थिति एवं अष्टकवर्ग')}
      chapter="02"
      subject={model.clientName}
      page={2}
      totalPages={TOTAL_PAGES}
    >
      <GrahaSthitiSection model={model} />
      <AshtakavargaSection model={model} />
    </PageShell>,

    <PageShell
      key="p3"
      title={t('Lagna, Moon & Nakshatra', 'लग्न, चंद्र एवं नक्षत्र')}
      chapter="03"
      subject={model.clientName}
      page={3}
      totalPages={TOTAL_PAGES}
    >
      <LagnaMoonSection model={model} />
      <NakshatraGunaSection model={model} />
    </PageShell>,

    <PageShell
      key="p4"
      title={t('Twelve Houses & Navamsa', 'द्वादश भाव एवं नवांश')}
      chapter="04"
      subject={model.clientName}
      page={4}
      totalPages={TOTAL_PAGES}
    >
      <HouseGridSection model={model} />
      <D9ChartSection model={model} />
    </PageShell>,

    ...pillarPages,

    <PageShell
      key="p11"
      title={t('Life Pillars — Overview & Tracker', 'जीवन स्तंभ — सारांश एवं ट्रैकर')}
      chapter="11"
      subject={model.clientName}
      page={11}
      totalPages={TOTAL_PAGES}
    >
      <LifeBalanceSection model={model} pillars={pillarList} />
      <MilestoneTrackerSection model={model} pillars={pillarList} />
    </PageShell>,

    <PageShell
      key="p12"
      title={t('Yogas & Mangal Dosha', 'योग एवं मंगल दोष')}
      chapter="12"
      subject={model.clientName}
      page={12}
      totalPages={TOTAL_PAGES}
    >
      <SpecialYogasSection model={model} />
      <MangalDoshaSection model={model} />
    </PageShell>,

    <PageShell
      key="p13"
      title={t('Sade Sati & Dasha', 'साढ़े साती एवं दशा')}
      chapter="13"
      subject={model.clientName}
      page={13}
      totalPages={TOTAL_PAGES}
    >
      <SadeSatiSection model={model} />
      <DashaOverviewSection model={model} />
    </PageShell>,

    <PageShell
      key="p14"
      title={t('Current Mahadasha & Forecast', 'चल रही महादशा एवं पूर्वानुमान')}
      chapter="14"
      subject={model.clientName}
      page={14}
      totalPages={TOTAL_PAGES}
    >
      <MahadashaDetailSection model={model} />
      <DashaForecastSection model={model} />
    </PageShell>,

    <PageShell
      key="p15"
      title={t('Remedies & Daily Guidance', 'उपाय एवं दैनिक मार्गदर्शन')}
      chapter="15"
      subject={model.clientName}
      page={15}
      totalPages={TOTAL_PAGES}
    >
      <RemediesSection model={model} />
      <DailyGuidanceSection model={model} />
    </PageShell>,

    ...breakdownPages,

    <PageShell
      key="p21"
      title={t('Dasha Deep Dive', 'दशा गहिरा विश्लेषण')}
      chapter="21"
      subject={model.clientName}
      page={21}
      totalPages={TOTAL_PAGES}
    >
      <DashaDetailSection model={model} />
    </PageShell>,

    <PageShell
      key="p22"
      title={t('Transit Predictions', 'गोचर पूर्वानुमान')}
      chapter="22"
      subject={model.clientName}
      page={22}
      totalPages={TOTAL_PAGES}
    >
      <TransitSection model={model} />
    </PageShell>,

    <PageShell
      key="p23"
      title={t('Career Roadmap', 'करियर मार्गदर्शन')}
      chapter="23"
      subject={model.clientName}
      page={23}
      totalPages={TOTAL_PAGES}
    >
      <CareerRoadmapSection model={model} />
    </PageShell>,

    <PageShell
      key="p24"
      title={t('Wealth Analysis', 'धन विश्लेषण')}
      chapter="24"
      subject={model.clientName}
      page={24}
      totalPages={TOTAL_PAGES}
    >
      <WealthAnalysisSection model={model} />
    </PageShell>,

    <PageShell
      key="p25"
      title={t('Health Analysis', 'स्वास्थ्य विश्लेषण')}
      chapter="25"
      subject={model.clientName}
      page={25}
      totalPages={TOTAL_PAGES}
    >
      <HealthAnalysisSection model={model} />
    </PageShell>,
  ];
}

export default function ReportRenderer({
  reportData,
  calculations,
  language = 'en',
  pillars,
  fullBreakdown,
  onPrint,
}: ReportRendererProps) {
  const model: ReportModel = React.useMemo(
    () => buildReportModel(reportData, calculations, language),
    [reportData, calculations, language]
  );

  const pages = buildPages(model, pillars, fullBreakdown);

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
