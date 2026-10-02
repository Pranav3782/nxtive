// GET/PATCH /api/orders/[orderId] — Get or update a single order (admin)
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { ORDER_STATUS_TRANSITIONS } from "@/constants/order-status";
import type { OrderStatus } from "@/types/order";
import { z } from "zod";

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await adminAuth.verifyIdToken(authHeader.slice(7));
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = orderDoc.data()!;

    // Non-admin can only view own orders
    const admin = await isAdmin(user.uid);
    if (!admin && order.userId !== user.uid) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: { id: orderDoc.id, ...order },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

const updateOrderSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
  returnReason: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(user.uid);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid update data" }, { status: 400 });
    }

    const updates = parsed.data;
    const orderRef = adminDb.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const order = orderDoc.data()!;
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = { updatedAt: now };

    // -- Status transition validation --
    if (updates.status) {
      const currentStatus = order.status as OrderStatus;
      const newStatus = updates.status as OrderStatus;
      const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

      if (!allowedTransitions.includes(newStatus)) {
        return NextResponse.json(
          { success: false, error: `Cannot transition from "${currentStatus}" to "${newStatus}"` },
          { status: 400 }
        );
      }

      updateData.status = newStatus;
      updateData.statusHistory = [
        ...(order.statusHistory || []),
        {
          status: newStatus,
          timestamp: now,
          note: updates.notes || `Status updated by admin`,
          updatedBy: user.uid,
        },
      ];

      // Auto-update payment status for certain transitions
      if (newStatus === "cancelled") {
        updateData.cancelReason = updates.cancelReason || "Cancelled by admin";
      }
      if (newStatus === "refund_initiated") {
        updateData.paymentStatus = "refund_initiated";
      }
      if (newStatus === "refunded") {
        updateData.paymentStatus = "refunded";
      }
    }

    if (updates.trackingNumber) updateData.trackingNumber = updates.trackingNumber;
    if (updates.trackingUrl) updateData.trackingUrl = updates.trackingUrl;
    if (updates.notes) updateData.notes = updates.notes;

    await orderRef.update(updateData);

    // Log admin action
    await adminDb.collection("admin_logs").add({
      action: "order.update",
      resource: "orders",
      resourceId: orderId,
      adminUid: user.uid,
      adminEmail: user.email || "",
      details: JSON.stringify(updates),
      timestamp: now,
    });

    return NextResponse.json({ success: true, data: { id: orderId, ...updateData } });
  } catch (error: any) {
    console.error("[order-update] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
