'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, BookOpen, Share2, Heart } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';
import { blogPosts, getBlogPostBySlug } from '@/data/blog-posts';

const categoryColors: Record<string, string> = {
  career: 'bg-blue-500/20 text-blue-400',
  love: 'bg-pink-500/20 text-pink-400',
  health: 'bg-green-500/20 text-green-400',
  spirituality: 'bg-purple-500/20 text-purple-400',
  remedies: 'bg-amber-500/20 text-amber-400',
};

export default function BlogPostPage() {
  const params = useParams();
  const { language, t } = useLanguage();
  const slug = params.slug as string;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{language === 'en' ? 'Post Not Found' : 'पोस्ट नहीं मिली'}</h1>
          <Link href="/blog" className="astro-button">{t.blog.backToBlog}</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"><ArrowLeft className="w-4 h-4" />{t.blog.backToBlog}</Link>
        </motion.div>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="aspect-video rounded-xl overflow-hidden mb-8"><img src={post.image} alt={post.title[language]} className="w-full h-full object-cover" /></div>
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[post.category]}`}>{t.blog.categories[post.category]}</span>
            <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)] mb-6">{post.title[language]}</h1>
          <div className="flex items-center justify-between py-4 border-y border-[var(--border)] mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center"><BookOpen className="w-5 h-5 text-[var(--accent)]" /></div>
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{post.author}</div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Calendar className="w-3 h-3" />{t.blog.publishedOn} {new Date(post.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"><Heart className="w-5 h-5" /></button>
              <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="prose prose-invert max-w-none mb-12">
            <div className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{post.content[language]}</div>
          </div>
        </motion.article>

        {relatedPosts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="border-t border-[var(--border)] pt-12">
            <h2 className="text-2xl font-bold font-serif text-[var(--text-primary)] mb-6">{t.blog.relatedPosts}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link key={related.slug} href={`/blog/${related.slug}`} className="astro-card block group">
                  <div className="aspect-video rounded-lg overflow-hidden mb-3"><img src={related.image} alt={related.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">{related.title[language]}</h3>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
