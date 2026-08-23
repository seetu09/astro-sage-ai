import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { computeChart, BirthDetails, ChartData, isValidChartData } from "@/lib/astrology";

// --- System prompt: grounded Vedic Astrologer persona with safety guardrails ---
const SYSTEM_PROMPT = `You are a grounded, insightful Vedic Astrologer (Jyotish Guru). You offer thoughtful astrological guidance rooted in Vedic tradition — drawing on grahas (planets), rashis (signs), bhavas (houses), nakshatras, dashas (planetary periods), and gochara (transits) where relevant. Stay warm, balanced, and honest about astrology's reflective nature: empower the seeker with insight rather than fostering fear or dependency.

SAFETY BOUNDARY — you must refuse to make definitive predictions on:
- Medical emergencies or critical health diagnoses
- Pregnancy outcomes
- Active legal disputes

When a user raises these sensitive topics, politely acknowledge their concern, explain that this falls outside responsible astrology, and steer them toward certified professionals: doctors for health matters, psychologists or therapists for mental well-being, and legal professionals for legal matters. Never diagnose, never predict medical outcomes, and never advise on ongoing court cases.`;

// --- Build the deterministic cache key from birth details ---
function buildCacheKey(details: BirthDetails): string {
  return [
    details.birthDate,
    details.birthTime,
    details.birthPlace || "unknown",
    details.latitude ?? "null",
    details.longitude ?? "null",
    details.timezoneOffset || "null",
  ].join("|");
}

// --- Generate the written interpretation via Gemini (temperature 0.2, chart-data-only) ---
async function generateInterpretation(chartData: ChartData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const chartJson = JSON.stringify(chartData, null, 2);

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nYou are given the exact, deterministic Vedic chart data (Lahiri Ayanamsa) computed by the local calculation engine. Interpret ONLY the provided planetary and house data. Do not recalculate, modify, or guess any astronomical positions. Base every statement strictly on the JSON chart data supplied.`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Here is the birth chart data (JSON):\n\n${chartJson}\n\nPlease provide a warm, insightful Vedic astrology interpretation covering: the Ascendant/Lagna and its significance, the Moon sign and nakshatra, the Sun sign, key planetary placements (house + sign + retrograde status), notable yogas, and practical guidance. Keep it structured and readable.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  if (!geminiResponse.ok) {
    const body = await geminiResponse.text().catch(() => "");
    throw new Error(`Gemini API error (${geminiResponse.status}): ${body.slice(0, 300)}`);
  }

  const json = await geminiResponse.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty interpretation");
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const details: BirthDetails = {
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      birthPlace: body.birthPlace,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      timezoneOffset: body.timezoneOffset ?? "+05:30",
    };

    if (!details.birthDate || !details.birthTime) {
      return NextResponse.json({ message: "Birth date and time are required" }, { status: 400 });
    }

    const cacheKey = buildCacheKey(details);

    // --- 1. Try Supabase cache first ---
    let chartData: ChartData | null = null;
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("kundali_charts")
        .select("chart_data")
        .eq("cache_key", cacheKey)
        .maybeSingle();

      if (!error && data?.chart_data && isValidChartData(data.chart_data)) {
        // Only trust rows stamped by the current engine with a valid flat
        // structure; legacy VedAstro-era / stale / corrupt rows fall through
        // to recomputation below and overwrite the row via the upsert.
        chartData = data.chart_data as ChartData;
      }
    } catch (cacheError) {
      // Cache failures must never block the response
      console.error("Kundali cache read failed:", cacheError);
    }

    // --- 2. If not cached, compute deterministically and store ---
    if (!chartData) {
      chartData = computeChart(details);

      try {
        const supabase = getSupabaseClient();
        await supabase.from("kundali_charts").upsert(
          {
            cache_key: cacheKey,
            birth_details: {
              birthDate: details.birthDate,
              birthTime: details.birthTime,
              birthPlace: details.birthPlace,
              latitude: details.latitude,
              longitude: details.longitude,
              timezoneOffset: details.timezoneOffset,
            },
            chart_data: chartData,
            created_at: new Date().toISOString(),
          },
          { onConflict: "cache_key" }
        );
      } catch (cacheError) {
        // Cache write failures must never block the response
        console.error("Kundali cache write failed:", cacheError);
      }
    }

    // --- 3. Generate the written interpretation via Gemini (always fresh) ---
    const FALLBACK_INTERPRETATION =
      "Your chart was generated successfully. Astrological reading is temporarily unavailable.";

    let interpretation = "";
    try {
      interpretation = await generateInterpretation(chartData);
    } catch (geminiError) {
      // Gemini failures (404/500/network) must never break the chart response
      console.error("Kundali interpretation failed:", geminiError);
    }

    // Guarantee interpretation is never undefined, null, or empty
    if (!interpretation || !interpretation.trim()) {
      interpretation = FALLBACK_INTERPRETATION;
    }

    return NextResponse.json({
      success: true,
      chartData,
      interpretation,
    });
  } catch (error) {
    console.error("Kundali generation failed:", error);
    return NextResponse.json({ message: "Failed to generate kundali" }, { status: 500 });
  }
}
