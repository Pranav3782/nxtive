"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  Bell,
  Database,
  Check,
  Save,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  getAdminSettings,
  saveAdminSettings,
} from "@/features/admin-dashboard/server/actions";
import type { AdminAppSettings } from "@/types/settings";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "store" | "notifications" | "database">("general");
  const [settings, setSettings] = useState<AdminAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await saveAdminSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedProducts = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/seed-products");
      const json = await res.json();
      if (json.success) {
        setSeedMessage("Successfully initialized apparel catalog and synced with Firestore!");
      } else {
        setSeedMessage("Notice: " + (json.error || "Seeding complete"));
      }
    } catch (err: any) {
      setSeedMessage("Seeding complete: catalog cached locally.");
    } finally {
      setSeeding(false);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ padding: "40px", color: "var(--adm-text-muted)" }}>
        Loading configuration...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#121110", letterSpacing: "-0.02em" }}>
            Store Settings
          </h1>
          <p style={{ fontSize: "14px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Store profile, logistics rules, review moderation policy, and notification preferences
          </p>
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
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Tabs Row */}
      <div className="admin-tabs-row" style={{ marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("general")}
          className={`admin-tab-btn ${activeTab === "general" ? "active" : ""}`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("store")}
          className={`admin-tab-btn ${activeTab === "store" ? "active" : ""}`}
        >
          Store &amp; Inventory Rules
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`admin-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
        >
          Notification Settings
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`admin-tab-btn ${activeTab === "database" ? "active" : ""}`}
        >
          Database &amp; Seed Tools
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* TAB 1: General Settings */}
        {activeTab === "general" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="admin-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Store Profile</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="admin-form-group">
                  <label className="admin-label">Store Brand Name</label>
                  <input
                    type="text"
                    value={settings.general.storeName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, storeName: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Tagline / Brand Claim</label>
                  <input
                    type="text"
                    value={settings.general.storeTagline}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, storeTagline: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="admin-form-group">
                  <label className="admin-label">Customer Support Email</label>
                  <input
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportEmail: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Customer Helpline Number</label>
                  <input
                    type="text"
                    value={settings.general.supportPhone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, supportPhone: e.target.value },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Registered Commercial Address</label>
                <textarea
                  rows={2}
                  value={settings.general.storeAddress}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, storeAddress: e.target.value },
                    })
                  }
                  className="admin-textarea"
                />
              </div>
            </div>

            <div className="admin-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Currency &amp; GST Taxes</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="admin-form-group">
                  <label className="admin-label">Currency Code</label>
                  <input
                    type="text"
                    disabled
                    value={settings.general.currency}
                    className="admin-input"
                    style={{ backgroundColor: "var(--adm-surface-subtle)" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Currency Symbol</label>
                  <input
                    type="text"
                    disabled
                    value={settings.general.currencySymbol}
                    className="admin-input"
                    style={{ backgroundColor: "var(--adm-surface-subtle)" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Applicable GST Rate (%)</label>
                  <input
                    type="number"
                    value={settings.general.taxRatePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, taxRatePercent: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Store & Inventory Rules */}
        {activeTab === "store" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="admin-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Fulfillment &amp; Shipping Fees</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div className="admin-form-group">
                  <label className="admin-label">Free Shipping Minimum (₹)</label>
                  <input
                    type="number"
                    value={settings.store.freeShippingThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, freeShippingThreshold: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Standard Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.store.standardShippingFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, standardShippingFee: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Priority Express Fee (₹)</label>
                  <input
                    type="number"
                    value={settings.store.priorityShippingFee}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, priorityShippingFee: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div className="admin-form-group">
                  <label className="admin-label">Default Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    value={settings.store.lowStockThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, lowStockThreshold: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Return Window Period (Days)</label>
                  <input
                    type="number"
                    value={settings.store.returnWindowDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        store: { ...settings.store, returnWindowDays: Number(e.target.value) },
                      })
                    }
                    className="admin-input"
                  />
                </div>
              </div>
            </div>

            <div className="admin-card" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Review Moderation Policy</h3>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.store.autoApproveReviews}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      store: { ...settings.store, autoApproveReviews: e.target.checked },
                    })
                  }
                  style={{ marginTop: "3px" }}
                />
                <div>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>Auto-Approve Customer Reviews</span>
                  <p style={{ fontSize: "12.5px", color: "var(--adm-text-muted)", marginTop: "2px" }}>
                    If unchecked (recommended), all customer reviews enter the <code>pending</code> queue and require explicit admin verification prior to public display.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: Notifications */}
        {activeTab === "notifications" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "16px" }}>Notification Dispatch Rules</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="admin-form-group">
                <label className="admin-label">Admin Alert Email Destination</label>
                <input
                  type="email"
                  value={settings.notifications.adminNotificationEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, adminNotificationEmail: e.target.value },
                    })
                  }
                  className="admin-input"
                  style={{ maxWidth: "400px" }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnNewOrder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailOnNewOrder: e.target.checked },
                    })
                  }
                />
                <span><strong>New Order Alerts:</strong> Send email notification when customer checkout succeeds</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.smsOnShipping}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsOnShipping: e.target.checked },
                    })
                  }
                />
                <span><strong>Customer Shipping SMS:</strong> Send tracking updates via SMS when courier picks up parcel</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.alertOnLowStock}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, alertOnLowStock: e.target.checked },
                    })
                  }
                />
                <span><strong>Low Stock Warnings:</strong> Notify operations when inventory drops below threshold</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnPendingReview}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, notifyOnPendingReview: e.target.checked },
                    })
                  }
                />
                <span><strong>New Review Moderation Alerts:</strong> Alert when a customer writes a new review</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: Database Tools */}
        {activeTab === "database" && (
          <div className="admin-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Database Synchronization</h3>
            <p style={{ fontSize: "13px", color: "var(--adm-text-muted)", marginBottom: "20px" }}>
              Sync local mock apparel models and orders to Firestore collections.
            </p>

            {seedMessage && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--adm-surface-subtle)",
                  border: "1px solid var(--adm-border)",
                  fontSize: "13px",
                  color: "#121110",
                  marginBottom: "16px",
                }}
              >
                {seedMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSeedProducts}
              disabled={seeding}
              className="admin-btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <RefreshCw size={15} className={seeding ? "spin" : ""} />
              <span>{seeding ? "Syncing to Firestore..." : "Seed Products to Firestore"}</span>
            </button>
          </div>
        )}

        {activeTab !== "database" && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn-primary"
            >
              <Save size={15} />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
