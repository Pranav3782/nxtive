// Implements the PaymentProvider interface for Razorpay.
// Swappable: replace this file (and register it) to switch payment providers.
import "server-only";

import crypto from "crypto";
import { getRazorpayInstance } from "./client";
import type {
  PaymentProvider,
  CreateOrderInput,
  VerifyPaymentInput,
  RefundInput,
} from "../provider.interface";
import type { RazorpayOrderResponse, RazorpayRefundResponse } from "@/types/payment";

export class RazorpayAdapter implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<RazorpayOrderResponse> {
    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create({
      amount: input.amount,
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes || {},
    });
    return order as unknown as RazorpayOrderResponse;
  }

  verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new Error("RAZORPAY_KEY_SECRET is required for signature verification");
    }

    const body = `${input.orderId}|${input.paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === input.signature;
    return Promise.resolve(isValid);
  }

  async initiateRefund(input: RefundInput): Promise<RazorpayRefundResponse> {
    const razorpay = getRazorpayInstance();
    const refundPayload: Record<string, unknown> = {};
    if (input.amount) refundPayload.amount = input.amount;
    if (input.notes) refundPayload.notes = input.notes;

    const refund = await razorpay.payments.refund(input.paymentId, refundPayload);
    return refund as unknown as RazorpayRefundResponse;
  }

  validateWebhookSignature(body: string, signature: string): boolean {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("RAZORPAY_WEBHOOK_SECRET is required for webhook verification");
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }
}

// Singleton instance
let adapter: RazorpayAdapter | null = null;
export function getRazorpayAdapter(): RazorpayAdapter {
  if (!adapter) adapter = new RazorpayAdapter();
  return adapter;
}
