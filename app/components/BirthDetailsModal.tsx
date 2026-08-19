"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Loader2, MapPin, Calendar, Clock, User } from "lucide-react";

interface BirthDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
}

interface BirthDetails {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  timeUnknown: boolean;
  placeOfBirth: string;
}

const INDIAN_CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Ahmedabad, Gujarat",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Jaipur, Rajasthan",
  "Surat, Gujarat",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Indore, Madhya Pradesh",
  "Thane, Maharashtra",
  "Bhopal, Madhya Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Patna, Bihar",
  "Vadodara, Gujarat",
  "Ghaziabad, Uttar Pradesh",
  "Ludhiana, Punjab",
  "Agra, Uttar Pradesh",
  "Nashik, Maharashtra",
  "Faridabad, Haryana",
  "Meerut, Uttar Pradesh",
  "Rajkot, Gujarat",
  "Varanasi, Uttar Pradesh",
  "Srinagar, Jammu & Kashmir",
  "Aurangabad, Maharashtra",
  "Dhanbad, Jharkhand",
  "Amritsar, Punjab",
  "Navi Mumbai, Maharashtra",
  "Allahabad, Uttar Pradesh",
  "Ranchi, Jharkhand",
  "Howrah, West Bengal",
  "Coimbatore, Tamil Nadu",
  "Jabalpur, Madhya Pradesh",
  "Gwalior, Madhya Pradesh",
  "Vijayawada, Andhra Pradesh",
  "Jodhpur, Rajasthan",
  "Madurai, Tamil Nadu",
  "Raipur, Chhattisgarh",
  "Kota, Rajasthan",
  "Chandigarh, Chandigarh",
  "Guwahati, Assam",
  "Solapur, Maharashtra",
  "Hubli, Karnataka",
  "Mysore, Karnataka",
  "Tiruchirappalli, Tamil Nadu",
  "Bareilly, Uttar Pradesh",
];

export default function BirthDetailsModal({ isOpen, onClose, question }: BirthDetailsModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"calibrating" | "form">("calibrating");
  const [formData, setFormData] = useState<BirthDetails>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "12:00",
    timeUnknown: false,
    placeOfBirth: "",
  });
  const [cityFilter, setCityFilter] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("calibrating");
      // Simulate calibration animation
      const timer = setTimeout(() => setStep("form"), 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCities = INDIAN_CITIES.filter((city) =>
    city.toLowerCase().includes(cityFilter.toLowerCase())
  ).slice(0, 6);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Store birth details in localStorage
    const birthData = {
      ...formData,
      timeOfBirth: formData.timeUnknown ? "12:00" : formData.timeOfBirth,
      question,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("astroveda_birth_details", JSON.stringify(birthData));

    // Simulate processing then redirect
    setTimeout(() => {
      router.push(`/chat?q=${encodeURIComponent(question)}&from=hero`);
    }, 1200);
  };

  const inputClass = "w-full astro-input py-3 px-4 text-sm min-h-[44px]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-strong p-6 sm:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 dark:text-[#9CA3AF] hover:text-indigo-700 dark:hover:text-[#F3F4F6] hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "calibrating" ? (
          <div className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 dark:border-[#7B2CBF]/30 animate-pulse-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-amber-500/40 dark:border-[#FFD166]/40 animate-pulse-slow" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-4 rounded-full border-2 border-sky-500/50 dark:border-[#4CC9F0]/50 animate-pulse-slow" style={{ animationDelay: "1s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-600 dark:text-[#FFD166] animate-glow" />
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-indigo-950 dark:text-[#F3F4F6] mb-2">
              Calibrating your exact Nakshatra alignment...
            </h3>
            <p className="text-sm text-slate-500 dark:text-[#9CA3AF]">
              Syncing with the cosmic grid to personalize your reading
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-[#FFD166]/10 border border-violet-200/60 dark:border-[#FFD166]/20 mb-3">
                <Sparkles className="w-3 h-3 text-violet-700 dark:text-[#FFD166]" />
                <span className="text-xs font-medium text-violet-700 dark:text-[#FFD166]">Personalize Your Reading</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-indigo-950 dark:text-[#F3F4F6] mb-1">
                Reveal My Reading
              </h3>
              <p className="text-sm text-slate-500 dark:text-[#9CA3AF]">
                We need your birth details to align the stars
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5">
                <User className="w-3.5 h-3.5 text-violet-700 dark:text-[#FFD166]" />
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                className={inputClass}
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-700 dark:text-[#FFD166]" />
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
                required
              />
            </div>

            {/* Time of Birth */}
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-700 dark:text-[#FFD166]" />
                Exact Time of Birth
              </label>
              <input
                type="time"
                value={formData.timeOfBirth}
                onChange={(e) => setFormData({ ...formData, timeOfBirth: e.target.value })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark] ${formData.timeUnknown ? "opacity-40 pointer-events-none" : ""}`}
                disabled={formData.timeUnknown}
              />
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-[#9CA3AF] cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.timeUnknown}
                  onChange={(e) => setFormData({ ...formData, timeUnknown: e.target.checked, timeOfBirth: "12:00" })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 accent-violet-600 dark:accent-[#FFD166]"
                />
                Time Unknown (defaults to 12:00 PM / Moon Chart)
              </label>
            </div>

            {/* Place of Birth */}
            <div className="relative">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-700 dark:text-[#FFD166]" />
                Place of Birth
              </label>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => {
                  setFormData({ ...formData, placeOfBirth: e.target.value });
                  setCityFilter(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                placeholder="City, State, Country"
                className={inputClass}
                required
              />
              {showCitySuggestions && filteredCities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white/95 dark:bg-[#121026]/95 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-xl shadow-sunlit-soft dark:shadow-xl overflow-hidden">
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onMouseDown={() => {
                        setFormData({ ...formData, placeOfBirth: city });
                        setCityFilter(city);
                        setShowCitySuggestions(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-500 dark:text-[#9CA3AF] hover:text-indigo-700 dark:hover:text-[#F3F4F6] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors min-h-[44px]"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm sm:text-base font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aligning the stars...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Reveal My Reading →
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-slate-400 dark:text-[#6B7280]">
              🔒 Your birth details are encrypted & never shared
            </p>
          </form>
        )}
      </div>
    </div>
  );
}