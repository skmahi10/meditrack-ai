"use client";

import { useState } from "react";
import { networkParticipants } from "@/lib/mockData";

const roleConfig = {
  manufacturer: { label: "Manufacturer", color: "var(--accent)", icon: "\u{1F3ED}" },
  carrier: { label: "Carrier", color: "var(--warning)", icon: "\u{1F69A}" },
  distributor: { label: "Distributor", color: "var(--accent)", icon: "\u{1F4E6}" },
  hospital: { label: "Hospital", color: "var(--success)", icon: "\u{1F3E5}" },
  regulator: { label: "Regulator", color: "var(--danger)", icon: "\u{1F3DB}" },
};

export default function NetworkPage() {
  const [filter, setFilter] = useState("all");
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const filtered = filter === "all"
    ? networkParticipants
    : networkParticipants.filter((p) => p.role === filter);

  const getTrustColor = (score) => {
    if (score >= 90) return "var(--success)";
    if (score >= 75) return "var(--warning)";
    return "var(--danger)";
  };

  const roleCounts = networkParticipants.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
          Network
        </h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Multi-stakeholder supply chain network \u2022 {networkParticipants.length} participants
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
        {Object.entries(roleConfig).map(([role, config]) => (
          <div
            key={role}
            onClick={() => setFilter(filter === role ? "all" : role)}
            className="bento-card"
            style={{
              padding: "16px",
              cursor: "pointer",
              textAlign: "center",
              border: filter === role ? "1.5px solid " + config.color : undefined,
              background: filter === role ? config.color.replace(")", "08)").replace("var(", "rgba(").replace("--accent", "108,99,255").replace("--warning", "255,184,77").replace("--success", "0,214,143").replace("--danger", "255,71,87") : undefined,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{config.icon}</div>
            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: config.color }}>
              {roleCounts[role] || 0}
            </div>
            <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", textTransform: "capitalize" }}>
              {config.label}s
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px" }}>
        {/* Participant Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", alignContent: "start" }}>
          {filtered.map((participant) => {
            const config = roleConfig[participant.role];
            const isSelected = selectedParticipant?.id === participant.id;

            return (
              <div
                key={participant.id}
                onClick={() => setSelectedParticipant(participant)}
                className="bento-card"
                style={{
                  padding: "20px",
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid " + config.color : undefined,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "var(--bg-elevated)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        flexShrink: 0,
                      }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
                        {participant.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: config.color, marginTop: "3px", textTransform: "capitalize" }}>
                        {config.label}
                      </div>
                    </div>
                  </div>
                  {participant.verified && (
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "var(--success-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Location */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M6 1C4.34 1 3 2.34 3 4c0 2.25 3 7 3 7s3-4.75 3-7c0-1.66-1.34-3-3-3z" />
                      <circle cx="6" cy="4" r="1" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-secondary)" }}>
                      {participant.location}
                    </span>
                  </div>

                  {/* Trust + Shipments row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                        Trust Score
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "60px", height: "5px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                          <div
                            style={{
                              width: participant.trustScore + "%",
                              height: "100%",
                              borderRadius: "3px",
                              background: getTrustColor(participant.trustScore),
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, color: getTrustColor(participant.trustScore) }}>
                          {participant.trustScore}%
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                        Active
                      </div>
                      <div style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        {participant.activeShipments}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div style={{ position: "sticky", top: "100px" }}>
          {selectedParticipant ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Profile Card */}
              <div className="bento-card animate-fade-in" style={{ padding: "28px", textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "var(--bg-elevated)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    margin: "0 auto 16px",
                  }}
                >
                  {roleConfig[selectedParticipant.role].icon}
                </div>
                <div style={{ fontFamily: "var(--font-outfit)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  {selectedParticipant.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      background: roleConfig[selectedParticipant.role].color + "15",
                      color: roleConfig[selectedParticipant.role].color,
                      fontFamily: "var(--font-ibm)",
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {roleConfig[selectedParticipant.role].label}
                  </span>
                  {selectedParticipant.verified && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background: "var(--success-soft)",
                        color: "var(--success)",
                        fontFamily: "var(--font-ibm)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      Verified
                    </span>
                  )}
                </div>

                {/* Trust Score Gauge */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontFamily: "var(--font-outfit)", fontSize: "36px", fontWeight: 800, color: getTrustColor(selectedParticipant.trustScore) }}>
                    {selectedParticipant.trustScore}%
                  </div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Trust Score
                  </div>
                </div>
                <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: selectedParticipant.trustScore + "%",
                      height: "100%",
                      borderRadius: "3px",
                      background: getTrustColor(selectedParticipant.trustScore),
                      boxShadow: "0 0 10px " + getTrustColor(selectedParticipant.trustScore),
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="bento-card animate-fade-in-delay-1" style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
                  Details
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[
                    { label: "Organization", value: selectedParticipant.name },
                    { label: "Role", value: roleConfig[selectedParticipant.role].label },
                    { label: "Location", value: selectedParticipant.location },
                    { label: "Active Shipments", value: selectedParticipant.activeShipments },
                    { label: "User ID", value: selectedParticipant.id },
                    { label: "Status", value: selectedParticipant.verified ? "Verified" : "Unverified", color: selectedParticipant.verified ? "var(--success)" : "var(--warning)" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: row.color || "var(--text-primary)" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permissions */}
              <div className="bento-card animate-fade-in-delay-2" style={{ padding: "24px" }}>
                <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
                  Permissions
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Create Shipment", roles: ["manufacturer", "distributor"] },
                    { label: "Track Shipments", roles: ["manufacturer", "carrier", "distributor", "hospital", "regulator"] },
                    { label: "Confirm Delivery", roles: ["distributor", "hospital"] },
                    { label: "Release Payment", roles: ["manufacturer"] },
                    { label: "Blockchain Audit", roles: ["manufacturer", "carrier", "distributor", "hospital", "regulator"] },
                  ].map((perm) => {
                    const hasPermission = perm.roles.includes(selectedParticipant.role);
                    return (
                      <div
                        key={perm.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          background: hasPermission ? "var(--success-soft)" : "var(--bg-elevated)",
                          border: hasPermission ? "1px solid rgba(0,214,143,0.12)" : "1px solid var(--border-subtle)",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            background: hasPermission ? "var(--success)" : "transparent",
                            border: hasPermission ? "none" : "1.5px solid var(--border-subtle)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {hasPermission && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                              <path d="M2 5l2 2 4-4" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: hasPermission ? "var(--text-primary)" : "var(--text-muted)" }}>
                          {perm.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bento-card" style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F465}"}</div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                Select a Participant
              </div>
              <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                Click any network member to view their profile, trust score, and role permissions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}