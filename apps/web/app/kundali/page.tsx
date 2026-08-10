"use client";

import { useState } from "react";
import { Sparkles, Calendar, Clock, MapPin, User, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { calculatePlanetPositions, getAscendant, getMoonSign, getSunSign, type PlanetPosition } from "@/lib/astrology";

export default function KundaliPage() {
  const [step, setStep] = useState<"form" | "chart">("form");
  const [birthData, setBirthData] = useState({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chart, setChart] = useState<{
    planets: PlanetPosition[];
    ascendant: string;
    moonSign: string;
    sunSign: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateChart = () => {
    if (!birthData.date || !birthData.time) return;
    setLoading(true);

    setTimeout(() => {
      const [year, month, day] = birthData.date.split("-").map(Number);
      const [hour, minute] = birthData.time.split(":").map(Number);

      const planets = calculatePlanetPositions(year, month, day, hour, minute);
      const ascendant = getAscendant(year, month, day, hour, minute);
      const moonSign = getMoonSign(planets);
      const sunSign = getSunSign(planets);

      setChart({ planets, ascendant, moonSign, sunSign });
      setStep("chart");
      setLoading(false);
    }, 1500);
  };

  if (step === "chart" && chart) {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-2 text-slate-400 hover:text-gold-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Form
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              <span className="text-gradient">{birthData.name || "Your"}</span> Birth Chart
            </h1>
            <p className="text-slate-400">
              {birthData.place} • {birthData.date} • {birthData.time}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">Ascendant (Lagna)</p>
              <p className="text-2xl font-bold text-gold-400">{chart.ascendant}</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">Moon Sign (Rashi)</p>
              <p className="text-2xl font-bold text-gold-400">{chart.moonSign}</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">Sun Sign</p>
              <p className="text-2xl font-bold text-gold-400">{chart.sunSign}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Planetary Positions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chart.planets.map((planet) => (
                <div
                  key={planet.name}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white">{planet.name}</span>
                    <div className="flex gap-1">
                      {planet.isExalted && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Exalted</span>}
                      {planet.isDebilitated && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Debilitated</span>}
                      {planet.isRetrograde && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Retro</span>}
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sign</span>
                      <span className="text-white">{planet.sign}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Degree</span>
                      <span className="text-white">{planet.degree}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nakshatra</span>
                      <span className="text-gold-400">{planet.nakshatra}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pada</span>
                      <span className="text-white">{planet.pada}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-500 text-cosmic-900 font-bold rounded-xl transition-all glow-gold"
            >
              <Sparkles className="w-5 h-5" />
              Get AI Reading
            </Link>
            <button
              onClick={() => setStep("form")}
              className="flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              <Star className="w-5 h-5" />
              Generate New Chart
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Free <span className="text-gradient">Kundali</span>
          </h1>
          <p className="text-slate-400">
            Get your detailed Vedic birth chart by filling the details below
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 text-gold-400" />
                Full Name
              </label>
              <input
                type="text"
                value={birthData.name}
                onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Calendar className="w-4 h-4 text-gold-400" />
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthData.date}
                  onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Clock className="w-4 h-4 text-gold-400" />
                  Birth Time
                </label>
                <input
                  type="time"
                  value={birthData.time}
                  onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <MapPin className="w-4 h-4 text-gold-400" />
                Birth Place
              </label>
              <input
                type="text"
                value={birthData.place}
                onChange={(e) => setBirthData({ ...birthData, place: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
                placeholder="City, Country"
              />
            </div>

            <button
              onClick={generateChart}
              disabled={!birthData.date || !birthData.time || loading}
              className="w-full py-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-cosmic-900 font-bold rounded-xl transition-all glow-gold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-cosmic-900/30 border-t-cosmic-900 rounded-full animate-spin" />
                  Calculating Chart...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Birth Chart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
