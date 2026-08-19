"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();

  if (pathname === "/chat") return null;

  const quickLinks = [
    { label: t.nav?.home || "होम", href: "/" },
    { label: t.nav?.dailyHoroscope || "दैनिक राशिफल", href: "/horoscope" },
    { label: t.nav?.chat || "AI चैट", href: "/chat" },
    { label: t.nav?.blog || "ब्लॉग", href: "/blog" },
  ];

  const services = [
    { label: t.nav?.store || "स्टोर", href: "/store" },
    { label: t.nav?.about || "हमारे बारे में", href: "/about" },
    { label: t.nav?.contact || "संपर्क करें", href: "/contact" },
    { label: t.nav?.social || "सोशल", href: "/social" },
  ];

  const legal = [
    { label: t.footer?.privacy || "गोपनीयता नीति", href: "/privacy" },
    { label: t.footer?.terms || "सेवा की शर्तें", href: "/terms" },
    { label: t.footer?.disclaimer || "अस्वीकरण", href: "/disclaimer" },
  ];

  const linkClasses = `
    text-sm
    text-slate-500 dark:text-[#9CA3AF]
    hover:text-violet-700 dark:hover:text-[#FFD166]
    transition-colors duration-200
  `;

  const headingClasses = `
    text-sm font-semibold uppercase tracking-wider
    text-slate-800 dark:text-[#F3F4F6]
  `;

  return (
    <footer className="relative border-t border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-[#080811]/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center shadow-sunlit-soft dark:shadow-glow-gold group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white dark:text-[#080811]" />
              </div>
              <span className="text-lg font-bold font-serif bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-[#FFD166] dark:to-[#E0A96D] bg-clip-text text-transparent">
                AstroVeda
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-[#9CA3AF] leading-relaxed">
              {t.footer?.tagline || "प्राचीन ज्ञान और आधुनिक AI के साथ आपकी ब्रह्मांडीय यात्रा का मार्गदर्शन।"}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className={headingClasses}>
              {t.footer?.quickLinks || "त्वरित लिंक"}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className={headingClasses}>
              {t.footer?.services || "सेवाएं"}
            </h3>
            <ul className="space-y-2.5">
              {services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className={headingClasses}>
              {t.footer?.legal || "कानूनी"}
            </h3>
            <ul className="space-y-2.5">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClasses}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 dark:text-[#6B7280]">
            © 2025 AstroVeda. {t.footer?.copyright || "सर्वाधिकार सुरक्षित।"}
          </p>
          <p className="text-xs text-slate-400 dark:text-[#6B7280] flex items-center gap-1">
            {t.footer?.madeWith || "के साथ बनाया गया"}{" "}
            <Heart className="w-3 h-3 text-red-500 fill-red-500" /> AstroVeda
          </p>
        </div>
      </div>
    </footer>
  );
}