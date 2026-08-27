"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t } from "@/app/lib/i18n";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  toLanguage,
  type Language,
} from "@/app/lib/i18n";

interface UseTranslationValue {
  /** Currently active language. */
  lang: Language;
  /** Translate a dotted key in the active language. */
  t: (key: string) => string;
  /** Persist the user's language choice for future sessions. */
  setLang: (lang: Language) => void;
  /** Supported language codes, useful for a switcher UI. */
  supportedLanguages: Language[];
}

/**
 * Resolve the language from the URL's optional /[lang] segment, falling back
 * to the value saved in the user's session (localStorage), then the default.
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
 * React hook that reads the current language from the URL's /[lang] segment
 * or the user's saved session. Re-renders when the route's language changes.
 */
export function useTranslation(): UseTranslationValue {
  const pathname = usePathname();
  const [lang, setLangState] = useState<Language>(() =>
    toLanguage(resolveLangFromPathname(pathname))
  );

  useEffect(() => {
    setLangState(toLanguage(resolveLangFromPathname(pathname)));
  }, [pathname]);

  const setLang = (next: Language) => {
    const normalized = toLanguage(next);
    setLangState(normalized);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
    } catch {
      // localStorage may be unavailable (private mode) — ignore.
    }
  };

  return {
    lang,
    t: (key: string) => t(key, lang),
    setLang,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
}