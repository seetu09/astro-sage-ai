"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Loader2, Lock } from "lucide-react";

interface PaymentButtonProps {
  amount: number; // in paise (4900 = Rs. 49)
  userEmail: string;
  userName?: string;
  paymentType?: string;
  buttonText?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  className?: string;
}

export default function PaymentButton({
  amount,
  userEmail,
  userName = "User",
  paymentType = "kundli_report",
  buttonText = "Pay Rs. 49",
  onSuccess,
  onFailure,
  className = "",
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // Step 1: Create order on backend
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          userEmail,
          paymentType,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error("Failed to create order");
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AstroVeda",
        description: "Detailed Kundli Report",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onSuccess?.();
            } else {
              onFailure?.();
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            onFailure?.();
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        onFailure?.();
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      onFailure?.();
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className={`
          inline-flex items-center gap-2 px-6 py-3 
          bg-gradient-to-r from-amber-500 to-orange-500 
          text-white font-semibold rounded-xl
          hover:from-amber-400 hover:to-orange-400
          active:scale-95 transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg shadow-amber-500/25
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            {buttonText}
          </>
        )}
      </button>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </>
  );
}
