import { translations, getTranslation, type Language, type Translations } from './translations';

export { translations, getTranslation };

/** Languages currently supported by the app. */
export const SUPPORTED_LANGUAGES: Language[] = ["en", "hi"];

/** Default language used when nothing is resolved from the URL/session. */
export const DEFAULT_LANGUAGE: Language = "en";

/** Storage key used to persist the user's chosen language across sessions. */
export const LANGUAGE_STORAGE_KEY = "astroveda-language";

/** Cookie key mirroring the storage key so the Server can read the language (SSR). */
export const LANGUAGE_COOKIE_KEY = LANGUAGE_STORAGE_KEY;

/** Type guard — mirrors the Language union from translations.ts. */
export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "hi";
}

/** Normalize any raw value (URL param, localStorage) to a valid Language. */
export function toLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

/** Read the persisted language straight from document.cookie (client-only, sync). */
export function getLanguageCookie(): Language | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`${LANGUAGE_COOKIE_KEY}=([^;]*)`)
  );
  return isLanguage(match?.[1]) ? (match[1] as Language) : null;
}

/** Persist the language into document.cookie (client-only, ~1yr, SameSite=Lax). */
export function setLanguageCookie(lang: Language) {
  if (typeof document === "undefined") return;
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export type { Language, Translations };