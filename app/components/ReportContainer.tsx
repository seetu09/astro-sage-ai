'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Globe, Lock, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import PaymentButton from '@/app/components/PaymentButton';
import { useApp } from '@/app/context/AppContext';
import {
  getUILabel,
  getPdfGeneratingLabel,
  LANGUAGE_DISPLAY_NAMES,
  SUPPORTED_LOCALES,
  LocaleCode,
} from '@/lib/astrologyDictionary';
import { trackEvent } from '@/lib/analytics';

interface ReportContainerProps {
  /** Localized report title shown in the sticky top bar. */
  title?: string;
  /** User email — required for the Razorpay checkout prefill. */
  userEmail: string;
  /** User name for the Razorpay checkout prefill. */
  userName?: string;
  /** Price in INR for unlocking the full report. */
  price?: number;
  /** Called when "Download Kundli (PDF)" is clicked (full-report mode only). May be async. */
  onDownload?: () => void | Promise<void>;
  /** Optional live progress (e.g. "2/5") shown on the download button while generating. */
  downloadProgress?: { current: number; total: number } | null;
  /** The complete report content — rendered ONLY when isPaid === true. */
  children: React.ReactNode;
}

/**
 * ReportContainer — Payment-gated universal report shell.
 *
 * - Sticky TOP bar: localized title + language <select> (instant switch, no refresh).
 * - !isPaid → preview panel + Razorpay payment CTA (children NOT rendered).
 * -  isPaid → renders the full report (children).
 * - Sticky BOTTOM bar: "Download Kundli (PDF)" action button.
 */
export default function ReportContainer({
  title,
  userEmail,
  userName = 'User',
  price = 49,
  onDownload,
  downloadProgress = null,
  children,
}: ReportContainerProps) {
  const { isPaid, markAsPaid, selectedLanguage, setSelectedLanguage } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const kundliReportLabel = getUILabel('kundliReport', selectedLanguage);
  const downloadPdfLabel = getUILabel('downloadPdf', selectedLanguage);
  const generatingLabel = getPdfGeneratingLabel(selectedLanguage);

  const handleDownload = async () => {
    if (!onDownload || isGenerating) return;
    trackEvent('download_pdf_clicked', { lang: selectedLanguage });
    setIsGenerating(true);
    try {
      await onDownload();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      {/* ------------------------- STICKY TOP ACTION BAR ------------------------- */}
      <div className="sticky top-14 sm:top-16 z-40 -mx-4 sm:-mx-4 lg:-mx-6 px-4 sm:px-4 lg:px-6 py-2.5 mb-4 bg-[#F8F7FC]/85 dark:bg-[#080811]/85 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <h2 className="text-sm sm:text-base font-serif font-semibold text-indigo-950 dark:text-[#F3F4F6] truncate flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-[#FFD166] shrink-0" />
            {title || kundliReportLabel}
          </h2>

          {/* Language select — triggers setSelectedLanguage; all labels re-render instantly */}
          <label className="flex items-center gap-1.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-[#6B7280]" />
            <span className="sr-only">Language</span>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                // AppContext.setSelectedLanguage → LanguageContext.setLanguage
                // Every consumer of useApp()/useLanguage() re-renders synchronously.
                setSelectedLanguage(e.target.value as LocaleCode);
              }}
              className="text-xs sm:text-sm font-medium rounded-lg border border-slate-300/70 dark:border-white/15 bg-white dark:bg-white/5 text-indigo-950 dark:text-[#F3F4F6] px-2 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              aria-label="Select language"
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {LANGUAGE_DISPLAY_NAMES[locale]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!isPaid ? (
        /* --------------------------- LOCKED PREVIEW VIEW --------------------------- */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pb-28"
        >
          {/* Preview strip — teases the report without exposing gated content */}
          <div className="glass-card rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium uppercase tracking-wide text-violet-700 dark:text-[#FFD166] bg-violet-100/60 dark:bg-[#FFD166]/10 border border-violet-200/60 dark:border-[#FFD166]/20 rounded-full px-2.5 py-1 mb-3">
              <Lock className="w-3 h-3" />
              {getUILabel('previewLabel', selectedLanguage)}
            </span>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              {getUILabel('birthDetails', selectedLanguage)} • {kundliReportLabel}
            </p>

            {/* Blur veil over the preview body */}
            <div className="mt-4 space-y-2 blur-[3px] select-none pointer-events-none opacity-60" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 rounded-full bg-slate-300/70 dark:bg-white/10" style={{ width: `${90 - i * 18}%` }} />
              ))}
            </div>
          </div>

          {/* Unlock / payment CTA card */}
          <div className="glass-card rounded-xl p-5 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/20 mb-3">
              <Lock className="w-6 h-6 text-violet-700 dark:text-[#FFD166]" />
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
              {getUILabel('unlockFullReport', selectedLanguage)}
            </h3>
            <ul className="max-w-xs mx-auto space-y-2 mb-4 text-left">
              {[
                getUILabel('lockedFeaturePlanets', selectedLanguage),
                getUILabel('lockedFeatureDosha', selectedLanguage),
                getUILabel('lockedFeatureRemedies', selectedLanguage),
                getUILabel('lockedFeatureMahadasha', selectedLanguage),
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#6B7280] mb-4">
              {getUILabel('unlockHint', selectedLanguage)}
            </p>

            <div className="max-w-sm mx-auto">
              <PaymentButton
                amount={price}
                userEmail={userEmail || 'guest@astroveda.com'}
                userName={userName}
                paymentType="kundli_report"
                buttonText={`Pay ₹${price} — ${getUILabel('unlockFullReport', selectedLanguage)}`}
                onSuccess={(details) => {
                  trackEvent('report_unlocked', { order_id: details.orderId });
                  // Post-payment handler → toggles isPaid = true globally & persists
                  markAsPaid(details);
                }}
              />
            </div>
          </div>
        </motion.div>
      ) : (
        /* ---------------------------- FULL REPORT VIEW ---------------------------- */
        <>
          {children}

          {/* ------------------------ STICKY BOTTOM ACTION BAR ------------------------ */}
          <div className="sticky bottom-0 z-40 -mx-4 sm:-mx-4 lg:-mx-6 px-4 sm:px-4 lg:px-6 py-2.5 mt-4 bg-[#F8F7FC]/85 dark:bg-[#080811]/85 backdrop-blur-md border-t border-slate-200/60 dark:border-white/10">
            <div className="max-w-4xl mx-auto flex justify-center">
              <button
                onClick={handleDownload}
                disabled={!onDownload || isGenerating}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    {generatingLabel}
                    {downloadProgress && (
                      <span className="text-xs opacity-80">
                        {downloadProgress.current}/{downloadProgress.total}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    {downloadPdfLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}