'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Youtube, Facebook, MessageCircle, Send, Users, Bell, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const socialLinks = [
  { name: 'Instagram', handle: '@astroveda.official', followers: '125K', icon: Instagram, color: 'from-purple-500 to-pink-500', url: '#' },
  { name: 'Twitter / X', handle: '@AstroVedaAI', followers: '89K', icon: Twitter, color: 'from-blue-400 to-blue-600', url: '#' },
  { name: 'YouTube', handle: 'AstroVeda Channel', followers: '250K', icon: Youtube, color: 'from-red-500 to-red-700', url: '#' },
  { name: 'Facebook', handle: 'AstroVeda Community', followers: '180K', icon: Facebook, color: 'from-blue-600 to-blue-800', url: '#' },
  { name: 'Telegram', handle: 'AstroVeda Daily', followers: '95K', icon: Send, color: 'from-sky-400 to-blue-500', url: '#' },
  { name: 'WhatsApp', handle: 'AstroVeda Updates', followers: '200K', icon: MessageCircle, color: 'from-green-500 to-emerald-600', url: '#' },
];

export default function SocialPage() {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); if (email) { setSubscribed(true); setEmail(''); setTimeout(() => setSubscribed(false), 3000); } };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.social.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.social.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {socialLinks.map((social, index) => (
            <motion.a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className="astro-card group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${social.color}`}><social.icon className="w-6 h-6 text-white" /></div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{social.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{social.handle}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--accent)]">{social.followers}</div>
                  <div className="text-xs text-[var(--text-muted)]">{t.social.followers}</div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="astro-card">
            <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-xl bg-[var(--accent)]/10"><Users className="w-6 h-6 text-[var(--accent)]" /></div><h2 className="text-xl font-bold text-[var(--text-primary)]">{t.social.joinCommunity}</h2></div>
            <p className="text-[var(--text-secondary)] mb-6">{t.social.communityText}</p>
            <div className="space-y-3">
              {[language === 'en' ? 'Daily horoscope discussions' : 'दैनिक राशिफल चर्चाएँ', language === 'en' ? 'Astrology learning resources' : 'ज्योतिष सीखने के संसाधन', language === 'en' ? 'Live Q&A sessions' : 'लाइव प्रश्नोत्तर सत्र', language === 'en' ? 'Birth chart analysis' : 'जन्म कुंडली विश्लेषण'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><CheckCircle className="w-4 h-4 text-[var(--accent)]" />{item}</div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="astro-card">
            <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-xl bg-[var(--accent)]/10"><Bell className="w-6 h-6 text-[var(--accent)]" /></div><h2 className="text-xl font-bold text-[var(--text-primary)]">{t.social.dailyUpdates}</h2></div>
            <p className="text-[var(--text-secondary)] mb-6">{t.social.updatesText}</p>
            <div className="space-y-3">
              {[language === 'en' ? 'Morning horoscope alerts' : 'सुबह का राशिफल अलर्ट', language === 'en' ? 'Lucky number & color' : 'भाग्यशाली संख्या और रंग', language === 'en' ? 'Planetary transit updates' : 'ग्रह गोचर अपडेट', language === 'en' ? 'Weekly predictions' : 'साप्ताहिक भविष्यवाणियाँ'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><CheckCircle className="w-4 h-4 text-[var(--accent)]" />{item}</div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="astro-card text-center">
          <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)] mb-2">{t.social.newsletter.title}</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">{t.social.newsletter.subtitle}</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.social.newsletter.placeholder} required className="flex-1 astro-input" />
            <button type="submit" className="astro-button whitespace-nowrap">{subscribed ? <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" />{language === 'en' ? 'Subscribed!' : 'सब्सक्राइब्ड!'}</span> : t.social.newsletter.subscribe}</button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
