import { NextRequest, NextResponse } from "next/server";
import { checkDoshasFromBirthDetails, type BirthDetailsFromDate, type DoshaCheckResultWithPositions } from "@/lib/dosha-checker";
import { getClientIp, checkRateLimit } from "@/lib/rateLimit";

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

    // Default timezone (IST for India)
    // TODO: In production, use a proper timezone API or let user select timezone
    const timezone = "+05:30";

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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check (10 requests per minute per IP)
    const ip = getClientIp(request);
    const rateLimitResult = checkRateLimit(`dosha-check:${ip}`, 10, 60000);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, dob, tob, place } = body;

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

    // Geocode the place
    const geoResult = await geocodePlace(place);
    
    if (!geoResult) {
      return NextResponse.json(
        { error: "Could not find the specified location. Please try a more specific place name (e.g., 'New Delhi, India' instead of just 'Delhi')." },
        { status: 400 }
      );
    }

    // Prepare birth details for chart computation
    const birthDetails: BirthDetailsFromDate = {
      name: name || "User",
      birthDate: dob,
      birthTime: tob,
      birthPlace: place,
      latitude: geoResult.latitude,
      longitude: geoResult.longitude,
      timezoneOffset: geoResult.timezone,
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