"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const zodiacSigns = [
  { name: "Aries", hindi: "मेष", date: "Mar 21 - Apr 19", element: "Fire", symbol: "♈" },
  { name: "Taurus", hindi: "वृष", date: "Apr 20 - May 20", element: "Earth", symbol: "♉" },
  { name: "Gemini", hindi: "मिथुन", date: "May 21 - Jun 20", element: "Air", symbol: "♊" },
  { name: "Cancer", hindi: "कर्क", date: "Jun 21 - Jul 22", element: "Water", symbol: "♋" },
  { name: "Leo", hindi: "सिंह", date: "Jul 23 - Aug 22", element: "Fire", symbol: "♌" },
  { name: "Virgo", hindi: "कन्या", date: "Aug 23 - Sep 22", element: "Earth", symbol: "♍" },
  { name: "Libra", hindi: "तुला", date: "Sep 23 - Oct 22", element: "Air", symbol: "♎" },
  { name: "Scorpio", hindi: "वृश्चिक", date: "Oct 23 - Nov 21", element: "Water", symbol: "♏" },
  { name: "Sagittarius", hindi: "धनु", date: "Nov 22 - Dec 21", element: "Fire", symbol: "♐" },
  { name: "Capricorn", hindi: "मकर", date: "Dec 22 - Jan 19", element: "Earth", symbol: "♑" },
  { name: "Aquarius", hindi: "कुंभ", date: "Jan 20 - Feb 18", element: "Air", symbol: "♒" },
  { name: "Pisces", hindi: "मीन", date: "Feb 19 - Mar 20", element: "Water", symbol: "♓" },
];

const elementColors: Record<string, string> = {
  Fire: "from-orange-500 to-red-600",
  Earth: "from-emerald-500 to-green-700",
  Air: "from-sky-400 to-blue-600",
  Water: "from-indigo-500 to-purple-700",
};

const elementGlow: Record<string, string> = {
  Fire: "shadow-orange-500/30",
  Earth: "shadow-emerald-500/30",
  Air: "shadow-sky-500/30",
  Water: "shadow-indigo-500/30",
};

export default function ZodiacSelector() {
  const router = useRouter();
  const { theme } = useTheme();
  const [hovered, setHovered] = useState<string | null>(null);

  const isDark = theme === "night";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {zodiacSigns.map((sign, index) => (
        <motion.button
          key={sign.name}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          onClick={() => router.push(`/horoscope/${sign.name.toLowerCase()}`)}
          onMouseEnter={() => setHovered(sign.name)}
          onMouseLeave={() => setHovered(null)}
          className={`
            group relative overflow-hidden rounded-2xl p-5 md:p-6 text-center
            transition-all duration-300 cursor-pointer border
            ${isDark 
              ? "bg-slate-800/60 border-slate-700/50 hover:border-amber-500/50" 
              : "bg-white/80 border-amber-200/60 hover:border-amber-400"
            }
            hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1
            ${hovered === sign.name ? elementGlow[sign.element] : ""}
          `}
        >
          {/* Background gradient on hover */}
          <div 
            className={`
              absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500
              bg-gradient-to-br ${elementColors[sign.element]}
            `}
          />

          {/* Symbol */}
          <div 
            className={`
              text-4xl md:text-5xl mb-3 transition-transform duration-300
              group-hover:scale-110 group-hover:rotate-6
              ${isDark ? "text-amber-400" : "text-amber-700"}
            `}
          >
            {sign.symbol}
          </div>

          {/* Name */}
          <h3 
            className={`
              font-semibold text-base md:text-lg mb-0.5
              ${isDark ? "text-slate-100" : "text-slate-800"}
            `}
          >
            {sign.name}
          </h3>

          {/* Hindi name */}
          <p className={`text-xs mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {sign.hindi}
          </p>

          {/* Date range */}
          <p className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {sign.date}
          </p>

          {/* Element badge */}
          <div 
            className={`
              mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium
              bg-gradient-to-r ${elementColors[sign.element]} text-white
              opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0
            `}
          >
            {sign.element}
          </div>
        </motion.button>
      ))}
    </div>
  );
}
