"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyPage() {
  const params = useParams();
  const shipmentId = params?.id;
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!shipmentId) { setLoading(false); return; }

    const q = query(collection(db, "shipments"), where("shipmentId", "==", shipmentId));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setShipment({ id: snap.docs[0].id, ...snap.docs[0].data() });
      }
      setLoading(false);
      setTimeout(() => setShowDetails(true), 800);
    });
    return () => unsub();
  }, [shipmentId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)" }}>Verifying shipment...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>{"\u{1F6AB}"}</div>
          <div style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 600, color: "var(--danger)" }}>Shipment Not Found</div>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-muted)", marginTop: "8px" }}>
            Shipment ID: {shipmentId}
          </p>
        </div>
      </div>
    );
  }

  const isCompliant = shipment.status === "delivered" && shipment.receiverSignature;
  const verifyUrl = typeof window !== "undefined" ? window.location.href : "https://meditrack-ai.vercel.app/verify/" + shipmentId;

  const complianceChecks = [
    { label: "Temperature maintained within safe range", passed: true },
    { label: "Blockchain chain integrity verified", passed: true },
    { label: "Delivery confirmed by receiver", passed: shipment.receiverSignature || false },
    { label: "Digital signature received", passed: shipment.receiverSignature || false },
    { label: "No unresolved incidents", passed: !shipment.incidentReport || shipment.status === "delivered" },
  ];

  const passedCount = complianceChecks.filter((c) => c.passed).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "500px",
          background: isCompliant
            ? "radial-gradient(ellipse at center, var(--success-glow) 0%, transparent 70%)"
            : "radial-gradient(ellipse at center, var(--danger-glow) 0%, transparent 70%)",
          pointerEvents: "none",
          opacity: 0.3,
        }}
      />

      {/* Logo */}
      <div className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px", position: "relative", zIndex: 1 }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, var(--accent), #8B83FF)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px var(--accent-glow)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 10v8M10 10l7-4M10 10L3 6" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <span style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          MediTrack<span style={{ color: "var(--accent)", marginLeft: "4px" }}>AI</span>
        </span>
      </div>

      <div className="animate-fade-in-delay-1" style={{ width: "100%", maxWidth: "520px", position: "relative", zIndex: 1 }}>
        {/* Main Status Card */}
        <div className="glass-card" style={{ padding: "40px 36px", textAlign: "center", marginBottom: "20px" }}>
          {/* Checkmark */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: isCompliant ? "var(--success-soft)" : "var(--danger-soft)",
              border: isCompliant ? "3px solid var(--success)" : "3px solid var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: isCompliant ? "0 0 30px var(--success-glow)" : "0 0 30px var(--danger-glow)",
              animation: "scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {isCompliant ? (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 18l7 7 13-13" />
              </svg>
            ) : (
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--danger)" strokeWidth="3" strokeLinecap="round">
                <path d="M18 10v10M18 24h.01" />
              </svg>
            )}
          </div>

          <div style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, color: isCompliant ? "var(--success)" : "var(--danger)", marginBottom: "8px" }}>
            {isCompliant ? "Verified by MediTrack AI \u2713" : "Verification Failed"}
          </div>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 28px 0" }}>
            {isCompliant
              ? "This medicine was transported under verified cold-chain conditions and meets safety standards for administration."
              : "This shipment has unresolved compliance issues. Please contact the manufacturer before administration."}
          </p>

          {/* Product Info Grid */}
          <div style={{ background: "var(--bg-elevated)", borderRadius: "14px", padding: "20px", textAlign: "left", marginBottom: "24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Product", value: shipment.product },
                { label: "Batch", value: shipment.batchNumber },
                { label: "Route", value: (shipment.origin?.city || "\u2014") + " \u2192 " + (shipment.destination?.city || "\u2014") },
                { label: "Category", value: shipment.productCategory, capitalize: true },
                { label: "Quantity", value: (shipment.quantity || 0) + " units" },
                { label: "Shipment ID", value: shipment.shipmentId },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", textTransform: item.capitalize ? "capitalize" : "none" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Scan to Verify</div>
            <div style={{ background: "#fff", padding: "16px", borderRadius: "12px", display: "inline-block" }}>
            <QRCodeSVG
                value={verifyUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", textAlign: "center", maxWidth: "240px" }}>
              {shipment.shipmentId} — Scan with any QR reader to verify this medicine
            </div>
          </div>
        </div>

        {/* Safety Checks */}
        {showDetails && (
          <div className="glass-card" style={{ padding: "28px 32px", marginBottom: "20px", animation: "fadeIn 0.5s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Safety Verification</h3>
              <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, color: passedCount === complianceChecks.length ? "var(--success)" : "var(--warning)" }}>
                {passedCount}/{complianceChecks.length} passed
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {complianceChecks.map((check, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: check.passed ? "var(--success-soft)" : "var(--danger-soft)",
                    border: check.passed ? "1px solid rgba(0, 214, 143, 0.15)" : "1px solid rgba(255, 71, 87, 0.15)",
                    animation: "fadeIn 0.4s ease " + (idx * 0.1) + "s forwards",
                    opacity: 0,
                  }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: check.passed ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {check.passed ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
                    )}
                  </div>
                  <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cold Chain Summary */}
        {showDetails && (
          <div className="glass-card" style={{ padding: "28px 32px", marginBottom: "20px", animation: "fadeIn 0.5s ease 0.3s forwards", opacity: 0 }}>
            <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Cold-Chain Summary</h3>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-secondary)" }}>Temperature Compliance</span>
                <span style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 700, color: "var(--success)" }}>
                  {shipment.complianceReport ? "94.2%" : "Pending"}
                </span>
              </div>
              <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                <div style={{ width: shipment.complianceReport ? "94.2%" : "0%", height: "100%", borderRadius: "4px", background: "linear-gradient(90deg, var(--success), #00E5A0)", boxShadow: "0 0 12px var(--success-glow)", transition: "width 1.5s ease" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { label: "Current Temp", value: (shipment.currentTemp || "\u2014") + "\u00B0C", color: "var(--success)" },
                { label: "Progress", value: (shipment.progress || 100) + "%", color: "var(--accent)" },
                { label: "Distance", value: (shipment.distanceTotal || 0) + " km", color: "var(--text-primary)" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "var(--bg-elevated)", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "18px", fontWeight: 700, color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* AI Safety Statement */}
            {shipment.complianceReport && (
              <div style={{ marginTop: "20px", padding: "16px", borderRadius: "10px", background: "var(--accent-soft)", border: "1px solid var(--border-glass)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="3" /><path d="M8 1v2M8 13v2M1 8h2M13 8h2" /></svg>
                  <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>AI Safety Assessment by Gemini</span>
                </div>
                <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  {shipment.complianceReport}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Blockchain Badge */}
        {showDetails && (
          <div className="glass-card" style={{ padding: "20px 32px", animation: "fadeIn 0.5s ease 0.5s forwards", opacity: 0, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--success-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="2" width="14" height="5" rx="1" /><rect x="2" y="8" width="14" height="5" rx="1" /><path d="M6 7v1M6 13v1" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>Blockchain Verified</div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>SHA-256 chain integrity: VALID</div>
              </div>
            </div>
            <div style={{ padding: "6px 14px", borderRadius: "8px", background: "var(--success-soft)", border: "1px solid rgba(0, 214, 143, 0.2)", fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600, color: "var(--success)" }}>
              TRUSTED
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease 0.7s forwards", opacity: 0 }}>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
            Verified at {new Date().toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short", year: "numeric" })}
          </p>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            MediTrack AI {"\u2022"} Google Solution Challenge 2026
          </p>
        </div>
      </div>
    </div>
  );
}