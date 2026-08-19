"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const mainLinks = [
    { href: "/daily-horoscope", label: "Daily Horoscope" },
    { href: "/kundali", label: "Kundali" },
    { href: "/matchmaking", label: "Matchmaking" },
    { href: "/chat", label: "AI Guru Chat" },
    { href: "/store", label: "Store" },
  ];

  const moreLinks = [
    { href: "/horoscope", label: "Horoscope" },
    { href: "/numerology", label: "Numerology" },
    { href: "/tarot", label: "Tarot" },
    { href: "/dosha-checker", label: "Dosha Checker" },
    { href: "/blog", label: t.nav.blog },
    { href: "/social", label: t.nav.social },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const allLinks = [...mainLinks, ...moreLinks];

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#080811]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#FFD166] to-[#E0A96D] flex items-center justify-center shadow-glow-gold group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#080811]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-[#FFD166] to-[#E0A96D] bg-clip-text text-transparent">
                AstroVeda
              </span>
            </Link>

            {/* Desktop: Main links + More dropdown */}
            <div className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-[#FFD166] bg-[#FFD166]/10"
                      : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 150)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    moreLinks.some(l => pathname === l.href)
                      ? "text-[#FFD166] bg-[#FFD166]/10"
                      : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/5"
                  }`}
                >
                  More
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-[#121026]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg py-1 z-50">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === link.href
                            ? "text-[#FFD166] bg-[#FFD166]/10"
                            : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <div className="hidden sm:block">
                <LanguageToggle />
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-[#F3F4F6] hover:bg-white/5 rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#FFD166] to-[#E0A96D] flex items-center justify-center text-[#080811] font-bold text-xs sm:text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-xs sm:text-sm font-semibold rounded-lg hover:shadow-glow-gold transition-all"
                >
                  Sign In
                </button>
              )}

              {/* Ask Guru CTA */}
              <Link
                href="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-sm font-semibold rounded-lg hover:shadow-glow-gold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Ask Guru
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[#F3F4F6]" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[#F3F4F6]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#080811]/95 backdrop-blur-xl border-b border-white/5 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5 sm:hidden">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              <div className="grid grid-cols-2 gap-1 pt-2">
                {allLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-[#FFD166] bg-[#FFD166]/10"
                        : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5 space-y-2">
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FFD166] to-[#E0A96D] text-[#080811] text-sm font-semibold rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Guru
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#F3F4F6] hover:bg-white/5 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD166] to-[#E0A96D] flex items-center justify-center text-[#080811] font-bold text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    {user?.name}
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 text-[#F3F4F6] text-sm font-medium rounded-lg"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}