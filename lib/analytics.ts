// Lightweight analytics helper — safe no-op until NEXT_PUBLIC_GA_ID is configured.
//
// ── How to wire a real provider later ──────────────────────────────────────
//
// This file intentionally ships with a console-friendly no-op so the app can
// render analytics calls without a provider configured. When you're ready to
// go live, pick one of the following and swap the body of `trackEvent`:
//
//  1. Google Analytics 4 (gtag.js)
//     • Keep the existing window.gtag() call — it already works once
//       `NEXT_PUBLIC_GA_ID` is set and the GA script is loaded in
//       `app/layout.tsx`.
//     • No code change needed; just ensure the GA snippet renders.
//
//  2. Google Tag Manager (gtm.js)
//     • Replace the body with:
//         window.dataLayer = window.dataLayer ?? [];
//         window.dataLayer.push({ event: name, ...params });
//     • Load GTM via the container snippet in `app/layout.tsx`.
//
//  3. Vercel Analytics
//     • Install `vercel/analytics` (already allowed as a Vercel-native dep).
//     • Call `track(name, params)` from `import { track } from '@vercel/analytics/react'`.
//     • Remove the window.gtag branch or gate it behind a feature flag.
//
//  4. Plausible
//     • Load the Plausible snippet in `app/layout.tsx` (self-hosted or cloud).
//     • Call `window.plausible(name, params)` from `trackEvent`.
//
//  5. PostHog
//     • Load `posthog-js` via the snippet in `app/layout.tsx`.
//     • Call `window.posthog.capture(name, params)` from `trackEvent`.
//
//  6. Amplitude / Mixpanel / custom HTTP endpoint
//     • Replace the body with the provider's JS SDK call or a `fetch()` to your
//       own event-ingestion endpoint (be sure to fire-and-forget so you don't
//       block navigation).
//
// All options share the same contract as this helper: fire-and-forget, accepts
// a string event name and an optional flat params object, and is safe to call
// even when analytics is not configured.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}