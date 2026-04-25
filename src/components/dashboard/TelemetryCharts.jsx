// src/components/dashboard/TelemetryCharts.jsx
"use client";

import { telemetryData } from "@/lib/mockData";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-glass)",
        borderRadius: "10px",
        padding: "12px 16px",
        boxShadow: "var(--shadow-lg)",
        minWidth: "140px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-ibm)",
          fontSize: "11px",
          color: "var(--text-muted)",
          marginBottom: "8px",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            padding: "2px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: entry.color,
                boxShadow: `0 0 6px ${entry.color}44`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              {entry.name}
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              fontWeight: 600,
              color: entry.color,
            }}
          >
            {entry.value}
            {entry.name === "Temperature"
              ? "°C"
              : entry.name === "Humidity"
                ? "%"
                : " km/h"}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TelemetryCharts({ shipment }) {
  const data = telemetryData;

  const tempMin = shipment?.tempRange?.min ?? -20;
  const tempMax = shipment?.tempRange?.max ?? -15;

  // Find violation points
  const violationPoints = data.filter(
    (d) => d.temperature < tempMin || d.temperature > tempMax
  );

  // Current readings
  const latest = data[data.length - 1];

  const readingCards = [
    {
      label: "Temperature",
      value: `${shipment?.currentTemp ?? latest?.temperature}°C`,
      range: `${tempMin}°C to ${tempMax}°C`,
      color:
        (shipment?.currentTemp ?? latest?.temperature) > tempMax ||
        (shipment?.currentTemp ?? latest?.temperature) < tempMin
          ? "var(--danger)"
          : "var(--success)",
    },
    {
      label: "Humidity",
      value: `${shipment?.currentHumidity ?? latest?.humidity}%`,
      range: "30% – 60%",
      color: "var(--accent)",
    },
    {
      label: "Speed",
      value: `${shipment?.currentSpeed ?? latest?.speed} km/h`,
      range: "Avg: 58 km/h",
      color: "var(--warning)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Current Reading Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {readingCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "4px",
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: card.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {card.value}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "11px",
                color: "var(--text-muted)",
                textAlign: "right",
              }}
            >
              {card.range}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Temperature Chart */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              Temperature
            </div>
            {violationPoints.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  background: "var(--danger-soft)",
                  border: "1px solid rgba(255, 71, 87, 0.15)",
                }}
              >
                <div
                  className="pulse-dot pulse-dot-danger"
                  style={{ width: "6px", height: "6px" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "11px",
                    color: "var(--danger)",
                    fontWeight: 500,
                  }}
                >
                  {violationPoints.length} violations
                </span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF4757" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FF4757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "var(--font-ibm)",
                }}
                axisLine={{ stroke: "var(--border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "var(--font-ibm)",
                }}
                axisLine={false}
                tickLine={false}
                domain={[-22, 0]}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Safe range reference area */}
              <Area
                type="monotone"
                dataKey={() => tempMax}
                stroke="none"
                fill="var(--success-soft)"
                fillOpacity={0.3}
              />

              {/* Temperature line */}
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature"
                stroke="#6C63FF"
                strokeWidth={2}
                fill="url(#tempGrad)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isViolation =
                    payload.temperature > tempMax || payload.temperature < tempMin;
                  if (!isViolation) return null;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#FF4757"
                      stroke="#FF475744"
                      strokeWidth={6}
                    />
                  );
                }}
                activeDot={{
                  r: 5,
                  fill: "#6C63FF",
                  stroke: "#6C63FF44",
                  strokeWidth: 8,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Threshold legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "10px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#6C63FF",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                Actual
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--danger)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                Violation
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "6px",
                  borderRadius: "2px",
                  background: "var(--success-soft)",
                  border: "1px solid var(--success)",
                  opacity: 0.5,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                Safe Range
              </span>
            </div>
          </div>
        </div>

        {/* Humidity + Speed Chart */}
        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "12px",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: "16px",
            }}
          >
            Humidity & Speed
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-subtle)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "var(--font-ibm)",
                }}
                axisLine={{ stroke: "var(--border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                  fill: "var(--text-muted)",
                  fontFamily: "var(--font-ibm)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity"
                stroke="#00D68F"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#00D68F",
                  stroke: "#00D68F44",
                  strokeWidth: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="speed"
                name="Speed"
                stroke="#FFB84D"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 3"
                activeDot={{
                  r: 5,
                  fill: "#FFB84D",
                  stroke: "#FFB84D44",
                  strokeWidth: 8,
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "10px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#00D68F",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                Humidity (%)
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#FFB84D",
                  borderTop: "1px dashed #FFB84D",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                }}
              >
                Speed (km/h)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}