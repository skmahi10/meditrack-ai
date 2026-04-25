"use client";

import { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from "@react-google-maps/api";
import { useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "360px",
  borderRadius: "12px",
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#12121A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#12121A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5A5A72" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1A1A2E" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A2E" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0A0A0F" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2A2A3E" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0A0A1A" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const statusColors = {
  "in-transit": "#6C63FF",
  "at-risk": "#FF4757",
  delivered: "#00D68F",
  created: "#FFB84D",
  failed: "#FF4757",
};

export default function LiveMap({ selectedShipment }) {
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const shipment = selectedShipment;

  const color = statusColors[shipment?.status] || "#6C63FF";

  const center = useMemo(() => {
    if (!shipment) return { lat: 22.5, lng: 78.0 };
    if (shipment.status === "delivered") {
      return { lat: shipment.destination?.lat || 22.5, lng: shipment.destination?.lng || 78.0 };
    }
    return {
      lat: shipment.currentLat || shipment.origin?.lat || 22.5,
      lng: shipment.currentLng || shipment.origin?.lng || 78.0,
    };
  }, [shipment]);

  const routePath = useMemo(() => {
    if (!shipment) return [];
    const points = [];
    if (shipment.origin) points.push({ lat: shipment.origin.lat, lng: shipment.origin.lng });
    if (shipment.checkpoints) {
      shipment.checkpoints.forEach((cp) => {
        if (cp.lat && cp.lng) points.push({ lat: cp.lat, lng: cp.lng });
      });
    }
    if (shipment.destination) points.push({ lat: shipment.destination.lat, lng: shipment.destination.lng });
    return points;
  }, [shipment]);

  if (loadError) {
    return (
      <div style={{ ...mapContainerStyle, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>{"\u{1F5FA}\u{FE0F}"}</div>
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--danger)" }}>Failed to load Google Maps</div>
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Check your API key</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ ...mapContainerStyle, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              border: "3px solid var(--accent-soft)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <div style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", color: "var(--text-muted)" }}>Loading map...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div style={{ ...mapContainerStyle, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-ibm)", fontSize: "13px", color: "var(--text-muted)" }}>Select a shipment to view tracking</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={6}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: 9 },
        }}
        onClick={() => setActiveMarker(null)}
      >
        {/* Route Line */}
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: color,
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        )}

        {/* Origin Marker */}
        {shipment.origin && (
          <Marker
            position={{ lat: shipment.origin.lat, lng: shipment.origin.lng }}
            onClick={() => setActiveMarker("origin")}
            icon={{
              path: "M-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0",
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
              scale: 1,
            }}
          >
            {activeMarker === "origin" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: "4px 8px", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e" }}>{shipment.origin.city}</div>
                  <div style={{ fontSize: "11px", color: "#5a5a72" }}>Origin</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Checkpoint Markers */}
        {shipment.checkpoints?.map((cp, idx) => (
          <Marker
            key={idx}
            position={{ lat: cp.lat, lng: cp.lng }}
            onClick={() => setActiveMarker("cp-" + idx)}
            icon={{
              path: "M-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0",
              fillColor: "#fff",
              fillOpacity: 1,
              strokeColor: color,
              strokeWeight: 2,
              scale: 1,
            }}
          >
            {activeMarker === "cp-" + idx && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: "4px 8px", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e" }}>{cp.city}</div>
                  <div style={{ fontSize: "11px", color: "#5a5a72" }}>Checkpoint {idx + 1}</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Current Position (if not delivered) */}
        {shipment.status !== "delivered" && shipment.currentLat && shipment.currentLng && (
          <Marker
            position={{ lat: shipment.currentLat, lng: shipment.currentLng }}
            onClick={() => setActiveMarker("current")}
            icon={{
              path: "M-8,0a8,8 0 1,0 16,0a8,8 0 1,0 -16,0",
              fillColor: color,
              fillOpacity: 0.3,
              strokeColor: color,
              strokeWeight: 2,
              scale: 1,
            }}
          >
            {activeMarker === "current" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: "4px 8px", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e" }}>{shipment.shipmentId}</div>
                  <div style={{ fontSize: "11px", color: "#5a5a72" }}>
                    {shipment.currentTemp}{"\u00B0"}C \u2022 {shipment.currentSpeed} km/h \u2022 {shipment.progress}%
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Destination Marker */}
        {shipment.destination && (
          <Marker
            position={{ lat: shipment.destination.lat, lng: shipment.destination.lng }}
            onClick={() => setActiveMarker("dest")}
            icon={{
              path: "M-6,0a6,6 0 1,0 12,0a6,6 0 1,0 -12,0",
              fillColor: shipment.status === "delivered" ? "#00D68F" : "#fff",
              fillOpacity: 1,
              strokeColor: shipment.status === "delivered" ? "#00D68F" : color,
              strokeWeight: 2,
              scale: 1,
            }}
          >
            {activeMarker === "dest" && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div style={{ padding: "4px 8px", fontFamily: "IBM Plex Sans, sans-serif" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#1a1a2e" }}>{shipment.destination.city}</div>
                  <div style={{ fontSize: "11px", color: "#5a5a72" }}>Destination</div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>

      {/* Overlay Info Card */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          background: "var(--bg-glass)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border-glass)",
          borderRadius: "10px",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            className="pulse-dot"
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: color,
              boxShadow: "0 0 8px " + color,
              animation: shipment.status !== "delivered" ? "pulse 2s infinite" : "none",
            }}
          />
          <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 500, color: "var(--text-primary)" }}>
            {shipment.shipmentId}
          </span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "6px",
              background: color + "20",
              color: color,
              fontFamily: "var(--font-ibm)",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {shipment.status?.replace("-", " ")}
          </span>
        </div>
        <div style={{ display: "flex", gap: "14px" }}>
          {[
            { label: "Temp", value: (shipment.currentTemp || "—") + "\u00B0C", color: (shipment.currentTemp > shipment.tempRange?.max || shipment.currentTemp < shipment.tempRange?.min) ? "var(--danger)" : "var(--success)" },
            { label: "Speed", value: (shipment.currentSpeed || 0) + " km/h", color: "var(--text-primary)" },
            { label: "Progress", value: (shipment.progress || 0) + "%", color: "var(--accent)" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontFamily: "var(--font-ibm)", fontSize: "9px", color: "var(--text-muted)", marginBottom: "2px" }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: item.color }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivered Badge */}
      {shipment.status === "delivered" && (
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--success-soft)",
            border: "1px solid var(--success)",
            borderRadius: "10px",
            padding: "8px 20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8l4 4 6-6" />
          </svg>
          <span style={{ fontFamily: "var(--font-ibm)", fontSize: "12px", fontWeight: 600, color: "var(--success)" }}>
            Delivered Successfully
          </span>
        </div>
      )}
    </div>
  );
}