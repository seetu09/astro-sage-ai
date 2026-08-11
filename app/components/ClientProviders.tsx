'use client';

import { LanguageProvider } from '../context/LanguageContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
}
