'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Heart, Shield, Users, Sparkles } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const values = [
  { icon: Heart, key: 'authenticity' },
  { icon: Users, key: 'accessibility' },
  { icon: Sparkles, key: 'innovation' },
  { icon: Shield, key: 'privacy' },
];

const team = [
  { name: { en: 'Pandit Ramesh Sharma', hi: 'पंडित रमेश शर्मा' }, role: { en: 'Chief Astrologer', hi: 'मुख्य ज्योतिषी' }, experience: { en: '25+ years', hi: '25+ वर्ष' }, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { name: { en: 'Dr. Anjali Desai', hi: 'डॉ. अंजली देसाई' }, role: { en: 'Relationship Expert', hi: 'संबंध विशेषज्ञ' }, experience: { en: '15+ years', hi: '15+ वर्ष' }, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { name: { en: 'Vaidya Krishnan Iyer', hi: 'वैद्य कृष्णन अय्यर' }, role: { en: 'Health Astrologer', hi: 'स्वास्थ्य ज्योतिषी' }, experience: { en: '20+ years', hi: '20+ वर्ष' }, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400' },
  { name: { en: 'Arjun Mehta', hi: 'अर्जुन मेहता' }, role: { en: 'AI Engineer', hi: 'AI इंजीनियर' }, experience: { en: 'Building Astrology AI', hi: 'ज्योतिष AI बना रहे हैं' }, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
];

export default function AboutPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.about.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">{t.about.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="astro-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[var(--accent)]/10"><Target className="w-6 h-6 text-[var(--accent)]" /></div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{t.about.mission.title}</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">{t.about.mission.text}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="astro-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[var(--accent)]/10"><Eye className="w-6 h-6 text-[var(--accent)]" /></div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{t.about.vision.title}</h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">{t.about.vision.text}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
          <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)] text-center mb-8">{t.about.values.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div key={value.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="astro-card text-center">
                <div className="p-4 rounded-full bg-[var(--accent)]/10 w-fit mx-auto mb-4"><value.icon className="w-6 h-6 text-[var(--accent)]" /></div>
                <p className="text-[var(--text-primary)] font-medium">{(t.about.values as any)[value.key]}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)] text-center mb-4">{t.about.team.title}</h2>
          <p className="text-[var(--text-secondary)] text-center max-w-xl mx-auto mb-10">{t.about.team.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="astro-card text-center group">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2 border-[var(--accent)]/30 group-hover:border-[var(--accent)] transition-all">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={member.image} alt={member.name[language]} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{member.name[language]}</h3>
                <p className="text-sm text-[var(--accent)] font-medium mb-2">{member.role[language]}</p>
                <p className="text-xs text-[var(--text-muted)]">{member.experience[language]}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
