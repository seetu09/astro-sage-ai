'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Calendar, Clock, Palette, Hash, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { zodiacSigns, getHoroscopeForSign } from '@/data/horoscope-data';
import RatingStars from '@/app/components/RatingStars';

export default function DailyHoroscopePage() {
  const { language, t } = useLanguage();
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  const horoscope = selectedSign ? getHoroscopeForSign(selectedSign) : null;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.horoscope.title}
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.horoscope.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 text-center">{t.horoscope.selectSign}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {zodiacSigns.map((sign) => (
              <motion.button
                key={sign.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSign(sign.id)}
                className={`astro-card p-4 text-center cursor-pointer transition-all ${selectedSign === sign.id ? 'ring-2 ring-[var(--accent)] bg-[var(--accent)]/5' : ''}`}
              >
                <div className="text-3xl mb-2">{sign.symbol}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{sign.name[language]}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{sign.dates[language]}</div>
                <div className="text-xs text-[var(--accent)] mt-1">{sign.element[language]}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {horoscope && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}>
              <div className="astro-card mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                  <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)]">{t.horoscope.reading}</h2>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-lg mb-8">{horoscope.prediction[language]}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-secondary)]">
                    <Hash className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">{t.horoscope.luckyNumber}</div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">{horoscope.luckyNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-secondary)]">
                    <Palette className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">{t.horoscope.luckyColor}</div>
                      <div className="text-lg font-bold text-[var(--text-primary)]">{horoscope.luckyColor[language]}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--bg-secondary)]">
                    <Clock className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">{t.horoscope.luckyTime}</div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{horoscope.luckyTime[language]}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--accent)]">{t.horoscope.mantra}</span>
                  </div>
                  <p className="text-[var(--text-primary)] font-medium text-lg">{horoscope.mantra[language]}</p>
                </div>
              </div>

              <div className="astro-card">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">{t.horoscope.rating}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { key: 'overall', label: t.horoscope.overall },
                    { key: 'career', label: t.horoscope.career },
                    { key: 'love', label: t.horoscope.love },
                    { key: 'health', label: t.horoscope.health },
                    { key: 'finance', label: t.horoscope.finance },
                  ].map((item) => (
                    <div key={item.key} className="text-center p-4 rounded-lg bg-[var(--bg-secondary)]">
                      <div className="text-sm text-[var(--text-muted)] mb-2">{item.label}</div>
                      <RatingStars rating={horoscope.rating[item.key as keyof typeof horoscope.rating]} />
                      <div className="text-2xl font-bold text-[var(--accent)] mt-2">{horoscope.rating[item.key as keyof typeof horoscope.rating]}/5</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedSign && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Star className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-muted)] text-lg">
              {language === 'en' ? 'Select your zodiac sign above to reveal your daily horoscope' : 'अपना दैनिक राशिफल प्रकट करने के लिए ऊपर अपनी राशि चुनें'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
