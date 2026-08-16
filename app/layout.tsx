import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f23" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://astro-sage-ai.vercel.app"),
  title: {
    default: "AstroVeda - AI-Powered Vedic Astrology & Kundli Generator",
    template: "%s | AstroVeda",
  },
  description: "Generate your free Vedic Kundli, get daily horoscope predictions, Kundali matching for marriage, and AI-powered astrology guidance. Accurate birth chart analysis in Hindi & English.",
  keywords: ["kundli", "kundali", "horoscope", "vedic astrology", "birth chart", "kundali matching", "daily horoscope", "astroveda", "jatakam", "rashifal"],
  authors: [{ name: "AstroVeda" }],
  creator: "AstroVeda",
  publisher: "AstroVeda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://astro-sage-ai.vercel.app",
    siteName: "AstroVeda",
    title: "AstroVeda - AI-Powered Vedic Astrology",
    description: "Generate your free Vedic Kundli, daily horoscope & Kundali matching. AI astrology guidance in Hindi & English.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AstroVeda - AI Vedic Astrology Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AstroVeda - AI-Powered Vedic Astrology",
    description: "Free Kundli generator, daily horoscope & Kundali matching with AI guidance.",
    images: ["/og-image.jpg"],
    creator: "@astroveda",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "astrology",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AstroVeda",
  url: "https://astro-sage-ai.vercel.app",
  description: "AI-powered Vedic astrology platform for Kundli generation, horoscope predictions, and Kundali matching.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://astro-sage-ai.vercel.app/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="pt-14 sm:pt-16">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
