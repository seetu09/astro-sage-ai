# Changelog

## [Unreleased]

### Added
- **Store checkout (Task 11)** — `artifact_purchase` payment type: prices are validated server-side against `artifacts.price_inr` (`lib/artifactPricing.ts` — a mismatching client amount is rejected, never charged), Razorpay orders carry an item snapshot in their notes, and `/api/payment/verify` records durable ownership in `purchased_artifacts` (migration 005, idempotent on `order_id`). The Buy Now flow on `/store/[id]` is live with an email field for guest buyers and a bilingual success receipt.
- **Blog publishing that works on Vercel** — posts moved off the read-only filesystem (`data/posts.json` + `public/blogs/`) into `public.blog_posts` + the `blog-images` storage bucket (migration 006); the admin route re-checks the session cookie in-handler.
- **`kundali_charts` under migration control** — migration 004 enables RLS, drops every hand-created policy (strict deny for `anon`/`authenticated`), and the chart-cache read/write in `/api/kundali/generate` now goes through the service role with both PostgREST `{error}` results checked and logged.
- **`/api/health` reports `rateLimitBackend`** (`upstash` | `memory`) so the Upstash wiring can be verified after a deploy.
- **Artifact recommendation engine** — lib/artifactRecommender.ts (pure, tested, never throws).
- **Artifact catalog** — Supabase `artifacts` table with price, category and priority (migrated off `data/artifacts.json` in `19eecfe`; that file no longer exists).
- **Recommendation card** — app/components/ArtifactRecommendations.tsx (quiet, bilingual, dark-mode aware).
- **Report integration** — Suggestions render inside the Remedial Measures section of KundliReport.tsx, gated on active doshas.
- **Store pages** — /store catalog and /store/[id] product detail.
- **Admin editor** — /admin/artifacts with admin-session-gated GET/PUT API.
- **Analytics events** — artifact_impression, artifact_click, store_view, artifact_purchased.

### Fixed
- **`next.config.js` on Next.js 14.2** — `serverExternalPackages`/`outputFileTracingIncludes` are Next 15 spellings that 14.2 silently ignored; they now live under `experimental.serverComponentsExternalPackages`/`experimental.outputFileTracingIncludes`, restoring pdfkit font tracing for the paid PDF route.
- **`dosha-check` 429** now sends the standard `Retry-After` header (it was the only route that put `retryAfter` in the body only).
- **Purchased-report auto-binding actually runs now** — it moved from `UserProfileModal` (which imported a service-role module into the browser, where `SUPABASE_SERVICE_ROLE_KEY` can never exist) into `GET /api/profile/reports`.
- **Dark-mode contrast** — .report-root ink made theme-aware; global text fallback added in globals.css.
- **Hero heading layout** — Devanagari line-height and vertical padding corrected in HeroSection.tsx.

### Removed
- **`POST /api/matchmaking`** — dead stub that returned `Math.random()` compatibility scores with zero callers; `/matchmaking` the page uses `lib/ashtakoot` and is unaffected.
- **Fake contact & newsletter forms** — both faked a success state with no endpoint behind them; `/contact` keeps its direct details (email is now a `mailto:` link).
- **`data/posts.json`** — replaced by `public.blog_posts` (migration 006).

### Notes
- Recommender caps at 2 suggestions per report by design (subtle guidance, not a catalog).
- Recommendations are silent for dosha-free charts — the section renders nothing.
- Migrations `004`–`006` must be applied to the production database (SQL Editor or `supabase db push`); `PLAN.md` carries the exact apply steps and the Upstash env checklist.
