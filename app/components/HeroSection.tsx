"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Search, ArrowRight } from "lucide-react";
import BirthDetailsModal from "./BirthDetailsModal";

interface HeroSectionProps {
  onAskGuru?: (question: string) => void;
}

const TRENDING_PROMPTS = [
  { emoji: "💼", label: "2026 Job Switch Timing" },
  { emoji: "⚡", label: "Sade Sati Impact" },
  { emoji: "❤️", label: "Marriage & Mangal Dosha" },
  { emoji: "🔮", label: "Current Mahadasha Meaning" },
];

export default function HeroSection({ onAskGuru }: HeroSectionProps) {
  const [question, setQuestion] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      setModalOpen(true);
    }
  };

  const handleChipClick = (label: string) => {
    setQuestion(label);
  };

  return (
    <>
      <section className="relative pt-20 sm:pt-28 pb-16 sm:pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50/80 dark:bg-[#FFD166]/10 border border-amber-200/60 dark:border-[#FFD166]/20 text-amber-700 dark:text-[#FFD166] text-sm font-medium mb-6 animate-glow">
              <Sparkles className="w-4 h-4" />
              ✨ Ancient Vedic Math × Next-Gen AI
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-amber-900 dark:text-[#F3F4F6] mb-6 leading-tight">
              Decode Your{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 dark:from-[#FFD166] dark:to-[#E0A96D] bg-clip-text text-transparent drop-shadow-sm">
                Cosmic Blueprint
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-amber-800/70 dark:text-[#9CA3AF] max-w-2xl mx-auto mb-10">
              Ask about your career transits, relationship synergy, or Sade Sati in plain English.
            </p>

            {/* Omni-Search Bar */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-400/20 dark:from-[#FFD166]/30 dark:via-[#7B2CBF]/30 dark:to-[#4CC9F0]/30 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-2 bg-[#FFFDF6] dark:bg-[#121026]/90 backdrop-blur-xl border border-amber-200/60 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 dark:border-white/10 dark:focus-within:border-[#FFD166]/50 dark:focus-within:ring-[#FFD166]/10 rounded-2xl p-2 pl-4 shadow-sunlit-soft dark:shadow-glow-gold">
                  <Search className="w-5 h-5 text-amber-600 dark:text-[#FFD166] flex-shrink-0" />
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., When is my next career breakthrough? or Is 2026 good for job switch?"
                    className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-amber-900 dark:text-[#F3F4F6] placeholder:text-amber-700/40 dark:placeholder-[#6B7280] py-2.5 min-h-[44px]"
                    aria-label="Ask the AI Guru"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all flex-shrink-0 min-h-[44px]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask Guru</span>
                    <ArrowRight className="w-4 h-4 hidden sm:block" />
                  </button>
                </div>
              </div>
            </form>

            {/* Trending Prompt Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="text-xs text-amber-700/60 dark:text-[#6B7280] font-medium mr-1">Trending:</span>
              {TRENDING_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => handleChipClick(prompt.label)}
                  className="px-3 sm:px-4 py-2 bg-amber-50/70 dark:bg-white/[0.03] border border-amber-200/60 dark:border-white/10 rounded-full text-xs sm:text-sm text-amber-900 dark:text-[#9CA3AF] hover:bg-amber-100 dark:hover:text-[#F3F4F6] dark:hover:border-[#FFD166]/40 dark:hover:bg-[#FFD166]/5 transition-all min-h-[44px]"
                >
                  {prompt.emoji} {prompt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <BirthDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        question={question}
      />
    </>
  );
}