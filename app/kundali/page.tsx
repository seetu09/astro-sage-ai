'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Sparkles } from 'lucide-react';
import KundliPDF from '@/app/components/KundliPDF';

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
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {!showResult ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2">
                Generate Your Kundli
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] px-2">
                Enter your birth details to generate a personalized Vedic birth chart with planetary positions and insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 lg:p-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
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
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
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
                  <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1">Time of Birth</label>
                  <input
                    type="time"
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    className="w-full astro-input py-2.5 sm:py-3 px-3 sm:px-4 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-[var(--text-secondary)] mb-1">Place of Birth</label>
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
                className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all mt-2"
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
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Form
            </button>

            {/* Header */}
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)] mb-1">
                Your Birth Chart
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Generated for {kundliData?.name}
              </p>
            </div>

            {/* Info Cards - Stack on mobile, grid on tablet+ */}
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
                <div key={item.label} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm sm:text-base font-semibold text-[var(--text-primary)] mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Planetary Table - Horizontal scroll on mobile */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="px-3 sm:px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">Planetary Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">Planet</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">Sign</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">House</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">Degree</th>
                      <th className="text-left px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-muted)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kundliData?.planets.map((planet, i) => (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover-bg)]/50 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-[var(--text-primary)]">{planet.name}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">{planet.sign}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">{planet.house}</td>
                        <td className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">{planet.degree.toFixed(1)}°</td>
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
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm sm:text-base font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Download PDF Report
              </button>
            </div>

            {showPDF && kundliData && (
              <KundliPDF
                report={{
                  personalInfo: {
                    name: kundliData.name,
                    dateOfBirth: kundliData.dateOfBirth,
                    timeOfBirth: kundliData.timeOfBirth,
                    placeOfBirth: kundliData.placeOfBirth,
                    ascendant: kundliData.ascendant,
                    moonSign: kundliData.moonSign,
                    sunSign: kundliData.sunSign,
                    nakshatra: kundliData.nakshatra,
                  },
                  planetaryPositions: kundliData.planets,
                  dashas: [
                    { planet: 'Jupiter', startYear: 2024, endYear: 2040, years: 16 },
                    { planet: 'Saturn', startYear: 2040, endYear: 2059, years: 19 },
                    { planet: 'Mercury', startYear: 2059, endYear: 2076, years: 17 },
                  ],
                  predictions: [
                    'Your Jupiter dasha indicates a period of growth and expansion in career and wisdom.',
                    'Saturn transit suggests discipline and hard work will yield long-term rewards.',
                    'Venus influence brings harmony in relationships and creative pursuits.',
                  ],
                  yogas: [
                    { name: 'Gaja Kesari Yoga', description: 'Moon and Jupiter in favorable positions bring wisdom, prosperity, and good fortune.' },
                    { name: 'Budha-Aditya Yoga', description: 'Sun and Mercury conjunction enhances intelligence and communication skills.' },
                  ],
                  doshas: [
                    { name: 'Mangal Dosha', present: Math.random() > 0.5, severity: 'Low' },
                    { name: 'Kaal Sarp Dosha', present: Math.random() > 0.7, severity: 'Moderate' },
                  ],
                  gemstones: [
                    { name: 'Yellow Sapphire (Pukhraj)', planet: 'Jupiter', benefit: 'Wisdom and prosperity', finger: 'Index', metal: 'Gold', day: 'Thursday' },
                    { name: 'Blue Sapphire (Neelam)', planet: 'Saturn', benefit: 'Discipline and focus', finger: 'Middle', metal: 'Silver', day: 'Saturday' },
                  ],
                  remedies: [
                    'Chant the Guru Beej Mantra 108 times every Thursday.',
                    'Donate yellow items to Brahmins on Thursdays.',
                    'Wear yellow clothes on Thursdays for Jupiter blessings.',
                  ],
                  favorableColors: ['Yellow', 'Orange', 'Golden'],
                  favorableNumbers: ['3', '12', '21'],
                  favorableDirections: ['East', 'North'],
                }}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
