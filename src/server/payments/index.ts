// Payment server — exposes the active PaymentProvider instance.
import "server-only";

export { getRazorpayAdapter } from "./razorpay/adapter";
export type { PaymentProvider, CreateOrderInput, VerifyPaymentInput, RefundInput } from "./provider.interface";
