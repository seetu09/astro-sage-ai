"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import type { WalletTransaction } from "@/types/user";

const FREE_MESSAGES_LIMIT = 3;
const PRICE_PER_QUESTION = 5;

interface WalletContextType {
  freeMessagesLeft: number;
  walletBalance: number;
  transactions: WalletTransaction[];
  isLoading: boolean;
  isTopUpOpen: boolean;
  pendingPrompt: string | null;
  /** Optimistic local check for UX — /api/chat performs the authoritative debit. */
  consumeMessage: () => "free" | "wallet" | "blocked";
  /** Credits via the server (single source of truth) then refreshes from it. */
  addFunds: (amount: number, payment?: { orderId: string; paymentId: string }) => Promise<void>;
  /** Re-fetch the authoritative wallet state from /api/wallet. */
  refresh: () => Promise<void>;
  setPendingPrompt: (prompt: string) => void;
  clearPendingPrompt: () => void;
  openTopUp: () => void;
  closeTopUp: () => void;
}

const WalletContext = createContext<WalletContextType>({
  freeMessagesLeft: FREE_MESSAGES_LIMIT,
  walletBalance: 0,
  transactions: [],
  isLoading: false,
  isTopUpOpen: false,
  pendingPrompt: null,
  consumeMessage: () => "free",
  addFunds: async () => {},
  refresh: async () => {},
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
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [pendingPrompt, setPendingPromptState] = useState<string | null>(null);

  /**
   * Pull the authoritative wallet state from the server. The Supabase access
   * token from the client SDK authenticates the request; balances can no
   * longer be forged via localStorage.
   */
  const refresh = useCallback(async () => {
    if (!user) {
      setFreeMessagesLeft(FREE_MESSAGES_LIMIT);
      setWalletBalance(0);
      setTransactions([]);
      return;
    }
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return;

      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setWalletBalance(Math.max(0, Number(data.balance) || 0));
      setFreeMessagesLeft(Math.max(0, Number(data.freeLeft) || 0));
      setTransactions(
        (Array.isArray(data.transactions) ? data.transactions : []).map(
          (tx: Record<string, unknown>) => ({
            id: String(tx.id),
            userId: user.id,
            type: String(tx.type),
            amount: Number(tx.amount) || 0,
            currency: String(tx.currency || "INR"),
            status: String(tx.status || "completed"),
            createdAt: String(tx.createdAt),
            orderId: (tx.orderId as string) ?? undefined,
            paymentId: (tx.paymentId as string) ?? undefined,
            description: (tx.description as string) ?? undefined,
          })
        )
      );
    } catch {
      // Network/config failure — keep the last known state; the server
      // remains the enforcement point regardless of what the UI shows.
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load server state on sign-in / user change.
  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Optimistic local check so the UI can open the TopUp modal *before* an
   * avoidable paid request. The server re-checks and debits atomically in
   * /api/chat — a stale client can never grant a free question.
   */
  const consumeMessage = useCallback((): "free" | "wallet" | "blocked" => {
    if (freeMessagesLeft > 0) {
      setFreeMessagesLeft((prev) => Math.max(0, prev - 1));
      return "free";
    }
    if (walletBalance >= PRICE_PER_QUESTION) {
      setWalletBalance((prev) => Math.round((prev - PRICE_PER_QUESTION) * 100) / 100);
      return "wallet";
    }
    return "blocked";
  }, [freeMessagesLeft, walletBalance]);

  /**
   * Called after Razorpay verification succeeds. The server already credited
   * the wallet inside /api/payment/verify (idempotent on payment_id), so this
   * simply re-syncs the UI from the source of truth.
   */
  const addFunds = useCallback(
    async (_amount: number, _payment?: { orderId: string; paymentId: string }) => {
      await refresh();
    },
    [refresh]
  );

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
        transactions,
        isLoading,
        isTopUpOpen,
        pendingPrompt,
        consumeMessage,
        addFunds,
        refresh,
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
