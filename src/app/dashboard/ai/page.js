"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useShipments } from "@/lib/useFirestore";
import RiskGauge from "@/components/dashboard/RiskGauge";

const scenarioPresets = [
  "What if temperature rises by 5\u00B0C for 30 minutes?",
  "What if there is a 3-hour traffic delay?",
  "What if cooling unit fails completely?",
  "What if we reroute via Ahmedabad?",
];

export default function AIPage() {
  const { user } = useUser();
  const { shipments, loading } = useShipments(user?.id);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const active = selectedShipment || shipments[0];

  const [scenario, setScenario] = useState("");
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "I'm your AI operations officer. Ask me anything about your shipments, risk analysis, or cold-chain optimization.",
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
      const currentRisk = active?.riskScore || 34;
      const predictedRisk = Math.min(100, currentRisk + Math.floor(Math.random() * 30) + 15);
      setScenarioResult({
        prediction: active
          ? "For shipment " + active.shipmentId + " (" + active.product + "), this scenario would increase risk from " + currentRisk + "% to " + predictedRisk + "%. " + (predictedRisk > 60 ? "CRITICAL: Activate backup cooling and notify receiver immediately. Consider rerouting to nearest cold storage facility." : "MODERATE: Increase monitoring frequency and prepare contingency cooling.")
          : "Based on predictive logistics modeling, this scenario could significantly increase operational risk. Recommended response: activate contingency protocols and monitor telemetry continuously.",
        currentRisk,
        predictedRisk,
        change: "+" + (predictedRisk - currentRisk) + "%",
        urgency: predictedRisk > 60 ? "high" : "moderate",
      });
      setLoadingScenario(false);
    }, 1500);
  };

  const handleChat = async () => {
  if (!chatInput.trim()) return;

  const question = chatInput;

  setChatMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: question,
    },
  ]);

  setChatInput("");
  setChatLoading(true);

  try {
    if (!active?.shipmentId) {
      throw new Error("No shipment selected");
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shipmentId: active.shipmentId,
        question,
      }),
    });

    const data = await res.json();

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          data.answer ||
          "No response generated.",
      },
    ]);
  } catch (err) {
    console.error(err);

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "AI service unavailable right now.",
      },
    ]);
  }

  setChatLoading(false);
};

  const getRiskColor = (score) => {
    if (score >= 60) return "var(--danger)";
    if (score >= 35) return "var(--warning)";
    return "var(--success)";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid var(--accent-soft)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", color: "var(--text-secondary)" }}>Loading AI engine...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
          AI & Optimization
        </h1>
        <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
          Gemini-powered risk analysis, scenario simulation, and intelligent recommendations
          {shipments.length > 0 ? " \u2022 " + shipments.length + " shipments" : ""}
        </p>
      </div>

      {/* Shipment Selector */}
      {shipments.length > 0 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {shipments.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedShipment(s)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: active?.id === s.id ? "1.5px solid var(--accent)" : "1px solid var(--border-subtle)",
                background: active?.id === s.id ? "var(--accent-soft)" : "var(--bg-secondary)",
                color: active?.id === s.id ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {s.shipmentId} {"\u2022"} {s.product}
            </button>
          ))}
        </div>
      )}

      {/* No shipments message */}
      {shipments.length === 0 && (
        <div className="bento-card" style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>{"\u{1F916}"}</div>
          <div style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            No Shipments Yet
          </div>
          <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Create a shipment from the Control Tower to unlock AI-powered insights and scenario simulation.
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Risk Factor Breakdown */}
          {active && active.riskFactors && (
            <div className="bento-card" style={{ padding: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 20px 0" }}>
                6-Factor Risk Breakdown \u2014 {active.shipmentId}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { name: "Temperature", score: active.riskFactors.temperature || 0, weight: 30, icon: "\u{1F321}\u{FE0F}" },
                  { name: "Delay", score: active.riskFactors.delay || 0, weight: 20, icon: "\u{23F1}\u{FE0F}" },
                  { name: "Route", score: active.riskFactors.route || 0, weight: 15, icon: "\u{1F6E3}\u{FE0F}" },
                  { name: "Weather", score: active.riskFactors.weather || 0, weight: 15, icon: "\u{1F326}\u{FE0F}" },
                  { name: "Cooling", score: active.riskFactors.cooling || 0, weight: 10, icon: "\u{2744}\u{FE0F}" },
                  { name: "Transit", score: active.riskFactors.transit || 0, weight: 10, icon: "\u{1F550}" },
                ].map((factor) => (
                  <div key={factor.name} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                      {factor.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                          {factor.name} <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{factor.weight}%</span>
                        </span>
                        <span style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 700, color: getRiskColor(factor.score) }}>
                          {factor.score}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "5px", borderRadius: "3px", background: "var(--bg-elevated)", overflow: "hidden" }}>
                        <div style={{ width: factor.score + "%", height: "100%", borderRadius: "3px", background: getRiskColor(factor.score), transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Simulator */}
          <div className="bento-card" style={{ padding: "24px" }}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
              Scenario Simulator {active ? "\u2014 " + active.shipmentId : ""}
            </h2>

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
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--warning-soft)"; e.currentTarget.style.color = "var(--warning)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScenario()}
                placeholder="Type a what-if scenario..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--border-subtle)", background: "var(--bg-elevated)", color: "var(--text-primary)", fontFamily: "var(--font-ibm)", fontSize: "13px", outline: "none" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--warning)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
              <button
                onClick={() => handleScenario()}
                disabled={loadingScenario}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "var(--warning)", color: "#000", fontFamily: "var(--font-ibm)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                {loadingScenario ? "..." : "Simulate"}
              </button>
            </div>

            {scenarioResult && (
              <div style={{ padding: "20px", borderRadius: "12px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", gap: "20px", marginBottom: "14px" }}>
                  {[
                    { label: "Current", value: scenarioResult.currentRisk + "%", color: getRiskColor(scenarioResult.currentRisk) },
                    { label: "Predicted", value: scenarioResult.predictedRisk + "%", color: getRiskColor(scenarioResult.predictedRisk) },
                    { label: "Change", value: scenarioResult.change, color: "var(--danger)" },
                    { label: "Urgency", value: scenarioResult.urgency.toUpperCase(), color: scenarioResult.urgency === "high" ? "var(--danger)" : "var(--warning)" },
                  ].map((item) => (
                    <div key={item.label} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-outfit)", fontSize: "22px", fontWeight: 700, color: item.color }}>{item.value}</div>
                      <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>{item.label}</div>
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
          {active && (
            <div className="bento-card" style={{ padding: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>
                Risk \u2014 {active.shipmentId}
              </h3>
              <RiskGauge shipment={active} />
            </div>
          )}

          {/* AI Chat */}
          <div className="bento-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "420px" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="3" /><path d="M7 1v2M7 11v2M1 7h2M11 7h2" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Gemini Chat</div>
                <div style={{ fontFamily: "var(--font-ibm)", fontSize: "10px", color: "var(--success)" }}>
                  {active ? "Context: " + active.shipmentId : "General mode"}
                </div>
              </div>
            </div>

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
                <div style={{ padding: "10px 14px", borderRadius: "12px 12px 12px 4px", background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", alignSelf: "flex-start", display: "flex", gap: "4px" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", opacity: 0.4, animation: "typingBounce 1.2s infinite " + (i * 0.15) + "s" }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: "8px", background: "var(--bg-elevated)" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder={active ? "Ask about " + active.shipmentId + "..." : "Ask about cold-chain..."}
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", color: "var(--text-primary)", fontFamily: "var(--font-ibm)", fontSize: "12px" }}
              />
              <button
                onClick={handleChat}
                style={{ width: "32px", height: "32px", borderRadius: "8px", border: "none", background: chatInput.trim() ? "var(--accent)" : "var(--bg-secondary)", color: chatInput.trim() ? "#fff" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L6 8M12 2l-4 10-2-5-5-2 10-4z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}