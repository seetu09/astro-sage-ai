'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Sparkles } from 'lucide-react';
import KundliPDF from '@/app/components/KundliPDF';
import KundaliChart from '@/app/components/KundaliChart';

interface Planet {
  name: string;
  sign: string;
  house: number;
  degree: number;
  status: string;
}

interface KundliData {
  name: string;
  email: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  ascendant: string;
  moonSign: string;
  sunSign: string;
  nakshatra: string;
  planets: Planet[];
}

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const nakshatras = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

function generateMockKundli(formData: { name: string; email: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: string }): KundliData {
  const ascendant = signs[Math.floor(Math.random() * signs.length)];
  const moonSign = signs[Math.floor(Math.random() * signs.length)];
  const sunSign = signs[Math.floor(Math.random() * signs.length)];
  const nakshatra = nakshatras[Math.floor(Math.random() * nakshatras.length)];

  const planetData: Planet[] = planets.map((name) => ({
    name,
    sign: signs[Math.floor(Math.random() * signs.length)],
    house: Math.floor(Math.random() * 12) + 1,
    degree: Math.random() * 30,
    status: Math.random() > 0.7 ? 'Retrograde' : 'Direct',
  }));

  return {
    name: formData.name,
    email: formData.email,
    dateOfBirth: formData.dateOfBirth,
    timeOfBirth: formData.timeOfBirth,
    placeOfBirth: formData.placeOfBirth,
    ascendant,
    moonSign,
    sunSign,
    nakshatra,
    planets: planetData,
  };
}

export default function KundaliPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timeOfBirth, setTimeOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [kundliData, setKundliData] = useState<KundliData | null>(null);
  const [showPDF, setShowPDF] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = generateMockKundli({ name, email, dateOfBirth, timeOfBirth, placeOfBirth });
    setKundliData(data);
    setShowResult(true);
  };

  const handleBack = () => {
    setShowResult(false);
    setShowPDF(false);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-[#080811]">
      <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {!showResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FFD166]/20 to-[#E0A96D]/20 mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFD166]" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#F3F4F6] mb-2">
                Generate Your Kundli
              </h1>
              <p className="text-sm sm:text-base text-[#9CA3AF] px-2">
                Enter your birth details to generate a personalized Vedic birth chart with planetary positions and insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 glass-card p-4 sm:p-6 lg:p-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#9CA3AF] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#9CA3AF] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#9CA3AF] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm [color-scheme:dark]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#9CA3AF] mb-1">Time of Birth</label>
                  <input
                    type="time"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[#9CA3AF] mb-1">Place of Birth</label>
                <input
                  type="text"
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="City, State, Country"
                  className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-glow-gold transition-all mt-2"
              >
                Generate Kundli
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </button>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#F3F4F6] mb-1">
                Your Birth Chart
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF]">
                Generated for {kundliData?.name}
              </p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Date of Birth', value: kundliData?.dateOfBirth },
                { label: 'Time of Birth', value: kundliData?.timeOfBirth },
                { label: 'Place of Birth', value: kundliData?.placeOfBirth },
                { label: 'Ascendant', value: kundliData?.ascendant },
                { label: 'Moon Sign', value: kundliData?.moonSign },
                { label: 'Sun Sign', value: kundliData?.sunSign },
                { label: 'Nakshatra', value: kundliData?.nakshatra },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-[#6B7280] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm sm:text-base font-semibold text-[#F3F4F6] mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Interactive Kundali Chart */}
            {kundliData && (
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <KundaliChart
                  ascendant={kundliData.ascendant}
                  planets={kundliData.planets.map((p) => ({
                    symbol: PLANET_SYMBOLS[p.name] || p.name.slice(0, 2),
                    name: p.name,
                    house: p.house,
                    rashi: p.sign,
                    degree: p.degree,
                  }))}
                />
              </div>
            )}

            {/* Planetary Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="px-3 sm:px-4 py-3 border-b border-white/10">
                <h3 className="text-sm sm:text-base font-semibold text-[#F3F4F6]">Planetary Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6B7280]">Planet</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6B7280]">Sign</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6B7280]">House</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6B7280]">Degree</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6B7280]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kundliData?.planets.map((planet, i) => (
                      <tr key={i} className="border-b border-white/10 last:border-0 hover:bg-white/[0.03] transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[#F3F4F6]">{planet.name}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[#9CA3AF]">{planet.sign}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[#9CA3AF]">{planet.house}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[#9CA3AF]">{planet.degree.toFixed(1)}°</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                            planet.status === 'Retrograde'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-emerald-500/10 text-emerald-500'
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

            {/* PDF Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowPDF(true)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-sm sm:text-base font-medium rounded-xl hover:shadow-glow-gold transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Download PDF Report
              </button>
            </div>

            {showPDF && kundliData && (
              <KundliPDF
                userEmail={kundliData.email}
                userName={kundliData.name}
                kundliData={{
                  name: kundliData.name,
                  dateOfBirth: kundliData.dateOfBirth,
                  timeOfBirth: kundliData.timeOfBirth,
                  placeOfBirth: kundliData.placeOfBirth,
                  ascendant: kundliData.ascendant,
                  moonSign: kundliData.moonSign,
                  sunSign: kundliData.sunSign,
                  nakshatra: kundliData.nakshatra,
                  planets: kundliData.planets,
                }}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}