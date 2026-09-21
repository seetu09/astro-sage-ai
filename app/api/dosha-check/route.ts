import { NextRequest, NextResponse } from "next/server";
import { checkDoshasFromBirthDetails, type BirthDetailsFromDate, type DoshaCheckResultWithPositions } from "@/lib/dosha-checker";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";
import { DEFAULT_TIMEZONE, parseFixedOffsetMinutes, resolveOffsetMinutes } from "@/lib/timezone";

// Geocode a place name using Nominatim (free, no API key required)
// TODO: Consider using OpenCage or Google Geocoding API for production use
// as Nominatim has usage limits (1 request per second) and may be rate-limited
async function geocodePlace(place: string): Promise<{ latitude: number; longitude: number; timezone: string } | null> {
  if (!place || place.trim().length < 3) {
    return null;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "AstroSage-AI/1.0 (contact@astrosage.ai)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    // If the server resolved a location but no timezone came from the
    // geocoder, fall back to the default (IST) with a warning log.
    const timezone = DEFAULT_TIMEZONE;

    return {
      latitude,
      longitude,
      timezone,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return null;
  }
}

/**
 * Convert signed minutes from UTC into a "+HH:MM" / "-HH:MM" string.
 * e.g. 330 → "+05:30", -240 → "-04:00", 0 → "+00:00"
 */
function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

/**
 * Resolve a timezone value (either a fixed offset like "+05:30" or an IANA
 * zone name like "America/New_York") into a "+HH:MM" string for the astrology
 * engine. Returns null when the timezone cannot be resolved.
 */
function resolveTimezoneOffset(
  timezone: string,
  dob: string,
  tob: string,
): string | null {
  // Fixed offset?
  const fixed = parseFixedOffsetMinutes(timezone);
  if (fixed !== null) {
    return formatOffset(fixed);
  }

  // IANA zone name — resolve against the birth moment
  const at = new Date(`${dob}T${tob}:00`);
  const offset = resolveOffsetMinutes(timezone, at);
  if (offset === null) return null;

  return formatOffset(offset);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (10 requests per minute per IP)
    const ip = getClientIp(request);
    const rateLimitResult = await checkRateLimit(`dosha-check:${ip}`, 10, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, dob, tob, place } = body;

    // Optional coordinates and timezone — used to skip server-side geocoding
    // when the client already has them from its own geocoding step.
    const rawLat = body.latitude;
    const rawLng = body.longitude;
    const rawTz = body.timezone;

    // Validate optional fields: ignore rather than throw on malformed input
    const latitude: number | undefined =
      typeof rawLat === 'number' && Number.isFinite(rawLat) ? rawLat : undefined;
    const longitude: number | undefined =
      typeof rawLng === 'number' && Number.isFinite(rawLng) ? rawLng : undefined;
    const timezone: string | undefined =
      typeof rawTz === 'string' && rawTz.trim().length > 0 ? rawTz.trim() : undefined;

    // Validate required fields
    if (!dob || !tob || !place) {
      return NextResponse.json(
        { error: "Date of birth, time of birth, and place of birth are required." },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
      return NextResponse.json(
        { error: "Invalid date format. Please use YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(tob)) {
      return NextResponse.json(
        { error: "Invalid time format. Please use HH:MM format (24-hour)." },
        { status: 400 }
      );
    }

    // --- Resolve coordinates and timezone ---
    let resolvedLatitude: number;
    let resolvedLongitude: number;
    let timezoneOffset: string;

    if (latitude !== undefined && longitude !== undefined && timezone !== undefined) {
      // Client provided everything — skip server-side geocoding
      resolvedLatitude = latitude;
      resolvedLongitude = longitude;
      timezoneOffset = timezone;
    } else {
      // Fall back to Nominatim geocoding
      const geoResult = await geocodePlace(place);

      if (!geoResult) {
        return NextResponse.json(
          { error: "Could not find the specified location. Please try a more specific place name (e.g., 'New Delhi, India' instead of just 'Delhi')." },
          { status: 400 }
        );
      }

      resolvedLatitude = geoResult.latitude;
      resolvedLongitude = geoResult.longitude;

      if (!timezone) {
        console.warn(
          `[dosha-check] no timezone provided for place=${place}, defaulting to ${DEFAULT_TIMEZONE}`,
        );
        timezoneOffset = DEFAULT_TIMEZONE;
      } else {
        timezoneOffset = timezone;
      }
    }

    // Resolve the timezone string to a fixed "+HH:MM" offset
    const resolved = resolveTimezoneOffset(timezoneOffset, dob, tob);
    if (resolved === null) {
      return NextResponse.json(
        {
          error:
            "Could not resolve the timezone for the birth place. Please try a nearby city.",
          success: false,
        },
        { status: 400 },
      );
    }

    // Prepare birth details for chart computation
    const birthDetails: BirthDetailsFromDate = {
      name: name || "User",
      birthDate: dob,
      birthTime: tob,
      birthPlace: place,
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
      timezoneOffset: resolved,
    };

    // Calculate doshas using the new function
    const result: DoshaCheckResultWithPositions = checkDoshasFromBirthDetails(birthDetails, "en");

    // Return the result with calculated positions
    return NextResponse.json({
      success: true,
      positions: result.positions,
      doshas: {
        manglik: result.manglik,
        sadeSati: result.sadeSati,
      },
      overall: result.overall,
    });
  } catch (error) {
    console.error("Dosha check API error:", error);
    return NextResponse.json(
      { error: "An error occurred while calculating doshas. Please try again." },
      { status: 500 }
    );
  }
}