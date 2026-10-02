// SERVER-ONLY Razorpay SDK instance. Reads RAZORPAY_KEY_SECRET from env.
import "server-only";

import Razorpay from "razorpay";

type RazorpayClient = InstanceType<typeof Razorpay>;
let instance: RazorpayClient | null = null;

export function getRazorpayInstance(): RazorpayClient {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "[Razorpay] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required."
    );
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}
