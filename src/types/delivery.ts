// Shared TypeScript types for the "delivery" domain.

export type ShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "failed_delivery"
  | "returned_to_origin";

export interface TrackingEvent {
  status: ShipmentStatus;
  location?: string;
  timestamp: string;
  description: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  destinationCity?: string;
  provider: string; // "shiprocket", "delhivery", "bluedart", "vrl", etc.
  providerName?: string;
  trackingNumber: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  events: TrackingEvent[];
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  weight?: number; // grams
  dimensions?: { length: number; width: number; height: number };
  createdAt: string;
  updatedAt: string;
}

export type ShippingProviderType =
  | "shiprocket"
  | "delhivery"
  | "bluedart"
  | "vrl_logistics"
  | "custom";

export interface ShippingProvider {
  id: string;
  name: string;
  slug: ShippingProviderType | string;
  description: string;
  isEnabled: boolean;
  isDefault: boolean;
  trackingUrlTemplate?: string;
  logoUrl?: string;
  supportedRegions?: string[];
  estimatedTransitDays?: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    accountNumber?: string;
    warehouseCode?: string;
    isTestMode?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingLog {
  id: string;
  providerId: string;
  providerName: string;
  action: "create_shipment" | "track" | "cancel" | "webhook" | "auth";
  status: "success" | "error" | "warning";
  orderNumber?: string;
  trackingNumber?: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}
