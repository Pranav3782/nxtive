// POST /api/payments/refund — Admin-only refund initiation
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { getRazorpayAdapter } from "@/server/payments";
import { z } from "zod";

const refundSchema = z.object({
  orderId: z.string().min(1),
  amount: z.number().positive().optional(), // partial refund in INR
  reason: z.string().optional(),
});

async function isAdmin(uid: string): Promise<boolean> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return false;
  const role = userDoc.data()?.role;
  return role === "admin" || role === "super_admin";
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await adminAuth.verifyIdToken(authHeader.slice(7));
    if (!(await isAdmin(user.uid))) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = refundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid refund data" }, { status: 400 });
    }

    const { orderId, amount, reason } = parsed.data;

    // Get order
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = orderDoc.data()!;
    const paymentId = order.razorpayPaymentId;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: "No Razorpay payment ID found for this order. COD orders cannot be refunded via Razorpay." },
        { status: 400 }
      );
    }

    // Initiate refund via Razorpay
    const adapter = getRazorpayAdapter();
    const refund = await adapter.initiateRefund({
      paymentId,
      amount: amount ? Math.round(amount * 100) : undefined, // convert INR to paise
      notes: { orderId, reason: reason || "Admin-initiated refund" },
    });

    const now = new Date().toISOString();

    // Update order
    await orderDoc.ref.update({
      status: "refund_initiated",
      paymentStatus: "refund_initiated",
      refundId: refund.id,
      refundAmount: amount || order.total,
      updatedAt: now,
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: "refund_initiated",
          timestamp: now,
          note: reason || "Refund initiated by admin",
          updatedBy: user.uid,
        },
      ],
    });

    // Audit log
    await adminDb.collection("admin_logs").add({
      action: "payment.refund",
      resource: "orders",
      resourceId: orderId,
      adminUid: user.uid,
      adminEmail: user.email || "",
      details: `Refund ${refund.id}: ₹${amount || order.total}`,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: amount || order.total,
    });
  } catch (error: any) {
    console.error("[refund] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Refund failed" },
      { status: 500 }
    );
  }
}
