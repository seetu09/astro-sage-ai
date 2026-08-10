"use client";

import { Star, Github, Twitter, Instagram, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-cosmic-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-gold-400" />
              <span className="text-lg font-bold text-gradient">AstroSage AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI-powered Vedic astrology platform. Discover your cosmic blueprint with personalized birth charts, daily horoscopes, and expert guidance.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/kundali" className="hover:text-white transition-colors">Free Kundali</Link></li>
              <li><Link href="/horoscope" className="hover:text-white transition-colors">Daily Horoscope</Link></li>
              <li><Link href="/match-making" className="hover:text-white transition-colors">Match Making</Link></li>
              <li><Link href="/chat" className="hover:text-white transition-colors">AI Astrologer</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/store" className="hover:text-white transition-colors">Store</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-gold-400 font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-gold-400 hover:bg-white/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-gold-400 hover:bg-white/10 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-gold-400 hover:bg-white/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-gold-400 hover:bg-white/10 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          <p> AstroSage AI. All rights reserved. Powered by Moonshot AI.</p>
        </div>
      </div>
    </footer>
  );
}
