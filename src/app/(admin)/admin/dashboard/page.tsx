"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Clock,
  Star,
  Box,
  ChevronRight,
  ChevronDown,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  Search,
  ExternalLink,
  Check,
  X,
  Calendar,
  AlertTriangle,
  CreditCard,
  Truck,
  ShieldCheck,
  Settings,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import {
  getDashboardStats,
  getAdminProducts,
  approveReview,
  rejectReview,
} from "@/features/admin-dashboard/server/actions";
import type { DashboardStats } from "@/features/admin-dashboard/server/admin-data";
import type { Product } from "@/types/product";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Products");
  const [productSearch, setProductSearch] = useState("");
  const [dateRange, setDateRange] = useState("1 Oct 2026 - 31 Oct 2026");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [reviewActionLoading, setReviewActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [dashStats, prods] = await Promise.all([
        getDashboardStats(),
        getAdminProducts(),
      ]);
      setStats(dashStats);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveReview = async (id: string) => {
    setReviewActionLoading(id);
    try {
      await approveReview(id);
      await loadData();
    } catch {
      alert("Failed to approve review");
    } finally {
      setReviewActionLoading(null);
    }
  };

  const handleRejectReview = async (id: string) => {
    setReviewActionLoading(id);
    try {
      await rejectReview(id);
      await loadData();
    } catch {
      alert("Failed to reject review");
    } finally {
      setReviewActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ height: "100px", borderRadius: "12px", backgroundColor: "#FFFFFF", border: "1px solid #E8E5DF", animation: "pulse 1.2s infinite" }} />
        <div style={{ height: "340px", borderRadius: "12px", backgroundColor: "#FFFFFF", border: "1px solid #E8E5DF", animation: "pulse 1.2s infinite" }} />
      </div>
    );
  }

  if (!stats) return null;

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* ─── Top Header: Title & Date Range Selector ───────────────── */}
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
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        {/* Date range picker dropdown matching reference */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDateDropdown((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid var(--adm-border)",
              backgroundColor: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--adm-text-primary)",
              cursor: "pointer",
            }}
          >
            <Calendar size={14} color="var(--adm-text-muted)" />
            <span>{dateRange}</span>
            <ChevronDown size={14} color="var(--adm-text-muted)" />
          </button>

          {showDateDropdown && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "42px",
                width: "220px",
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--adm-border)",
                borderRadius: "10px",
                boxShadow: "var(--adm-shadow-dropdown)",
                zIndex: 50,
                padding: "6px",
              }}
            >
              {[
                "1 Oct 2026 - 31 Oct 2026",
                "Last 7 Days",
                "Last 30 Days",
                "Previous Month (Sep 2026)",
                "Year to Date (2026)",
              ].map((range) => (
                <div
                  key={range}
                  onClick={() => {
                    setDateRange(range);
                    setShowDateDropdown(false);
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "12.5px",
                    fontWeight: range === dateRange ? 700 : 500,
                    color: range === dateRange ? "#121110" : "var(--adm-text-secondary)",
                    backgroundColor: range === dateRange ? "var(--adm-surface-subtle)" : "transparent",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {range}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── 6 Metric Summary Cards Matching Reference ─────────────── */}
      <div className="admin-kpi-grid">
        {/* 1. Total Sales */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Sales</span>
            <div className="admin-kpi-icon-wrap sales">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="admin-kpi-trend positive">
            <span>↑ 12%</span>
            <span className="admin-kpi-trend-note">vs last month</span>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Orders</span>
            <div className="admin-kpi-icon-wrap orders">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats.totalOrders}</div>
          <div className="admin-kpi-trend positive">
            <span>↑ 8%</span>
            <span className="admin-kpi-trend-note">vs last month</span>
          </div>
        </div>

        {/* 3. Total Customers */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Total Customers</span>
            <div className="admin-kpi-icon-wrap customers">
              <Users size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats.totalCustomers.toLocaleString()}</div>
          <div className="admin-kpi-trend positive">
            <span>↑ 15%</span>
            <span className="admin-kpi-trend-note">vs last month</span>
          </div>
        </div>

        {/* 4. Pending Orders */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Pending Orders</span>
            <div className="admin-kpi-icon-wrap pending">
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats.pendingOrdersCount}</div>
          <Link
            href="/admin/orders?status=pending"
            className="admin-overview-link"
            style={{ fontSize: "11.5px" }}
          >
            <span>Review pending</span>
            <span>→</span>
          </Link>
        </div>

        {/* 5. Pending Reviews */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Pending Reviews</span>
            <div className="admin-kpi-icon-wrap reviews">
              <Star size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats.pendingReviewsCount}</div>
          <Link
            href="/admin/reviews?status=pending"
            className="admin-overview-link"
            style={{ fontSize: "11.5px" }}
          >
            <span>Awaiting action</span>
            <span>→</span>
          </Link>
        </div>

        {/* 6. Low Stock Products */}
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Low Stock Products</span>
            <div className="admin-kpi-icon-wrap stock">
              <Box size={18} />
            </div>
          </div>
          <div className="admin-kpi-value">{stats.lowStockCount}</div>
          <Link
            href="/admin/inventory"
            className="admin-overview-link"
            style={{ fontSize: "11.5px" }}
          >
            <span>Inspect inventory</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* ─── 3 Column Section: Recent Orders | Pending Reviews | Stock Overview ─── */}
      <div className="admin-overview-grid">
        {/* A. Recent Orders Card */}
        <div className="admin-overview-card">
          <div className="admin-overview-header">
            <h3 className="admin-overview-title">Recent Orders</h3>
            <Link href="/admin/orders" className="admin-overview-link">
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((ord) => {
                  let badgeClass = "amber";
                  if (ord.status === "delivered") badgeClass = "green";
                  else if (ord.status === "shipped") badgeClass = "blue";
                  else if (ord.status === "packed") badgeClass = "purple";
                  else if (ord.status === "cancelled") badgeClass = "red";

                  return (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, color: "#121110" }}>
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {ord.orderNumber}
                        </Link>
                      </td>
                      <td>{ord.shippingAddress?.fullName || "Guest"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {ord.items?.length || 1} {ord.items?.length === 1 ? "item" : "items"}
                      </td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(ord.total)}</td>
                      <td>
                        <span className={`admin-badge ${badgeClass}`}>
                          {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--adm-text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="admin-icon-button"
                          style={{ width: "28px", height: "28px" }}
                          title="View order"
                        >
                          <MoreHorizontal size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* B. Pending Reviews Card */}
        <div className="admin-overview-card">
          <div className="admin-overview-header">
            <h3 className="admin-overview-title">Pending Reviews</h3>
            <Link href="/admin/reviews?status=pending" className="admin-overview-link">
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {stats.pendingReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--adm-border-light)",
                  alignItems: "flex-start",
                }}
              >
                <img
                  src={rev.userAvatar || "/images/nxtvie/gallery-1.jpg"}
                  alt={rev.userName}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", color: "#121110" }}>
                      {rev.userName}
                    </div>
                    <span className="admin-badge pending" style={{ fontSize: "11px", padding: "1px 7px" }}>
                      Pending
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "2px 0" }}>
                    <div style={{ display: "flex", color: "#F2AC24" }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={11}
                          fill={i < rev.rating ? "#F2AC24" : "none"}
                          stroke="#F2AC24"
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>
                      2 days ago
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--adm-text-muted)",
                      lineHeight: "1.4",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rev.comment}
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      onClick={() => handleApproveReview(rev.id)}
                      disabled={reviewActionLoading === rev.id}
                      style={{
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "var(--adm-badge-green-bg)",
                        color: "var(--adm-badge-green-text)",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectReview(rev.id)}
                      disabled={reviewActionLoading === rev.id}
                      style={{
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "var(--adm-badge-red-bg)",
                        color: "var(--adm-badge-red-text)",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* C. Stock Overview Card */}
        <div className="admin-overview-card">
          <div className="admin-overview-header">
            <h3 className="admin-overview-title">Stock Overview</h3>
            <Link href="/admin/inventory" className="admin-overview-link">
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {stats.stockOverview.map((item) => {
              let badgeClass = "green";
              if (item.status === "Low Stock") badgeClass = "amber";
              else if (item.status === "Out of Stock") badgeClass = "red";

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "10px",
                    borderBottom: "1px solid var(--adm-border-light)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        border: "1px solid var(--adm-border-light)",
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: "#121110" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>
                        SKU: {item.sku}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#121110" }}>
                      {item.stock}
                    </div>
                    <span className={`admin-badge ${badgeClass}`} style={{ fontSize: "11px", padding: "2px 8px" }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Bottom Navigation Tabs Matching Reference ─────────────── */}
      <div className="admin-tabs-row">
        {[
          "Products",
          "Customers",
          "Reviews",
          "Orders",
          "Payments",
          "Shipping & Logistics",
          "Admin Users",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Tab Content: Products View with Quick Actions Grid ─────── */}
      {activeTab === "Products" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
          {/* Products List Surface */}
          <div className="admin-card" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#121110" }}>Products</h3>
                <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>
                  Manage your product catalogue, pricing, stock and more.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <Search size={14} className="admin-search-icon" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="admin-input"
                    style={{ paddingLeft: "34px", width: "200px", height: "36px", fontSize: "12.5px" }}
                  />
                </div>

                <Link
                  href="/admin/products"
                  className="admin-btn-secondary admin-btn-sm"
                  style={{ height: "36px" }}
                >
                  <Filter size={14} />
                  <span>Filter</span>
                </Link>

                <Link
                  href="/admin/products/new"
                  className="admin-btn-primary admin-btn-sm"
                  style={{ height: "36px" }}
                >
                  <Plus size={15} />
                  <span>Add Product</span>
                </Link>
              </div>
            </div>

            {/* Products Table matching reference */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>
                      <input type="checkbox" style={{ cursor: "pointer" }} />
                    </th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.slice(0, 5).map((p) => {
                    const isLow = (p.totalStock ?? 10) <= (p.lowStockThreshold ?? 10) && (p.totalStock ?? 10) > 0;
                    const isOut = (p.totalStock ?? 10) <= 0;

                    return (
                      <tr key={p.id}>
                        <td>
                          <input type="checkbox" style={{ cursor: "pointer" }} />
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={p.image || "/images/nxtvie/product-oversized-tee-hd.jpg"}
                              alt={p.title}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                objectFit: "cover",
                                border: "1px solid var(--adm-border-light)",
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#121110" }}>
                                {p.title}
                              </div>
                              <div style={{ fontSize: "11.5px", color: "var(--adm-text-muted)" }}>
                                SKU: {p.sku || `NV-TS-00${p.id.slice(-1)}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td style={{ fontWeight: 700 }}>{formatCurrency(p.price)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: isOut ? "#C5221F" : isLow ? "#B06000" : "#121110" }}>
                            {p.totalStock ?? 15}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${p.isActive ? "green" : "red"}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--adm-text-muted)", whiteSpace: "nowrap" }}>
                          {new Date(p.createdAt || Date.now()).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="admin-btn-secondary"
                              style={{ padding: "4px 10px", fontSize: "12px" }}
                            >
                              Edit
                            </Link>
                            <button
                              className="admin-icon-button"
                              style={{ width: "28px", height: "28px" }}
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination matching reference image */}
            <div className="admin-pagination">
              <span style={{ fontSize: "12.5px", color: "var(--adm-text-muted)" }}>
                Showing 1 to 5 of {products.length} products
              </span>
              <div className="admin-pagination-pages">
                <button className="admin-page-number">‹</button>
                <button className="admin-page-number active">1</button>
                <button className="admin-page-number">2</button>
                <button className="admin-page-number">3</button>
                <button className="admin-page-number">4</button>
                <button className="admin-page-number">5</button>
                <span style={{ padding: "0 4px", color: "var(--adm-text-muted)" }}>...</span>
                <button className="admin-page-number">›</button>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel matching reference image */}
          <div className="admin-quick-actions-card">
            <h4 className="admin-quick-actions-title">Quick Actions</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/admin/products/new" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Plus size={15} /> Add Product
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/orders" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Package size={15} /> Manage Orders
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/customers" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={15} /> View Customers
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/reviews?status=pending" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Star size={15} /> Pending Reviews ({stats.pendingReviewsCount})
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/payments/settings" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={15} /> Payment Settings
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/shipping" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Truck size={15} /> Shipping Partners
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/admin-users" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={15} /> Admin Users
                </span>
                <span>›</span>
              </Link>

              <Link href="/admin/settings" className="admin-quick-action-btn">
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Settings size={15} /> General Settings
                </span>
                <span>›</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Tabs previews */}
      {activeTab === "Customers" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Registered Customers</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Overview of customer directories & lifetime spend</p>
            </div>
            <Link href="/admin/customers" className="admin-btn-primary admin-btn-sm">
              View All Customers →
            </Link>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--adm-text-secondary)" }}>
            Jump into the full Customer Management suite to inspect accounts, view order frequencies, and manage user statuses.
          </p>
        </div>
      )}

      {activeTab === "Reviews" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Customer Reviews Moderation</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>7 reviews awaiting your approval before being displayed publicly</p>
            </div>
            <Link href="/admin/reviews" className="admin-btn-primary admin-btn-sm">
              Moderate Reviews →
            </Link>
          </div>
          <p style={{ fontSize: "13.5px", color: "var(--adm-text-secondary)" }}>
            Reviews submitted on the storefront enter a pending state and do not appear on product pages until approved by an administrator.
          </p>
        </div>
      )}

      {activeTab === "Orders" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Order Operations & Fulfillment</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Track active customer shipments and payment status</p>
            </div>
            <Link href="/admin/orders" className="admin-btn-primary admin-btn-sm">
              Open Order Console →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "Payments" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Payment Gateways & Ledger</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Razorpay transaction records, refunds, and gateway credentials</p>
            </div>
            <Link href="/admin/payments" className="admin-btn-primary admin-btn-sm">
              Manage Payments →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "Shipping & Logistics" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Courier Partners & Logistics</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Shiprocket, Delhivery, BlueDart, and VRL Logistics integrations</p>
            </div>
            <Link href="/admin/shipping" className="admin-btn-primary admin-btn-sm">
              Configure Shipping →
            </Link>
          </div>
        </div>
      )}

      {activeTab === "Admin Users" && (
        <div className="admin-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Team Roles & Access Control</h3>
              <p style={{ fontSize: "13px", color: "var(--adm-text-muted)" }}>Manage staff permissions and security settings</p>
            </div>
            <Link href="/admin/admin-users" className="admin-btn-primary admin-btn-sm">
              Manage Roles →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
