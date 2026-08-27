'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Sparkles, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import {
  calculateJulianDay,
  parseTimezoneOffset,
  calculateAscendant,
  getSiderealLongitude,
  longitudeToSign,
  signNumberToName,
} from '@/lib/astrology';
import type { YogaItem, PaidTierData, DashaRoadmapEntry, RichPredictionReport } from '@/types/kundali';

/** Raw birth details — same shape the /api/kundali/generate route consumes. */
export interface PreviewBirthData {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM
  latitude: number;
  longitude: number;
  timezoneOffset: string; // e.g. "+05:30"
}

interface PreviewProps {
  /** Required birth details — drives the client-side Lagna/Moon/Sun computation. */
  birthData: PreviewBirthData;
  /** Running Mahadasha entry derived from the generated chart (optional). */
  dasha?: DashaRoadmapEntry | null;
  /** Paid tier from the generate API — supplies yogas + domain narratives. */
  paidTier?: PaidTierData;
  /** Rich AI narratives; preferred over lifeDomains.overview for teasers. */
  richPredictions?: RichPredictionReport;
  /** Hide the internal headline (used when the host page renders its own). */
  showHeader?: boolean;
}

const DOMAIN_KEYS = ['career', 'marriage', 'health'] as const;

/** Strip a bilingual "(कुंभ)" suffix, returning the English-only value. */
function stripHindiSuffix(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

/** First N characters of a narrative, word-safe, for locked teaser copy. */
function teaserText(narrative: string, max = 50): string {
  const clean = narrative.trim();
  if (!clean) return '';
  const slice = clean.slice(0, max);
  return slice.length < clean.length ? `${slice.trimEnd()}…` : slice;
}

/**
 * Sidereal Lahiri positions for Lagna / Moon / Sun computed purely on the
 * client from the raw birth data. Bilingual suffixes are stripped so values
 * are ready for localization.
 */
function useChartPoints(birthData: PreviewBirthData) {
  return useMemo(() => {
    try {
      const [year, month, day] = birthData.dateOfBirth.split('-').map(Number);
      const [hour, minute] = birthData.timeOfBirth.split(':').map(Number);
      if ([year, month, day].some((n) => !Number.isFinite(n))) {
        throw new Error('invalid date');
      }
      const jd = calculateJulianDay(
        year,
        month,
        day,
        Number.isFinite(hour) ? hour : 12,
        Number.isFinite(minute) ? minute : 0,
        parseTimezoneOffset(birthData.timezoneOffset)
      );
      const asc = calculateAscendant(jd, birthData.latitude, birthData.longitude);
      const moonLong = getSiderealLongitude(jd, 'Moon');
      const sunLong = getSiderealLongitude(jd, 'Sun');
      return {
        lagna: signNumberToName(asc.sign),
        moonSign: signNumberToName(longitudeToSign(moonLong)),
        sunSign: signNumberToName(longitudeToSign(sunLong)),
      };
    } catch {
      return { lagna: '', moonSign: '', sunSign: '' };
    }
  }, [birthData]);
}

/**
 * Fetches the deterministic chart from /api/kundali/generate and returns up
 * to three confirmed yogas from its paidTier payload.
 */
function useYogas(birthData: PreviewBirthData) {
  const [yogas, setYogas] = React.useState<YogaItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchKey = [
    birthData.dateOfBirth,
    birthData.timeOfBirth,
    birthData.latitude,
    birthData.longitude,
    birthData.timezoneOffset,
  ].join('|');

  React.useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/kundali/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            birthDate: birthData.dateOfBirth,
            birthTime: birthData.timeOfBirth,
            birthPlace: '',
            latitude: birthData.latitude,
            longitude: birthData.longitude,
            timezoneOffset: birthData.timezoneOffset || '+05:30',
            language: 'en',
          }),
        });
        if (!res.ok) throw new Error(`generate failed: ${res.status}`);
        const json = await res.json();
        const items: YogaItem[] = Array.isArray(json?.paidTier?.yogas)
          ? json.paidTier.yogas
          : [];
        setYogas(items.filter((y) => y && y.presence !== false).slice(0, 3));
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') setYogas([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  return { yogas, isLoading };
}

/** Locked-teaser copy for one life domain (rich narrative > overview). */
function useDomainTeaser(
  domain: (typeof DOMAIN_KEYS)[number],
  paidTier?: PaidTierData,
  richPredictions?: RichPredictionReport
): string {
  return React.useMemo(() => {
    if (domain === 'health') {
      return teaserText(
        stripHindiSuffix(richPredictions?.health?.narrative || paidTier?.lifeDomains?.health?.overview || '')
      );
    }
    const narrative =
      domain === 'career'
        ? richPredictions?.career?.narrative
        : richPredictions?.marriage?.narrative;
    const overview = paidTier?.lifeDomains?.[domain]?.overview;
    return teaserText(stripHindiSuffix(narrative || overview || ''));
  }, [domain, paidTier, richPredictions]);
}

/* ------------------------------------------------------------------ */
/* Presentational building blocks                                     */
/* ------------------------------------------------------------------ */

/** Shared glassy card wrapper used by every preview section. */
function Card({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      {title && (
        <h2 className="text-base sm:text-lg font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] flex items-center gap-2 mb-3">
          {icon}
          <span className="truncate">{title}</span>
        </h2>
      )}
      {children}
    </div>
  );
}

/** One labelled chart-point cell inside the Basic Details grid. */
function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-2.5 sm:p-3 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 text-center">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-[#6B7280] truncate">
        {label}
      </p>
      <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6] mt-0.5 truncate">
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview                                                            */
/* ------------------------------------------------------------------ */

export default function Preview({
  birthData,
  dasha,
  paidTier,
  richPredictions,
  showHeader = true,
}: PreviewProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // 1) Real chart points computed in-browser from the passed birth data.
  const chart = useChartPoints(birthData);
  // 2) Yogas fetched from /api/kundali/generate (up to 3).
  const { yogas, isLoading: yogasLoading } = useYogas(birthData);
  // Teaser copies (first 50 chars of each narrative).
  const careerTeaser = useDomainTeaser('career', paidTier, richPredictions);
  const marriageTeaser = useDomainTeaser('marriage', paidTier, richPredictions);
  const healthTeaser = useDomainTeaser('health', paidTier, richPredictions);
  const domainTeasers: Record<(typeof DOMAIN_KEYS)[number], string> = {
    career: careerTeaser,
    marriage: marriageTeaser,
    health: healthTeaser,
  };

  const handleUnlockClick = () => router.push('/payment');

  return (
    <div className="space-y-4 sm:space-y-6" aria-label="Kundali preview">
      {/* ── Header ── */}
      {showHeader && (
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
          {t('preview.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] px-2">
          A glimpse into your birth chart — unlock the full report below.
        </p>
      </div>
      )}

      {/* ── Section 1: Basic Details (Lagna / Moon / Sun) ── */}
      <Card
        icon={
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
        }
        title="Basic Details"
      >
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <DetailCell label={t('preview.lagna')} value={chart.lagna || '--'} />
          <DetailCell label={t('preview.moonSign')} value={chart.moonSign || '--'} />
          <DetailCell label={t('preview.sunSign')} value={chart.sunSign || '--'} />
        </div>
      </Card>

      {/* ── Section 2: Current Dasha ── */}
      <Card
        icon={
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
        }
        title={t('preview.currentDasha')}
      >
        {dasha ? (
        <div className="rounded-xl p-3 sm:p-4 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm sm:text-base font-semibold text-indigo-950 dark:text-[#F3F4F6]">
              {stripHindiSuffix(dasha.lord) || '--'} Mahadasha
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] mt-0.5">
              {dasha.theme || 'Current planetary period'}
            </p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-violet-100/70 dark:bg-violet-500/10 text-violet-700 dark:text-[#FFD166] whitespace-nowrap">
            {dasha.startDate} – {dasha.endDate}
          </span>
        </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
            Dasha details available in the full report.
          </p>
        )}
      </Card>

      {/* ── Section 3: 3 Yogas (placeholder) ── */}
      <Card
        icon={
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
        }
        title={t('preview.yogas')}
      >
        {yogasLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-500 dark:text-[#9CA3AF]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs sm:text-sm">Reading your chart…</span>
          </div>
        ) : yogas.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
            No major yogas detected in your chart.
          </p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
          {yogas.map((yoga) => (
            <div
              key={yoga.name}
              className="rounded-xl p-3 sm:p-4 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10"
            >
              <p className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6]">
                {stripHindiSuffix(yoga.name) || 'Planetary Yoga'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF] mt-1 leading-relaxed">
                {yoga.description || yoga.impact || ''}
              </p>
            </div>
          ))}
          </div>
        )}
      </Card>

      {/* ── Section 4: Domain teasers (placeholder, locked) ── */}
      <Card
        icon={
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-[#FFD166] shrink-0" />
        }
        title="Detailed Insights"
      >
        <div className="space-y-4 sm:space-y-5">
          {DOMAIN_KEYS.map((domain) => (
            <div
              key={domain}
              className="rounded-xl p-3 sm:p-4 bg-slate-50/60 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10"
            >
              <h3 className="text-sm font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-2 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-[#6B7280]" />
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </h3>
              <div className="relative rounded-md overflow-hidden">
                <div className="blur-[6px] select-none pointer-events-none text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
                  {domainTeasers[domain] || t(`preview.teaser.${domain}`)}
                </div>
                <div className="absolute inset-0 bg-white/45 dark:bg-[#080811]/55 backdrop-blur-[2px] flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-[#9CA3AF]" />
                  <span className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF]">
                    Locked
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Unlock CTA ── */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={handleUnlockClick}
          className="inline-flex items-center justify-center gap-2 w-full max-w-lg mx-auto sm:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-[0.98] transition-all text-white text-sm sm:text-base font-semibold shadow-lg shadow-violet-600/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {t('preview.unlockButton')}
        </button>
        <p className="mt-3 text-[11px] text-slate-400 dark:text-[#6B7280]">
          Secure payment · Instant unlock
        </p>
      </div>
    </div>
  );
}


