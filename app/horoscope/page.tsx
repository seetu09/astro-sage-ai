"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Sparkles } from "lucide-react";

const SIGNS = [
  { id: "aries", name: "Aries", symbol: "♈", element: "Fire", dates: "Mar 21 - Apr 19" },
  { id: "taurus", name: "Taurus", symbol: "♉", element: "Earth", dates: "Apr 20 - May 20" },
  { id: "gemini", name: "Gemini", symbol: "♊", element: "Air", dates: "May 21 - Jun 20" },
  { id: "cancer", name: "Cancer", symbol: "♋", element: "Water", dates: "Jun 21 - Jul 22" },
  { id: "leo", name: "Leo", symbol: "♌", element: "Fire", dates: "Jul 23 - Aug 22" },
  { id: "virgo", name: "Virgo", symbol: "♍", element: "Earth", dates: "Aug 23 - Sep 22" },
  { id: "libra", name: "Libra", symbol: "♎", element: "Air", dates: "Sep 23 - Oct 22" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", element: "Water", dates: "Oct 23 - Nov 21" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire", dates: "Nov 22 - Dec 21" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", element: "Earth", dates: "Dec 22 - Jan 19" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", element: "Air", dates: "Jan 20 - Feb 18" },
  { id: "pisces", name: "Pisces", symbol: "♓", element: "Water", dates: "Feb 19 - Mar 20" },
];

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "text-orange-500",
  Earth: "text-green-500",
  Air: "text-blue-500",
  Water: "text-indigo-500",
};

export default function HoroscopePage() {
  const today = new Date().toLocaleDateString("en-US", {
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
            Daily Horoscope
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Select your zodiac sign to read today's Vedic astrology prediction with lucky attributes and category scores.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {SIGNS.map((sign, index) => (
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
                <div className="font-semibold text-[var(--text-primary)]">{sign.name}</div>
                <div className={`text-xs mt-1 ${ELEMENT_COLORS[sign.element]}`}>{sign.element}</div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">{sign.dates}</div>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent)]">
                  <Sparkles className="w-3 h-3" />
                  Read Today
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
            <h3 className="font-bold text-[var(--text-primary)] mb-2">✨ Personalized Guidance</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Our AI Guru analyzes planetary positions to give you specific daily advice for career, love, money, and health.
            </p>
          </div>
          <div className="astro-card">
            <h3 className="font-bold text-[var(--text-primary)] mb-2">🆓 100% Free</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Check your lucky color, number, and time every day without any subscription.
            </p>
          </div>
          <div className="astro-card">
            <h3 className="font-bold text-[var(--text-primary)] mb-2">🕉️ Vedic Wisdom</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Traditional Indian astrology principles meet modern AI technology for accurate guidance.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}