'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] 
                 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-300
                 font-medium text-sm"
       aria-label={t.nav.toggleLanguage}
    >
      <Globe className="w-4 h-4 text-[var(--accent)]" />
      <span className="hidden sm:inline">{language === 'en' ? 'EN' : 'हि'}</span>
      <span className="sm:hidden">{language === 'en' ? 'EN' : 'हि'}</span>
    </motion.button>
  );
}
