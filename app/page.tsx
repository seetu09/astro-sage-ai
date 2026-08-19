"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";
import { motion } from "framer-motion";
import { MessageCircle, Scroll, Star, Heart, Calendar, Users } from "lucide-react";
import HeroSection from './components/HeroSection';
import LiveDemo from './components/LiveDemo';
import HowItWorks from './components/HowItWorks';
import StatsSection from './components/StatsSection';
import KundaliPreview from './components/KundaliPreview';
import Testimonials from './components/Testimonials';

export default function HomePage() {
  const { t, language } = useLanguage();

  const features = [
    {
      title: { en: "Daily Horoscope", hi: "दैनिक राशिफल" },
      description: {
        en: "Get personalized daily readings based on your zodiac sign and planetary positions.",
        hi: "अपनी राशि और ग्रहों की स्थिति के आधार पर व्यक्तिगत दैनिक भविष्यवाणी प्राप्त करें।",
      },
      icon: Calendar,
      href: "/daily-horoscope",
    },
    {
      title: { en: "Kundali", hi: "कुंडली" },
      description: {
        en: "Generate your personalized Vedic birth chart with planetary positions, dasha periods, and auspicious yogas.",
        hi: "ग्रहों की स्थिति, दशा काल और शुभ योगों के साथ अपनी व्यक्तिगत वैदिक जन्म कुंडली बनाएं।",
      },
      icon: Star,
      href: "/kundali",
    },
    {
      title: { en: "Matchmaking", hi: "कुंडली मिलान" },
      description: {
        en: "Compare two birth charts for marriage compatibility using Ashtakoot Guna Milan.",
        hi: "अष्टकूट गुण मिलान का उपयोग करके विवाह अनुकूलता के लिए दो जन्म कुंडलियों की तुलना करें।",
      },
      icon: Heart,
      href: "/matchmaking",
    },
    {
      title: { en: "AI Astrology Guru", hi: "AI ज्योतिष गुरु" },
      description: {
        en: "Chat with our AI-powered astrologer for instant guidance on any life question.",
        hi: "किसी भी जीवन प्रश्न पर त्वरित मार्गदर्शन के लिए हमारे AI-संचालित ज्योतिषी से चैट करें।",
      },
      icon: MessageCircle,
      href: "/chat",
    },
    {
      title: { en: "Vedic Wisdom", hi: "वैदिक ज्ञान" },
      description: {
        en: "Explore ancient Vedic astrology principles applied to modern life challenges.",
        hi: "आधुनिक जीवन की चुनौतियों पर लागू प्राचीन वैदिक ज्योतिष सिद्धांतों का अन्वेषण करें।",
      },
      icon: Scroll,
      href: "/blog",
    },
    {
      title: { en: "Love & Relationships", hi: "प्रेम और रिश्ते" },
      description: {
        en: "Discover compatibility insights and relationship guidance through the stars.",
        hi: "सितारों के माध्यम से अनुकूलता अंतर्दृष्टि और रिश्ते मार्गदर्शन की खोज करें।",
      },
      icon: Users,
      href: "/matchmaking",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== HERO SECTION WITH OMNI-SEARCH ===== */}
      <HeroSection />

      {/* ===== LIVE DEMO ===== */}
      <LiveDemo />

      {/* ===== HOW IT WORKS ===== */}
      <HowItWorks />

      {/* ===== STATS (FIXED) ===== */}
      <StatsSection />

      {/* ===== KUNDALI PREVIEW ===== */}
      <KundaliPreview />

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== EXPLORE THE COSMOS ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-[#F3F4F6] mb-4">
              {language === "en" ? "Explore the Cosmos" : "ब्रह्मांड का अन्वेषण करें"}
            </h2>
            <p className="text-lg text-amber-800/70 dark:text-[#9CA3AF] max-w-2xl mx-auto">
              {language === "en" ? "Discover tools and insights to navigate your spiritual journey." : "अपनी आध्यात्मिक यात्रा को नेविगेट करने के लिए उपकरण और अंतर्दृष्टि की खोज करें।"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Link href={feature.href} className="block p-6 bg-[#FFFDF6] dark:bg-[#121026]/70 border border-amber-200/60 dark:border-white/10 rounded-2xl backdrop-blur-xl hover:border-amber-400 dark:hover:border-[#FFD166]/50 hover:bg-[#FFFDF6] dark:hover:bg-[#121026]/90 hover:shadow-sunlit-soft dark:hover:shadow-none transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-[#FFD166]/10 flex items-center justify-center mb-4 group-hover:bg-amber-100 dark:group-hover:bg-[#FFD166]/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-amber-700 dark:text-[#FFD166]" />
                  </div>
                  <h3 className="text-xl font-semibold text-amber-900 dark:text-[#F3F4F6] mb-2">{feature.title[language]}</h3>
                  <p className="text-amber-800/70 dark:text-[#9CA3AF]">{feature.description[language]}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-12 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#FFD166]/10 dark:to-[#7B2CBF]/10 border border-amber-200/60 dark:border-[#FFD166]/20 rounded-3xl backdrop-blur-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 dark:text-[#F3F4F6] mb-4">
              {language === "en" ? "Ready to Unlock Your Destiny?" : "अपनी नियति को अनलॉक करने के लिए तैयार हैं?"}
            </h2>
            <p className="text-lg text-amber-800/70 dark:text-[#9CA3AF] mb-8">
              {language === "en" ? "Start your journey today with a personalized horoscope reading or chat with our AI Guru." : "आज ही एक व्यक्तिगत राशिफल रीडिंग के साथ अपनी यात्रा शुरू करें या हमारे AI गुरु से चैट करें।"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat" className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] font-semibold rounded-xl hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all">
                {language === "en" ? "Chat with AI Guru" : "AI गुरु से चैट करें"}
              </Link>
              <Link href="/daily-horoscope" className="px-8 py-4 border border-amber-200 dark:border-white/10 text-amber-900 dark:text-[#F3F4F6] font-semibold rounded-xl hover:bg-amber-50 dark:hover:bg-white/5 transition-all">
                {language === "en" ? "View Daily Horoscope" : "दैनिक राशिफल देखें"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}