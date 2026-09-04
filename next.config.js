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
})

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The PDF renderer (`@react-pdf/renderer`) loads the bundled Mukta TTFs
    // from disk at runtime. outputFileTracing keeps those files inside the
    // Vercel lambda — without this the fonts would be missing in production and
    // Devanagari text would render as blank/missing glyphs.
    outputFileTracingIncludes: {
      '/api/kundali/pdf': ['./public/fonts/**/*'],
    },
  },
}

module.exports = withPWA(nextConfig)

