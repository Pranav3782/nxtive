// Shared TypeScript types for the "review" domain.

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  productSlug?: string;
  productTitle: string;
  productImage?: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  verifiedBuyer?: boolean;
  sizePurchased?: string;
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  pendingCount: number;
  breakdown: Record<number, number>; // star (1-5) -> count
}
