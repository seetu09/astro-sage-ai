'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';
import { Calendar, Brain, Sparkles, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: Calendar,
    title: { en: 'Enter Your Details', hi: 'अपना विवरण दर्ज करें' },
    description: {
      en: 'Share your birth date, time, and place. Our AI uses precise Vedic calculations.',
      hi: 'अपनी जन्म तिथि, समय और स्थान साझा करें। हमारा AI सटीक वैदिक गणना का उपयोग करता है।',
    },
  },
  {
    icon: Brain,
    title: { en: 'AI Analyzes Your Chart', hi: 'AI आपकी कुंडली का विश्लेषण करता है' },
    description: {
      en: 'Our system maps planetary positions, dasha periods, and yogas in seconds.',
      hi: 'हमारी प्रणाली सेकंडों में ग्रहों की स्थिति, दशा काल और योगों को मैप करती है।',
    },
  },
  {
    icon: Sparkles,
    title: { en: 'Get Your Reading', hi: 'अपनी रीडिंग प्राप्त करें' },
    description: {
      en: 'Receive personalized insights on career, love, health, and remedies tailored to you.',
      hi: 'करियर, प्रेम, स्वास्थ्य और उपायों पर व्यक्तिगत अंतर्दृष्टि प्राप्त करें।',
    },
  },
];

export default function HowItWorks() {
  const { language } = useLanguage();

  return (
    <section className="w-full py-20 px-4 md:px-8 relative overflow-hidden">
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
            {language === 'en' ? 'How It Works' : 'यह कैसे काम करता है'}
          </h2>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            {language === 'en'
              ? 'Your cosmic blueprint in three simple steps.'
              : 'तीन सरल चरणों में अपना ब्रह्मांडीय ब्लूप्रिंट।'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-[var(--border)]" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="astro-card text-center relative z-10">
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-bold text-sm flex items-center justify-center">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-4 mt-2">
                  <step.icon className="w-8 h-8 text-[var(--accent)]" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  {step.title[language]}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                  {step.description[language]}
                </p>
              </div>

              {/* Arrow (mobile only, between cards) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4 md:hidden">
                  <ArrowRight className="w-5 h-5 text-[var(--accent)] rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
