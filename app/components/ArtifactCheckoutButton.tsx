"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import PaymentButton from "@/app/components/PaymentButton";
import { useAuth } from "@/app/context/AuthContext";
import { useTranslation } from "@/app/lib/i18n/useTranslation";
import { trackEvent } from "@/lib/analytics";

interface ArtifactCheckoutButtonProps {
  artifactId: string;
  /** Localized name — shown as the Razorpay checkout description. */
  artifactName: string;
  /** Server-rendered catalog price (INR). The server re-validates it anyway. */
  priceInr: number;
  currency: string;
  className?: string;
}

/**
 * Store checkout trigger (Task 2.1).
 *
 * - Signed-in buyer → their account email keys the ownership record.
 * - Anonymous buyer → an email field appears first, because ownership of a
 *   physical item must be recoverable (the server stores whatever email is
 *   passed; PaymentButton blocks submission when it is empty).
 * - On success the button is replaced by a receipt panel — the server has
 *   already recorded ownership in `purchased_artifacts` (verify route).
 *
 * The buy button itself lives here (client) while the product page stays a
 * Server Component; PaymentButton handles Razorpay script loading, order
 * creation and verification.
 */
export default function ArtifactCheckoutButton({
  artifactId,
  artifactName,
  priceInr,
  currency,
  className = "",
}: ArtifactCheckoutButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<{ orderId: string; paymentId: string } | null>(null);
  const [guestEmail, setGuestEmail] = useState("");

  if (receipt) {
    return (
      <div className={`astro-card text-center py-6 ${className}`} role="status">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" aria-hidden="true" />
        <p className="font-semibold text-[var(--text-primary)] mb-1">
          {t("store.checkout.successTitle")}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {t("store.checkout.successBody")}
        </p>
        <p className="text-xs text-[var(--text-muted)] break-all">
          {artifactName} · {currency} {priceInr} · {receipt.paymentId}
        </p>
      </div>
    );
  }

  const accountEmail = user?.email ?? "";

  return (
    <div className={className}>
      {!accountEmail && (
        <div className="mb-3">
          <label
            htmlFor="artifact-checkout-email"
            className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
          >
            {t("store.checkout.emailLabel")}
          </label>
          <input
            id="artifact-checkout-email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder={t("store.checkout.emailPlaceholder")}
            className="w-full astro-input"
            autoComplete="email"
          />
        </div>
      )}

      <PaymentButton
        amount={priceInr}
        userEmail={accountEmail || guestEmail.trim()}
        userName={user?.name || "Guest"}
        paymentType="artifact_purchase"
        buttonText={t("store.detail.buyNow")}
        description={artifactName}
        extraBody={{ artifactId }}
        onSuccess={(details) => {
          trackEvent("artifact_purchased", {
            artifact_id: artifactId,
            order_id: details.orderId,
          });
          setReceipt({ orderId: details.orderId, paymentId: details.paymentId });
        }}
      />
    </div>
  );
}
