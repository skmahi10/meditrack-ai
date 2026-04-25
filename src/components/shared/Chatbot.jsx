// src/components/shared/Chatbot.jsx
"use client";

import { useState, useRef, useEffect } from "react";

const mockResponses = [
  "Based on the current telemetry data, SHP-2026-0042 is maintaining safe temperature levels at -17.2\u00B0C. The minor delay near Jaipur has resolved and the shipment is back on schedule.",
  "The risk score for SHP-2026-0043 is elevated at 72% due to a cooling unit malfunction. Battery level dropped to 15%, causing temperature to rise above the 8\u00B0C threshold. I recommend activating backup cooling immediately.",
  "Looking at the blockchain ledger, all 8 blocks for SHP-2026-0042 are verified with valid hash chains. No tampering detected. The chain integrity is VALID.",
  "Payment PAY-0042 is currently held in escrow at \u20B9125,000. It will be released automatically once all four conditions are met: delivery confirmation, temperature compliance, blockchain verification, and receiver signature.",
  "Based on current transit patterns, I predict SHP-2026-0042 will arrive in Delhi by approximately 21:00 IST. Current progress is 62% with an ETA of 3 hours.",
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm MediTrack AI assistant powered by Gemini. Ask me anything about your shipments, risk analysis, or supply chain operations.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: "msg-" + Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 100,
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          border: "none",
          background: "linear-gradient(135deg, var(--accent), #8B83FF)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px var(--accent-glow), 0 0 40px var(--accent-glow)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease",
          transform: isOpen ? "rotate(45deg) scale(0.9)" : "rotate(0deg) scale(1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOpen
            ? "rotate(45deg) scale(0.95)"
            : "rotate(0deg) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isOpen
            ? "rotate(45deg) scale(0.9)"
            : "rotate(0deg) scale(1)";
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "96px",
            right: "28px",
            zIndex: 99,
            width: "380px",
            height: "520px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--bg-elevated)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, var(--accent), #8B83FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 16px var(--accent-glow)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="9" r="3" />
                <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.22 4.22l1.42 1.42M12.36 12.36l1.42 1.42M4.22 13.78l1.42-1.42M12.36 5.64l1.42-1.42" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                MediTrack AI
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "2px",
                }}
              >
                <div className="pulse-dot pulse-dot-success" style={{ width: "6px", height: "6px" }} />
                <span
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "11px",
                    color: "var(--success)",
                  }}
                >
                  Powered by Gemini
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                border: "none",
                background: "transparent",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
          </div>

          {/* Messages */}
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "var(--accent)"
                        : "var(--bg-elevated)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid var(--border-subtle)",
                    color:
                      msg.role === "user" ? "#fff" : "var(--text-primary)",
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-ibm)",
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    padding: "0 4px",
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "var(--accent)",
                        opacity: 0.4,
                        animation: "typingBounce 1.2s infinite",
                        animationDelay: i * 0.15 + "s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div
            style={{
              padding: "8px 16px",
              display: "flex",
              gap: "6px",
              overflowX: "auto",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            {[
              "Why is risk high?",
              "Check temperature",
              "ETA update",
              "Payment status",
            ].map((action) => (
              <button
                key={action}
                onClick={() => {
                  const userMsg = {
                    id: "msg-" + Date.now(),
                    role: "user",
                    content: action,
                    timestamp: new Date().toISOString(),
                  };
                  setMessages((prev) => [...prev, userMsg]);
                  setIsTyping(true);
                  setTimeout(() => {
                    const response = {
                      id: "msg-" + (Date.now() + 1),
                      role: "assistant",
                      content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
                      timestamp: new Date().toISOString(),
                    };
                    setMessages((prev) => [...prev, response]);
                    setIsTyping(false);
                  }, 1500);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-glass)",
                  background: "var(--bg-elevated)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-soft)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderColor = "var(--border-glass)";
                }}
              >
                {action}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--bg-elevated)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about shipments, risk, payments..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                outline: "none",
                color: "var(--text-primary)",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                border: "none",
                background: input.trim() ? "var(--accent)" : "var(--bg-secondary)",
                color: input.trim() ? "#fff" : "var(--text-muted)",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 2L8 10M16 2l-5 14-3-7-7-3 14-5z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Typing animation keyframes */}
      <style>
        {`
          @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-6px); opacity: 1; }
          }
        `}
      </style>
    </>
  );
}