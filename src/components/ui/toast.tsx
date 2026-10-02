"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/components/store-context";

export function Toast() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        zIndex: 2000,
        backgroundColor: "var(--text-dark)",
        color: "#FFFFFF",
        padding: "12px 20px",
        borderRadius: "var(--radius-full)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.02em",
        animation: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <CheckCircle2 size={18} color="var(--accent-gold)" />
      <span>{toastMessage}</span>
    </div>
  );
}
