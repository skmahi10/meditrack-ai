"use client";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  sendShipmentCreated,
} from "@/lib/email";

const products = [
  { name: "Covaxin", category: "vaccine", tempMin: -20, tempMax: -15 },
  { name: "Insulin Glargine", category: "insulin", tempMin: 2, tempMax: 8 },
  { name: "Hepatitis B Vaccine", category: "vaccine", tempMin: 2, tempMax: 8 },
  { name: "Remdesivir", category: "biologic", tempMin: 2, tempMax: 8 },
  { name: "mRNA Booster", category: "vaccine", tempMin: -25, tempMax: -15 },
];

const cities = [
  { city: "Mumbai", lat: 19.076, lng: 72.877 },
  { city: "Delhi", lat: 28.614, lng: 77.209 },
  { city: "Bangalore", lat: 12.972, lng: 77.595 },
  { city: "Chennai", lat: 13.083, lng: 80.271 },
  { city: "Hyderabad", lat: 17.385, lng: 78.487 },
  { city: "Pune", lat: 18.52, lng: 73.857 },
  { city: "Kolkata", lat: 22.572, lng: 88.364 },
  { city: "Ahmedabad", lat: 23.022, lng: 72.571 },
  { city: "Jaipur", lat: 26.912, lng: 75.787 },
  { city: "Lucknow", lat: 26.847, lng: 80.947 },
];

export default function CreateShipmentModal({ isOpen, onClose, onCreated }) {
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    product: "",
    batchNumber: "",
    quantity: 500,
    origin: "",
    destination: "",
    priority: "normal",
  });

  const selectedProduct = products.find((p) => p.name === form.product);

  const generateShipmentId = () => {
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return "SHP-2026-" + num;
  };

  const handleCreate = async () => {
    setError("");

    if (!form.product || !form.origin || !form.destination || !form.batchNumber) {
      setError("Please fill all required fields");
      return;
    }

    if (form.origin === form.destination) {
      setError("Origin and destination must be different");
      return;
    }

    setLoading(true);

    try {
      const originCity = cities.find((c) => c.city === form.origin);
      const destCity = cities.find((c) => c.city === form.destination);
      const shipmentId = generateShipmentId();

      const shipmentData = {
        shipmentId,
        product: form.product,
        productCategory: selectedProduct.category,
        batchNumber: form.batchNumber,
        tempRange: { min: selectedProduct.tempMin, max: selectedProduct.tempMax },
        quantity: Number(form.quantity),
        origin: { city: originCity.city, lat: originCity.lat, lng: originCity.lng },
        destination: { city: destCity.city, lat: destCity.lat, lng: destCity.lng },
        checkpoints: [],
        carrierId: user?.id || "USR-003",
        receiverId: user?.id || "USR-001",
        createdBy: user?.id || "USR-002",
        status: "created",
        priority: form.priority,
        currentTemp: selectedProduct.tempMin + 1,
        currentHumidity: 42,
        currentSpeed: 0,
        currentLat: originCity.lat,
        currentLng: originCity.lng,
        riskScore: 0,
        riskFactors: {
          temperature: 0,
          delay: 0,
          route: 0,
          weather: 0,
          cooling: 0,
          transit: 0,
        },
        eta: 720,
        progress: 0,
        distanceTotal: 1420,
        distanceCovered: 0,
        aiRecommendation: null,
        incidentReport: null,
        complianceReport: null,
        receiverSignature: false,
        qrCodeUrl: null,
        createdAt: Timestamp.now(),
        pickedUpAt: null,
        deliveredAt: null,
      };

    await addDoc(collection(db, "shipments"), shipmentData);
      setStep(2);
      setSuccess("Shipment " + shipmentId + " created successfully!");

      // Wait for Firestore to propagate
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Now run simulation
      setSimulating(true);
      try {
        const res = await fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipmentId }),
        });
        const data = await res.json();

        if (data.success) {
          setSuccess("Shipment " + shipmentId + " created and simulation complete! " + data.totalBlocks + " blockchain blocks generated.");
        } else {
          setSuccess("Shipment " + shipmentId + " created. Simulation pending: " + (data.error || "API not ready"));
        }
      } catch (simErr) {
        setSuccess("Shipment " + shipmentId + " created. Simulation will run when backend is ready.");
      }
      setSimulating(false);

      // Now run simulation
      setSimulating(true);
      try {
        const res = await fetch("/api/simulation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipmentId }),
        });
        const data = await res.json();

        if (data.success) {
          setSuccess("Shipment " + shipmentId + " created and simulation complete! " + data.totalBlocks + " blockchain blocks generated.");
        } else {
          setSuccess("Shipment " + shipmentId + " created. Simulation pending: " + (data.error || "API not ready"));
        }
      } catch (simErr) {
        setSuccess("Shipment " + shipmentId + " created. Simulation will run when backend is ready.");
      }
      setSimulating(false);

      if (onCreated) onCreated();
    } catch (err) {
      setError("Failed to create shipment: " + err.message);
    }

    setLoading(false);
  };

  const handleClose = () => {
    setStep(1);
    setError("");
    setSuccess("");
    setForm({
      product: "",
      batchNumber: "",
      quantity: 500,
      origin: "",
      destination: "",
      priority: "normal",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "20px",
          boxShadow: "var(--shadow-lg)",
          zIndex: 201,
          animation: "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 28px 16px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "18px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {step === 1 ? "Create New Shipment" : "Shipment Created"}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-ibm)",
                fontSize: "12px",
                color: "var(--text-muted)",
                margin: "4px 0 0 0",
              }}
            >
              {step === 1 ? "Fill in shipment details to begin cold-chain tracking" : "Processing simulation..."}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger-soft)";
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 4L4 12M4 4l8 8" />
            </svg>
          </button>
        </div>

        {/* Step 1 — Form */}
        {step === 1 && (
          <div style={{ padding: "20px 28px 28px" }}>
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--danger-soft)",
                  border: "1px solid rgba(255, 71, 87, 0.2)",
                  color: "var(--danger)",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "12px",
                  fontWeight: 500,
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Product */}
              <div>
                <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Product *
                </label>
                <select
                  value={form.product}
                  onChange={(e) => setForm((prev) => ({ ...prev, product: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg-elevated)",
                    color: form.product ? "var(--text-primary)" : "var(--text-muted)",
                    fontFamily: "var(--font-ibm)",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    appearance: "none",
                  }}
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div style={{ marginTop: "6px", fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--accent)" }}>
                    Required temp: {selectedProduct.tempMin}{"\u00B0"}C to {selectedProduct.tempMax}{"\u00B0"}C
                  </div>
                )}
              </div>

              {/* Batch + Quantity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={form.batchNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="CVX-2026-BN-4421"
                    style={{
                      width: "100%",
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
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Quantity (units)
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    min="1"
                    style={{
                      width: "100%",
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
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                  />
                </div>
              </div>

              {/* Origin + Destination */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Origin *
                  </label>
                  <select
                    value={form.origin}
                    onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                      color: form.origin ? "var(--text-primary)" : "var(--text-muted)",
                      fontFamily: "var(--font-ibm)",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="">Select origin</option>
                    {cities.map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Destination *
                  </label>
                  <select
                    value={form.destination}
                    onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-elevated)",
                      color: form.destination ? "var(--text-primary)" : "var(--text-muted)",
                      fontFamily: "var(--font-ibm)",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="">Select destination</option>
                    {cities.filter((c) => c.city !== form.origin).map((c) => (
                      <option key={c.city} value={c.city}>{c.city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Route Preview */}
              {form.origin && form.destination && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "var(--accent-soft)",
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {form.origin}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                  <span style={{ fontFamily: "var(--font-ibm)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {form.destination}
                  </span>
                </div>
              )}

              {/* Priority */}
              <div>
                <label style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", fontWeight: 500, color: "var(--text-muted)", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Priority
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["normal", "urgent", "critical"].map((p) => {
                    const colors = {
                      normal: { color: "var(--text-secondary)", soft: "var(--bg-elevated)" },
                      urgent: { color: "var(--warning)", soft: "var(--warning-soft)" },
                      critical: { color: "var(--danger)", soft: "var(--danger-soft)" },
                    };
                    return (
                      <button
                        key={p}
                        onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: form.priority === p ? "1.5px solid " + colors[p].color : "1px solid var(--border-subtle)",
                          background: form.priority === p ? colors[p].soft : "transparent",
                          color: form.priority === p ? colors[p].color : "var(--text-muted)",
                          fontFamily: "var(--font-ibm)",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                          textTransform: "capitalize",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleCreate}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "10px",
                  border: "none",
                  background: loading ? "var(--accent)88" : "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-ibm)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  marginTop: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 16px var(--accent-glow)",
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Creating shipment...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                    Create Shipment
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Success */}
        {step === 2 && (
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--success-soft)",
                border: "3px solid var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 0 24px var(--success-glow)",
                animation: "scaleIn 0.5s ease",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round">
                <path d="M6 14l6 6 10-10" />
              </svg>
            </div>

            <div style={{ fontFamily: "var(--font-outfit)", fontSize: "18px", fontWeight: 600, color: "var(--success)", marginBottom: "8px" }}>
              {simulating ? "Running Simulation..." : "Success!"}
            </div>

            <p style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
              {success}
            </p>

            {simulating && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid var(--accent)44",
                    borderTopColor: "var(--accent)",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--accent)" }}>
                  Generating telemetry, blockchain, and AI reports...
                </span>
              </div>
            )}

            <button
              onClick={handleClose}
              style={{
                padding: "10px 24px",
                borderRadius: "10px",
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-ibm)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 4px 16px var(--accent-glow)",
              }}
            >
              Close
            </button>
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </>
  );
}