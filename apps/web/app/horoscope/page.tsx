"use client";

import { useState } from "react";
import { Sun, Star, Heart, Briefcase, TrendingUp, Shield } from "lucide-react";
import { ZODIAC_SIGNS, getDailyHoroscope } from "@/lib/astrology";

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0]);
  const horoscope = getDailyHoroscope(selectedSign.name);

  const categories = [
    { icon: Heart, label: "Love", color: "text-rose-400", bg: "bg-rose-500/10" },
    { icon: Briefcase, label: "Career", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: TrendingUp, label: "Finance", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Shield, label: "Health", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Daily <span className="text-gradient">Horoscope</span>
          </h1>
          <p className="text-slate-400">Select your zodiac sign to reveal today cosmic guidance</p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-10">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              className={`group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                selectedSign.name === sign.name
                  ? "bg-gradient-to-br from-gold-500/20 to-amber-500/20 border border-gold-500/50 scale-105"
                  : "glass hover:bg-white/10"
              }`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{sign.symbol}</span>
              <span className={`text-xs font-medium ${
                selectedSign.name === sign.name ? "text-gold-400" : "text-slate-400"
              }`}>
                {sign.name}
              </span>
              <span className="text-[10px] text-slate-500">{sign.date}</span>
            </button>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 glow-gold">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center text-3xl">
              {selectedSign.symbol}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedSign.name}</h2>
              <p className="text-slate-400 text-sm">{selectedSign.date} • {selectedSign.element} Element</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <p className="text-lg text-slate-200 leading-relaxed">{horoscope}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <div key={cat.label} className={`${cat.bg} rounded-xl p-4 text-center`}>
                <cat.icon className={`w-6 h-6 ${cat.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-white">{cat.label}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < 3 + Math.floor(Math.random() * 3) ? "text-gold-400 fill-gold-400" : "text-slate-600"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
              <Star className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-slate-300">Lucky Number: <span className="text-gold-400 font-semibold">{Math.floor(Math.random() * 9) + 1}</span></span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
              <Sun className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-slate-300">Lucky Color: <span className="text-gold-400 font-semibold">{["Red", "Blue", "Green", "Gold", "Purple", "Orange"][Math.floor(Math.random() * 6)]}</span></span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
