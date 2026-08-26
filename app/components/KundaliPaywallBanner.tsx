'use client';

import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import PaymentButton from '@/app/components/PaymentButton';
import { useApp } from '@/app/context/AppContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { getUILabel, type LocaleCode } from '@/lib/astrologyDictionary';
import { trackEvent } from '@/lib/analytics';

interface KundaliPaywallBannerProps {
  /** User email — Razorpay checkout prefill. */
  userEmail: string;
  /** User name for the Razorpay checkout prefill. */
  userName?: string;
  /** One-time unlock price in INR (default ₹49). */
  price?: number;
}

/**
 * KundaliPaywallBanner — prominent upsell shown to FREE users on the kundali
 * page ("Unlock Full 20+ Page Premium Kundli Report"). On a successful
 * Razorpay payment the server-verified details are handed to markAsPaid(),
 * flipping the global isPaid flag so every locked section unlocks instantly.
 */
export default function KundaliPaywallBanner({
  userEmail,
  userName = 'User',
  price = 49,
}: KundaliPaywallBannerProps) {
  const { language } = useLanguage();
  const hi = language === 'hi';
  const locale: LocaleCode = hi ? 'hi' : 'en';
  const { markAsPaid } = useApp();

  const features = [
    getUILabel('lockedFeaturePlanets', locale),
    getUILabel('lockedFeatureDosha', locale),
    getUILabel('lockedFeatureRemedies', locale),
    getUILabel('lockedFeatureMahadasha', locale),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label={
        hi ? 'प्रीमियम कुंडली रिपोर्ट अनलॉक' : 'Unlock premium kundli report'
      }
      className="relative overflow-hidden rounded-2xl p-[1.5px] bg-gradient-to-r from-violet-500/60 via-indigo-500/40 to-amber-400/60 dark:from-[#FFD166]/50 dark:via-white/10 dark:to-[#E0A96D]/50 shadow-sunlit-soft"
    >
      <div className="rounded-2xl bg-white/85 dark:bg-[#0B0B18]/90 backdrop-blur-md p-5 sm:p-7 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-[#FFD166]/20 dark:to-[#E0A96D]/20 mb-3">
          <Lock className="w-6 h-6 text-violet-700 dark:text-[#FFD166]" />
        </div>

        <h3 className="text-lg sm:text-xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-2">
          {hi
            ? 'पूरी 20+ पेज प्रीमियम कुंडली रिपोर्ट अनलॉक करें'
            : 'Unlock Full 20+ Page Premium Kundli Report'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#9CA3AF] max-w-md mx-auto mb-4">
          {hi
            ? 'कैरियर समय-रेखा, विवाह विश्लेषण, धन आवंटन, दशा रोडमैप, योग-दोष और उपाय — सब कुछ एक ही विस्तृत रिपोर्ट में।'
            : 'Career timings, marriage dynamics, wealth allocation, dasha roadmap, yogas, doshas and remedies — everything in one detailed report.'}
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-w-lg mx-auto mb-5 text-left">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-[#9CA3AF]"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="max-w-sm mx-auto">
          <PaymentButton
            amount={price}
            userEmail={userEmail || 'guest@astroveda.com'}
            userName={userName}
            paymentType="kundli_report"
            buttonText={
              hi
                ? `₹${price} का भुगतान करें — पूरी रिपोर्ट अनलॉक करें`
                : `Pay ₹${price} — Unlock Full Report`
            }
            onSuccess={(details) => {
              trackEvent('premium_kundli_unlocked', { order_id: details.orderId });
              // Server-verified payment → flips global isPaid & persists token
              markAsPaid(details);
            }}
          />
        </div>

        <p className="mt-3 text-[11px] text-slate-400 dark:text-[#6B7280]">
          {hi
            ? 'एक बार भुगतान • तुरंत अनलॉक • PDF डाउनलोड शामिल'
            : 'One-time payment • Instant unlock • PDF download included'}
        </p>
      </div>
    </motion.section>
  );
}