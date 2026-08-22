"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Sparkles, RotateCcw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

// ─── Zodiac Data ────────────────────────────────────────────────────────────
interface SignInfo {
  name: string;
  symbol: string;
  element: "fire" | "earth" | "air" | "water";
  modality: "cardinal" | "fixed" | "mutable";
  start: [number, number]; // [month, day]
  end: [number, number];   // [month, day]
}

// Western zodiac date ranges
const SIGNS: SignInfo[] = [
  { name: "Aries", symbol: "♈", element: "fire", modality: "cardinal", start: [3, 21], end: [4, 19] },
  { name: "Taurus", symbol: "♉", element: "earth", modality: "fixed", start: [4, 20], end: [5, 20] },
  { name: "Gemini", symbol: "♊", element: "air", modality: "mutable", start: [5, 21], end: [6, 20] },
  { name: "Cancer", symbol: "♋", element: "water", modality: "cardinal", start: [6, 21], end: [7, 22] },
  { name: "Leo", symbol: "♌", element: "fire", modality: "fixed", start: [7, 23], end: [8, 22] },
  { name: "Virgo", symbol: "♍", element: "earth", modality: "mutable", start: [8, 23], end: [9, 22] },
  { name: "Libra", symbol: "♎", element: "air", modality: "cardinal", start: [9, 23], end: [10, 22] },
  { name: "Scorpio", symbol: "♏", element: "water", modality: "fixed", start: [10, 23], end: [11, 21] },
  { name: "Sagittarius", symbol: "♐", element: "fire", modality: "mutable", start: [11, 22], end: [12, 21] },
  { name: "Capricorn", symbol: "♑", element: "earth", modality: "cardinal", start: [12, 22], end: [1, 19] },
  { name: "Aquarius", symbol: "♒", element: "air", modality: "fixed", start: [1, 20], end: [2, 18] },
  { name: "Pisces", symbol: "♓", element: "water", modality: "mutable", start: [2, 19], end: [3, 20] },
];

const SIGN_HI_NAMES = [
  "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या",
  "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन",
];

// Element compatibility matrix (0–1 normalized score)
const ELEMENT_COMPAT: Record<string, Record<string, number>> = {
  fire: { fire: 0.68, earth: 0.72, air: 0.86, water: 0.74 },
  earth: { fire: 0.72, earth: 0.66, air: 0.7, water: 0.88 },
  air: { fire: 0.86, earth: 0.7, air: 0.68, water: 0.78 },
  water: { fire: 0.74, earth: 0.88, air: 0.78, water: 0.66 },
};

// Modality affinity bonus
const MODALITY_COMPAT: Record<string, Record<string, number>> = {
  cardinal: { cardinal: 0.7, fixed: 0.82, mutable: 0.76 },
  fixed: { cardinal: 0.82, fixed: 0.7, mutable: 0.78 },
  mutable: { cardinal: 0.76, fixed: 0.78, mutable: 0.72 },
};

function getSignFromDate(dateStr: string): number | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  for (let i = 0; i < SIGNS.length; i++) {
    const { start, end } = SIGNS[i];
    // Handle Capricorn crossing year boundary
    if (start[0] > end[0]) {
      if ((m === start[0] && d >= start[1]) || m < end[0] || (m === end[0] && d <= end[1])) return i;
    } else if ((m === start[0] && d >= start[1]) || (m === end[0] && d <= end[1]) || (m > start[0] && m < end[0])) {
      return i;
    }
  }
  return null;
}

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

// ─── Sub-Bar Data ────────────────────────────────────────────────────────────
interface SubBar { key: string; label: string; value: number; color: string; icon: string }

const inputClass =
  "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

interface PartnerForm {
  name: string;
  birthDate: string;
  sign: number | null; // 0-11
}

const emptyPartner: PartnerForm = { name: "", birthDate: "", sign: null };

export default function LoveMeter() {
  const { language, t } = useLanguage();
  const [partner1, setPartner1] = useState<PartnerForm>(emptyPartner);
  const [partner2, setPartner2] = useState<PartnerForm>(emptyPartner);
  const [score, setScore] = useState<{ overall: number; emotional: number; communication: number; physical: number; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signNames = useMemo(
    () => (language === "hi" ? SIGN_HI_NAMES : SIGNS.map((s) => s.name)),
    [language]
  );

  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<PartnerForm>>, date: string) => {
    const sign = getSignFromDate(date);
    console.log("date", date, "sign", sign);
    setter((prev) => ({ ...prev, birthDate: date, sign }));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const s1 = partner1.sign;
    const s2 = partner2.sign;
    if (s1 === null || s2 === null) {
      setError(language === "hi" ? "कृपया दोनों की राशि या जन्म तिथि चुनें।" : "Please select a zodiac sign or birth date for both partners.");
      return;
    }

    setLoading(true);
    // Simulate calculation delay for UX
    setTimeout(() => {
      const sign1 = SIGNS[s1];
      const sign2 = SIGNS[s2];

      const elemScore = ELEMENT_COMPAT[sign1.element][sign2.element];
      const modScore = MODALITY_COMPAT[sign1.modality][sign2.modality];

      // Deterministic name-based jitter (0.9–1.1) so repeated pairs stay stable yet personalized
      const seed = (hashName(partner1.name || "A") + hashName(partner2.name || "B")) % 100;
      const jitter = 0.9 + (seed % 20) / 100;

      const emotionalRaw = (elemScore * 0.6 + modScore * 0.4) * jitter;
      const communicationRaw = (elemScore * 0.5 + modScore * 0.5) * (0.95 + ((seed >> 3) % 10) / 100);
      const physicalRaw = (elemScore * 0.45 + modScore * 0.55 + 0.08) * (0.92 + ((seed >> 5) % 14) / 100);

      const clamp = (v: number) => Math.min(96, Math.max(32, Math.round(v * 100)));
      const emotional = clamp(emotionalRaw);
      const communication = clamp(communicationRaw);
      const physical = clamp(physicalRaw);
      const overall = Math.round(emotional * 0.4 + communication * 0.35 + physical * 0.25);

      // One-line summary from ranges
      let summary: string;
      if (language === "hi") {
        if (overall >= 88) summary = "उच्च जोश और गहरी निष्ठा";
        else if (overall >= 78) summary = "प्रबल भावनात्मक बंधन और विश्वास";
        else if (overall >= 68) summary = "प्रभावशाली संचार और निष्ठा";
        else if (overall >= 58) summary = "गहरी आपसी समझ की देन";
        else if (overall >= 48) summary = "रोमांच और चुनौती का मिश्रण";
        else summary = "धैर्य से मजबूती की ओर";
      } else {
        if (overall >= 88) summary = "High Passion & Deep Loyalty";
        else if (overall >= 78) summary = "Strong Emotional Bond & Trust";
        else if (overall >= 68) summary = "Powerful Communication & Devotion";
        else if (overall >= 58) summary = "A Gift of Deep Mutual Understanding";
        else if (overall >= 48) summary = "A Mix of Thrill & Challenge";
        else summary = "Steady Growth Through Patience";
      }

      setScore({ overall, emotional, communication, physical, summary });
      setLoading(false);
    }, 900);
  };

  const handleReset = () => {
    setPartner1(emptyPartner);
    setPartner2(emptyPartner);
    setScore(null);
    setError(null);
  };

  const renderPartnerForm = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    data: PartnerForm,
    setData: React.Dispatch<React.SetStateAction<PartnerForm>>
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
        placeholder={t.loveMeter.namePlaceholder}
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className={inputClass}
      />

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.loveMeter.birthDate}</label>
        <input
          type="date"
          value={data.birthDate}
          onChange={(e) => handleDateChange(setData, e.target.value)}
          className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.loveMeter.zodiacSign}</label>
        <select
          value={data.sign ?? ""}
          onChange={(e) => setData({ ...data, sign: e.target.value === "" ? null : parseInt(e.target.value) })}
          className={inputClass}
        >
          <option value="">{t.loveMeter.selectSign}</option>
          {SIGNS.map((s, i) => (
            <option key={s.name} value={i}>
              {s.symbol} {signNames[i]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const gaugeColor =
    score && score.overall >= 75 ? "#22c55e" : score && score.overall >= 55 ? "#f59e0b" : "#ef4444";

  const subBars: SubBar[] = score
    ? [
        { key: "emotional", label: t.loveMeter.emotionalHarmony, value: score.emotional, color: "#ec4899", icon: "💗" },
        { key: "communication", label: t.loveMeter.communicationSynergy, value: score.communication, color: "#8b5cf6", icon: "💬" },
        { key: "physical", label: t.loveMeter.physicalSpark, value: score.physical, color: "#f97316", icon: "✨" },
      ]
    : [];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>{t.loveMeter.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.loveMeter.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.loveMeter.subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {score === null ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8"
            >
              <form onSubmit={handleCalculate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {renderPartnerForm(
                    t.loveMeter.partnerOne,
                    <User className="w-5 h-5 text-blue-400" />,
                    "bg-blue-500/20",
                    partner1,
                    setPartner1
                  )}
                  {renderPartnerForm(
                    t.loveMeter.partnerTwo,
                    <User className="w-5 h-5 text-pink-400" />,
                    "bg-pink-500/20",
                    partner2,
                    setPartner2
                  )}
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg py-2.5">
                    {error}
                  </p>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Heart className="w-6 h-6" />
                    {loading ? t.loveMeter.calculating : t.loveMeter.calculate}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            score && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Score Gauge */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle cx="88" cy="88" r="72" stroke="var(--border-color)" strokeWidth="10" fill="none" />
                      <motion.circle
                        cx="88" cy="88" r="72"
                        stroke={gaugeColor}
                        strokeWidth="10" fill="none"
                        strokeLinecap="round"
                        strokeDasharray="452.4 452.4"
                        initial={{ strokeDashoffset: 452.4 }}
                        animate={{ strokeDashoffset: 452.4 - (score.overall / 100) * 452.4 }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-[var(--text-primary)]">{score.overall}%</span>
                      <span className="text-xs text-[var(--accent)] mt-1">{t.loveMeter.overall}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                    {score.summary}
                  </h2>
                  <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                    {(partner1.name || (language === "hi" ? "पहला साथी" : "Partner 1"))}
                    {language === "hi" ? " और " : " & "}
                    {(partner2.name || (language === "hi" ? "दूसरा साथी" : "Partner 2"))}
                  </p>
                </div>

                {/* Sub-Bars */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">{t.loveMeter.compatibilityDetails}</h3>
                  <div className="space-y-5">
                    {subBars.map((bar, idx) => (
                      <div key={bar.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-[var(--text-secondary)]">
                            {bar.icon} {bar.label}
                          </span>
                          <span className="text-sm font-bold text-[var(--text-primary)]">{bar.value}%</span>
                        </div>
                        <div className="h-3 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: bar.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${bar.value}%` }}
                            transition={{ duration: 1.2, delay: 0.2 + idx * 0.15, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2.5 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t.loveMeter.tryAnother}
                    </button>
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