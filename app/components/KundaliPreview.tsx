'use client';

import { useTranslation } from '@/app/lib/i18n/useTranslation';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import KundaliChart from './KundaliChart';

export default function KundaliPreview() {
  const { t } = useTranslation();

  const title = t('preview.kundaliAwaitsTitle');
  const subtitle = t('preview.kundaliAwaitsSubtitle');
  const cta = t('preview.kundaliAwaitsCta');
  const hint = t('preview.kundaliAwaitsHint');

  return (
    <section className="w-full py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div className="p-4 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-[#FFD166]/10 border border-amber-200/60 dark:border-[#FFD166]/20 mb-4">
                <Star className="w-3 h-3 text-amber-700 dark:text-[#FFD166]" />
                <span className="text-xs font-medium text-amber-700 dark:text-[#FFD166]">
                  {t('preview.kundaliAwaitsBadge')}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-900 dark:text-[#F3F4F6] mb-4">
                {title}
              </h2>
              <p className="text-amber-800/70 dark:text-[#9CA3AF] mb-6 leading-relaxed">
                {subtitle}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  t('preview.kundaliAwaitsFeaturePlanets'),
                  t('preview.kundaliAwaitsFeatureDasha'),
                  t('preview.kundaliAwaitsFeatureYogas'),
                  t('preview.kundaliAwaitsFeaturePdf'),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-amber-800/70 dark:text-[#9CA3AF]">
                    <div className="w-5 h-5 rounded-full bg-amber-50 dark:bg-[#FFD166]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-amber-700 dark:text-[#FFD166]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/kundali"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {cta}
              </Link>
              <p className="text-xs text-amber-700/60 dark:text-[#6B7280] mt-3">{hint}</p>
            </div>

            {/* Right: Interactive Kundali Chart */}
            <div className="relative p-4 md:p-8">
              <KundaliChart />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}