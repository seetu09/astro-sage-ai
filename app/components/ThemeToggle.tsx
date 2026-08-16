'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: 'day' | 'night' | 'auto'; icon: typeof Sun; label: string }[] = [
    { value: 'day', icon: Sun, label: 'Day' },
    { value: 'night', icon: Moon, label: 'Night' },
    { value: 'auto', icon: Monitor, label: 'Auto' },
  ];

  return (
    <div className="flex items-center gap-1 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1.5 rounded-md transition-all duration-200 ${
            theme === value
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/50'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
