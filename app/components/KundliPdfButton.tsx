'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import LanguageSelectModal, { type PdfLanguage } from './LanguageSelectModal';
import { generateReportHtml, type ReportData, type ReportNarrative } from '@/lib/pdfHtmlTemplate';
import { NAKSHATRA_LORDS, NAKSHATRA_NAMES } from '@/lib/astrologyDictionary';
import type { KundaliHistoryEntry } from '@/types/user';
import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import { useToast } from '@/app/components/ToastProvider';
import { trackEvent } from '@/lib/analytics';

interface KundliPdfButtonProps {
  userName?: string;
  /** Ready-made report payload (kundali result page path). */
  reportData?: ReportData | null;
  /** AI Life-Pillar narratives when already fetched — appended as PDF appendix pages. */
  pillars?: ReportNarrative[];
  /** Rich slices from `/api/kundali/generate` — passed to the PDF template. */
  chartData?: any;
  calculations?: any;
  freeTier?: any;
  paidTier?: any;
  /**
   * Dashboard mode: rebuild the full report server-side from stored birth
   * details (`POST /api/kundali/generate`) before rendering the PDF. Requires
   * latitude/longitude on the entry (present for all newly saved charts).
   */
  historyEntry?: KundaliHistoryEntry;
  /** Override the CTA copy; defaults to "Download Full 25-Page Kundli". */
  label?: string;
  /** Compact styling for dashboard history cards. */
  compact?: boolean;
}

interface ResolvedPayload {
  reportData: ReportData;
  pillars?: ReportNarrative[];
  /** Rich slices from the full `/api/kundali/generate` response — passed to the
   *  PDF template for the complete data-driven layout. */
  chartData?: any;
  calculations?: any;
  freeTier?: any;
  paidTier?: any;
}

const DEFAULT_LABEL_KEY = 'kundali.sections.downloadFullKundli';

/** Strip a bilingual sign value like "Aquarius (कुंभ)" down to its first part. */
function cleanAstroValue(value: unknown): string {
  return String(value ?? '').replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/** Localized calendar weekday (Vara) from an ISO date — timezone-safe via UTC. */
function weekdayLabel(dateStr: string | undefined, locale: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const names =
    locale === 'hi'
      ? ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return names[d.getUTCDay()] ?? '';
}

/**
 * Rebuild the complete localized report from a dashboard history entry:
 * 1. POST /api/kundali/generate   → deterministic chart + tiers (+ AI reading)
 * 2. POST /api/kundali/narratives → six AI Life-Pillar narratives (best-effort)
 * then map both onto the shared `ReportData` template contract.
 */
async function resolvePayload(
  reportData: ReportData | null | undefined,
  pillars: ReportNarrative[] | undefined,
  entry: KundaliHistoryEntry | undefined,
  language: PdfLanguage
): Promise<ResolvedPayload> {
  if (reportData) return { reportData, pillars };
  if (!entry) throw new Error('NO_SOURCE');

  const generateRes = await fetch('/api/kundali/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: entry.dateOfBirth,
      birthTime: entry.timeOfBirth,
      birthPlace: entry.placeOfBirth,
      latitude: entry.latitude ?? null,
      longitude: entry.longitude ?? null,
      timezoneOffset: entry.timezoneOffset || '+05:30',
      language,
    }),
  });
  if (!generateRes.ok) throw new Error('GENERATE_FAILED');
  const result = await generateRes.json();

  // The single-shot generation endpoint already returns the six AI Life-Pillar
  // narratives — reuse them and skip the extra /api/kundali/narratives round
  // trip entirely. (The separate narratives endpoint stays for legacy callers.)
  let aiPillars = pillars;
  if (Array.isArray(result?.pillars) && result.pillars.length === 6) {
    aiPillars = result.pillars as ReportNarrative[];
  } else {
    try {
      const narrativeRes = await fetch('/api/kundali/narratives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: result, language }),
      });
      if (narrativeRes.ok) {
        const narrativeJson = await narrativeRes.json();
        if (Array.isArray(narrativeJson?.pillars) && narrativeJson.pillars.length === 6) {
          aiPillars = narrativeJson.pillars as ReportNarrative[];
        }
      }
    } catch {
      // Narratives are optional garnish — never block the download.
    }
  }

  return {
    reportData: mapGenerateResultToReportData(result, entry, aiPillars, language),
    pillars: aiPillars,
    chartData: result?.chartData,
    calculations: result?.calculations,
    freeTier: result?.freeTier,
    paidTier: result?.paidTier,
  };
}

/** Map `/api/kundali/generate`'s response onto the A4 template contract. */
function mapGenerateResultToReportData(
  result: Record<string, any>,
  entry: KundaliHistoryEntry,
  aiPillars?: ReportNarrative[],
  language: string = 'en'
): ReportData {
  const chart = result?.chartData ?? {};
  const paid = result?.paidTier ?? {};
  const lifeDomains = paid.lifeDomains ?? {};

  return {
    clientName: entry.name || 'User',
    chartType: 'North Indian',
    birthDetails: {
      date: entry.dateOfBirth || '',
      time: entry.timeOfBirth || '',
      latitude: entry.latitude != null ? Number(entry.latitude).toFixed(2) : '',
      longitude: entry.longitude != null ? Number(entry.longitude).toFixed(2) : '',
      timezone: entry.timezoneOffset || '+05:30',
    },
    planetaryPositions: (Array.isArray(chart.planets) ? chart.planets : []).map((p: Record<string, unknown>) => ({
      body: String(p?.name ?? ''),
      sign: cleanAstroValue(p?.sign),
      degree:
        typeof p?.degree === 'number'
          ? (p.degree as number).toFixed(2)
          : String(p?.degree ?? ''),
      house: String(p?.house ?? ''),
      retro: Boolean(p?.retrograde),
    })),
    houseCusps: (Array.isArray(chart.houses) ? chart.houses : []).map((h: Record<string, unknown>, i: number) => ({
      house: Number(h?.house ?? i + 1),
      sign: cleanAstroValue(h?.sign),
      degree: '',
    })),
    dashaPeriods: (Array.isArray(paid.dashaRoadmap) ? paid.dashaRoadmap : []).map((d: Record<string, string>) => ({
      mahaDasha: String(d.lord ?? ''),
      startYear: String(d.startDate ?? '').split('-')[0] || '',
      endYear: String(d.endDate ?? '').split('-')[0] || '',
      subPeriod: d.theme || '',
    })),
    yogas: (Array.isArray(paid.yogas) ? paid.yogas : [])
      .filter((y: Record<string, unknown>) => y?.presence !== false)
      .map((y: Record<string, string>) => ({
        name: String(y.name ?? ''),
        description: String(y.description ?? y.impact ?? ''),
      })),
    remedies: [
      ...(Array.isArray(paid.remedies) ? paid.remedies : []).map((r: Record<string, string>) => ({
        category: String(r.type ?? ''),
        description: String(r.description ?? ''),
      })),
      // Rich AI remedy kit — exactly four daily mantras, then a gemstone digest.
      ...(Array.isArray(paid.remedyKit?.dailyMantras)
        ? (paid.remedyKit.dailyMantras as unknown[]).map((m) => ({
            category: language === 'hi' ? 'दैनिक मंत्र' : 'Daily Mantra',
            description: String(m ?? ''),
          }))
        : []),
      ...(Array.isArray(paid.remedyKit?.gemstones) && paid.remedyKit.gemstones.length
        ? [{
            category: language === 'hi' ? 'रत्न सुझाव' : 'Gemstone Suggestion',
            description: (paid.remedyKit.gemstones as unknown[]).map(String).join(' · '),
          }]
        : []),
    ],
    domainInsights: (['career', 'marriage', 'wealth', 'health'] as const)
      .filter((key) => lifeDomains?.[key])
      .map((key) => {
        const insight = lifeDomains[key] as Record<string, any>;
        const milestones = Array.isArray(insight.milestones) ? insight.milestones : [];
        return {
          domain: key,
          // Rich ~250/200-word AI paragraph when present, else the short overview.
          prediction: insight.narrative || insight.overview || '',
          analysis:
            milestones
              .map((m: Record<string, unknown>) => `${m.period}: ${m.event}`)
              .join(' • ') || (insight.recommendations ?? []).join('. '),
          timeframe: milestones[0]?.period,
        };
      }),
    northIndianChartSvg: '',
    kalpurushaPhalDeepikaRefs: [],
    scorecard: [],
    // Dense-layout extras — Panchang strip, D9 matrix and Ashtakavarga grid
    // (all optional; the template skips missing blocks gracefully).
    panchang: {
      varaWeekday: weekdayLabel(entry.dateOfBirth, language),
      nakshatra: cleanAstroValue(chart.nakshatra),
      nakshatraLord: (() => {
        const idx = NAKSHATRA_NAMES.en.indexOf(cleanAstroValue(chart.nakshatra));
        return idx >= 0 ? NAKSHATRA_LORDS[idx] ?? '' : '';
      })(),
      moonSign: cleanAstroValue(chart.rashi || chart.moonSign),
      sunSign: cleanAstroValue(chart.sunSign),
      lagna: cleanAstroValue(
        chart.lagna ||
          chart.ascendant ||
          (Array.isArray(chart.houses) ? chart.houses[0]?.sign : '')
      ),
    },
    d9Chart: (() => {
      const d9 = result?.calculations?.divisionalCharts?.D9;
      if (!d9) return undefined;
      return {
        ascendantSign: Number(d9.ascendantSign) || 1,
        planets: (Array.isArray(d9.planetCoordinates) ? d9.planetCoordinates : []).map(
          (p: Record<string, unknown>) => ({
            planet: String(p?.planet ?? ''),
            sign: Number(p?.sign) || 1,
            house: Number(p?.house) || 1,
            retrograde: Boolean(p?.retrograde),
          })
        ),
      };
    })(),
    sarvashtakavarga: (() => {
      const sav = result?.calculations?.ashtakavarga;
      if (!Array.isArray(sav?.sarvashtakavarga) || !sav.sarvashtakavarga.length) return undefined;
      return {
        bindus: sav.sarvashtakavarga.map(Number),
        beneficialHouses: (Array.isArray(sav.beneficialHouses) ? sav.beneficialHouses : []).map(Number),
      };
    })(),
    isPaidTier: true,
    ...(aiPillars ? { narratives: aiPillars } : {}),
    doshas: (Array.isArray(paid.doshas) ? paid.doshas : []).map((d: Record<string, unknown>) => ({
      name: String(d.name ?? ''),
      description: String(d.description ?? ''),
      severity: (['low', 'moderate', 'high'].includes(String(d.severity)) ? String(d.severity) : 'moderate') as 'low' | 'moderate' | 'high',
      isNeutralized: Boolean(d.isNeutralized),
    })),
  };
}

/**
 * Fallback `@media print` trigger — renders the same A4 template in a hidden
 * iframe and fires window.print(). Zero server cost, instant, and works even
 * when the serverless PDF function is cold or unavailable.
 */
function printReportHtml(html: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.zIndex = '-1';
  iframe.setAttribute('aria-hidden', 'true');

  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || (iframe.contentWindow as Window | null)?.document;
  if (!doc) return;

  doc.open();
  doc.write(html);
  doc.close();

  // Give the hidden document a beat to lay out + fetch web fonts, then hand
  // off to the browser print dialog. The template's `@media print` CSS takes
  // over pagination (hard A4 page breaks per .page-container).
  iframe.onload = () => {
    setTimeout(() => {
      const pageCount = (html.match(/class="page"/g) || []).length;
      console.log(`[Print Fallback] Rendering ${pageCount} pages via window.print()`);
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => iframe.parentNode?.removeChild(iframe), 1000);
      }
    }, 800);
  };
}

/** Stream the server-rendered PDF back to the user as a file download. */
async function downloadServerPdf(payload: {
  reportData: ReportData;
  pillars?: ReportNarrative[];
  chartData?: any;
  calculations?: any;
  freeTier?: any;
  paidTier?: any;
  language: PdfLanguage;
  /** Server-verified signed payment token (required by /api/kundali/pdf). */
  paymentToken: string;
  /** Optional filename stem override (falls back to the client name). */
  fileName?: string;
}): Promise<void> {
  const res = await fetch('/api/kundali/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportData: payload.reportData,
      pillars: payload.pillars,
      chartData: payload.chartData,
      calculations: payload.calculations,
      freeTier: payload.freeTier,
      paidTier: payload.paidTier,
      language: payload.language,
      paymentToken: payload.paymentToken,
      fileName: payload.fileName || payload.reportData.clientName,
    }),
  });
  if (!res.ok) throw new Error(`PDF_SERVICE_${res.status}`);

  const blob = await res.blob();
  if (!blob || blob.size === 0) throw new Error('EMPTY_PDF');

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${(payload.reportData.clientName || 'kundli')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')}-kundli-${payload.language}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * KundliPdfButton — "Download Full 25-Page Kundli" CTA.
 *
 * Flow:
 *   click → LanguageSelectModal (English / हिंदी)
 *         → [dashboard mode] rebuild report from stored birth details
 *         → POST /api/kundali/pdf (serverless Chromium render, streamed back)
 *         → on ANY server failure → automatic client-side iframe window.print()
 *           fallback driven by the same A4 template's `@media print` CSS.
 *   …or the user picks "Print instantly" for the zero-server path up front.
 */
export default function KundliPdfButton({
  userName,
  reportData,
  pillars,
  chartData,
  calculations,
  freeTier,
  paidTier,
  historyEntry,
  label,
  compact = false,
}: KundliPdfButtonProps) {
  const { unlockToken } = useApp();
  const toast = useToast();
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'rebuilding' | 'rendering'>('idle');
  const [error, setError] = useState('');
  // Guard against double-clicks racing two downloads for the same entry.
  const inFlight = useRef(false);

  const busy = phase !== 'idle';

  const runFlow = useCallback(
    async (language: PdfLanguage, mode: 'download' | 'print') => {
      if (inFlight.current) return;
      inFlight.current = true;
      setError('');

      try {
        if (!unlockToken) {
          setError(t('kundali.sections.pdfDownloadLocked'));
          return;
        }

        let payload: ResolvedPayload | null =
          reportData ? { reportData, pillars, chartData, calculations, freeTier, paidTier } : null;

        if (!payload) {
          setPhase('rebuilding');
          payload = await resolvePayload(null, pillars, historyEntry, language);
        }

if (mode === 'print') {
          trackEvent('kundali_pdf_print_fallback', { lang: language, source: 'manual' });
          const pageCount = generateReportHtml(payload.reportData, language).match(/class="page"/g)?.length || 0;
          console.log(`[KundliPdfButton] Print fallback: ${pageCount} pages, ${payload.reportData.domainInsights?.length || 0} domains, ${payload.pillars?.length || 0} narratives.`);
          printReportHtml(generateReportHtml(payload.reportData, language));
          setModalOpen(false);
          return;
        }

        setPhase('rendering');
        trackEvent('kundli_pdf_server_started', {
          lang: language,
          has_pillars: !!payload.pillars?.length,
          source: reportData ? 'page' : 'history',
        });
        try {
          await downloadServerPdf({
            ...payload,
            language,
            paymentToken: unlockToken,
            fileName: userName || payload.reportData.clientName,
          });
          trackEvent('kundli_pdf_server_success', { lang: language });
          setModalOpen(false);
          toast.success(t('kundali.sections.pdfDownloadSuccess'));
        } catch (err) {
          const code = err instanceof Error ? err.message : 'UNKNOWN';
          if (code === 'PDF_SERVICE_402' || code === 'PDF_SERVICE_401' || code === 'PDF_SERVICE_403') {
            // Server refused the payment — never fall back to the client-side
            // print leak; surface the lock and ask for payment instead.
            trackEvent('kundli_pdf_paywall_blocked', { lang: language });
            const paywallMsg = t('kundali.sections.pdfReportLocked');
            setError(paywallMsg);
            toast.error(paywallMsg);
          } else {
            // Any other server failure → zero-cost client fallback.
            trackEvent('kundli_pdf_server_failed', { lang: language });
            printReportHtml(generateReportHtml(payload.reportData, language));
            setModalOpen(false);
            toast.error(t('kundali.sections.pdfServerFailed'));
          }
        }
      } catch (err) {
        const code = err instanceof Error ? err.message : 'UNKNOWN';
        if (code === 'NO_SOURCE') {
          setError(t('kundali.sections.pdfNothingToExport'));
        } else if (code === 'GENERATE_FAILED') {
          setError(t('kundali.sections.pdfRebuildFailed'));
        } else {
          setError(t('kundali.sections.pdfExportFailed'));
        }
      } finally {
        setPhase('idle');
        inFlight.current = false;
      }
    },
    [reportData, pillars, chartData, calculations, freeTier, paidTier, historyEntry, unlockToken, toast, t]
  );

  const displayLabel = label || t(DEFAULT_LABEL_KEY);
  const busyMessage =
    phase === 'rebuilding'
      ? t('kundali.sections.pdfRebuilding')
      : t('kundali.sections.pdfRendering');

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError('');
          setModalOpen(true);
        }}
        disabled={busy}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 rounded-lg border border-amber-300/70 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-500 hover:bg-amber-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-[#FFD166] dark:hover:bg-white/10'
            : 'flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all disabled:opacity-60 disabled:cursor-not-allowed'
        }
        aria-label={`${displayLabel} — ${t('kundali.sections.chooseLanguage')}`}
      >
        {busy ? (
          <Loader2 className={compact ? 'h-3.5 w-3.5 animate-spin' : 'h-4 w-4 sm:h-5 sm:w-5 animate-spin'} />
        ) : (
          <Download className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4 sm:h-5 sm:w-5'} />
        )}
        {displayLabel}
      </button>

      <LanguageSelectModal
        isOpen={modalOpen}
        isBusy={busy}
        busyMessage={busyMessage}
        errorMessage={error}
        onSelect={(language) => void runFlow(language, 'download')}
        onPrintInstantly={(language) => void runFlow(language, 'print')}
        onClose={() => {
          if (!busy) {
            setModalOpen(false);
            setError('');
          }
        }}
      />
    </>
  );
}


