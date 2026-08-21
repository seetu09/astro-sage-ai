"use client";

import React, { useState } from "react";
import { X, Wallet, AlertCircle } from "lucide-react";
import { useWallet } from "../context/WalletContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import PaymentButton from "./PaymentButton";
import type { PaymentSuccessDetails } from "./PaymentButton";

const MIN_CUSTOM_AMOUNT = 20;

const PACKS = [
  { amount: 50, questions: 10 },
  { amount: 100, questions: 20, popular: true },
  { amount: 200, questions: 40 },
];

export default function TopUpModal() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { walletBalance, isTopUpOpen, closeTopUp, addFunds } = useWallet();

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [useCustom, setUseCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [customError, setCustomError] = useState("");

  if (!isTopUpOpen) return null;

  const displayAmount = useCustom
    ? Number(customAmount) || 0
    : selectedAmount;

  const canProceed = useCustom
    ? Number(customAmount) >= MIN_CUSTOM_AMOUNT && !Number.isNaN(Number(customAmount))
    : true;

  const handleSelectPack = (amount: number) => {
    setSelectedAmount(amount);
    setUseCustom(false);
    setCustomAmount("");
    setCustomError("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setUseCustom(true);

    if (val === "") {
      setCustomError("");
    } else {
      const num = Number(val);
      if (!Number.isFinite(num) || num < MIN_CUSTOM_AMOUNT) {
        setCustomError(t.chat.topUpMinAmount);
      } else {
        setCustomError("");
      }
    }
  };

  const handleSuccess = (payment: PaymentSuccessDetails) => {
    addFunds(displayAmount, payment);
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
          {/* Wallet balance */}
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] p-4">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t.chat.walletBalanceLabel}</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">₹{walletBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Pricing note */}
          <div className="mb-5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <p>{t.chat.topUpNote}</p>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600 dark:text-amber-400 text-sm text-center">
              {t.chat.signInRequired}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">{t.chat.topUpQuickText}</p>

              {/* Quick-select packs */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {PACKS.map((pack) => (
                  <button
                    key={pack.amount}
                    onClick={() => handleSelectPack(pack.amount)}
                    className={`relative py-3 rounded-xl border text-sm font-semibold transition-all ${
                      !useCustom && selectedAmount === pack.amount
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-transparent shadow-lg shadow-amber-500/25"
                        : "bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                    }`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-[9px] font-bold text-white px-2 py-0.5 rounded-full">
                        {t.chat.topUpPopular}
                      </span>
                    )}
                    <div>₹{pack.amount}</div>
                    <div className="text-xs font-normal opacity-90 mt-0.5">
                      {t.chat.topUpQuestions.replace("{count}", pack.questions.toString())}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  {t.chat.topUpCustomLabel}
                </label>
                <input
                  type="number"
                  min={MIN_CUSTOM_AMOUNT}
                  value={customAmount}
                  onChange={handleCustomChange}
                  placeholder={t.chat.topUpCustomPlaceholder}
                  className="w-full astro-input py-2.5 px-3 text-sm"
                />
                {customError && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle className="h-3 w-3" />
                    {customError}
                  </p>
                )}
              </div>

              {/* Proceed to Pay */}
              <PaymentButton
                amount={displayAmount}
                userEmail={user?.email || ""}
                userName={user?.name || "User"}
                paymentType="wallet_topup"
                buttonText={`${t.chat.topUpProceed} · ₹${displayAmount}`}
                onSuccess={handleSuccess}
                className="!bg-gradient-to-r from-amber-500 to-orange-600"
                disabled={!canProceed}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
