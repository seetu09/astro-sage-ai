'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Star, Circle, Triangle, Square } from 'lucide-react';
import Link from 'next/link';

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
          className="astro-card relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text */}
            <div className="p-4 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 mb-4">
                <Star className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-xs font-medium text-[var(--accent)]">
                  {language === 'en' ? 'Kundali Generator' : 'कुंडली जनरेटर'}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                {title}
              </h2>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                {subtitle}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  language === 'en' ? 'Planetary positions (Graha Sthiti)' : 'ग्रहों की स्थिति (ग्रह स्थिति)',
                  language === 'en' ? 'Dasha & Antardasha periods' : 'दशा और अंतर्दशा काल',
                  language === 'en' ? 'Auspicious yogas & doshas' : 'शुभ योग और दोष',
                  language === 'en' ? 'PDF download & share' : 'PDF डाउनलोड और साझा करें',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/kundali"
                className="astro-button inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {cta}
              </Link>
              <p className="text-xs text-[var(--text-muted)] mt-3">{hint}</p>
            </div>

            {/* Right: Blurred Preview */}
            <div className="relative p-4 md:p-8">
              <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-primary)] border border-[var(--border)] p-6">
                {/* Decorative chart grid */}
                <div className="grid grid-cols-3 gap-2 opacity-30 blur-sm">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center"
                    >
                      {i % 3 === 0 && <Star className="w-4 h-4 text-[var(--accent)]" />}
                      {i % 3 === 1 && <Circle className="w-4 h-4 text-[var(--accent)]" />}
                      {i % 3 === 2 && <Triangle className="w-4 h-4 text-[var(--accent)]" />}
                    </div>
                  ))}
                </div>

                {/* Center overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--bg-primary)]/60 backdrop-blur-[2px]">
                  <div className="w-14 h-14 rounded-full bg-[var(--accent)]/20 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                    {language === 'en' ? 'Preview Mode' : 'पूर्वावलोकन मोड'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {language === 'en' ? 'Generate to unlock full chart' : 'पूर्ण चार्ट अनलॉक करने के लिए जनरेट करें'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
