// src/components/layout/ThemeProvider.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const darkTheme = {
  "--bg-primary": "#0A0A0F",
  "--bg-secondary": "#12121A",
  "--bg-elevated": "#1A1A2E",
  "--bg-glass": "rgba(18, 18, 26, 0.6)",
  "--border-glass": "rgba(108, 99, 255, 0.12)",
  "--border-subtle": "rgba(255, 255, 255, 0.06)",
  "--text-primary": "#EAEAF4",
  "--text-secondary": "#8B8BA7",
  "--text-muted": "#5A5A72",
  "--accent": "#6C63FF",
  "--accent-glow": "rgba(108, 99, 255, 0.25)",
  "--accent-soft": "rgba(108, 99, 255, 0.1)",
  "--success": "#00D68F",
  "--success-glow": "rgba(0, 214, 143, 0.25)",
  "--success-soft": "rgba(0, 214, 143, 0.1)",
  "--danger": "#FF4757",
  "--danger-glow": "rgba(255, 71, 87, 0.25)",
  "--danger-soft": "rgba(255, 71, 87, 0.1)",
  "--warning": "#FFB84D",
  "--warning-glow": "rgba(255, 184, 77, 0.25)",
  "--warning-soft": "rgba(255, 184, 77, 0.1)",
  "--shadow": "0 4px 24px rgba(0, 0, 0, 0.4)",
  "--shadow-lg": "0 8px 40px rgba(0, 0, 0, 0.6)",
  "--grid-dot": "rgba(108, 99, 255, 0.06)",
};

const lightTheme = {
  "--bg-primary": "#F4F4F8",
  "--bg-secondary": "#FFFFFF",
  "--bg-elevated": "#F0F0F5",
  "--bg-glass": "rgba(255, 255, 255, 0.7)",
  "--border-glass": "rgba(108, 99, 255, 0.15)",
  "--border-subtle": "rgba(0, 0, 0, 0.06)",
  "--text-primary": "#1A1A2E",
  "--text-secondary": "#5A5A72",
  "--text-muted": "#8B8BA7",
  "--accent": "#6C63FF",
  "--accent-glow": "rgba(108, 99, 255, 0.2)",
  "--accent-soft": "rgba(108, 99, 255, 0.08)",
  "--success": "#00B674",
  "--success-glow": "rgba(0, 182, 116, 0.2)",
  "--success-soft": "rgba(0, 182, 116, 0.08)",
  "--danger": "#E8364A",
  "--danger-glow": "rgba(232, 54, 74, 0.2)",
  "--danger-soft": "rgba(232, 54, 74, 0.08)",
  "--warning": "#E5A33D",
  "--warning-glow": "rgba(229, 163, 61, 0.2)",
  "--warning-soft": "rgba(229, 163, 61, 0.08)",
  "--shadow": "0 4px 24px rgba(0, 0, 0, 0.08)",
  "--shadow-lg": "0 8px 40px rgba(0, 0, 0, 0.12)",
  "--grid-dot": "rgba(108, 99, 255, 0.04)",
};

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("meditrack-theme") || "dark";
    setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const vars = theme === "dark" ? darkTheme : lightTheme;
    const root = document.documentElement;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.setAttribute("data-theme", theme);
    localStorage.setItem("meditrack-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  if (!mounted) {
    return (
      <div style={{ background: "#0A0A0F", minHeight: "100vh" }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}