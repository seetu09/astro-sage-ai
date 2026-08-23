import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// --- System prompt: grounded Vedic Astrologer persona with safety guardrails ---
const SYSTEM_PROMPT = `You are a grounded, insightful Vedic Astrologer (Jyotish Guru). You offer thoughtful astrological guidance rooted in Vedic tradition — drawing on grahas (planets), rashis (signs), bhavas (houses), nakshatras, dashas (planetary periods), and gochara (transits) where relevant. Stay warm, balanced, and honest about astrology's reflective nature: empower the seeker with insight rather than fostering fear or dependency.

SAFETY BOUNDARY — you must refuse to make definitive predictions on:
- Medical emergencies or critical health diagnoses
- Pregnancy outcomes
- Active legal disputes

When a user raises these sensitive topics, politely acknowledge their concern, explain that this falls outside responsible astrology, and steer them toward certified professionals: doctors for health matters, psychologists or therapists for mental well-being, and legal professionals for legal matters. Never diagnose, never predict medical outcomes, and never advise on ongoing court cases.`;

const VEDASTRO_API = "https://api.vedastro.org/api/Calculate";
const VEDASTRO_API_KEY = "FreeAPIUser";

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

interface BirthDetails {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  birthPlace: string;
  latitude: number | null;
  longitude: number | null;
  timezoneOffset: string; // e.g. "+05:30"
}

interface PlanetData {
  name: string;
  sign: string;
  house: number;
  degree: number;
  status: string;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
}

interface ChartData {
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: PlanetData[];
  houses: { house: number; sign: string }[];
}

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

// --- Convert YYYY-MM-DD + HH:MM + offset into VedAstro StdTime "HH:MM DD/MM/YYYY +05:30" ---
function buildStdTime(details: BirthDetails): string {
  const [year, month, day] = details.birthDate.split("-");
  const time = details.birthTime || "12:00";
  const offset = details.timezoneOffset || "+05:30";
  return `${time} ${day}/${month}/${year} ${offset}`;
}

// --- Call VedAstro AllPlanetData (single call returns all 9 planets) ---
async function fetchAllPlanetData(details: BirthDetails): Promise<any> {
  const response = await fetch(`${VEDASTRO_API}/AllPlanetData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": VEDASTRO_API_KEY,
    },
    body: JSON.stringify({
      PlanetName: "All",
      Time: {
        StdTime: buildStdTime(details),
        Location: {
          Name: details.birthPlace || "Unknown",
          Longitude: details.longitude ?? 0,
          Latitude: details.latitude ?? 0,
        },
      },
      Ayanamsa: "LAHIRI",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`VedAstro AllPlanetData failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const json = await response.json();
  return json.Payload?.AllPlanetData ?? null;
}

// --- Call VedAstro AllHouseData for a single house (returns HouseBhavaChalitSign) ---
async function fetchHouseData(details: BirthDetails, houseName: string): Promise<string | null> {
  const response = await fetch(`${VEDASTRO_API}/AllHouseData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": VEDASTRO_API_KEY,
    },
    body: JSON.stringify({
      PlanetName: "All",
      houseName,
      Time: {
        StdTime: buildStdTime(details),
        Location: {
          Name: details.birthPlace || "Unknown",
          Longitude: details.longitude ?? 0,
          Latitude: details.latitude ?? 0,
        },
      },
      Ayanamsa: "LAHIRI",
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`VedAstro AllHouseData (${houseName}) failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const json = await response.json();
  return json.Payload?.AllHouseData?.HouseBhavaChalitSign?.Name ?? null;
}

// --- Normalize VedAstro planet payload into our ChartData shape ---
function normalizePlanets(allPlanetData: any): PlanetData[] {
  const planets: PlanetData[] = [];

  for (const name of PLANET_ORDER) {
    const raw = allPlanetData?.[name];
    if (!raw) continue;

    const sign = raw.PlanetRasiD1Sign?.Name ?? "Unknown";
    const degree = raw.PlanetRasiD1Sign?.DegreesIn?.TotalDegrees ?? 0;
    const houseStr = raw.HousePlanetOccupiesBasedOnLongitudes ?? "";
    const house = parseInt(houseStr.replace("House", ""), 10) || 0;
    const retrograde = raw.IsPlanetRetrograde === "True";

    // PlanetConstellation format: "Makha - 2" (nakshatra name + pada)
    let nakshatra = "Unknown";
    let pada = 1;
    const constellation = raw.PlanetConstellation ?? "";
    const match = constellation.match(/^(.+?)\s*-\s*(\d+)$/);
    if (match) {
      nakshatra = match[1].trim();
      pada = parseInt(match[2], 10) || 1;
    } else if (constellation) {
      nakshatra = constellation.trim();
    }

    planets.push({
      name,
      sign,
      house,
      degree,
      status: retrograde ? "Retrograde" : "Direct",
      nakshatra,
      pada,
      retrograde,
    });
  }

  return planets;
}

// --- Fetch chart data from VedAstro (planets + all 12 houses) ---
async function fetchChartData(details: BirthDetails): Promise<ChartData> {
  const [allPlanetData, ...houseSigns] = await Promise.all([
    fetchAllPlanetData(details),
    ...Array.from({ length: 12 }, (_, i) => fetchHouseData(details, `House${i + 1}`)),
  ]);

  const planets = normalizePlanets(allPlanetData);

  const moon = planets.find((p) => p.name === "Moon");
  const sun = planets.find((p) => p.name === "Sun");

  const houses = houseSigns.map((sign, i) => ({ house: i + 1, sign: sign ?? "Unknown" }));
  const ascendant = houses[0]?.sign ?? "Unknown";

  return {
    ascendant,
    moonSign: moon?.sign ?? "Unknown",
    sunSign: sun?.sign ?? "Unknown",
    nakshatra: moon?.nakshatra ?? "Unknown",
    planets,
    houses,
  };
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
              text: `${SYSTEM_PROMPT}\n\nYou are given the exact, deterministic Vedic chart data (Lahiri Ayanamsa) computed by the VedAstro engine. Interpret ONLY the provided planetary and house data. Do not recalculate, modify, or guess any astronomical positions. Base every statement strictly on the JSON chart data supplied.`,
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

      if (!error && data?.chart_data) {
        chartData = data.chart_data as ChartData;
      }
    } catch (cacheError) {
      // Cache failures must never block the response
      console.error("Kundali cache read failed:", cacheError);
    }

    // --- 2. If not cached, fetch from VedAstro and store ---
    if (!chartData) {
      chartData = await fetchChartData(details);

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

    return NextResponse.json({ chartData, interpretation });
  } catch (error) {
    console.error("Kundali generation failed:", error);
    return NextResponse.json({ message: "Failed to generate kundali" }, { status: 500 });
  }
}