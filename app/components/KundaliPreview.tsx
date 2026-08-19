'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import KundaliChart from './KundaliChart';

export default function KundaliPreview() {
  const { language } = useLanguage();

  const title = language === 'en' ? 'Your Kundali Awaits' : 'आपकी कुंडली इंतज़ार कर रही है';
  const subtitle =
    language === 'en'
      ? 'Discover your planetary positions, dasha periods, and auspicious yogas.'
      : 'अपनी ग्रहों की स्थिति, दशा काल और शुभ योगों की खोज करें।';
  const cta = language === 'en' ? 'Generate Your Full Kundali' : 'अपनी पूरी कुंडली बनाएं';
  const hint = language === 'en' ? 'Free • Takes 30 seconds' : 'मुफ्त • 30 सेकंड लगते हैं';

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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-[#FFD166]/10 border border-violet-200/60 dark:border-[#FFD166]/20 mb-4">
                <Star className="w-3 h-3 text-violet-700 dark:text-[#FFD166]" />
                <span className="text-xs font-medium text-violet-700 dark:text-[#FFD166]">
                  {language === 'en' ? 'Kundali Generator' : 'कुंडली जनरेटर'}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-4">
                {title}
              </h2>
              <p className="text-slate-500 dark:text-[#9CA3AF] mb-6 leading-relaxed">
                {subtitle}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  language === 'en' ? 'Planetary positions (Graha Sthiti)' : 'ग्रहों की स्थिति (ग्रह स्थिति)',
                  language === 'en' ? 'Dasha & Antardasha periods' : 'दशा और अंतर्दशा काल',
                  language === 'en' ? 'Auspicious yogas & doshas' : 'शुभ योग और दोष',
                  language === 'en' ? 'PDF download & share' : 'PDF डाउनलोड और साझा करें',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-500 dark:text-[#9CA3AF]">
                    <div className="w-5 h-5 rounded-full bg-violet-50 dark:bg-[#FFD166]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-violet-700 dark:text-[#FFD166]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/kundali"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {cta}
              </Link>
              <p className="text-xs text-slate-400 dark:text-[#6B7280] mt-3">{hint}</p>
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