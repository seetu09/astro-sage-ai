/**
 * Lightweight i18n core — supports server components, API routes and client
 * code. Kept intentionally small: only add keys we currently need.
 */
import { translations, type Language } from "@/translations";

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
 * Resolve a dotted path within the translations dictionary for a language.
 *
 *   t("kundali.labels.generateKundli", "en")  // "Generate Kundli"
 *   t("nav.home", "hi")                        // "होम"
 *
 * Falls back to the default language, then to the key itself, so missing keys
 * never crash the renderer.
 */
export function t(key: string, lang: Language): string {
  const resolvedLang = isLanguage(lang) ? lang : DEFAULT_LANGUAGE;
  const value = lookup(translations[resolvedLang] as object, key);
  if (typeof value === "string") {
    return value;
  }
  // Fallback: try the default language before giving up.
  const fallback = lookup(translations[DEFAULT_LANGUAGE] as object, key);
  return typeof fallback === "string" ? fallback : key;
}

/** Walk a nested record using a dot-delimited key path. */
function lookup(root: object, key: string): unknown {
  let node: unknown = root;
  for (const segment of key.split(".")) {
    if (node && typeof node === "object" && segment in node) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  return node;
}

export { type Language };