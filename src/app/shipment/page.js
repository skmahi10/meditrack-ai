"use client";

import { useState } from "react";
import Link from "next/link";
import { shipments, telemetryData, blockchainBlocks, payments } from "@/lib/mockData";
import LiveMap from "@/components/dashboard/LiveMap";
import TelemetryCharts from "@/components/dashboard/TelemetryCharts";
import RiskGauge from "@/components/dashboard/RiskGauge";

export default function ShipmentDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // For now use first shipment as demo
  const shipment = shipments[0];
  const payment = payments.find((p) => p.shipmentId === shipment.shipmentId);
  const blocks = blockchainBlocks.filter((b) => b.shipmentId === shipment.shipmentId);

  const statusConfig = {
    "in-transit": { label: "In Transit", color: "var(--accent)", soft: "var(--accent-soft)" },
    "at-risk": { label: "At Risk", color: "var(--danger)", soft: "var(--danger-soft)" },
    delivered: { label: "Delivered", color: "var(--success)", soft: "var(--success-soft)" },
    created: { label: "Created", color: "var(--warning)", soft: "var(--warning-soft)" },
    failed: { label: "Failed", color: "var(--danger)", soft: "var(--danger-soft)" },
  };

  const status = statusConfig[shipment.status];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "telemetry", label: "Telemetry" },
    { id: "blockchain", label: "Blockchain" },
    { id: "documents", label: "Documents" },
  ];

  const timelineEvents = [
    {
      time: "08:00",
      date: "22 Apr",
      title: "Shipment Created",
      description: "Created by Serum Institute of India, Mumbai",
      color: "var(--accent)",
      icon: "\u{1F4E6}",
    },
    {
      time: "08:00",
      date: "22 Apr",
      title: "Payment Escrowed",
      description: "\u20B9125,000 held in escrow",
      color: "var(--warning)",
      icon: "\u{1F4B3}",
    },
    {
      time: "08:30",
      date: "22 Apr",
      title: "Picked Up by Carrier",
      description: "BlueDart Pharma Logistics, Mumbai",
      color: "var(--accent)",
      icon: "\u{1F69A}",
    },
    {
      time: "12:30",
      date: "22 Apr",
      title: "Checkpoint: Surat",
      description: "Temperature: -17.5\u00B0C \u2022 On schedule",
      color: "var(--success)",
      icon: "\u{2705}",
    },
    {
      time: "13:30",
      date: "22 Apr",
      title: "Temperature Breach",
      description: "Temperature rose to -5\u00B0C for 8 minutes. Cooling unit battery at 15%.",
      color: "var(--danger)",
      icon: "\u{26A0}\u{FE0F}",
    },
    {
      time: "14:30",
      date: "22 Apr",
      title: "Temperature Recovered",
      description: "Temperature returned to -14.2\u00B0C after backup cooling activated",
      color: "var(--success)",
      icon: "\u{2744}\u{FE0F}",
    },
    {
      time: "16:45",
      date: "22 Apr",
      title: "Checkpoint: Jaipur",
      description: "Temperature: -17.0\u00B0C \u2022 Minor delay resolved",
      color: "var(--success)",
      icon: "\u{2705}",
    },
    {
      time: "17:00",
      date: "22 Apr",
      title: "Risk Score Updated",
      description: "Risk dropped from 72% to 34% after recovery",
      color: "var(--accent)",
      icon: "\u{1F4C9}",
    },
  ];

  return (
    <div className="grid-bg" style={{ minHeight: "100vh" }}>
      {/* Top Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              transition: "color 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Dashboard
          </Link>
          <div style={{ width: "1px", height: "20px", background: "var(--border-subtle)" }} />
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {shipment.shipmentId}
          </span>
          <span
            className={`status-badge status-${shipment.status}`}
          >
            <span className={`pulse-dot pulse-dot-${shipment.status === "in-transit" ? "accent" : shipment.status === "at-risk" ? "danger" : "success"}`} style={{ width: "6px", height: "6px" }} />
            {status.label}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Priority:
          </span>
          <span
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "12px",
              fontWeight: 600,
              color: shipment.priority === "critical" ? "var(--danger)" : shipment.priority === "urgent" ? "var(--warning)" : "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {shipment.priority}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ paddingTop: "64px" }}>
        {/* Hero Info Section */}
        <div
          style={{
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "16px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {[
            { label: "Product", value: shipment.product, sub: shipment.productCategory + " \u2022 " + shipment.quantity + " units" },
            { label: "Route", value: shipment.origin.city + " \u2192 " + shipment.destination.city, sub: shipment.distanceTotal + " km \u2022 " + shipment.progress + "% complete" },
            { label: "Temperature", value: shipment.currentTemp + "\u00B0C", sub: "Range: " + shipment.tempRange.min + "\u00B0C to " + shipment.tempRange.max + "\u00B0C", valueColor: shipment.currentTemp > shipment.tempRange.max || shipment.currentTemp < shipment.tempRange.min ? "var(--danger)" : "var(--success)" },
            { label: "ETA", value: shipment.eta > 0 ? Math.floor(shipment.eta / 60) + "h " + (shipment.eta % 60) + "m" : "Delivered", sub: "Risk Score: " + shipment.riskScore + "%", valueColor: shipment.riskScore >= 60 ? "var(--danger)" : shipment.riskScore >= 35 ? "var(--warning)" : "var(--success)" },
          ].map((card, idx) => (
            <div
              key={idx}
              className={"bento-card animate-fade-in-delay-" + (idx + 1)}
              style={{ padding: "20px" }}
            >
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: card.valueColor || "var(--text-primary)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  marginBottom: "6px",
                }}
              >
                {card.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {card.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            padding: "0 32px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "4px",
              borderBottom: "1px solid var(--border-subtle)",
              marginBottom: "24px",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 20px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "var(--accent)" : "var(--text-secondary)",
                  borderBottom: activeTab === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                  transition: "all 0.2s ease",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div
          style={{
            padding: "0 32px 40px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
              {/* Left — Map + Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Map */}
                <div className="bento-card animate-fade-in" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Live Tracking
                  </h3>
                  <LiveMap selectedShipment={shipment} />
                </div>

                {/* Timeline */}
                <div className="bento-card animate-fade-in-delay-1" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 20px 0",
                    }}
                  >
                    Shipment Timeline
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {timelineEvents.map((event, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "16px",
                          position: "relative",
                          paddingBottom: idx < timelineEvents.length - 1 ? "24px" : "0",
                        }}
                      >
                        {/* Vertical line */}
                        {idx < timelineEvents.length - 1 && (
                          <div
                            style={{
                              position: "absolute",
                              left: "15px",
                              top: "32px",
                              bottom: "0",
                              width: "2px",
                              background: "var(--border-subtle)",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "var(--bg-elevated)",
                            border: "2px solid " + event.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            flexShrink: 0,
                            zIndex: 1,
                          }}
                        >
                          {event.icon}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, paddingTop: "2px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-ibm)",
                                fontSize: "13px",
                                fontWeight: 500,
                                color: "var(--text-primary)",
                              }}
                            >
                              {event.title}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-ibm)",
                                fontSize: "11px",
                                color: "var(--text-muted)",
                                whiteSpace: "nowrap",
                                marginLeft: "12px",
                              }}
                            >
                              {event.time} \u2022 {event.date}
                            </span>
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--font-ibm)",
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                              margin: 0,
                              lineHeight: 1.5,
                            }}
                          >
                            {event.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Risk Gauge */}
                <div className="bento-card animate-fade-in-delay-2" style={{ padding: "20px" }}>
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
                  <RiskGauge shipment={shipment} />
                </div>

                {/* AI Recommendation */}
                <div className="bento-card animate-fade-in-delay-3" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
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
                    {shipment.aiRecommendation}
                  </p>
                </div>

                {/* Payment Status */}
                {payment && (
                  <div className="bento-card animate-fade-in-delay-4" style={{ padding: "20px" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0 0 16px 0",
                      }}
                    >
                      Payment
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { label: "Amount", value: "\u20B9" + payment.amount.toLocaleString("en-IN") },
                        { label: "Status", value: payment.status.replace("-", " "), isStatus: true },
                        { label: "Payer", value: payment.payerName },
                        { label: "Payee", value: payment.payeeName },
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
                          {row.isStatus ? (
                            <span
                              style={{
                                fontFamily: "var(--font-ibm)",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: payment.status === "released" ? "var(--success)" : payment.status === "disputed" ? "var(--danger)" : "var(--warning)",
                                textTransform: "capitalize",
                              }}
                            >
                              {row.value}
                            </span>
                          ) : (
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
                          )}
                        </div>
                      ))}

                      {/* Conditions */}
                      <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                        <div
                          style={{
                            fontFamily: "var(--font-ibm)",
                            fontSize: "11px",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "8px",
                          }}
                        >
                          Release Conditions
                        </div>
                        {Object.entries(payment.conditions).map(([key, met]) => (
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "4px 0",
                            }}
                          >
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "4px",
                                background: met ? "var(--success-soft)" : "var(--bg-elevated)",
                                border: met ? "1px solid var(--success)" : "1px solid var(--border-subtle)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {met && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                                  <path d="M2 5l2 2 4-4" />
                                </svg>
                              )}
                            </div>
                            <span
                              style={{
                                fontFamily: "var(--font-ibm)",
                                fontSize: "12px",
                                color: met ? "var(--text-primary)" : "var(--text-muted)",
                              }}
                            >
                              {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Batch Info */}
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
                    Batch Details
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Batch Number", value: shipment.batchNumber },
                      { label: "Category", value: shipment.productCategory },
                      { label: "Quantity", value: shipment.quantity + " units" },
                      { label: "Created", value: new Date(shipment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                      { label: "Carrier", value: "BlueDart Pharma Logistics" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                          {row.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telemetry Tab */}
          {activeTab === "telemetry" && (
            <div className="bento-card animate-fade-in" style={{ padding: "24px" }}>
              <TelemetryCharts shipment={shipment} />
            </div>
          )}

          {/* Blockchain Tab */}
          {activeTab === "blockchain" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Chain Status */}
              <div
                className="bento-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--success-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--success)" }}>
                      Chain Integrity: VALID
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                      All {blocks.length} blocks verified \u2022 No tampering detected
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                  SHA-256 Hash Chain
                </div>
              </div>

              {/* Blocks */}
              {blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bento-card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Block Number */}
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: block.eventType === "TEMP_VIOLATION" ? "var(--danger-soft)" : "var(--accent-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "16px",
                        fontWeight: 700,
                        color: block.eventType === "TEMP_VIOLATION" ? "var(--danger)" : "var(--accent)",
                      }}
                    >
                      #{block.blockNumber}
                    </span>
                  </div>

                  {/* Block Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-ibm)",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {block.eventType.replace(/_/g, " ")}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {block.verified && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11px",
                              color: "var(--success)",
                              fontFamily: "var(--font-ibm)",
                              fontWeight: 500,
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hash info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", minWidth: "60px" }}>
                          Hash
                        </span>
                        <code
                          style={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "var(--accent)",
                            background: "var(--accent-soft)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {block.hash}
                        </code>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", minWidth: "60px" }}>
                          Prev Hash
                        </span>
                        <code
                          style={{
                            fontFamily: "monospace",
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            background: "var(--bg-elevated)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {block.prevHash}
                        </code>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div style={{ marginTop: "6px", fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                      {new Date(block.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="animate-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Incident Report */}
              <div className="bento-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--danger-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M9 2L2 16h14L9 2zM9 7v4M9 13h.01" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Incident Report
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                      AI-generated by Gemini
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {shipment.incidentReport || "No incidents recorded for this shipment. All parameters remained within acceptable ranges throughout transit."}
                </p>
              </div>

              {/* Compliance Report */}
              <div className="bento-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "var(--success-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M5 9l3 3 5-5" />
                      <rect x="2" y="2" width="14" height="14" rx="2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                      Compliance Report
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                      Generated on delivery
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    margin: 0,
                    whiteSpace: "pre-line",
                  }}
                >
                  {shipment.complianceReport || "Compliance report will be generated automatically upon delivery confirmation. The report will include temperature adherence, transit time analysis, incident history, and blockchain verification summary."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}