'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'day' | 'night' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'day' | 'night';
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'night',
  setTheme: () => {},
  resolvedTheme: 'night',
  mounted: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('night');
  const [resolvedTheme, setResolvedTheme] = useState<'day' | 'night'>('night');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always default to night (dark celestial) theme
    const saved = localStorage.getItem('astroveda-theme') as Theme;
    if (saved && ['day', 'night', 'auto'].includes(saved)) {
      setThemeState(saved);
    } else {
      setThemeState('night');
      localStorage.setItem('astroveda-theme', 'night');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (mounted) {
      localStorage.setItem('astroveda-theme', newTheme);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    let resolved: 'day' | 'night';
    if (theme === 'auto') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
    } else {
      resolved = theme;
    }
    setResolvedTheme(resolved);

    const root = document.documentElement;
    if (resolved === 'night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (theme !== 'auto') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'night' : 'day';
      setResolvedTheme(resolved);
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context;
}