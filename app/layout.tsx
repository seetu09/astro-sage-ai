import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import {
  Inter,
  Cinzel,
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  Noto_Sans,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import CosmicBackground from "./components/CosmicBackground";
import WarmGlow from "./components/WarmGlow";
import InstallBanner from "./components/InstallBanner";
import { ToastProvider } from "./components/ToastProvider";
import TopUpModal from "./components/TopUpModal";
import HtmlLangSync from "./components/HtmlLangSync";
import { LANGUAGE_COOKIE_KEY, isLanguage, type Language } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
// Devanagari font for Hindi/Indic text — used by the app UI and the branded PDF template.
// Ensures conjuncts (क्ष, त्र, ज्ञ), matras and mantras render without glyph corruption.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});
// Latin (Noto Sans) font — pairs with the Devanagari stack for a seamless
// English + Hindi multilingual body typeface. Exposed as a CSS variable so the
// report print layer can reference the same font family.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4F46E5",
};

export function generateMetadata({ params }: { params: { lang?: string } }): Metadata {
  const lang = resolveLayoutLang(params?.lang);
  const isHindi = lang === "hi";

  const title = isHindi
    ? "AstroVeda - AI-संचालित वैदिक ज्योतिष और कुंडली जनरेटर"
    : "AstroVeda - AI-Powered Vedic Astrology & Kundli Generator";
  const description = isHindi
    ? "अपनी मुफ्त वैदिक कुंडली बनाएं, दैनिक राशिफल और कुंडली मिलान प्राप्त करें। सटीक जन्म कुंडली विश्लेषण हिंदी और अंग्रेजी में।"
    : "Generate your free Vedic Kundli, get daily horoscope predictions, Kundali matching for marriage, and AI-powered astrology guidance. Accurate birth chart analysis in Hindi & English.";

  return {
    metadataBase: new URL("https://astro-sage-ai.vercel.app"),
    title: {
      default: title,
      template: "%s | AstroVeda",
    },
    description,
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
      languages: {
        en: "/?hl=en",
        hi: "/?hl=hi",
      },
    },
    openGraph: {
      type: "website",
      locale: isHindi ? "hi_IN" : "en_IN",
      url: "https://astro-sage-ai.vercel.app",
      siteName: "AstroVeda",
      title: isHindi ? "AstroVeda - AI-संचालित वैदिक ज्योतिष" : "AstroVeda - AI-Powered Vedic Astrology",
      description,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "AstroVeda - AI Vedic Astrology Platform",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isHindi ? "AstroVeda - AI वैदिक ज्योतिष" : "AstroVeda - AI-Powered Vedic Astrology",
      description,
      images: ["/opengraph-image"],
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
      title: "AstroSage",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192" },
        { url: "/icons/icon-512x512.png", sizes: "512x512" },
      ],
      apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }],
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "application-name": "AstroSage",
      "apple-mobile-web-app-title": "AstroSage",
      "msapplication-TileColor": "#4F46E5",
      "msapplication-TileImage": "/icons/icon-192x192.png",
    },
  };
}

/**
 * Resolve the active language for SSR/metadata. Priority: explicit `params.lang`
 * (a future `/[lang]` segment), then the persisted language cookie, then "en".
 */
function resolveLayoutLang(paramLang?: string): Language {
  if (paramLang && isLanguage(paramLang)) return paramLang;
  try {
    const stored = cookies().get(LANGUAGE_COOKIE_KEY)?.value;
    if (stored && isLanguage(stored)) return stored;
  } catch {
    // cookies() is unavailable in edge/non-SSR runtimes — fall back to default.
  }
  return "en";
}

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
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: { lang?: string };
}>) {
  const lang = resolveLayoutLang(params?.lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${inter.className} ${cinzel.className} ${cormorant.className} ${plusJakarta.className} ${notoDevanagari.variable} ${notoSans.variable} font-sans`}>
        <HtmlLangSync lang={lang} />
        {/* Pre-launch analytics placeholder — activates only when NEXT_PUBLIC_GA_ID is set.
            Swap for Plausible/PostHog by replacing this block; funnel events use lib/analytics.ts trackEvent(). */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
        <ThemeProvider>
          <ErrorBoundary>
            <ToastProvider>
            <LanguageProvider>
              <AppProvider>
                <AuthProvider>
                <WalletProvider>
                  <CosmicBackground />
                  <WarmGlow />
                  <Navbar />
                  <main className="min-h-screen relative z-10">{children}</main>
                  <Footer />
                  <TopUpModal />
                </WalletProvider>
                </AuthProvider>
              </AppProvider>
            </LanguageProvider>
            </ToastProvider>
          </ErrorBoundary>
          <InstallBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}