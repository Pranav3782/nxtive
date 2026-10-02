"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Filter,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
} from "@/features/admin-dashboard/server/actions";
import type { Review, ReviewStatus } from "@/types/review";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<Review | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await getAdminReviews({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() ? search.trim() : undefined,
      });
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReviews();
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await approveReview(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" as ReviewStatus } : r))
      );
    } catch {
      alert("Failed to approve review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModal) return;
    const id = rejectModal.id;
    setActionLoading(id);
    const reason = rejectReason.trim() || "Rejected by administrator";
    setRejectModal(null);
    setRejectReason("");
    try {
      await rejectReview(id, "Venkatesh", reason);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "rejected" as ReviewStatus, moderationNotes: reason } : r
        )
      );
    } catch {
      alert("Failed to reject review");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setActionLoading(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Failed to delete review");
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
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
            Review Management
          </h1>
          <p style={{ fontSize: "14px", color: "var(--adm-text-muted)", marginTop: "4px" }}>
            Customer submissions require administrative approval before displaying publicly on product pages
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "9999px",
              backgroundColor: "var(--adm-badge-amber-bg)",
              color: "var(--adm-badge-amber-text)",
              fontSize: "12.5px",
              fontWeight: 700,
            }}
          >
            {pendingCount} Pending Moderation
          </span>
        </div>
      </div>

      {/* Workflow Information Banner */}
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "10px",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--adm-border)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "var(--adm-text-secondary)",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "var(--adm-sand-pill)",
            color: "#121110",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "12px",
            flexShrink: 0,
          }}
        >
          ✓
        </div>
        <div>
          <strong>Quality Safeguard Active:</strong> Customer-submitted reviews remain in <code>pending</code> status and are hidden from the public storefront until verified and approved.
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="admin-card" style={{ marginBottom: "20px", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          {/* Status Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "all", label: "All Reviews" },
              { key: "pending", label: "Pending", count: pendingCount },
              { key: "approved", label: "Approved" },
              { key: "rejected", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: statusFilter === tab.key ? "#121110" : "var(--adm-border)",
                  backgroundColor: statusFilter === tab.key ? "#121110" : "#FFFFFF",
                  color: statusFilter === tab.key ? "#FFFFFF" : "var(--adm-text-secondary)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    style={{
                      fontSize: "10.5px",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      backgroundColor: statusFilter === tab.key ? "rgba(255,255,255,0.2)" : "var(--adm-badge-amber-bg)",
                      color: statusFilter === tab.key ? "#FFFFFF" : "var(--adm-badge-amber-text)",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearchSubmit} style={{ position: "relative", minWidth: "260px" }}>
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, apparel, or text..."
              className="admin-input"
              style={{ paddingLeft: "36px" }}
            />
          </form>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review Content</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--adm-text-muted)" }}>Loading customer reviews...</div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ color: "var(--adm-text-muted)" }}>No reviews found for this filter.</div>
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  let badgeClass = "amber";
                  if (r.status === "approved") badgeClass = "green";
                  else if (r.status === "rejected") badgeClass = "red";

                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={r.userAvatar || "/images/nxtvie/gallery-1.jpg"}
                            alt={r.userName}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid var(--adm-border-light)",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "13.5px", color: "#121110" }}>
                              {r.userName}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--adm-text-muted)" }}>
                              {r.verifiedBuyer ? "Verified Buyer" : "Guest"}
                              {r.sizePurchased && ` • Size ${r.sizePurchased}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {r.productImage && (
                            <img
                              src={r.productImage}
                              alt={r.productTitle}
                              style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }}
                            />
                          )}
                          <div style={{ fontWeight: 600, fontSize: "13px" }}>{r.productTitle}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", color: "#F2AC24" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < r.rating ? "#F2AC24" : "none"}
                              stroke="#F2AC24"
                            />
                          ))}
                        </div>
                      </td>
                      <td style={{ maxWidth: "320px" }}>
                        {r.title && <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "2px" }}>{r.title}</div>}
                        <div style={{ fontSize: "12.5px", color: "var(--adm-text-secondary)", lineHeight: 1.4 }}>
                          {r.comment}
                        </div>
                        {r.moderationNotes && (
                          <div style={{ fontSize: "11px", color: "#C5221F", marginTop: "4px" }}>
                            <em>Note: {r.moderationNotes}</em>
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: "12px", color: "var(--adm-text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <span className={`admin-badge ${badgeClass}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {r.status !== "approved" && (
                            <button
                              onClick={() => handleApprove(r.id)}
                              disabled={actionLoading === r.id}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "var(--adm-badge-green-bg)",
                                color: "var(--adm-badge-green-text)",
                                cursor: "pointer",
                              }}
                              title="Approve Review"
                            >
                              Approve
                            </button>
                          )}

                          {r.status !== "rejected" && (
                            <button
                              onClick={() => setRejectModal(r)}
                              disabled={actionLoading === r.id}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11.5px",
                                fontWeight: 700,
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "var(--adm-badge-red-bg)",
                                color: "var(--adm-badge-red-text)",
                                cursor: "pointer",
                              }}
                              title="Reject Review"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(r.id)}
                            className="admin-icon-button"
                            style={{ width: "28px", height: "28px", color: "var(--adm-text-muted)" }}
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <span style={{ fontSize: "12.5px", color: "var(--adm-text-muted)" }}>
            Showing {reviews.length} customer reviews
          </span>
        </div>
      </div>

      {/* Reject Moderation Modal */}
      {rejectModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(18, 17, 16, 0.45)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "var(--adm-shadow-dropdown)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "var(--adm-badge-red-bg)",
                  color: "var(--adm-badge-red-text)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 800 }}>Reject Customer Review</h3>
            </div>

            <p style={{ fontSize: "13px", color: "var(--adm-text-secondary)", marginBottom: "14px", lineHeight: 1.4 }}>
              Provide an internal moderation reason. The review will remain hidden from the storefront.
            </p>

            <div className="admin-form-group">
              <label className="admin-label">Reason / Notes</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Spam text, unrelated courier complaint, inappropriate language..."
                className="admin-textarea"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setRejectModal(null)}
                className="admin-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                style={{
                  padding: "9px 16px",
                  backgroundColor: "#C5221F",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
