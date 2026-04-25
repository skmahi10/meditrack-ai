"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Header({ sidebarCollapsed }) {
  const { user } = useUser();
  const [search, setSearch] = useState("");

  return (
    <header
      style={{
        height: "72px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--bg-primary)",
      }}
    >
      {/* Left */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            MediTrack AI
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Intelligent Cold Supply Chain Platform
          </p>
        </div>
      </div>

      {/* Center */}

      <div
        style={{
          flex: 1,
          maxWidth: "420px",
          margin: "0 40px",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shipments, reports, logistics..."
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: "12px",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-elevated)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        />
      </div>

      {/* Right */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {user?.fullName || "Dr. Priya Sharma"}
          </div>

          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            Operations Administrator
          </div>
        </div>

        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}