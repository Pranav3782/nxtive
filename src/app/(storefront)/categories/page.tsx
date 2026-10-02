import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CATEGORIES_LIST, MOCK_PRODUCTS } from "@/constants/mock-products";

export const metadata: Metadata = {
  title: "Categories & Collections — NXTVIE Menswear",
  description: "Explore all NXTVIE collections: Men, New Arrivals, Heavyweight Tees, Hoodies, Technical Jackets, and Accessories.",
};

export default function CategoriesIndexPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-sand)", minHeight: "85vh", padding: "48px 0 90px 0" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#936037",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Editorial Catalog
          </span>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              color: "#111110",
              marginBottom: "12px",
            }}
          >
            All Collections & Categories
          </h1>
          <p style={{ fontSize: "14.5px", color: "#6A645C", maxWidth: "560px", margin: "0 auto" }}>
            Explore each curated chapter of the NXTVIE wardrobe. Architectural fits, heavyweight organic cottons, and minimal silhouettes.
          </p>
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {CATEGORIES_LIST.map((category) => {
            const count = MOCK_PRODUCTS.filter(
              (p) =>
                p.category.toLowerCase() === category.slug ||
                p.category.toLowerCase().replace(/\s+/g, "-") === category.slug ||
                p.collections.includes(category.slug)
            ).length;

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                style={{
                  position: "relative",
                  height: "360px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "28px",
                  color: "#FFFFFF",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                className="category-card-hover"
              >
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(17,17,16,0.85) 0%, rgba(17,17,16,0.3) 50%, rgba(17,17,16,0.1) 100%)",
                  }}
                />

                <div style={{ position: "relative", zIndex: 10 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#C59B74",
                      marginBottom: "6px",
                    }}
                  >
                    {count > 0 ? `${count} Pieces` : "Curated Capsule"}
                  </div>

                  <h3
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.15,
                      marginBottom: "6px",
                    }}
                  >
                    {category.name}
                  </h3>

                  <p
                    style={{
                      fontSize: "12.5px",
                      color: "#D6D1C9",
                      lineHeight: 1.45,
                      marginBottom: "14px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {category.tagline}
                  </p>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    <span>Shop Category</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
