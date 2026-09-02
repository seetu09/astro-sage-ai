'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Briefcase,
  Heart,
  Coins,
  CalendarClock,
  ArrowUp,
  Moon,
  Sun,
  Star,
  LayoutGrid,
} from 'lucide-react';

import { useLanguage } from '@/app/context/LanguageContext';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import { useApp } from '@/app/context/AppContext';
import PaymentButton from '@/app/components/PaymentButton';
import KundliPdfButton from '@/app/components/KundliPdfButton';
import ReportRenderer from '@/app/components/report/ReportRenderer';
import { ReportData } from '@/lib/pdfHtmlTemplate';
import { NAKSHATRA_LORDS, NAKSHATRA_NAMES } from '@/lib/astrologyDictionary';
import {
  FreeTierData,
  PaidTierData,
  CareerTimings,
  MarriageDynamics,
  WealthAllocation,
  DashaRoadmapEntry,
  KundliCalculations,
  RichMilestone,
} from '@/types/kundali';
import type { LifePillarConfig } from '@/lib/pillarNarratives';

interface KundaliViewProps {
  freeTier: FreeTierData;
  paidTier: PaidTierData;
  userEmail: string;
  userName?: string;
  birthDetails?: {
    date: string;
    time: string;
    latitude: string;
    longitude: string;
    timezone: string;
  };
  planets?: { body: string; sign: string; degree: string; house: string; retro?: boolean }[];
  houseCusps?: { house: number; sign: string; degree: string }[];
  chartType?: string;
  /** Optional deterministic calculations layer consumed by the A4 report. */
  calculations?: KundliCalculations;
  /** Six AI-generated Life Pillar narratives (single-shot report generation). */
  pillars?: LifePillarConfig[];
  /** Called when the user clicks "Download PDF" after unlocking. */
  onDownload?: () => void | Promise<void>;
}

type TabKey = 'career' | 'marriage' | 'wealth' | 'dasha';

const TABS: { key: TabKey; icon: typeof Briefcase }[] = [
  { key: 'career', icon: Briefcase },
  { key: 'marriage', icon: Heart },
  { key: 'wealth', icon: Coins },
  { key: 'dasha', icon: CalendarClock },
];

const TAB_LABEL_KEYS: Record<TabKey, string> = {
  career: 'careerTimings',
  marriage: 'marriageDynamics',
  wealth: 'wealthAllocation',
  dasha: 'dashaRoadmap',
};

const PLANET_KEYS: Record<string, string> = {
  Sun: 'sun',
  Moon: 'moon',
  Mars: 'mars',
  Mercury: 'mercury',
  Jupiter: 'jupiter',
  Venus: 'venus',
  Saturn: 'saturn',
  Rahu: 'rahu',
  Ketu: 'ketu',
};

export default function KundaliView({
  freeTier,
  paidTier,
  userEmail,
  userName = 'User',
  birthDetails = { date: '', time: '', latitude: '', longitude: '', timezone: '' },
  planets = [],
  houseCusps = [],
  chartType = 'north-indian',
  calculations,
  pillars,
  onDownload,
}: KundaliViewProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const { isPaid, markAsPaid, selectedLanguage } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('career');
  // 'tabs' = existing tabbed preview (default); 'report' = strict-A4 modular report.
  const [viewMode, setViewMode] = useState<'tabs' | 'report'>('tabs');
  const [reportLockHint, setReportLockHint] = useState(false);

  const ctaLabel = t('kundali.sections.unlockReportDownload');

  const unlockPrice = 49;
  const { corePersonality: cp, topCareers, wealthType, runningDashaName } = freeTier;

  const reportData: ReportData = {
    clientName: userName,
    chartType: chartType === 'north-indian' ? t('kundali.northIndian') : t('kundali.sections.southIndian'),
    birthDetails,
    planetaryPositions: planets,
    houseCusps,
    dashaPeriods: (paidTier.dashaRoadmap || []).map((d) => ({
      mahaDasha: d.lord,
      startYear: d.startDate.split('-')[0],
      endYear: d.endDate.split('-')[0],
      subPeriod: d.theme,
    })),
    yogas: (paidTier.yogas || []).map((y) => ({
      name: y.name,
      description: y.description,
    })),
    remedies: [
      ...(paidTier.remedies || []).map((r) => ({
        category: r.type,
        description: r.description,
      })),
      // Rich AI remedy kit — daily mantras + gemstone digest.
      ...(paidTier.remedyKit?.dailyMantras ?? []).map((m) => ({
        category: t('kundali.dailyMantra'),
        description: m,
      })),
      ...((paidTier.remedyKit?.gemstones ?? []).length
        ? [{
            category: t('kundali.gemstoneSuggestion'),
            description: (paidTier.remedyKit?.gemstones ?? []).join(' · '),
          }]
        : []),
    ],
    domainInsights: [
      {
        domain: 'career' as const,
        // Rich ~250-word AI paragraph when present, else the short overview.
        prediction: paidTier.lifeDomains?.career?.narrative || paidTier.careerTimings?.overview || '',
        analysis: (paidTier.lifeDomains?.career?.milestones ?? [])
          .map((m) => `${m.period}: ${m.event}`)
          .join(' • '),
        timeframe: paidTier.lifeDomains?.career?.milestones?.[0]?.period,
      },
      {
        domain: 'marriage' as const,
        prediction: paidTier.lifeDomains?.marriage?.narrative || paidTier.marriageDynamics?.overview || '',
        analysis: (paidTier.lifeDomains?.marriage?.milestones ?? [])
          .map((m) => `${m.period}: ${m.event}`)
          .join(' • '),
        timeframe: paidTier.lifeDomains?.marriage?.milestones?.[0]?.period,
      },
      {
        domain: 'wealth' as const,
        prediction: paidTier.lifeDomains?.wealth?.narrative || paidTier.wealthAllocation?.overview || '',
        analysis: (paidTier.lifeDomains?.wealth?.milestones ?? [])
          .map((m) => `${m.period}: ${m.event}`)
          .join(' • '),
        timeframe: paidTier.lifeDomains?.wealth?.milestones?.[0]?.period,
      },
      {
        domain: 'health' as const,
        prediction: paidTier.lifeDomains?.health?.narrative || paidTier.lifeDomains?.health?.overview || '',
        analysis: '',
        timeframe: undefined,
      },
      { domain: 'finance', prediction: '', analysis: '' },
      { domain: 'education', prediction: '', analysis: '' },
    ],
    northIndianChartSvg: '',
    kalpurushaPhalDeepikaRefs: [],
    scorecard: [],
    isPaidTier: isPaid,
    panchang: birthDetails.date
      ? (() => {
          const dayIndex = new Date(birthDetails.date).getDay();
          const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const nakshatraIndex = NAKSHATRA_NAMES.en.indexOf(cp.nakshatra);
          return {
            varaWeekday: weekdayNames[dayIndex],
            nakshatra: cp.nakshatra || undefined,
            nakshatraLord: nakshatraIndex >= 0 ? NAKSHATRA_LORDS[nakshatraIndex] : undefined,
            moonSign: cp.moonSign || undefined,
            sunSign: cp.sunSign || undefined,
            lagna: cp.ascendant || undefined,
          };
        })()
      : undefined,
    d9Chart: calculations?.divisionalCharts?.D9
      ? {
          ascendantSign: calculations.divisionalCharts.D9.ascendantSign,
          planets: calculations.divisionalCharts.D9.planetCoordinates.map((p) => ({
            planet: p.planet === 'ASC' ? 'Lagna' : p.planet,
            sign: p.sign,
            house: p.house,
            retrograde: p.retrograde,
          })),
        }
      : undefined,
    sarvashtakavarga: calculations?.ashtakavarga
      ? {
          bindus: calculations.ashtakavarga.sarvashtakavarga,
          beneficialHouses: calculations.ashtakavarga.beneficialHouses,
        }
      : undefined,
    narratives: pillars,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ─────────────── FREE TIER — always visible on top ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <Sparkles className="w-3 h-3" />
            {t('kundali.sections.freePreview')}
          </span>
        </div>

        {/* Core personality header */}
        <h2 className="text-lg sm:text-xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
          {t('kundali.sections.corePersonality')}
        </h2>
        <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-4">
          {cp.summary}
        </p>

        {/* Lagna / Moon / Sun / Nakshatra badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
          {[
            { icon: <ArrowUp className="w-4 h-4" />, label: t('kundali.sections.ascendant'), value: cp.ascendant },
            { icon: <Moon className="w-4 h-4" />, label: t('kundali.sections.moonSign'), value: cp.moonSign },
            { icon: <Sun className="w-4 h-4" />, label: t('kundali.sections.sunSign'), value: cp.sunSign },
            { icon: <Star className="w-4 h-4" />, label: t('kundali.sections.nakshatra'), value: cp.nakshatra },
          ].map((badge) => (
            <div key={badge.label} className="rounded-xl p-3 flex items-center gap-2.5 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
              <span className="inline-flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/15 dark:to-[#E0A96D]/10 text-violet-700 dark:text-[#FFD166]">
                {badge.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide truncate">{badge.label}</p>
                <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] truncate">{badge.value || '--'}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 careers */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-[#6B7280] mb-2">
            {t('kundali.sections.topCareers')}
          </p>
          <div className="flex flex-wrap gap-2">
            {topCareers.length ? (
              topCareers.map((career) => (
                <span key={career} className="px-3 py-1.5 rounded-full bg-violet-50 dark:bg-[#FFD166]/10 border border-violet-200/60 dark:border-[#FFD166]/20 text-xs sm:text-sm font-medium text-violet-800 dark:text-[#FFD166]">
                  {career}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500 dark:text-[#9CA3AF]">--</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{t('kundali.sections.wealthType')}</p>
            <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5">{wealthType || '--'}</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{t('kundali.sections.runningDasha')}</p>
            <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5">{runningDashaName || '--'}</p>
          </div>
        </div>
      </motion.div>

      {/* ─────────────── VIEW MODE TOGGLE ─────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-[#6B7280] font-medium">
          {t('kundali.sections.viewMode')}
        </span>
        <div className="flex gap-1 p-1 rounded-xl bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
          <button
            onClick={() => setViewMode('tabs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'tabs'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] shadow-sunlit-soft'
                : 'text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-950 dark:hover:text-[#F3F4F6]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {t('kundali.sections.tabbedView')}
          </button>
          <button
            onClick={() => {
              if (isPaid) {
                setViewMode('report');
                setReportLockHint(false);
              } else {
                setReportLockHint(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === 'report' && isPaid
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] shadow-sunlit-soft'
                : 'text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-950 dark:hover:text-[#F3F4F6]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t('kundali.sections.fullA4Report')}
          </button>
        </div>
      </div>

      {/* ─────────────── GATED TABBED PREVIEW CARDS ─────────────── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        {reportLockHint && !isPaid && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300/60 dark:border-[#FFD166]/30 bg-amber-50 dark:bg-[#FFD166]/10 px-3 py-2.5 text-xs sm:text-sm text-amber-800 dark:text-[#FFD166]">
            <Lock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              {t('kundali.sections.reportLockedHint')}
            </span>
          </div>
        )}
        {viewMode === 'report' && isPaid ? (
          /* Strict-A4 modular report renderer — paid users only. */
          <ReportRenderer
            reportData={reportData}
            calculations={calculations}
            pillars={pillars}
            fullBreakdown={paidTier.fullBreakdown}
            language={language}
          />
        ) : (
        <>
        <div className="flex flex-wrap gap-1.5 mb-4 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] shadow-sunlit-soft'
                    : 'bg-slate-50/50 dark:bg-white/[0.03] text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-950 dark:hover:text-[#F3F4F6] border border-slate-200/60 dark:border-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(`kundali.sections.${TAB_LABEL_KEYS[tab.key]}`)}
              </button>
            );
          })}
        </div>

        <div className="relative">
          {/* Active tab content */}
          <div className={isPaid ? '' : 'blur-[6px] select-none pointer-events-none opacity-70'}>
            <TabPanel tab={activeTab} paidTier={paidTier} />

            {/* Rich AI remedy kit — gemstone suggestions + exactly four daily mantras */}
            {(!!paidTier.remedyKit?.gemstones?.length || !!paidTier.remedyKit?.dailyMantras?.length) && (
              <div className="glass-card rounded-xl p-4 mt-4">
                <h3 className="text-sm sm:text-base font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
                  {t('kundali.sections.gemstonesDailyMantras')}
                </h3>
                {!!paidTier.remedyKit?.gemstones?.length && (
                  <ul className="space-y-1 mb-3">
                    {paidTier.remedyKit.gemstones.map((g, i) => (
                      <li key={`gem-${i}`} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                        💎 {g}
                      </li>
                    ))}
                  </ul>
                )}
                {!!paidTier.remedyKit?.dailyMantras?.length && (
                  <ul className="space-y-1">
                    {paidTier.remedyKit.dailyMantras.map((m, i) => (
                      <li key={`mantra-${i}`} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                        🕉️ {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Frosted-glass lock overlay + CTA (only when not paid) */}
          {!isPaid && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-md">
              <div className="text-center px-4 max-w-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/20 mb-3">
                  <Lock className="w-6 h-6 text-violet-700 dark:text-[#FFD166]" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-3">
                  {t('kundali.sections.sectionLocked')}
                </h3>
                <div className="max-w-xs mx-auto">
                  <PaymentButton
                    amount={unlockPrice}
                    userEmail={userEmail || 'guest@astroveda.com'}
                    userName={userName}
                    paymentType="kundli_report"
                    buttonText={ctaLabel}
                    onSuccess={(details) => markAsPaid(details)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

                {/* Download actions (only when paid): primary server-rendered
                    "Download Full 25-Page Kundli" with language modal +
                    automatic window.print() fallback; secondary instant
                    client-side quick print. */}
        {isPaid && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {(() => {
              console.log('[KundaliView] reportData payload check:', {
                hasPanchang: !!reportData.panchang,
                hasD9Chart: !!reportData.d9Chart,
                hasSarvashtakavarga: !!reportData.sarvashtakavarga,
                hasNarratives: !!reportData.narratives,
              });
              return <KundliPdfButton reportData={reportData} userName={userName} />;
            })()}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

function TabPanel({
  tab,
  paidTier,
}: {
  tab: TabKey;
  paidTier: PaidTierData;
}) {
  // Milestone windows produced by the rich AI layer live on lifeDomains.
  const milestonesFor = (key: 'career' | 'marriage' | 'wealth'): RichMilestone[] =>
    paidTier.lifeDomains?.[key]?.milestones ?? [];
  if (tab === 'career')
    return <CareerPanel data={paidTier.careerTimings} milestones={milestonesFor('career')} />;
  if (tab === 'marriage')
    return <MarriagePanel data={paidTier.marriageDynamics} milestones={milestonesFor('marriage')} />;
  if (tab === 'wealth')
    return <WealthPanel data={paidTier.wealthAllocation} milestones={milestonesFor('wealth')} />;
  return <DashaPanel data={paidTier.dashaRoadmap} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm sm:text-base font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
      {children}
    </h3>
  );
}

/** Dated milestone windows from the rich AI layer — renders nothing when absent. */
function MilestoneChips({ items }: { items?: RichMilestone[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {items.map((m, i) => (
        <span
          key={`${m.period}-${i}`}
          className="text-[11px] rounded-full px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-[#FFD166]"
        >
          <span className="font-semibold">{m.period}</span>
          {m.event ? <> · {m.event}</> : null}
        </span>
      ))}
    </div>
  );
}

function CareerPanel({ data, milestones = [] }: { data: CareerTimings; milestones?: RichMilestone[] }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionTitle>{t('kundali.sections.careerTimings')}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
      <MilestoneChips items={milestones} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{t('kundali.sections.favorablePeriods')}</p>
          <ul className="space-y-1.5">
            {(data.favorable || []).map((f, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                <span className="font-medium text-indigo-900 dark:text-[#F3F4F6]">{f.period}:</span> {f.note}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{t('kundali.sections.challengingPeriods')}</p>
          <ul className="space-y-1.5">
            {(data.challenging || []).map((c, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                <span className="font-medium text-indigo-900 dark:text-[#F3F4F6]">{c.period}:</span> {c.note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MarriagePanel({ data, milestones = [] }: { data: MarriageDynamics; milestones?: RichMilestone[] }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionTitle>{t('kundali.sections.marriageDynamics')}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
      <MilestoneChips items={milestones} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{t('kundali.sections.strengths')}</p>
          <ul className="space-y-1.5">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{t('kundali.sections.challenges')}</p>
          <ul className="space-y-1.5">
            {(data.challenges || []).map((c, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">• {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-violet-700 dark:text-[#FFD166] mb-1">{t('kundali.sections.favorableTiming')}</p>
          <ul className="space-y-1.5">
            {(data.favorable || []).map((f, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                <span className="font-medium text-indigo-900 dark:text-[#F3F4F6]">{f.period}:</span> {f.note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WealthPanel({ data, milestones = [] }: { data: WealthAllocation; milestones?: RichMilestone[] }) {
  const { t } = useTranslation();
  return (
    <div>
      <SectionTitle>{t('kundali.sections.wealthAllocation')}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
      <MilestoneChips items={milestones} />
      <div className="space-y-2">
        {(data.allocation || []).map((slice) => (
          <div key={slice.category}>
            <div className="flex justify-between text-xs sm:text-sm mb-1">
              <span className="font-medium text-indigo-900 dark:text-[#F3F4F6]">{slice.category}</span>
              <span className="text-slate-500 dark:text-[#9CA3AF]">{slice.percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/70 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-[#FFD166] dark:to-[#E0A96D]"
                style={{ width: `${Math.min(100, Math.max(0, slice.percentage))}%` }}
              />
            </div>
            {slice.note && <p className="text-[11px] text-slate-400 dark:text-[#6B7280] mt-1">{slice.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function DashaPanel({ data }: { data: DashaRoadmapEntry[] }) {
  const { t } = useTranslation();
  const translatePlanet = (name: string): string => {
    const key = PLANET_KEYS[name.trim()];
    return key ? t(`kundali.planets.${key}`) : name;
  };
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-[#9CA3AF]">--</p>;
  }
  return (
    <div>
      <SectionTitle>{t('kundali.sections.dashaRoadmap')}</SectionTitle>
      <div className="space-y-2">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2.5 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 dark:from-[#FFD166] dark:to-[#E0A96D] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6]">{translatePlanet(entry.lord)} {t('kundali.sections.mahadasha')}</p>
              <p className="text-[11px] text-slate-400 dark:text-[#6B7280]">{entry.startDate} → {entry.endDate}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] text-right max-w-[40%] truncate">{entry.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
