"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getTranslation,
  type Language,
} from "@/lib/i18n";

interface UseTranslationValue {
  lang: Language;
  t: (key: string, params?: Record<string, any>) => string;
  setLang: (lang: Language) => void;
  supportedLanguages: Language[];
}

/**
 * Resolve the language for a given URL pathname. The `hi` locale is served from
 * an optional `/hi` (or `/hi/...`) prefix; everything else falls back to the
 * saved session language or the default.
 *
 * Kept exported for backwards compatibility / SSR path resolution, but the
 * runtime hook below now reads from `LanguageContext` so every consumer reacts
 * to instant language switches without a page reload.
 */
export function resolveLangFromPathname(pathname: string | null): Language {
  if (pathname) {
    const seg = pathname.split("/")[1];
    if (seg && SUPPORTED_LANGUAGES.includes(seg as Language)) {
      return seg as Language;
    }
  }
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  }
  return DEFAULT_LANGUAGE;
}

/**
 * React hook that returns translation utilities backed by the SINGLE language
 * source of truth (`LanguageContext`).
 *
 * This used to read from the URL's `/[lang]` segment + its own `useState`,
 * which meant Kundali-flow components never re-rendered when the user toggled
 * language via the Navbar (no `/[lang]` route existed, so the pathname never
 * changed). Delegating to the context guarantees that a language change
 * propagates instantly to *every* consumer (both `useLanguage()` object-style
 * access and `useTranslation()` keyed access).
 */
export function useTranslation(): UseTranslationValue {
  const { language, setLanguage } = useLanguage();

  return {
    lang: language,
    t: (key: string, params?: Record<string, any>) =>
      getTranslation(language, key, params),
    setLang: setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}
