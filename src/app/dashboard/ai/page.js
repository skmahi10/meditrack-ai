"use client";

import { useState } from "react";

const scenarioPresets = [
  "What if temperature rises by 5°C for 30 minutes?",
  "What if there is a 3-hour traffic delay?",
  "What if cooling unit fails completely?",
  "What if we reroute via Ahmedabad?",
];

export default function AIPage() {
  const [scenario, setScenario] = useState("");
  const [scenarioResult, setScenarioResult] = useState(null);
  const [loadingScenario, setLoadingScenario] = useState(false);

  const [chatInput, setChatInput] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content:
        "I'm your AI operations officer. Ask me about cold-chain risk analysis, compliance monitoring, logistics optimization, or emergency response recommendations.",
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
        prediction:
          "Based on predictive logistics modeling, this scenario could significantly increase operational risk and may impact shipment integrity. Recommended response: activate contingency protocols and monitor telemetry continuously.",

        currentRisk: 34,
        predictedRisk: 68,
        change: "+34%",
        urgency: "high",
      });

      setLoadingScenario(false);
    }, 1500);
  };

  const handleChat = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: chatInput,
      },
    ]);

    setChatLoading(true);

    setChatInput("");

    setTimeout(() => {
      const responses = [
        "Current network telemetry indicates stable cold-chain performance with no critical anomalies detected.",

        "Risk analysis suggests environmental temperature fluctuations may increase shipment vulnerability during extended transit periods.",

        "Compliance integrity remains within acceptable pharmaceutical cold-chain thresholds.",

        "Blockchain verification status: VALID. No tampering indicators detected in the logistics event chain.",

        "Recommended optimization: reroute through lower congestion corridors to reduce transit exposure time.",
      ];

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            responses[Math.floor(Math.random() * responses.length)],
        },
      ]);

      setChatLoading(false);
    }, 1200);
  };

  const getRiskColor = (score) => {
    if (score >= 60) return "var(--danger)";
    if (score >= 35) return "var(--warning)";
    return "var(--success)";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Header */}

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

        <p
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          AI-powered logistics intelligence and predictive cold-chain analysis
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "20px",
        }}
      >
        {/* LEFT */}

        <div
          className="bento-card"
          style={{
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "18px",
            }}
          >
            Scenario Simulator
          </h2>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "18px",
            }}
          >
            {scenarioPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => handleScenario(preset)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <input
              type="text"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Enter custom logistics scenario..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
            />

            <button
              onClick={() => handleScenario()}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: "var(--warning)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loadingScenario ? "Analyzing..." : "Simulate"}
            </button>
          </div>

          {scenarioResult && (
            <div
              style={{
                padding: "20px",
                borderRadius: "14px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  marginBottom: "18px",
                }}
              >
                {[
                  {
                    label: "Current Risk",
                    value: scenarioResult.currentRisk + "%",
                    color: getRiskColor(
                      scenarioResult.currentRisk
                    ),
                  },

                  {
                    label: "Predicted Risk",
                    value:
                      scenarioResult.predictedRisk + "%",
                    color: getRiskColor(
                      scenarioResult.predictedRisk
                    ),
                  },

                  {
                    label: "Change",
                    value: scenarioResult.change,
                    color: "var(--danger)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </div>

                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  lineHeight: 1.7,
                  color: "var(--text-secondary)",
                }}
              >
                {scenarioResult.prediction}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT */}

        <div
          className="bento-card"
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "600px",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderBottom:
                "1px solid var(--border-subtle)",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              AI Operations Assistant
            </h3>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf:
                    msg.role === "user"
                      ? "flex-end"
                      : "flex-start",

                  maxWidth: "90%",

                  padding: "12px 14px",

                  borderRadius:
                    msg.role === "user"
                      ? "14px 14px 4px 14px"
                      : "14px 14px 14px 4px",

                  background:
                    msg.role === "user"
                      ? "var(--accent)"
                      : "var(--bg-elevated)",

                  color:
                    msg.role === "user"
                      ? "#fff"
                      : "var(--text-primary)",
                }}
              >
                {msg.content}
              </div>
            ))}

            {chatLoading && (
              <div
                style={{
                  padding: "10px 14px",
                }}
              >
                AI analyzing...
              </div>
            )}
          </div>

          <div
            style={{
              padding: "14px",
              borderTop:
                "1px solid var(--border-subtle)",

              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) =>
                setChatInput(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" && handleChat()
              }
              placeholder="Ask AI assistant..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
            />

            <button
              onClick={handleChat}
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}