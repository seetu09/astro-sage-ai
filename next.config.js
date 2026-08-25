/** @type {import('next').NextConfig} */
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

module.exports = nextConfig

