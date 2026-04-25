
"use client";

export default function ShipmentTable({ shipments, selectedId, onSelect }) {
  const statusConfig = {
    "in-transit": {
      label: "In Transit",
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    },
    "at-risk": {
      label: "At Risk",
      color: "var(--danger)",
      bg: "var(--danger-soft)",
    },
    delivered: {
      label: "Delivered",
      color: "var(--success)",
      bg: "var(--success-soft)",
    },
    created: {
      label: "Created",
      color: "var(--warning)",
      bg: "var(--warning-soft)",
    },
    failed: {
      label: "Failed",
      color: "var(--danger)",
      bg: "var(--danger-soft)",
    },
  };

  const getTempColor = (shipment) => {
    if (!shipment.tempRange) return "var(--text-secondary)";
    const { currentTemp, tempRange } = shipment;
    if (currentTemp < tempRange.min || currentTemp > tempRange.max) {
      return "var(--danger)";
    }
    return "var(--success)";
  };

  const getRiskColor = (score) => {
    if (score >= 60) return "var(--danger)";
    if (score >= 35) return "var(--warning)";
    return "var(--success)";
  };

  if (!shipments || shipments.length === 0) {
    return (
      <div style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "12px" }}>📦</div>
        <div style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
          No shipments yet
        </div>
        <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)" }}>
          Click &quot;New Shipment&quot; to create your first cold-chain shipment
        </div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", minWidth: "700px" }}>
      {/* Table Header */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-elevated)" }}>
            {["Shipment", "Product", "Route", "Status", "Temp", "Risk", "ETA"].map((col) => (
              <th
                key={col}
                style={{
                  padding: "12px 16px",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => {
            const isSelected = shipment.id === selectedId;
            const status = statusConfig[shipment.status] || statusConfig.created;

            return (
              <tr
                key={shipment.id}
                onClick={() => onSelect(shipment)}
                onDoubleClick={() => window.location.href = "/shipment?id=" + shipment.shipmentId}
                style={{
                  borderBottom: "1px solid var(--border-subtle)",
                  cursor: "pointer",
                  background: isSelected ? "var(--accent-soft)" : "transparent",
                  borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Shipment ID + Priority */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>
                    {shipment.shipmentId}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "10px",
                    fontWeight: 600,
                    marginTop: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: shipment.priority === "critical" ? "var(--danger)" : shipment.priority === "urgent" ? "var(--warning)" : "var(--text-muted)",
                  }}>
                    {shipment.priority}
                  </div>
                </td>

                {/* Product */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {shipment.product}
                  </div>
                  <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                    {shipment.quantity} units
                  </div>
                </td>

                {/* Route */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {shipment.origin?.city}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M2 6h8M7 3l3 3-3 3" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {shipment.destination?.city}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    background: status.bg,
                    border: `1px solid ${status.color}25`,
                    whiteSpace: "nowrap",
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: status.color,
                      boxShadow: `0 0 6px ${status.color}`,
                      animation: shipment.status === "in-transit" || shipment.status === "at-risk" ? "pulse 2s infinite" : "none",
                    }} />
                    <span style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: status.color,
                    }}>
                      {status.label}
                    </span>
                  </span>
                </td>

                {/* Temperature */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <span style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: getTempColor(shipment),
                    whiteSpace: "nowrap",
                  }}>
                    {shipment.currentTemp != null ? `${shipment.currentTemp}°C` : "—"}
                  </span>
                </td>

                {/* Risk */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "36px",
                      height: "4px",
                      borderRadius: "2px",
                      background: "var(--bg-elevated)",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${shipment.riskScore || 0}%`,
                        height: "100%",
                        borderRadius: "2px",
                        background: getRiskColor(shipment.riskScore || 0),
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: getRiskColor(shipment.riskScore || 0),
                      whiteSpace: "nowrap",
                    }}>
                      {shipment.riskScore || 0}%
                    </span>
                  </div>
                </td>

                {/* ETA / QR */}
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  {shipment.status === "delivered" ? (
                    <a
                      href={"/verify/" + shipment.shipmentId}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "var(--success-soft)",
                        color: "var(--success)",
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "var(--font-ibm)",
                        textDecoration: "none",
                        border: "1px solid rgba(0, 214, 143, 0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      QR ↗
                    </a>
                  ) : shipment.eta > 0 ? (
                    <span style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                    }}>
                      {Math.floor(shipment.eta / 60)}h {shipment.eta % 60}m
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}