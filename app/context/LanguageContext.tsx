'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Language,
  LANGUAGE_STORAGE_KEY,
  getLanguageCookie,
  setLanguageCookie,
  getTranslation,
  translations,
  isLanguage,
  type Translations,
} from '@/lib/i18n';

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

/**
 * Resolve the initial language synchronously so the very first client render
 * matches the server render (kills the EN→HI "flash of English" on load).
 * Checks, in priority order: URL `?hl=`, document.cookie (set by SSR), then
 * localStorage, finally the default language.
 */
function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const search = window.location.search;
    const hl = new URLSearchParams(search).get("hl");
    if (hl && isLanguage(hl)) return hl;

    const fromCookie = getLanguageCookie();
    if (fromCookie) return fromCookie;

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isLanguage(stored)) return stored as Language;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    setLanguageCookie(lang);
  };

  // Keep a cookie in sync if the language is changed outside the provider
  // (e.g. a server redirect). Cheap no-op if already synced.
  useEffect(() => {
    setLanguageCookie(language);
  }, [language]);

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
