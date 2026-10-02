import React from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StoreProvider } from "@/components/store-context";
import { CartDrawer } from "@/components/ui/cart-drawer";
import { QuickViewModal } from "@/components/ui/quick-view-modal";
import { SearchModal } from "@/components/ui/search-modal";
import { Toast } from "@/components/ui/toast";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <CartDrawer />
        <QuickViewModal />
        <SearchModal />
        <Toast />
      </div>
    </StoreProvider>
  );
}
