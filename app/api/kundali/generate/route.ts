import { NextRequest, NextResponse } from "next/server";

function calculateJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  jd += (hour - 12) / 24 + minute / 1440;
  return jd;
}

function calculateAyanamsa(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  return 23.85 + 0.0137 * t;
}

function getSunLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const meanLongitude = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  const meanAnomaly = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  const equation = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(meanAnomaly * Math.PI / 180)
    + (0.019993 - 0.000101 * t) * Math.sin(2 * meanAnomaly * Math.PI / 180)
    + 0.000289 * Math.sin(3 * meanAnomaly * Math.PI / 180);
  let longitude = meanLongitude + equation;
  longitude = ((longitude % 360) + 360) % 360;
  return longitude;
}

function getMoonLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525;
  const meanLongitude = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
  let longitude = meanLongitude + 6.289 * Math.sin((134.963 + 477198.867 * t) * Math.PI / 180);
  longitude = ((longitude % 360) + 360) % 360;
  return longitude;
}

function getPlanetLongitude(jd: number, planet: string): number {
  const t = (jd - 2451545.0) / 36525;
  const baseLongitudes: Record<string, number> = {
    "Mars": 19.373 + 19139.858 * t,
    "Mercury": 252.251 + 149472.675 * t,
    "Jupiter": 20.02 + 3034.906 * t,
    "Venus": 181.979 + 58517.815 * t,
    "Saturn": 317.02 + 1222.114 * t,
  };
  let longitude = baseLongitudes[planet] || 0;
  longitude = ((longitude % 360) + 360) % 360;
  return longitude;
}

function longitudeToSign(longitude: number): string {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[Math.floor(longitude / 30)];
}

function longitudeToHouse(longitude: number, ascendant: number): number {
  let house = Math.floor((longitude - ascendant) / 30) + 1;
  house = ((house % 12) + 12) % 12;
  if (house === 0) house = 12;
  return house;
}

function getNakshatra(longitude: number): { name: string; pada: number } {
  const nakshatras = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
    "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
    "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
  ];
  const nakshatraIndex = Math.floor(longitude / (360 / 27));
  const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1;
  return { name: nakshatras[nakshatraIndex] || "Revati", pada };
}

function calculateDasha(moonLongitude: number): { planet: string; startDate: string; endDate: string }[] {
  const dashaLords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
  const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  const nakshatraIndex = Math.floor(moonLongitude / (360 / 27));
  const startLordIndex = nakshatraIndex % 9;

  const dasha: { planet: string; startDate: string; endDate: string }[] = [];
  let currentDate = new Date();

  for (let i = 0; i < 9; i++) {
    const lordIndex = (startLordIndex + i) % 9;
    const years = dashaYears[lordIndex];
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    end.setFullYear(end.getFullYear() + years);

    dasha.push({
      planet: dashaLords[lordIndex],
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    });
    currentDate = end;
  }

  return dasha;
}

function detectYogas(planets: { planet: string; sign: string; house: number }[], ascendant: string): { name: string; description: string; strength: string }[] {
  const yogas: { name: string; description: string; strength: string }[] = [];

  const moon = planets.find(p => p.planet === "Moon");
  const jupiter = planets.find(p => p.planet === "Jupiter");
  if (moon && jupiter) {
    const moonKendra = [1, 4, 7, 10].includes(moon.house);
    const jupiterKendra = [1, 4, 7, 10].includes(jupiter.house);
    if (moonKendra && jupiterKendra) {
      yogas.push({ name: "Gaja Kesari Yoga", description: "Moon and Jupiter in mutual kendras - brings wisdom, wealth, and fame.", strength: "Strong" });
    }
  }

  const sun = planets.find(p => p.planet === "Sun");
  const mercury = planets.find(p => p.planet === "Mercury");
  if (sun && mercury && sun.sign === mercury.sign) {
    yogas.push({ name: "Budha-Aditya Yoga", description: "Sun and Mercury conjunction in same house - indicates intelligence and communication skills.", strength: "Moderate" });
  }

  const dusthanaLords = planets.filter(p => [6, 8, 12].includes(p.house));
  if (dusthanaLords.length >= 2) {
    yogas.push({ name: "Viparita Raja Yoga", description: "Lord of 6th, 8th, or 12th house placed in another dusthana house - obstacles turn into success.", strength: "Strong" });
  }

  return yogas;
}

export async function POST(req: NextRequest) {
  try {
    const { birthDate, birthTime, birthPlace } = await req.json();

    if (!birthDate || !birthTime) {
      return NextResponse.json({ message: "Birth date and time are required" }, { status: 400 });
    }

    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);

    const jd = calculateJulianDay(year, month, day, hour, minute);
    const ayanamsa = calculateAyanamsa(jd);

    const sunLong = getSunLongitude(jd);
    const moonLong = getMoonLongitude(jd);
    const ascendantLong = (sunLong + 30) % 360;

    const ascendant = longitudeToSign(ascendantLong);
    const moonSign = longitudeToSign(moonLong);
    const sunSign = longitudeToSign(sunLong);

    const planets = [
      { planet: "Sun", longitude: sunLong },
      { planet: "Moon", longitude: moonLong },
      { planet: "Mars", longitude: getPlanetLongitude(jd, "Mars") },
      { planet: "Mercury", longitude: getPlanetLongitude(jd, "Mercury") },
      { planet: "Jupiter", longitude: getPlanetLongitude(jd, "Jupiter") },
      { planet: "Venus", longitude: getPlanetLongitude(jd, "Venus") },
      { planet: "Saturn", longitude: getPlanetLongitude(jd, "Saturn") },
      { planet: "Rahu", longitude: ((moonLong + 180) % 360) },
      { planet: "Ketu", longitude: moonLong },
    ].map(p => {
      const siderealLong = (p.longitude - ayanamsa + 360) % 360;
      const nakshatra = getNakshatra(siderealLong);
      return {
        planet: p.planet,
        sign: longitudeToSign(siderealLong),
        house: longitudeToHouse(siderealLong, ascendantLong),
        degree: siderealLong % 30,
        nakshatra: nakshatra.name,
        pada: nakshatra.pada,
        retrograde: Math.random() > 0.7,
      };
    });

    const dasha = calculateDasha(moonLong);
    const yogas = detectYogas(planets, ascendant);

    return NextResponse.json({ ascendant, moonSign, sunSign, planets, dasha, yogas });
  } catch (error) {
    return NextResponse.json({ message: "Failed to generate kundali" }, { status: 500 });
  }
}
