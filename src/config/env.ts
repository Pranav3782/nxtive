// Typed, validated access to environment variables. Import server-only vars only in server code.

/** Client-safe env (NEXT_PUBLIC_*) */
export const clientEnv = {
  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
} as const;

/**
 * Server-only env — only call from server components, route handlers, or server actions.
 * Returns validated server secrets; throws if any required var is missing.
 */
export function getServerEnv() {
  const env = {
    FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
    FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY || "",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || "",
    DELIVERY_PROVIDER_API_KEY: process.env.DELIVERY_PROVIDER_API_KEY || "",
    DELIVERY_PROVIDER_BASE_URL: process.env.DELIVERY_PROVIDER_BASE_URL || "",
    DELIVERY_WEBHOOK_SECRET: process.env.DELIVERY_WEBHOOK_SECRET || "",
  } as const;

  return env;
}
