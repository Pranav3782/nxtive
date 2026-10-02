import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F3ED" }}>
      {children}
    </div>
  );
}
