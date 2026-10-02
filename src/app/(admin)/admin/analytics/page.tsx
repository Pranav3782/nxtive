"use client";

import React from "react";
import { TrendingUp, BarChart3, CreditCard, ShoppingBag, Award, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";

const CATEGORY_SHARE = [
  { name: "T-Shirts (Heavyweight)", percentage: 42, amount: 104265, color: "#F2AC24" },
  { name: "Shirts (Camp Collar & Linen)", percentage: 24, amount: 59580, color: "#3B82F6" },
  { name: "Hoodies & Sweatshirts", percentage: 18, amount: 44685, color: "#8B5CF6" },
  { name: "Bottoms & Denim", percentage: 12, amount: 29790, color: "#10B981" },
  { name: "Jackets & Accessories", percentage: 4, amount: 9930, color: "#EC4899" },
];

const BESTSELLERS = [
  {
    title: "Oversized Essential Tee",
    category: "T-Shirts",
    unitsSold: 148,
    revenue: 118252,
    returnRate: "1.2%",
  },
  {
    title: "French Terry Heavyweight Hoodie",
    category: "Hoodies",
    unitsSold: 64,
    revenue: 140736,
    returnRate: "0.8%",
  },
  {
    title: "Camp Collar Linen Shirt",
    category: "Shirts",
    unitsSold: 52,
    revenue: 77948,
    returnRate: "2.1%",
  },
  {
    title: "Raw Denim Relaxed Jeans",
    category: "Bottoms",
    unitsSold: 41,
    revenue: 102459,
    returnRate: "3.4%",
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="admin-panel" style={{ marginBottom: "24px" }}>
        <div className="admin-panel-header">
          <div className="admin-panel-title-wrap">
            <h3>Merchandise Analytics &amp; Conversion Insights</h3>
            <p>Apparel sales distribution, gateway adoption, and bestseller velocity</p>
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--adm-gold)" }}>
            Rolling 30-Day Period
          </span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="admin-metrics-grid" style={{ marginBottom: "24px" }}>
        <div className="admin-metric-card gold">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Gross Merchandise Volume</span>
            <div className="admin-metric-icon-wrap gold">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="admin-metric-value">{formatCurrency(248250)}</div>
          <div className="admin-metric-footer">
            <span className="admin-trend-up">
              <ArrowUpRight size={14} /> +24.8% MoM
            </span>
            <span className="admin-metric-subtext">expanding brand scale</span>
          </div>
        </div>

        <div className="admin-metric-card blue">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Checkout Conversion Rate</span>
            <div className="admin-metric-icon-wrap blue">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="admin-metric-value">3.82%</div>
          <div className="admin-metric-footer">
            <span className="admin-trend-up">+0.6% uplift</span>
            <span className="admin-metric-subtext">post Razorpay 1-click checkout</span>
          </div>
        </div>

        <div className="admin-metric-card green">
          <div className="admin-metric-header">
            <span className="admin-metric-title">Customer Repeat Rate</span>
            <div className="admin-metric-icon-wrap green">
              <Award size={18} />
            </div>
          </div>
          <div className="admin-metric-value">34.2%</div>
          <div className="admin-metric-footer">
            <span className="admin-trend-up">+8.1%</span>
            <span className="admin-metric-subtext">loyal streetwear audience</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Category Share & Gateway Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Category Share */}
        <div className="admin-panel" style={{ margin: 0, padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: "4px" }}>
            Sales Volume by Apparel Category
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--adm-text-muted)", marginBottom: "20px" }}>
            Revenue share across core clothing collections
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {CATEGORY_SHARE.map((item) => (
              <div key={item.name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.84rem" }}>
                  <span style={{ fontWeight: 600, color: "var(--adm-text)" }}>{item.name}</span>
                  <span style={{ color: "var(--adm-text-secondary)" }}>
                    {formatCurrency(item.amount)} ({item.percentage}%)
                  </span>
                </div>
                <div style={{ height: "8px", borderRadius: "999px", backgroundColor: "#141312", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods Split */}
        <div className="admin-panel" style={{ margin: 0, padding: "24px" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--adm-text)", marginBottom: "4px" }}>
            Payment Method Share
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--adm-text-muted)", marginBottom: "20px" }}>
            Razorpay UPI, Debit/Credit Cards &amp; COD adoption
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { method: "Razorpay UPI (GPay/PhonePe)", share: "68%", color: "#10B981" },
              { method: "Razorpay Cards & NetBanking", share: "21%", color: "#3B82F6" },
              { method: "Cash on Delivery (COD)", share: "11%", color: "#F59E0B" },
            ].map((p) => (
              <div
                key={p.method}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#141312",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: p.color }} />
                  <span style={{ fontSize: "0.85rem", color: "var(--adm-text)", fontWeight: 500 }}>
                    {p.method}
                  </span>
                </div>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FBF9F5" }}>
                  {p.share}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Table: Bestsellers */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-panel-title-wrap">
            <h3>Top Performing Garments</h3>
            <p>Clothing products with the highest demand velocity and lowest return incidence</p>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Title</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Gross Revenue</th>
                <th>Return Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {BESTSELLERS.map((item, idx) => (
                <tr key={item.title}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          backgroundColor: idx === 0 ? "rgba(242, 172, 36, 0.2)" : "rgba(255, 255, 255, 0.05)",
                          color: idx === 0 ? "#F2AC24" : "var(--adm-text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <span style={{ fontWeight: 700, color: "var(--adm-text)" }}>{item.title}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--adm-text-secondary)" }}>{item.category}</span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 600, color: "var(--adm-text)" }}>{item.unitsSold} pcs</span>
                  </td>

                  <td>
                    <span style={{ fontWeight: 700, color: "#F2AC24" }}>{formatCurrency(item.revenue)}</span>
                  </td>

                  <td>
                    <span style={{ fontSize: "0.82rem", color: "#10B981" }}>{item.returnRate}</span>
                  </td>

                  <td>
                    <span className="admin-badge success">
                      <span className="admin-badge-dot" /> Top Runner
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
