'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function SkeletonText({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className={`bg-[var(--bg-card)] border border-[var(--border)] rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

export function SkeletonCard({ className = 'h-32' }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 bg-[var(--bg-secondary)] rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-[var(--bg-secondary)] rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-[var(--bg-secondary)] rounded animate-pulse" />
        <div className="h-3 w-4/5 bg-[var(--bg-secondary)] rounded animate-pulse" />
      </div>
    </motion.div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <div className="h-5 w-40 bg-[var(--bg-secondary)] rounded animate-pulse" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="h-4 w-20 bg-[var(--bg-secondary)] rounded animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowI) => (
              <tr key={rowI} className="border-b border-[var(--border)] last:border-0">
                {Array.from({ length: cols }).map((_, colI) => (
                  <td key={colI} className="px-4 py-3">
                    <div className={`h-4 bg-[var(--bg-secondary)] rounded animate-pulse ${colI === 0 ? 'w-24' : 'w-16'}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          {i % 2 === 0 && <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] animate-pulse" />}
          <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${i % 2 === 0 ? 'bg-[var(--bg-card)] border border-[var(--border)]' : 'bg-[var(--accent)]/20'} animate-pulse`}>
            <div className="h-3 w-48 bg-[var(--bg-secondary)] rounded mb-2" />
            <div className="h-3 w-32 bg-[var(--bg-secondary)] rounded" />
          </div>
          {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] animate-pulse" />}
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3"
        >
          <div className="h-3 w-16 bg-[var(--bg-secondary)] rounded mb-2 animate-pulse" />
          <div className="h-5 w-full bg-[var(--bg-secondary)] rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}
