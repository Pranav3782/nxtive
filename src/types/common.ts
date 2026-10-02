// Shared cross-domain types.

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** Firestore-compatible timestamp */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: "percentage" | "fixed";
  value: number; // percentage (0-100) or fixed amount in INR
  minOrderValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number; // cap for percentage coupons
  usageLimit?: number;
  usedCount?: number;
  usageCount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCategories?: string[];
  createdAt?: string;
}
