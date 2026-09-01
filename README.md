# AstroVeda 🔮

AI-powered Vedic astrology platform built with Next.js 14 (App Router) — Kundli (birth chart) generation, daily horoscopes, Kundali matching (Ashtakoot Guna Milan), numerology, tarot readings, and an AI astrology chat. Available in English & Hindi.

## Features

- **Kundli Generator** — Vedic birth chart with planetary positions, dashas, yogas, doshas, and AI-written pillar narratives; paid PDF export via headless Chromium.
- **Daily Horoscope** — 12-sign Rashifal with LLM-generated insights.
- **Kundali Matching** — 8-koota Guna Milan (36 guna) engine with dosha detection.
- **Numerology** — Moolank / Bhagyank / Namank profiles.
- **Tarot** — AI-interpreted card readings.
- **AI Chat** — astrology Q&A with a free-message quota and wallet top-ups.
- **Payments** — Razorpay checkout for report unlocks & wallet recharges, with HMAC-verified server callbacks.
- **Auth** — Supabase (email + Google OAuth).
- **i18n** — English/Hindi with a completeness check script.
- **PWA** — installable, offline-friendly shell.

## Tech Stack

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Supabase · Razorpay · Google Gemini & Moonshot AI · Puppeteer (PDF) · Vitest

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (auth + kundli cache)
- Razorpay keys (test mode works fine locally)
- Gemini and/or Moonshot API keys

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
data/posts.json   # Blog posts (admin-published)
public/           # PWA manifest, icons
scripts/          # i18n consistency checker
```

### Architecture notes

- **Domain math is pure** (`lib/ashtakoot.ts`, `lib/numerology.ts`, `lib/astrology.ts`) — fully unit-testable, no I/O.
- **Paid reports are server-gated**: `lib/paymentUnlock.ts` mints HMAC-signed unlock tokens that only `/api/payment/verify` issues after Razorpay confirms an order.
- **Rate limiting**: `lib/rateLimit.ts` provides per-instance IP sliding windows on all AI/payment routes. For hard global quotas on serverless, front it with Upstash Redis or a WAF.

## Testing

```bash
npm test
```

Tests cover the numerology reduction rules and the Ashtakoot Guna Milan engine (guna totals, verdict bands, dosha detection). Add tests for any new pure domain logic under `lib/`.

## Deployment

The app targets Vercel. Set every variable from `.env.example` in the project's Environment Variables (Production), including `NEXT_PUBLIC_APP_URL` set to the production origin — it drives the sitemap/robots URLs and OAuth redirects.

## Security Notes

- Razorpay webhook/signature verification is enforced server-side; the unlock token never ships until payment is confirmed.
- Client-side wallet/free-message counters are a UX affordance only — treat any true monetization enforcement as a server concern (see Architecture notes).
- The admin blog endpoint uses a shared `ADMIN_PASSWORD`; restrict access at the edge/WAF in production.
