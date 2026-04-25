"use client";

import { useState } from "react";
import { blockchainBlocks, shipments } from "@/lib/mockData";

const eventIcons = {
  SHIPMENT_CREATED: "\u{1F4E6}",
  PAYMENT_HELD: "\u{1F4B3}",
  SHIPMENT_PICKED_UP: "\u{1F69A}",
  CHECKPOINT_CROSSED: "\u{2705}",
  TEMP_VIOLATION: "\u{26A0}\u{FE0F}",
  TEMP_RECOVERED: "\u{2744}\u{FE0F}",
  RISK_UPDATED: "\u{1F4C9}",
  DELIVERED: "\u{1F3C1}",
  SIGNATURE_RECEIVED: "\u{270D}\u{FE0F}",
  PAYMENT_RELEASED: "\u{1F4B0}",
  PAYMENT_DISPUTED: "\u{1F6A8}",
  AI_RECOMMENDATION: "\u{1F916}",
  USER_REGISTERED: "\u{1F464}",
  DELAY_DETECTED: "\u{23F0}",
  GENESIS: "\u{1F310}",
};

const eventColors = {
  SHIPMENT_CREATED: "var(--accent)",
  PAYMENT_HELD: "var(--warning)",
  SHIPMENT_PICKED_UP: "var(--accent)",
  CHECKPOINT_CROSSED: "var(--success)",
  TEMP_VIOLATION: "var(--danger)",
  TEMP_RECOVERED: "var(--success)",
  RISK_UPDATED: "var(--accent)",
  DELIVERED: "var(--success)",
  SIGNATURE_RECEIVED: "var(--success)",
  PAYMENT_RELEASED: "var(--success)",
  PAYMENT_DISPUTED: "var(--danger)",
  AI_RECOMMENDATION: "var(--accent)",
  DELAY_DETECTED: "var(--warning)",
  GENESIS: "var(--accent)",
};

export default function BlockchainPage() {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [filter, setFilter] = useState("all");

  const blocks = blockchainBlocks;

  const filteredBlocks = filter === "all"
    ? blocks
    : blocks.filter((b) => {
        if (filter === "violations") return b.eventType === "TEMP_VIOLATION" || b.eventType === "DELAY_DETECTED";
        if (filter === "checkpoints") return b.eventType === "CHECKPOINT_CROSSED" || b.eventType === "DELIVERED";
        if (filter === "payments") return b.eventType.startsWith("PAYMENT");
        return true;
      });

  const handleVerify = () => {
    setVerifying(true);
    setVerified(false);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
            Blockchain Ledger
          </h1>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Immutable SHA-256 hash chain \u2022 {blocks.length} blocks \u2022 {shipments[0].shipmentId}
          </p>
        </div>
        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            background: verified ? "var(--success)" : verifying ? "var(--bg-elevated)" : "var(--accent)",
            color: "#fff",
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: verifying ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: verified ? "0 0 20px var(--success-glow)" : "0 4px 16px var(--accent-glow)",
          }}
        >
          {verifying ? (
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
              Verifying Chain...
            </>
          ) : verified ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8l4 4 6-6" />
              </svg>
              Chain Valid
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M8 2v4M8 10v4M2 8h4M10 8h4" />
              </svg>
              Verify Integrity
            </>
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Blocks", value: blocks.length, color: "var(--accent)" },
          { label: "Verified", value: blocks.filter((b) => b.verified).length, color: "var(--success)" },
          { label: "Violations", value: blocks.filter((b) => b.eventType === "TEMP_VIOLATION").length, color: "var(--danger)" },
          { label: "Chain Status", value: "VALID", color: "var(--success)" },
        ].map((stat, idx) => (
          <div key={idx} className="bento-card" style={{ padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, color: stat.color, marginBottom: "4px" }}>
              {stat.value}
            </div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-subtle)" }}>
        {[
          { id: "all", label: "All Events" },
          { id: "violations", label: "Violations" },
          { id: "checkpoints", label: "Checkpoints" },
          { id: "payments", label: "Payments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "10px 18px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
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

      {/* Blocks Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        {/* Block List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {filteredBlocks.map((block, idx) => {
            const isSelected = selectedBlock?.blockNumber === block.blockNumber;
            const color = eventColors[block.eventType] || "var(--accent)";
            const icon = eventIcons[block.eventType] || "\u{1F4CB}";

            return (
              <div key={idx} style={{ display: "flex", gap: "0" }}>
                {/* Timeline connector */}
                <div
                  style={{
                    width: "40px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "2px",
                      height: "20px",
                      background: idx === 0 ? "transparent" : "var(--border-subtle)",
                    }}
                  />
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isSelected ? color : "var(--bg-elevated)",
                      border: "2px solid " + color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      flexShrink: 0,
                      zIndex: 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {icon}
                  </div>
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      background: idx === filteredBlocks.length - 1 ? "transparent" : "var(--border-subtle)",
                    }}
                  />
                </div>

                {/* Block Card */}
                <div
                  onClick={() => setSelectedBlock(block)}
                  style={{
                    flex: 1,
                    padding: "16px 20px",
                    marginBottom: "8px",
                    borderRadius: "12px",
                    border: isSelected ? "1.5px solid " + color : "1px solid var(--border-subtle)",
                    background: isSelected ? color.replace(")", ", 0.06)").replace("var(", "rgba(").replace("--accent", "108, 99, 255").replace("--danger", "255, 71, 87").replace("--success", "0, 214, 143").replace("--warning", "255, 184, 77") : "var(--bg-secondary)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--border-glass)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 700, color: color }}>
                        Block #{block.blockNumber}
                      </span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
                        {block.eventType.replace(/_/g, " ")}
                      </span>
                    </div>
                    {block.verified && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--success)", fontWeight: 500 }}>
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)" }}>Hash:</span>
                    <code style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 6px", borderRadius: "4px" }}>
                      {block.hash}
                    </code>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto" }}>
                      {new Date(block.timestamp).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Block Detail Panel */}
        <div style={{ position: "sticky", top: "100px" }}>
          {selectedBlock ? (
            <div className="bento-card animate-fade-in" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: (eventColors[selectedBlock.eventType] || "var(--accent)").replace(")", "22)").replace("var(", ""),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                  }}
                >
                  {eventIcons[selectedBlock.eventType] || "\u{1F4CB}"}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Block #{selectedBlock.blockNumber}
                  </div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: eventColors[selectedBlock.eventType] || "var(--accent)" }}>
                    {selectedBlock.eventType.replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              {/* Hash Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Block Hash", value: selectedBlock.hash, color: "var(--accent)" },
                  { label: "Previous Hash", value: selectedBlock.prevHash, color: "var(--text-secondary)" },
                  { label: "Shipment", value: selectedBlock.shipmentId, color: "var(--text-primary)" },
                  { label: "Timestamp", value: new Date(selectedBlock.timestamp).toLocaleString("en-IN"), color: "var(--text-primary)" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                      {item.label}
                    </div>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: item.color,
                        background: "var(--bg-elevated)",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        display: "block",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>

              {/* Data Payload */}
              <div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  Event Data
                </div>
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  {Object.entries(selectedBlock.data).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>
                        {key}
                      </span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Badge */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: selectedBlock.verified ? "var(--success-soft)" : "var(--danger-soft)",
                  border: selectedBlock.verified ? "1px solid rgba(0,214,143,0.2)" : "1px solid rgba(255,71,87,0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {selectedBlock.verified ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 8l4 4 6-6" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                )}
                <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600, color: selectedBlock.verified ? "var(--success)" : "var(--danger)" }}>
                  {selectedBlock.verified ? "Hash verified \u2022 No tampering" : "Verification failed"}
                </span>
              </div>
            </div>
          ) : (
            <div className="bento-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F517}"}</div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Select a Block
              </div>
              <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Click any block to view its hash details, event data, and verification status.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}