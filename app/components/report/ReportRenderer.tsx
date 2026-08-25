'use client';

import React from 'react';
import { buildReportModel, type ReportModel } from './reportModel';
import type { ReportData } from '@/lib/pdfHtmlTemplate';
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

/**
 * buildPages — composes the report into dense A4 pages.
 *
 * Related sections share a single A4 sheet (Nativity + Panchang + D1 chart on
 * page 1, House cusps + D9 chart together, etc.) instead of one sparse page
 * per section, eliminating the blank white sheets the old 24-page layout left
 * behind. Every Life-Pillar page keeps its 3-badge header, narrative card and
 * milestone table.
 */
function buildPages(model: ReportModel, pillars?: LifePillarConfig[]): React.ReactNode[] {
  const pillarList = pillars && pillars.length === 6 ? pillars : PILLARS;
  const t = (en: string, hi: string) => (model.language === 'hi' ? hi : en);

  // Pillar pages run from page 5 → 10.
  const pillarStart = 5;
  const pillarPages = pillarList.map((p, i) => (
    <LifePillarPage
      key={p.key}
      model={model}
      pillar={{ ...p, page: pillarStart + i }}
      page={pillarStart + i}
      totalPages={15}
    />
  ));

  return [
    /* ── Page 1 — Nativity + Panchang + D1 chart ─────────────────────── */
    <PageShell
      key="p1"
      title={t('Nativity & Panchang', 'जन्म विवरण एवं पंचांग')}
      chapter="01"
      subject={model.clientName}
      page={1}
      totalPages={15}
    >
      <NativitySummarySection model={model} />
      <PanchangSection model={model} />
      <D1ChartSection model={model} />
    </PageShell>,

    /* ── Page 2 — Planetary positions + Ashtakavarga ─────────────────── */
    <PageShell
      key="p2"
      title={t('Graha Sthiti & Ashtakavarga', 'ग्रह स्थिति एवं अष्टकवर्ग')}
      chapter="02"
      subject={model.clientName}
      page={2}
      totalPages={15}
    >
      <GrahaSthitiSection model={model} />
      <AshtakavargaSection model={model} />
    </PageShell>,

    /* ── Page 3 — Lagna & Moon deep dive + Nakshatra ─────────────────── */
    <PageShell
      key="p3"
      title={t('Lagna, Moon & Nakshatra', 'लग्न, चंद्र एवं नक्षत्र')}
      chapter="03"
      subject={model.clientName}
      page={3}
      totalPages={15}
    >
      <LagnaMoonSection model={model} />
      <NakshatraGunaSection model={model} />
    </PageShell>,

    /* ── Page 4 — House cusps + D9 Navamsa chart ─────────────────────── */
    <PageShell
      key="p4"
      title={t('Twelve Houses & Navamsa', 'द्वादश भाव एवं नवांश')}
      chapter="04"
      subject={model.clientName}
      page={4}
      totalPages={15}
    >
      <HouseGridSection model={model} />
      <D9ChartSection model={model} />
    </PageShell>,

    ...pillarPages,

    /* ── Page 11 — Life pillars overview + milestone tracker ─────────── */
    <PageShell
      key="p11"
      title={t('Life Pillars — Overview & Tracker', 'जीवन स्तंभ — सारांश एवं ट्रैकर')}
      chapter="11"
      subject={model.clientName}
      page={11}
      totalPages={15}
    >
      <LifeBalanceSection model={model} pillars={pillarList} />
      <MilestoneTrackerSection model={model} pillars={pillarList} />
    </PageShell>,

    /* ── Page 12 — Yogas + Mangal Dosha ──────────────────────────────── */
    <PageShell
      key="p12"
      title={t('Yogas & Mangal Dosha', 'योग एवं मंगल दोष')}
      chapter="12"
      subject={model.clientName}
      page={12}
      totalPages={15}
    >
      <SpecialYogasSection model={model} />
      <MangalDoshaSection model={model} />
    </PageShell>,

    /* ── Page 13 — Sade Sati + Dasha overview ────────────────────────── */
    <PageShell
      key="p13"
      title={t('Sade Sati & Dasha', 'साढ़े साती एवं दशा')}
      chapter="13"
      subject={model.clientName}
      page={13}
      totalPages={15}
    >
      <SadeSatiSection model={model} />
      <DashaOverviewSection model={model} />
    </PageShell>,

    /* ── Page 14 — Current Mahadasha + forecast ──────────────────────── */
    <PageShell
      key="p14"
      title={t('Current Mahadasha & Forecast', 'चल रही महादशा एवं पूर्वानुमान')}
      chapter="14"
      subject={model.clientName}
      page={14}
      totalPages={15}
    >
      <MahadashaDetailSection model={model} />
      <DashaForecastSection model={model} />
    </PageShell>,

    /* ── Page 15 — Remedies + Daily guidance ─────────────────────────── */
    <PageShell
      key="p15"
      title={t('Remedies & Daily Guidance', 'उपाय एवं दैनिक मार्गदर्शन')}
      chapter="15"
      subject={model.clientName}
      page={15}
      totalPages={15}
    >
      <RemediesSection model={model} />
      <DailyGuidanceSection model={model} />
    </PageShell>,
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
