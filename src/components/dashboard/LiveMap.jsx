// src/components/dashboard/LiveMap.jsx
"use client";

import { shipments } from "@/lib/mockData";

export default function LiveMap({ selectedShipment }) {
  const active = selectedShipment || shipments[0];

  const statusColor = {
    "in-transit": "var(--accent)",
    "at-risk": "var(--danger)",
    delivered: "var(--success)",
    created: "var(--warning)",
    failed: "var(--danger)",
  };

  const color = statusColor[active.status] || "var(--accent)";

  return (
    <div
      style={{
        width: "100%",
        height: "360px",
        borderRadius: "12px",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid Pattern Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      {/* Route Line */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 360"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset={active.progress + "%"} stopColor={color} stopOpacity="0.8" />
            <stop offset={active.progress + "%"} stopColor="var(--text-muted)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--text-muted)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Route path */}
        <path
          d="M 100 280 C 200 280, 250 120, 400 140 S 600 200, 700 100"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Dashed remaining path */}
        <path
          d="M 100 280 C 200 280, 250 120, 400 140 S 600 200, 700 100"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.2"
        />

        {/* Origin point */}
        <circle cx="100" cy="280" r="8" fill={color} opacity="0.2" />
        <circle cx="100" cy="280" r="4" fill={color} />

        {/* Checkpoints */}
        {active.checkpoints?.map((cp, idx) => {
          const x = 100 + ((600 * (idx + 1)) / (active.checkpoints.length + 1));
          const y = 280 - (140 * (idx + 1)) / (active.checkpoints.length + 1);
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="6" fill="var(--bg-secondary)" stroke={color} strokeWidth="2" />
              <text
                x={x}
                y={y - 14}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="11"
                fontFamily="var(--font-ibm)"
              >
                {cp.city}
              </text>
            </g>
          );
        })}

        {/* Current position (animated) */}
        {active.status !== "delivered" && (
          <g>
            <circle
              cx={100 + 6 * active.progress}
              cy={280 - active.progress * 1.6}
              r="14"
              fill={color}
              opacity="0.15"
            >
              <animate
                attributeName="r"
                values="14;20;14"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.15;0.05;0.15"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle
              cx={100 + 6 * active.progress}
              cy={280 - active.progress * 1.6}
              r="6"
              fill={color}
              stroke="var(--bg-secondary)"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Destination point */}
        <circle cx="700" cy="100" r="8" fill={color} opacity="0.2" />
        <circle cx="700" cy="100" r="4" fill={color} />
      </svg>

      {/* Origin Label */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          left: "60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {active.origin.city}
        </span>
        <span
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "10px",
            color: "var(--text-muted)",
          }}
        >
          Origin
        </span>
      </div>

      {/* Destination Label */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          {active.destination.city}
        </span>
        <span
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "10px",
            color: "var(--text-muted)",
          }}
        >
          Destination
        </span>
      </div>

      {/* Current Position Info Card */}
      {active.status !== "delivered" && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            background: "var(--bg-glass)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--border-glass)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div className="pulse-dot pulse-dot-accent" style={{ width: "6px", height: "6px" }} />
            <span
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {active.shipmentId}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            {[
              { label: "Temp", value: active.currentTemp + "\u00B0C", color: active.currentTemp > active.tempRange.max ? "var(--danger)" : "var(--success)" },
              { label: "Speed", value: active.currentSpeed + " km/h", color: "var(--text-primary)" },
              { label: "Progress", value: active.progress + "%", color: "var(--accent)" },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    marginBottom: "2px",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivered badge */}
      {active.status === "delivered" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            borderRadius: "12px",
            padding: "16px 28px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            stroke="var(--success)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l4 4 8-8" />
            <circle cx="11" cy="11" r="9" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--success)",
            }}
          >
            Delivered Successfully
          </span>
        </div>
      )}
    </div>
  );
}