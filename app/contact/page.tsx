'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.contact.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.contact.subtitle}</p>
        </motion.div>

        {/*
          The contact FORM was removed (Task 3.5): it faked a success state with
          setTimeout and had no /api endpoint behind it — nothing was ever sent.
          The direct contact details below remain the real way to reach us.
        */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="astro-card">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">{t.contact.info.title}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--accent)]/10"><Mail className="w-5 h-5 text-[var(--accent)]" /></div>
                <div><div className="text-sm text-[var(--text-muted)] mb-1">Email</div><a href={`mailto:${t.contact.info.email}`} className="text-[var(--text-primary)] font-medium hover:text-[var(--accent)] transition-colors">{t.contact.info.email}</a></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--accent)]/10"><Phone className="w-5 h-5 text-[var(--accent)]" /></div>
                <div><div className="text-sm text-[var(--text-muted)] mb-1">Phone</div><div className="text-[var(--text-primary)] font-medium">{t.contact.info.phone}</div></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--accent)]/10"><MapPin className="w-5 h-5 text-[var(--accent)]" /></div>
                <div><div className="text-sm text-[var(--text-muted)] mb-1">Address</div><div className="text-[var(--text-primary)] font-medium">{t.contact.info.address}</div></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
