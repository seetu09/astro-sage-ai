"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Hash, Clock, Briefcase, Heart, Wallet, Activity, Sparkles, ArrowLeft } from "lucide-react";

type Period = "yesterday" | "today" | "tomorrow";

interface HoroscopeData {
  sign: string;
  period: Period;
  date: string;
  prediction: string;
  lucky: {
    color: string;
    number: number;
    time: string;
  };
  scores: {
    career: number;
    love: number;
    money: number;
    health: number;
  };
  insights: {
    career: string;
    love: string;
    money: string;
    health: string;
  };
}

const SIGN_META: Record<string, { name: string; symbol: string }> = {
  aries: { name: "Aries", symbol: "♈" },
  taurus: { name: "Taurus", symbol: "♉" },
  gemini: { name: "Gemini", symbol: "♊" },
  cancer: { name: "Cancer", symbol: "♋" },
  leo: { name: "Leo", symbol: "♌" },
  virgo: { name: "Virgo", symbol: "♍" },
  libra: { name: "Libra", symbol: "♎" },
  scorpio: { name: "Scorpio", symbol: "♏" },
  sagittarius: { name: "Sagittarius", symbol: "♐" },
  capricorn: { name: "Capricorn", symbol: "♑" },
  aquarius: { name: "Aquarius", symbol: "♒" },
  pisces: { name: "Pisces", symbol: "♓" },
};

const PERIODS: { id: Period; label: string }[] = [
  { id: "yesterday", label: "Yesterday" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
];

const SCORE_CATEGORIES = [
  { key: "career", label: "Career", icon: Briefcase, color: "text-blue-500", bar: "bg-blue-500" },
  { key: "love", label: "Love", icon: Heart, color: "text-pink-500", bar: "bg-pink-500" },
  { key: "money", label: "Money", icon: Wallet, color: "text-green-500", bar: "bg-green-500" },
  { key: "health", label: "Health", icon: Activity, color: "text-orange-500", bar: "bg-orange-500" },
] as const;

export default function HoroscopeSignPage() {
  const params = useParams();
  const sign = (params.sign as string)?.toLowerCase() || "aries";
  const [period, setPeriod] = useState<Period>("today");
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);

  const meta = SIGN_META[sign] || { name: "Aries", symbol: "♈" };

  useEffect(() => {
    setLoading(true);
    const fetchHoroscope = async () => {
      try {
        const res = await fetch(`/api/horoscope?sign=${sign}&period=${period}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Fallback handled by API
      } finally {
        setLoading(false);
      }
    };
    fetchHoroscope();
  }, [sign, period]);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/horoscope"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            All Signs
          </Link>

          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{meta.symbol}</div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-2">
              {meta.name} Horoscope
            </h1>
            <p className="text-[var(--text-secondary)]">
              Daily Vedic astrology guidance for {meta.name}
            </p>
          </div>

          {/* Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                    period === p.id
                      ? "bg-[var(--accent)] text-white shadow"
                      : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="astro-card h-48 shimmer" />
              <div className="astro-card h-64 shimmer" />
            </motion.div>
          ) : data ? (
            <motion.div
              key={`${sign}-${period}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Prediction */}
              <div className="astro-card">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                  <h2 className="text-xl font-bold font-serif text-[var(--text-primary)]">
                    {PERIODS.find((p) => p.id === data.period)?.label} Prediction
                  </h2>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                  {data.prediction}
                </p>
              </div>

              {/* Lucky Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="astro-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Lucky Color</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">{data.lucky.color}</div>
                  </div>
                </div>
                <div className="astro-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Lucky Number</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">{data.lucky.number}</div>
                  </div>
                </div>
                <div className="astro-card flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--text-muted)]">Lucky Time</div>
                    <div className="text-sm font-bold text-[var(--text-primary)]">{data.lucky.time}</div>
                  </div>
                </div>
              </div>

              {/* Category Scores */}
              <div className="astro-card">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">
                  Category Scores
                </h3>
                <div className="space-y-5">
                  {SCORE_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const score = data.scores[cat.key];
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${cat.color}`} />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{cat.label}</span>
                          </div>
                          <span className="text-sm font-bold text-[var(--text-primary)]">{score}/5</span>
                        </div>
                        <div className="h-2.5 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${cat.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(score / 5) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5">{data.insights[cat.key]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-[var(--text-muted)] text-lg">Unable to load horoscope. Please try again.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}