"use client";

import { useState } from "react";
import { useBlockchain, useShipments } from "@/lib/useFirestore";
import { blockchainBlocks as mockBlocks } from "@/lib/mockData";

const eventIcons = {
  SHIPMENT_CREATED: "\u{1F4E6}", PAYMENT_HELD: "\u{1F4B3}", SHIPMENT_PICKED_UP: "\u{1F69A}",
  CHECKPOINT_CROSSED: "\u{2705}", TEMP_VIOLATION: "\u{26A0}\u{FE0F}", TEMP_RECOVERED: "\u{2744}\u{FE0F}",
  RISK_UPDATED: "\u{1F4C9}", DELIVERED: "\u{1F3C1}", SIGNATURE_RECEIVED: "\u{270D}\u{FE0F}",
  PAYMENT_RELEASED: "\u{1F4B0}", AI_RECOMMENDATION: "\u{1F916}", DELAY_DETECTED: "\u{23F0}",
};

const eventColors = {
  SHIPMENT_CREATED: "var(--accent)", PAYMENT_HELD: "var(--warning)", SHIPMENT_PICKED_UP: "var(--accent)",
  CHECKPOINT_CROSSED: "var(--success)", TEMP_VIOLATION: "var(--danger)", TEMP_RECOVERED: "var(--success)",
  RISK_UPDATED: "var(--accent)", DELIVERED: "var(--success)", SIGNATURE_RECEIVED: "var(--success)",
  PAYMENT_RELEASED: "var(--success)", AI_RECOMMENDATION: "var(--accent)", DELAY_DETECTED: "var(--warning)",
};

export default function BlockchainPage() {
  const { shipments } = useShipments();
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  const activeId = selectedShipmentId || shipments[0]?.shipmentId;
  const { blocks: firebaseBlocks, loading } = useBlockchain(activeId);
  const blocks = firebaseBlocks.length > 0 ? firebaseBlocks : mockBlocks;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)" }}>Loading blockchain...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>Blockchain Ledger</h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          SHA-256 hash chain {"\u2022"} {blocks.length} blocks {"\u2022"} {firebaseBlocks.length > 0 ? "Live from Firebase" : "Demo data"}
        </p>
      </div>

      {/* Shipment Selector */}
      {shipments.length > 0 && (
        <div style={{ display: "flex", gap: "8px" }}>
          {shipments.map((s) => (
            <button key={s.shipmentId} onClick={() => { setSelectedShipmentId(s.shipmentId); setSelectedBlock(null); }} style={{ padding: "8px 16px", borderRadius: "10px", border: activeId === s.shipmentId ? "1.5px solid var(--accent)" : "1px solid var(--border-subtle)", background: activeId === s.shipmentId ? "var(--accent-soft)" : "var(--bg-secondary)", color: activeId === s.shipmentId ? "var(--accent)" : "var(--text-secondary)", fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
              {s.shipmentId}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          { label: "Total Blocks", value: blocks.length, color: "var(--accent)" },
          { label: "Verified", value: blocks.filter((b) => b.verified).length, color: "var(--success)" },
          { label: "Violations", value: blocks.filter((b) => b.eventType === "TEMP_VIOLATION").length, color: "var(--danger)" },
          { label: "Chain Status", value: "VALID", color: "var(--success)" },
        ].map((stat, idx) => (
          <div key={idx} className="bento-card" style={{ padding: "18px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Blocks Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {blocks.map((block, idx) => {
            const isSelected = selectedBlock?.blockNumber === block.blockNumber;
            const color = eventColors[block.eventType] || "var(--accent)";
            const icon = eventIcons[block.eventType] || "\u{1F4CB}";
            return (
              <div key={idx} onClick={() => setSelectedBlock(block)} className="bento-card" style={{ padding: "16px 20px", cursor: "pointer", border: isSelected ? "1.5px solid " + color : undefined, display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-elevated)", border: "2px solid " + color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 700, color }}>#{ block.blockNumber}</span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-primary)" }}>{(block.eventType || "").replace(/_/g, " ")}</span>
                    </div>
                    {block.verified && <span style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--success)", fontWeight: 500 }}>{"\u2713"} Verified</span>}
                  </div>
                  <code style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--accent)", background: "var(--accent-soft)", padding: "2px 6px", borderRadius: "4px" }}>
                    {(block.hash || "").slice(0, 20)}...
                  </code>
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <div className="bento-card" style={{ padding: "40px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)" }}>No blockchain data. Create a shipment first.</div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div style={{ position: "sticky", top: "100px" }}>
          {selectedBlock ? (
            <div className="bento-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                  {eventIcons[selectedBlock.eventType] || "\u{1F4CB}"}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Block #{selectedBlock.blockNumber}</div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: eventColors[selectedBlock.eventType] || "var(--accent)" }}>{(selectedBlock.eventType || "").replace(/_/g, " ")}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Block Hash", value: selectedBlock.hash || "\u2014", color: "var(--accent)" },
                  { label: "Previous Hash", value: selectedBlock.prevHash || "\u2014", color: "var(--text-secondary)" },
                  { label: "Shipment", value: selectedBlock.shipmentId || "\u2014" },
                  { label: "Timestamp", value: selectedBlock.timestamp ? new Date(selectedBlock.timestamp).toLocaleString("en-IN") : "\u2014" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{item.label}</div>
                    <code style={{ fontFamily: "monospace", fontSize: "11px", color: item.color || "var(--text-primary)", background: "var(--bg-elevated)", padding: "6px 10px", borderRadius: "6px", display: "block", wordBreak: "break-all" }}>{item.value}</code>
                  </div>
                ))}
              </div>
              {selectedBlock.data && (
                <div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Event Data</div>
                  <div style={{ background: "var(--bg-elevated)", borderRadius: "8px", padding: "14px" }}>
                    {Object.entries(selectedBlock.data).map(([key, val]) => (
                      <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>{key}</span>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-primary)", fontWeight: 500, maxWidth: "200px", textAlign: "right", wordBreak: "break-all" }}>{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bento-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F517}"}</div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Select a Block</div>
              <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Click any block to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}