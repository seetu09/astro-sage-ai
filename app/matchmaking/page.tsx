"use client";

import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Heart, User, Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MatchResult {
  overallScore: number;
  categories: { name: string; score: number; description: string }[];
  ashtakoot: { name: string; points: number; maxPoints: number; description: string }[];
  manglik: { male: boolean; female: boolean; compatibility: string };
  doshas: { name: string; present: boolean; severity: string; remedy: string }[];
  recommendation: string;
}

export default function MatchmakingPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [maleData, setMaleData] = useState({ name: "", birthDate: "", birthTime: "", birthPlace: "" });
  const [femaleData, setFemaleData] = useState({ name: "", birthDate: "", birthTime: "", birthPlace: "" });
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ male: maleData, female: femaleData }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setActiveTab("results");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const demoResult: MatchResult = {
    overallScore: 28,
    categories: [
      { name: "Emotional Compatibility", score: 85, description: "Strong emotional bond predicted" },
      { name: "Intellectual Harmony", score: 72, description: "Good mental compatibility" },
      { name: "Physical Attraction", score: 90, description: "Very strong physical chemistry" },
      { name: "Spiritual Alignment", score: 68, description: "Moderate spiritual connection" },
    ],
    ashtakoot: [
      { name: "Varna", points: 1, maxPoints: 1, description: "Spiritual development compatibility" },
      { name: "Vashya", points: 2, maxPoints: 2, description: "Power dynamics in relationship" },
      { name: "Tara", points: 3, maxPoints: 3, description: "Destiny and fortune alignment" },
      { name: "Yoni", points: 4, maxPoints: 4, description: "Sexual compatibility and intimacy" },
      { name: "Graha Maitri", points: 5, maxPoints: 5, description: "Planetary friendship" },
      { name: "Gana", points: 4, maxPoints: 6, description: "Temperament compatibility" },
      { name: "Bhakoot", points: 6, maxPoints: 7, description: "Health and prosperity" },
      { name: "Nadi", points: 3, maxPoints: 8, description: "Physiological compatibility" },
    ],
    manglik: { male: false, female: false, compatibility: "Neither partner is Manglik. Excellent compatibility." },
    doshas: [
      { name: "Mangal Dosha", present: false, severity: "None", remedy: "Not applicable" },
      { name: "Nadi Dosha", present: true, severity: "Mild", remedy: "Perform Nadi Nivarana Puja" },
    ],
    recommendation: "This is a highly favorable match with 28 out of 36 Gunas matching. The couple will enjoy a harmonious relationship with strong emotional and physical compatibility.",
  };

  const displayResult = result || demoResult;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Kundali Matchmaking
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Compare two birth charts for marriage compatibility using Ashtakoot Guna Milan.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "form" ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8">
              <form onSubmit={calculateMatch} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Male Details</h3>
                    </div>
                    <input type="text" placeholder="Name" value={maleData.name} onChange={(e) => setMaleData({ ...maleData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={maleData.birthDate} onChange={(e) => setMaleData({ ...maleData, birthDate: e.target.value })} required
                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                      <input type="time" value={maleData.birthTime} onChange={(e) => setMaleData({ ...maleData, birthTime: e.target.value })} required
                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                    </div>
                    <input type="text" placeholder="Birth Place" value={maleData.birthPlace} onChange={(e) => setMaleData({ ...maleData, birthPlace: e.target.value })} required
                      className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Female Details</h3>
                    </div>
                    <input type="text" placeholder="Name" value={femaleData.name} onChange={(e) => setFemaleData({ ...femaleData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" value={femaleData.birthDate} onChange={(e) => setFemaleData({ ...femaleData, birthDate: e.target.value })} required
                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                      <input type="time" value={femaleData.birthTime} onChange={(e) => setFemaleData({ ...femaleData, birthTime: e.target.value })} required
                        className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                    </div>
                    <input type="text" placeholder="Birth Place" value={femaleData.birthPlace} onChange={(e) => setFemaleData({ ...femaleData, birthPlace: e.target.value })} required
                      className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
                  </div>
                </div>

                <div className="flex justify-center">
                  <button type="submit" disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg">
                    <Heart className="w-6 h-6" />
                    {loading ? "Calculating..." : "Check Compatibility"}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="var(--border-color)" strokeWidth="8" fill="none" />
                    <circle cx="80" cy="80" r="70" stroke="#f59e0b" strokeWidth="8" fill="none"
                      strokeDasharray={`${(displayResult.overallScore / 36) * 440} 440`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[var(--text-primary)]">{displayResult.overallScore}</span>
                    <span className="text-sm text-[var(--text-muted)]">/ 36</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {displayResult.overallScore >= 28 ? "Excellent Match!" : displayResult.overallScore >= 20 ? "Good Match" : "Average Match"}
                </h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{displayResult.recommendation}</p>
                <button onClick={() => setActiveTab("form")}
                  className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors">
                  Check Another Match
                </button>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Ashtakoot Guna Milan
                </h3>
                <div className="space-y-3">
                  {displayResult.ashtakoot.map((guna, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-[var(--hover-bg)] rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-[var(--text-primary)]">{guna.name}</p>
                        <p className="text-sm text-[var(--text-muted)]">{guna.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${guna.points === guna.maxPoints ? "text-green-400" : "text-amber-400"}`}>
                          {guna.points}
                        </span>
                        <span className="text-[var(--text-muted)]">/{guna.maxPoints}</span>
                      </div>
                      <div className="w-24 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(guna.points / guna.maxPoints) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Manglik Analysis</h3>
                  <div className="space-y-2">
                    <p className="text-[var(--text-secondary)]">Male: <span className={displayResult.manglik.male ? "text-red-400" : "text-green-400"}>{displayResult.manglik.male ? "Manglik" : "Non-Manglik"}</span></p>
                    <p className="text-[var(--text-secondary)]">Female: <span className={displayResult.manglik.female ? "text-red-400" : "text-green-400"}>{displayResult.manglik.female ? "Manglik" : "Non-Manglik"}</span></p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">{displayResult.manglik.compatibility}</p>
                  </div>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Doshas</h3>
                  <div className="space-y-3">
                    {displayResult.doshas.map((dosha, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-[var(--text-secondary)]">{dosha.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${dosha.present ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                          {dosha.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
