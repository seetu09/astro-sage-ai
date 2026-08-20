"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Moon, Flame, Sparkles, Activity } from "lucide-react";
import {
  checkDoshas,
  RASHI_NAMES,
  type BirthDetails,
  type DoshaCheckResult,
  type ManglikSeverity,
  type SadeSatiPhase,
} from "@/lib/dosha-checker";
import { useLanguage } from "@/app/context/LanguageContext";

const SEVERITY_STYLES: Record<ManglikSeverity, { badge: string; label: string }> = {
  none: { badge: "bg-green-500/10 text-green-500 border-green-500/20", label: "None" },
  mild: { badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Mild" },
  moderate: { badge: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Moderate" },
  severe: { badge: "bg-red-500/10 text-red-500 border-red-500/20", label: "Severe" },
};

const PHASE_STYLES: Record<SadeSatiPhase, { badge: string; label: string }> = {
  inactive: { badge: "bg-green-500/10 text-green-500 border-green-500/20", label: "Inactive" },
  rising: { badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Rising" },
  peak: { badge: "bg-red-500/10 text-red-500 border-red-500/20", label: "Peak" },
  setting: { badge: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Setting" },
};

interface FormState {
  name: string;
  moonSign: number;
  marsSign: number;
  ascendantSign: number;
}

const emptyForm: FormState = { name: "", moonSign: 1, marsSign: 1, ascendantSign: 1 };

export default function DoshaCheckerPage() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<DoshaCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const details: BirthDetails = {
        ...form,
        name: form.name || (language === 'hi' ? "आपका" : "Your"),
      };
      setResult(checkDoshas(details));
      setLoading(false);
    }, 800);
  };

  const renderSelect = (
    label: string,
    icon: React.ReactNode,
    value: number,
    onChange: (v: number) => void
  ) => (
    <div>
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      >
        {RASHI_NAMES.map((name, i) => (
          <option key={i} value={i + 1}>{i + 1}. {name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>{t.dosha.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.dosha.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.dosha.subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">{t.dosha.yourName}</label>
                  <input
                    type="text"
                    placeholder={t.dosha.namePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderSelect(
                    t.dosha.moonSign,
                    <Moon className="w-4 h-4 text-[var(--accent)]" />,
                    form.moonSign,
                    (v) => setForm({ ...form, moonSign: v })
                  )}
                  {renderSelect(
                    t.dosha.marsSign,
                    <Flame className="w-4 h-4 text-red-500" />,
                    form.marsSign,
                    (v) => setForm({ ...form, marsSign: v })
                  )}
                  {renderSelect(
                    t.dosha.ascendant,
                    <Activity className="w-4 h-4 text-blue-500" />,
                    form.ascendantSign,
                    (v) => setForm({ ...form, ascendantSign: v })
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Shield className="w-6 h-6" />
                    {loading ? t.dosha.analyzing : t.dosha.checkButton}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Overall Summary */}
              <div className={`bg-[var(--card-bg)] border rounded-2xl p-8 text-center ${
                result.overall.hasDosha ? "border-red-500/20" : "border-green-500/20"
              }`}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                  result.overall.hasDosha ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                }`}>
                  {result.overall.hasDosha ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {result.overall.hasDosha ? t.dosha.doshasDetected : t.dosha.noMajorDoshas}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                  {result.overall.hasDosha ? t.dosha.remediesAvailable : t.dosha.chartClear}
                </h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{result.overall.summary}</p>
                <button
                  onClick={() => setResult(null)}
                  className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
                >
                  {t.dosha.checkAnother}
                </button>
              </div>

              {/* Manglik Section */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    {t.dosha.manglikTitle}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[result.manglik.severity].badge}`}>
                    {SEVERITY_STYLES[result.manglik.severity].label.toUpperCase()}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] mb-4">{result.manglik.description}</p>

                {result.manglik.affectedHouses.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-[var(--text-muted)]">{t.dosha.affectedHouses}</span>
                    {result.manglik.affectedHouses.map((house) => (
                      <span key={house} className="px-2 py-1 text-xs font-bold bg-red-500/10 text-red-500 rounded-full">
                        {language === 'hi' ? `भाव ${house}` : `House ${house}`}
                      </span>
                    ))}
                  </div>
                )}

                {result.manglik.cancellations.length > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">{t.dosha.cancellationsApplied}</p>
                    {result.manglik.cancellations.map((c, i) => (
                      <p key={i} className="text-sm text-[var(--text-secondary)]">• {c}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                  <p className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.dosha.remedies}
                  </p>
                  <ul className="space-y-1.5">
                    {result.manglik.remedies.map((remedy, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--accent)] mt-0.5">•</span>
                        {remedy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sade Sati Section */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    {t.dosha.sadeSatiTitle}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${PHASE_STYLES[result.sadeSati.phase].badge}`}>
                    {PHASE_STYLES[result.sadeSati.phase].label.toUpperCase()}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] mb-6">{result.sadeSati.description}</p>

                {/* Phase Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {result.sadeSati.timeline.map((tItem, i) => (
                      <div key={tItem.phase} className="flex-1 text-center">
                        <div className={`text-xs font-semibold mb-1 ${tItem.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                          {tItem.label}
                        </div>
                        <div className={`h-2 rounded-full mx-1 ${tItem.active ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"}`} />
                        <div className="text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">{tItem.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                  <p className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.dosha.remedies}
                  </p>
                  <ul className="space-y-1.5">
                    {result.sadeSati.remedies.map((remedy, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--accent)] mt-0.5">•</span>
                        {remedy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}