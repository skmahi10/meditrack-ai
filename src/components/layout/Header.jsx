"use client";

import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { notifications } from "@/lib/mockData";

export default function Header({ sidebarCollapsed }) {
  const { user } = useUser();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: "72px",
        position: "fixed",
        top: 0,
        right: 0,
        left: sidebarCollapsed ? "72px" : "260px",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "var(--bg-glass)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-subtle)",
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Left */}
      <div>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Control Tower
        </h1>
        <p
          style={{
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            color: "var(--text-muted)",
            margin: "2px 0 0 0",
            letterSpacing: "0.02em",
          }}
        >
          Real-time shipment monitoring &amp; risk intelligence
        </p>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            cursor: "text",
            minWidth: "200px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M14 14l-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search shipments..."
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              color: "var(--text-primary)",
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: "13px",
              width: "100%",
            }}
          />
          <kbd
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              background: "var(--bg-secondary)",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid var(--border-subtle)",
              fontFamily: "'IBM Plex Sans', sans-serif",
            }}
          >
            Ctrl+K
          </kbd>
        </div>

        {/* Notification Bell */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowNotifDropdown((prev) => !prev)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-glass)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 2a5 5 0 015 5c0 4.5 2 6 2 6H3s2-1.5 2-6a5 5 0 015-5z" />
              <path d="M8.5 17a1.5 1.5 0 003 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "var(--danger)",
                  border: "2px solid var(--bg-elevated)",
                  boxShadow: "0 0 8px var(--danger-glow)",
                  animation: "pulse 2s infinite",
                }}
              />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                right: 0,
                width: "360px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "14px",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                animation: "fadeSlideDown 0.2s ease",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  Notifications
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--danger)",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {unreadCount} unread
                </span>
              </div>
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {notifications.slice(0, 4).map((notif) => {
                  const severityColor =
                    notif.severity === "critical"
                      ? "var(--danger)"
                      : notif.severity === "warning"
                        ? "var(--warning)"
                        : "var(--accent)";
                  return (
                    <div
                      key={notif.id}
                      style={{
                        padding: "14px 20px",
                        borderBottom: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        gap: "12px",
                        background: notif.read ? "transparent" : "var(--accent-soft)",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-elevated)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.read
                          ? "transparent"
                          : "var(--accent-soft)";
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: severityColor,
                          boxShadow: "0 0 8px " + severityColor,
                          marginTop: "6px",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          {notif.title}
                        </div>
                        <div
                          style={{
                            fontFamily: "'IBM Plex Sans', sans-serif",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            lineHeight: 1.4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {notif.message}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            marginTop: "6px",
                            fontFamily: "'IBM Plex Sans', sans-serif",
                          }}
                        >
                          {new Date(notif.timestamp).toLocaleString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  padding: "12px 20px",
                  textAlign: "center",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                
                <a  href="/dashboard/notifications"
                  style={{
                    fontSize: "13px",
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {" View all notifications \u2192"}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Profile — Clerk UserButton */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                lineHeight: 1.2,
              }}
            >
              {user?.fullName || "User"}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--accent)",
                fontFamily: "'IBM Plex Sans', sans-serif",
              }}
            >
              {user?.primaryEmailAddress?.emailAddress || ""}
            </div>
          </div>
          <UserButton
            afterSignOutUrl="/login"
            appearance={{
              elements: {
                avatarBox: {
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                },
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}