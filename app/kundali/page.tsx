"use client";

import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Calendar, Clock, MapPin, Search, Star, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
}

interface KundaliData {
  ascendant: string;
  moonSign: string;
  sunSign: string;
  planets: PlanetPosition[];
  dasha: { planet: string; startDate: string; endDate: string }[];
  yogas: { name: string; description: string; strength: string }[];
}

export default function KundaliPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chart" | "planets" | "dasha" | "yogas">("chart");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    birthDate: user?.birthDate || "",
    birthTime: user?.birthTime || "",
    birthPlace: user?.birthPlace || "",
  });
  const [kundali, setKundali] = useState<KundaliData | null>(null);
  const [loading, setLoading] = useState(false);

  const generateKundali = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kundali/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setKundali(data);
      }
    } catch (error) {
      console.error("Failed to generate kundali:", error);
    } finally {
      setLoading(false);
    }
  };

  const demoKundali: KundaliData = {
    ascendant: "Leo",
    moonSign: "Scorpio",
    sunSign: "Virgo",
    planets: [
      { planet: "Sun", sign: "Virgo", house: 2, degree: 15.5, nakshatra: "Hasta", pada: 2, retrograde: false },
      { planet: "Moon", sign: "Scorpio", house: 4, degree: 8.2, nakshatra: "Anuradha", pada: 1, retrograde: false },
      { planet: "Mars", sign: "Leo", house: 1, degree: 22.1, nakshatra: "Purva Phalguni", pada: 3, retrograde: false },
      { planet: "Mercury", sign: "Virgo", house: 2, degree: 5.8, nakshatra: "Uttara Phalguni", pada: 2, retrograde: true },
      { planet: "Jupiter", sign: "Taurus", house: 10, degree: 18.3, nakshatra: "Rohini", pada: 4, retrograde: false },
      { planet: "Venus", sign: "Libra", house: 3, degree: 12.7, nakshatra: "Swati", pada: 2, retrograde: false },
      { planet: "Saturn", sign: "Aquarius", house: 7, degree: 28.4, nakshatra: "Purva Bhadrapada", pada: 3, retrograde: true },
      { planet: "Rahu", sign: "Aries", house: 9, degree: 3.1, nakshatra: "Ashwini", pada: 1, retrograde: true },
      { planet: "Ketu", sign: "Libra", house: 3, degree: 3.1, nakshatra: "Chitra", pada: 3, retrograde: true },
    ],
    dasha: [
      { planet: "Jupiter", startDate: "2020-05-15", endDate: "2036-05-15" },
      { planet: "Saturn", startDate: "2036-05-15", endDate: "2055-05-15" },
      { planet: "Mercury", startDate: "2055-05-15", endDate: "2072-05-15" },
    ],
    yogas: [
      { name: "Gaja Kesari Yoga", description: "Moon and Jupiter in mutual kendras - brings wisdom, wealth, and fame.", strength: "Strong" },
      { name: "Budha-Aditya Yoga", description: "Sun and Mercury conjunction in same house - indicates intelligence and communication skills.", strength: "Moderate" },
      { name: "Viparita Raja Yoga", description: "Lord of 6th, 8th, or 12th house placed in another dusthana house - obstacles turn into success.", strength: "Strong" },
    ],
  };

  const displayKundali = kundali || demoKundali;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Your Vedic Birth Chart
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Generate your personalized Kundali with planetary positions, dasha periods, and auspicious yogas.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 mb-8">
          <form onSubmit={generateKundali} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name" className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Birth Date
              </label>
              <input type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} required
                className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Birth Time
              </label>
              <input type="time" value={formData.birthTime} onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })} required
                className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Birth Place
              </label>
              <input type="text" value={formData.birthPlace} onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })} required
                placeholder="City, Country" className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]" />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button type="submit" disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                {loading ? "Generating..." : "Generate Kundali"}
              </button>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {displayKundali && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 text-center">
                  <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">Sun Sign</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{displayKundali.sunSign}</p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 text-center">
                  <Moon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">Moon Sign</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{displayKundali.moonSign}</p>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 text-center">
                  <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-[var(--text-secondary)]">Ascendant</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{displayKundali.ascendant}</p>
                </div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
                <div className="flex border-b border-[var(--border-color)] overflow-x-auto">
                  {(["chart", "planets", "dasha", "yogas"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${
                        activeTab === tab ? "border-amber-500 text-amber-500" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}>
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === "chart" && (
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-lg aspect-square">
                        <svg viewBox="0 0 400 400" className="w-full h-full">
                          <rect x="10" y="10" width="380" height="380" fill="none" stroke="var(--border-color)" strokeWidth="2" />
                          <line x1="10" y1="10" x2="390" y2="390" stroke="var(--border-color)" strokeWidth="1" />
                          <line x1="390" y1="10" x2="10" y2="390" stroke="var(--border-color)" strokeWidth="1" />
                          <line x1="200" y1="10" x2="200" y2="390" stroke="var(--border-color)" strokeWidth="1" />
                          <line x1="10" y1="200" x2="390" y2="200" stroke="var(--border-color)" strokeWidth="1" />
                          {[
                            { x: 200, y: 105, num: "1" }, { x: 295, y: 105, num: "2" },
                            { x: 295, y: 200, num: "3" }, { x: 295, y: 295, num: "4" },
                            { x: 200, y: 295, num: "5" }, { x: 105, y: 295, num: "6" },
                            { x: 105, y: 200, num: "7" }, { x: 105, y: 105, num: "8" },
                            { x: 105, y: 60, num: "9" }, { x: 200, y: 60, num: "10" },
                            { x: 295, y: 60, num: "11" }, { x: 60, y: 105, num: "12" },
                          ].map((house) => (
                            <text key={house.num} x={house.x} y={house.y} textAnchor="middle" fill="var(--text-muted)" fontSize="12" fontWeight="bold">
                              {house.num}
                            </text>
                          ))}
                          {displayKundali.planets.map((planet, idx) => {
                            const positions: Record<number, { x: number; y: number }> = {
                              1: { x: 200, y: 150 }, 2: { x: 250, y: 60 }, 3: { x: 345, y: 155 },
                              4: { x: 250, y: 250 }, 5: { x: 345, y: 345 }, 6: { x: 250, y: 340 },
                              7: { x: 200, y: 250 }, 8: { x: 150, y: 340 }, 9: { x: 55, y: 345 },
                              10: { x: 150, y: 250 }, 11: { x: 55, y: 155 }, 12: { x: 150, y: 60 },
                            };
                            const pos = positions[planet.house];
                            const offset = idx * 15;
                            return (
                              <g key={planet.planet}>
                                <circle cx={pos.x + (offset % 30) - 15} cy={pos.y + Math.floor(offset / 30) * 15} r="14"
                                  fill="var(--card-bg)" stroke={planet.retrograde ? "#ef4444" : "#f59e0b"} strokeWidth="1.5" />
                                <text x={pos.x + (offset % 30) - 15} y={pos.y + Math.floor(offset / 30) * 15 + 4}
                                  textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="bold">
                                  {planet.planet.slice(0, 2)}
                                </text>
                                {planet.retrograde && (
                                  <text x={pos.x + (offset % 30) - 15} y={pos.y + Math.floor(offset / 30) * 15 + 12}
                                    textAnchor="middle" fill="#ef4444" fontSize="8">R</text>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mt-4 text-center">North Indian Style Birth Chart (R = Retrograde)</p>
                    </div>
                  )}

                  {activeTab === "planets" && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[var(--border-color)]">
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Planet</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Sign</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">House</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Degree</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Nakshatra</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayKundali.planets.map((planet) => (
                            <tr key={planet.planet} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--hover-bg)] transition-colors">
                              <td className="py-3 px-4 font-medium text-[var(--text-primary)]">{planet.planet}</td>
                              <td className="py-3 px-4 text-[var(--text-secondary)]">{planet.sign}</td>
                              <td className="py-3 px-4 text-[var(--text-secondary)]">{planet.house}</td>
                              <td className="py-3 px-4 text-[var(--text-secondary)]">{planet.degree.toFixed(1)}°</td>
                              <td className="py-3 px-4 text-[var(--text-secondary)]">{planet.nakshatra} ({planet.pada})</td>
                              <td className="py-3 px-4">
                                {planet.retrograde ? (
                                  <span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">Retrograde</span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full">Direct</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "dasha" && (
                    <div className="space-y-4">
                      {displayKundali.dasha.map((period, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--hover-bg)] rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                            {period.planet[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[var(--text-primary)]">{period.planet} Mahadasha</p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {new Date(period.startDate).toLocaleDateString()} — {new Date(period.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[var(--text-muted)]">
                              {Math.ceil((new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "yogas" && (
                    <div className="space-y-4">
                      {displayKundali.yogas.map((yoga, idx) => (
                        <div key={idx} className="p-5 bg-[var(--hover-bg)] rounded-xl border border-[var(--border-color)]">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{yoga.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              yoga.strength === "Strong" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                            }`}>{yoga.strength}</span>
                          </div>
                          <p className="text-[var(--text-secondary)]">{yoga.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
