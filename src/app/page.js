// src/app/page.js
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Digital Twin Engine",
    description: "Real-time simulation of shipment movement with temperature, humidity, speed, and GPS telemetry.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3L4 8.5v11L14 25l10-5.5v-11L14 3z" />
        <path d="M14 14v11M14 14l10-5.5M14 14L4 8.5" />
      </svg>
    ),
  },
  {
    title: "AI Risk Engine",
    description: "6-factor risk prediction powered by Google Gemini with natural language explanations.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="5" />
        <path d="M14 3v4M14 21v4M3 14h4M21 14h4M6.1 6.1l2.83 2.83M19.07 19.07l2.83 2.83M6.1 21.9l2.83-2.83M19.07 8.93l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: "Blockchain Ledger",
    description: "Immutable event chain with SHA-256 hash verification and tamper detection.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="20" height="7" rx="1.5" />
        <rect x="4" y="11" width="20" height="7" rx="1.5" />
        <rect x="4" y="19" width="20" height="6" rx="1.5" />
        <path d="M10 10v1M10 18v1" />
      </svg>
    ),
  },
  {
    title: "Smart Payments",
    description: "Conditional payment release tied to verified delivery conditions with escrow logic.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="22" height="16" rx="2.5" />
        <path d="M3 11h22" />
        <path d="M8 16h4M18 16h2" />
      </svg>
    ),
  },
  {
    title: "QR Trust Verification",
    description: "Patient-facing QR code to verify medicine safety with AI-generated summaries.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="8" height="8" rx="1" />
        <rect x="16" y="4" width="8" height="8" rx="1" />
        <rect x="4" y="16" width="8" height="8" rx="1" />
        <rect x="18" y="18" width="4" height="4" rx="0.5" />
        <path d="M16 16h2M24 16v4M16 24h2" />
      </svg>
    ),
  },
  {
    title: "Notification System",
    description: "Automated email and in-app alerts on critical events like breaches and delays.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3a7 7 0 017 7c0 6.3 2.8 8.4 2.8 8.4H4.2s2.8-2.1 2.8-8.4a7 7 0 017-7z" />
        <path d="M11.5 22.5a2.5 2.5 0 005 0" />
      </svg>
    ),
  },
];

const sdgs = [
  { number: 3, title: "Good Health & Well-being", color: "#4C9F38" },
  { number: 9, title: "Industry & Infrastructure", color: "#F36D25" },
  { number: 17, title: "Partnerships for Goals", color: "#19486A" },
];

const stats = [
  { value: "1.5M", label: "Children die annually from vaccine-preventable diseases" },
  { value: "50%", label: "Vaccines wasted before reaching patients" },
  { value: "$35B", label: "Lost annually to temperature excursions" },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        overflow: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 48px",
          background: "var(--bg-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent), #8B83FF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 10v8M10 10l7-4M10 10L3 6" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            MediTrack
            <span style={{ color: "var(--accent)", marginLeft: "4px" }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/login"
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              border: "1px solid var(--border-glass)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-ibm)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            style={{
              padding: "8px 20px",
              borderRadius: "10px",
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-ibm)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="grid-bg"
        style={{
          paddingTop: "160px",
          paddingBottom: "100px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
            pointerEvents: "none",
            opacity: 0.4,
          }}
        />

        {/* SDG Badges */}
        <div
          className="animate-fade-in"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "32px",
          }}
        >
          {sdgs.map((sdg) => (
            <span
              key={sdg.number}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                background: sdg.color + "18",
                border: "1px solid " + sdg.color + "40",
                color: sdg.color,
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              SDG {sdg.number}: {sdg.title}
            </span>
          ))}
        </div>

        {/* Google Solution Challenge badge */}
        <div
          className="animate-fade-in-delay-1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "var(--accent-soft)",
            border: "1px solid var(--border-glass)",
            marginBottom: "28px",
          }}
        >
          <span style={{ fontSize: "14px" }}>{"\u{1F3C6}"}</span>
          <span
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Google Solution Challenge 2026
          </span>
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-in-delay-2"
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "64px",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            margin: "0 auto 24px",
          }}
        >
          Intelligent
          <br />
          <span style={{ color: "var(--accent)" }}>Cold-Chain</span> for
          <br />
          Pharma
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-delay-3"
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "560px",
            margin: "0 auto 40px",
            lineHeight: 1.7,
          }}
        >
          Real-time monitoring, AI-powered risk prediction, blockchain verification,
          and conditional payments in a single unified platform.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-delay-4"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "14px",
          }}
        >
          <Link
            href="/login"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-ibm)",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 20px var(--accent-glow)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            Open Dashboard
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 9h10M10 5l4 4-4 4" />
            </svg>
          </Link>
          <Link
            href="/signup"
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              border: "1px solid var(--border-glass)",
              background: "var(--bg-glass)",
              backdropFilter: "blur(10px)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-ibm)",
              fontSize: "15px",
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            Create Account
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "60px 48px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bento-card"
            style={{
              flex: 1,
              textAlign: "center",
              padding: "32px 24px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "44px",
                fontWeight: 800,
                color: "var(--danger)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                marginBottom: "12px",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            textAlign: "center",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          Core Capabilities
        </h2>
        <p
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "16px",
            color: "var(--text-muted)",
            textAlign: "center",
            maxWidth: "500px",
            margin: "0 auto 48px",
          }}
        >
          Six integrated modules powering end-to-end cold-chain intelligence
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bento-card"
              style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px var(--accent-glow)",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "17px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-ibm)",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gemini Section */}
      <section
        style={{
          padding: "80px 48px",
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "var(--accent-soft)",
            border: "1px solid var(--border-glass)",
            marginBottom: "24px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-ibm)",
              fontSize: "13px",
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Powered by Google Gemini
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "36px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "20px",
          }}
        >
          AI at the Core, Not the Sidebar
        </h2>
        <p
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "16px",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto 40px",
          }}
        >
          Gemini is integrated across 6 touchpoints: incident reports, risk recommendations,
          contextual chatbot, compliance reports, scenario simulation, and QR trust summaries.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {[
            "Auto Incident Reports",
            "Risk Recommendations",
            "Contextual Chatbot",
            "Compliance Reports",
            "Scenario Simulator",
            "QR Trust Summary",
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-primary)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  minWidth: "24px",
                }}
              >
                {idx + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "40px 48px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          Google Solution Challenge 2026
        </div>
        <div
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          {"\"Every block in our chain is a promise that someone's medicine arrived safe.\""}
        </div>
        <div
          style={{
            fontFamily: "var(--font-ibm)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          Built by Mahi {"&"} Faizan
        </div>
      </footer>
    </div>
  );
}