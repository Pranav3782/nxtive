// Client-side hook for Razorpay Checkout integration.
// Manages: create order → open Razorpay modal → verify payment → return result.

"use client";

import { useState, useCallback } from "react";

// Razorpay Checkout.js global type declaration
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selectedSize: string;
  selectedColor?: string;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface RazorpayCheckoutInput {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  couponCode?: string;
  userId: string;
}

export interface RazorpayCheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

export function useRazorpayCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = useCallback(
    async (input: RazorpayCheckoutInput): Promise<RazorpayCheckoutResult> => {
      setLoading(true);
      setError(null);

      try {
        // 1. Generate idempotency key
        const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

        // 2. Create Razorpay order via our API
        const createRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: input.items.map((item) => ({
              productId: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              image: item.image,
            })),
            shippingAddress: input.shippingAddress,
            deliveryMethod: input.deliveryMethod,
            couponCode: input.couponCode,
            userId: input.userId,
            idempotencyKey,
          }),
        });

        const createData = await createRes.json();

        if (!createData.success) {
          throw new Error(createData.error || "Failed to create payment order");
        }

        const { razorpayOrderId, amount, currency, orderNumber, keyId } = createData;

        // 3. Get client key — prefer API response, then env, then fallback
        const razorpayKeyId =
          keyId ||
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
          "";

        if (!razorpayKeyId) {
          throw new Error("Razorpay key is not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID.");
        }

        // 4. Wait for Razorpay Checkout.js to be available
        if (typeof window === "undefined" || !window.Razorpay) {
          throw new Error("Razorpay checkout SDK not loaded. Please refresh and try again.");
        }

        // 5. Open Razorpay modal and wait for user action
        return new Promise<RazorpayCheckoutResult>((resolve) => {
          const options: RazorpayOptions = {
            key: razorpayKeyId,
            amount,
            currency: currency || "INR",
            name: "NXTIVE",
            description: `Order ${orderNumber}`,
            order_id: razorpayOrderId,
            prefill: {
              name: input.shippingAddress.fullName,
              email: input.shippingAddress.email,
              contact: input.shippingAddress.phone,
            },
            notes: {
              orderNumber,
              userId: input.userId,
            },
            theme: {
              color: "#111110",
            },
            handler: async (response: RazorpayPaymentResponse) => {
              // 6. Verify payment signature on server
              try {
                const verifyRes = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });

                const verifyData = await verifyRes.json();

                if (verifyData.success) {
                  setLoading(false);
                  resolve({
                    success: true,
                    orderId: verifyData.orderId,
                    orderNumber: verifyData.orderNumber,
                  });
                } else {
                  setError(verifyData.error || "Payment verification failed");
                  setLoading(false);
                  resolve({
                    success: false,
                    error: verifyData.error || "Payment verification failed",
                  });
                }
              } catch (verifyErr: any) {
                setError(verifyErr.message || "Verification request failed");
                setLoading(false);
                resolve({
                  success: false,
                  error: verifyErr.message || "Verification request failed",
                });
              }
            },
            modal: {
              ondismiss: () => {
                setError("Payment was cancelled");
                setLoading(false);
                resolve({
                  success: false,
                  error: "Payment was cancelled by user",
                });
              },
              escape: true,
              confirm_close: true,
            },
          };

          const rzp = new window.Razorpay(options);

          rzp.on("payment.failed", (response: any) => {
            const errorMsg =
              response?.error?.description ||
              response?.error?.reason ||
              "Payment failed. Please try again.";
            setError(errorMsg);
            setLoading(false);
            resolve({ success: false, error: errorMsg });
          });

          rzp.open();
        });
      } catch (err: any) {
        const errorMsg = err?.message || "Something went wrong with the payment";
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  return { initiatePayment, loading, error, clearError: () => setError(null) };
}
