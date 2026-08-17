"use client";
import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { useLanguage } from '@/app/context/LanguageContext';

const zodiacData = {
  en: [
    { name: 'Aries', date: 'Mar 21 - Apr 19', icon: '♈', slug: 'aries' },
    { name: 'Taurus', date: 'Apr 20 - May 20', icon: '♉', slug: 'taurus' },
    { name: 'Gemini', date: 'May 21 - Jun 20', icon: '♊', slug: 'gemini' },
    { name: 'Cancer', date: 'Jun 21 - Jul 22', icon: '♋', slug: 'cancer' },
    { name: 'Leo', date: 'Jul 23 - Aug 22', icon: '♌', slug: 'leo' },
    { name: 'Virgo', date: 'Aug 23 - Sep 22', icon: '♍', slug: 'virgo' },
    { name: 'Libra', date: 'Sep 23 - Oct 22', icon: '♎', slug: 'libra' },
    { name: 'Scorpio', date: 'Oct 23 - Nov 21', icon: '♏', slug: 'scorpio' },
    { name: 'Sagittarius', date: 'Nov 22 - Dec 21', icon: '♐', slug: 'sagittarius' },
    { name: 'Capricorn', date: 'Dec 22 - Jan 19', icon: '♑', slug: 'capricorn' },
    { name: 'Aquarius', date: 'Jan 20 - Feb 18', icon: '♒', slug: 'aquarius' },
    { name: 'Pisces', date: 'Feb 19 - Mar 20', icon: '♓', slug: 'pisces' },
  ],
  hi: [
    { name: 'मेष', date: '21 मार्च - 19 अप्रैल', icon: '♈', slug: 'aries' },
    { name: 'वृषभ', date: '20 अप्रैल - 20 मई', icon: '♉', slug: 'taurus' },
    { name: 'मिथुन', date: '21 मई - 20 जून', icon: '♊', slug: 'gemini' },
    { name: 'कर्क', date: '21 जून - 22 जुलाई', icon: '♋', slug: 'cancer' },
    { name: 'सिंह', date: '23 जुलाई - 22 अगस्त', icon: '♌', slug: 'leo' },
    { name: 'कन्या', date: '23 अगस्त - 22 सितंबर', icon: '♍', slug: 'virgo' },
    { name: 'तुला', date: '23 सितंबर - 22 अक्टूबर', icon: '♎', slug: 'libra' },
    { name: 'वृश्चिक', date: '23 अक्टूबर - 21 नवंबर', icon: '♏', slug: 'scorpio' },
    { name: 'धनु', date: '22 नवंबर - 21 दिसंबर', icon: '♐', slug: 'sagittarius' },
    { name: 'मकर', date: '22 दिसंबर - 19 जनवरी', icon: '♑', slug: 'capricorn' },
    { name: 'कुंभ', date: '20 जनवरी - 18 फरवरी', icon: '♒', slug: 'aquarius' },
    { name: 'मीन', date: '19 फरवरी - 20 मार्च', icon: '♓', slug: 'pisces' },
  ]
};

export default function ZodiacSelector() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  
  const signs = language === 'hi' ? zodiacData.hi : zodiacData.en;

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {signs.map((sign) => (
        <Link 
          key={sign.slug} 
          href={`/horoscope/${sign.slug}`}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 border ${
            theme === 'dark'
              ? 'bg-slate-800/40 border-slate-700 hover:border-purple-500 text-white'
              : 'bg-white border-orange-100 hover:border-orange-400 text-slate-800 shadow-sm'
          }`}
        >
          <span className="text-4xl mb-2">{sign.icon}</span>
          <span className="font-bold text-sm">{sign.name}</span>
          <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {sign.date}
          </span>
        </Link>
      ))}
    </div>
  );
}
