"use client";

import { useState } from "react";
import { Star, Moon, Sun, Calendar, Clock, MapPin, Sparkles } from "lucide-react";

interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
}

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function calculateNakshatra(longitude: number): { nakshatra: string; pada: number } {
  const nakshatraIndex = Math.floor(longitude / (360 / 27));
  const pada = Math.floor((longitude % (360 / 27)) / (360 / 108)) + 1;
  return {
    nakshatra: NAKSHATRAS[Math.min(nakshatraIndex, 26)],
    pada: Math.min(pada, 4),
  };
}

function calculatePlanetPositions(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): PlanetPosition[] {
  // Simplified calculation for demo - in production use proper ephemeris
  const planets = [
    { name: "Sun", baseLong: 0, speed: 0.9856 },
    { name: "Moon", baseLong: 0, speed: 13.1764 },
    { name: "Mars", baseLong: 0, speed: 0.5240 },
    { name: "Mercury", baseLong: 0, speed: 4.0923 },
    { name: "Jupiter", baseLong: 0, speed: 0.0831 },
    { name: "Venus", baseLong: 0, speed: 1.6021 },
    { name: "Saturn", baseLong: 0, speed: 0.0334 },
    { name: "Rahu", baseLong: 120, speed: -0.0532 },
    { name: "Ketu", baseLong: 300, speed: -0.0532 },
  ];

  const date = new Date(year, month - 1, day, hour, minute);
  const daysSinceEpoch = date.getTime() / (1000 * 60 * 60 * 24);

  return planets.map((planet) => {
    let longitude = (planet.baseLong + planet.speed * daysSinceEpoch) % 360;
    if (longitude < 0) longitude += 360;

    const signIndex = Math.floor(longitude / 30);
    const degree = longitude % 30;
    const { nakshatra, pada } = calculateNakshatra(longitude);

    return {
      name: planet.name,
      sign: SIGNS[signIndex],
      degree: Math.round(degree * 100) / 100,
      nakshatra,
      pada,
    };
  });
}

function getAscendant(year: number, month: number, day: number, hour: number, minute: number): string {
  const date = new Date(year, month - 1, day, hour, minute);
  const hourOfDay = date.getHours() + date.getMinutes() / 60;
  const ascIndex = Math.floor((hourOfDay / 2) % 12);
  return SIGNS[ascIndex];
}

export default function Home() {
  const [birthData, setBirthData] = useState({
    name: "",
    date: "",
    time: "",
    place: "",
  });
  const [chart, setChart] = useState<PlanetPosition[] | null>(null);
  const [ascendant, setAscendant] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateChart = () => {
    if (!birthData.date || !birthData.time) return;

    setLoading(true);
    setTimeout(() => {
      const [year, month, day] = birthData.date.split("-").map(Number);
      const [hour, minute] = birthData.time.split(":").map(Number);

      const positions = calculatePlanetPositions(year, month, day, hour, minute);
      const asc = getAscendant(year, month, day, hour, minute);

      setChart(positions);
      setAscendant(asc);
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-amber-400 animate-pulse" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
            AstroSage AI
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Discover your cosmic blueprint with AI-powered Vedic astrology birth chart analysis
          </p>
        </div>

        {/* Birth Data Form */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-400" />
            Enter Your Birth Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Full Name</label>
              <input
                type="text"
                value={birthData.name}
                onChange={(e) => setBirthData({ ...birthData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="Enter your name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthData.date}
                  onChange={(e) => setBirthData({ ...birthData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Birth Time
                </label>
                <input
                  type="time"
                  value={birthData.time}
                  onChange={(e) => setBirthData({ ...birthData, time: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Birth Place
              </label>
              <input
                type="text"
                value={birthData.place}
                onChange={(e) => setBirthData({ ...birthData, place: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="City, Country"
              />
            </div>

            <button
              onClick={generateChart}
              disabled={!birthData.date || !birthData.time || loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Birth Chart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Birth Chart Results */}
        {chart && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                <Moon className="w-6 h-6 text-amber-400" />
                Your Vedic Birth Chart
              </h2>
              <p className="text-slate-300 mb-6">
                Ascendant (Lagna): <span className="text-amber-400 font-semibold">{ascendant}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chart.map((planet) => (
                  <div
                    key={planet.name}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-amber-400/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {planet.name === "Sun" && <Sun className="w-5 h-5 text-yellow-400" />}
                      {planet.name === "Moon" && <Moon className="w-5 h-5 text-slate-300" />}
                      {planet.name === "Mars" && <Star className="w-5 h-5 text-red-400" />}
                      {!["Sun", "Moon", "Mars"].includes(planet.name) && (
                        <Star className="w-5 h-5 text-amber-400" />
                      )}
                      <span className="font-semibold">{planet.name}</span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-300">
                      <p>
                        Sign: <span className="text-white">{planet.sign}</span>
                      </p>
                      <p>
                        Degree: <span className="text-white">{planet.degree}°</span>
                      </p>
                      <p>
                        Nakshatra: <span className="text-amber-400">{planet.nakshatra}</span>
                      </p>
                      <p>
                        Pada: <span className="text-white">{planet.pada}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400 text-sm">
          <p>Powered by AI • Vedic Astrology • Birth Chart Analysis</p>
        </div>
      </div>
    </main>
  );
}