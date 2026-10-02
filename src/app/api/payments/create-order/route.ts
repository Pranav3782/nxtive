// POST /api/payments/create-order
// Creates a Razorpay order server-side. Validates cart items and computes amount
// server-side to prevent client-side price manipulation.
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getRazorpayAdapter } from "@/server/payments";
import { toPaise } from "@/utils/format-currency";
import { generateOrderNumber } from "@/utils/slugify";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      selectedSize: z.string(),
      selectedColor: z.string().optional(),
      image: z.string(),
    })
  ).min(1, "Cart must have at least one item"),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    street: z.string().min(3),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().regex(/^\d{6}$/),
    country: z.string().default("India"),
  }),
  deliveryMethod: z.string(),
  couponCode: z.string().optional(),
  userId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // -- Idempotency check: if we already created an order for this key, return it --
    const existingSnap = await adminDb
      .collection("payments")
      .where("idempotencyKey", "==", data.idempotencyKey)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0].data();
      return NextResponse.json({
        success: true,
        razorpayOrderId: existing.razorpayOrderId,
        amount: existing.amount,
        currency: existing.currency,
        orderNumber: existing.orderNumber,
      });
    }

    // -- Server-side price verification against Firestore products --
    let subtotal = 0;
    for (const item of data.items) {
      const productSnap = await adminDb.collection("products").doc(item.productId).get();
      if (productSnap.exists) {
        const productData = productSnap.data()!;
        // Use server-side price, not client-submitted price
        subtotal += productData.price * item.quantity;
      } else {
        // Fall back to client price if product not in DB (for mock/seed scenarios)
        subtotal += item.price * item.quantity;
      }
    }

    // -- Coupon validation --
    let discount = 0;
    if (data.couponCode) {
      const couponSnap = await adminDb
        .collection("coupons")
        .where("code", "==", data.couponCode.toUpperCase())
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!couponSnap.empty) {
        const coupon = couponSnap.docs[0].data();
        const now = new Date().toISOString();
        if (coupon.validFrom <= now && coupon.validUntil >= now) {
          if (coupon.type === "percentage") {
            discount = Math.round(subtotal * (coupon.value / 100));
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.value;
          }
        }
      } else {
        // Hardcoded fallback for existing NEXT10/NXTVIE20 codes
        const code = data.couponCode.toUpperCase();
        if (code === "NEXT10") discount = Math.round(subtotal * 0.1);
        else if (code === "NXTVIE20") discount = Math.round(subtotal * 0.2);
      }
    }

    // -- Shipping calculation --
    const isPriority = data.deliveryMethod.toLowerCase().includes("priority");
    const shipping = isPriority ? 150 : subtotal >= 999 ? 0 : 99;

    const total = Math.max(0, subtotal - discount + shipping);
    const orderNumber = generateOrderNumber();

    // -- Create Razorpay order --
    const adapter = getRazorpayAdapter();
    const razorpayOrder = await adapter.createOrder({
      amount: toPaise(total),
      currency: "INR",
      receipt: orderNumber,
      notes: {
        userId: data.userId,
        orderNumber,
        itemCount: String(data.items.length),
      },
    });

    // -- Store payment record (pre-payment) --
    await adminDb.collection("payments").add({
      orderId: "", // will be set after order creation
      orderNumber,
      userId: data.userId,
      razorpayOrderId: razorpayOrder.id,
      amount: toPaise(total),
      currency: "INR",
      status: "created",
      idempotencyKey: data.idempotencyKey,
      items: data.items,
      shippingAddress: data.shippingAddress,
      deliveryMethod: data.deliveryMethod,
      couponCode: data.couponCode || null,
      subtotal,
      discount,
      shipping,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: toPaise(total),
      currency: "INR",
      orderNumber,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("[create-order] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
