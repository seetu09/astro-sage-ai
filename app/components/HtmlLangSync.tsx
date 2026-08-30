"use client";

import { useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

/**
 * Keeps the `<html lang="...">` attribute in sync with the active language so
 * screen readers and translation tools always see the right locale — even when
 * the user toggles language client-side (no URL/navigation change).
 *
 * The root layout already renders the SSR-correct `lang` via the language
 * cookie, so this only patches the attribute when a toggle makes the in-memory
 * language diverge from the server-rendered value.
 */
export default function HtmlLangSync({ lang }: { lang: "en" | "hi" }) {
  const { language } = useLanguage();
  const target = language ?? lang;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    if (html.lang !== target) {
      html.lang = target;
    }
  }, [target]);

  return null;
}
