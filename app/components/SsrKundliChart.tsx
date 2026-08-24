/**
 * SsrKundliChart — Pure SSR Kundli chart component.
 * ---------------------------------------------------------------------------
 * A thin React *server component* wrapper around the pure inline-SVG renderer
 * (`lib/kundliChart`). It has NO 'use client', NO hooks, NO `window`/`canvas`
 * references — so it renders identically in server components, static
 * generation, and headless PDF pipelines.
 *
 * The `language` prop (`'en' | 'hi'`) switches the native-script glyphs and
 * rashi names used inside the SVG.
 */
import React from "react";
import { renderKundliChartSvg, KundliChartInput } from "@/lib/kundliChart";

export interface SsrKundliChartProps extends Omit<KundliChartInput, "language"> {
  language: "en" | "hi";
  className?: string;
  ariaLabel?: string;
}

export default function SsrKundliChart({
  language,
  className,
  ariaLabel,
  ...chart
}: SsrKundliChartProps) {
  const svg = renderKundliChartSvg({
    ...chart,
    language,
    showTitle: chart.showTitle ?? false,
  });

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel ?? (language === "hi" ? "कुंडली चार्ट" : "Kundli chart")}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}