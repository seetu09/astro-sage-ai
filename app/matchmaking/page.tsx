"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Sparkles, Shield, AlertTriangle, CheckCircle2, Settings2 } from "lucide-react";
import {
  calculateAshtakoot,
  RASHI_NAMES,
  NAKSHATRA_NAMES,
  type PersonDetails,
  type MatchResult,
} from "@/lib/ashtakoot";
import { deriveMoonDetails } from "@/lib/astrology";
import PlaceAutocomplete from "@/app/components/PlaceAutocomplete";
import { useLanguage } from "@/app/context/LanguageContext";

const STATUS_COLORS: Record<string, string> = {
  excellent: "bg-green-500/10 text-green-500 border-green-500/20",
  good: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  average: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  poor: "bg-red-500/10 text-red-500 border-red-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  none: "bg-green-500/10 text-green-500",
  mild: "bg-yellow-500/10 text-yellow-500",
  moderate: "bg-orange-500/10 text-orange-500",
  severe: "bg-red-500/10 text-red-500",
};

interface PersonForm {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  timeUnknown: boolean;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  rashi: number;
  nakshatra: number;
  pada: number;
}

const emptyPerson: PersonForm = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  timeUnknown: false,
  placeOfBirth: "",
  latitude: null,
  longitude: null,
  rashi: 1,
  nakshatra: 1,
  pada: 1,
};

const inputClass =
  "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

export default function MatchmakingPage() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [male, setMale] = useState<PersonForm>(emptyPerson);
  const [female, setFemale] = useState<PersonForm>(emptyPerson);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate calculation delay for UX
    setTimeout(() => {
      const buildDetails = (p: PersonForm): PersonDetails => {
        const moon = showAdvanced
          ? { rashi: p.rashi, nakshatra: p.nakshatra, pada: p.pada }
          : deriveMoonDetails(p.dateOfBirth, p.timeOfBirth, p.timeUnknown);
        return {
          name: p.name || (language === "hi" ? "लड़का" : "Boy"),
          ...moon,
        };
      };

      const maleDetails = buildDetails(male);
      const femaleDetails = buildDetails(female);
      const matchResult = calculateAshtakoot(maleDetails, femaleDetails);
      setResult(matchResult);
      setLoading(false);
      setActiveTab("results");
    }, 800);
  };

  const renderPersonForm = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    data: PersonForm,
    setData: (d: PersonForm) => void
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>

      <input
        type="text"
        placeholder={t.matchmaking.namePlaceholder}
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className={inputClass}
      />

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.dateOfBirth}</label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
          className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.timeOfBirth}</label>
        <input
          type="time"
          value={data.timeOfBirth}
          onChange={(e) => setData({ ...data, timeOfBirth: e.target.value })}
          disabled={data.timeUnknown}
          className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50`}
        />
        <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={data.timeUnknown}
            onChange={(e) => setData({ ...data, timeUnknown: e.target.checked })}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          {t.matchmaking.timeUnknown}
        </label>
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.placeOfBirth}</label>
        <PlaceAutocomplete
          value={data.placeOfBirth}
          onChange={(v) => setData({ ...data, placeOfBirth: v })}
          onSelect={(place) =>
            setData({ ...data, placeOfBirth: place.placeName, latitude: place.latitude, longitude: place.longitude })
          }
          onClear={() => setData({ ...data, latitude: null, longitude: null })}
          latitude={data.latitude}
          longitude={data.longitude}
          onLatitudeChange={(v) => setData({ ...data, latitude: v })}
          onLongitudeChange={(v) => setData({ ...data, longitude: v })}
          placeholder={t.matchmaking.placePlaceholder}
          inputClassName={inputClass}
        />
      </div>

      {showAdvanced && (
        <div className="space-y-4 border-t border-[var(--border-color)] pt-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.moonSign}</label>
            <select
              value={data.rashi}
              onChange={(e) => setData({ ...data, rashi: parseInt(e.target.value) })}
              className={inputClass}
            >
              {RASHI_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{i + 1}. {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.nakshatra}</label>
            <select
              value={data.nakshatra}
              onChange={(e) => setData({ ...data, nakshatra: parseInt(e.target.value) })}
              className={inputClass}
            >
              {NAKSHATRA_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{i + 1}. {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.pada}</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setData({ ...data, pada: p })}
                  className={`py-2 rounded-lg border text-sm font-semibold transition-all ${
                    data.pada === p
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getVerdict = (points: number): string => {
    if (points >= 28) return t.matchmaking.excellent;
    if (points >= 22) return t.matchmaking.good;
    if (points >= 16) return t.matchmaking.average;
    return t.matchmaking.challenging;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>{t.matchmaking.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.matchmaking.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.matchmaking.subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {renderPersonForm(
                    t.matchmaking.boyDetails,
                    <User className="w-5 h-5 text-blue-400" />,
                    "bg-blue-500/20",
                    male,
                    setMale
                  )}
                  {renderPersonForm(
                    t.matchmaking.girlDetails,
                    <User className="w-5 h-5 text-pink-400" />,
                    "bg-pink-500/20",
                    female,
                    setFemale
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      showAdvanced
                        ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    {showAdvanced ? t.matchmaking.advancedHide : t.matchmaking.advancedToggle}
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Heart className="w-6 h-6" />
                    {loading ? t.matchmaking.calculating : t.matchmaking.checkCompatibility}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            result && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Score Gauge */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle cx="88" cy="88" r="72" stroke="var(--border-color)" strokeWidth="10" fill="none" />
                      <circle
                        cx="88" cy="88" r="72"
                        stroke={result.percentage >= 75 ? "#22c55e" : result.percentage >= 55 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="10" fill="none"
                        strokeDasharray={`${(result.totalPoints / 36) * 452} 452`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-[var(--text-primary)]">{result.totalPoints}</span>
                      <span className="text-sm text-[var(--text-muted)]">{t.matchmaking.gunas}</span>
                      <span className="text-xs text-[var(--accent)] mt-1">{result.percentage}%</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{getVerdict(result.totalPoints)}</h2>
                  <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{result.compatibilitySummary}</p>
                  <button
                    onClick={() => setActiveTab("form")}
                    className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    {t.matchmaking.checkAnother}
                  </button>
                </div>

                {/* Koota Breakdown */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {t.matchmaking.breakdown}
                  </h3>
                  <div className="space-y-3">
                    {result.kootas.map((koota) => (
                      <div key={koota.id} className="flex items-center gap-4 p-3 bg-[var(--hover-bg)] rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--text-primary)]">{koota.name}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[koota.status]}`}>
                              {koota.status}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">{koota.description}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${koota.points === koota.maxPoints ? "text-green-400" : koota.points === 0 ? "text-red-400" : "text-amber-400"}`}>
                            {koota.points}
                          </span>
                          <span className="text-[var(--text-muted)]">/{koota.maxPoints}</span>
                        </div>
                        <div className="w-24 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${koota.points === koota.maxPoints ? "bg-green-500" : koota.points === 0 ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${(koota.points / koota.maxPoints) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doshas */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    {t.matchmaking.doshaAnalysis}
                  </h3>
                  <div className="space-y-4">
                    {result.doshas.map((dosha, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${dosha.present ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {dosha.present ? (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            <span className="font-semibold text-[var(--text-primary)]">{dosha.name}</span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${SEVERITY_COLORS[dosha.severity]}`}>
                            {dosha.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">{dosha.description}</p>
                        <p className="text-sm text-[var(--accent)]">
                          <span className="font-semibold">{t.matchmaking.remedy}</span>{dosha.remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}