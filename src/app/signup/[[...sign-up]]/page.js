"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "400px",
          background: "radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)",
          pointerEvents: "none",
          opacity: 0.3,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, var(--accent), #8B83FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L3 6v8l7 4 7-4V6l-7-4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M10 10v8M10 10l7-4M10 10L3 6" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          MediTrack
          <span style={{ color: "var(--accent)", marginLeft: "4px" }}>AI</span>
        </span>
      </div>

      <SignUp
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}