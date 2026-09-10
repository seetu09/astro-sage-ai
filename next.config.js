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
    // Keep @react-pdf/renderer and html-pdf-lite out of the serverless bundle.
    // These packages ship internal font files / native binaries that must be
    // loaded from disk at runtime — bundling them breaks the font paths and
    // causes "Cannot find module '.../Helvetica.cjs'" errors on Vercel.
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'html-pdf-lite', '@resvg/resvg-js'],
  },
}

module.exports = withPWA(nextConfig)

