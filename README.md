# AstroVeda 🔮

[![CI](https://github.com/seetu09/astro-sage-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/seetu09/astro-sage-ai/actions/workflows/ci.yml)

AI-powered Vedic astrology platform built with Next.js 14 (App Router) — Kundli (birth chart) generation, daily horoscopes, Kundali matching (Ashtakoot Guna Milan), numerology, tarot readings, and an AI astrology chat. Available in English & Hindi.

## Features

- **Kundli Generator** — Vedic birth chart with planetary positions, dashas, yogas, doshas, and AI-written pillar narratives; paid PDF export via `@react-pdf/renderer`.
- **Daily Horoscope** — 12-sign Rashifal with LLM-generated insights.
- **Kundali Matching** — 8-koota Guna Milan (36 guna) engine with dosha detection.
- **Numerology** — Moolank / Bhagyank / Namank profiles.
- **Tarot** — AI-interpreted card readings.
- **AI Chat** — astrology Q&A with a free-message quota and wallet top-ups.
- **Payments** — Razorpay checkout for report unlocks, wallet recharges, and artifact-store purchases, with HMAC-verified server callbacks.
- **Auth** — Supabase (email + Google OAuth).
- **i18n** — English/Hindi with a completeness check script.
- **PWA** — installable, offline-friendly shell.

## Tech Stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Supabase (Auth + Postgres + Storage) · Razorpay · Google Gemini · @react-pdf/renderer (PDF) · Vitest

## Getting Started

### Prerequisites

- Node.js 22+ (CI runs Node 22; `isomorphic-dompurify` requires ≥ 22.22)
- A Supabase project — Auth plus Postgres tables from `supabase/migrations/` (apply `001`–`006` **in order**) and Storage buckets
- Razorpay keys (test mode works fine locally)
- Gemini API keys

### Setup

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See `.env.example` for the full list of required environment variables and what each is used for.

> ⚠️ Never commit `.env.local`. If a key was ever exposed publicly, rotate it in the provider console.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run lint` | ESLint (Next core-web-vitals) |
| `npm run typecheck` | ESLint + `tsc --noEmit` |
| `npm test` / `npm run test:watch` | Vitest unit tests |
| `npm run check:i18n` | Verify translation key completeness |

CI runs lint, typecheck, unit tests, and the i18n check on every push/PR to `main` (see `.github/workflows/ci.yml`).

## Project Structure

```
app/
  api/            # Route handlers (auth-free: kundali, horoscope, tarot, chat, payments…)
  components/     # Shared UI components
  context/        # React contexts (Auth, Wallet, App, Language)
  lib/            # i18n client utilities
  */page.tsx      # Route pages (kundali, matchmaking, numerology, …)
lib/              # Pure domain logic (astrology math, payment unlock tokens, rate limiting)
  __tests__/      # Vitest unit tests
supabase/migrations/ # SQL schema: wallet, report/artifact ownership, catalog, chart cache, blog
public/           # PWA manifest, icons
scripts/          # i18n consistency checker
```

### Architecture notes

- **Domain math is pure** (`lib/ashtakoot.ts`, `lib/numerology.ts`, `lib/astrology.ts`) — fully unit-testable, no I/O.
- **Paid reports are server-gated**: `lib/paymentUnlock.ts` mints HMAC-signed unlock tokens that only `/api/payment/verify` issues after Razorpay confirms an order.
- **Store checkout prices are server-validated**: `/api/payment/create-order` resolves the item from the `artifacts` table and rejects any client amount that disagrees with `price_inr` (`lib/artifactPricing.ts`); ownership lands in `purchased_artifacts` only after Razorpay reports the order as paid.
- **Blog + catalog live in Supabase, never the filesystem**: the deployed FS on Vercel is read-only, so posts (`public.blog_posts`), covers (`blog-images` bucket) and the artifact catalog (`public.artifacts`) are all database-backed. Apply `supabase/migrations/` in order — the code logs a clear warning (blog) or a 5xx (catalog/checkout) until the tables exist.
- **Rate limiting**: `lib/rateLimit.ts` provides IP sliding windows on all AI/payment routes, backed by Upstash Redis in production (set `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`). When those env vars are absent — or a Redis call fails — it falls back to an in-memory limiter so local dev, CI, and Redis outages never block requests.

## Testing

```bash
npm test
```

Tests cover the numerology reduction rules, the Ashtakoot Guna Milan engine (guna totals, verdict bands, dosha detection), payment verification (signature + order re-fetch, wallet credit idempotency, artifact ownership), and server-side artifact price validation. Add tests for any new pure domain logic under `lib/`.

## Deployment

The app targets Vercel. Set every variable from `.env.example` in the project's Environment Variables (Production), including `NEXT_PUBLIC_APP_URL` set to the production origin — it drives the sitemap/robots URLs and OAuth redirects.

After deploying, two live checks are worth doing:

- `GET /api/health` → `"rateLimitBackend": "upstash"` confirms the Upstash env vars are present (a `"memory"` value means rate limits are per-instance only).
- Apply `supabase/migrations/004`–`006` (SQL Editor or `supabase db push`) if they are not yet in the production database — see `PLAN.md` for the checklist.

## Security Notes

- Razorpay webhook/signature verification is enforced server-side; the unlock token never ships until payment is confirmed.
- Client-side wallet/free-message counters are a UX affordance only — treat any true monetization enforcement as a server concern (see Architecture notes).
- The admin blog endpoint uses a shared `ADMIN_PASSWORD`; restrict access at the edge/WAF in production.
