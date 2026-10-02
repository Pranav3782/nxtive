"use server";

import { adminDb } from "@/lib/firebase/admin";
import type { Order } from "@/types/order";
import { getAdminOrders, getAdminOrderById, updateOrderStatus } from "@/features/admin-dashboard/server/actions";

/** Get orders for a specific customer */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  try {
    const snap = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (!snap.empty) {
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Order));
    }
  } catch {
    // fallback
  }

  const allOrders = await getAdminOrders();
  return allOrders.filter((o) => o.userId === userId || o.userId === "usr-demo-1");
}

/** Get order details by ID for customer view */
export async function getOrderById(orderId: string): Promise<Order | null> {
  return await getAdminOrderById(orderId);
}

/** Cancel order by customer if still pending or payment_confirmed */
export async function cancelCustomerOrder(
  orderId: string,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const order = await getOrderById(orderId);
  if (!order) return { success: false, error: "Order not found" };

  if (order.status !== "pending" && order.status !== "payment_confirmed") {
    return {
      success: false,
      error: `Order cannot be cancelled as it is already in "${order.status}" status.`,
    };
  }

  return await updateOrderStatus(orderId, "cancelled", reason || "Cancelled by customer");
}
