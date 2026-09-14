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
  // Keep pdfkit and @react-pdf/renderer out of the serverless bundle.
  // Vercel's bundler only copies .js files and skips non-JS assets, which
  // causes "Cannot find module '.../Helvetica.cjs'" errors at runtime.
  serverExternalPackages: ['pdfkit', '@react-pdf/renderer', '@react-pdf/pdfkit'],
  outputFileTracingIncludes: {
    '/api/kundali/pdf': [
      'node_modules/pdfkit/js/data/*.afm',
      'node_modules/pdfkit/js/standard-fonts/*.cjs',
      'node_modules/@react-pdf/pdfkit/js/data/*.afm',
      'node_modules/@react-pdf/pdfkit/js/standard-fonts/*.cjs',
      'node_modules/@react-pdf/renderer/node_modules/pdfkit/js/data/*.afm',
      'node_modules/@react-pdf/renderer/node_modules/pdfkit/js/standard-fonts/*.cjs'
    ]
  },
}

module.exports = withPWA(nextConfig)

