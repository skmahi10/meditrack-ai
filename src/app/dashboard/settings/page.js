"use client";

import { useState } from "react";
import { currentUser } from "@/lib/mockData";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState({
    name: currentUser.name,
    email: currentUser.email,
    organization: currentUser.organization,
    location: currentUser.location,
    role: currentUser.role,
  });
  const [thresholds, setThresholds] = useState({
    tempMin: -20,
    tempMax: -15,
    riskAlert: 60,
    delayAlert: 30,
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true,
    criticalOnly: false,
    paymentUpdates: true,
    deliveryConfirmation: true,
    dailyDigest: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        background: checked ? "var(--accent)" : "var(--bg-elevated)",
        border: checked ? "none" : "1.5px solid var(--border-subtle)",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: "3px",
          left: checked ? "23px" : "3px",
          transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
            Settings
          </h1>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Profile, thresholds, notifications, and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            background: saved ? "var(--success)" : "var(--accent)",
            color: "#fff",
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.3s ease",
            boxShadow: saved ? "0 0 16px var(--success-glow)" : "0 4px 16px var(--accent-glow)",
          }}
        >
          {saved ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8l4 4 6-6" />
              </svg>
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* Profile Section */}
      <div className="bento-card animate-fade-in" style={{ padding: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
          Profile
        </h2>

        <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, var(--accent), #8B83FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: "var(--font-outfit)",
                fontSize: "28px",
                fontWeight: 700,
                boxShadow: "0 0 24px var(--accent-glow)",
              }}
            >
              {profile.name.charAt(0)}
            </div>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "8px",
                background: "var(--success-soft)",
                color: "var(--success)",
                fontFamily: "var(--font-ibm)",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Trust: {currentUser.trustScore}%
            </span>
          </div>

          {/* Fields */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              { label: "Full Name", key: "name", placeholder: "Dr. Priya Sharma" },
              { label: "Email", key: "email", placeholder: "you@org.com", type: "email" },
              { label: "Organization", key: "organization", placeholder: "Apollo Hospital" },
              { label: "Location", key: "location", placeholder: "New Delhi" },
            ].map((field) => (
              <div key={field.key}>
                <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  value={profile[field.key]}
                  onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Role display */}
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>Role: </span>
            <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, color: "var(--accent)", textTransform: "capitalize" }}>
              {profile.role}
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
            Role changes require admin approval
          </span>
        </div>
      </div>

      {/* Appearance */}
      <div className="bento-card animate-fade-in-delay-1" style={{ padding: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
          Appearance
        </h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            borderRadius: "12px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "22px" }}>
              {theme === "dark" ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </div>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                {theme === "dark" ? "Optimized for low-light environments" : "Bright interface for daytime use"}
              </div>
            </div>
          </div>
          <Toggle checked={theme === "dark"} onChange={toggleTheme} />
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="bento-card animate-fade-in-delay-2" style={{ padding: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
          Alert Thresholds
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[
            { label: "Min Temperature (\u00B0C)", key: "tempMin", min: -30, max: 0, color: "var(--accent)" },
            { label: "Max Temperature (\u00B0C)", key: "tempMax", min: -25, max: 25, color: "var(--danger)" },
            { label: "Risk Alert Threshold (%)", key: "riskAlert", min: 0, max: 100, color: "var(--warning)" },
            { label: "Delay Alert (minutes)", key: "delayAlert", min: 5, max: 120, color: "var(--warning)" },
          ].map((field) => (
            <div key={field.key}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <label style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>
                  {field.label}
                </label>
                <span style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 700, color: field.color }}>
                  {thresholds[field.key]}
                </span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                value={thresholds[field.key]}
                onChange={(e) => setThresholds((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  appearance: "none",
                  background: "var(--bg-elevated)",
                  outline: "none",
                  cursor: "pointer",
                  accentColor: field.color,
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)" }}>{field.min}</span>
                <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)" }}>{field.max}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bento-card animate-fade-in-delay-3" style={{ padding: "28px" }}>
        <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
          Notification Preferences
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {[
            { key: "emailAlerts", label: "Email Alerts", description: "Receive email notifications for critical events" },
            { key: "criticalOnly", label: "Critical Only", description: "Only notify for critical severity events" },
            { key: "paymentUpdates", label: "Payment Updates", description: "Get notified when payment status changes" },
            { key: "deliveryConfirmation", label: "Delivery Confirmation", description: "Alert when shipments are delivered" },
            { key: "dailyDigest", label: "Daily Digest", description: "Receive a daily summary email at 8:00 AM" },
          ].map((pref) => (
            <div
              key={pref.key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "8px",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {pref.label}
                </div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {pref.description}
                </div>
              </div>
              <Toggle
                checked={notifPrefs[pref.key]}
                onChange={() => setNotifPrefs((prev) => ({ ...prev, [pref.key]: !prev[pref.key] }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="bento-card animate-fade-in-delay-4"
        style={{
          padding: "28px",
          borderColor: "rgba(255, 71, 87, 0.15)",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--danger)", margin: "0 0 16px 0" }}>
          Danger Zone
        </h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
              Sign Out
            </div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Sign out of your MediTrack AI account
            </div>
          </div>
          <button
            onClick={() => {
              if (window.Clerk) {
                window.Clerk.signOut().then(() => {
                  window.location.href = "/login";
                });
              } else {
                window.location.href = "/login";
              }
            }}
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              border: "1px solid var(--danger)",
              background: "transparent",
              color: "var(--danger)",
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger-soft)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}