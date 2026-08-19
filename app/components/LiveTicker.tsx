"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const activities = [
  { name: "Rahul Sharma", action: "generated Kundali", location: "Mumbai", time: "2 min ago" },
  { name: "Priya Mehta", action: "checked daily horoscope", location: "Delhi", time: "5 min ago" },
  { name: "Anjali Kapoor", action: "matched compatibility", location: "Bangalore", time: "8 min ago" },
  { name: "Vikram Patel", action: "consulted AI Guru", location: "Ahmedabad", time: "12 min ago" },
  { name: "Sneha Gupta", action: "downloaded birth chart", location: "Pune", time: "15 min ago" },
  { name: "Arjun Reddy", action: "got career prediction", location: "Hyderabad", time: "18 min ago" },
  { name: "Neha Iyer", action: "checked love compatibility", location: "Chennai", time: "22 min ago" },
  { name: "Karan Malhotra", action: "generated Kundali", location: "Jaipur", time: "25 min ago" },
  { name: "Divya Nair", action: "consulted AI Guru", location: "Kochi", time: "30 min ago" },
  { name: "Rohit Verma", action: "checked daily horoscope", location: "Lucknow", time: "35 min ago" },
];

export default function LiveTicker() {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDark = theme === "night";

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 400);
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const activity = activities[currentIndex];

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 z-40 px-4 py-2.5
        backdrop-blur-md border-t transition-colors duration-300
        ${isDark 
          ? "bg-slate-900/80 border-slate-700/50" 
          : "bg-amber-50/80 border-amber-200/50"
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        {/* Live pulse */}
        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </div>

        {/* Activity text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
              {activity.name}
            </span>
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              {activity.action}
            </span>
            <span className={`hidden sm:inline text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              • {activity.location}
            </span>
            <span className={`text-xs ml-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
              {activity.time}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}