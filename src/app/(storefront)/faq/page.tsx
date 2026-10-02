import React from "react";
import { Metadata } from "next";
import { FaqClient } from "./faq-client";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — NXTVIE Menswear",
  description: "Find answers regarding NXTVIE sizes, order status, courier partners, returns, and sustainable craftsmanship.",
};

export default function FaqPage() {
  return <FaqClient />;
}
