'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, Translations } from '@/data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  /**
   * Function-style translation using a dotted key path, e.g.
   * translate('kundali.title', language) -> 'Kundli'.
   * Falls back to the default language, then the key itself.
   */
  translate: (key: string, lang?: Language) => string;
}

// FIX: Provide a default value instead of undefined
const defaultValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: {} as Translations,
  translate: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

/**
 * Resolve a dotted key path against a Translations object, e.g. "kundali.tabs.overview".
 */
function lookup(root: unknown, key: string): unknown {
  let node: unknown = root;
  for (const segment of key.split('.')) {
    if (node && typeof node === 'object' && segment in node) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return node;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('astroveda-language') as Language;
    if (saved && (saved === 'en' || saved === 'hi')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('astroveda-language', lang);
  };

  const t = getTranslation(language);

  const translate = (key: string, lang?: Language): string => {
    const target = lang ?? language;
    const value = lookup(getTranslation(target), key);
    if (typeof value === 'string') return value;
    // Fallback: default language, then the raw key.
    const fallback = lookup(getTranslation('en'), key);
    return typeof fallback === 'string' ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Remove the throw — the default value handles server rendering
  return context;
}
