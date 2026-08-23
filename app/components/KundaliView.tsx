'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Lock,
  Download,
  Briefcase,
  Heart,
  Coins,
  CalendarClock,
  ArrowUp,
  Moon,
  Sun,
  Star,
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { useApp } from '@/app/context/AppContext';
import PaymentButton from '@/app/components/PaymentButton';
import {
  FreeTierData,
  PaidTierData,
  CareerTimings,
  MarriageDynamics,
  WealthAllocation,
  DashaRoadmapEntry,
} from '@/types/kundali';

interface KundaliViewProps {
  freeTier: FreeTierData;
  paidTier: PaidTierData;
  userEmail: string;
  userName?: string;
  /** Called when the user clicks "Download PDF" after unlocking. */
  onDownload?: () => void | Promise<void>;
}

type TabKey = 'career' | 'marriage' | 'wealth' | 'dasha';

const TABS: { key: TabKey; label: string; icon: typeof Briefcase }[] = [
  { key: 'career', label: 'Career Timings', icon: Briefcase },
  { key: 'marriage', label: 'Marriage Dynamics', icon: Heart },
  { key: 'wealth', label: 'Wealth Allocation', icon: Coins },
  { key: 'dasha', label: '10-Year Dasha Roadmap', icon: CalendarClock },
];

export default function KundaliView({
  freeTier,
  paidTier,
  userEmail,
  userName = 'User',
  onDownload,
}: KundaliViewProps) {
  const { language } = useLanguage();
  const { isPaid, markAsPaid } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('career');

  const ctaLabel =
    language === 'hi'
      ? 'पूरी 20-पेज रिपोर्ट अनलॉक करें और PDF डाउनलोड करें'
      : 'Unlock Full 20-Page Report & Download PDF';

  const unlockPrice = 49;

  const { corePersonality: cp, topCareers, wealthType, runningDashaName } = freeTier;

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
            {language === 'hi' ? 'निःशुल्क अंश' : 'Free Preview'}
          </span>
        </div>

        {/* Core personality header */}
        <h2 className="text-lg sm:text-xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
          {language === 'hi' ? 'आपका कोर व्यक्तित्व' : 'Your Core Personality'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-4">
          {cp.summary}
        </p>

        {/* Lagna / Moon / Sun / Nakshatra badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
          {[
            { icon: <ArrowUp className="w-4 h-4" />, label: language === 'hi' ? 'लग्न' : 'Ascendant', value: cp.ascendant },
            { icon: <Moon className="w-4 h-4" />, label: language === 'hi' ? 'चंद्र राशि' : 'Moon Sign', value: cp.moonSign },
            { icon: <Sun className="w-4 h-4" />, label: language === 'hi' ? 'सूर्य राशि' : 'Sun Sign', value: cp.sunSign },
            { icon: <Star className="w-4 h-4" />, label: language === 'hi' ? 'नक्षत्र' : 'Nakshatra', value: cp.nakshatra },
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
            {language === 'hi' ? 'शीर्ष 3 करियर' : 'Top 3 Careers'}
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
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{language === 'hi' ? 'धन प्रकार' : 'Wealth Type'}</p>
            <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5">{wealthType || '--'}</p>
          </div>
          <div className="rounded-xl p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
            <p className="text-[10px] sm:text-xs text-slate-400 dark:text-[#6B7280] uppercase tracking-wide">{language === 'hi' ? 'चल रही दशा' : 'Running Dasha'}</p>
            <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5">{runningDashaName || '--'}</p>
          </div>
        </div>
      </motion.div>

      {/* ─────────────── GATED TABBED PREVIEW CARDS ─────────────── */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
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
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          {/* Active tab content */}
          <div className={isPaid ? '' : 'blur-[6px] select-none pointer-events-none opacity-70'}>
            <TabPanel tab={activeTab} paidTier={paidTier} language={language} />
          </div>

          {/* Frosted-glass lock overlay + CTA (only when not paid) */}
          {!isPaid && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-md">
              <div className="text-center px-4 max-w-sm">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/20 mb-3">
                  <Lock className="w-6 h-6 text-violet-700 dark:text-[#FFD166]" />
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-3">
                  {language === 'hi' ? 'पूरी रिपोर्ट लॉक है' : 'This section is locked'}
                </h3>
                <div className="max-w-xs mx-auto">
                  <PaymentButton
                    amount={unlockPrice}
                    userEmail={userEmail || 'guest@astroveda.com'}
                    userName={userName}
                    paymentType="kundli_report"
                    buttonText={ctaLabel}
                    onSuccess={() => markAsPaid()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Download button (only when paid) */}
        {isPaid && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={() => onDownload?.()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              {language === 'hi' ? 'पूरी रिपोर्ट PDF डाउनलोड करें' : 'Download Full Report (PDF)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabPanel({
  tab,
  paidTier,
  language,
}: {
  tab: TabKey;
  paidTier: PaidTierData;
  language: 'en' | 'hi';
}) {
  if (tab === 'career') return <CareerPanel data={paidTier.careerTimings} language={language} />;
  if (tab === 'marriage') return <MarriagePanel data={paidTier.marriageDynamics} language={language} />;
  if (tab === 'wealth') return <WealthPanel data={paidTier.wealthAllocation} language={language} />;
  return <DashaPanel data={paidTier.dashaRoadmap} language={language} />;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm sm:text-base font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
      {children}
    </h3>
  );
}

function CareerPanel({ data, language }: { data: CareerTimings; language: 'en' | 'hi' }) {
  return (
    <div>
      <SectionTitle>{language === 'hi' ? 'करियर समय-रेखा' : 'Career Timings'}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{language === 'hi' ? 'अनुकूल अवधि' : 'Favorable Periods'}</p>
          <ul className="space-y-1.5">
            {(data.favorable || []).map((f, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">
                <span className="font-medium text-indigo-900 dark:text-[#F3F4F6]">{f.period}:</span> {f.note}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{language === 'hi' ? 'चुनौतीपूर्ण अवधि' : 'Challenging Periods'}</p>
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

function MarriagePanel({ data, language }: { data: MarriageDynamics; language: 'en' | 'hi' }) {
  return (
    <div>
      <SectionTitle>{language === 'hi' ? 'विवाह गतिशीलता' : 'Marriage Dynamics'}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">{language === 'hi' ? 'मज़बूती' : 'Strengths'}</p>
          <ul className="space-y-1.5">
            {(data.strengths || []).map((s, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{language === 'hi' ? 'चुनौतियाँ' : 'Challenges'}</p>
          <ul className="space-y-1.5">
            {(data.challenges || []).map((c, i) => (
              <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]">• {c}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-violet-700 dark:text-[#FFD166] mb-1">{language === 'hi' ? 'अनुकूल समय' : 'Favorable Timing'}</p>
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

function WealthPanel({ data, language }: { data: WealthAllocation; language: 'en' | 'hi' }) {
  return (
    <div>
      <SectionTitle>{language === 'hi' ? 'धन आवंटन' : 'Wealth Allocation'}</SectionTitle>
      <p className="text-sm text-slate-600 dark:text-[#9CA3AF] leading-relaxed mb-3">{data.overview}</p>
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

function DashaPanel({ data, language }: { data: DashaRoadmapEntry[]; language: 'en' | 'hi' }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-[#9CA3AF]">--</p>;
  }
  return (
    <div>
      <SectionTitle>{language === 'hi' ? '10-वर्षीय दशा रोडमैप' : '10-Year Dasha Roadmap'}</SectionTitle>
      <div className="space-y-2">
        {data.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-2.5 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 dark:from-[#FFD166] dark:to-[#E0A96D] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6]">{entry.lord} Mahadasha</p>
              <p className="text-[11px] text-slate-400 dark:text-[#6B7280]">{entry.startDate} → {entry.endDate}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#9CA3AF] text-right max-w-[40%] truncate">{entry.theme}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
