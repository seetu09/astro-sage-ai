"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, Loader2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export interface ShareCardData {
  /** Kundali mode */
  name?: string;
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  /** Match mode */
  partner1?: string;
  partner2?: string;
  gunas?: number;
  totalGunas?: number;
  percentage?: number;
  verdict?: string;
}

interface ShareCardProps {
  open: boolean;
  onClose: () => void;
  mode: "kundali" | "match";
  lang?: "en" | "hi";
  data: ShareCardData;
}

// Deterministic star positions (no Math.random → no hydration mismatch)
const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 137.5) % 100,
  top: (i * 61.8) % 100,
  size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  opacity: 0.2 + ((i * 29) % 65) / 100,
}));

const SIGN_ELEMENTS: Record<string, "Fire" | "Earth" | "Air" | "Water"> = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water",
};

const TRAITS: Record<"Fire" | "Earth" | "Air" | "Water", { en: string; hi: string }> = {
  Fire: { en: "Fiery Trailblazer", hi: "अग्नि अग्रणी" },
  Earth: { en: "Grounded Visionary", hi: "धरातल दूरदर्शी" },
  Air: { en: "Cosmic Thinker", hi: "आकाशीय विचारक" },
  Water: { en: "Deep Empath", hi: "गहन संवेदनशील" },
};

const LABELS = {
  en: {
    cosmicProfile: "Cosmic Profile",
    sun: "Sun Sign",
    moon: "Moon Sign",
    rising: "Ascendant",
    nakshatra: "Nakshatra",
    dominantTrait: "Dominant Cosmic Trait",
    gunaMilan: "Guna Milan",
    gunasMatched: "Gunas Matched",
    tagline: "Written in your stars.",
    cta: "Discover yours →",
    download: "Download as Image",
    sharing: "Sharing…",
    shared: "Ready!",
    hint: "Perfect for Instagram Stories & WhatsApp Status",
  },
  hi: {
    cosmicProfile: "कॉस्मिक प्रोफ़ाइल",
    sun: "सूर्य राशि",
    moon: "चंद्र राशि",
    rising: "लग्न",
    nakshatra: "नक्षत्र",
    dominantTrait: "प्रमुख ब्रह्मांडीय गुण",
    gunaMilan: "गुण मिलान",
    gunasMatched: "गुण मिले",
    tagline: "आपके सितारों में लिखा है।",
    cta: "अपना जानें →",
    download: "इमेज डाउनलोड करें",
    sharing: "साझा हो रहा है…",
    shared: "तैयार!",
    hint: "Instagram Stories और WhatsApp Status के लिए बिल्कुल सही",
  },
};

type NavigatorWithCanShare = Navigator & { canShare?: (data: ShareData) => boolean };

export default function ShareCard({ open, onClose, mode, lang = "en", data }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "download" | "share">(null);
  const { t } = useLanguage();
  const [done, setDone] = useState(false);

  const L = LABELS[lang];

  // Lock body scroll + Escape to close while open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const exportBlob = useCallback(async (): Promise<Blob> => {
    const node = cardRef.current;
    if (!node) throw new Error("Card not ready");
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
    return new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), "image/png")
    );
  }, []);

  const flashDone = () => {
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  const handleDownload = async () => {
    setBusy("download");
    try {
      const blob = await exportBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `astroveda-${mode}.png`;
      a.click();
      URL.revokeObjectURL(url);
      flashDone();
    } catch {
      // Export failed silently
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const blob = await exportBlob();
      const file = new File([blob], `astroveda-${mode}.png`, { type: "image/png" });
      const nav = navigator as NavigatorWithCanShare;

      const title =
        mode === "kundali"
          ? "My Cosmic Profile ✦ AstroVeda"
          : "Our Compatibility Score ✦ AstroVeda";
      const text =
        mode === "kundali"
          ? `${data.name || ""} · Sun ${data.sunSign ?? ""} · Moon ${data.moonSign ?? ""}`
          : `${data.partner1 ?? ""} ❤ ${data.partner2 ?? ""} — ${data.gunas ?? 0}/${data.totalGunas ?? 36} Gunas Matched (${data.percentage ?? 0}%)`;

      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title, text });
      } else {
        // Fallback: save the image locally (user can attach it anywhere)
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `astroveda-${mode}.png`;
        a.click();
        URL.revokeObjectURL(url);
        flashDone();
      }
    } catch {
      // User cancelled the native share sheet — ignore
    } finally {
      setBusy(null);
    }
  };

  const today = new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const element = data.sunSign ? SIGN_ELEMENTS[data.sunSign] : undefined;
  const trait = element ? TRAITS[element][lang] : undefined;
  const pct = Math.min(Math.max(data.percentage ?? 0, 0), 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0D0C1D] border border-white/10 p-4 sm:p-5 shadow-glow-violet"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label={t.common.close}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── 9:16 Story Card (capture target) ───────────────────────── */}
            <div className="flex justify-center py-2">
              <div
                ref={cardRef}
                className="relative overflow-hidden rounded-3xl shrink-0"
                style={{ width: 360, height: 640 }}
              >
                {/* Cosmic gradient background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(165deg, #080811 0%, #14092B 42%, #2B1157 72%, #45108A 100%)",
                  }}
                />
                {/* Ambient glows */}
                <div
                  className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,209,102,0.28) 0%, rgba(255,209,102,0) 70%)",
                  }}
                />
                <div
                  className="absolute -top-20 -left-20 w-64 h-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(123,44,191,0.38) 0%, rgba(123,44,191,0) 70%)",
                  }}
                />
                {/* Starfield */}
                {STARS.map((s, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      opacity: s.opacity,
                    }}
                  />
                ))}

                {/* Content */}
                <div className="relative h-full flex flex-col px-7 py-7 text-white">
                  {/* Branding header */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: "#FFD166", letterSpacing: "0.35em" }}
                    >
                      ✦ ASTROVEDA
                    </span>
                    <span className="text-[10px]" style={{ color: "rgba(243,244,246,0.55)" }}>
                      {today}
                    </span>
                  </div>

                  {mode === "kundali" ? (
                    /* ── Kundali variant ── */
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <span
                        className="text-[11px] uppercase"
                        style={{ color: "#E0A96D", letterSpacing: "0.3em" }}
                      >
                        {L.cosmicProfile}
                      </span>
                      <h2 className="font-serif text-3xl font-bold mt-3 leading-tight break-words max-w-[280px]">
                        {data.name || "—"}
                      </h2>

                      <div className="my-5 text-sm" style={{ color: "rgba(255,209,102,0.7)" }}>
                        ✦ ─────── ☾ ─────── ✦
                      </div>

                      <div className="grid grid-cols-3 gap-2 w-full">
                        {[
                          { emoji: "☀️", label: L.sun, value: data.sunSign },
                          { emoji: "🌙", label: L.moon, value: data.moonSign },
                          { emoji: "⬆️", label: L.rising, value: data.ascendant },
                        ].map((chip) => (
                          <div
                            key={chip.label}
                            className="rounded-xl px-2 py-3"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            <div className="text-lg leading-none mb-1.5">{chip.emoji}</div>
                            <div
                              className="text-[9px] uppercase"
                              style={{ color: "rgba(243,244,246,0.55)", letterSpacing: "0.12em" }}
                            >
                              {chip.label}
                            </div>
                            <div className="text-xs font-semibold mt-0.5 truncate">
                              {chip.value || "—"}
                            </div>
                          </div>
                        ))}
                      </div>

                      {trait && (
                        <div className="mt-6">
                          <p
                            className="text-[10px] uppercase"
                            style={{ color: "rgba(243,244,246,0.5)", letterSpacing: "0.2em" }}
                          >
                            {L.dominantTrait}
                          </p>
                          <p className="font-serif italic text-lg mt-1" style={{ color: "#FFD166" }}>
                            “{trait}”
                          </p>
                        </div>
                      )}

                      {data.nakshatra && (
                        <p className="mt-4 text-xs" style={{ color: "rgba(243,244,246,0.6)" }}>
                          ★ {L.nakshatra}: <span className="font-medium">{data.nakshatra}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    /* ── Matchmaking variant ── */
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <span
                        className="text-[11px] uppercase"
                        style={{ color: "#E0A96D", letterSpacing: "0.3em" }}
                      >
                        {L.gunaMilan}
                      </span>
                      <h2 className="font-serif text-2xl font-bold mt-3 leading-snug break-words max-w-[290px]">
                        {data.partner1 || "—"}{" "}
                        <span className="not-italic" style={{ color: "#FB7185" }}>❤</span>{" "}
                        {data.partner2 || "—"}
                      </h2>

                      <div className="my-6 text-sm" style={{ color: "rgba(255,209,102,0.7)" }}>
                        ✦ ─────── ☾ ─────── ✦
                      </div>

                      <div className="leading-none">
                        <span className="font-serif font-bold" style={{ color: "#FFD166", fontSize: 76 }}>
                          {data.gunas ?? 0}
                        </span>
                        <span className="font-serif font-bold" style={{ color: "rgba(243,244,246,0.55)", fontSize: 32 }}>
                          /{data.totalGunas ?? 36}
                        </span>
                      </div>
                      <p
                        className="text-xs uppercase mt-2"
                        style={{ color: "rgba(243,244,246,0.6)", letterSpacing: "0.25em" }}
                      >
                        {L.gunasMatched}
                      </p>

                      {/* Progress bar */}
                      <div
                        className="w-full h-2.5 rounded-full mt-6 overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: "linear-gradient(90deg, #FB7185 0%, #E0A96D 55%, #FFD166 100%)",
                          }}
                        />
                      </div>
                      <p className="text-sm font-semibold mt-2" style={{ color: "#E0A96D" }}>
                        {pct}% {lang === "hi" ? "मेल" : "Match"}
                      </p>

                      {data.verdict && (
                        <span
                          className="inline-block mt-5 px-4 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(255,209,102,0.12)",
                            border: "1px solid rgba(255,209,102,0.35)",
                            color: "#FFD166",
                          }}
                        >
                          {data.verdict}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center">
                    <p className="text-xs italic" style={{ color: "rgba(243,244,246,0.7)" }}>
                      {L.tagline}
                    </p>
                    <p
                      className="text-[10px] mt-1.5 font-semibold"
                      style={{ color: "rgba(255,209,102,0.85)", letterSpacing: "0.22em" }}
                    >
                      ASTRO-SAGE-AI.VERCEL.APP
                    </p>
                    <p className="text-[9px] mt-1" style={{ color: "rgba(243,244,246,0.4)" }}>
                      {L.cta}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions (outside capture area) ─────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={handleDownload}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-sm font-bold hover:shadow-glow-gold transition-all disabled:opacity-60"
              >
                {busy === "download" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : done ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {busy === "download" ? L.sharing : L.download}
              </button>
              <button
                onClick={handleShare}
                disabled={busy !== null}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-60"
              >
                {busy === "share" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {busy === "share" ? L.sharing : lang === "hi" ? "साझा करें" : "Share"}
              </button>
            </div>
            <p className="text-center text-[11px] mt-2.5" style={{ color: "rgba(156,163,175,0.9)" }}>
              {L.hint}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}