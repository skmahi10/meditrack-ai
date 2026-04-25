// src/components/dashboard/ControlTower.jsx
"use client";

import { useState } from "react";
import { shipments, dashboardStats, notifications } from "@/lib/mockData";
import ShipmentTable from "./ShipmentTable";
import RiskGauge from "./RiskGauge";
import TelemetryCharts from "./TelemetryCharts";

const statCards = [
  {
    label: "Active Shipments",
    value: dashboardStats.activeShipments,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l8-4 8 4v8l-8 4-8-4V7z" />
        <path d="M3 7l8 4M11 21V11M19 7l-8 4" />
      </svg>
    ),
    color: "var(--accent)",
    glow: "var(--accent-glow)",
    soft: "var(--accent-soft)",
  },
  {
    label: "At Risk",
    value: dashboardStats.atRiskShipments,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 2L2 20h18L11 2z" />
        <path d="M11 9v4M11 16h.01" />
      </svg>
    ),
    color: "var(--danger)",
    glow: "var(--danger-glow)",
    soft: "var(--danger-soft)",
  },
  {
    label: "Delivered",
    value: dashboardStats.deliveredShipments,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l4 4 8-8" />
        <circle cx="11" cy="11" r="9" />
      </svg>
    ),
    color: "var(--success)",
    glow: "var(--success-glow)",
    soft: "var(--success-soft)",
  },
  {
    label: "Payments Held",
    value: `₹${(dashboardStats.totalPaymentsHeld / 1000).toFixed(0)}K`,
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="18" height="13" rx="2" />
        <path d="M2 9h18" />
        <path d="M7 14h3" />
      </svg>
    ),
    color: "var(--warning)",
    glow: "var(--warning-glow)",
    soft: "var(--warning-soft)",
  },
];

export default function ControlTower() {
  const [selectedShipment, setSelectedShipment] = useState(shipments[0]);

  const activeShipments = shipments.filter((s) => s.status !== "delivered");
  const unreadAlerts = notifications.filter((n) => !n.read && n.severity === "critical");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Critical Alert Banner */}
      {unreadAlerts.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            background: "var(--danger-soft)",
            border: "1px solid rgba(255, 71, 87, 0.25)",
            borderRadius: "12px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div className="pulse-dot pulse-dot-danger" />
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--danger)",
              }}
            >
              CRITICAL ALERT:
            </span>
            <span
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                color: "var(--text-primary)",
                marginLeft: "8px",
              }}
            >
              {unreadAlerts[0].title} — {unreadAlerts[0].message.slice(0, 100)}...
            </span>
          </div>
          <button
            onClick={() => window.location.href = "/shipment"}
            style={{
              background: "var(--danger)",
              color: "#fff",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              fontFamily: "var(--font-ibm)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            View Details
          </button>
        </div>
      )}

      {/* Stat Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
        }}
      >
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            className={`bento-card animate-fade-in-delay-${idx + 1}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: card.soft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 0 20px ${card.glow}`,
              }}
            >
              {card.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "4px",
                  letterSpacing: "0.02em",
                }}
              >
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Bento Grid — 3 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 340px",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* Left Column — Shipment Table (spans 2 cols) */}
        <div
          className="bento-card animate-fade-in-delay-2"
          style={{
            gridColumn: "1 / 3",
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Live Shipments
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  margin: "2px 0 0 0",
                }}
              >
                {activeShipments.length} active · {shipments.length} total
              </p>
            </div>
            <button
              onClick={() => alert("Create Shipment modal coming soon — will connect to Mahi's /api/simulation endpoint")}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "var(--font-ibm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 2v10M2 7h10" />
              </svg>
              New Shipment
            </button>
          </div>
          <ShipmentTable
            shipments={shipments}
            selectedId={selectedShipment?.id}
            onSelect={setSelectedShipment}
          />
        </div>

        {/* Right Column — Risk Gauge + Alerts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Risk Gauge */}
          <div className="bento-card animate-fade-in-delay-3" style={{ padding: "20px" }}>
            <h3
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 16px 0",
              }}
            >
              Risk Assessment
            </h3>
            <RiskGauge shipment={selectedShipment} />
          </div>

          {/* AI Recommendation */}
          <div className="bento-card animate-fade-in-delay-4" style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="3" />
                  <path d="M7 1v2M7 11v2M1 7h2M11 7h2" />
                </svg>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                AI Recommendation
              </h3>
            </div>
            <p
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {selectedShipment?.aiRecommendation || "Select a shipment to view AI recommendation."}
            </p>
            {selectedShipment?.status === "at-risk" && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--danger-soft)",
                  border: "1px solid rgba(255, 71, 87, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div className="pulse-dot pulse-dot-danger" />
                <span
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "12px",
                    color: "var(--danger)",
                    fontWeight: 500,
                  }}
                >
                  Immediate action required
                </span>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bento-card animate-fade-in-delay-5" style={{ padding: "20px" }}>
            <h3
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 14px 0",
              }}
            >
              Shipment Info
            </h3>
            {selectedShipment ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  { label: "Product", value: selectedShipment.product },
                  { label: "Batch", value: selectedShipment.batchNumber },
                  { label: "Route", value: `${selectedShipment.origin.city} → ${selectedShipment.destination.city}` },
                  { label: "Temp Range", value: `${selectedShipment.tempRange.min}°C to ${selectedShipment.tempRange.max}°C` },
                  { label: "Progress", value: `${selectedShipment.progress}%` },
                  { label: "ETA", value: selectedShipment.eta > 0 ? `${Math.floor(selectedShipment.eta / 60)}h ${selectedShipment.eta % 60}m` : "Delivered" },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-ibm)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-ibm)",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Progress Bar */}
                <div style={{ marginTop: "4px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "6px",
                      borderRadius: "3px",
                      background: "var(--bg-elevated)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${selectedShipment.progress}%`,
                        height: "100%",
                        borderRadius: "3px",
                        background:
                          selectedShipment.status === "at-risk"
                            ? "var(--danger)"
                            : selectedShipment.status === "delivered"
                              ? "var(--success)"
                              : "var(--accent)",
                        transition: "width 0.6s ease",
                        boxShadow:
                          selectedShipment.status === "at-risk"
                            ? "0 0 10px var(--danger-glow)"
                            : selectedShipment.status === "delivered"
                              ? "0 0 10px var(--success-glow)"
                              : "0 0 10px var(--accent-glow)",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                Select a shipment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Telemetry Charts Row */}
      <div className="bento-card animate-fade-in-delay-3" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              Live Telemetry — {selectedShipment?.shipmentId || "No Selection"}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                color: "var(--text-muted)",
                margin: "2px 0 0 0",
              }}
            >
              Temperature · Humidity · Speed
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="pulse-dot pulse-dot-success" />
            <span
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                color: "var(--success)",
                fontWeight: 500,
              }}
            >
              Live
            </span>
          </div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <TelemetryCharts shipment={selectedShipment} />
        </div>
      </div>
    </div>
  );
}