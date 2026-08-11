'use client';

import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

const quickLinks = [
  { href: '/', label: 'home' },
  { href: '/daily-horoscope', label: 'dailyHoroscope' },
  { href: '/chat', label: 'chat' },
  { href: '/blog', label: 'blog' },
];

const serviceLinks = [
  { href: '/store', label: 'store' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
  { href: '/social', label: 'social' },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-secondary)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
              <span className="text-lg font-bold font-serif text-[var(--text-primary)]">
                Astro<span className="text-[var(--accent)]">Veda</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {t.nav[link.label as keyof typeof t.nav]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {t.footer.services}
            </h3>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                    {t.nav[link.label as keyof typeof t.nav]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
              {t.footer.legal}
            </h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer">{t.footer.privacy}</span></li>
              <li><span className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer">{t.footer.terms}</span></li>
              <li><span className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer">{t.footer.disclaimer}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
            {t.footer.madeWith} <Heart className="w-3 h-3 text-red-500 fill-red-500" /> AstroVeda
          </p>
        </div>
      </div>
    </footer>
  );
}
