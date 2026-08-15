"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Loader2, Lock } from "lucide-react";

interface PaymentButtonProps {
  amount: number;
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
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          userEmail,
          userName,
          paymentType,
        }),
      });

      const orderData = await orderResponse.json();

      // ✅ FIXED: Check for orderId instead of success
      if (!orderData.orderId) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AstroVeda",
        description: "Detailed Kundli Report",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
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
              setIsLoading(false);  // ✅ FIXED
              onSuccess?.();
            } else {
              setIsLoading(false);  // ✅ FIXED
              onFailure?.();
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setIsLoading(false);  // ✅ FIXED
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
        setIsLoading(false);
        onFailure?.();
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
      onFailure?.();
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
