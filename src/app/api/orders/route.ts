// GET /api/orders — List orders (admin: all, customer: own)
// POST /api/orders — Create order (for COD flow, bypassing Razorpay)
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { generateOrderNumber, generateTrackingNumber } from "@/utils/slugify";
import { z } from "zod";

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const token = authHeader.slice(7);
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}

async function isAdmin(uid: string): Promise<boolean> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const role = userDoc.data()?.role;
  return role === "admin" || role === "super_admin";
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "25");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    const admin = await isAdmin(user.uid);

    let query = adminDb.collection("orders").orderBy("createdAt", "desc");

    // Non-admin users can only see their own orders
    if (!admin) {
      query = query.where("userId", "==", user.uid) as any;
    }

    // Status filter
    if (status && status !== "all") {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.limit(pageSize).offset((page - 1) * pageSize).get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count (for pagination)
    let countQuery = adminDb.collection("orders") as any;
    if (!admin) countQuery = countQuery.where("userId", "==", user.uid);
    if (status && status !== "all") countQuery = countQuery.where("status", "==", status);

    return NextResponse.json({
      success: true,
      data: {
        items: orders,
        page,
        pageSize,
        hasMore: orders.length === pageSize,
      },
    });
  } catch (error: any) {
    console.error("[orders-list] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST — COD order creation (bypasses Razorpay)
const codOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    title: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    selectedSize: z.string(),
    selectedColor: z.string().optional(),
    image: z.string(),
  })).min(1),
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
  subtotal: z.number(),
  discount: z.number(),
  shipping: z.number(),
  total: z.number().positive(),
  userId: z.string(),
  idempotencyKey: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = codOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    // Idempotency check
    const existingSnap = await adminDb
      .collection("orders")
      .where("idempotencyKey", "==", data.idempotencyKey)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      const existing = existingSnap.docs[0];
      return NextResponse.json({
        success: true,
        orderId: existing.id,
        orderNumber: existing.data().orderNumber,
      });
    }

    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();

    const orderRef = await adminDb.collection("orders").add({
      orderNumber,
      userId: data.userId,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      couponCode: data.couponCode || null,
      shipping: data.shipping,
      total: data.total,
      status: "pending",
      statusHistory: [
        { status: "pending", timestamp: now, note: "COD order placed" },
      ],
      paymentMethod: "Cash on Delivery",
      paymentStatus: "cod_pending",
      shippingAddress: data.shippingAddress,
      deliveryMethod: data.deliveryMethod,
      deliveryDateEstimate: data.deliveryMethod.includes("Priority")
        ? "1-2 Business Days"
        : "4-5 Business Days",
      trackingNumber,
      idempotencyKey: data.idempotencyKey,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderNumber,
    });
  } catch (error: any) {
    console.error("[orders-create] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
