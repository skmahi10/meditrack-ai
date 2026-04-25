"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Chatbot from "@/components/shared/Chatbot";

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="grid-bg" style={{ minHeight: "100vh" }}>
      <Sidebar onCollapse={setSidebarCollapsed} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        style={{
          marginLeft: sidebarCollapsed ? "72px" : "260px",
          paddingTop: "72px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          minHeight: "100vh",
        }}
      >
        <div style={{ padding: "28px 32px", maxWidth: "1600px" }}>
          {children}
        </div>
      </main>
      <Chatbot />
    </div>
  );
}