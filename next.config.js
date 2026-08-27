/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  // next-pwa regenerates ./public/sw.js + ./public/workbox-*.js on production
  // build. In dev we keep the hand-written `public/sw.js` (see PWARegister)
  // on; next-pwa is disabled so it never stomps live reload / HMR.
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  // next-pwa self-registers `/sw.js` in production (auto-managed). Dev keeps
  // the hand-written SW on and next-pwa's registration is compiled out.
  register: true,
  scope: '/',
  sw: 'sw.js',
  buildExcludes: [/middleware-manifest\.json$/, /_middleware\.js$/, /app-build-manifest\.json$/],
  // Keep the headless-Chromium deps out of the generated SW pre-cache
  // manifest so the SW payload stays small.
  exclude: [/\.map$/, /puppeteer/, /@sparticuz/, /chromium/],
})

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep headless-Chromium deps OUT of the serverless bundle:
    // puppeteer-core ships no browser, and @sparticuz/chromium-min downloads
    // its binary into /tmp at runtime — bundling either would blow the
    // Vercel 50 MB function-size limit.
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
}

module.exports = withPWA(nextConfig)

