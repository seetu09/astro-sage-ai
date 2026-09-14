'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import PaymentButton from '@/app/components/PaymentButton';
import { useApp } from '@/app/context/AppContext';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import {
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
  /** The complete report content — rendered ONLY when isPaid === true. */
  children: React.ReactNode;
}

/**
 * ReportContainer — Payment-gated universal report shell.
 *
 * - Sticky TOP bar: localized title + language <select> (instant switch, no refresh).
 * - !isPaid → preview panel + Razorpay payment CTA (children NOT rendered).
 * -  isPaid → renders the full report (children). The download CTA lives inside
 *    the report children (KundaliView → KundliPdfButton) so only one download
 *    button appears on the result screen.
 */
export default function ReportContainer({
  title,
  userEmail,
  userName = 'User',
  price = 49,
  children,
}: ReportContainerProps) {
  const { isPaid, markAsPaid, selectedLanguage, setSelectedLanguage } = useApp();
  const { t } = useTranslation();

  return (
    <div className="relative">
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
              {t('kundali.sections.preview')}
            </span>
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#9CA3AF] leading-relaxed">
              {t('kundali.labels.birthDetails')} • {t('kundali.sections.kundliReport')}
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
              {t('kundali.sections.unlockFullReport')}
            </h3>
            <ul className="max-w-xs mx-auto space-y-2 mb-4 text-left">
              {[
                t('kundali.sections.lockedFeaturePlanets'),
                t('kundali.sections.lockedFeatureDosha'),
                t('kundali.sections.lockedFeatureRemedies'),
                t('kundali.sections.lockedFeatureMahadasha'),
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF]">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-[#6B7280] mb-4">
              {t('kundali.sections.unlockHint')}
            </p>

            <div className="max-w-sm mx-auto">
              <PaymentButton
                amount={price}
                userEmail={userEmail || 'guest@astroveda.com'}
                userName={userName}
                paymentType="kundli_report"
                buttonText={`${t('kundali.sections.pay')} ₹${price} — ${t('kundali.sections.unlockFullReport')}`}
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
        </>
      )}
    </div>
  );
}