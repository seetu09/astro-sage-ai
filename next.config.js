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
    // Next 14.2 spells these under `experimental` — the Next 15 top-level
    // names (`serverExternalPackages` / `outputFileTracingIncludes`) are not
    // in next/dist/server/config-schema.js at all and were being silently
    // ignored, which risked "Cannot find module '.../Helvetica.cjs'" at
    // runtime on Vercel (see docs/status-reports/…2026-09-26.md Risk 6).
    //
    // Keep pdfkit and @react-pdf/renderer out of the serverless bundle.
    // Vercel's bundler only copies .js files and skips non-JS assets, which
    // causes "Cannot find module '.../Helvetica.cjs'" errors at runtime.
    serverComponentsExternalPackages: ['pdfkit', '@react-pdf/renderer', '@react-pdf/pdfkit'],
    outputFileTracingIncludes: {
      '/api/kundali/pdf': [
        'node_modules/pdfkit/js/data/*.afm',
        'node_modules/pdfkit/js/standard-fonts/*.cjs',
        'node_modules/@react-pdf/pdfkit/js/data/*.afm',
        'node_modules/@react-pdf/pdfkit/js/standard-fonts/*.cjs',
        'node_modules/@react-pdf/renderer/node_modules/pdfkit/js/data/*.afm',
        'node_modules/@react-pdf/renderer/node_modules/pdfkit/js/standard-fonts/*.cjs',
      ],
    },
  },
headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: 'default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://checkout.razorpay.com https://*.razorpay.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com data:; img-src \'self\' data: blob: https://*.supabase.co; connect-src \'self\' https://*.supabase.co https://*.razorpay.com https://api.razorpay.com https://www.googletagmanager.com wss://*.supabase.co; frame-src https://checkout.razorpay.com https://api.razorpay.com; object-src \'none\'; base-uri \'self\'; form-action \'self\'; frame-ancestors \'none\'',
          },
        ],
      },
    ];
  },
}

module.exports = withPWA(nextConfig)

