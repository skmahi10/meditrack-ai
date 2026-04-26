"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useNotifications } from "@/lib/useFirestore";


const severityConfig = {
  critical: { label: "Critical", color: "var(--danger)", soft: "var(--danger-soft)", icon: "\u{1F6A8}" },
  warning: { label: "Warning", color: "var(--warning)", soft: "var(--warning-soft)", icon: "\u{26A0}\u{FE0F}" },
  info: { label: "Info", color: "var(--accent)", soft: "var(--accent-soft)", icon: "\u{2139}\u{FE0F}" },
};

const typeConfig = {
  alert: { label: "Alert", icon: "\u{1F514}" },
  email: { label: "Email", icon: "\u{1F4E7}" },
  system: { label: "System", icon: "\u{2699}\u{FE0F}" },
  payment: { label: "Payment", icon: "\u{1F4B3}" },
};

export default function NotificationsPage() {
  const { user } = useUser();
  const { notifications: firebaseNotifs, loading } = useNotifications(user?.id);
  const [filter, setFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const items = firebaseNotifs;

  const filtered = items.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (severityFilter !== "all" && n.severity !== severityFilter) return false;
    return true;
  });

  const unreadCount = items.filter((n) => !n.read).length;
  const criticalCount = items.filter((n) => n.severity === "critical").length;

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return diffDays + "d ago";
    if (diffHours > 0) return diffHours + "h ago";
    if (diffMins > 0) return diffMins + "m ago";
    return "Just now";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)" }}>Loading notifications...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>Notifications</h1>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            {unreadCount} unread {"\u2022"} {criticalCount} critical
            {firebaseNotifs.length > 0 ? " \u2022 Live from Firebase" : " \u2022 Demo data"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {[
          { label: "Total", value: items.length, color: "var(--accent)", icon: "\u{1F4EC}" },
          { label: "Unread", value: unreadCount, color: "var(--warning)", icon: "\u{1F4E8}" },
          { label: "Critical", value: criticalCount, color: "var(--danger)", icon: "\u{1F6A8}" },
          { label: "Emails", value: items.filter((n) => n.type === "email").length, color: "var(--success)", icon: "\u{1F4E7}" },
        ].map((stat, idx) => (
          <div key={idx} className="bento-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "22px" }}>{stat.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-subtle)" }}>
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread (" + unreadCount + ")" },
            { id: "read", label: "Read" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} style={{ padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: filter === tab.id ? 600 : 400, color: filter === tab.id ? "var(--accent)" : "var(--text-secondary)", borderBottom: filter === tab.id ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: "-1px" }}>
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { id: "all", label: "All" },
            { id: "critical", label: "Critical" },
            { id: "warning", label: "Warning" },
            { id: "info", label: "Info" },
          ].map((sev) => {
            const config = severityConfig[sev.id];
            return (
              <button key={sev.id} onClick={() => setSeverityFilter(sev.id)} style={{ padding: "6px 12px", borderRadius: "8px", border: severityFilter === sev.id ? "1.5px solid " + (config?.color || "var(--accent)") : "1px solid var(--border-subtle)", background: severityFilter === sev.id ? (config?.soft || "var(--accent-soft)") : "transparent", color: severityFilter === sev.id ? (config?.color || "var(--accent)") : "var(--text-secondary)", fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, cursor: "pointer" }}>
                {sev.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map((notif) => {
          const severity = severityConfig[notif.severity] || severityConfig.info;
          const type = typeConfig[notif.type] || typeConfig.system;
          return (
            <div key={notif.id} className="bento-card" style={{ padding: 0, overflow: "hidden", borderLeft: notif.read ? "3px solid transparent" : "3px solid " + severity.color }}>
              <div style={{ padding: "18px 24px", display: "flex", gap: "16px", background: notif.read ? "transparent" : severity.soft }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: notif.read ? "var(--bg-elevated)" : severity.color + "20", border: "1px solid " + (notif.read ? "var(--border-subtle)" : severity.color + "30"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {severity.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: notif.read ? 400 : 600, color: "var(--text-primary)" }}>{notif.title}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", background: severity.soft, color: severity.color, fontFamily: "var(--font-ibm)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>{severity.label}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", background: "var(--bg-elevated)", color: "var(--text-muted)", fontFamily: "var(--font-ibm)", fontSize: "10px", fontWeight: 500 }}>{type.icon} {type.label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "12px" }}>{getTimeAgo(notif.timestamp)}</span>
                  </div>
                  <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px 0" }}>{notif.message}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {notif.shipmentId && (
                      <span style={{ padding: "3px 10px", borderRadius: "6px", background: "var(--accent-soft)", color: "var(--accent)", fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, cursor: "pointer" }} onClick={() => window.location.href = "/shipment?id=" + notif.shipmentId}>
                        {notif.shipmentId}
                      </span>
                    )}
                    {notif.emailSentTo && (
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                        {"\u{1F4E7}"} {notif.emailSentTo} {notif.emailStatus === "sent" ? "\u2713" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bento-card" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F514}"}</div>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>No notifications</div>
            <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>{filter === "unread" ? "All caught up!" : "No notifications match this filter."}</p>
          </div>
        )}
      </div>
    </div>
  );
}