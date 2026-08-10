export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", date: "Mar 21 - Apr 19", element: "Fire" },
  { name: "Taurus", symbol: "♉", date: "Apr 20 - May 20", element: "Earth" },
  { name: "Gemini", symbol: "♊", date: "May 21 - Jun 20", element: "Air" },
  { name: "Cancer", symbol: "♋", date: "Jun 21 - Jul 22", element: "Water" },
  { name: "Leo", symbol: "♌", date: "Jul 23 - Aug 22", element: "Fire" },
  { name: "Virgo", symbol: "♍", date: "Aug 23 - Sep 22", element: "Earth" },
  { name: "Libra", symbol: "♎", date: "Sep 23 - Oct 22", element: "Air" },
  { name: "Scorpio", symbol: "♏", date: "Oct 23 - Nov 21", element: "Water" },
  { name: "Sagittarius", symbol: "♐", date: "Nov 22 - Dec 21", element: "Fire" },
  { name: "Capricorn", symbol: "♑", date: "Dec 22 - Jan 19", element: "Earth" },
  { name: "Aquarius", symbol: "♒", date: "Jan 20 - Feb 18", element: "Air" },
  { name: "Pisces", symbol: "♓", date: "Feb 19 - Mar 20", element: "Water" },
];

export interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  isRetrograde?: boolean;
  isExalted?: boolean;
  isDebilitated?: boolean;
}

export function calculateNakshatra(longitude: number): { nakshatra: string; pada: number } {
  const nakshatraIndex = Math.floor(longitude / (360 / 27));
  const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1;
  return {
    nakshatra: NAKSHATRAS[Math.min(nakshatraIndex, 26)],
    pada: Math.min(pada, 4),
  };
}

export function calculatePlanetPositions(
  year: number, month: number, day: number, hour: number, minute: number
): PlanetPosition[] {
  const planets = [
    { name: "Sun", baseLong: 280, speed: 0.9856 },
    { name: "Moon", baseLong: 120, speed: 13.1764 },
    { name: "Mars", baseLong: 200, speed: 0.5240 },
    { name: "Mercury", baseLong: 180, speed: 4.0923 },
    { name: "Jupiter", baseLong: 240, speed: 0.0831 },
    { name: "Venus", baseLong: 330, speed: 1.6021 },
    { name: "Saturn", baseLong: 300, speed: 0.0334 },
    { name: "Rahu", baseLong: 100, speed: -0.0532 },
    { name: "Ketu", baseLong: 280, speed: -0.0532 },
  ];

  const date = new Date(year, month - 1, day, hour, minute);
  const daysSinceEpoch = (date.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24);

  return planets.map((planet) => {
    let longitude = (planet.baseLong + planet.speed * daysSinceEpoch) % 360;
    if (longitude < 0) longitude += 360;

    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;
    const { nakshatra, pada } = calculateNakshatra(longitude);

    const exaltationPoints: Record<string, number> = {
      Sun: 10, Moon: 33, Mars: 298, Mercury: 165, Jupiter: 95, Venus: 357, Saturn: 200
    };
    const debilitationPoints: Record<string, number> = {
      Sun: 190, Moon: 213, Mars: 118, Mercury: 345, Jupiter: 275, Venus: 177, Saturn: 20
    };

    const isExalted = Math.abs(longitude - (exaltationPoints[planet.name] || -999)) < 10;
    const isDebilitated = Math.abs(longitude - (debilitationPoints[planet.name] || -999)) < 10;

    return {
      name: planet.name,
      sign: SIGNS[signIndex],
      degree: Math.round(degree * 100) / 100,
      nakshatra,
      pada,
      isRetrograde: planet.speed < 0 || (planet.name === "Mercury" && Math.random() > 0.7),
      isExalted,
      isDebilitated,
    };
  });
}

export function getAscendant(year: number, month: number, day: number, hour: number, minute: number): string {
  const date = new Date(year, month - 1, day, hour, minute);
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const ascIndex = Math.floor((dayOfYear * 2 + hour / 2) % 12);
  return SIGNS[ascIndex];
}

export function getMoonSign(planets: PlanetPosition[]): string {
  return planets.find(p => p.name === "Moon")?.sign || "Aries";
}

export function getSunSign(planets: PlanetPosition[]): string {
  return planets.find(p => p.name === "Sun")?.sign || "Aries";
}

export function getDailyHoroscope(sign: string): string {
  const horoscopes: Record<string, string> = {
    "Aries": "Today brings new energy for creative projects. Your ruling planet Mars supports bold actions. Focus on leadership opportunities.",
    "Taurus": "Financial stability is highlighted today. Venus brings harmony to relationships. Good day for long-term investments.",
    "Gemini": "Communication is your strength today. Mercury enhances your intellectual pursuits. Network and share ideas freely.",
    "Cancer": "Emotional clarity arrives today. The Moon supports introspection. Focus on home and family matters.",
    "Leo": "Your natural charisma shines today. The Sun illuminates your path. Take center stage in important matters.",
    "Virgo": "Attention to detail pays off today. Mercury supports analytical work. Organize and streamline your processes.",
    "Libra": "Balance and harmony are your themes today. Venus brings beauty and love. Seek partnerships and collaborations.",
    "Scorpio": "Transformation is in the air today. Pluto's energy supports deep changes. Embrace your intuitive powers.",
    "Sagittarius": "Adventure calls today. Jupiter expands your horizons. Explore new philosophies and travel opportunities.",
    "Capricorn": "Discipline brings rewards today. Saturn supports structured efforts. Focus on career advancement.",
    "Aquarius": "Innovation is your ally today. Uranus sparks unique ideas. Embrace unconventional solutions.",
    "Pisces": "Intuition guides you today. Neptune enhances spiritual connections. Trust your dreams and creative visions."
  };
  return horoscopes[sign] || "The stars align in your favor today. Stay open to cosmic guidance.";
}
