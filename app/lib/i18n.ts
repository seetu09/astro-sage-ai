/**
 * Backward-compatibility re-export of the centralized i18n system.
 * Prefer importing from `@/lib/i18n` directly.
 */
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  toLanguage,
  getTranslation,
} from "@/lib/i18n";
import type { Language, Translations } from "@/lib/i18n";

export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isLanguage,
  toLanguage,
  getTranslation,
};
export type { Language, Translations };

/**
 * Legacy `t(key, lang)` signature — resolves a dotted key with the same
 * fallback rules as the new `getTranslation`, without interpolation params.
 */
export function t(key: string, lang: Language): string {
  return getTranslation(lang, key);
}
