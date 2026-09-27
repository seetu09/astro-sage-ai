import { cache } from 'react';
import { getServiceSupabase } from '@/lib/serverWallet';

/**
 * Blog storage, backed by `public.blog_posts` (migration 006).
 *
 * Replaces the filesystem layout the app used before: posts were a
 * `data/posts.json` array rewritten by the admin route and cover images were
 * written into `public/blogs/` — both impossible on Vercel's read-only
 * filesystem, so publishing from production always failed. This module is the
 * single read/write path; the pages, sitemap and admin route all go through it.
 *
 * Error policy (mirrors lib/serverArtifactCatalog.ts, with one deliberate
 * exception):
 *   - zero rows                     → a legitimately empty blog
 *   - error 42P01 (relation missing)→ migrate-deploy grace period: log a clear
 *     warning and return [] so a deploy that lands BEFORE the operator applies
 *     006 doesn't take /blog down; the warning names the migration to run.
 *   - any other error/config throw  → log in full, then THROW (callers surface
 *     a 5xx — a broken blog must not masquerade as an empty one).
 *
 * Writes (insert/upload) are used only by the admin route and THROW on failure.
 */

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  /** Public cover-image URL. */
  image: string;
  createdAt: string;
};

/** Shapes returned flat from PostgREST; mapped explicitly to camelCase below. */
type BlogPostRow = {
  id: unknown;
  slug: unknown;
  title: unknown;
  category: unknown;
  excerpt: unknown;
  content: unknown;
  image_url: unknown;
  created_at: unknown;
};

const SELECT_COLUMNS = 'id, slug, title, category, excerpt, content, image_url, created_at';

function mapRow(row: BlogPostRow): BlogPost {
  return {
    id: String(row.id ?? ''),
    slug: String(row.slug ?? ''),
    title: String(row.title ?? ''),
    category: String(row.category ?? 'Vedic Astrology'),
    excerpt: String(row.excerpt ?? ''),
    content: String(row.content ?? ''),
    image: String(row.image_url ?? ''),
    createdAt: String(row.created_at ?? ''),
  };
}

/**
 * `react.cache` collapses the per-request double read (page + metadata) into
 * one query; the bare fallback keeps the module importable in Node tests.
 */
const perRequestCache: typeof cache = typeof cache === 'function' ? cache : ((fn) => fn);

/** All posts, newest first. See the module header for the error policy. */
export const loadBlogPosts = perRequestCache(async (): Promise<BlogPost[]> => {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from('blog_posts')
      .select(SELECT_COLUMNS)
      .order('created_at', { ascending: false });

    if (error) {
      if ((error as { code?: string }).code === '42P01') {
        console.warn(
          'LOAD_BLOG_POSTS: table blog_posts does not exist — apply ' +
            'supabase/migrations/006_blog_posts.sql. Serving an empty blog until then.'
        );
        return [];
      }
      console.error('LOAD_BLOG_POSTS_FAILED', {
        message: error.message,
        code: (error as { code?: string }).code,
      });
      throw error;
    }
    return ((data ?? []) as BlogPostRow[]).map(mapRow);
  } catch (err) {
    // Config missing / transport failure — same treatment as above: loud, then thrown.
    console.error('LOAD_BLOG_POSTS_ERR', err);
    throw err;
  }
});

/** Upload a cover image to the `blog-images` bucket; returns its public URL. */
export async function uploadBlogCoverImage(file: File): Promise<string> {
  const maxBytes = 5 * 1024 * 1024;
  if (!file.type.startsWith('image/')) {
    throw new Error('Cover image must be an image file.');
  }
  if (file.size > maxBytes) {
    throw new Error('Cover image must be 5 MB or smaller.');
  }

  const supabase = getServiceSupabase();
  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = (file.name || 'cover')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    console.error('UPLOAD_BLOG_COVER_FAILED', error.message);
    throw new Error(`Cover image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Cover image upload failed: could not build a public URL.');
  }
  return data.publicUrl;
}

/**
 * Insert a published post. `slug` is unique — the caller surfaces the
 * PostgREST error (e.g. duplicate title → 409 message) to the admin.
 * Returns the created post.
 */
export async function insertBlogPost(post: {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  imageUrl: string;
}): Promise<BlogPost> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      image_url: post.imageUrl,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) {
    console.error('INSERT_BLOG_POST_FAILED', error.message);
    throw new Error(error.message);
  }
  return mapRow(data as BlogPostRow);
}
