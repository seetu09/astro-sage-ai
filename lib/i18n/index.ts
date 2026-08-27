"use client";

import { useState, useEffect } from 'react';
import { translations, type Language, type Translations } from './translations';

export { translations }; 

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
 * Get translation for a key with optional parameters for interpolation.
 * Falls back to default language, then to the key itself.
 */
export function getTranslation(
  lang: Language, 
  key: string, 
  params?: Record<string, any>
): string {
  const resolvedLang = isLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  
  // Navigate through nested keys (e.g., "kundali.sections.generatedFor" -> translations[lang].kundali.sections.generatedFor)
  const value = key.split('.').reduce((obj: any, segment: string) => {
    return obj && typeof obj === 'object' && segment in obj ? obj[segment] : undefined;
  }, translations[resolvedLang]);
  
  if (typeof value === 'string') {
    if (params) {
      // Handle interpolation like {name}
      return value.replace(/\{([^}]+)\}/g, (_, placeholder) => {
        return params[placeholder] !== undefined ? String(params[placeholder]) : `[${placeholder}]`;
      });
    }
    return value;
  }
  
  // Fallback to default language
  const fallbackValue = key.split('.').reduce((obj: any, segment: string) => {
    return obj && typeof obj === 'object' && segment in obj ? obj[segment] : undefined;
  }, translations[DEFAULT_LANGUAGE]);
  
  if (typeof fallbackValue === 'string') {
    if (params) {
      return fallbackValue.replace(/\{([^}]+)\}/g, (_, placeholder) => {
        return params[placeholder] !== undefined ? String(params[placeholder]) : `[${placeholder}]`;
      });
    }
    return fallbackValue;
  }
  
  return key;
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