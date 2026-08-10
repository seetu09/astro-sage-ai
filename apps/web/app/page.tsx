"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, Sparkles, MessageCircle, Heart, Sun, Store, 
  ChevronRight, Calendar, Clock, MapPin, ArrowRight,
  Download, Phone
} from "lucide-react";
import { ZODIAC_SIGNS, getDailyHoroscope } from "@/lib/astrology";

function FloatingStars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="star absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <FloatingStars />

      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span className="text-sm text-gold-400">AI-Powered Vedic Astrology</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          <span className="text-white">Your Destiny is Written</span>
          <br />
          <span className="text-gradient">in the Stars</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Discover what the universe has planned for you. AstroSage AI brings you personalized 
          kundli insights, accurate predictions, and life guidance — all through a simple chat.
        </p>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-10">
          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-gold-400" /> Trusted insights</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-gold-400" /> Instant answers</span>
          <span>•</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-gold-400" /> 24/7 cosmic guidance</span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/chat"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-cosmic-900 font-bold rounded-xl transition-all glow-gold"
          >
            <MessageCircle className="w-5 h-5" />
            Ask AstroSage AI
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/kundali"
            className="flex items-center gap-2 px-8 py-4 glass hover:bg-white/10 text-white font-semibold rounded-xl transition-all"
          >
            <Sparkles className="w-5 h-5 text-gold-400" />
            Free Kundali
          </Link>
        </div>

        {/* App download badges */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <p className="text-sm text-slate-500">Download the AstroSage AI App</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
              <Download className="w-4 h-4" />
              Google Play
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300">
              <Download className="w-4 h-4" />
              App Store
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronRight className="w-6 h-6 text-gold-400 rotate-90" />
      </div>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      icon: Sun,
      title: "Daily Horoscope",
      description: "Get accurate daily horoscope predictions based on your zodiac sign. Receive insights about career, love, health, and finances to plan your day.",
      href: "/horoscope",
      color: "from-orange-500 to-amber-500",
    },
    {
      icon: Sparkles,
      title: "Free Kundali",
      description: "Generate your detailed birth chart (Kundali) instantly using your birth details. Explore planetary positions, doshas, and strengths.",
      href: "/kundali",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Heart,
      title: "Match Making",
      description: "Check compatibility between two individuals through traditional Vedic Kundali matching. Analyze Guna Milan score and doshas.",
      href: "/match-making",
      color: "from-rose-500 to-red-500",
    },
    {
      icon: Store,
      title: "AstroSage Store",
      description: "Explore a wide range of astrology products including gemstones, rudraksha, yantras, and spiritual remedies recommended by experts.",
      href: "/store",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our Featured <span className="text-gradient">Astrology Services</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Comprehensive Vedic astrology tools powered by advanced AI to guide you through life journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group relative glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-400 leading-relaxed mb-4">
                {service.description}
              </p>
              <div className="flex items-center gap-1 text-gold-400 text-sm font-medium">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HoroscopeForecastSection() {
  const [selectedSign, setSelectedSign] = useState(ZODIAC_SIGNS[0]);

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-900 via-cosmic-800/50 to-cosmic-900" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Horoscope <span className="text-gradient">Forecasts</span>
          </h2>
          <p className="text-slate-400">Select your zodiac sign to reveal today cosmic message</p>
        </div>

        {/* Zodiac Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-12">
          {ZODIAC_SIGNS.map((sign) => (
            <button
              key={sign.name}
              onClick={() => setSelectedSign(sign)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                selectedSign.name === sign.name
                  ? "bg-gradient-to-br from-gold-500/20 to-amber-500/20 border border-gold-500/50"
                  : "glass hover:bg-white/10"
              }`}
            >
              <span className="text-2xl">{sign.symbol}</span>
              <span className={`text-xs font-medium ${
                selectedSign.name === sign.name ? "text-gold-400" : "text-slate-400"
              }`}>
                {sign.name}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Sign Reading */}
        <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">{selectedSign.symbol}</span>
            <div>
              <h3 className="text-2xl font-bold text-white">{selectedSign.name}</h3>
              <p className="text-slate-400 text-sm">{selectedSign.date} • {selectedSign.element} Sign</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            {getDailyHoroscope(selectedSign.name)}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gold-400">
              <Star className="w-4 h-4" />
              <span>Lucky Number: {Math.floor(Math.random() * 9) + 1}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gold-400">
              <Sun className="w-4 h-4" />
              <span>Lucky Color: {["Red", "Blue", "Green", "Gold", "Purple"][Math.floor(Math.random() * 5)]}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AIChatSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold-500/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <MessageCircle className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-gold-400">AI Astrologer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ask Your Questions.<br />
              <span className="text-gradient">Get Instant Guidance</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Our AI-powered astrologer understands Vedic astrology deeply. Ask about your career, 
              relationships, health, or any life question. Get personalized answers based on your 
              birth chart and current planetary transits.
            </p>
            <div className="space-y-4 mb-8">
              {[
                "Personalized readings based on your birth chart",
                "24/7 availability — ask anytime, anywhere",
                "Deep Vedic astrology knowledge powered by AI",
                "Save and revisit your conversations",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Star className="w-3 h-3 text-gold-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-cosmic-900 font-bold rounded-xl transition-all glow-gold"
            >
              <MessageCircle className="w-5 h-5" />
              Start Chatting
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="glass rounded-2xl p-6 glow-purple">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-cosmic-900" />
                  </div>
                  <div className="glass rounded-xl rounded-tl-none p-3 max-w-xs">
                    <p className="text-sm text-slate-300">Namaste! I am your AI Astrologer. How can I help you today?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="glass rounded-xl rounded-tr-none p-3 max-w-xs bg-white/10">
                    <p className="text-sm text-slate-300">What does my birth chart say about my career in 2025?</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">You</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-cosmic-900" />
                  </div>
                  <div className="glass rounded-xl rounded-tl-none p-3 max-w-sm">
                    <p className="text-sm text-slate-300">
                      Based on your chart, Jupiter transits your 10th house in 2025, indicating significant career growth. 
                      Saturn supports long-term stability. Focus on leadership roles around April-May...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Let the Universe Guide Your <span className="text-gradient">Next Step</span>
        </h2>
        <p className="text-slate-400 mb-10 max-w-xl mx-auto">
          Get the AstroSage AI app on Play Store and App Store for personalized astrology on the go.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs text-slate-400">GET IT ON</div>
              <div className="text-sm font-semibold">Google Play</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs text-slate-400">Download on the</div>
              <div className="text-sm font-semibold">App Store</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative">
      <HeroSection />
      <ServicesSection />
      <HoroscopeForecastSection />
      <AIChatSection />
      <CTASection />
    </main>
  );
}
