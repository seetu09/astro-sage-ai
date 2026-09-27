-- AstroVeda blog schema.
--
-- WHY THIS TABLE EXISTS
-- ---------------------
-- Blog posts used to live at `data/posts.json` with cover images written into
-- `public/blogs/` by POST /api/admin/blogs. That works locally but NOT on
-- Vercel: the deployed filesystem is read-only, so every publish from the live
-- admin page returned 500, nothing persisted, and the image was lost — the
-- exact failure mode migration 003 already fixed for the artifact catalog.
-- Moving posts into Postgres (and covers into Supabase Storage) makes
-- publishing work from the deployed site.
--
-- CONVENTIONS (mirrors 001/002/003): snake_case columns, timestamptz
-- created_at default now(), named indexes `{table}_{purpose}_idx`, RLS enabled,
-- service role does ALL writes.
--
-- The public read path (/blog, /blog/[slug], /sitemap.ts) uses the service
-- role too, but a `select using (true)` policy is still defined so the table
-- remains readable with the anon key (debugging, future edge reads).

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),

  -- URL segment (/blog/<slug>), generated from the title at publish time.
  slug text not null unique,

  title text not null,
  category text not null default 'Vedic Astrology',
  excerpt text not null default '',
  content text not null default '',

  -- Public URL of the cover image in the `blog-images` storage bucket
  -- (uploaded by the admin route before the row is inserted).
  image_url text not null default '',

  created_at timestamptz not null default now()
);

create index if not exists blog_posts_created_idx
  on public.blog_posts (created_at desc);

alter table public.blog_posts enable row level security;

-- The blog is public content: anyone may read, only the service role writes.
drop policy if exists "blog_posts select public" on public.blog_posts;
create policy "blog_posts select public" on public.blog_posts
  for select using (true);

-- No insert/update/delete policies: the admin route writes through
-- getServiceSupabase(), which bypasses RLS entirely.

-- ── Cover-image storage bucket ────────────────────────────────────────────
-- Public bucket (covers are served to anonymous visitors via
-- storage.getPublicUrl). Created idempotently here because bucket setup
-- previously existed only by hand in the dashboard (same drift class as
-- kundali_charts / avatars). Writes go through the service role, which
-- bypasses storage RLS — no storage.objects policies are required for that.
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;
