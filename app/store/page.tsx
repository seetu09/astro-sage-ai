'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Filter, Gem, BookOpen, Flame, CircleDot } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

interface Product { id: string; name: { en: string; hi: string }; description: { en: string; hi: string }; price: number; category: string; rating: number; image: string; inStock: boolean; }

const products: Product[] = [
  { id: '1', name: { en: 'Yellow Sapphire (Pukhraj)', hi: 'पीला नीलम (पुखराज)' }, description: { en: 'Premium 5-carat yellow sapphire for Jupiter blessings', hi: 'बृहस्पति आशीर्वाद के लिए प्रीमियम 5 कैरेट पीला नीलम' }, price: 15000, category: 'gemstones', rating: 4.8, image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=400', inStock: true },
  { id: '2', name: { en: 'Blue Sapphire (Neelam)', hi: 'नीला नीलम' }, description: { en: 'Authentic Ceylon blue sapphire for Saturn', hi: 'शनि के लिए प्रामाणिक सीलोनी नीला नीलम' }, price: 25000, category: 'gemstones', rating: 4.9, image: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=400', inStock: true },
  { id: '3', name: { en: 'Sri Yantra', hi: 'श्री यंत्र' }, description: { en: 'Energized copper Sri Yantra for wealth', hi: 'धन के लिए ऊर्जावान तांबे का श्री यंत्र' }, price: 3500, category: 'yantras', rating: 4.7, image: 'https://images.unsplash.com/photo-1606293459339-fed7f6d4c6c0?w=400', inStock: true },
  { id: '4', name: { en: 'Mahamrityunjaya Yantra', hi: 'महामृत्युंजय यंत्र' }, description: { en: 'For health and longevity blessings', hi: 'स्वास्थ्य और दीर्घायु आशीर्वाद के लिए' }, price: 2800, category: 'yantras', rating: 4.6, image: 'https://images.unsplash.com/photo-1606293459339-fed7f6d4c6c0?w=400', inStock: true },
  { id: '5', name: { en: 'Lal Kitab', hi: 'लाल किताब' }, description: { en: 'Complete guide to Lal Kitab astrology', hi: 'लाल किताब ज्योतिष की पूरी गाइड' }, price: 1200, category: 'books', rating: 4.5, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', inStock: true },
  { id: '6', name: { en: 'Brihat Parashara Hora', hi: 'बृहत् पाराशर होरा' }, description: { en: 'Classic Vedic astrology text', hi: 'क्लासिक वैदिक ज्योतिष ग्रंथ' }, price: 2800, category: 'books', rating: 4.9, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', inStock: true },
  { id: '7', name: { en: 'Rudraksha Mala (5 Mukhi)', hi: 'रुद्राक्ष माला (5 मुखी)' }, description: { en: 'Authentic Nepali 5 Mukhi Rudraksha', hi: 'प्रामाणिक नेपाली 5 मुखी रुद्राक्ष' }, price: 1800, category: 'rudraksha', rating: 4.7, image: 'https://images.unsplash.com/photo-1606293459339-fed7f6d4c6c0?w=400', inStock: true },
  { id: '8', name: { en: '1 Mukhi Rudraksha', hi: '1 मुखी रुद्राक्ष' }, description: { en: 'Rare and powerful Ek Mukhi Rudraksha', hi: 'दुर्लभ और शक्तिशाली एक मुखी रुद्राक्ष' }, price: 45000, category: 'rudraksha', rating: 5.0, image: 'https://images.unsplash.com/photo-1606293459339-fed7f6d4c6c0?w=400', inStock: false },
];

const categoryIcons: Record<string, React.ElementType> = { all: Filter, gemstones: Gem, yantras: CircleDot, books: BookOpen, rudraksha: Flame };

export default function StorePage() {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: t.store.categories.all },
    { id: 'gemstones', label: t.store.categories.gemstones },
    { id: 'yantras', label: t.store.categories.yantras },
    { id: 'books', label: t.store.categories.books },
    { id: 'rudraksha', label: t.store.categories.rituals },
  ];

  const filteredProducts = activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.store.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.store.subtitle}</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Filter;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'}`}>
                <Icon className="w-4 h-4" />{cat.label}
              </button>
            );
          })}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="astro-card group">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {!product.inStock && <div className="absolute inset-0 bg-[var(--bg-primary)]/70 flex items-center justify-center"><span className="px-3 py-1 rounded-full bg-[var(--text-muted)]/20 text-[var(--text-muted)] text-sm font-medium">{t.store.outOfStock}</span></div>}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />)}
                  <span className="text-xs text-[var(--text-muted)] ml-1">({product.rating})</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{product.name[language]}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2">{product.description[language]}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[var(--accent)]">₹{product.price.toLocaleString()}</span>
                  <button disabled={!product.inStock} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium hover:bg-[var(--accent)] hover:text-[var(--bg-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"><ShoppingCart className="w-3 h-3" />{t.store.addToCart}</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
