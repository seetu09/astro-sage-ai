'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: { en: 'Rahul Sharma', hi: 'राहुल शर्मा' },
    location: { en: 'Mumbai', hi: 'मुंबई' },
    rating: 5,
    quote: {
      en: 'The career prediction was spot on! I followed the guidance about waiting for the right time and got a promotion exactly when it was predicted.',
      hi: 'करियर की भविष्यवाणी बिल्कुल सही थी! मैंने सही समय का इंतज़ार करने की सलाह मानी और बिल्कुल वही समय पर प्रमोशन मिला।',
    },
    initial: 'R',
    color: 'bg-amber-500',
  },
  {
    name: { en: 'Anjali Kapoor', hi: 'अंजलि कपूर' },
    location: { en: 'Bangalore', hi: 'बैंगलोर' },
    rating: 5,
    quote: {
      en: 'I was skeptical about Kundali matching, but the compatibility analysis was incredibly detailed and accurate. It helped us understand each other better.',
      hi: 'मैं कुंडली मिलान को लेकर संशय में थी, लेकिन अनुकूलता विश्लेषण अविश्वसनीय रूप से विस्तृत और सटीक था। इसने हमें एक-दूसरे को बेहतर समझने में मदद की।',
    },
    initial: 'A',
    color: 'bg-orange-500',
  },
  {
    name: { en: 'Priya Mehta', hi: 'प्रिया मेहता' },
    location: { en: 'Delhi', hi: 'दिल्ली' },
    rating: 5,
    quote: {
      en: 'The remedies suggested for my financial troubles actually worked within weeks. Chanting the mantra and keeping the copper vessel changed everything.',
      hi: 'मेरी वित्तीय समस्याओं के लिए सुझाए गए उपाय वास्तव में हफ्तों में काम कर गए। मंत्र जाप और ताम्र पात्र रखने से सब कुछ बदल गया।',
    },
    initial: 'P',
    color: 'bg-rose-500',
  },
];

export default function Testimonials() {
  const { language } = useLanguage();

  return (
    <section className="w-full py-20 px-4 md:px-8 bg-[var(--bg-secondary)]/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">
            {language === 'en' ? 'What Our Users Say' : 'हमारे उपयोगकर्ता क्या कहते हैं'}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {language === 'en'
              ? 'Real stories from people who found clarity through AstroVeda.'
              : 'उन लोगों की असली कहानियाँ जिन्होंने AstroVeda के माध्यम से स्पष्टता पाई।'}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="astro-card relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-[var(--accent)]/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[var(--accent)] text-[var(--accent)]" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-[var(--text-primary)] text-sm leading-relaxed mb-6">
                &ldquo;{t.quote[language]}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">
                    {t.name[language]}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{t.location[language]}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
