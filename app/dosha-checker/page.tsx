"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, Moon, Flame, Sparkles, Activity, MapPin, Calendar, Clock } from "lucide-react";
import {
  checkDoshasFromBirthDetails,
  RASHI_NAMES,
  type DoshaCheckResultWithPositions,
  type ManglikSeverity,
  type SadeSatiPhase,
} from "@/lib/dosha-checker";
import { useLanguage } from "@/app/context/LanguageContext";
import PlaceAutocomplete from "@/app/components/PlaceAutocomplete";

const SEVERITY_STYLES: Record<ManglikSeverity, { badge: string; label: string }> = {
  none: { badge: "bg-green-500/10 text-green-500 border-green-500/20", label: "None" },
  mild: { badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Mild" },
  moderate: { badge: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Moderate" },
  severe: { badge: "bg-red-500/10 text-red-500 border-red-500/20", label: "Severe" },
};

const PHASE_STYLES: Record<SadeSatiPhase, { badge: string; label: string }> = {
  inactive: { badge: "bg-green-500/10 text-green-500 border-green-500/20", label: "Inactive" },
  rising: { badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Rising" },
  peak: { badge: "bg-red-500/10 text-red-500 border-red-500/20", label: "Peak" },
  setting: { badge: "bg-orange-500/10 text-orange-500 border-orange-500/20", label: "Setting" },
};

interface FormState {
  name: string;
  dob: string;
  tob: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

const emptyForm: FormState = { 
  name: "", 
  dob: "", 
  tob: "", 
  place: "", 
  latitude: null, 
  longitude: null, 
  timezone: "" 
};

export default function DoshaCheckerPage() {
  const { language, t } = useLanguage();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<DoshaCheckResultWithPositions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/dosha-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || (language === 'hi' ? "आपका" : "Your"),
          dob: form.dob,
          tob: form.tob,
          place: form.place,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          timezone: form.timezone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate doshas");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: { placeName: string; latitude: number; longitude: number; timezone: string }) => {
    setForm({
      ...form,
      place: place.placeName,
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone,
    });
  };

  const handlePlaceChange = (value: string) => {
    setForm({ ...form, place: value });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>{t.dosha.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.dosha.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.dosha.subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">{t.dosha.yourName}</label>
                  <input
                    type="text"
                    placeholder={t.dosha.namePlaceholder}
                    value={form.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
                      <Calendar className="w-4 h-4 text-[var(--accent)]" />
                      {t.dosha.dateOfBirth}
                    </label>
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, dob: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
                      <Clock className="w-4 h-4 text-[var(--accent)]" />
                      {t.dosha.timeOfBirth}
                    </label>
                    <input
                      type="time"
                      value={form.tob}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, tob: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {t.dosha.placeOfBirth}
                  </label>
                  <PlaceAutocomplete
                    value={form.place}
                    onChange={handlePlaceChange}
                    onSelect={handlePlaceSelect}
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onLatitudeChange={(lat) => setForm({ ...form, latitude: lat })}
                    onLongitudeChange={(lng) => setForm({ ...form, longitude: lng })}
                    placeholder={t.dosha.placePlaceholder}
                    inputClassName="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !form.dob || !form.tob || !form.place}
                    className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Shield className="w-6 h-6" />
                    {loading ? t.dosha.analyzing : t.dosha.checkButton}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Overall Summary */}
              <div className={`bg-[var(--card-bg)] border rounded-2xl p-8 text-center ${
                result.overall.hasDosha ? "border-red-500/20" : "border-green-500/20"
              }`}>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                  result.overall.hasDosha ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                }`}>
                  {result.overall.hasDosha ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {result.overall.hasDosha ? t.dosha.doshasDetected : t.dosha.noMajorDoshas}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                  {result.overall.hasDosha ? t.dosha.remediesAvailable : t.dosha.chartClear}
                </h2>
                <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{result.overall.summary}</p>

                {/* Calculated Positions Summary */}
                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                  <p className="text-sm font-semibold text-[var(--text-muted)] mb-3">
                    {language === 'hi' ? 'आपकी गणना की गई स्थितियां:' : 'Your Calculated Positions:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        {language === 'hi' ? 'चंद्र राशि' : 'Moon Sign (Rashi)'}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {result.positions.moonSignName}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        {language === 'hi' ? 'मंगल राशि' : 'Mars Sign'}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {result.positions.marsSignName}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        {language === 'hi' ? 'लग्न' : 'Ascendant (Lagna)'}
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {result.positions.ascendantSignName}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
                >
                  {t.dosha.checkAnother}
                </button>
              </div>

              {/* Manglik Section */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Flame className="w-5 h-5 text-red-500" />
                    {t.dosha.manglikTitle}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${SEVERITY_STYLES[result.manglik.severity].badge}`}>
                    {SEVERITY_STYLES[result.manglik.severity].label.toUpperCase()}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] mb-4">{result.manglik.description}</p>

                {result.manglik.affectedHouses.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-[var(--text-muted)]">{t.dosha.affectedHouses}</span>
                    {result.manglik.affectedHouses.map((house) => (
                      <span key={house} className="px-2 py-1 text-xs font-bold bg-red-500/10 text-red-500 rounded-full">
                        {language === 'hi' ? `भाव ${house}` : `House ${house}`}
                      </span>
                    ))}
                  </div>
                )}

                {result.manglik.cancellations.length > 0 && (
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 mb-4">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">{t.dosha.cancellationsApplied}</p>
                    {result.manglik.cancellations.map((c, i) => (
                      <p key={i} className="text-sm text-[var(--text-secondary)]">• {c}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                  <p className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.dosha.remedies}
                  </p>
                  <ul className="space-y-1.5">
                    {result.manglik.remedies.map((remedy, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--accent)] mt-0.5">•</span>
                        {remedy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sade Sati Section */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    {t.dosha.sadeSatiTitle}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${PHASE_STYLES[result.sadeSati.phase].badge}`}>
                    {PHASE_STYLES[result.sadeSati.phase].label.toUpperCase()}
                  </span>
                </div>

                <p className="text-[var(--text-secondary)] mb-6">{result.sadeSati.description}</p>

                {/* Phase Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {result.sadeSati.timeline.map((tItem, i) => (
                      <div key={tItem.phase} className="flex-1 text-center">
                        <div className={`text-xs font-semibold mb-1 ${tItem.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                          {tItem.label}
                        </div>
                        <div className={`h-2 rounded-full mx-1 ${tItem.active ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"}`} />
                        <div className="text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">{tItem.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
                  <p className="text-sm font-semibold text-[var(--accent)] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.dosha.remedies}
                  </p>
                  <ul className="space-y-1.5">
                    {result.sadeSati.remedies.map((remedy, i) => (
                      <li key={i} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-[var(--accent)] mt-0.5">•</span>
                        {remedy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}