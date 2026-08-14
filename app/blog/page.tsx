'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { blogPosts } from '@/data/blog-posts';

const categoryColors: Record<string, string> = {
  career: 'bg-blue-500/20 text-blue-400',
  love: 'bg-pink-500/20 text-pink-400',
  health: 'bg-green-500/20 text-green-400',
  spirituality: 'bg-purple-500/20 text-purple-400',
  remedies: 'bg-amber-500/20 text-amber-400',
};

export default function BlogPage() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">{t.blog.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{t.blog.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article key={post.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <Link href={`/blog/${post.slug}`} className="astro-card block group h-full">
                <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-[var(--bg-secondary)]">
                  <img src={post.image} alt={post.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[post.category]}`}>{t.blog.categories[post.category]}</span>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">{post.title[language]}</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-3">{post.excerpt[language]}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center"><BookOpen className="w-3 h-3 text-[var(--accent)]" /></div>
                    <span className="text-xs text-[var(--text-muted)]">{post.author}</span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-[var(--accent)] mt-3 opacity-0 group-hover:opacity-100 transition-opacity">{t.blog.readMore}<ArrowRight className="w-4 h-4" /></div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
