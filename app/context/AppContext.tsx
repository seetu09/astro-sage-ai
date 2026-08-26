'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { isLocale, LocaleCode } from '@/lib/astrologyDictionary';

export interface PaymentSuccessDetails {
  orderId?: string;
  paymentId?: string;
  /** Server-minted signed unlock token returned by `/api/payment/verify`. */
  unlockToken?: string;
}

interface AppContextType {
  /** Whether the user has unlocked the paid report (persisted across refreshes). */
  isPaid: boolean;
  /** Server-signed proof of payment required by paid routes (PDF download etc.). */
  unlockToken: string | null;
  /** Toggle isPaid = true after successful payment (Razorpay onSuccess or redirect callback). */
  markAsPaid: (details?: PaymentSuccessDetails) => void;
  /** Reset payment state (dev/testing or support override). */
  resetPayment: () => void;
  /** Currently selected UI language — delegates to LanguageContext (single source of truth). */
  selectedLanguage: LocaleCode;
  /** Change the app language; propagates instantly to every consumer without a page refresh. */
  setSelectedLanguage: (lang: LocaleCode) => void;
}

const defaultValue: AppContextType = {
  isPaid: false,
  unlockToken: null,
  markAsPaid: () => {},
  resetPayment: () => {},
  selectedLanguage: 'en',
  setSelectedLanguage: () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

const IS_PAID_STORAGE_KEY = 'astroveda-is-paid';
const UNLOCK_TOKEN_STORAGE_KEY = 'astroveda-unlock-token';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();

  // --- Restore persisted payment state (hydration-safe) ---------------------
  // SECURITY: localStorage is restored here, but it is NEVER written from URL
  // params. markAsPaid() (backed by a server-verified payment) is the ONLY
  // code path that can set isPaid=true — visiting ?payment=success or any
  // crafted query string cannot unlock the report.
  useEffect(() => {
    try {
      // Dev-mode guard: clear stale localStorage so it doesn't poison tests.
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem(IS_PAID_STORAGE_KEY);
        localStorage.removeItem(UNLOCK_TOKEN_STORAGE_KEY);
        setIsPaid(false);
        setUnlockToken(null);
        return;
      }
      if (localStorage.getItem(IS_PAID_STORAGE_KEY) === 'true') {
        setIsPaid(true);
      }
      const savedToken = localStorage.getItem(UNLOCK_TOKEN_STORAGE_KEY);
      if (savedToken) {
        setUnlockToken(savedToken);
      }
    } catch {
      // localStorage unavailable — stay locked
    }
  }, []);

  const markAsPaid = useCallback((details?: PaymentSuccessDetails) => {
    try {
      localStorage.setItem(IS_PAID_STORAGE_KEY, 'true');
      if (details?.unlockToken) {
        localStorage.setItem(UNLOCK_TOKEN_STORAGE_KEY, details.unlockToken);
      }
    } catch {
      // ignore storage failures — in-memory unlock still works this session
    }
    setIsPaid(true);
    if (details?.unlockToken) {
      setUnlockToken(details.unlockToken);
    }
  }, []);

  const resetPayment = useCallback(() => {
    try {
      localStorage.removeItem(IS_PAID_STORAGE_KEY);
      localStorage.removeItem(UNLOCK_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsPaid(false);
    setUnlockToken(null);
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
        isPaid,
        unlockToken,
        markAsPaid,
        resetPayment,
        selectedLanguage: isLocale(language) ? language : 'en',
        setSelectedLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}