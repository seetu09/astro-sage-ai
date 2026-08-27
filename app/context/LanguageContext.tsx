'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, translations, type Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Translations object for the active language (e.g. `t.nav.home`). */
  t: Translations;
  /**
   * Function-style translation using a dotted key path, e.g.
   * translate('kundali.sections.generatedFor', 'en', { name: 'Rahul' }) -> 'Generated for Rahul'.
   * Falls back to the default language, then the key itself.
   */
  translate: (key: string, lang?: Language, params?: Record<string, any>) => string;
}

// FIX: Provide a default value instead of undefined
const defaultValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: {} as Translations,
  translate: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

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

  const t = translations[language];

  const translate = (key: string, lang?: Language, params?: Record<string, any>): string => {
    const target = lang ?? language;
    return getTranslation(target, key, params);
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
