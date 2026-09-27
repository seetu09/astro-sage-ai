import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { loadBlogPosts, type BlogPost } from '@/lib/serverBlogPosts';

export const dynamic = 'force-dynamic';

async function getPost(slug: string): Promise<BlogPost | undefined> {
  try {
    const posts = await loadBlogPosts();
    return posts.find((p) => p.slug === slug);
  } catch (error) {
    console.error('[blog post page] failed to load posts:', error);
    return undefined;
  }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Split article into paragraphs on blank lines (handles CRLF, CR and LF endings)
  const lf = String.fromCharCode(10);
  const cr = String.fromCharCode(13);
  const normalized = post.content.split(cr + lf).join(lf).split(cr).join(lf);
  const paragraphs = normalized
    .split(lf + lf)
    .map((block) => block.split(lf).join(' ').trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen py-12 px-4">
      <article className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all blogs
        </Link>

        {/* Cover banner */}
        <div className="aspect-video rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Category tag */}
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-medium mb-4">
          {post.category}
        </span>

        {/* Title & publish date */}
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)] leading-tight mb-3">
          {post.title}
        </h1>
        <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] pb-6 mb-8 border-b border-[var(--border)]">
          <Calendar className="w-4 h-4" />
          Published on {formatDate(post.createdAt)}
        </div>

        {/* Content paragraphs */}
        <div className="space-y-5">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-base leading-relaxed text-[var(--text-secondary)]">
              {paragraph.trim()}
            </p>
          ))}
        </div>

        <Link href="/blog" className="astro-button inline-flex items-center gap-2 mt-12">
          <ArrowLeft className="w-4 h-4" />
          Back to all blogs
        </Link>
      </article>
    </div>
  );
}