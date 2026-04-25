// src/components/dashboard/RiskGauge.jsx
"use client";

import { useEffect, useState } from "react";

export default function RiskGauge({ shipment }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = shipment?.riskScore || 0;

  useEffect(() => {
    setAnimatedScore(0);
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s) => {
    if (s >= 60) return "var(--danger)";
    if (s >= 35) return "var(--warning)";
    return "var(--success)";
  };

  const getGlow = (s) => {
    if (s >= 60) return "var(--danger-glow)";
    if (s >= 35) return "var(--warning-glow)";
    return "var(--success-glow)";
  };

  const getLabel = (s) => {
    if (s >= 60) return "HIGH RISK";
    if (s >= 35) return "MODERATE";
    return "LOW RISK";
  };

  const color = getColor(score);
  const glow = getGlow(score);
  const label = getLabel(score);

  // Gauge arc calculation
  const radius = 80;
  const strokeWidth = 10;
  const centerX = 100;
  const centerY = 95;
  const startAngle = -210;
  const endAngle = 30;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (totalAngle * animatedScore) / 100;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const arcPath = (start, end) => {
    const r = toRad(start);
    const e = toRad(end);
    const x1 = centerX + radius * Math.cos(r);
    const y1 = centerY + radius * Math.sin(r);
    const x2 = centerX + radius * Math.cos(e);
    const y2 = centerY + radius * Math.sin(e);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Tick marks
  const ticks = [0, 20, 40, 60, 80, 100];
  const tickPositions = ticks.map((t) => {
    const angle = toRad(startAngle + (totalAngle * t) / 100);
    return {
      value: t,
      x1: centerX + (radius - 14) * Math.cos(angle),
      y1: centerY + (radius - 14) * Math.sin(angle),
      x2: centerX + (radius - 6) * Math.cos(angle),
      y2: centerY + (radius - 6) * Math.sin(angle),
      lx: centerX + (radius - 26) * Math.cos(angle),
      ly: centerY + (radius - 26) * Math.sin(angle),
    };
  });

  // Needle
  const needleAngle = toRad(startAngle + (totalAngle * animatedScore) / 100);
  const needleLength = radius - 24;
  const needleX = centerX + needleLength * Math.cos(needleAngle);
  const needleY = centerY + needleLength * Math.sin(needleAngle);

  // Risk factors
  const factors = shipment?.riskFactors || {};
  const factorList = [
    { key: "temperature", label: "Temperature", weight: "30%", icon: "🌡️" },
    { key: "delay", label: "Delay", weight: "20%", icon: "⏱️" },
    { key: "route", label: "Route", weight: "15%", icon: "🛣️" },
    { key: "weather", label: "Weather", weight: "15%", icon: "🌦️" },
    { key: "cooling", label: "Cooling", weight: "10%", icon: "❄️" },
    { key: "transit", label: "Transit", weight: "10%", icon: "🕐" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
      {/* SVG Gauge */}
      <div style={{ position: "relative", width: "200px", height: "140px" }}>
        <svg
          width="200"
          height="140"
          viewBox="0 0 200 140"
          style={{ overflow: "visible" }}
        >
          {/* Background arc */}
          <path
            d={arcPath(startAngle, endAngle)}
            fill="none"
            stroke="var(--bg-elevated)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Score arc */}
          <path
            d={arcPath(startAngle, scoreAngle)}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Tick marks */}
          {tickPositions.map((tick) => (
            <g key={tick.value}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="var(--text-muted)"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={tick.lx}
                y={tick.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--text-muted)"
                fontSize="9"
                fontFamily="var(--font-ibm)"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px ${glow})`,
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r="5"
            fill={color}
            style={{
              filter: `drop-shadow(0 0 6px ${glow})`,
              transition: "fill 1s ease",
            }}
          />
        </svg>

        {/* Center score text */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "32px",
              fontWeight: 800,
              color: color,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              transition: "color 1s ease",
            }}
          >
            {animatedScore}
            <span style={{ fontSize: "16px", fontWeight: 500 }}>%</span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "10px",
              fontWeight: 600,
              color: color,
              letterSpacing: "0.1em",
              marginTop: "2px",
              transition: "color 1s ease",
            }}
          >
            {label}
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
        {factorList.map((factor) => {
          const value = factors[factor.key] || 0;
          const barColor = getColor(value);
          return (
            <div key={factor.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{factor.icon}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {factor.label}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {factor.weight}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-ibm)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: barColor,
                      minWidth: "28px",
                      textAlign: "right",
                    }}
                  >
                    {value}
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  borderRadius: "2px",
                  background: "var(--bg-elevated)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${value}%`,
                    height: "100%",
                    borderRadius: "2px",
                    background: barColor,
                    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}