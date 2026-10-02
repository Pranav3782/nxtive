// Payment provider contract. All providers (Razorpay, future gateways) implement this.

import type { RazorpayOrderInput, RazorpayOrderResponse, RazorpayPaymentVerification, RazorpayRefundResponse } from "@/types/payment";

export interface CreateOrderInput {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundInput {
  paymentId: string;
  amount?: number; // partial refund in paise
  notes?: Record<string, string>;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<RazorpayOrderResponse>;
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
  initiateRefund(input: RefundInput): Promise<RazorpayRefundResponse>;
  validateWebhookSignature(body: string, signature: string): boolean;
}
