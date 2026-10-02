"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowRight } from "lucide-react";
import { useStore } from "@/components/store-context";
import { useAuth } from "@/features/auth";
import { NxtvieLogo } from "./nxtvie-logo";

export function Header() {
  const { totalCartCount, wishlist, setIsCartOpen, setIsSearchOpen } = useStore();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Men", href: "/categories/men" },
    { label: "New Arrivals", href: "/categories/new-arrivals" },
    { label: "Clothing", href: "/categories/clothing" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "Collections", href: "/categories/collections" },
    { label: "Sale", href: "/categories/sale" },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? "rgba(245, 243, 237, 0.95)" : "var(--bg-sand)",
          backdropFilter: isScrolled ? "blur(12px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--border-light)" : "1px solid transparent",
          transition: "all 0.25s ease",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
            gap: "20px",
          }}
        >
          {/* Left: Mobile Menu Trigger + Brand Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: "none",
                color: "var(--text-dark)",
                padding: "6px",
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/" aria-label="NXTVIE Home">
              <NxtvieLogo size={24} color="#121110" />
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                style={{
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#1E1C1A",
                  letterSpacing: "0.01em",
                  transition: "color 0.2s ease, opacity 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Search Pill + Action Icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "var(--text-dark)",
            }}
            className="header-actions"
          >
            {/* Search Pill Input (Desktop) */}
            <div
              onClick={() => setIsSearchOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setIsSearchOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#EBE7DF",
                borderRadius: "9999px",
                padding: "7px 16px",
                width: "220px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              className="header-search-pill"
            >
              <Search size={15} color="#857F76" strokeWidth={2} />
              <span
                style={{
                  fontSize: "12.5px",
                  color: "#857F76",
                  fontWeight: 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  userSelect: "none",
                }}
              >
                Search for products...
              </span>
            </div>

            {/* Mobile Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products"
              style={{
                display: "none",
                color: "var(--text-dark)",
                padding: "6px",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="mobile-search-btn action-icon-btn"
            >
              <Search size={19} strokeWidth={1.8} />
            </button>

            {/* Profile Icon */}
            <Link
              href={user ? "/account" : "/login"}
              aria-label={user ? "My Account" : "Sign In"}
              style={{
                color: "var(--text-dark)",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
              className="action-icon-btn"
            >
              <User size={19} strokeWidth={1.8} />
            </Link>

            {/* Wishlist Heart Icon */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              style={{
                color: "var(--text-dark)",
                position: "relative",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
              className="action-icon-btn"
            >
              <Heart
                size={19}
                strokeWidth={1.8}
                fill={wishlist.length > 0 ? "var(--text-dark)" : "none"}
              />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "1px",
                    right: "1px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "var(--text-dark)",
                    color: "#FFFFFF",
                    fontSize: "9px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Bag Icon with Badge "0" matching reference */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              style={{
                color: "var(--text-dark)",
                position: "relative",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.2s ease",
              }}
              className="action-icon-btn"
            >
              <ShoppingBag size={19} strokeWidth={1.8} />
              <span
                style={{
                  position: "absolute",
                  top: "0px",
                  right: "-2px",
                  width: "15px",
                  height: "15px",
                  borderRadius: "50%",
                  backgroundColor: "var(--text-dark)",
                  color: "#FFFFFF",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer Content */}
          <div
            style={{
              position: "relative",
              width: "82%",
              maxWidth: "340px",
              height: "100%",
              backgroundColor: "var(--bg-sand)",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <NxtvieLogo size={22} color="#121110" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{ color: "var(--text-dark)", padding: "4px" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search */}
            <div
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#EBE7DF",
                borderRadius: "9999px",
                padding: "10px 16px",
                marginBottom: "24px",
                cursor: "pointer",
              }}
            >
              <Search size={16} color="#857F76" />
              <span style={{ fontSize: "13px", color: "#857F76" }}>
                Search for products...
              </span>
            </div>

            {/* Mobile Nav Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--text-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} color="#A39D95" />
                </Link>
              ))}
            </div>

            {/* Mobile Bottom Links */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "24px",
                borderTop: "1px solid var(--border-light)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "14px",
                  color: "var(--text-dark)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <User size={18} />
                <span>{user ? "My Account" : "Sign In / Register"}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .header-search-pill {
            display: none !important;
          }
          .mobile-search-btn {
            display: flex !important;
          }
        }
        @media (max-width: 480px) {
          .header-actions {
            gap: 6px !important;
          }
        }
        .nav-link:hover {
          color: #000000 !important;
          opacity: 0.75;
        }
        .action-icon-btn:hover {
          opacity: 0.7;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}
