import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type Post = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  createdAt: string;
};

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json');

async function getPosts(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(POSTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

const categoryColors: Record<string, string> = {
  'Vedic Astrology': 'bg-purple-500/20 text-purple-400',
  'Love & Compatibility': 'bg-pink-500/20 text-pink-400',
  'Planetary Transits': 'bg-cyan-500/20 text-cyan-400',
  Remedies: 'bg-amber-500/20 text-amber-400',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-[var(--text-primary)] mb-4">
            Astrology Blog
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Cosmic insights on Vedic astrology, love compatibility, planetary transits and remedies.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="astro-card flex flex-col items-center text-center py-16">
            <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <p className="font-medium text-[var(--text-primary)]">No articles yet</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              New cosmic wisdom is on its way — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="astro-card group flex flex-col p-0 overflow-hidden"
              >
                <div className="aspect-video overflow-hidden bg-[var(--bg-secondary)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        categoryColors[post.category] ?? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">{post.excerpt}</p>

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
                    Read Article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}