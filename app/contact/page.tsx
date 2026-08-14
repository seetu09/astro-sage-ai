'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function ContactPage() {
  const { language, t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => { setStatus('success'); setFormData({ name: '', email: '', subject: '', message: '' }); setTimeout(() => setStatus('idle'), 3000); }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.contact.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.contact.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">{t.contact.info.title}</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[var(--accent)]/10"><Mail className="w-5 h-5 text-[var(--accent)]" /></div>
                <div><div className="text-sm text-[var(--text-muted)] mb-1">Email</div><div className="text-[var(--text-primary)] font-medium">{t.contact.info.email}</div></div>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="astro-card space-y-6">
              <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.contact.name}</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full astro-input" /></div>
              <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.contact.email}</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full astro-input" /></div>
              <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.contact.subject}</label><input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="w-full astro-input" /></div>
              <div><label className="block text-sm font-medium text-[var(--text-primary)] mb-2">{t.contact.message}</label><textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full astro-input resize-none" /></div>
              <button type="submit" className="w-full astro-button flex items-center justify-center gap-2"><Send className="w-4 h-4" />{t.contact.send}</button>
              {status === 'success' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg"><CheckCircle className="w-4 h-4" />{t.contact.success}</motion.div>}
              {status === 'error' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg"><AlertCircle className="w-4 h-4" />{t.contact.error}</motion.div>}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
