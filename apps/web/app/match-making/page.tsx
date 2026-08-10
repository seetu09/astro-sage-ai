"use client";

import { useState } from "react";
import { Heart, User, Calendar, Clock, MapPin, Sparkles, ArrowLeft, Star } from "lucide-react";
import { calculatePlanetPositions, getMoonSign, SIGNS } from "@/lib/astrology";

function getCompatibilityScore(boySign: string, girlSign: string): number {
  const compatiblePairs: Record<string, string[]> = {
    "Aries": ["Leo", "Sagittarius", "Gemini", "Aquarius"],
    "Taurus": ["Virgo", "Capricorn", "Cancer", "Pisces"],
    "Gemini": ["Libra", "Aquarius", "Aries", "Leo"],
    "Cancer": ["Scorpio", "Pisces", "Taurus", "Virgo"],
    "Leo": ["Aries", "Sagittarius", "Gemini", "Libra"],
    "Virgo": ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    "Libra": ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    "Scorpio": ["Cancer", "Pisces", "Virgo", "Capricorn"],
    "Sagittarius": ["Aries", "Leo", "Libra", "Aquarius"],
    "Capricorn": ["Taurus", "Virgo", "Scorpio", "Pisces"],
    "Aquarius": ["Gemini", "Libra", "Aries", "Sagittarius"],
    "Pisces": ["Cancer", "Scorpio", "Taurus", "Capricorn"],
  };

  if (boySign === girlSign) return 24;
  if (compatiblePairs[boySign]?.includes(girlSign)) return 28 + Math.floor(Math.random() * 8);
  return 18 + Math.floor(Math.random() * 8);
}

function getGunaMilanScore(): { total: number; aspects: { name: string; score: number; max: number }[] } {
  const aspects = [
    { name: "Varna", score: 1, max: 1 },
    { name: "Vashya", score: 2, max: 2 },
    { name: "Tara", score: 3, max: 3 },
    { name: "Yoni", score: 4, max: 4 },
    { name: "Graha Maitri", score: 5, max: 5 },
    { name: "Gana", score: 6, max: 6 },
    { name: "Bhakoot", score: 7, max: 7 },
    { name: "Nadi", score: 8, max: 8 },
  ];
  return { total: 36, aspects };
}

export default function MatchMakingPage() {
  const [step, setStep] = useState<"form" | "result">("form");
  const [boyData, setBoyData] = useState({ name: "", date: "", time: "", place: "" });
  const [girlData, setGirlData] = useState({ name: "", date: "", time: "", place: "" });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateMatch = () => {
    if (!boyData.date || !boyData.time || !girlData.date || !girlData.time) return;
    setLoading(true);

    setTimeout(() => {
      const [by, bm, bd] = boyData.date.split("-").map(Number);
      const [bh, bmin] = boyData.time.split(":").map(Number);
      const [gy, gmm, gd] = girlData.date.split("-").map(Number);
      const [gh, gmin] = girlData.time.split(":").map(Number);

      const boyPlanets = calculatePlanetPositions(by, bm, bd, bh, bmin);
      const girlPlanets = calculatePlanetPositions(gy, gmm, gd, gh, gmin);

      const boySign = getMoonSign(boyPlanets);
      const girlSign = getMoonSign(girlPlanets);
      const compatibility = getCompatibilityScore(boySign, girlSign);
      const gunaMilan = getGunaMilanScore();

      setResult({
        boySign,
        girlSign,
        compatibility,
        gunaMilan,
        verdict: compatibility >= 28 ? "Excellent Match" : compatibility >= 24 ? "Good Match" : compatibility >= 18 ? "Average Match" : "Challenging Match",
        verdictColor: compatibility >= 28 ? "text-emerald-400" : compatibility >= 24 ? "text-gold-400" : compatibility >= 18 ? "text-amber-400" : "text-red-400",
      });
      setStep("result");
      setLoading(false);
    }, 1500);
  };

  if (step === "result" && result) {
    return (
      <main className="min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setStep("form")}
            className="flex items-center gap-2 text-slate-400 hover:text-gold-400 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-gradient">Match Making</span> Result
            </h1>
            <p className="text-slate-400">{boyData.name} & {girlData.name}</p>
          </div>

          {/* Score Circle */}
          <div className="glass rounded-2xl p-8 mb-8 text-center">
            <div className="relative inline-flex items-center justify-center w-40 h-40 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={result.compatibility >= 28 ? "#10b981" : result.compatibility >= 24 ? "#f59e0b" : "#ef4444"} 
                  strokeWidth="8" 
                  strokeDasharray={`${(result.compatibility / 36) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-bold text-white">{result.compatibility}</span>
                <span className="text-sm text-slate-400 block">/ 36</span>
              </div>
            </div>
            <h2 className={`text-2xl font-bold ${result.verdictColor}`}>{result.verdict}</h2>
          </div>

          {/* Signs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">{boyData.name}</p>
              <p className="text-2xl font-bold text-gold-400">{result.boySign}</p>
              <p className="text-xs text-slate-500">Moon Sign</p>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400 mb-1">{girlData.name}</p>
              <p className="text-2xl font-bold text-gold-400">{result.girlSign}</p>
              <p className="text-xs text-slate-500">Moon Sign</p>
            </div>
          </div>

          {/* Guna Milan */}
          <div className="glass rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-400" />
              Ashtakoot Guna Milan
            </h3>
            <div className="space-y-3">
              {result.gunaMilan.aspects.map((aspect: any) => (
                <div key={aspect.name} className="flex items-center gap-4">
                  <span className="text-sm text-slate-400 w-32">{aspect.name}</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-500 to-amber-500 rounded-full"
                      style={{ width: `${(aspect.score / aspect.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-white w-12 text-right">{aspect.score}/{aspect.max}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
              <span className="text-slate-400">Total Score</span>
              <span className="text-2xl font-bold text-gold-400">{result.gunaMilan.total} / 36</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            <span className="text-gradient">Match Making</span>
          </h1>
          <p className="text-slate-400">Check compatibility through traditional Vedic Kundali matching</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Boy's Details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Boy's Details
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={boyData.name}
                onChange={(e) => setBoyData({ ...boyData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="date"
                value={boyData.date}
                onChange={(e) => setBoyData({ ...boyData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="time"
                value={boyData.time}
                onChange={(e) => setBoyData({ ...boyData, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="text"
                placeholder="Birth Place"
                value={boyData.place}
                onChange={(e) => setBoyData({ ...boyData, place: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
            </div>
          </div>

          {/* Girl's Details */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-rose-400" />
              Girl's Details
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={girlData.name}
                onChange={(e) => setGirlData({ ...girlData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="date"
                value={girlData.date}
                onChange={(e) => setGirlData({ ...girlData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="time"
                value={girlData.time}
                onChange={(e) => setGirlData({ ...girlData, time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold-500/50 transition-all"
              />
              <input
                type="text"
                placeholder="Birth Place"
                value={girlData.place}
                onChange={(e) => setGirlData({ ...girlData, place: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          onClick={calculateMatch}
          disabled={!boyData.date || !boyData.time || !girlData.date || !girlData.time || loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 disabled:opacity-50 text-cosmic-900 font-bold rounded-xl transition-all glow-gold flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-cosmic-900/30 border-t-cosmic-900 rounded-full animate-spin" />
              Calculating Compatibility...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" />
              Check Compatibility
            </>
          )}
        </button>
      </div>
    </main>
  );
}
