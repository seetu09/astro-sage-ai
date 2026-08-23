'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

// ---------------------------------------------------------------------------
// KundaliLoadingSkeleton — animated placeholder shown while
// POST /api/kundali/generate is in flight. Mirrors the layout of the real
// report (summary badges → chart → tables → reading) so the swap feels smooth.
// ---------------------------------------------------------------------------

/** Pulsing rounded rectangle. */
function Pulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.35 }}
      animate={{ opacity: [0.35, 0.75, 0.35] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-slate-200/70 dark:bg-white/[0.06] rounded ${className}`}
    />
  );
}

/** Skeleton for the summary badge bar (Lagna / Rashi / Sun / Nakshatra). */
export function SummaryBadgesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
          className="glass-card rounded-xl p-3"
        >
          <Pulse className="h-2.5 w-14 mb-2" />
          <Pulse className="h-4 w-full" />
        </motion.div>
      ))}
    </div>
  );
}

/** Skeleton mimicking the North Indian diamond chart. */
export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      {/* Tab switcher placeholder */}
      <div className="flex gap-1.5 mb-4 justify-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} className="h-7 w-16 rounded-lg" />
        ))}
      </div>

      <div className="relative w-full max-w-md mx-auto bg-white dark:bg-[#0D0C1D] border border-slate-200/60 dark:border-white/10 rounded-2xl p-4 shadow-sunlit-soft dark:shadow-glow-violet">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl">
          {/* Faint diamond guides */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full opacity-[0.18] dark:opacity-[0.12]">
            <rect x="20" y="20" width="360" height="360" rx="8" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-[#FFD166]" />
            <line x1="20" y1="20" x2="380" y2="380" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-[#FFD166]" />
            <line x1="380" y1="20" x2="20" y2="380" stroke="currentColor" strokeWidth="1" className="text-slate-400 dark:text-[#FFD166]" />
            <polygon points="200,60 340,200 200,340 60,200" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 dark:text-[#FFD166]" />
          </svg>

          {/* Shimmer sweep overlay */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 dark:via-white/[0.07] to-transparent"
          />

          {/* Orbiting planet dots */}
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D]"
              style={{
                top: `${[22, 55, 74][i]}%`,
                left: `${[30, 62, 38][i]}%`,
              }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.35 }}
            />
          ))}
        </div>

        {/* Legend placeholder */}
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {Array.from({ length: 9 }).map((_, i) => (
            <Pulse key={i} className="h-5 w-9 rounded-full" />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400 dark:text-[#6B7280] flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 dark:text-[#FFD166]/70 animate-pulse" />
        Computing planetary positions…
      </p>
    </div>
  );
}

/** Skeleton for the interpretation reading section. */
export function ReadingSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Pulse className="w-7 h-7 rounded-lg" />
        <Pulse className="h-4 w-44" />
      </div>
      <div className="space-y-2.5">
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-[92%]" />
        <Pulse className="h-3 w-[96%]" />
        <Pulse className="h-3 w-[70%]" />
      </div>
      <div className="mt-5 space-y-2.5">
        <Pulse className="h-3.5 w-36" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-[88%]" />
        <Pulse className="h-3 w-[60%]" />
      </div>
      <div className="mt-5 space-y-2.5">
        <Pulse className="h-3.5 w-32" />
        <Pulse className="h-3 w-[94%]" />
        <Pulse className="h-3 w-[76%]" />
      </div>
    </div>
  );
}

/** Full stacked loading view (badges + chart + tables + reading). */
export default function KundaliLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-live="polite">
      <SummaryBadgesSkeleton />
      <ChartSkeleton />
      <ReadingSkeleton />
    </div>
  );
}