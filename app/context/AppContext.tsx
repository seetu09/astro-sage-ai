'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { isLocale, LocaleCode } from '@/lib/astrologyDictionary';

interface AppContextType {
  /** Reset payment state (dev/testing or support override). */
  resetPayment: () => void;
  /** Currently selected UI language — delegates to LanguageContext (single source of truth). */
  selectedLanguage: LocaleCode;
  /** Change the app language; propagates instantly to every consumer without a page refresh. */
  setSelectedLanguage: (lang: LocaleCode) => void;
  /** Full API response of the most recently generated kundli (chartData, calculations, pillars…). */
  kundliData: any | null;
  /** Store the full API response so the PDF route never needs a second fetch. */
  setKundliData: (data: any | null) => void;
}

const defaultValue: AppContextType = {
  resetPayment: () => {},
  selectedLanguage: 'en',
  setSelectedLanguage: () => {},
  kundliData: null,
  setKundliData: () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

export function AppProvider({ children }: { children: ReactNode }) {
  const [kundliData, setKundliData] = useState<any | null>(null);
  const { language, setLanguage } = useLanguage();

  const resetPayment = useCallback(() => {
    // Reset clears local kundli data so the user starts fresh.
    // Server-side ownership is now the single source of truth for paywall state.
    setKundliData(null);
  }, []);

  const setSelectedLanguage = useCallback(
    (lang: LocaleCode) => {
      setLanguage(lang); // persists via LanguageContext → instant global re-render
    },
    [setLanguage]
  );

  return (
    <AppContext.Provider
      value={{
        resetPayment,
        selectedLanguage: isLocale(language) ? language : 'en',
        setSelectedLanguage,
        kundliData,
        setKundliData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
