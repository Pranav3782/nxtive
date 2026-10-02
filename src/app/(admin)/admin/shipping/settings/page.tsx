"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Lock, Save, Truck, MapPin } from "lucide-react";

export default function ShippingSettingsPage() {
  const [warehouseCode, setWarehouseCode] = useState("BLR_CENTRAL_01");
  const [warehouseAddress, setWarehouseAddress] = useState("Plot 42, E-City Logistics Hub, Hosur Main Road, Bengaluru 560100");
  const [contactPhone, setContactPhone] = useState("+91 80 2852 9000");
  const [contactEmail, setContactEmail] = useState("dispatch@nxtvie.com");
  const [shiprocketApiKey, setShiprocketApiKey] = useState("sr_live_key_masked");
  const [delhiveryApiKey, setDelhiveryApiKey] = useState("del_live_key_masked");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: "900px" }}>
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
            href="/admin/shipping"
            className="admin-btn-secondary"
            style={{ padding: "7px 12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ArrowLeft size={15} />
            <span>Shipping</span>
          </Link>
          <span style={{ color: "var(--adm-text-faint)" }}>/</span>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#121110" }}>
            Warehouse & Logistics Credentials
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
          <span>Logistics configuration updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Origin Warehouse Card */}
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <MapPin size={18} color="var(--adm-text-muted)" />
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Primary Dispatch Hub (Pickup Address)</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="admin-form-group">
              <label className="admin-label">Warehouse Code</label>
              <input
                type="text"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Dispatch Desk Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="admin-input"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Full Street Address for Courier Pickup</label>
            <textarea
              rows={2}
              value={warehouseAddress}
              onChange={(e) => setWarehouseAddress(e.target.value)}
              className="admin-textarea"
            />
          </div>
        </div>

        {/* Carrier API Credentials */}
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Lock size={18} color="var(--adm-text-muted)" />
            <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Logistics Carrier API Keys</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--adm-text-muted)", marginBottom: "20px" }}>
            These keys are used server-side by <code>server/delivery</code> adapters to schedule automated pickups and fetch webhook telemetry.
          </p>

          <div className="admin-form-group">
            <label className="admin-label">Shiprocket API Auth Token</label>
            <input
              type="password"
              value={shiprocketApiKey}
              onChange={(e) => setShiprocketApiKey(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Delhivery Client API Token</label>
            <input
              type="password"
              value={delhiveryApiKey}
              onChange={(e) => setDelhiveryApiKey(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="admin-btn-primary">
            <Save size={15} />
            <span>Save Logistics Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
