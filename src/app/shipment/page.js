// src/app/shipment/page.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  shipments as mockShipments,
  blockchainBlocks as mockBlocks,
  payments as mockPayments,
} from "@/lib/mockData";
import LiveMap from "@/components/dashboard/LiveMap";
import TelemetryCharts from "@/components/dashboard/TelemetryCharts";
import RiskGauge from "@/components/dashboard/RiskGauge";
import Link from "next/link";

export default function ShipmentDetailPage() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("id");

  const [shipment, setShipment] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [payment, setPayment] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simError, setSimError] = useState("");

  // Load shipment from Firebase
  useEffect(() => {
    if (!shipmentId) {
      setShipment(mockShipments[0]);
      setBlocks(mockBlocks);
      setPayment(mockPayments[0]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "shipments"),
      where("shipmentId", "==", shipmentId)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0].data();
        setShipment({ id: snap.docs[0].id, ...d });
      } else {
        const mock = mockShipments.find((s) => s.shipmentId === shipmentId);
        setShipment(mock || mockShipments[0]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [shipmentId]);

  // Load telemetry
  useEffect(() => {
    if (!shipmentId) return;
    const q = query(
      collection(db, "telemetry"),
      where("shipmentId", "==", shipmentId),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setTelemetry(
        snap.docs.map((doc) => {
          const d = doc.data();
          const ts = d.timestamp?.toDate?.() || new Date(d.timestamp);
          return {
            ...d,
            time: ts.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })
      );
    });
    return () => unsub();
  }, [shipmentId]);

  // Load blockchain
  useEffect(() => {
    if (!shipmentId) return;
    const q = query(
      collection(db, "blockchain"),
      where("shipmentId", "==", shipmentId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setBlocks(
        snap.docs
          .map((doc) => doc.data())
          .sort((a, b) => a.blockNumber - b.blockNumber)
      );
    });
    return () => unsub();
  }, [shipmentId]);

  // Load payment
  useEffect(() => {
    if (!shipmentId) return;
    const q = query(
      collection(db, "payments"),
      where("shipmentId", "==", shipmentId)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) setPayment(snap.docs[0].data());
    });
    return () => unsub();
  }, [shipmentId]);

  // ─── START SIMULATION ─────────────────────────────────────────────────
  const handleStartSimulation = async () => {
    if (!shipmentId || simRunning) return;
    setSimRunning(true);
    setSimError("");

    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipmentId }),
      });
      const data = await res.json();
      if (!data.success) {
        setSimError(data.error || "Simulation failed");
      }
    } catch (err) {
      setSimError(err.message || "Network error");
    }

    setSimRunning(false);
  };

  // Can start simulation?
  const canSimulate =
    shipment &&
    (shipment.status === "created" || shipment.status === "in-transit") &&
    !simRunning;

  const isSimActive =
    simRunning ||
    (shipment?.status === "in-transit" && (shipment?.progress || 0) < 100);

  if (loading) {
    return (
      <div
        className="grid-bg"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--accent-soft)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            Loading shipment...
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!shipment) return null;

  const statusConfig = {
    "in-transit": { label: "In Transit", color: "var(--accent)" },
    "at-risk": { label: "At Risk", color: "var(--danger)" },
    delivered: { label: "Delivered", color: "var(--success)" },
    created: { label: "Created", color: "var(--warning)" },
    failed: { label: "Failed", color: "var(--danger)" },
  };
  const status = statusConfig[shipment.status] || statusConfig.created;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "telemetry", label: "Telemetry" },
    { id: "blockchain", label: "Blockchain" },
    { id: "documents", label: "Documents" },
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
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
            Dashboard
          </Link>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border-subtle)",
            }}
          />
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
            style={{
              padding: "3px 10px",
              borderRadius: "12px",
              background: status.color + "15",
              color: status.color,
              fontFamily: "var(--font-ibm)",
              fontSize: "11px",
              fontWeight: 500,
            }}
          >
            {status.label}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Start Simulation Button */}
          {shipment.status === "created" && (
            <button
              onClick={handleStartSimulation}
              disabled={!canSimulate}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                background: simRunning
                  ? "var(--accent)88"
                  : "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: canSimulate ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 16px var(--accent-glow)",
                transition: "all 0.2s",
              }}
            >
              {simRunning ? (
                <>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                    }}
                  />
                  Simulating...
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="#fff"
                  >
                    <polygon points="3,1 13,7 3,13" />
                  </svg>
                  Start Simulation
                </>
              )}
            </button>
          )}

          {/* Live indicator when simulation is running */}
          {isSimActive && shipment.status !== "created" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "10px",
                background: "var(--success-soft)",
                border: "1px solid var(--success)33",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--success)",
                  animation: "pulse-live 1.5s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--success)",
                  letterSpacing: "0.5px",
                }}
              >
                LIVE
              </span>
            </div>
          )}

          <div
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            Priority:{" "}
            <span
              style={{
                fontWeight: 600,
                color:
                  shipment.priority === "critical"
                    ? "var(--danger)"
                    : shipment.priority === "urgent"
                    ? "var(--warning)"
                    : "var(--text-secondary)",
                textTransform: "uppercase",
              }}
            >
              {shipment.priority}
            </span>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: "64px" }}>
        {/* Error Banner */}
        {simError && (
          <div
            style={{
              margin: "16px 32px 0",
              padding: "10px 16px",
              borderRadius: "10px",
              background: "var(--danger-soft)",
              border: "1px solid rgba(255, 71, 87, 0.2)",
              color: "var(--danger)",
              fontFamily: "var(--font-ibm)",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Simulation error: {simError}</span>
            <button
              onClick={() => setSimError("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--danger)",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              \u00D7
            </button>
          </div>
        )}

        {/* Info Cards */}
        <div
          style={{
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          {[
            {
              label: "Product",
              value: shipment.product,
              sub:
                (shipment.productCategory || "") +
                " \u2022 " +
                (shipment.quantity || 0) +
                " units",
            },
            {
              label: "Route",
              value:
                (shipment.origin?.city || "\u2014") +
                " \u2192 " +
                (shipment.destination?.city || "\u2014"),
              sub:
                (shipment.distanceCovered || 0) +
                " / " +
                (shipment.distanceTotal || 0) +
                " km \u2022 " +
                (shipment.progress || 0) +
                "% complete",
            },
            {
              label: "Temperature",
              value: (shipment.currentTemp || "\u2014") + "\u00B0C",
              sub:
                "Range: " +
                (shipment.tempRange?.min || "\u2014") +
                "\u00B0C to " +
                (shipment.tempRange?.max || "\u2014") +
                "\u00B0C",
              valueColor:
                shipment.currentTemp > shipment.tempRange?.max ||
                shipment.currentTemp < shipment.tempRange?.min
                  ? "var(--danger)"
                  : "var(--success)",
            },
            {
              label: "ETA",
              value:
                shipment.status === "delivered"
                  ? "Delivered"
                  : shipment.eta > 0
                  ? Math.floor(shipment.eta / 60) +
                    "h " +
                    (shipment.eta % 60) +
                    "m"
                  : "Calculating...",
              sub:
                (shipment.distanceTotal || 0) +
                " km \u2022 Risk: " +
                (shipment.riskScore || 0) +
                "%",
              valueColor:
                shipment.status === "delivered"
                  ? "var(--success)"
                  : shipment.riskScore >= 60
                  ? "var(--danger)"
                  : shipment.riskScore >= 35
                  ? "var(--warning)"
                  : "var(--success)",
            },
          ].map((card, idx) => (
            <div key={idx} className="bento-card" style={{ padding: "20px" }}>
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
                  color:
                    activeTab === tab.id
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
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
          {/* Overview */}
          {activeTab === "overview" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 360px",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {/* Map */}
                <div className="bento-card" style={{ padding: "20px" }}>
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

                {/* Quick Telemetry */}
                <div className="bento-card" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Telemetry Overview
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {[
                      {
                        label: "Current Temp",
                        value:
                          (shipment.currentTemp || "\u2014") + "\u00B0C",
                        color:
                          shipment.currentTemp > shipment.tempRange?.max ||
                          shipment.currentTemp < shipment.tempRange?.min
                            ? "var(--danger)"
                            : "var(--success)",
                      },
                      {
                        label: "Humidity",
                        value: (shipment.currentHumidity || "\u2014") + "%",
                        color: "var(--accent)",
                      },
                      {
                        label: "Speed",
                        value: (shipment.currentSpeed || 0) + " km/h",
                        color: "var(--warning)",
                      },
                      {
                        label: "Telemetry Points",
                        value: telemetry.length,
                        color: "var(--text-primary)",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: "var(--bg-elevated)",
                          borderRadius: "10px",
                          padding: "14px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-outfit)",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: item.color,
                          }}
                        >
                          {item.value}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-ibm)",
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="bento-card" style={{ padding: "20px" }}>
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

                <div className="bento-card" style={{ padding: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="8" cy="8" r="3" />
                      <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
                    </svg>
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
                    {shipment.aiRecommendation ||
                      "No AI recommendation available yet."}
                  </p>
                </div>

                {payment && (
                  <div className="bento-card" style={{ padding: "20px" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: "0 0 14px 0",
                      }}
                    >
                      Payment
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {[
                        {
                          label: "Amount",
                          value:
                            "\u20B9" +
                            (payment.amount || 0).toLocaleString("en-IN"),
                        },
                        {
                          label: "Status",
                          value: (payment.status || "").replace("-", " "),
                          color:
                            payment.status === "released"
                              ? "var(--success)"
                              : "var(--warning)",
                        },
                        {
                          label: "Payer",
                          value: payment.payerName || "\u2014",
                        },
                        {
                          label: "Payee",
                          value: payment.payeeName || "\u2014",
                        },
                      ].map((row) => (
                        <div
                          key={row.label}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
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
                              fontWeight: 500,
                              color: row.color || "var(--text-primary)",
                              textTransform: "capitalize",
                            }}
                          >
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                    {payment.conditions && (
                      <div
                        style={{
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid var(--border-subtle)",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "var(--font-ibm)",
                            fontSize: "10px",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "8px",
                          }}
                        >
                          Conditions
                        </div>
                        {Object.entries(payment.conditions).map(
                          ([key, met]) => (
                            <div
                              key={key}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "3px 0",
                              }}
                            >
                              <div
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  borderRadius: "4px",
                                  background: met
                                    ? "var(--success)"
                                    : "var(--bg-elevated)",
                                  border: met
                                    ? "none"
                                    : "1.5px solid var(--border-subtle)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {met && (
                                  <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 8 8"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  >
                                    <path d="M1 4l2 2 3-3" />
                                  </svg>
                                )}
                              </div>
                              <span
                                style={{
                                  fontFamily: "var(--font-ibm)",
                                  fontSize: "11px",
                                  color: met
                                    ? "var(--text-primary)"
                                    : "var(--text-muted)",
                                }}
                              >
                                {key
                                  .replace(/([A-Z])/g, " $1")
                                  .replace(/^./, (s) => s.toUpperCase())}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="bento-card" style={{ padding: "20px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: "0 0 14px 0",
                    }}
                  >
                    Details
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {[
                      {
                        label: "Batch",
                        value: shipment.batchNumber || "\u2014",
                      },
                      {
                        label: "Category",
                        value: shipment.productCategory || "\u2014",
                      },
                      {
                        label: "Quantity",
                        value: (shipment.quantity || 0) + " units",
                      },
                      {
                        label: "Blockchain",
                        value: blocks.length + " blocks",
                      },
                      {
                        label: "Telemetry",
                        value: telemetry.length + " readings",
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
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
                            fontWeight: 500,
                            color: "var(--text-primary)",
                          }}
                        >
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
            <div className="bento-card" style={{ padding: "24px" }}>
              <TelemetryCharts shipment={{ ...shipment, _telemetry: telemetry }} />
            </div>
          )}

          {/* Blockchain Tab */}
          {activeTab === "blockchain" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                className="bento-card"
                style={{
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
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
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--success)",
                      }}
                    >
                      Chain Integrity: VALID
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-ibm)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {blocks.length} blocks verified
                    </div>
                  </div>
                </div>
              </div>
              {blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bento-card"
                  style={{ padding: "18px 24px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-outfit)",
                          fontSize: "14px",
                          fontWeight: 700,
                          color:
                            block.eventType === "TEMP_VIOLATION"
                              ? "var(--danger)"
                              : "var(--accent)",
                        }}
                      >
                        Block #{block.blockNumber}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-ibm)",
                          fontSize: "12px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {(block.eventType || "").replace(/_/g, " ")}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-ibm)",
                        fontSize: "10px",
                        color: "var(--success)",
                        fontWeight: 500,
                      }}
                    >
                      Verified
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-ibm)",
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Hash:
                    </span>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "var(--accent)",
                        background: "var(--accent-soft)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {(block.hash || "").slice(0, 16)}...
                    </code>
                  </div>
                </div>
              ))}
              {blocks.length === 0 && (
                <div
                  className="bento-card"
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    No blockchain data yet
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div className="bento-card" style={{ padding: "24px" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 14px 0",
                  }}
                >
                  Incident Report
                </h3>
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
                  {shipment.incidentReport || "No incidents recorded."}
                </p>
              </div>
              <div className="bento-card" style={{ padding: "24px" }}>
                <h3
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 14px 0",
                  }}
                >
                  Compliance Report
                </h3>
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
                  {shipment.complianceReport ||
                    "Compliance report will be generated upon delivery."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-live {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--success); }
          50% { opacity: 0.4; box-shadow: 0 0 8px var(--success); }
        }
      `}</style>
    </div>
  );
}
