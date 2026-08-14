'use client';

import { Moon, Sun, Flame } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { motion } from 'framer-motion';

const themeIcons = {
  dark: Moon,
  golden: Sun,
  warm: Flame,
};

const themeLabels = {
  dark: 'Dark',
  golden: 'Golden',
  warm: 'Warm',
};

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const Icon = themeIcons[theme];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] 
                 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-300
                 font-medium text-sm"
      aria-label={`Current theme: ${themeLabels[theme]}. Click to cycle.`}
    >
      <Icon className="w-4 h-4 text-[var(--accent)]" />
      <span className="hidden sm:inline">{themeLabels[theme]}</span>
    </motion.button>
  );
}
