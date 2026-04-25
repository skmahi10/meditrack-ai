"use client";

import { useState } from "react";
import { payments, shipments } from "@/lib/mockData";

const statusConfig = {
  created: { label: "Created", color: "var(--text-muted)", soft: "var(--bg-elevated)" },
  held: { label: "Held", color: "var(--warning)", soft: "var(--warning-soft)" },
  "under-review": { label: "Under Review", color: "var(--danger)", soft: "var(--danger-soft)" },
  released: { label: "Released", color: "var(--success)", soft: "var(--success-soft)" },
  disputed: { label: "Disputed", color: "var(--danger)", soft: "var(--danger-soft)" },
};

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filter, setFilter] = useState("all");

  const filteredPayments = filter === "all"
    ? payments
    : payments.filter((p) => p.status === filter);

  const totalHeld = payments.filter((p) => p.status === "held" || p.status === "under-review").reduce((sum, p) => sum + p.amount, 0);
  const totalReleased = payments.filter((p) => p.status === "released").reduce((sum, p) => sum + p.amount, 0);
  const totalDisputed = payments.filter((p) => p.status === "disputed" || p.status === "under-review").reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount) => {
    return "\u20B9" + amount.toLocaleString("en-IN");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
          Payments
        </h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Conditional payment engine with escrow logic and blockchain verification
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Transactions", value: payments.length, color: "var(--accent)", icon: "\u{1F4CB}" },
          { label: "Held in Escrow", value: formatCurrency(totalHeld), color: "var(--warning)", icon: "\u{1F512}" },
          { label: "Released", value: formatCurrency(totalReleased), color: "var(--success)", icon: "\u{2705}" },
          { label: "Under Review", value: formatCurrency(totalDisputed), color: "var(--danger)", icon: "\u{26A0}\u{FE0F}" },
        ].map((stat, idx) => (
          <div key={idx} className="bento-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "var(--bg-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px" }}>
        {/* Payment List */}
        <div className="bento-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--border-subtle)", padding: "0 20px" }}>
            {[
              { id: "all", label: "All" },
              { id: "held", label: "Held" },
              { id: "under-review", label: "Under Review" },
              { id: "released", label: "Released" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                  fontWeight: filter === tab.id ? 600 : 400,
                  color: filter === tab.id ? "var(--accent)" : "var(--text-secondary)",
                  borderBottom: filter === tab.id ? "2px solid var(--accent)" : "2px solid transparent",
                  marginBottom: "-1px",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Payment Rows */}
          {filteredPayments.map((payment) => {
            const config = statusConfig[payment.status];
            const isSelected = selectedPayment?.id === payment.id;
            const shipment = shipments.find((s) => s.shipmentId === payment.shipmentId);

            return (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                style={{
                  padding: "18px 24px",
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  background: isSelected ? "var(--accent-soft)" : "transparent",
                  borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 600, color: "var(--accent)" }}>
                        {payment.paymentId}
                      </span>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "12px",
                          background: config.soft,
                          color: config.color,
                          fontFamily: "var(--font-ibm)",
                          fontSize: "11px",
                          fontWeight: 500,
                          border: "1px solid " + config.color + "33",
                        }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                      {payment.shipmentId} \u2022 {shipment?.product || "Unknown"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                      {formatCurrency(payment.amount)}
                    </div>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                      {payment.currency}
                    </div>
                  </div>
                </div>

                {/* Payer > Payee flow */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "var(--bg-elevated)",
                      fontFamily: "var(--font-ibm)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {payment.payerName}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 8h8M9 5l3 3-3 3" />
                  </svg>
                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "var(--bg-elevated)",
                      fontFamily: "var(--font-ibm)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {payment.payeeName}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPayments.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)" }}>
                No payments found for this filter.
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div style={{ position: "sticky", top: "100px" }}>
          {selectedPayment ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Payment Info */}
              <div className="bento-card animate-fade-in" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                    {selectedPayment.paymentId}
                  </h3>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      background: statusConfig[selectedPayment.status].soft,
                      color: statusConfig[selectedPayment.status].color,
                      fontFamily: "var(--font-ibm)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {statusConfig[selectedPayment.status].label}
                  </span>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    background: "var(--bg-elevated)",
                    borderRadius: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "36px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    {formatCurrency(selectedPayment.amount)}
                  </div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Indian Rupees
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Shipment", value: selectedPayment.shipmentId },
                    { label: "Payer", value: selectedPayment.payerName },
                    { label: "Payee", value: selectedPayment.payeeName },
                    { label: "Created", value: new Date(selectedPayment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                    { label: "Escrowed", value: selectedPayment.heldAt ? new Date(selectedPayment.heldAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "\u2014" },
                    { label: "Released", value: selectedPayment.releasedAt ? new Date(selectedPayment.releasedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }) : "\u2014" },
                    { label: "Blockchain Ref", value: "Block #" + selectedPayment.blockchainRef },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Release Conditions */}
              <div className="bento-card animate-fade-in-delay-1" style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
                  Release Conditions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {Object.entries(selectedPayment.conditions).map(([key, met]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: met ? "var(--success-soft)" : "var(--bg-elevated)",
                        border: met ? "1px solid rgba(0,214,143,0.15)" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          background: met ? "var(--success)" : "var(--bg-secondary)",
                          border: met ? "none" : "1.5px solid var(--border-subtle)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {met && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                            <path d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: met ? "var(--text-primary)" : "var(--text-muted)", fontWeight: met ? 500 : 400 }}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress */}
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>Conditions Met</span>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600, color: "var(--accent)" }}>
                      {Object.values(selectedPayment.conditions).filter(Boolean).length}/{Object.keys(selectedPayment.conditions).length}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: (Object.values(selectedPayment.conditions).filter(Boolean).length / Object.keys(selectedPayment.conditions).length * 100) + "%",
                        height: "100%",
                        borderRadius: "3px",
                        background: "var(--accent)",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Dispute Info */}
              {selectedPayment.disputeReason && (
                <div className="bento-card animate-fade-in-delay-2" style={{ padding: "20px", background: "var(--danger-soft)", borderColor: "rgba(255,71,87,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M8 2L2 14h12L8 2zM8 6v4M8 12h.01" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, color: "var(--danger)" }}>
                      Dispute — {selectedPayment.disputeSeverity?.toUpperCase()} severity
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    {selectedPayment.disputeReason}
                  </p>
                </div>
              )}

              {/* Payment Flow */}
              <div className="bento-card animate-fade-in-delay-2" style={{ padding: "20px" }}>
                <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 14px 0" }}>
                  Payment Flow
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    { label: "Created", done: true },
                    { label: "Held in Escrow", done: selectedPayment.status !== "created" },
                    { label: "Conditions Verified", done: selectedPayment.status === "released" },
                    { label: "Released to Payee", done: selectedPayment.status === "released" },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            background: step.done ? "var(--success)" : "var(--bg-elevated)",
                            border: step.done ? "none" : "2px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {step.done && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                              <path d="M2 5l2 2 4-4" />
                            </svg>
                          )}
                        </div>
                        {idx < 3 && (
                          <div style={{ width: "2px", height: "20px", background: step.done ? "var(--success)" : "var(--border-subtle)" }} />
                        )}
                      </div>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: step.done ? "var(--text-primary)" : "var(--text-muted)", fontWeight: step.done ? 500 : 400, paddingTop: "2px" }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bento-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F4B3}"}</div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Select a Payment
              </div>
              <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Click any transaction to view details, release conditions, and payment flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}