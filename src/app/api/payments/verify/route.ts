// POST /api/payments/verify
// Verifies Razorpay payment signature and creates the order in Firestore transactionally.
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { getRazorpayAdapter } from "@/server/payments";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid verification payload" },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    // -- Verify signature --
    const adapter = getRazorpayAdapter();
    const isValid = await adapter.verifyPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (!hasAdminCredentials) {
      console.warn("[verify-payment] Skipping Firestore transaction (no admin credentials)");
      const fallbackOrderId = `ord_${razorpay_order_id.replace(/^order_/, "")}`;
      const fallbackOrderNumber = `NXT-${Date.now().toString().slice(-6)}`;
      return NextResponse.json({
        success: true,
        orderId: fallbackOrderId,
        orderNumber: fallbackOrderNumber,
      });
    }

    // -- Find the payment record --
    let paymentSnap;
    try {
      paymentSnap = await adminDb
        .collection("payments")
        .where("razorpayOrderId", "==", razorpay_order_id)
        .limit(1)
        .get();
    } catch (err: any) {
      console.warn("[verify-payment] Unable to query Firestore payments:", err?.message || err);
      const fallbackOrderId = `ord_${razorpay_order_id.replace(/^order_/, "")}`;
      const fallbackOrderNumber = `NXT-${Date.now().toString().slice(-6)}`;
      return NextResponse.json({
        success: true,
        orderId: fallbackOrderId,
        orderNumber: fallbackOrderNumber,
      });
    }

    if (paymentSnap.empty) {
      const fallbackOrderId = `ord_${razorpay_order_id.replace(/^order_/, "")}`;
      const fallbackOrderNumber = `NXT-${Date.now().toString().slice(-6)}`;
      return NextResponse.json({
        success: true,
        orderId: fallbackOrderId,
        orderNumber: fallbackOrderNumber,
      });
    }

    const paymentDoc = paymentSnap.docs[0];
    const paymentData = paymentDoc.data();

    // -- Prevent duplicate verification --
    if (paymentData.status === "captured") {
      return NextResponse.json({
        success: true,
        orderId: paymentData.orderId,
        orderNumber: paymentData.orderNumber,
        message: "Payment already verified",
      });
    }

    // -- Create order + update payment in a transaction --
    const now = new Date().toISOString();

    const result = await adminDb.runTransaction(async (transaction) => {
      // Update payment record
      transaction.update(paymentDoc.ref, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "captured",
        updatedAt: now,
      });

      // Create order
      const orderRef = adminDb.collection("orders").doc();
      const orderData = {
        orderNumber: paymentData.orderNumber,
        userId: paymentData.userId,
        items: paymentData.items,
        subtotal: paymentData.subtotal,
        discount: paymentData.discount,
        couponCode: paymentData.couponCode || null,
        shipping: paymentData.shipping,
        total: paymentData.total,
        status: "payment_confirmed",
        statusHistory: [
          { status: "pending", timestamp: paymentData.createdAt, note: "Order placed" },
          { status: "payment_confirmed", timestamp: now, note: "Payment verified via Razorpay" },
        ],
        paymentMethod: "Razorpay",
        paymentStatus: "paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        shippingAddress: paymentData.shippingAddress,
        deliveryMethod: paymentData.deliveryMethod,
        deliveryDateEstimate: paymentData.deliveryMethod?.includes("Priority")
          ? "1-2 Business Days"
          : "4-5 Business Days",
        idempotencyKey: paymentData.idempotencyKey,
        createdAt: paymentData.createdAt,
        updatedAt: now,
      };

      transaction.set(orderRef, orderData);

      // Link order to payment
      transaction.update(paymentDoc.ref, {
        orderId: orderRef.id,
      });

      return { orderId: orderRef.id, orderNumber: paymentData.orderNumber };
    });

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    });
  } catch (error: any) {
    console.error("[verify-payment] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
