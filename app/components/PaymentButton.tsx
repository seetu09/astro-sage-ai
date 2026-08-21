"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { Loader2, Lock, AlertCircle } from "lucide-react";

export interface PaymentSuccessDetails {
  orderId: string;
  paymentId: string;
}

interface PaymentButtonProps {
  amount: number;
  userEmail: string;
  userName?: string;
  paymentType?: string;
  buttonText?: string;
  onSuccess?: (details: PaymentSuccessDetails) => void;
  onFailure?: () => void;
  className?: string;
  createOrderEndpoint?: string;
  verifyEndpoint?: string;
  disabled?: boolean;
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
  createOrderEndpoint = "/api/payment/create-order",
  verifyEndpoint = "/api/payment/verify",
  disabled = false,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Razorpay script is available
  useEffect(() => {
    const checkScript = () => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        setScriptLoaded(true);
      }
    };
    checkScript();
    // Check again after a delay
    const timer = setTimeout(checkScript, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePayment = async () => {
    setError(null);
    
    if (!scriptLoaded) {
      setError("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    if (!userEmail) {
      setError("Please enter your email first.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order
      console.log('Creating order...');
      const orderResponse = await fetch(createOrderEndpoint, {
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
      console.log('Order response:', orderData);

      if (!orderResponse.ok) {
        throw new Error(orderData.error || `Failed to create order (Status: ${orderResponse.status})`);
      }

      if (!orderData.orderId) {
        throw new Error("Invalid order response from server");
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AstroVeda",
        description: "Detailed Kundli Report",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log('Payment handler response:', response);
          try {
            const verifyResponse = await fetch(verifyEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log('Verify response:', verifyData);

            if (verifyData.success) {
              setIsLoading(false);
              onSuccess?.({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              });
            } else {
              setError(verifyData.error || "Payment verification failed");
              setIsLoading(false);
              onFailure?.();
            }
          } catch (error: any) {
            console.error("Payment verification error:", error);
            setError("Payment verification failed: " + error.message);
            setIsLoading(false);
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
            console.log('Payment modal dismissed');
            setIsLoading(false);
          },
          escape: true,
          backdropclose: false,
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      
      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setError(response.error?.description || "Payment failed. Please try again.");
        setIsLoading(false);
        onFailure?.();
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setError(error.message || "Something went wrong. Please try again.");
      setIsLoading(false);
      onFailure?.();
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Razorpay script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Razorpay script');
          setError("Failed to load payment system. Please refresh the page.");
        }}
      />
      
      <div className="w-full">
        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          onClick={handlePayment}
          disabled={isLoading || disabled}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>{buttonText}</span>
            </>
          )}
        </button>
        
        {!scriptLoaded && !error && (
          <p className="mt-2 text-center text-xs text-slate-400 dark:text-[#6B7280]">
            Loading payment system...
          </p>
        )}
      </div>
    </>
  );
}
