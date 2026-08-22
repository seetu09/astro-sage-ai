'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { isLocale, LocaleCode } from '@/lib/astrologyDictionary';

export interface PaymentSuccessDetails {
  orderId?: string;
  paymentId?: string;
}

interface AppContextType {
  /** Whether the user has unlocked the paid report (persisted across refreshes). */
  isPaid: boolean;
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
  markAsPaid: () => {},
  resetPayment: () => {},
  selectedLanguage: 'en',
  setSelectedLanguage: () => {},
};

const AppContext = createContext<AppContextType>(defaultValue);

const IS_PAID_STORAGE_KEY = 'astroveda-is-paid';
const PAYMENT_FLAG_PARAM = 'payment';
const PAYMENT_ID_PARAM = 'razorpay_payment_id';

export function AppProvider({ children }: { children: ReactNode }) {
  const [isPaid, setIsPaid] = useState(false);
  const { language, setLanguage } = useLanguage();

  // --- Restore persisted payment state (hydration-safe) ---------------------
  useEffect(() => {
    try {
      if (localStorage.getItem(IS_PAID_STORAGE_KEY) === 'true') {
        setIsPaid(true);
      }
    } catch {
      // localStorage unavailable — stay locked
    }
  }, []);

  // --- Post-payment redirect/callback handler --------------------------------
  // Supports flows that land back on the page with ?payment=success&razorpay_payment_id=...
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const flag = params.get(PAYMENT_FLAG_PARAM);
    const paymentId = params.get(PAYMENT_ID_PARAM);

    if (flag === 'success' || paymentId) {
      try {
        localStorage.setItem(IS_PAID_STORAGE_KEY, 'true');
      } catch {
        // ignore storage failures
      }
      setIsPaid(true);

      // Clean the URL so refreshes/reloads don't re-trigger the handler.
      params.delete(PAYMENT_FLAG_PARAM);
      params.delete(PAYMENT_ID_PARAM);
      const remaining = params.toString();
      const cleanUrl =
        window.location.pathname + (remaining ? `?${remaining}` : '') + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const markAsPaid = useCallback((details?: PaymentSuccessDetails) => {
    try {
      localStorage.setItem(IS_PAID_STORAGE_KEY, 'true');
    } catch {
      // ignore storage failures — in-memory unlock still works this session
    }
    setIsPaid(true);
  }, []);

  const resetPayment = useCallback(() => {
    try {
      localStorage.removeItem(IS_PAID_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsPaid(false);
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