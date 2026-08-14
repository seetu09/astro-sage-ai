"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock, MapPin, User, Mail, ChevronDown } from "lucide-react";
import KundliPDF from "../components/KundliPDF";

const zodiacSigns = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
  "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

function getZodiacSign(day: number, month: number): string {
  const signs = [
    { sign: "Capricorn", lastDay: 19 },
    { sign: "Aquarius", lastDay: 18 },
    { sign: "Pisces", lastDay: 20 },
    { sign: "Aries", lastDay: 19 },
    { sign: "Taurus", lastDay: 20 },
    { sign: "Gemini", lastDay: 20 },
    { sign: "Cancer", lastDay: 22 },
    { sign: "Leo", lastDay: 22 },
    { sign: "Virgo", lastDay: 22 },
    { sign: "Libra", lastDay: 22 },
    { sign: "Scorpio", lastDay: 21 },
    { sign: "Sagittarius", lastDay: 21 },
    { sign: "Capricorn", lastDay: 31 },
  ];
  return signs[month].sign;
}

function getMoonSign(day: number, month: number): string {
  return zodiacSigns[(day + month * 2) % 12];
}

function getNakshatra(day: number): string {
  return nakshatras[day % nakshatras.length];
}

function getAscendant(day: number, month: number): string {
  return zodiacSigns[(day + month) % 12];
}

function getPlanetaryPositions(day: number, month: number) {
  return [
    { name: "Sun", sign: getZodiacSign(day, month), house: (day % 12) + 1, degree: (day * 10) % 30, status: "Exalted" },
    { name: "Moon", sign: getMoonSign(day, month), house: ((day + 3) % 12) + 1, degree: ((day + 5) * 8) % 30, status: "Neutral" },
    { name: "Mars", sign: zodiacSigns[(day + 2) % 12], house: ((day + 5) % 12) + 1, degree: ((day + 10) * 12) % 30, status: "Debilitated" },
    { name: "Mercury", sign: zodiacSigns[(day + 1) % 12], house: ((day + 2) % 12) + 1, degree: ((day + 2) * 15) % 30, status: "Neutral" },
    { name: "Jupiter", sign: zodiacSigns[(day + 4) % 12], house: ((day + 8) % 12) + 1, degree: ((day + 8) * 7) % 30, status: "Exalted" },
    { name: "Venus", sign: zodiacSigns[(day + 6) % 12], house: ((day + 3) % 12) + 1, degree: ((day + 3) * 11) % 30, status: "Neutral" },
    { name: "Saturn", sign: zodiacSigns[(day + 8) % 12], house: ((day + 12) % 12) + 1, degree: ((day + 12) * 9) % 30, status: "Neutral" },
    { name: "Rahu", sign: zodiacSigns[(day + 10) % 12], house: ((day + 6) % 12) + 1, degree: ((day + 15) * 6) % 30, status: "Malefic" },
    { name: "Ketu", sign: zodiacSigns[(day + 16) % 12], house: ((day + 11) % 12) + 1, degree: ((day + 21) * 14) % 30, status: "Malefic" },
  ];
}

export default function KundliPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [kundliData, setKundliData] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      alert("Please fill in all fields");
      return;
    }

    const dob = new Date(dateOfBirth);
    const day = dob.getDate();
    const month = dob.getMonth();

    const data = {
      name,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      ascendant: getAscendant(day, month),
      moonSign: getMoonSign(day, month),
      sunSign: getZodiacSign(day, month),
      nakshatra: getNakshatra(day),
      planets: getPlanetaryPositions(day, month),
    };

    setKundliData(data);
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-200">Vedic Astrology</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Generate Your Kundli
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Enter your birth details to generate a personalized Vedic birth chart with planetary positions and insights.
          </p>
        </motion.div>

        {/* Form */}
        {!showResult && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Time of Birth */}
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <Clock className="w-4 h-4" />
                  Time of Birth
                </label>
                <input
                  type="time"
                  value={timeOfBirth}
                  onChange={(e) => setTimeOfBirth(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Place of Birth */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-amber-500/25"
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Kundli
              </span>
            </button>
          </motion.form>
        )}

        {/* Results */}
        {showResult && kundliData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Back Button */}
            <button
              onClick={() => setShowResult(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
              Generate Another Kundli
            </button>

            {/* Basic Kundli Info */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-amber-400 to-purple-400 bg-clip-text text-transparent">
                Your Birth Chart
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-lg font-semibold">{kundliData.name}</p>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Date of Birth</p>
                  <p className="text-lg font-semibold">{kundliData.dateOfBirth}</p>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Time of Birth</p>
                  <p className="text-lg font-semibold">{kundliData.timeOfBirth}</p>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Place of Birth</p>
                  <p className="text-lg font-semibold">{kundliData.placeOfBirth}</p>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Ascendant (Lagna)</p>
                  <p className="text-lg font-semibold text-amber-400">{kundliData.ascendant}</p>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Moon Sign (Rashi)</p>
                  <p className="text-lg font-semibold text-amber-400">{kundliData.moonSign}</p>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Sun Sign</p>
                  <p className="text-lg font-semibold text-amber-400">{kundliData.sunSign}</p>
                </div>
                <div className="bg-amber-500/10 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm">Nakshatra</p>
                  <p className="text-lg font-semibold text-amber-400">{kundliData.nakshatra}</p>
                </div>
              </div>

              {/* Planetary Positions Table */}
              <h3 className="text-xl font-bold mb-4">Planetary Positions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-600/30">
                      <th className="p-3 text-left rounded-tl-lg">Planet</th>
                      <th className="p-3 text-left">Sign</th>
                      <th className="p-3 text-left">House</th>
                      <th className="p-3 text-left">Degree</th>
                      <th className="p-3 text-left rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kundliData.planets.map((planet: any, i: number) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white/5" : ""}>
                        <td className="p-3 font-semibold">{planet.name}</td>
                        <td className="p-3">{planet.sign}</td>
                        <td className="p-3">{planet.house}</td>
                        <td className="p-3">{planet.degree.toFixed(1)}°</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            planet.status === "Exalted" ? "bg-green-500/20 text-green-400" :
                            planet.status === "Debilitated" ? "bg-red-500/20 text-red-400" :
                            planet.status === "Malefic" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-gray-500/20 text-gray-400"
                          }`}>
                            {planet.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAYMENT SECTION - This is the NEW part */}
            <KundliPDF
              userEmail={email}
              userName={name}
              kundliData={kundliData}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
