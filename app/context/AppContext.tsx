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

const UNLOCK_TOKEN_STORAGE_KEY = 'astroveda-unlock-token';

// SECURITY: the paywall flag (`isPaid`) derives from a SERVER-MINTED unlock token —
// never from a client-writable flag. A crafted sessionStorage/localStorage value must
// not unlock the paid report. Only `/api/payment/verify` (which mints a token after
// Razorpay captures a real payment) can produce a valid token, so the report stays
// locked unless a genuine payment happened on the server.

export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);
  const { language, setLanguage } = useLanguage();

  // --- Restore persisted payment state (hydration-safe) ---------------------
  // SECURITY: isPaid only ever becomes true when a SERVER-MINTED unlock token is
  // present (restored here or passed to markAsPaid() by the post-payment handler).
  // A client-writable sessionStorage/localStorage flag can never unlock the report —
  // only `/api/payment/verify`, which revalidates the order against Razorpay and mints
  // a token, can. Visiting a crafted query string does nothing here.
  useEffect(() => {
    try {
      // Dev-mode guard: clear stale localStorage so it doesn't poison tests.
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem(UNLOCK_TOKEN_STORAGE_KEY);
        setIsPaid(false);
        setUnlockToken(null);
        return;
      }
      // A client-writable sessionStorage/localStorage flag cannot unlock the paid
      // report — only a server-minted unlock token from `/api/payment/verify` can.
      const savedToken = localStorage.getItem(UNLOCK_TOKEN_STORAGE_KEY);
      if (savedToken) {
        setIsPaid(true);
        setUnlockToken(savedToken);
      } else {
        setIsPaid(false);
      }
    } catch {
      // localStorage unavailable — stay locked
    }
  }, []);

  const markAsPaid = useCallback((details?: PaymentSuccessDetails) => {
    // Require a server-minted unlock token (only `/api/payment/verify` produces
    // one after Razorpay confirms the order is paid). Without it, the paywall stays
    // locked — a caller-only flag can no longer flip isPaid.;
    if (!details?.unlockToken) {
      // No server proof of payment — refuse to unlock. This also guards against
      // code paths that previously called markAsPaid() with no token.;
      return;
    }
    try {
      localStorage.setItem(UNLOCK_TOKEN_STORAGE_KEY, details.unlockToken);
    } catch {
      // ignore storage failures — in-memory unlock still works this session
    }
    setIsPaid(true);
    setUnlockToken(details.unlockToken);
  }, []);

  const resetPayment = useCallback(() => {
    try {
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