"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  Check,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Save,
  ExternalLink,
} from "lucide-react";

export default function PaymentSettingsPage() {
  const [gateway, setGateway] = useState("razorpay");
  const [environmentMode, setEnvironmentMode] = useState<"test" | "live">("test");
  const [keyId, setKeyId] = useState("rzp_test_YourKeyHere");
  const [enableCod, setEnableCod] = useState(true);
  const [autoCapture, setAutoCapture] = useState(true);
  const [supportedMethods, setSupportedMethods] = useState({
    upi: true,
    cards: true,
    netbanking: true,
    wallets: true,
    cod: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/admin/payments"
            className="admin-btn-secondary"
            style={{ padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={15} />
            <span>Payments</span>
          </Link>
          <span style={{ color: "var(--adm-text-faint)" }}>/</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#121110" }}>
            Payment Gateway Settings
          </h2>
        </div>
      </div>

      {saved && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            borderRadius: "8px",
            backgroundColor: "var(--adm-badge-green-bg)",
            color: "var(--adm-badge-green-text)",
            fontSize: "13.5px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Check size={16} />
          <span>Payment configuration saved successfully!</span>
        </div>
      )}

      {/* Security Architecture Notice */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--adm-border)",
          marginBottom: "24px",
          display: "flex",
          gap: "14px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "var(--adm-badge-green-bg)",
            color: "var(--adm-badge-green-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Lock size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "14px", color: "#121110" }}>
            Server-Only Security Perimeter Active
          </div>
          <p style={{ fontSize: "12.5px", color: "var(--adm-text-muted)", marginTop: "4px", lineHeight: 1.5 }}>
            In accordance with NXTVIE architecture rules, <code>RAZORPAY_KEY_SECRET</code> and <code>RAZORPAY_WEBHOOK_SECRET</code> are stored exclusively in server environment variables (<code>.env.local</code>) and are never exposed to browser client components.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Gateway Provider */}
        <div className="admin-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Gateway Provider</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <label
              style={{
                border: "2px solid",
                borderColor: gateway === "razorpay" ? "#121110" : "var(--adm-border)",
                borderRadius: "10px",
                padding: "16px",
                cursor: "pointer",
                backgroundColor: gateway === "razorpay" ? "var(--adm-surface-subtle)" : "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "14px" }}>Razorpay India (Default)</span>
                <input
                  type="radio"
                  name="gateway"
                  checked={gateway === "razorpay"}
                  onChange={() => setGateway("razorpay")}
                />
              </div>
              <p style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>
                Supports UPI, Cards, NetBanking, and automated refunds with webhook verification.
              </p>
            </label>

            <label
              style={{
                border: "1px solid var(--adm-border)",
                borderRadius: "10px",
                padding: "16px",
                opacity: 0.6,
                cursor: "not-allowed",
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: "14px" }}>Cashfree / PayU</span>
                <span style={{ fontSize: "10px", fontWeight: 700, backgroundColor: "#EAE7E1", padding: "2px 6px", borderRadius: "4px" }}>
                  Upcoming
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--adm-text-muted)" }}>
                Secondary gateway adapter ready via PaymentProvider interface.
              </p>
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-label">Environment Mode</label>
              <select
                value={environmentMode}
                onChange={(e) => setEnvironmentMode(e.target.value as "test" | "live")}
                className="admin-select"
              >
                <option value="test">Test Mode (Sandbox / Staging)</option>
                <option value="live">Live Production (Real Currency)</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Public Key ID (Client-Safe)</label>
              <input
                type="text"
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="admin-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Checkout Payment Methods</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13.5px" }}>
              <input
                type="checkbox"
                checked={supportedMethods.upi}
                onChange={(e) => setSupportedMethods({ ...supportedMethods, upi: e.target.checked })}
              />
              <span><strong>UPI Intent &amp; QR:</strong> GPay, PhonePe, Paytm, BHIM</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13.5px" }}>
              <input
                type="checkbox"
                checked={supportedMethods.cards}
                onChange={(e) => setSupportedMethods({ ...supportedMethods, cards: e.target.checked })}
              />
              <span><strong>Credit &amp; Debit Cards:</strong> Visa, MasterCard, RuPay, Amex</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13.5px" }}>
              <input
                type="checkbox"
                checked={supportedMethods.netbanking}
                onChange={(e) => setSupportedMethods({ ...supportedMethods, netbanking: e.target.checked })}
              />
              <span><strong>NetBanking:</strong> 50+ Indian commercial &amp; private banks</span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13.5px" }}>
              <input
                type="checkbox"
                checked={supportedMethods.cod}
                onChange={(e) => setSupportedMethods({ ...supportedMethods, cod: e.target.checked })}
              />
              <span><strong>Cash on Delivery (COD):</strong> Enable cash collection at door</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="admin-btn-primary">
            <Save size={15} />
            <span>Save Payment Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
