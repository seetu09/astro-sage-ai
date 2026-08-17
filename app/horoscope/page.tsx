import React from 'react';
import ZodiacSelector from '@/app/components/ZodiacSelector';
import LiveTicker from '@/app/components/LiveTicker';
import SEOWrapper from '@/app/components/SEOWrapper';

export default function HoroscopePage() {
  const today = new Date().toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <SEOWrapper 
      title="Daily Horoscope - AstroVeda"
      description="Get your free daily horoscope based on your zodiac sign. Accurate predictions for Love, Career, and Health."
    >
      <main className="min-h-screen pt-20">
        <LiveTicker />
        
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
            Daily Horoscope
          </h1>
          <p className="text-lg opacity-80 mb-2">Select your zodiac sign to read your prediction</p>
          <div className="inline-block px-4 py-1 rounded-full bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-10">
            {today}
          </div>

          <ZodiacSelector />

          {/* Trust Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">Personalized Guidance</h3>
              <p className="text-sm opacity-70">Our AI Guru analyzes planetary positions to give you specific daily advice.</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">100% Free</h3>
              <p className="text-sm opacity-70">Check your love, career, and money meters every day without any subscription.</p>
            </div>
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold mb-2">Vedic Wisdom</h3>
              <p className="text-sm opacity-70">Traditional Indian astrology principles meet modern AI technology.</p>
            </div>
          </div>
        </div>
      </main>
    </SEOWrapper>
  );
}
