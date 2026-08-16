"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const mainLinks = [
    { href: "/", label: t.nav.home },
    { href: "/daily-horoscope", label: t.nav.dailyHoroscope },
    { href: "/kundali", label: t.nav.kundali },
    { href: "/matchmaking", label: t.nav.matchmaking },
    { href: "/chat", label: t.nav.chat },
  ];

  const moreLinks = [
    { href: "/blog", label: t.nav.blog },
    { href: "/store", label: t.nav.store },
    { href: "/social", label: t.nav.social },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const allLinks = [...mainLinks, ...moreLinks];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
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
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
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
                      ? "text-amber-500 bg-amber-500/10"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  }`}
                >
                  More
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-50">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === link.href
                            ? "text-amber-500 bg-amber-500/10"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
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
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
                >
                  Sign In
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[var(--hover-bg)] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-primary)]" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-primary)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)] max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 sm:px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)] sm:hidden">
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
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-[var(--border-color)]">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    {user?.name}
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-lg"
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
