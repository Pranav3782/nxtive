import React from "react";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/features/admin-dashboard/server/actions";
import { OrderDetailManager } from "@/features/admin-dashboard/components/order-detail-manager";

export const metadata = {
  title: "Order Fulfillment | NXTIVE Admin",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getAdminOrderById(orderId);

  if (!order) {
    notFound();
  }

  return <OrderDetailManager order={order} />;
}
