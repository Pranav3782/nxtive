// Shared TypeScript types for the "settings" domain.

export interface GeneralSettings {
  storeName: string;
  storeTagline: string;
  storeLogoUrl: string;
  supportEmail: string;
  supportPhone: string;
  storeAddress: string;
  currency: string;
  currencySymbol: string;
  taxRatePercent: number;
  taxIncludedInPrice: boolean;
}

export interface StoreSettings {
  lowStockThreshold: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  priorityShippingFee: number;
  codAvailable: boolean;
  returnWindowDays: number;
  autoApproveReviews: boolean;
  maxOrderQuantityPerItem: number;
}

export interface NotificationSettings {
  emailOnNewOrder: boolean;
  emailOnDelivered: boolean;
  smsOnShipping: boolean;
  alertOnLowStock: boolean;
  alertOnPaymentFailure: boolean;
  adminNotificationEmail: string;
  notifyOnPendingReview: boolean;
}

export interface AdminAppSettings {
  general: GeneralSettings;
  store: StoreSettings;
  notifications: NotificationSettings;
  updatedAt?: string;
  updatedBy?: string;
}
