import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import CosmicBackground from "./components/CosmicBackground";
import WarmGlow from "./components/WarmGlow";
import InstallBanner from "./components/InstallBanner";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#080811",
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
  
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AstroVeda",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "AstroVeda",
    "apple-mobile-web-app-title": "AstroVeda",
    "msapplication-TileColor": "#080811",
    "msapplication-TileImage": "/icons/icon-192x192.png",
  },
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
      <body className={`${inter.className} ${cinzel.className} ${cormorant.className} ${plusJakarta.className}`}>
        <ThemeProvider>
          <ErrorBoundary>
            <LanguageProvider>
              <AuthProvider>
                <WalletProvider>
                  <CosmicBackground />
                  <WarmGlow />
                  <Navbar />
                  <main className="min-h-screen relative z-10">{children}</main>
                  <Footer />
                </WalletProvider>
              </AuthProvider>
            </LanguageProvider>
          </ErrorBoundary>
          <InstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}