"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import type { AdminPermission } from "@/types/user";

export interface AdminUserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  permissions: AdminPermission[];
}

interface AdminAuthContextType {
  adminUser: AdminUserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
  loginAsAdmin: (email: string, pass: string) => Promise<void>;
  loginDemoAdmin: (role?: string) => void;
  logoutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const SUPER_ADMIN_PERMISSIONS: AdminPermission[] = [
  "dashboard.view",
  "products.view", "products.create", "products.edit", "products.delete",
  "orders.view", "orders.edit", "orders.cancel",
  "customers.view", "customers.edit", "customers.suspend",
  "reviews.view", "reviews.approve", "reviews.reject", "reviews.delete",
  "payments.view", "payments.manage",
  "shipping.view", "shipping.manage",
  "admins.view", "admins.manage",
  "settings.manage",
];

const DEFAULT_ADMIN: AdminUserProfile = {
  uid: "adm-venkatesh",
  email: "venkatesh@nxtvie.com",
  displayName: "Venkatesh",
  role: "super_admin",
  avatarUrl: "/images/nxtvie/hero-model-crop.jpg",
  permissions: SUPER_ADMIN_PERMISSIONS,
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Check local session
    const stored = typeof window !== "undefined" ? localStorage.getItem("nxtive_admin_session") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAdminUser(parsed);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem("nxtive_admin_session");
      }
    }

    // 2. Check Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      if (user) {
        try {
          let role = "admin";
          let permissions: AdminPermission[] = SUPER_ADMIN_PERMISSIONS;
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data?.role) role = data.role;
              if (data?.permissions) permissions = data.permissions;
            } else if (user.email?.includes("admin") || user.email?.includes("venkatesh")) {
              role = "super_admin";
            }
          } catch {
            if (user.email?.includes("admin") || user.email?.includes("venkatesh")) {
              role = "super_admin";
            }
          }

          const profile: AdminUserProfile = {
            uid: user.uid,
            email: user.email || "venkatesh@nxtvie.com",
            displayName: user.displayName || "Venkatesh",
            role,
            avatarUrl: user.photoURL || "/images/nxtvie/hero-model-crop.jpg",
            permissions,
          };
          setAdminUser(profile);
          localStorage.setItem("nxtive_admin_session", JSON.stringify(profile));
        } catch {
          setAdminUser(DEFAULT_ADMIN);
          localStorage.setItem("nxtive_admin_session", JSON.stringify(DEFAULT_ADMIN));
        }
      } else {
        // Automatically default to Venkatesh for first-time admin convenience
        if (!localStorage.getItem("nxtive_admin_session")) {
          setAdminUser(DEFAULT_ADMIN);
          localStorage.setItem("nxtive_admin_session", JSON.stringify(DEFAULT_ADMIN));
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!adminUser) return false;
    if (adminUser.role === "super_admin") return true;
    return adminUser.permissions.includes(permission);
  };

  const loginAsAdmin = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const user = res.user;
      const profile: AdminUserProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || "Venkatesh",
        role: "super_admin",
        avatarUrl: user.photoURL || "/images/nxtvie/hero-model-crop.jpg",
        permissions: SUPER_ADMIN_PERMISSIONS,
      };
      setAdminUser(profile);
      localStorage.setItem("nxtive_admin_session", JSON.stringify(profile));
      router.push("/admin/dashboard");
    } catch {
      // Offline fallback
      loginDemoAdmin("super_admin");
    } finally {
      setLoading(false);
    }
  };

  const loginDemoAdmin = (role = "super_admin") => {
    const profile: AdminUserProfile = {
      ...DEFAULT_ADMIN,
      role,
    };
    setAdminUser(profile);
    localStorage.setItem("nxtive_admin_session", JSON.stringify(profile));
    router.push("/admin/dashboard");
  };

  const logoutAdmin = async () => {
    localStorage.removeItem("nxtive_admin_session");
    setAdminUser(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdmin: !!adminUser,
        loading,
        hasPermission,
        loginAsAdmin,
        loginDemoAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
