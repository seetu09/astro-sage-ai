"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { zodiacSigns } from "@/data/horoscope-data";

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "text-orange-500",
  Earth: "text-green-500",
  Air: "text-blue-500",
  Water: "text-indigo-500",
};

export default function HoroscopePage() {
  const { language, t } = useLanguage();
  const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.horoscopePage.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.horoscopePage.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {zodiacSigns.map((sign, index) => (
            <motion.div
              key={sign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/horoscope/${sign.id}`}
                className="astro-card p-4 text-center cursor-pointer block transition-all hover:scale-105"
              >
                <div className="text-4xl mb-2">{sign.symbol}</div>
                <div className="font-semibold text-[var(--text-primary)]">{sign.name[language]}</div>
                <div className={`text-xs mt-1 ${ELEMENT_COLORS[sign.element.en] || ""}`}>{sign.element[language]}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">{sign.dates[language]}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent)]">
                  <Sparkles className="w-3 h-3" />
                  {t.horoscopePage.readToday}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <div className="astro-card">
            <h3 className="font-bold text-[var(--text-primary)] mb-2">{t.horoscopePage.personalizedTitle}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t.horoscopePage.personalizedText}
            </p>
          </div>
          <div className="astro-card">
            <h3 className="font-bold text-[var(--text-primary)] mb-2">{t.horoscopePage.freeTitle}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t.horoscopePage.freeText}
            </p>
          </div>
          <div className="astro-card">
            <h3 className="font-bold text-[var(--text-primary)] mb-2">{t.horoscopePage.vedicTitle}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {t.horoscopePage.vedicText}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}