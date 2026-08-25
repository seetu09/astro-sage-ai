import { NextRequest, NextResponse } from "next/server";
import type { FullKundliReportData } from "@/types/kundali";
import {
  buildFallbackPillars,
  buildPillarSystemPrompt,
  buildPillarUserPrompt,
  parseAndValidatePillars,
  PILLAR_KEYS,
  type LifePillarConfig,
} from "@/lib/pillarNarratives";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * POST /api/kundali/narratives
 *
 * Generates the six Life Pillar narratives (career, wealth, marriage, health,
 * education, family) for a complete kundli report in a target language.
 *
 * Request body:
 *   { "report": FullKundliReportData, "language": "en" | "hi" }
 *
 * Response:
 *   { "success": true, "language": "en"|"hi", "source": "ai"|"fallback",
 *     "pillars": LifePillarConfig[] }
 *
 * The returned `pillars` array is fully validated against the report layout
 * props (hard character caps, canonical titles/pages, milestone limits, and
 * pure-Devanagari enforcement for Hindi), so it can be passed straight into
 * `ReportRenderer`. When the model is unavailable, a deterministic fallback
 * set built from the chart facts is returned instead — the endpoint never
 * fails on AI outages.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "A JSON body is required" }, { status: 400 });
    }

    const rawLang = typeof body.language === "string" ? body.language.trim().toLowerCase() : "en";
    const lang: "en" | "hi" = rawLang === "hi" ? "hi" : "en";
    const report = body.report as FullKundliReportData | undefined;

    if (!report?.chartData) {
      return NextResponse.json(
        { error: "A valid FullKundliReportData payload with chartData is required" },
        { status: 400 }
      );
    }

    const fallback: LifePillarConfig[] = buildFallbackPillars(report, lang);
    let pillars: LifePillarConfig[] = fallback;
    let source: "ai" | "fallback" = "fallback";

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const system = buildPillarSystemPrompt(lang);
        const user = buildPillarUserPrompt(report, lang);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: "user", parts: [{ text: user }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errBody = await geminiRes.text().catch(() => "");
          throw new Error(`Gemini API error (${geminiRes.status}): ${errBody.slice(0, 200)}`);
        }

        const geminiJson = await geminiRes.json();
        const text = geminiJson?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("")
          .trim();

        if (text) {
          pillars = parseAndValidatePillars(text, fallback);
          source = "ai";
        }
      } catch (err) {
        // AI failures must never break the response — fall back to the
        // deterministic, chart-grounded pillar set.
        console.error("Pillar narrative generation failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      language: lang,
      source,
      pillars,
      keys: PILLAR_KEYS,
    });
  } catch (err) {
    console.error("Pillar narrative route failed:", err);
    return NextResponse.json({ error: "Failed to generate pillar narratives" }, { status: 500 });
  }
}
