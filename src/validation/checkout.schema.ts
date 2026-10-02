// Schema for checkout/address/payment payload validation.
import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  street: z.string().min(3, "Street address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z
    .string()
    .regex(/^\d{6}$/, "PIN code must be 6 digits"),
  country: z.string().default("India"),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().min(1, "Payment method is required"),
  deliveryMethod: z.string().min(1, "Delivery method is required"),
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
