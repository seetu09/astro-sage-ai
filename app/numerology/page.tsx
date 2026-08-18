"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hash,
  Sparkles,
  Sun,
  Moon,
  Star,
  Gem,
  Calendar,
  RefreshCcw,
  Heart,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  calculateNumerology,
  ALL_NUMBERS,
  type NumerologyProfile,
} from "@/lib/numerology";

interface FormState {
  name: string;
  day: string;
  month: string;
  year: string;
}

const emptyForm: FormState = { name: "", day: "", month: "", year: "" };

const CURRENT_YEAR = new Date().getFullYear();

function validateForm(form: FormState): string | null {
  if (!form.name.trim()) return "Please enter your full name.";
  const day = parseInt(form.day);
  const month = parseInt(form.month);
  const year = parseInt(form.year);
  if (!day || day < 1 || day > 31) return "Please enter a valid day (1-31).";
  if (!month || month < 1 || month > 12) return "Please enter a valid month (1-12).";
  if (!year || year < 1900 || year > CURRENT_YEAR) return `Please enter a valid year (1900-${CURRENT_YEAR}).`;
  if (month === 2 && day > 29) return "February has at most 29 days.";
  if ([4, 6, 9, 11].includes(month) && day > 30) return "This month has at most 30 days.";
  return null;
}

function NumberCard({
  title,
  subtitle,
  info,
  icon,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  info: NumerologyProfile["moolank"];
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">{subtitle}</p>
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            {icon}
            {title}
          </h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-2xl font-bold text-white">{info.number}</span>
        </div>
      </div>

      <p className="text-sm text-[var(--accent)] font-semibold mb-3">{info.planet}</p>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{info.personality}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
          <p className="font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Strengths
          </p>
          <ul className="space-y-0.5">
            {info.positiveTraits.slice(0, 3).map((t) => (
              <li key={t} className="text-[var(--text-secondary)] text-xs">• {t}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="font-semibold text-red-500 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Watch Out
          </p>
          <ul className="space-y-0.5">
            {info.negativeTraits.slice(0, 3).map((t) => (
              <li key={t} className="text-[var(--text-secondary)] text-xs">• {t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
        <p className="text-xs font-semibold text-[var(--accent)] mb-1 flex items-center gap-1">
          <Gem className="w-3.5 h-3.5" /> Lucky Gemstone
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{info.gemstone}</p>
      </div>
    </motion.div>
  );
}

export default function NumerologyPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NumerologyProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const profile = calculateNumerology({
        name: form.name,
        day: parseInt(form.day),
        month: parseInt(form.month),
        year: parseInt(form.year),
      });
      setResult(profile);
      setLoading(false);
    }, 800);
  };

  const handleReset = () => {
    setForm(emptyForm);
    setResult(null);
    setError(null);
  };

  const inputClass =
    "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Hash className="w-4 h-4" />
            <span>Vedic Numerology Calculator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            Numerology
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Discover your Moolank, Bhagyank, and Namank — the sacred numbers revealed by your name and birth date.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 max-w-2xl mx-auto"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">
                    Full Name (as per birth certificate)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--accent)]" />
                    Date of Birth
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        type="number"
                        placeholder="DD"
                        min={1}
                        max={31}
                        value={form.day}
                        onChange={(e) => setForm({ ...form, day: e.target.value })}
                        className={inputClass}
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1 text-center">Day</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="MM"
                        min={1}
                        max={12}
                        value={form.month}
                        onChange={(e) => setForm({ ...form, month: e.target.value })}
                        className={inputClass}
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1 text-center">Month</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="YYYY"
                        min={1900}
                        max={CURRENT_YEAR}
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                        className={inputClass}
                      />
                      <p className="text-xs text-[var(--text-muted)] mt-1 text-center">Year</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Sparkles className="w-6 h-6" />
                    {loading ? "Calculating..." : "Calculate My Numbers"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : result ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Summary Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-[var(--accent)]/20 rounded-2xl p-8 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-4">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Numerology Profile
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                  {result.name}
                </h2>
                <p className="text-[var(--text-muted)] mb-6">Born on {result.dob}</p>

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm mb-6">
                  <span className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    🍀 Lucky Day: <span className="font-semibold text-[var(--text-primary)]">{result.luckyDay}</span>
                  </span>
                  <span className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    🎨 Lucky Colors: <span className="font-semibold text-[var(--text-primary)]">{result.luckyColor}</span>
                  </span>
                  <span className="px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    🔢 Lucky Number: <span className="font-semibold text-[var(--text-primary)]">{result.luckyNumber}</span>
                  </span>
                </div>

                <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[var(--card-bg)]/50 border border-[var(--border-color)]">
                  <p className="text-sm font-semibold text-[var(--accent)] mb-2">Number Compatibility</p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    {ALL_NUMBERS.map((n) => {
                      let style = "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]";
                      if (result.friendlyNumbers.includes(n)) style = "bg-green-500/10 text-green-500 border border-green-500/20";
                      else if (result.challengingNumbers.includes(n)) style = "bg-red-500/10 text-red-500 border border-red-500/20";
                      else if (result.neutralNumbers.includes(n)) style = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
                      return (
                        <span key={n} className={`px-3 py-1.5 rounded-full font-semibold ${style}`}>
                          {n}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Friendly</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Neutral</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Challenging</span>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors flex items-center gap-2 mx-auto"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Calculate Another
                </button>
              </motion.div>

              {/* Number Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NumberCard
                  title="Bhagyank"
                  subtitle="Destiny Number"
                  info={result.bhagyank}
                  icon={<Star className="w-4 h-4 text-[var(--accent)]" />}
                  delay={0.1}
                />
                <NumberCard
                  title="Moolank"
                  subtitle="Birth / Driver Number"
                  info={result.moolank}
                  icon={<Sun className="w-4 h-4 text-amber-500" />}
                  delay={0.2}
                />
                <NumberCard
                  title="Namank"
                  subtitle="Name Number"
                  info={result.namank}
                  icon={<Moon className="w-4 h-4 text-indigo-500" />}
                  delay={0.3}
                />
                {/* Career card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">Career Paths</p>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-500" />
                        Ideal Professions
                      </h3>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Based on your Bhagyank {result.bhagyank.number}, the following career fields align with your cosmic blueprint:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.bhagyank.careerMatches.map((career) => (
                      <span key={career} className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full">
                        {career}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                    <p className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Best Love Compatibility
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.bhagyank.bestCompatibility.map((n) => (
                        <span key={n} className="px-3 py-1 text-xs font-bold bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg">
                          Number {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Remedies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                  Personalized Remedies & Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 flex items-start gap-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[var(--text-secondary)]">{rec}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}