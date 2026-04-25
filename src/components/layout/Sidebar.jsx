// src/components/layout/Sidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const navItems = [
  {
    label: "Control Tower",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="7" height="8" rx="1.5" />
        <rect x="11" y="2" width="7" height="5" rx="1.5" />
        <rect x="2" y="12" width="7" height="6" rx="1.5" />
        <rect x="11" y="9" width="7" height="9" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "AI & Optimization",
    href: "/dashboard/ai",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="3" />
        <path d="M10 2v3M10 15v3M2 10h3M15 10h3" />
        <path d="M4.93 4.93l2.12 2.12M12.95 12.95l2.12 2.12M4.93 15.07l2.12-2.12M12.95 7.05l2.12-2.12" />
      </svg>
    ),
  },
  {
    label: "Blockchain Ledger",
    href: "/dashboard/blockchain",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="2" width="14" height="5" rx="1" />
        <rect x="3" y="8" width="14" height="5" rx="1" />
        <rect x="3" y="14" width="14" height="4" rx="1" />
        <path d="M7 7v1M7 13v1" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="16" height="12" rx="2" />
        <path d="M2 8h16" />
        <path d="M6 12h3M13 12h1" />
      </svg>
    ),
  },
  {
    label: "Network",
    href: "/dashboard/network",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="5" r="2.5" />
        <circle cx="4" cy="15" r="2.5" />
        <circle cx="16" cy="15" r="2.5" />
        <path d="M10 7.5v2.5L4 12.5M10 10l6 2.5" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2a5 5 0 015 5c0 4.5 2 6 2 6H3s2-1.5 2-6a5 5 0 015-5z" />
        <path d="M8.5 17a1.5 1.5 0 003 0" />
      </svg>
    ),
    badge: 3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="2.5" />
        <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M3.87 3.87l1.41 1.41M14.72 14.72l1.41 1.41M3.87 16.13l1.41-1.41M14.72 5.28l1.41-1.41" />
      </svg>
    ),
  },
];

export default function Sidebar({ onCollapse })  {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "260px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "20px 16px" : "20px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minHeight: "72px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, var(--accent), #8B83FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 0 20px var(--accent-glow)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2L3 6v8l7 4 7-4V6l-7-4z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M10 10v8M10 10l7-4M10 10L3 6" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        {!collapsed && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              MediTrack
              <span style={{ color: "var(--accent)", marginLeft: "4px" }}>AI</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                fontFamily: "'IBM Plex Sans', sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Cold-Chain Intelligence
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: collapsed ? "12px 14px" : "10px 14px",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-soft)" : "transparent",
                border: isActive
                  ? "1px solid var(--border-glass)"
                  : "1px solid transparent",
                transition: "all 0.2s ease",
                position: "relative",
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "14px",
                fontWeight: isActive ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--accent-soft)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {item.badge && !collapsed && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: "var(--danger)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: "10px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
              {item.badge && collapsed && (
                <span
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--danger)",
                    boxShadow: "0 0 8px var(--danger-glow)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: collapsed ? "12px 14px" : "10px 14px",
            borderRadius: "10px",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            width: "100%",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-soft)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <span style={{ flexShrink: 0, display: "flex" }}>
            {theme === "dark" ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="4" />
                <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 10.5a7.5 7.5 0 01-10-7 7.5 7.5 0 1010 7z" />
              </svg>
            )}
          </span>
          {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => {
  setCollapsed((prev) => {
    const next = !prev;
    onCollapse?.(next);
    return next;
  });
}}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: collapsed ? "12px 14px" : "10px 14px",
            borderRadius: "10px",
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            cursor: "pointer",
            width: "100%",
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "14px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-soft)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <span
            style={{
              flexShrink: 0,
              display: "flex",
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.3s ease",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4l-6 6 6 6" />
            </svg>
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}