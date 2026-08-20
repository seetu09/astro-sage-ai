"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const FREE_MESSAGES_LIMIT = 3;
const PRICE_PER_QUESTION = 5;

interface WalletContextType {
  freeMessagesLeft: number;
  walletBalance: number;
  isTopUpOpen: boolean;
  consumeMessage: () => "free" | "wallet" | "blocked";
  addFunds: (amount: number) => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

const WalletContext = createContext<WalletContextType>({
  freeMessagesLeft: FREE_MESSAGES_LIMIT,
  walletBalance: 0,
  isTopUpOpen: false,
  consumeMessage: () => "free",
  addFunds: () => {},
  openTopUp: () => {},
  closeTopUp: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(FREE_MESSAGES_LIMIT);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Hydrate state from localStorage on mount
  useEffect(() => {
    try {
      const storedFree = localStorage.getItem("astroveda-free-messages");
      if (storedFree !== null) {
        setFreeMessagesLeft(Math.min(FREE_MESSAGES_LIMIT, Math.max(0, parseInt(storedFree, 10) || 0)));
      }
      const storedWallet = localStorage.getItem("astroveda-wallet-balance");
      if (storedWallet !== null) {
        setWalletBalance(Math.max(0, parseFloat(storedWallet) || 0));
      }
    } catch {
      // localStorage unavailable — keep defaults
    }
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("astroveda-free-messages", freeMessagesLeft.toString());
      localStorage.setItem("astroveda-wallet-balance", walletBalance.toFixed(2));
    } catch {
      // localStorage unavailable — ignore
    }
  }, [freeMessagesLeft, walletBalance]);

  const consumeMessage = useCallback((): "free" | "wallet" | "blocked" => {
    if (freeMessagesLeft > 0) {
      setFreeMessagesLeft((prev) => prev - 1);
      return "free";
    }
    if (walletBalance >= PRICE_PER_QUESTION) {
      setWalletBalance((prev) => Math.round((prev - PRICE_PER_QUESTION) * 100) / 100);
      return "wallet";
    }
    return "blocked";
  }, [freeMessagesLeft, walletBalance]);

  const addFunds = useCallback((amount: number) => {
    setWalletBalance((prev) => Math.round((prev + amount) * 100) / 100);
  }, []);

  const openTopUp = useCallback(() => setIsTopUpOpen(true), []);
  const closeTopUp = useCallback(() => setIsTopUpOpen(false), []);

  return (
    <WalletContext.Provider
      value={{
        freeMessagesLeft,
        walletBalance,
        isTopUpOpen,
        consumeMessage,
        addFunds,
        openTopUp,
        closeTopUp,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}