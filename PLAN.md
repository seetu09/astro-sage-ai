# AstroVeda — Execution Plan

Created: 2026-09-27 · Base commit: `aa6d234` (main) · Working tree clean at start.
Convention: tasks are checked off when implemented **and** validated locally
(`npm run typecheck`, `npm test`, `npm run check:i18n`, `npm run build`).
Items that additionally require a live-system step (Supabase SQL, Vercel env)
carry an explicit **Apply step** — see the bottom sections.

**Final validation (2026-09-27):** typecheck + lint ✅ (only the pre-existing
KundliPdfButton hooks warning) · tests **173/173 ✅** (was 150) · i18n ✅ ·
`next build` ✅ with `Helvetica.afm`/`.cjs` confirmed in the PDF route's NFT
trace (Task 3.1) · NOT pushed — apply migrations before pushing (see below).

## Phase 0 — Preparation
- [x] Task 0.1 — Create PLAN.md and populate environment baseline

## Phase 1 — Foundational Security and Integrity
- [x] Task 1.1 — Bring kundali_charts under migration control with strict RLS — `004_kundali_charts.sql` (RLS on, all pre-existing policies dropped, zero policies, anon/authenticated revoked) + route now uses `getServiceSupabase()` with both `{error}`s checked. Apply step below.
- [x] Task 1.2 — Ensure Upstash Redis is live in production — **verified NOT live** (no `UPSTASH_*` in Vercel Production/Preview); `/api/health` now reports `rateLimitBackend`; apply step below (needs your Upstash credentials).
- [x] Task 1.3 — Server-side price validation for artifact checkout — `lib/artifactPricing.ts` + `getArtifactForCheckout()`; `create-order` rejects any amount that disagrees with `artifacts.price_inr` (8 route tests + 8 unit tests).

## Phase 2 — Core Feature Completion
- [x] Task 2.1 — Complete store checkout (Task 11) — `artifact_purchase` payment type, `005_purchased_artifacts.sql` (+ idempotent RPC), ownership recorded in `/api/payment/verify`, Buy Now flow on `/store/[id]` with guest-email capture and bilingual receipt (2 verify tests added). Apply step below.
- [x] Task 2.2 — Move blog storage off the filesystem — `006_blog_posts.sql` (table + `blog-images` bucket), `lib/serverBlogPosts.ts`, admin route rewritten (storage upload + session re-check), blog pages + sitemap read Supabase, `data/posts.json` deleted. Apply step below.
- [x] Task 2.3 — Fix UserProfileModal server-module import — auto-bind moved into `GET /api/profile/reports` (server-side); client no longer imports `lib/serverPurchasedReports`.

## Phase 3 — Reliability and Debt Cleanup
- [x] Task 3.1 — Fix next.config.js for Next.js 14 — keys moved under `experimental.*`; verified via build trace (Helvetica fonts present in `route.js.nft.json`).
- [x] Task 3.2 — Remove the dead api/matchmaking endpoint — directory deleted, zero references remain (`/matchmaking` page untouched).
- [x] Task 3.3 — Add Retry-After header to dosha-check 429.
- [x] Task 3.4 — Documentation refresh — README (CI badge, Node 22, `@react-pdf/renderer`, migrations, health checks), CHANGELOG (stale `data/artifacts.json` claim + dead Roadmap link fixed + this work logged), `.env.example` (dropped dead Google-Maps/`DEBUG_SECRET`, added `SUPABASE_URL`/`NEXT_PUBLIC_CLEAR_PAYMENT`, Upstash verify note).
- [x] Task 3.5 — Remove contact and newsletter forms — fake-success forms deleted (pages keep their real content), dead i18n keys removed from both languages.

## Phase 4 — Strategic Enhancements (DEFERRED)
- [ ] Task 4.1 — Personalized daily horoscope
- [x] Task 4.2 — doshaAliases storage — `007_artifact_dosha_aliases.sql` adds `artifacts.dosha_aliases jsonb not null default '{}'`; `loadArtifactCatalog` unions every row's map into the catalog-level `doshaAliases` the recommender already reads, and `writeArtifactCatalog` broadcasts the admin's map back onto each row. No backfill (admin authors the vocabulary). 4 new loader tests. Apply step below.
- [x] Task 4.3 — Artifact image upload (admin) — `008_artifact_images_bucket.sql` creates the public `artifact-images` bucket; `POST /api/admin/artifact-image` (multipart → `{ url }`, session-cookie auth only — deliberately NOT the `x-admin-password` the catalog PUT requires) and `lib/serverArtifactImages.ts` (image/5 MB validation + `Date.now()`-prefixed sanitized filename, mirroring the blog cover path). `imageUrl` became OPTIONAL in `lib/catalogSchema.ts` so a product can be catalogued before it is photographed; the editor's new per-artifact control (file input + URL text input + preview) writes the returned URL through the existing `onChange → updateArtifact` path, so the JSON textarea stays the single source of truth and the next Save persists it. 9 new upload-route tests + 5 new schema tests. Apply step below.
- [ ] Task 4.3b — artifact/blog image garbage collection — orphaned `artifact-images` / `blog-images` objects are documented, not deleted: uploads are not transactional with Save, and replacing an image leaves the previous object in the bucket with no delete path. Bounded to the public buckets only (never `avatars`); the admin editor would need a "remove image" affordance that clears the catalog field, plus a retention sweep. Explicitly deferred out of Task 4.3.
- [ ] Task 4.4 — SEO and content (BLOCKED until brand name finalized)

---

## Production Baseline

| Item | Value | How verified |
|---|---|---|
| Production URL | `https://astro-sage-ai.vercel.app` — **LIVE (HTTP 200)** | `curl` probe 2026-09-27 |
| Vercel project | `astro-4657/astro-sage-ai` (team `team_q0Qz8Ma0EShXwteHpoDanXCF`, id `prj_ARpEXi2eSyV7KfDn8KecwxpIdwXP`) | `.vercel/repo.json` + `vercel env ls` |
| Vercel account (CLI) | `seetusingh5-6403` (logged in) | `vercel whoami` |
| Deploy model | Git integration — push to `main` → production; PRs → preview (inferred: no deploy workflow, `.vercel/repo.json` link) | repo inspection |
| Repo | `https://github.com/seetu09/astro-sage-ai`, default branch `main`, HEAD `aa6d234` at plan start | `git log` |
| CI | `.github/workflows/ci.yml` — lint → `tsc --noEmit` → vitest → `check:i18n` on Node **22**, push/PR to `main` | workflow file |
| CI status of HEAD | Unknown from local session (no badge/Actions access) — baseline locally green: typecheck ✅, **150/150 tests ✅**, i18n ✅ (2026-09-27) | local run |
| Runtime | Next.js 14.2.0 App Router, React 18, TS 5; local Node **24.18.0** (`isomorphic-dompurify` needs ≥22.22); no `engines`/`.nvmrc`/`vercel.json` → Vercel uses its own default | `package.json`, `node -v` |
| DB migrations in repo | `001_wallet_schema`, `002_purchased_kundli_reports`, `003_artifact_catalog` (+ `004`/`005`/`006` added by this plan) | `supabase/migrations/` |

## Environment Status

**Vercel Production env (`vercel env ls`, 2026-09-27) — 15 variables:**
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_SESSION_TOKEN`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, `MOONSHOT_API_KEY`, `JWT_SECRET`,
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`,
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.

- ❌ **`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are NOT set in Production** (nor Preview).
  Production rate limiting therefore runs on the per-instance in-memory fallback
  (`lib/rateLimit.ts`) — quotas are enforced per serverless instance, not globally.
  → Task 1.2 deliverable here: verification + wiring instructions (see Apply steps below);
  setting the vars requires the user's Upstash credentials (repo-only decision, 2026-09-27).
- ⚠️ Optional vars not set anywhere, code has fallbacks: `SUPABASE_URL` (falls back to
  `NEXT_PUBLIC_SUPABASE_URL`), `NEXT_PUBLIC_CLEAR_PAYMENT` (dev affordance), `NEXT_PUBLIC_GA_ID`.
- ✅ `ADMIN_SESSION_TOKEN` is set in Production (admin session gate active there).
  Local `.env.local` lacks it → the local `/admin` gate fails closed until it is added.
- **Local `.env.local` is scrubbed**: all 13 secret values are `"[SENSITIVE]"` placeholders
  (Vercel-CLI sync under a sensitive-value policy). No usable credentials exist in this
  workspace, and `vercel env pull` refuses to write production secrets
  (`13 Secret values cannot be pulled`). ⇒ Local runs needing real Supabase/Razorpay calls,
  live DB probes, and live env edits are **not possible from this machine** — they are
  documented as apply steps instead.
- Google Maps vars + `DEBUG_SECRET` exist locally/in Vercel but are **dead** (no code
  references) — removed from `.env.example` in Task 3.4.

## Tool Availability

| Tool | Status | Notes |
|---|---|---|
| `node` / `npm` | ✅ v24.18.0 / 11.16.0 | local |
| `git` | ✅ | clean tree at start |
| `vercel` CLI | ✅ 59.16.0, logged in as `seetusingh5-6403` | `env ls` works; `env pull` redacts secrets; could add env vars if values supplied |
| `supabase` CLI | ❌ not installed (npx offers `supabase@2.118.0` but no login token / DB password exists) | migrations cannot be applied from here |
| `psql` / libpq | ❌ not installed | no direct DB access |
| Supabase Management API | ❌ needs a personal access token — not present | — |
| Upstash credentials | ❌ nowhere in workspace / Vercel | Task 1.2 blocked on user input |
| Live Supabase REST probe | ❌ blocked by scrubbed credentials + Vercel redaction | `kundali_charts` state below is repo-derived |

## kundali_charts State

- **Repo state (verified):** the table is read/written by `app/api/kundali/generate/route.ts`
  (select @ L826, upsert @ L848) but **had no migration** — it was created manually in the
  Supabase dashboard at an unknown point; **its live RLS policy is unverifiable from this
  workspace** (no credentials; see Tool Availability).
- **Code problems (verified):** both operations used the **anon-key** browser client
  (`getSupabaseClient()`), and the upsert's returned `{ error }` was never inspected —
  either (a) a permissive insert policy exists, meaning **any anonymous visitor can write
  arbitrary rows** to production, or (b) writes silently fail and the cache never populates.
- **Fix (Task 1.1):** `supabase/migrations/004_kundali_charts.sql` puts the table under
  migration control with **strict RLS** (RLS enabled, every pre-existing policy dropped, zero
  policies defined → `anon`/`authenticated` denied entirely; service role bypasses), and the
  route now reads/writes through `getServiceSupabase()` with both `{ error }`s checked and
  logged. The code works with or without the migration applied (service role bypasses RLS),
  so **the migration can be applied before or after deploy**.
- **Apply step (manual, until DB access is available):** paste
  `supabase/migrations/004_kundali_charts.sql` into the Supabase dashboard → SQL Editor → Run,
  or `supabase db push` from a machine with Supabase CLI login. Same for `005` and `006`.

---

## Apply steps for live systems (not executable from this workspace)

1. **Migrations 004/005/006/007/008** — run `supabase/migrations/004_kundali_charts.sql`,
   `005_purchased_artifacts.sql`, `006_blog_posts.sql`, `007_artifact_dosha_aliases.sql`,
   `008_artifact_images_bucket.sql` against
   the production Supabase project (SQL Editor, in order; all are idempotent — `create table if
   not exists`, `add column if not exists`, `drop policy if exists`, `on conflict do nothing`).
   Recommended order relative to deploy: apply **before** or **with** the code deploy (004, 007
   and 008 are safe either way — an unreadable `dosha_aliases` is skipped, never fatal, and 008
   only adds a bucket the editor needs for uploads; 005/006 are required
   before checkout / blog publishing work — until they land the code fails loudly with a
   clear console error rather than silently).
2. **Make Upstash live in Vercel** (Task 1.2):
   - Create a Redis database in Upstash (free tier fine; region closest to the Vercel
     functions region).
   - `vercel env add UPSTASH_REDIS_REST_URL production` and
     `vercel env add UPSTASH_REDIS_REST_TOKEN production` (values from the Upstash console),
     then redeploy. No code change needed — `lib/rateLimit.ts` picks both up automatically.
   - Verify: `GET /api/health` → `"rateLimitBackend": "upstash"` (field added by this plan;
     `"memory"` means still degraded).
3. **Storage buckets** — `006` creates the public `blog-images` bucket and `008` the public
   `artifact-images` bucket, both via SQL; the
   pre-existing `avatars` bucket still has no migration (documented drift, out of scope).
   Neither public bucket has a delete path, so replaced and abandoned images accumulate —
   tracked as Task 4.3b.

## Known follow-ups (out of scope for this plan)

- Profile “Purchases” tab listing `purchased_artifacts` (ownership is recorded; UI deferred).
- **Aliases in the browser-rendered report.** Task 4.2 restores the alias map for every
  SERVER-side consumer (`/store/[id]`, `/api/admin/artifacts`), but the report's
  “Recommended for Your Chart” block runs client-side off `/api/artifacts`, which still
  deliberately strips `doshaAliases` to unauthenticated callers — so `app/kundali/page.tsx`
  hard-codes `doshaAliases: {}`. Serving the report's recommendations server-side (or deciding
  the map is public enough to expose) is the remaining step; the report still matches on
  canonical dosha keys meanwhile, which is what it has done since `19eecfe`.
- `avatars` storage policies migration; `hasWalletCreditForPayment` fail-open hardening (Risk 4).

