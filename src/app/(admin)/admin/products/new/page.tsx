import React from "react";
import { ProductForm } from "@/features/admin-dashboard/components/product-form";

export const metadata = {
  title: "New Apparel Item | NXTIVE Admin",
};

export default function NewProductPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--adm-text)" }}>
          Create Clothing Item
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--adm-text-muted)" }}>
          Configure size matrix, colorways, fabric specifications, and gallery photos.
        </p>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
}
