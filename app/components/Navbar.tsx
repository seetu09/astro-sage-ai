"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import UserProfileDropdown, { type ProfileMenuAction } from "./UserProfileDropdown";
import UserProfileModal from "./UserProfileModal";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";

export default function Navbar() {
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalAction, setProfileModalAction] = useState<ProfileMenuAction | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileProfileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideDesktopProfile = profileDropdownRef.current?.contains(target);
      const clickedInsideMobileProfile = mobileProfileDropdownRef.current?.contains(target);

      if (!clickedInsideDesktopProfile && !clickedInsideMobileProfile) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileAction = useCallback((action: ProfileMenuAction) => {
    setProfileModalAction(action);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [logout]);

  const mainLinks = [
    { href: "/daily-horoscope", label: t.nav.dailyHoroscope },
    { href: "/kundali", label: t.nav.kundali },
    { href: "/matchmaking", label: t.nav.matchmaking },
    { href: "/chat", label: t.nav.chat },
    { href: "/store", label: t.nav.store },
  ];

  const moreLinks = [
    { href: "/horoscope", label: t.nav.horoscope },
    { href: "/numerology", label: t.nav.numerology },
    { href: "/tarot", label: t.nav.tarot },
    { href: "/dosha-checker", label: t.nav.doshaChecker },
    { href: "/blog", label: t.nav.blog },
    { href: "/social", label: t.nav.social },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  const allLinks = [...mainLinks, ...moreLinks];

  const activeLinkClass =
    "text-amber-700 bg-amber-50 dark:text-[#FFD166] dark:bg-[#FFD166]/10";
  const inactiveLinkClass =
    "text-amber-800/60 hover:text-amber-900 hover:bg-amber-100/70 dark:text-[#9CA3AF] dark:hover:text-[#F3F4F6] dark:hover:bg-white/5";

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#FFFDF6]/80 dark:bg-[#080811]/80 border-b border-amber-200/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center shadow-sunlit-soft dark:shadow-glow-gold group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-[#080811]" />
              </div>
              <span className="text-xl sm:text-2xl font-bold font-serif bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] bg-clip-text text-transparent">
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
                    pathname === link.href ? activeLinkClass : inactiveLinkClass
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
                    moreLinks.some(l => pathname === l.href) ? activeLinkClass : inactiveLinkClass
                  }`}
                >
                  {t.nav.more}
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-[#FFFDF6]/95 dark:bg-[#121026]/95 backdrop-blur-xl border border-amber-200/60 dark:border-white/10 rounded-xl shadow-sunlit-soft dark:shadow-lg py-1 z-50">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          pathname === link.href ? activeLinkClass : inactiveLinkClass
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
                <div ref={profileDropdownRef} className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen((open) => !open)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-amber-900 dark:text-[#F3F4F6] hover:bg-amber-100/70 dark:hover:bg-white/5 rounded-lg transition-colors"
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="menu"
                  >
                    {user?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar}
                        alt={`${user.name}'s profile`}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-amber-200/80 dark:ring-[#FFD166]/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center text-white dark:text-[#080811] font-bold text-xs sm:text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="hidden lg:inline">{user?.name?.split(" ")[0]}</span>
                  </button>
                  {profileDropdownOpen && user && (
                    <UserProfileDropdown
                      user={user}
                      onPlaceholderAction={handleProfileAction}
                      onLogout={handleLogout}
                      className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)]"
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-xs sm:text-sm font-semibold rounded-lg hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all"
                >
                  {t.nav.signIn}
                </button>
              )}

              {/* Ask Guru CTA */}
              <Link
                href="/chat"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm font-semibold rounded-lg hover:shadow-sunlit-soft dark:hover:shadow-glow-gold transition-all"
              >
                <Sparkles className="w-4 h-4" />
                {t.nav.askGuru}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-amber-100/70 dark:hover:bg-white/5 transition-colors"
                 aria-label={t.nav.toggleMenu}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900 dark:text-[#F3F4F6]" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900 dark:text-[#F3F4F6]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF6]/95 dark:bg-[#080811]/95 backdrop-blur-xl border-b border-amber-200/60 dark:border-white/5 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-200/60 dark:border-white/5 sm:hidden">
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
                      pathname === link.href ? activeLinkClass : inactiveLinkClass
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="pt-2 border-t border-amber-200/60 dark:border-white/5 space-y-2">
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] text-white dark:text-[#080811] text-sm font-semibold rounded-lg"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.nav.askGuru}
                </Link>
                {isAuthenticated ? (
                  <div ref={mobileProfileDropdownRef} className="relative">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen((open) => !open);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-900 dark:text-[#F3F4F6] hover:bg-amber-100/70 dark:hover:bg-white/5 rounded-lg"
                      aria-expanded={profileDropdownOpen}
                      aria-haspopup="menu"
                    >
                      {user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={`${user.name}'s profile`}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-200/80 dark:ring-[#FFD166]/30"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 dark:from-[#FFD166] dark:to-[#E0A96D] flex items-center justify-center text-white dark:text-[#080811] font-bold text-sm">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                      {user?.name}
                    </button>
                    {profileDropdownOpen && user && (
                      <UserProfileDropdown
                        user={user}
                        onPlaceholderAction={handleProfileAction}
                        onLogout={handleLogout}
                        className="relative mt-2 w-full"
                      />
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-2 bg-amber-50 dark:bg-white/5 border border-amber-200/60 dark:border-white/10 text-amber-900 dark:text-[#F3F4F6] text-sm font-medium rounded-lg"
                  >
                    {t.nav.signIn}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      {profileModalAction && (
        <UserProfileModal
          isOpen
          initialView={profileModalAction}
          onClose={() => setProfileModalAction(null)}
        />
      )}
    </>
  );
}