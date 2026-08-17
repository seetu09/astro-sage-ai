"use client";
import React from 'react';
import ZodiacSelector from '@/app/components/ZodiacSelector';
import LiveTicker from '@/app/components/LiveTicker';
import SEOWrapper from '@/app/components/SEOWrapper';
import { useLanguage } from '@/app/context/LanguageContext';

export default function HoroscopePage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Daily Horoscope",
      subtitle: "Select your zodiac sign to read your prediction",
      trust1_h: "Personalized Guidance",
      trust1_p: "Our AI Guru analyzes planetary positions to give you specific daily advice.",
      trust2_h: "100% Free",
      trust2_p: "Check your love, career, and money meters every day without any subscription.",
      trust3_h: "Vedic Wisdom",
      trust3_p: "Traditional Indian astrology principles meet modern AI technology."
    },
    hi: {
      title: "दैनिक राशिफल",
      subtitle: "अपनी भविष्यवाणी पढ़ने के लिए अपनी राशि चुनें",
      trust1_h: "व्यक्तिगत मार्गदर्शन",
      trust1_p: "हमारा एआई गुरु आपको विशिष्ट दैनिक सलाह देने के लिए ग्रहों की स्थिति का विश्लेषण करता है।",
      trust2_h: "100% मुफ्त",
      trust2_p: "बिना किसी सब्सक्रिप्शन के हर दिन अपने प्यार, करियर और पैसे के मीटर की जांच करें।",
      trust3_h: "वैदिक ज्ञान",
      trust3_p: "पारंपरिक भारतीय ज्योतिष सिद्धांत आधुनिक एआई तकनीक से मिलते हैं।"
    }
  };

  const t = language === 'hi' ? content.hi : content.en;

  const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <SEOWrapper>
      <main className="min-h-screen pt-20">
        <LiveTicker />
        
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-lg opacity-80 mb-2">{t.subtitle}</p>
          <div className="inline-block px-4 py-1 rounded-full bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-10">
            {today}
          </div>

          <ZodiacSelector />

          {/* Trust Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">{t.trust1_h}</h3>
              <p className="text-sm opacity-70">{t.trust1_p}</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">{t.trust2_h}</h3>
              <p className="text-sm opacity-70">{t.trust2_p}</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">{t.trust3_h}</h3>
              <p className="text-sm opacity-70">{t.trust3_p}</p>
            </div>
          </div>
        </div>
      </main>
    </SEOWrapper>
  );
}
