// Non-secret app configuration (site name, currency, pagination defaults).

export const SITE_CONFIG = {
  name: "NXTIVE",
  tagline: "Dress Up Your Look",
  currency: "INR",
  currencySymbol: "₹",
  locale: "en-IN",
  defaultPageSize: 20,
  maxCartQuantity: 10,
  freeShippingThreshold: 999, // in INR
  standardShippingFee: 99,
  priorityShippingFee: 150,
  lowStockThreshold: 5,
  supportEmail: "support@nxtive.com",
  gstRate: 0.18, // 18% GST for clothing in India
} as const;

export const ADMIN_CONFIG = {
  defaultPageSize: 25,
  dashboardRefreshInterval: 30_000, // 30 seconds
  maxImageUploadSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;
