"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Menu, X, Sparkles, MessageCircle, Heart, Sun, Store } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home", icon: Star },
  { href: "/kundali", label: "Free Kundali", icon: Sparkles },
  { href: "/horoscope", label: "Daily Horoscope", icon: Sun },
  { href: "/match-making", label: "Match Making", icon: Heart },
  { href: "/chat", label: "AI Chat", icon: MessageCircle },
  { href: "/store", label: "Store", icon: Store },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Star className="w-8 h-8 text-gold-400 group-hover:rotate-180 transition-transform duration-700" />
              <div className="absolute inset-0 w-8 h-8 bg-gold-400/20 rounded-full blur-lg" />
            </div>
            <span className="text-xl font-bold text-gradient">AstroSage AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-gold-400 hover:bg-white/5 transition-all"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-gold-400 hover:bg-white/5"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-strong border-t border-white/10">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-gold-400 hover:bg-white/5 transition-all"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
