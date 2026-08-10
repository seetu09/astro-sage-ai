import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AstroSage AI - Vedic Astrology & AI Guidance",
  description: "Discover your cosmic blueprint with AI-powered Vedic astrology. Birth charts, daily horoscopes, match making, and personalized readings.",
  keywords: "vedic astrology, birth chart, kundali, horoscope, nakshatra, moonshot ai, astrology app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
