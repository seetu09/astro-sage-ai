"use client";

import React, { useState } from "react";
import { X, Wallet } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import PaymentButton from "./PaymentButton";

const TOP_UP_AMOUNTS = [50, 100, 200];

export default function TopUpModal() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { walletBalance, isTopUpOpen, closeTopUp, addFunds } = useWallet();
  const [selectedAmount, setSelectedAmount] = useState(TOP_UP_AMOUNTS[0]);

  if (!isTopUpOpen) return null;

  const handleSuccess = () => {
    addFunds(selectedAmount);
    closeTopUp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeTopUp} />
      <div className="relative w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t.chat.topUpTitle}</h2>
          <button onClick={closeTopUp} className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] p-4">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t.chat.walletBalance.replace("{amount}", walletBalance.toFixed(2))}</p>
              <p className="text-sm text-[var(--text-secondary)]">{t.chat.topUpSubtitle}</p>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400 text-sm text-center">
              {t.chat.signInRequired}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">{t.chat.topUpQuickText}</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {TOP_UP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedAmount === amount
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/25"
                        : "bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>

              <PaymentButton
                amount={selectedAmount}
                userEmail={user?.email || ""}
                userName={user?.name || "User"}
                paymentType="wallet_topup"
                buttonText={`${t.chat.addMoney} · ₹${selectedAmount}`}
                onSuccess={handleSuccess}
                className="!bg-gradient-to-r from-amber-500 to-orange-600"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}