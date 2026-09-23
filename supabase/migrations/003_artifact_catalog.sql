-- AstroVeda artifact catalog schema.
--
-- WHY THIS TABLE EXISTS
-- ---------------------
-- The catalog used to live at `data/artifacts.json` and was read straight off
-- disk. That works locally but NOT on Vercel: the deployed filesystem is
-- read-only, so the admin editor's `fs.writeFile` (PUT /api/admin/artifacts)
-- failed in production, and every catalog edit required a redeploy. Moving the
-- catalog into Postgres makes admin edits take effect on the next request.
--
-- CONVENTIONS (mirrors 001_wallet_schema.sql / 002_purchased_kundli_reports.sql)
--   * snake_case columns, plural snake_case table name
--   * timestamptz created_at default now()
--   * named indexes `{table}_{purpose}_idx`
--   * RLS enabled; service role (Node service client) does ALL writes
--
-- WHERE THIS DELIBERATELY DIFFERS FROM 001/002
--   The storefront is UNAUTHENTICATED (app/store/page.tsx and app/store/[id]),
--   so the SELECT policy cannot be "own rows only" — it is `using (true)`.
--   No insert/update/delete policies exist: the admin route writes through
--   getServiceSupabase(), which bypasses RLS entirely. The public read path is
--   also filtered to is_active = true in lib/serverArtifactCatalog.ts.
--
-- NOTE: there is no updated_at trigger. 002 has none either. lib/
-- serverArtifactCatalog.ts sets updated_at = now() explicitly on every upsert.

create table if not exists public.artifacts (
  -- Human-readable slug, e.g. 'example-neelam'. Doubles as the /store/:id key.
  id text primary key,

  -- Bilingual copy blocks. jsonb (not separate columns) so the catalog keeps
  -- growing languages without a migration per language.
  name jsonb not null,                     -- { en, hi }
  doshas text[] not null,                  -- canonical machine keys, e.g. {sade_sati}
  pitch jsonb not null,                    -- { en, hi }
  benefits jsonb not null,                 -- { en: string[], hi: string[] }
  image_url text not null,
  product_url text not null,

  -- Ranking hint for the storefront / recommender (higher = shown first).
  priority integer not null default 0 check (priority >= 0),
  disclaimer jsonb not null,               -- { en, hi }

  -- Free-text category with a SUGGESTED list in lib/catalogSchema.ts
  -- (ARTIFACT_CATEGORIES). Intentionally not a FK to a categories table and
  -- intentionally not constrained: adding a category must not need a migration.
  category text not null default 'Other',

  -- Stored in rupees, not paise, so admin input maps 1:1 (₹0.00 default).
  price_inr numeric(12,2) not null default 0 check (price_inr >= 0),
  currency text not null default 'INR',

  -- Hidden-from-buyers flag. Placeholders below ship as is_active = false.
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public storefront query: active rows, highest priority first.
create index if not exists artifacts_active_priority_idx
  on public.artifacts (is_active, priority desc);

-- Reserved for future category filtering / category pages.
create index if not exists artifacts_category_idx
  on public.artifacts (category);

alter table public.artifacts enable row level security;

-- The storefront is unauthenticated, so every reader may see every row. The
-- is_active filter is applied in the application layer (lib/serverArtifactCatalog
-- -> /api/artifacts), which is also what keeps placeholders hidden from buyers.
drop policy if exists "artifacts select public" on public.artifacts;
create policy "artifacts select public" on public.artifacts
  for select using (true);

-- Writes happen exclusively via the service role (bypasses RLS), so no
-- insert/update/delete policies are defined.

-- ── Seed: the 2 pre-existing placeholders ───────────────────────────────
-- Both ship is_active = false so they stay hidden from the storefront and the
-- report recommender until real products are entered. The old `_note` field is
-- intentionally dropped — that advisory text lived only in the JSON file.
-- `on conflict (id) do nothing` keeps re-running this migration safe.
insert into public.artifacts
  (id, name, doshas, pitch, benefits, image_url, product_url, priority, disclaimer, category, price_inr, is_active)
values
  (
    'example-neelam',
    '{"en":"Blue Sapphire (Neelam)","hi":"नीलम"}'::jsonb,
    array['sade_sati', 'shani_dosh'],
    '{"en":"Shani''s influence in your chart suggests Neelam may help steady the mind through this period.","hi":"आपकी कुंडली में शनि का प्रभाव नीलम धारण करने से इस अवधि में मानसिक स्थिरता में सहायक हो सकता है।"}'::jsonb,
    '{"en":["Traditional remedy for Shani afflictions","Supports focus and patience","Commonly used during Sade Sati"],"hi":["शनि दोष का पारंपरिक उपाय","एकाग्रता और धैर्य में सहायक","साढ़े साती में सामान्यतः प्रयुक्त"]}'::jsonb,
    '/store/example-neelam.jpg',
    '/store/example-neelam',
    10,
    '{"en":"Traditional remedy. Consult a qualified astrologer before wearing.","hi":"पारंपरिक उपाय। धारण करने से पूर्व योग्य ज्योतिषी से परामर्श करें।"}'::jsonb,
    'Gemstones',
    0,
    false
  ),
  (
    'example-rudraksha',
    '{"en":"5-Mukhi Rudraksha","hi":"पंचमुखी रुद्राक्ष"}'::jsonb,
    array['mangal_dosh', 'kaal_sarp_dosh'],
    '{"en":"A grounding remedy often recommended for Mangal and Kaal Sarp afflictions.","hi":"मंगल एवं काल सर्प दोष के लिए सामान्यतः अनुशंसित उपाय।"}'::jsonb,
    '{"en":["Balances Mangal''s intensity","Traditionally worn for Kaal Sarp","Sattvic and easy to wear daily"],"hi":["मंगल की तीव्रता संतुलित करता है","काल सर्प हेतु पारंपरिक","सात्विक एवं दैनिक धारण हेतु सरल"]}'::jsonb,
    '/store/example-rudraksha.jpg',
    '/store/example-rudraksha',
    8,
    '{"en":"Traditional remedy. Results vary by individual chart.","hi":"पारंपरिक उपाय। परिणाम व्यक्तिगत कुंडली पर निर्भर हैं।"}'::jsonb,
    'Rudraksha',
    0,
    false
  )
on conflict (id) do nothing;
