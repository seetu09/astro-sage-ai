"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Sparkles, Shield, AlertTriangle, CheckCircle2, Settings2, ChevronDown, Link2, Share2 } from "lucide-react";
import {
  calculateAshtakoot,
  RASHI_NAMES,
  NAKSHATRA_NAMES,
  type PersonDetails,
  type MatchResult,
} from "@/lib/ashtakoot";
import { deriveMoonDetails } from "@/lib/astrology";
import PlaceAutocomplete from "@/app/components/PlaceAutocomplete";
import { useLanguage } from "@/app/context/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";

// ─── Venus / Mars Relationship Profiles (by Rashi index 0-11) ──────────────
const VENUS_PROFILES_EN = [
  "They express love boldly and passionately — grand gestures, spontaneous surprises, and protective energy.",
  "They show affection through stability — thoughtful gifts, comfort, and unwavering loyalty.",
  "They express love with words and curiosity — playful banter, deep conversations, and mental connection.",
  "They express love by nurturing — emotional care, feeding you, and creating a safe home.",
  "They show love generously and proudly — praise, theatrical romance, and warm-hearted gifts.",
  "They express love through service — practical help, attention to detail, and quiet devotion.",
  "They express love elegantly — charm, fairness, romantic gestures, and a harmonious atmosphere.",
  "They express love intensely and all-in — deep emotional merging, passion, and fierce protectiveness.",
  "They express love through adventure and optimism — shared goals, honest words, and big dreams.",
  "They show love responsibly — commitment, long-term planning, and grounded reliability.",
  "They express love as friendship first — intellectual banter, freedom, and quirky surprises.",
  "They express love romantically and empathetically — dreamy gestures, deep intuition, and selfless care.",
];

const VENUS_PROFILES_HI = [
  "वे जुनून और साहस के साथ प्रेम व्यक्त करते हैं — भव्य इशारे, आकस्मिक आश्चर्य और सुरक्षात्मक ऊर्जा।",
  "वे स्थिरता के माध्यम से स्नेह दिखाते हैं — सोच-समझकर उपहार, आराम और अटूट निष्ठा।",
  "वे शब्दों और जिज्ञासा से प्रेम व्यक्त करते हैं — चंचल बातचीत, गहरी चर्चा और मानसिक जुड़ाव।",
  "वे पोषण करके प्रेम व्यक्त करते हैं — भावनात्मक देखभाल, खिलाना और सुरक्षित घर बनाना।",
  "वे उदारता और गर्व से प्रेम दिखाते हैं — प्रशंसा, नाटकीय रोमांस और गर्मजोशी भरे उपहार।",
  "वे सेवा के माध्यम से प्रेम व्यक्त करते हैं — व्यावहारिक मदद, विवरण पर ध्यान और शांत भक्ति।",
  "वे शालीनता से प्रेम व्यक्त करते हैं — आकर्षण, निष्पक्षता, रोमांटिक इशारे और सामंजस्यपूर्ण वातावरण।",
  "वे तीव्रता और पूर्ण समर्पण से प्रेम व्यक्त करते हैं — गहरा भावनात्मक विलय, जुनून और प्रबल सुरक्षा।",
  "वे साहस और आशावाद के माध्यम से प्रेम व्यक्त करते हैं — साझा लक्ष्य, ईमानदार शब्द और बड़े सपने।",
  "वे जिम्मेदारी से प्रेम दिखाते हैं — प्रतिबद्धता, दीर्घकालिक योजना और मजबूत विश्वसनीयता।",
  "वे पहले दोस्ती के रूप में प्रेम व्यक्त करते हैं — बौद्धिक बातचीत, स्वतंत्रता और अनोखे आश्चर्य।",
  "वे रोमांटिक और सहानुभूतिपूर्ण ढंग से प्रेम व्यक्त करते हैं — स्वप्निल इशारे, गहरी अंतर्ज्ञान और निस्वार्थ देखभाल।",
];

const CONFLICT_PROFILES_EN = [
  "They need space to cool off before discussing fights. Avoid raising your voice — a calm, direct approach wins them over.",
  "They need time to process. Be patient, practical, and avoid rushing the conversation. Consistency rebuilds trust.",
  "They talk things out logically. Use clear words, avoid emotional overload, and keep the discussion playful where possible.",
  "They withdraw when hurt. Reassure them emotionally first — a warm hug opens the door to resolution.",
  "Pride can get in the way. Acknowledge their effort before critiquing, and let them save face gracefully.",
  "They overthink in silence. Gently invite them to share and validate their efforts — details matter to them.",
  "They seek fairness and harmony. Stay balanced, hear both sides, and avoid public criticism at all costs.",
  "Fights can intensify fast. Give them loyalty signals and avoid threats — deep trust resolves everything.",
  "They prefer honest, direct confrontation. Frame conflict as a shared adventure to overcome together.",
  "They go quiet and stubborn. Give them structure — clear steps, deadlines, and a solemn commitment go far.",
  "They detach emotionally during conflict. Bring humor and intellectual engagement back to break the ice.",
  "They absorb others' feelings deeply. Be gentle, lead with empathy, and never dismiss their emotions.",
];

const CONFLICT_PROFILES_HI = [
  "उन्हें बहस से पहले शांत होने के लिए स्थान चाहिए। आवाज़ न उठाएं — शांत, सीधा दृष्टिकोण उन्हें जीत लेता है।",
  "उन्हें प्रक्रिया के लिए समय चाहिए। धैर्य रखें, व्यावहारिक बनें और बातचीत में जल्दबाजी न करें। स्थिरता विश्वास बनाती है।",
  "वे तार्किक रूप से बात करते हैं। स्पष्ट शब्दों का उपयोग करें, भावनात्मक अधिभार से बचें और बातचीत को हल्का रखें।",
  "वे आहत होने पर पीछे हट जाते हैं। पहले उन्हें भावनात्मक रूप से आश्वस्त करें — एक गर्म आलिंगन समाधान का द्वार खोलता है।",
  "गर्व रास्ते में आ सकता है। आलोचना से पहले उनके प्रयास को स्वीकार करें और उन्हें शालीनता से सम्मान बचाने दें।",
  "वे चुपचाप अधिक सोचते हैं। धीरे से उन्हें साझा करने के लिए आमंत्रित करें और उनके प्रयासों को मान्यता दें।",
  "वे निष्पक्षता और सद्भाव चाहते हैं। संतुलित रहें, दोनों पक्ष सुनें और सार्वजनिक आलोचना से बचें।",
  "लड़ाई तेजी से बढ़ सकती है। उन्हें निष्ठा के संकेत दें और धमकियों से बचें — गहरा विश्वास सब कुछ हल करता है।",
  "वे ईमानदार, सीधा टकराव पसंद करते हैं। संघर्ष को एक साथ पार करने वाला साझा रोमांच बनाएं।",
  "वे चुप और जिद्दी हो जाते हैं। उन्हें संरचना दें — स्पष्ट कदम, समयसीमा और पवित्र प्रतिबद्धता बहुत काम करती है।",
  "वे संघर्ष के दौरान भावनात्मक रूप से अलग हो जाते हैं। बर्फ तोड़ने के लिए हास्य और बौद्धिक जुड़ाव वापस लाएं।",
  "वे दूसरों की भावनाओं को गहराई से अवशोषित करते हैं। कोमल बनें, सहानुभूति से आगे बढ़ें और उनकी भावनाओं को कभी खारिज न करें।",
];

const STATUS_COLORS: Record<string, string> = {
  excellent: "bg-green-500/10 text-green-500 border-green-500/20",
  good: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  average: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  poor: "bg-red-500/10 text-red-500 border-red-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  none: "bg-green-500/10 text-green-500",
  mild: "bg-yellow-500/10 text-yellow-500",
  moderate: "bg-orange-500/10 text-orange-500",
  severe: "bg-red-500/10 text-red-500",
};

interface PersonForm {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  timeUnknown: boolean;
  placeOfBirth: string;
  latitude: number | null;
  longitude: number | null;
  rashi: number;
  nakshatra: number;
  pada: number;
}

const emptyPerson: PersonForm = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  timeUnknown: false,
  placeOfBirth: "",
  latitude: null,
  longitude: null,
  rashi: 1,
  nakshatra: 1,
  pada: 1,
};

const inputClass =
  "w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

export default function MatchmakingPage() {
  const { language, t } = useLanguage();
  const { profile, saveProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<"form" | "results">("form");
  const [male, setMale] = useState<PersonForm>(emptyPerson);
  const [female, setFemale] = useState<PersonForm>(emptyPerson);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [personDetails, setPersonDetails] = useState<{ male: PersonDetails; female: PersonDetails } | null>(null);
  const [knowPartnerOpen, setKnowPartnerOpen] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill Partner 1 (self) from the saved user profile
  useEffect(() => {
    if (!profile || profileLoaded) return;
    setProfileLoaded(true);
    setMale((prev) => ({
      ...prev,
      name: profile.name || prev.name,
      dateOfBirth: profile.dob || prev.dateOfBirth,
      timeOfBirth: profile.tob || prev.timeOfBirth,
      timeUnknown: profile.timeUnknown ?? prev.timeUnknown,
      placeOfBirth: profile.city || prev.placeOfBirth,
      latitude: profile.lat ?? prev.latitude,
      longitude: profile.lon ?? prev.longitude,
    }));
  }, [profile, profileLoaded]);

  // Pre-fill from shared invite link (?partner1_name=...&partner1_dob=...&partner2_name=...&partner2_dob=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p1Name = params.get("partner1_name");
      const p1Dob = params.get("partner1_dob");
      const p2Name = params.get("partner2_name");
      const p2Dob = params.get("partner2_dob");
      if (p1Name || p1Dob || p2Name || p2Dob) {
        setMale((prev) => ({ ...prev, name: p1Name || prev.name, dateOfBirth: p1Dob || prev.dateOfBirth }));
        setFemale((prev) => ({ ...prev, name: p2Name || prev.name, dateOfBirth: p2Dob || prev.dateOfBirth }));
      }
    } catch {
      // SSR / privacy mode — ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate calculation delay for UX
    setTimeout(() => {
      const buildDetails = (p: PersonForm): PersonDetails => {
        const moon = showAdvanced
          ? { rashi: p.rashi, nakshatra: p.nakshatra, pada: p.pada }
          : deriveMoonDetails(p.dateOfBirth, p.timeOfBirth, p.timeUnknown);
        return {
          name: p.name || (language === "hi" ? "लड़का" : "Boy"),
          ...moon,
        };
      };

      const maleDetails = buildDetails(male);
      const femaleDetails = buildDetails(female);
      const matchResult = calculateAshtakoot(maleDetails, femaleDetails);
      setResult(matchResult);
      setPersonDetails({ male: maleDetails, female: femaleDetails });
      setKnowPartnerOpen(false);
      setInviteCopied(false);

      // Persist Partner 1 (self) birth details for reuse across Kundali, Matchmaking & Chat
      if (male.dateOfBirth || male.placeOfBirth || male.name) {
        saveProfile({
          name: male.name,
          dob: male.dateOfBirth,
          tob: male.timeOfBirth || "12:00",
          city: male.placeOfBirth,
          lat: male.latitude,
          lon: male.longitude,
          timeUnknown: male.timeUnknown,
        });
      }

      // Build shareable invite URL
      try {
        const url = new URL(window.location.origin + window.location.pathname);
        if (male.name) url.searchParams.set("partner1_name", male.name);
        if (male.dateOfBirth) url.searchParams.set("partner1_dob", male.dateOfBirth);
        if (female.name) url.searchParams.set("partner2_name", female.name);
        if (female.dateOfBirth) url.searchParams.set("partner2_dob", female.dateOfBirth);
        setInviteUrl(url.toString());
      } catch {
        // Privacy mode — leave empty
      }

      setLoading(false);
      setActiveTab("results");
    }, 800);
  };

  const renderPersonForm = (
    title: string,
    icon: React.ReactNode,
    iconColor: string,
    data: PersonForm,
    setData: (d: PersonForm | ((prev: PersonForm) => PersonForm)) => void
  ) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>

      <input
        type="text"
        placeholder={t.matchmaking.namePlaceholder}
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className={inputClass}
      />

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.dateOfBirth}</label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
          className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
          required
        />
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.timeOfBirth}</label>
        <input
          type="time"
          value={data.timeOfBirth}
          onChange={(e) => setData({ ...data, timeOfBirth: e.target.value })}
          disabled={data.timeUnknown}
          className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark] disabled:opacity-50`}
        />
        <label className="flex items-center gap-2 mt-2 text-sm text-[var(--text-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={data.timeUnknown}
            onChange={(e) => setData({ ...data, timeUnknown: e.target.checked })}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          {t.matchmaking.timeUnknown}
        </label>
      </div>

      <div>
        <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.placeOfBirth}</label>
        <PlaceAutocomplete
          value={data.placeOfBirth}
          onChange={(v) => setData((prev) => ({ ...prev, placeOfBirth: v }))}
          onSelect={(place) =>
            setData((prev) => ({ ...prev, placeOfBirth: place.placeName, latitude: place.latitude, longitude: place.longitude }))
          }
          onClear={() => setData((prev) => ({ ...prev, latitude: null, longitude: null }))}
          latitude={data.latitude}
          longitude={data.longitude}
          onLatitudeChange={(v) => setData((prev) => ({ ...prev, latitude: v }))}
          onLongitudeChange={(v) => setData((prev) => ({ ...prev, longitude: v }))}
          placeholder={t.matchmaking.placePlaceholder}
          inputClassName={inputClass}
        />
      </div>

      {showAdvanced && (
        <div className="space-y-4 border-t border-[var(--border-color)] pt-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.moonSign}</label>
            <select
              value={data.rashi}
              onChange={(e) => setData({ ...data, rashi: parseInt(e.target.value) })}
              className={inputClass}
            >
              {RASHI_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{i + 1}. {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.nakshatra}</label>
            <select
              value={data.nakshatra}
              onChange={(e) => setData({ ...data, nakshatra: parseInt(e.target.value) })}
              className={inputClass}
            >
              {NAKSHATRA_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{i + 1}. {name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">{t.matchmaking.pada}</label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setData({ ...data, pada: p })}
                  className={`py-2 rounded-lg border text-sm font-semibold transition-all ${
                    data.pada === p
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    } catch {
      // Clipboard unavailable — ignore
    }
  };

  const handleWhatsAppShare = () => {
    if (!inviteUrl) return;
    const text = encodeURIComponent(
      language === "hi"
        ? `चलो हमारी कुंडली मिलान जांचते हैं! ${inviteUrl}`
        : `Let's check our Kundali compatibility! ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const getVerdict = (points: number): string => {
    if (points >= 28) return t.matchmaking.excellent;
    if (points >= 22) return t.matchmaking.good;
    if (points >= 16) return t.matchmaking.average;
    return t.matchmaking.challenging;
  };

  // Relationship profile lookups
  const venusProfiles = language === "hi" ? VENUS_PROFILES_HI : VENUS_PROFILES_EN;
  const conflictProfiles = language === "hi" ? CONFLICT_PROFILES_HI : CONFLICT_PROFILES_EN;

  const renderKnowYourPartner = () => {
    if (!personDetails) return null;
    const rows = [
      { label: personDetails.male.name, details: personDetails.male },
      { label: personDetails.female.name, details: personDetails.female },
    ];
    return (
      <div className="space-y-6">
        {rows.map((row, idx) => {
          const rashiIdx = row.details.rashi - 1;
          const venus = venusProfiles[rashiIdx];
          const conflict = conflictProfiles[rashiIdx];
          return (
            <div key={idx} className="space-y-4">
              <h4 className="font-bold text-[var(--text-primary)]">{row.label}</h4>
              <div className="flex items-start gap-3 p-4 bg-[var(--hover-bg)] rounded-xl">
                <span className="text-2xl">💕</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--accent)] mb-1">{t.matchmaking.affectionVenus}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{venus}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[var(--hover-bg)] rounded-xl">
                <span className="text-2xl">⚔️</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--accent)] mb-1">{t.matchmaking.conflictMars}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{conflict}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>{t.matchmaking.badge}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            {t.matchmaking.title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            {t.matchmaking.subtitle}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {renderPersonForm(
                    t.matchmaking.boyDetails,
                    <User className="w-5 h-5 text-blue-400" />,
                    "bg-blue-500/20",
                    male,
                    setMale
                  )}
                  {renderPersonForm(
                    t.matchmaking.girlDetails,
                    <User className="w-5 h-5 text-pink-400" />,
                    "bg-pink-500/20",
                    female,
                    setFemale
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      showAdvanced
                        ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <Settings2 className="w-4 h-4" />
                    {showAdvanced ? t.matchmaking.advancedHide : t.matchmaking.advancedToggle}
                  </button>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-12 py-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all disabled:opacity-50 flex items-center gap-3 text-lg"
                  >
                    <Heart className="w-6 h-6" />
                    {loading ? t.matchmaking.calculating : t.matchmaking.checkCompatibility}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            result && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Score Gauge */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 text-center">
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle cx="88" cy="88" r="72" stroke="var(--border-color)" strokeWidth="10" fill="none" />
                      <circle
                        cx="88" cy="88" r="72"
                        stroke={result.percentage >= 75 ? "#22c55e" : result.percentage >= 55 ? "#f59e0b" : "#ef4444"}
                        strokeWidth="10" fill="none"
                        strokeDasharray={`${(result.totalPoints / 36) * 452} 452`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-[var(--text-primary)]">{result.totalPoints}</span>
                      <span className="text-sm text-[var(--text-muted)]">{t.matchmaking.gunas}</span>
                      <span className="text-xs text-[var(--accent)] mt-1">{result.percentage}%</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{getVerdict(result.totalPoints)}</h2>
                  <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{result.compatibilitySummary}</p>
                  <button
                    onClick={() => setActiveTab("form")}
                    className="mt-6 px-6 py-2 border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] transition-colors"
                  >
                    {t.matchmaking.checkAnother}
                  </button>
                </div>

                {/* Koota Breakdown */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    {t.matchmaking.breakdown}
                  </h3>
                  <div className="space-y-3">
                    {result.kootas.map((koota) => (
                      <div key={koota.id} className="flex items-center gap-4 p-3 bg-[var(--hover-bg)] rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-[var(--text-primary)]">{koota.name}</p>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${STATUS_COLORS[koota.status]}`}>
                              {koota.status}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">{koota.description}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${koota.points === koota.maxPoints ? "text-green-400" : koota.points === 0 ? "text-red-400" : "text-amber-400"}`}>
                            {koota.points}
                          </span>
                          <span className="text-[var(--text-muted)]">/{koota.maxPoints}</span>
                        </div>
                        <div className="w-24 h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${koota.points === koota.maxPoints ? "bg-green-500" : koota.points === 0 ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${(koota.points / koota.maxPoints) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doshas */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    {t.matchmaking.doshaAnalysis}
                  </h3>
                  <div className="space-y-4">
                    {result.doshas.map((dosha, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${dosha.present ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {dosha.present ? (
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            <span className="font-semibold text-[var(--text-primary)]">{dosha.name}</span>
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${SEVERITY_COLORS[dosha.severity]}`}>
                            {dosha.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">{dosha.description}</p>
                        <p className="text-sm text-[var(--accent)]">
                          <span className="font-semibold">{t.matchmaking.remedy}</span>{dosha.remedy}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Know Your Partner */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl">
                  <button
                    onClick={() => setKnowPartnerOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💞</span>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{t.matchmaking.knowYourPartner}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${knowPartnerOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {knowPartnerOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 border-t border-[var(--border-color)] pt-5">
                          {renderKnowYourPartner()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Invite Partner */}
                {inviteUrl && (
                  <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-amber-500/10 border border-pink-500/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-pink-500" />
                      {t.matchmaking.invitePartner}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">{t.matchmaking.inviteSubtitle}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleCopyInvite}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border font-semibold transition-all ${
                          inviteCopied
                            ? "bg-green-500/15 border-green-500/30 text-green-500"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent)]"
                        }`}
                      >
                        {inviteCopied ? <CheckCircle2 className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                        {inviteCopied ? t.matchmaking.copied : t.matchmaking.copyLink}
                      </button>
                      <button
                        onClick={handleWhatsAppShare}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                        {t.matchmaking.shareWhatsApp}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}