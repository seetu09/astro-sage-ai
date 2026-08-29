"use client";

import { useState, useEffect } from 'react';
import { translations, getTranslation, type Language, type Translations } from './translations';

export { translations, getTranslation }; 

/** Languages currently supported by the app. */
export const SUPPORTED_LANGUAGES: Language[] = ["en", "hi"];

/** Default language used when nothing is resolved from the URL/session. */
export const DEFAULT_LANGUAGE: Language = "en";

/** Storage key used to persist the user's chosen language across sessions. */
export const LANGUAGE_STORAGE_KEY = "astroveda-language";

/** Type guard — mirrors the Language union from translations.ts. */
export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "hi";
}

/** Normalize any raw value (URL param, localStorage) to a valid Language. */
export function toLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/**
 * React hook that returns translation utilities.
 */
export function useTranslation() {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    }
    return DEFAULT_LANGUAGE;
  });
  
  // Update language from URL params if needed (for app router)
  useEffect(() => {
    const handleLanguageChange = () => {
      const pathLang = window.location.pathname.split('/')[1];
      if (pathLang && isLanguage(pathLang)) {
        setLang(pathLang);
      }
    };
    
    handleLanguageChange();
    window.addEventListener('popstate', handleLanguageChange);
    return () => window.removeEventListener('popstate', handleLanguageChange);
  }, []);
  
  const t = (key: string, params?: Record<string, any>) => getTranslation(lang, key, params);
  
  return {
    lang,
    setLang,
    t,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}

export type { Language, Translations };