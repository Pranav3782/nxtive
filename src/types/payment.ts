// Shared TypeScript types for the "payment" domain.

export interface RazorpayOrderInput {
  amount: number; // in paise (INR * 100)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayRefundInput {
  paymentId: string;
  amount?: number; // partial refund in paise; omit for full
  notes?: Record<string, string>;
}

export interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // in paise
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  method?: string; // upi, card, netbanking, wallet, etc.
  refundId?: string;
  refundAmount?: number;
  failureReason?: string;
  webhookVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}
