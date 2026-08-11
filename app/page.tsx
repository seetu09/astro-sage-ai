'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle, ChevronRight, Star, Calendar, Heart, Brain } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

const features = [
  {
    icon: Star,
    title: { en: 'Daily Horoscope', hi: 'दैनिक राशिफल' },
    description: { en: 'Get personalized daily readings based on your zodiac sign and planetary positions.', hi: 'अपनी राशि और ग्रह स्थितियों के आधार पर व्यक्तिगत दैनिक रीडिंग प्राप्त करें।' },
    href: '/daily-horoscope',
  },
  {
    icon: MessageCircle,
    title: { en: 'AI Astrology Guru', hi: 'AI ज्योतिष गुरु' },
    description: { en: 'Chat with our AI-powered astrologer for instant guidance on any life question.', hi: 'किसी भी जीवन प्रश्न पर तत्काल मार्गदर्शन के लिए हमारे AI-संचालित ज्योतिषी से चैट करें।' },
    href: '/chat',
  },
  {
    icon: Brain,
    title: { en: 'Vedic Wisdom', hi: 'वैदिक ज्ञान' },
    description: { en: 'Explore ancient Vedic astrology principles applied to modern life challenges.', hi: 'आधुनिक जीवन की चुनौतियों पर लागू प्राचीन वैदिक ज्योतिष सिद्धांतों का अन्वेषण करें।' },
    href: '/blog',
  },
  {
    icon: Heart,
    title: { en: 'Love & Relationships', hi: 'प्रेम और संबंध' },
    description: { en: 'Discover compatibility insights and relationship guidance through the stars.', hi: 'सितारों के माध्यम से अनुकूलता अंतर्दृष्टि और संबंध मार्गदर्शन की खोज करें।' },
    href: '/blog/love-compatibility-zodiac',
  },
];

const stats = [
  { value: '50K+', label: { en: 'Daily Users', hi: 'दैनिक उपयोगकर्ता' } },
  { value: '1M+', label: { en: 'Readings Delivered', hi: 'रीडिंग दी गई' } },
  { value: '99%', label: { en: 'Accuracy Rate', hi: 'सटीकता दर' } },
  { value: '24/7', label: { en: 'AI Support', hi: 'AI समर्थन' } },
];

export default function HomePage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen">
      <section className="relative py-20 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'en' ? 'AI-Powered Vedic Astrology' : 'AI-संचालित वैदिक ज्योतिष'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-serif text-[var(--text-primary)] mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/daily-horoscope" className="astro-button flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5" />
                {t.hero.ctaPrimary}
              </Link>
              <Link href="/chat" className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all">
                <MessageCircle className="w-5 h-5" />
                {t.hero.ctaSecondary}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold font-serif text-[var(--accent)] mb-2">{stat.value}</div>
                <div className="text-sm text-[var(--text-muted)]">{stat.label[language]}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)] mb-4">
              {language === 'en' ? 'Explore the Cosmos' : 'ब्रह्मांड का अन्वेषण करें'}
            </h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              {language === 'en' ? 'Discover tools and insights to navigate your spiritual journey.' : 'अपनी आध्यात्मिक यात्रा को नेविगेट करने के लिए उपकरण और अंतर्दृष्टि की खोज करें।'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <Link href={feature.href} className="astro-card block group h-full">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--bg-primary)] transition-all">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                        {feature.title[language]}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.description[language]}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="astro-card text-center">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--text-primary)] mb-4">
              {language === 'en' ? 'Ready to Unlock Your Destiny?' : 'अपनी नियति को अनलॉक करने के लिए तैयार हैं?'}
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
              {language === 'en' ? 'Start your journey today with a personalized horoscope reading or chat with our AI Guru.' : 'आज ही एक व्यक्तिगत राशिफल रीडिंग के साथ अपनी यात्रा शुरू करें या हमारे AI गुरु से चैट करें।'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/chat" className="astro-button">{language === 'en' ? 'Chat with AI Guru' : 'AI गुरु से चैट करें'}</Link>
              <Link href="/daily-horoscope" className="px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all">
                {language === 'en' ? 'View Daily Horoscope' : 'दैनिक राशिफल देखें'}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
