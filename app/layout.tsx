import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarBackground from './components/StarBackground';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'AstroVeda - AI-Powered Vedic Astrology',
  description: 'Discover your cosmic path with AI-powered Vedic astrology readings, daily horoscopes, and personalized spiritual guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <StarBackground />
              <Navbar />
              {children}
              <Footer />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
