"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { WalletTransaction } from "@/types/user";

const FREE_MESSAGES_LIMIT = 3;
const PRICE_PER_QUESTION = 5;

interface WalletContextType {
  freeMessagesLeft: number;
  walletBalance: number;
  isTopUpOpen: boolean;
  pendingPrompt: string | null;
  transactions: WalletTransaction[];
  consumeMessage: () => "free" | "wallet" | "blocked";
  addFunds: (amount: number, payment?: { orderId: string; paymentId: string }) => void;
  setPendingPrompt: (prompt: string) => void;
  clearPendingPrompt: () => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

const WalletContext = createContext<WalletContextType>({
  freeMessagesLeft: FREE_MESSAGES_LIMIT,
  walletBalance: 0,
  isTopUpOpen: false,
  pendingPrompt: null,
  transactions: [],
  consumeMessage: () => "free",
  addFunds: () => {},
  setPendingPrompt: () => {},
  clearPendingPrompt: () => {},
  openTopUp: () => {},
  closeTopUp: () => {},
});

export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(FREE_MESSAGES_LIMIT);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [pendingPrompt, setPendingPromptState] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsHydrated, setTransactionsHydrated] = useState(false);

  const transactionStorageKey = user ? `astroveda-wallet-transactions-${user.id}` : null;

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

  useEffect(() => {
    if (!transactionStorageKey) {
      setTransactions([]);
      setTransactionsHydrated(false);
      return;
    }

    try {
      const stored = localStorage.getItem(transactionStorageKey);
      setTransactions(stored ? JSON.parse(stored) : []);
    } catch {
      setTransactions([]);
    } finally {
      setTransactionsHydrated(true);
    }
  }, [transactionStorageKey]);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("astroveda-free-messages", freeMessagesLeft.toString());
      localStorage.setItem("astroveda-wallet-balance", walletBalance.toFixed(2));
    } catch {
      // localStorage unavailable — ignore
    }
  }, [freeMessagesLeft, walletBalance]);

  useEffect(() => {
    if (!transactionStorageKey || !transactionsHydrated) return;

    try {
      localStorage.setItem(transactionStorageKey, JSON.stringify(transactions));
    } catch {
      // localStorage unavailable - keep the in-memory transaction list.
    }
  }, [transactionStorageKey, transactions, transactionsHydrated]);

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

  const addFunds = useCallback((amount: number, payment?: { orderId: string; paymentId: string }) => {
    setWalletBalance((prev) => Math.round((prev + amount) * 100) / 100);
    if (user) {
      const createdAt = new Date().toISOString();
      setTransactions((current) => [
        {
          id: payment?.paymentId || `topup-${Date.now()}`,
          userId: user.id,
          type: "wallet_topup",
          amount,
          currency: "INR",
          status: "completed",
          createdAt,
          orderId: payment?.orderId,
          paymentId: payment?.paymentId,
          description: "Wallet top-up",
        },
        ...current,
      ]);
    }
  }, [user]);

  const setPendingPrompt = useCallback((prompt: string) => {
    setPendingPromptState(prompt);
  }, []);

  const clearPendingPrompt = useCallback(() => {
    setPendingPromptState(null);
  }, []);

  const openTopUp = useCallback(() => setIsTopUpOpen(true), []);
  const closeTopUp = useCallback(() => setIsTopUpOpen(false), []);

  return (
    <WalletContext.Provider
      value={{
        freeMessagesLeft,
        walletBalance,
        isTopUpOpen,
        pendingPrompt,
        transactions,
        consumeMessage,
        addFunds,
        setPendingPrompt,
        clearPendingPrompt,
        openTopUp,
        closeTopUp,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}