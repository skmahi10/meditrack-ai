// src/components/dashboard/ShipmentTable.jsx
"use client";

export default function ShipmentTable({ shipments, selectedId, onSelect }) {
  const statusConfig = {
    "in-transit": {
      label: "In Transit",
      class: "status-in-transit",
      dot: "pulse-dot-accent",
    },
    "at-risk": {
      label: "At Risk",
      class: "status-at-risk",
      dot: "pulse-dot-danger",
    },
    delivered: {
      label: "Delivered",
      class: "status-delivered",
      dot: "pulse-dot-success",
    },
    created: {
      label: "Created",
      class: "status-created",
      dot: "pulse-dot-warning",
    },
    failed: {
      label: "Failed",
      class: "status-at-risk",
      dot: "pulse-dot-danger",
    },
  };

  const priorityConfig = {
    critical: { label: "Critical", class: "priority-critical" },
    urgent: { label: "Urgent", class: "priority-urgent" },
    normal: { label: "Normal", class: "priority-normal" },
  };

  const columns = [
    { label: "Shipment ID", width: "14%" },
    { label: "Product", width: "16%" },
    { label: "Route", width: "20%" },
    { label: "Status", width: "12%" },
    { label: "Temp", width: "10%" },
    { label: "Risk", width: "10%" },
    { label: "Priority", width: "10%" },
    { label: "ETA", width: "8%" },
  ];

  const getTempColor = (shipment) => {
    const { currentTemp, tempRange } = shipment;
    if (currentTemp < tempRange.min || currentTemp > tempRange.max) {
      return "var(--danger)";
    }
    const buffer = (tempRange.max - tempRange.min) * 0.2;
    if (
      currentTemp < tempRange.min + buffer ||
      currentTemp > tempRange.max - buffer
    ) {
      return "var(--warning)";
    }
    return "var(--success)";
  };

  const getRiskColor = (score) => {
    if (score >= 60) return "var(--danger)";
    if (score >= 35) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Table Header */}
      <div
        style={{
          display: "flex",
          padding: "12px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-elevated)",
        }}
      >
        {columns.map((col) => (
          <div
            key={col.label}
            style={{
              width: col.width,
              fontFamily: "var(--font-ibm)",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Table Rows */}
      {shipments.map((shipment) => {
        const isSelected = shipment.id === selectedId;
        const status = statusConfig[shipment.status];
        const priority = priorityConfig[shipment.priority];

        return (
          <div
            key={shipment.id}
            onClick={() => onSelect(shipment)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: "1px solid var(--border-subtle)",
              cursor: "pointer",
              background: isSelected ? "var(--accent-soft)" : "transparent",
              borderLeft: isSelected
                ? "3px solid var(--accent)"
                : "3px solid transparent",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "var(--bg-elevated)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            {/* Shipment ID */}
            <div
              style={{
                width: "14%",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--accent)",
                letterSpacing: "0.01em",
              }}
            >
              {shipment.shipmentId}
            </div>

            {/* Product */}
            <div style={{ width: "16%" }}>
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {shipment.product}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                  textTransform: "capitalize",
                }}
              >
                {shipment.productCategory} · {shipment.quantity} units
              </div>
            </div>

            {/* Route */}
            <div
              style={{
                width: "20%",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                }}
              >
                {shipment.origin.city}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3 7h8M8 4l3 3-3 3" />
              </svg>
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  color: "var(--text-primary)",
                }}
              >
                {shipment.destination.city}
              </span>
            </div>

            {/* Status */}
            <div style={{ width: "12%" }}>
              <span className={`status-badge ${status.class}`}>
                <span
                  className={`pulse-dot ${status.dot}`}
                  style={{ width: "6px", height: "6px" }}
                />
                {status.label}
              </span>
            </div>

            {/* Temperature */}
            <div
              style={{
                width: "10%",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 600,
                color: getTempColor(shipment),
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M6 2v6M6 10v.01" />
                <rect x="4" y="1" width="4" height="10" rx="2" />
              </svg>
              {shipment.currentTemp}°C
            </div>

            {/* Risk Score */}
            <div style={{ width: "10%" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "5px",
                    borderRadius: "3px",
                    background: "var(--bg-elevated)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${shipment.riskScore}%`,
                      height: "100%",
                      borderRadius: "3px",
                      background: getRiskColor(shipment.riskScore),
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: getRiskColor(shipment.riskScore),
                  }}
                >
                  {shipment.riskScore}%
                </span>
              </div>
            </div>

            {/* Priority */}
            <div
              style={{
                width: "10%",
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                fontWeight: 500,
              }}
              className={priority.class}
            >
              {priority.label}
            </div>

            {/* ETA / QR */}
            <div
              style={{
                width: "8%",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              {shipment.status === "delivered" ? (
                
                <a  href={"/verify/" + shipment.shipmentId}
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
                    fontWeight: 500,
                    textDecoration: "none",
                    border: "1px solid rgba(0, 214, 143, 0.2)",
                    transition: "all 0.15s ease",
                  }}
                >
                  QR {"\u2197"}
                </a>
              ) : shipment.eta > 0 ? (
                Math.floor(shipment.eta / 60) + "h " + (shipment.eta % 60) + "m"
              ) : (
                "\u2014"
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}