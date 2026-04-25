"use client";

import { useState } from "react";
import { shipments, telemetryData } from "@/lib/mockData";
import RiskGauge from "@/components/dashboard/RiskGauge";

const scenarioPresets = [
  "What if temperature rises by 5\u00B0C for 30 minutes?",
  "What if there is a 3-hour traffic delay?",
  "What if cooling unit fails completely?",
  "What if we reroute via Ahmedabad?",
];

export default function AIPage() {
  const [selectedShipment, setSelectedShipment] = useState(shipments[0]);
  const [scenario, setScenario] = useState("");
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "I'm your AI operations officer. Ask me anything about shipment risk, temperature trends, route optimization, or compliance predictions.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleScenario = (text) => {
    const q = text || scenario;
    if (!q.trim()) return;
    setScenario(q);
    setLoadingScenario(true);
    setScenarioResult(null);

    setTimeout(() => {
      setScenarioResult({
        prediction: "If the temperature rises by 5\u00B0C (from -18\u00B0C to -13\u00B0C) and remains elevated for 30 minutes, the risk score would increase from 34% to 68%. At -13\u00B0C, Covaxin remains within WHO-acceptable thermal tolerance for up to 45 minutes. However, if the excursion extends beyond 45 minutes, vaccine potency drops below 80% efficacy threshold. Immediate action: activate backup cooling and reduce transit speed.",
        currentRisk: 34,
        predictedRisk: 68,
        change: "+34%",
        urgency: "high",
      });
      setLoadingScenario(false);
    }, 2000);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }]);
    setChatLoading(true);
    const input = chatInput;
    setChatInput("");

    setTimeout(() => {
      const responses = [
        "The risk score for " + selectedShipment.shipmentId + " is currently at " + selectedShipment.riskScore + "%. The primary contributing factor is " + (selectedShipment.riskScore > 50 ? "temperature deviation from the safe range" : "minor transit delays") + ". I recommend " + (selectedShipment.riskScore > 50 ? "activating backup cooling immediately" : "continuing on the current route") + ".",
        "Based on historical data for this route, the average transit time is 11.5 hours. Current progress is " + selectedShipment.progress + "% with an ETA of " + Math.floor(selectedShipment.eta / 60) + " hours. Weather conditions along the remaining route are favorable.",
        "Temperature compliance for " + selectedShipment.shipmentId + " is currently at " + (selectedShipment.riskScore < 50 ? "96.8%" : "82.4%") + ". The required range is " + selectedShipment.tempRange.min + "\u00B0C to " + selectedShipment.tempRange.max + "\u00B0C. Current reading: " + selectedShipment.currentTemp + "\u00B0C.",
        "The blockchain ledger for this shipment has " + (selectedShipment.status === "delivered" ? "12" : "8") + " verified blocks. Chain integrity is VALID. No tampering detected. The last event recorded was " + (selectedShipment.riskScore > 50 ? "a temperature violation alert" : "a checkpoint crossing") + ".",
      ];
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses[Math.floor(Math.random() * responses.length)] },
      ]);
      setChatLoading(false);
    }, 1500);
  };

  const riskFactorDetails = [
    {
      name: "Temperature",
      score: selectedShipment.riskFactors.temperature,
      weight: 30,
      detail: selectedShipment.riskFactors.temperature > 50
        ? "Temperature outside safe range. Excursion detected."
        : "Temperature within acceptable range. No excursions.",
      icon: "\u{1F321}\u{FE0F}",
    },
    {
      name: "Delay",
      score: selectedShipment.riskFactors.delay,
      weight: 20,
      detail: selectedShipment.riskFactors.delay > 50
        ? "Significant delay detected. Behind schedule by 22+ minutes."
        : "Minor delays within acceptable tolerance.",
      icon: "\u{23F1}\u{FE0F}",
    },
    {
      name: "Route",
      score: selectedShipment.riskFactors.route,
      weight: 15,
      detail: "On planned route. " + selectedShipment.progress + "% of journey completed.",
      icon: "\u{1F6E3}\u{FE0F}",
    },
    {
      name: "Weather",
      score: selectedShipment.riskFactors.weather,
      weight: 15,
      detail: selectedShipment.riskFactors.weather > 40
        ? "Adverse weather conditions detected along route."
        : "Clear conditions. No weather hazards reported.",
      icon: "\u{1F326}\u{FE0F}",
    },
    {
      name: "Cooling",
      score: selectedShipment.riskFactors.cooling,
      weight: 10,
      detail: selectedShipment.riskFactors.cooling > 50
        ? "Cooling unit showing irregular patterns. Battery low."
        : "Cooling unit operating normally.",
      icon: "\u{2744}\u{FE0F}",
    },
    {
      name: "Transit Time",
      score: selectedShipment.riskFactors.transit,
      weight: 10,
      detail: "Elapsed: " + Math.floor(selectedShipment.eta / 60) + "h of estimated journey.",
      icon: "\u{1F550}",
    },
  ];

  const getRiskColor = (score) => {
    if (score >= 60) return "var(--danger)";
    if (score >= 35) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--text-primary)",
            margin: "0 0 4px 0",
          }}
        >
          AI & Optimization
        </h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Gemini-powered risk analysis, scenario simulation, and intelligent recommendations
        </p>
      </div>

      {/* Shipment Selector */}
      <div style={{ display: "flex", gap: "8px" }}>
        {shipments.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedShipment(s)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: selectedShipment.id === s.id ? "1.5px solid var(--accent)" : "1px solid var(--border-subtle)",
              background: selectedShipment.id === s.id ? "var(--accent-soft)" : "var(--bg-secondary)",
              color: selectedShipment.id === s.id ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {s.shipmentId}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Risk Factor Breakdown */}
          <div className="bento-card animate-fade-in" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
              6-Factor Risk Breakdown
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {riskFactorDetails.map((factor) => (
                <div key={factor.name} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "var(--bg-elevated)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {factor.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                          {factor.name}
                        </span>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)" }}>
                          {factor.weight}% weight
                        </span>
                      </div>
                      <span style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 700, color: getRiskColor(factor.score) }}>
                        {factor.score}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden", marginBottom: "6px" }}>
                      <div
                        style={{
                          width: factor.score + "%",
                          height: "100%",
                          borderRadius: "3px",
                          background: getRiskColor(factor.score),
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                    <p style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                      {factor.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Simulator */}
          <div className="bento-card animate-fade-in-delay-1" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  background: "var(--warning-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 1v4M7 9v4M1 7h4M9 7h4" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                Scenario Simulator
              </h2>
            </div>

            {/* Preset buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "14px" }}>
              {scenarioPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleScenario(preset)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-glass)",
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-ibm)",
                    fontSize: "11px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--warning-soft)";
                    e.currentTarget.style.color = "var(--warning)";
                    e.currentTarget.style.borderColor = "var(--warning)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.borderColor = "var(--border-glass)";
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScenario()}
                placeholder="Type a what-if scenario..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--warning)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
              <button
                onClick={() => handleScenario()}
                disabled={loadingScenario}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--warning)",
                  color: "#000",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {loadingScenario ? "Analyzing..." : "Simulate"}
              </button>
            </div>

            {/* Result */}
            {scenarioResult && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  animation: "fadeIn 0.4s ease",
                }}
              >
                <div style={{ display: "flex", gap: "20px", marginBottom: "14px" }}>
                  {[
                    { label: "Current Risk", value: scenarioResult.currentRisk + "%", color: getRiskColor(scenarioResult.currentRisk) },
                    { label: "Predicted Risk", value: scenarioResult.predictedRisk + "%", color: getRiskColor(scenarioResult.predictedRisk) },
                    { label: "Change", value: scenarioResult.change, color: "var(--danger)" },
                    { label: "Urgency", value: scenarioResult.urgency.toUpperCase(), color: "var(--danger)" },
                  ].map((item) => (
                    <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: item.color }}>
                        {item.value}
                      </div>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  {scenarioResult.prediction}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Risk Gauge */}
          <div className="bento-card animate-fade-in-delay-1" style={{ padding: "20px" }}>
            <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
              Overall Risk — {selectedShipment.shipmentId}
            </h3>
            <RiskGauge shipment={selectedShipment} />
          </div>

          {/* AI Chat */}
          <div className="bento-card animate-fade-in-delay-2" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", height: "420px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="3" />
                  <path d="M7 1v2M7 11v2M1 7h2M11 7h2" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Gemini Chat
                </div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--success)" }}>
                  Context: {selectedShipment.shipmentId}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    maxWidth: "90%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                    background: msg.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border-subtle)",
                    color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    fontFamily: "var(--font-ibm)",
                    fontSize: "12px",
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {chatLoading && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "12px 12px 12px 4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    alignSelf: "flex-start",
                    display: "flex",
                    gap: "4px",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        opacity: 0.4,
                        animation: "typingBounce 1.2s infinite " + (i * 0.15) + "s",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "8px", background: "var(--bg-elevated)" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ask about risk, routes, compliance..."
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                }}
              />
              <button
                onClick={handleChat}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  border: "none",
                  background: chatInput.trim() ? "var(--accent)" : "var(--bg-secondary)",
                  color: chatInput.trim() ? "#fff" : "var(--text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2L6 8M12 2l-4 10-2-5-5-2 10-4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-5px); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}