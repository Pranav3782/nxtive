"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FolderTree, Plus, ExternalLink, Edit2, Check, Info } from "lucide-react";
import { getAdminCategories, saveCategory } from "@/features/admin-dashboard/server/actions";
import type { Category } from "@/types/product";
import { slugify } from "@/utils/slugify";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openNewModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setTitle("");
    setTagline("");
    setImage("/images/nxtvie/cat-tshirts.jpg");
    setSortOrder(categories.length + 1);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setTitle(cat.title);
    setTagline(cat.tagline || "");
    setImage(cat.image);
    setSortOrder(cat.sortOrder || 1);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCategory({
        id: editingCategory?.id,
        name,
        slug: slug || slugify(name),
        title: title || name,
        tagline,
        image: image || "/images/nxtvie/cat-tshirts.jpg",
        sortOrder: Number(sortOrder),
        isActive: true,
      });
      setShowModal(false);
      await loadCategories();
    } catch (err) {
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="admin-panel" style={{ marginBottom: "24px" }}>
        <div className="admin-panel-header">
          <div className="admin-panel-title-wrap">
            <h3>Apparel Categories &amp; Collections</h3>
            <p>Define product taxonomy, hero photography, and customer navigational taxonomy</p>
          </div>
          <button type="button" onClick={openNewModal} className="admin-action-btn-primary">
            <Plus size={16} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            style={{
              backgroundColor: "var(--adm-card)",
              border: "1px solid var(--adm-border)",
              borderRadius: "14px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Image Preview Banner */}
            <div style={{ height: "140px", position: "relative", backgroundColor: "#141312" }}>
              <img
                src={cat.image}
                alt={cat.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, transparent 40%, rgba(10, 10, 10, 0.9) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "16px",
                  right: "16px",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FBF9F5" }}>{cat.name}</h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--adm-gold)", fontFamily: "var(--adm-font-mono)" }}>
                    /categories/{cat.slug}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    color: "#34D399",
                  }}
                >
                  Active
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--adm-text)" }}>
                  {cat.title}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--adm-text-muted)", marginTop: "4px", lineHeight: 1.4 }}>
                  {cat.tagline || "Curated silhouettes for everyday wear."}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--adm-border)",
                }}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  target="_blank"
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--adm-text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  <span>View in Store</span>
                  <ExternalLink size={13} />
                </Link>

                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="admin-action-btn-secondary"
                  style={{ fontSize: "0.75rem", padding: "5px 10px" }}
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--adm-text)" }}>
                {editingCategory ? `Edit: ${editingCategory.name}` : "Create Category"}
              </h3>
              <button onClick={() => setShowModal(false)} className="admin-icon-btn">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    Category Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Knitwear"
                    required
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">URL Slug</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="knitwear"
                    className="admin-input"
                    style={{ fontFamily: "var(--adm-font-mono)", fontSize: "0.85rem" }}
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Display Heading</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Textured Knit Silhouettes"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Tagline / Subtext</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Crafted from tactile carded yarns"
                    className="admin-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Banner Image URL</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="/images/nxtvie/cat-tshirts.jpg"
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="admin-action-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-action-btn-primary"
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
