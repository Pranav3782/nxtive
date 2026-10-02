// Razorpay webhook receiver — verifies signature server-side, never exposed to client bundle.
// Handles payment.captured, payment.failed, refund.created events.
import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getRazorpayAdapter } from "@/server/payments";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // -- Verify webhook signature --
    const adapter = getRazorpayAdapter();
    const isValid = adapter.validateWebhookSignature(rawBody, signature);

    if (!isValid) {
      console.error("[razorpay-webhook] Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event.event;
    const payload = event.payload;

    const now = new Date().toISOString();

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const razorpayOrderId = payment.order_id;

        // Update payment record
        const paymentSnap = await adminDb
          .collection("payments")
          .where("razorpayOrderId", "==", razorpayOrderId)
          .limit(1)
          .get();

        if (!paymentSnap.empty) {
          const paymentDoc = paymentSnap.docs[0];
          await paymentDoc.ref.update({
            status: "captured",
            razorpayPaymentId: payment.id,
            method: payment.method || null,
            webhookVerified: true,
            updatedAt: now,
          });

          // If order exists, confirm payment status
          const orderData = paymentDoc.data();
          if (orderData.orderId) {
            const orderRef = adminDb.collection("orders").doc(orderData.orderId);
            const orderSnap = await orderRef.get();
            if (orderSnap.exists) {
              const order = orderSnap.data()!;
              if (order.paymentStatus !== "paid") {
                await orderRef.update({
                  paymentStatus: "paid",
                  status: "payment_confirmed",
                  updatedAt: now,
                  statusHistory: [
                    ...(order.statusHistory || []),
                    {
                      status: "payment_confirmed",
                      timestamp: now,
                      note: "Payment confirmed via Razorpay webhook",
                    },
                  ],
                });
              }
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        const razorpayOrderId = payment.order_id;

        const paymentSnap = await adminDb
          .collection("payments")
          .where("razorpayOrderId", "==", razorpayOrderId)
          .limit(1)
          .get();

        if (!paymentSnap.empty) {
          await paymentSnap.docs[0].ref.update({
            status: "failed",
            failureReason: payment.error_description || "Payment failed",
            webhookVerified: true,
            updatedAt: now,
          });
        }
        break;
      }

      case "refund.created": {
        const refund = payload.refund?.entity;
        if (!refund) break;

        const paymentId = refund.payment_id;

        const paymentSnap = await adminDb
          .collection("payments")
          .where("razorpayPaymentId", "==", paymentId)
          .limit(1)
          .get();

        if (!paymentSnap.empty) {
          const paymentDoc = paymentSnap.docs[0];
          await paymentDoc.ref.update({
            status: "refunded",
            refundId: refund.id,
            refundAmount: refund.amount,
            updatedAt: now,
          });

          const paymentData = paymentDoc.data();
          if (paymentData.orderId) {
            const orderRef = adminDb.collection("orders").doc(paymentData.orderId);
            const orderSnap = await orderRef.get();
            if (orderSnap.exists) {
              const order = orderSnap.data()!;
              await orderRef.update({
                paymentStatus: "refunded",
                status: "refunded",
                refundId: refund.id,
                refundAmount: refund.amount / 100, // convert paise to INR
                updatedAt: now,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: "refunded",
                    timestamp: now,
                    note: `Refund processed: ${refund.id}`,
                  },
                ],
              });
            }
          }
        }
        break;
      }

      default:
        // Acknowledge unhandled events
        console.log(`[razorpay-webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[razorpay-webhook] Error:", error);
    // Return 200 to prevent Razorpay retries for processing errors
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
