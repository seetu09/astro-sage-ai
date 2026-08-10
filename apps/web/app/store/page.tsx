"use client";

import { Store, Gem, CircleDot, Triangle, ShoppingBag, Star, ArrowRight } from "lucide-react";

const products = [
  {
    category: "Gemstones",
    icon: Gem,
    items: [
      { name: "Yellow Sapphire (Pukhraj)", price: "₹2,499", desc: "For Jupiter blessings, wealth & wisdom", color: "from-yellow-400 to-amber-500" },
      { name: "Blue Sapphire (Neelam)", price: "₹3,999", desc: "For Saturn strength, discipline & success", color: "from-blue-500 to-indigo-600" },
      { name: "Ruby (Manik)", price: "₹1,999", desc: "For Sun power, leadership & vitality", color: "from-red-500 to-rose-600" },
      { name: "Emerald (Panna)", price: "₹2,299", desc: "For Mercury intellect, communication & business", color: "from-emerald-400 to-green-600" },
    ]
  },
  {
    category: "Rudraksha",
    icon: CircleDot,
    items: [
      { name: "1 Mukhi Rudraksha", price: "₹5,999", desc: "Supreme consciousness, moksha & enlightenment", color: "from-amber-600 to-yellow-700" },
      { name: "5 Mukhi Rudraksha", price: "₹499", desc: "Health, peace & spiritual growth", color: "from-amber-500 to-yellow-600" },
      { name: "7 Mukhi Rudraksha", price: "₹1,299", desc: "Wealth, prosperity & Goddess Lakshmi blessings", color: "from-amber-400 to-yellow-500" },
    ]
  },
  {
    category: "Yantras",
    icon: Triangle,
    items: [
      { name: "Sri Yantra", price: "₹999", desc: "Wealth, prosperity & cosmic energy", color: "from-purple-500 to-pink-500" },
      { name: "Kuber Yantra", price: "₹799", desc: "Financial abundance & business growth", color: "from-gold-500 to-amber-600" },
      { name: "Navagraha Yantra", price: "₹1,199", desc: "Balance all 9 planets & remove doshas", color: "from-orange-500 to-red-500" },
    ]
  },
];

export default function StorePage() {
  return (
    <main className="min-h-screen pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Store className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-gold-400">Spiritual Store</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            AstroSage <span className="text-gradient">Store</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Explore a wide range of astrology products including gemstones, rudraksha, yantras, 
            and spiritual remedies recommended by our AI astrologer.
          </p>
        </div>

        {/* Products */}
        <div className="space-y-16">
          {products.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-amber-500 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-cosmic-900" />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.category}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((item) => (
                  <div key={item.name} className="glass rounded-2xl p-5 hover:bg-white/10 transition-all group cursor-pointer">
                    <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${item.color} mb-4 flex items-center justify-center`}>
                      <section.icon className="w-12 h-12 text-white/80" />
                    </div>
                    <h3 className="font-semibold text-white mb-1 group-hover:text-gold-400 transition-colors">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gold-400">{item.price}</span>
                      <button className="p-2 rounded-lg bg-white/5 hover:bg-gold-500/20 text-gold-400 transition-all">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 glass rounded-2xl p-8 text-center">
          <Star className="w-8 h-8 text-gold-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Get Personalized Recommendations</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Our AI astrologer can analyze your birth chart and recommend the perfect gemstone, 
            rudraksha, or yantra for your specific needs.
          </p>
          <a href="/chat" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-amber-500 text-cosmic-900 font-bold rounded-xl transition-all">
            Ask AI Astrologer
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </main>
  );
}
