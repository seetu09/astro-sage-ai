'use client';

import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';
import { Users, ScrollText, Star, Globe } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '10,000+',
    label: { en: 'Users Trust Us', hi: 'उपयोगकर्ता हम पर भरोसा करते हैं' },
  },
  {
    icon: ScrollText,
    value: '50,000+',
    label: { en: 'Readings Delivered', hi: 'रीडिंग्स वितरित' },
  },
  {
    icon: Star,
    value: '4.9★',
    label: { en: 'Average Rating', hi: 'औसत रेटिंग' },
  },
  {
    icon: Globe,
    value: '24/7',
    label: { en: 'Available Worldwide', hi: 'दुनिया भर में उपलब्ध' },
  },
];

export default function StatsSection() {
  const { language } = useLanguage();

  return (
    <section className="w-full py-16 px-4 md:px-8 bg-[var(--bg-secondary)]/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-[var(--accent)] mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {stat.label[language]}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
