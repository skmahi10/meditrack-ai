"use client";

import { useState } from "react";
import { usePayments, useShipments } from "@/lib/useFirestore";
import { payments as mockPayments } from "@/lib/mockData";

const statusConfig = {
  created: { label: "Created", color: "var(--text-muted)", soft: "var(--bg-elevated)" },
  held: { label: "Held", color: "var(--warning)", soft: "var(--warning-soft)" },
  "under-review": { label: "Under Review", color: "var(--danger)", soft: "var(--danger-soft)" },
  released: { label: "Released", color: "var(--success)", soft: "var(--success-soft)" },
  disputed: { label: "Disputed", color: "var(--danger)", soft: "var(--danger-soft)" },
};

export default function PaymentsPage() {
  const { payments: firebasePayments, loading } = usePayments();
  const { shipments } = useShipments();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState("all");

  const payments = firebasePayments.length > 0 ? firebasePayments : mockPayments;

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalHeld = payments.filter((p) => p.status === "held" || p.status === "under-review").reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalReleased = payments.filter((p) => p.status === "released").reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatCurrency = (amount) => "\u20B9" + (amount || 0).toLocaleString("en-IN");

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)" }}>Loading payments...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>Payments</h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Conditional payment engine {"\u2022"} {payments.length} transactions {"\u2022"} {firebasePayments.length > 0 ? "Live from Firebase" : "Demo data"}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total", value: payments.length, color: "var(--accent)", icon: "\u{1F4CB}" },
          { label: "Held", value: formatCurrency(totalHeld), color: "var(--warning)", icon: "\u{1F512}" },
          { label: "Released", value: formatCurrency(totalReleased), color: "var(--success)", icon: "\u{2705}" },
          { label: "Transactions", value: payments.length, color: "var(--accent)", icon: "\u{1F4B3}" },
        ].map((stat, idx) => (
          <div key={idx} className="bento-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "22px" }}>{stat.icon}</div>
            <div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>
        {/* Payment List */}
        <div className="bento-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--border-subtle)", padding: "0 20px" }}>
            {["all", "held", "released"].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)} style={{ padding: "12px 16px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: filter === tab ? 600 : 400, color: filter === tab ? "var(--accent)" : "var(--text-secondary)", borderBottom: filter === tab ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: "-1px", textTransform: "capitalize" }}>
                {tab}
              </button>
            ))}
          </div>

          {filtered.map((payment) => {
            const config = statusConfig[payment.status] || statusConfig.created;
            const isSelected = selectedPayment?.id === payment.id;
            const shipment = shipments.find((s) => s.shipmentId === payment.shipmentId);

            return (
              <div key={payment.id || payment.paymentId} onClick={() => setSelectedPayment(payment)} style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-subtle)", cursor: "pointer", background: isSelected ? "var(--accent-soft)" : "transparent", borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent" }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-elevated)"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>{payment.paymentId}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "12px", background: config.soft, color: config.color, fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500 }}>{config.label}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                      {payment.shipmentId} {"\u2022"} {shipment?.product || "Shipment"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{formatCurrency(payment.amount)}</div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>{payment.currency || "INR"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-secondary)" }}>{payment.payerName || "Payer"}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M4 8h8M9 5l3 3-3 3" /></svg>
                  <span style={{ padding: "4px 10px", borderRadius: "6px", background: "var(--bg-elevated)", fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-secondary)" }}>{payment.payeeName || "Payee"}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)" }}>No payments found.</div>
          )}
        </div>

        {/* Detail Panel */}
        <div style={{ position: "sticky", top: "100px" }}>
          {selectedPayment ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="bento-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{selectedPayment.paymentId}</h3>
                  <span style={{ padding: "4px 12px", borderRadius: "12px", background: (statusConfig[selectedPayment.status] || statusConfig.created).soft, color: (statusConfig[selectedPayment.status] || statusConfig.created).color, fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600 }}>
                    {(statusConfig[selectedPayment.status] || statusConfig.created).label}
                  </span>
                </div>
                <div style={{ textAlign: "center", padding: "24px", background: "var(--bg-elevated)", borderRadius: "12px", marginBottom: "20px" }}>
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "36px", fontWeight: 800, color: "var(--text-primary)" }}>{formatCurrency(selectedPayment.amount)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Shipment", value: selectedPayment.shipmentId },
                    { label: "Payer", value: selectedPayment.payerName || "\u2014" },
                    { label: "Payee", value: selectedPayment.payeeName || "\u2014" },
                    { label: "Blockchain Ref", value: "Block #" + (selectedPayment.blockchainRef || "\u2014") },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedPayment.conditions && (
                <div className="bento-card" style={{ padding: "24px" }}>
                  <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Release Conditions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {Object.entries(selectedPayment.conditions).map(([key, met]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: met ? "var(--success-soft)" : "var(--bg-elevated)", border: met ? "1px solid rgba(0,214,143,0.15)" : "1px solid var(--border-subtle)" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "6px", background: met ? "var(--success)" : "transparent", border: met ? "none" : "1.5px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {met && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3 5-5" /></svg>}
                        </div>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: met ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bento-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F4B3}"}</div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Select a Payment</div>
              <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Click any transaction to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}