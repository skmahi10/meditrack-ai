// src/components/dashboard/LiveMap.jsx
"use client";

import { useEffect, useRef, useState } from "react";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';
const OSRM = "https://router.project-osrm.org/route/v1/driving";

const C = {
  primary: "#6C63FF", primaryG: "#6C63FF88",
  trav: "#00D68F", travG: "#00D68F88",
  re: "#FFB84D", reG: "#FFB84D88",
  danger: "#FF4757",
  dot: "#00D68F", dotG: "#00D68F",
  origin: "#6C63FF", dest: "#FF4757",
  bg: "#0A0A0F", card: "rgba(15,15,25,0.85)",
  bdr: "rgba(108,99,255,0.15)",
  txt: "#E8E8F0", muted: "#6B6B80",
};

// ── Helpers ─────────────────────────────────────────────────────────────

async function osrmRoute(pts) {
  const c = pts.map(([la, ln]) => `${ln},${la}`).join(";");
  try {
    const r = await fetch(`${OSRM}/${c}?overview=full&geometries=geojson&steps=false`);
    const d = await r.json();
    if (d.code === "Ok" && d.routes?.[0])
      return d.routes[0].geometry.coordinates.map(([ln, la]) => [la, ln]);
  } catch (e) { console.warn("OSRM:", e); }
  return pts;
}

function hav([a, b], [c, d]) {
  const R = 6371, dL = ((c - a) * Math.PI) / 180, dN = ((d - b) * Math.PI) / 180;
  const x = Math.sin(dL / 2) ** 2 + Math.cos((a * Math.PI) / 180) * Math.cos((c * Math.PI) / 180) * Math.sin(dN / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function ok(p) { return Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]) && p[0] >= -90 && p[0] <= 90; }

/** Compute cumulative distances along a path */
function cumDist(path) {
  const d = [0];
  for (let i = 1; i < path.length; i++) d.push(d[i - 1] + hav(path[i - 1], path[i]));
  return d;
}

/** Get position at fraction t (0-1) along a path using precomputed cumDist */
function posOnPath(path, cd, t) {
  if (!path || path.length < 2) return path?.[0] || [0, 0];
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const total = cd[cd.length - 1];
  const target = t * total;
  for (let i = 1; i < cd.length; i++) {
    if (cd[i] >= target) {
      const f = (target - cd[i - 1]) / (cd[i] - cd[i - 1] || 1);
      return [
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f,
      ];
    }
  }
  return path[path.length - 1];
}

/** Slice path from start to fraction t */
function sliceTo(path, cd, t) {
  if (!path || path.length < 2) return path ? [...path] : [];
  if (t <= 0) return [path[0]];
  if (t >= 1) return [...path];
  const total = cd[cd.length - 1];
  const target = t * total;
  const result = [path[0]];
  for (let i = 1; i < cd.length; i++) {
    if (cd[i] >= target) {
      const f = (target - cd[i - 1]) / (cd[i] - cd[i - 1] || 1);
      result.push([
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f,
      ]);
      return result;
    }
    result.push(path[i]);
  }
  return result;
}

const CITIES = {
  Mumbai: [19.076, 72.877], Delhi: [28.614, 77.209], Bangalore: [12.972, 77.595],
  Chennai: [13.083, 80.271], Hyderabad: [17.385, 78.487], Pune: [18.52, 73.857],
  Kolkata: [22.572, 88.364], Ahmedabad: [23.022, 72.571], Jaipur: [26.912, 75.787], Lucknow: [26.847, 80.947],
};

function buildWP(ori, dst) {
  const s = [ori?.lat || 19.076, ori?.lng || 72.877];
  const e = [dst?.lat || 28.614, dst?.lng || 77.209];
  const m = [];
  for (const [n, c] of Object.entries(CITIES)) {
    if (n === ori?.city || n === dst?.city) continue;
    const ds = hav(s, c), de = hav(e, c), dt = hav(s, e);
    if (ds < dt && de < dt && ds > 50 && de > 50) m.push({ c, d: ds });
  }
  m.sort((a, b) => a.d - b.d);
  return [s, ...m.slice(0, 3).map((x) => x.c), e];
}

// The reroute diverges at REROUTE_START% of journey and rejoins at REROUTE_END%
const RE_START = 0.32; // 32% — where traffic is detected
const RE_END = 0.56;   // 56% — where reroute rejoins main route

// ── Component ───────────────────────────────────────────────────────────

export default function LiveMap({ selectedShipment }) {
  const cRef = useRef(null);
  const mapR = useRef(null);
  const ly = useRef({});
  const mainR = useRef(null);   // main OSRM route
  const mainCD = useRef(null);  // main cumDist
  const reR = useRef(null);     // reroute OSRM path
  const reCD = useRef(null);    // reroute cumDist
  const prevKey = useRef(null);
  const prevReKey = useRef(null);
  const lerpR = useRef({ prog: 0, target: 0, start: 0, dur: 1800, id: null });

  const [lOk, setLOk] = useState(false);
  const [rOk, setROk] = useState(false);

  const s = selectedShipment;
  const prog = s?.progress || 0;
  const stat = s?.status || "created";
  const isRe = s?.rerouted === true;

  // ── Load Leaflet ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("lf-css")) {
      const l = document.createElement("link"); l.id = "lf-css"; l.rel = "stylesheet";
      l.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
    if (window.L) { setLOk(true); return; }
    const sc = document.createElement("script");
    sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    sc.onload = () => setLOk(true); document.head.appendChild(sc);
  }, []);

  // ── Init map ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!lOk || !cRef.current || mapR.current) return;
    const L = window.L;
    const map = L.map(cRef.current, { center: [23.5, 77.5], zoom: 5, zoomControl: false, attributionControl: false });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
    mapR.current = map;
    return () => { map.remove(); mapR.current = null; };
  }, [lOk]);

  // ── Fetch main route ────────────────────────────────────────────────
  useEffect(() => {
    if (!lOk || !mapR.current || !s) return;
    const key = (s.origin?.city || "") + (s.destination?.city || "");
    if (prevKey.current === key && rOk) return;
    prevKey.current = key;

    (async () => {
      let a = 0;
      while (!mapR.current && a < 30) { await new Promise((r) => setTimeout(r, 100)); a++; }
      if (!mapR.current) return;
      const L = window.L, map = mapR.current;

      const wp = buildWP(s.origin, s.destination);
      let route = wp;
      try { const r = await osrmRoute(wp); if (r.length >= 2 && r.every(ok)) route = r; } catch {}
      mainR.current = route;
      mainCD.current = cumDist(route);

      // Clear layers
      Object.values(ly.current).forEach((l) => { if (map.hasLayer(l)) map.removeLayer(l); });
      ly.current = {};

      // Planned route (dashed purple)
      ly.current.fGlow = L.polyline(route, { color: C.primaryG, weight: 8, opacity: 0.25, lineCap: "round", lineJoin: "round" }).addTo(map);
      ly.current.fLine = L.polyline(route, { color: C.primary, weight: 4, opacity: 0.45, lineCap: "round", lineJoin: "round", dashArray: "8 12" }).addTo(map);

      // Origin
      ly.current.ori = L.marker(route[0], {
        icon: L.divIcon({ html: `<div style="width:18px;height:18px;border-radius:50%;background:${C.origin};border:3px solid #fff;box-shadow:0 0 14px ${C.origin}88"></div>`, iconSize: [18, 18], iconAnchor: [9, 9], className: "" }),
      }).bindTooltip(s.origin?.city || "Origin", { permanent: true, direction: "bottom", offset: [0, 14], className: "mt-tip" }).addTo(map);

      // Dest
      ly.current.dst = L.marker(route[route.length - 1], {
        icon: L.divIcon({ html: `<div style="width:18px;height:18px;border-radius:50%;background:${C.dest};border:3px solid #fff;box-shadow:0 0 14px ${C.dest}88"></div>`, iconSize: [18, 18], iconAnchor: [9, 9], className: "" }),
      }).bindTooltip(s.destination?.city || "Destination", { permanent: true, direction: "bottom", offset: [0, 14], className: "mt-tip" }).addTo(map);

      // Traveled green
      ly.current.tG = L.polyline([], { color: C.travG, weight: 10, opacity: 0.35, lineCap: "round", lineJoin: "round" }).addTo(map);
      ly.current.tL = L.polyline([], { color: C.trav, weight: 4, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(map);

      // Reroute full (dashed amber) — populated later
      ly.current.rFG = L.polyline([], { color: C.reG, weight: 10, opacity: 0, lineCap: "round", lineJoin: "round" }).addTo(map);
      ly.current.rFL = L.polyline([], { color: C.re, weight: 4, opacity: 0, lineCap: "round", lineJoin: "round", dashArray: "8 12" }).addTo(map);

      // Reroute traveled (solid amber) — grows
      ly.current.rTG = L.polyline([], { color: C.reG, weight: 10, opacity: 0, lineCap: "round", lineJoin: "round" }).addTo(map);
      ly.current.rTL = L.polyline([], { color: C.re, weight: 4, opacity: 0, lineCap: "round", lineJoin: "round" }).addTo(map);

      // Truck
      ly.current.dot = L.marker(route[0], {
        icon: L.divIcon({
          html: `<div class="mt-do"><div class="mt-di"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div></div>`,
          iconSize: [36, 36], iconAnchor: [18, 18], className: "",
        }), zIndexOffset: 1000,
      }).addTo(map);

      // Traffic marker (hidden)
      const trafficPos = posOnPath(route, cumDist(route), RE_START);
      ly.current.traf = L.marker(trafficPos, {
        icon: L.divIcon({
          html: `<div style="width:34px;height:34px;border-radius:50%;background:${C.danger}22;border:2px solid ${C.danger};display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px ${C.danger}44;animation:mt-pt 1.5s ease-in-out infinite"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="${C.danger}" stroke-width="2" stroke-linecap="round"><path d="M8 2L2 14h12L8 2z"/><path d="M8 6v3"/><circle cx="8" cy="11.5" r=".5" fill="${C.danger}"/></svg></div>`,
          iconSize: [34, 34], iconAnchor: [17, 17], className: "",
        }), opacity: 0,
      }).addTo(map);

      map.fitBounds(L.latLngBounds(route), { padding: [50, 50] });
      setROk(true);
    })();
  }, [lOk, s?.origin?.city, s?.destination?.city]);

  // ── Fetch OSRM reroute when rerouted turns on ──────────────────────
  useEffect(() => {
    if (!rOk || !mainR.current) return;
    if (!isRe || !s?.rerouteCoords) {
      // Clear reroute
      reR.current = null; reCD.current = null; prevReKey.current = null;
      const l = ly.current;
      l.rFG?.setLatLngs([]); l.rFG?.setStyle({ opacity: 0 });
      l.rFL?.setLatLngs([]); l.rFL?.setStyle({ opacity: 0 });
      l.rTG?.setLatLngs([]); l.rTG?.setStyle({ opacity: 0 });
      l.rTL?.setLatLngs([]); l.rTL?.setStyle({ opacity: 0 });
      l.fLine?.setStyle({ opacity: 0.45, dashArray: "8 12" });
      return;
    }

    let coords;
    try { coords = typeof s.rerouteCoords === "string" ? JSON.parse(s.rerouteCoords) : s.rerouteCoords; } catch { return; }
    if (!Array.isArray(coords) || coords.length < 2) return;

    // Build proper reroute: diverge from main route at RE_START, go through detour waypoints, rejoin at RE_END
    const mainRoute = mainR.current;
    const mainCd = mainCD.current;
    const divergePoint = posOnPath(mainRoute, mainCd, RE_START);
    const rejoinPoint = posOnPath(mainRoute, mainCd, RE_END);

    // Waypoints: diverge → detour cities → rejoin
    const reWaypoints = [divergePoint, ...coords.filter((c) => ok(c)), rejoinPoint];

    const rKey = JSON.stringify(reWaypoints);
    if (prevReKey.current === rKey) return;
    prevReKey.current = rKey;

    (async () => {
      let routed = reWaypoints;
      try {
        const r = await osrmRoute(reWaypoints);
        if (r.length >= 2 && r.every(ok)) routed = r;
      } catch {}
      reR.current = routed;
      reCD.current = cumDist(routed);

      const l = ly.current;
      l.rFG?.setLatLngs(routed); l.rFG?.setStyle({ opacity: 0.3 });
      l.rFL?.setLatLngs(routed); l.rFL?.setStyle({ opacity: 0.6, dashArray: "8 12" });
      l.fLine?.setStyle({ opacity: 0.15, dashArray: "4 8" });
    })();
  }, [isRe, s?.rerouteCoords, rOk]);

  // ── Animate truck along route using progress % ─────────────────────
  useEffect(() => {
    if (!rOk || !mapR.current || !mainR.current) return;
    const l = ly.current;
    if (!l.dot) return;

    const lerp = lerpR.current;
    if (lerp.id) cancelAnimationFrame(lerp.id);

    lerp.prog = lerp.target; // snap from where we were
    lerp.target = prog / 100; // 0-1
    lerp.start = performance.now();
    lerp.dur = 1800;

    const mainRoute = mainR.current;
    const mainCd = mainCD.current;

    const tick = (now) => {
      const elapsed = now - lerp.start;
      const t = Math.min(elapsed / lerp.dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      const currentProg = lerp.prog + (lerp.target - lerp.prog) * ease;

      // Determine truck position
      let truckPos;
      const reRoute = reR.current;
      const reCd = reCD.current;
      const onReroute = isRe && reRoute && reCd && currentProg >= RE_START && currentProg <= RE_END;

      if (onReroute) {
        // Map currentProg (RE_START..RE_END) → 0..1 on reroute path
        const reT = (currentProg - RE_START) / (RE_END - RE_START);
        truckPos = posOnPath(reRoute, reCd, reT);

        // Traveled: green up to diverge point, amber on reroute
        const greenSlice = sliceTo(mainRoute, mainCd, RE_START);
        l.tG?.setLatLngs(greenSlice);
        l.tL?.setLatLngs(greenSlice);

        const amberSlice = sliceTo(reRoute, reCd, reT);
        l.rTG?.setLatLngs(amberSlice); l.rTG?.setStyle({ opacity: 0.35 });
        l.rTL?.setLatLngs(amberSlice); l.rTL?.setStyle({ opacity: 0.9 });
      } else {
        // On main route
        truckPos = posOnPath(mainRoute, mainCd, currentProg);

        const greenSlice = sliceTo(mainRoute, mainCd, currentProg);
        l.tG?.setLatLngs(greenSlice);
        l.tL?.setLatLngs(greenSlice);

        // If past reroute, keep the full reroute as traveled
        if (currentProg > RE_END && reRoute && reCd) {
          l.rTG?.setLatLngs(reRoute); l.rTG?.setStyle({ opacity: 0.35 });
          l.rTL?.setLatLngs(reRoute); l.rTL?.setStyle({ opacity: 0.9 });
        } else if (!isRe) {
          l.rTG?.setLatLngs([]); l.rTG?.setStyle({ opacity: 0 });
          l.rTL?.setLatLngs([]); l.rTL?.setStyle({ opacity: 0 });
        }
      }

      // Move truck
      if (truckPos) l.dot.setLatLng(truckPos);

      // Pan to follow (only at end of lerp to avoid jitter)
      if (t >= 0.95 && stat !== "delivered" && currentProg > 0.03) {
        mapR.current?.panTo(truckPos, { animate: true, duration: 0.8, noMoveStart: true });
      }

      if (t < 1) lerp.id = requestAnimationFrame(tick);
      else lerp.id = null;
    };

    lerp.id = requestAnimationFrame(tick);
    return () => { if (lerpR.current.id) { cancelAnimationFrame(lerpR.current.id); lerpR.current.id = null; } };
  }, [prog, rOk, isRe, stat]);

  // ── Status visuals ────────────────────────────────────────────────
  useEffect(() => {
    if (!rOk) return;
    const l = ly.current;
    if (stat === "at-risk" || isRe) l.traf?.setOpacity(1);
    else l.traf?.setOpacity(0);
    if (stat === "delivered") {
      const mr = mainR.current;
      if (mr) mapR.current?.setView(mr[mr.length - 1], 10, { animate: true });
    }
  }, [stat, isRe, rOk]);

  // ── UI ────────────────────────────────────────────────────────────
  const stxt = stat === "delivered" ? "\u2713 Delivered to " + (s?.destination?.city || "destination")
    : isRe ? "\u26A0 Traffic detected \u2014 Rerouted via " + (s?.rerouteVia || "alternate")
    : stat === "at-risk" ? "\u26A0 Temperature breach detected"
    : stat === "in-transit" ? "In Transit \u2014 " + (s?.origin?.city || "") + " \u2192 " + (s?.destination?.city || "")
    : "Waiting for dispatch";

  const pc = stat === "delivered" ? C.trav : isRe ? C.re : stat === "at-risk" ? C.danger : stat === "in-transit" ? C.trav : C.muted;
  const pl = stat === "delivered" ? "DELIVERED" : isRe ? "REROUTED" : stat === "at-risk" ? "ALERT" : stat === "in-transit" ? "IN TRANSIT" : "STANDBY";

  return (
    <div style={{ width: "100%", height: "400px", borderRadius: 14, background: C.bg, border: `1px solid ${C.bdr}`, position: "relative", overflow: "hidden" }}>
      <div ref={cRef} style={{ width: "100%", height: "100%", borderRadius: 14 }} />

      {!rOk && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, zIndex: 1000, borderRadius: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${C.primary}33`, borderTopColor: C.primary, borderRadius: "50%", animation: "mt-sp 1s linear infinite", margin: "0 auto 12px" }} />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: C.muted }}>Loading route...</span>
          </div>
        </div>
      )}

      {/* Status overlay */}
      <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, background: C.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "12px 16px", minWidth: 240, maxWidth: 300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc, boxShadow: `0 0 8px ${pc}`, animation: stat === "at-risk" || isRe ? "mt-p .8s ease-in-out infinite" : stat === "in-transit" ? "mt-p 2s ease-in-out infinite" : "none" }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, fontWeight: 600, color: pc, letterSpacing: "1.5px" }}>{pl}</span>
        </div>
        <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, color: C.txt, lineHeight: 1.4, marginBottom: 10 }}>{stxt}</div>
        <div style={{ width: "100%", height: 4, background: `${C.muted}22`, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${prog}%`, height: "100%", background: isRe ? C.re : stat === "at-risk" ? C.danger : C.trav, borderRadius: 2, transition: "width 1.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: C.muted }}>
          <span>{s?.distanceCovered || 0} / {s?.distanceTotal || 0} km</span>
          <span>{prog}%</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ position: "absolute", bottom: 12, left: 12, zIndex: 1000, background: C.card, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${C.bdr}`, borderRadius: 10, padding: "8px 14px", display: "flex", gap: 16, alignItems: "center" }}>
        <Leg color={C.primary} dashed label="Planned Route" />
        <Leg color={C.trav} label="Traveled" />
        {isRe && <Leg color={C.re} label="Rerouted" />}
        {stat === "at-risk" && <Leg color={C.danger} label="Alert" pulse />}
      </div>

      {stat === "at-risk" && !isRe && <Alrt title="Temperature breach detected" sub="Cooling system recovering..." color={C.danger} />}
      {isRe && <Alrt title={"Traffic congestion \u2014 rerouted via " + (s?.rerouteVia || "alternate")} sub="AI selected fastest alternate route" color={C.re} />}
      {stat === "delivered" && <Alrt title={"\u2713 Shipment delivered to " + (s?.destination?.city || "destination")} sub="Delivery confirmed with receiver signature" color={C.trav} />}

      <style jsx global>{`
        .mt-tip{background:${C.card}!important;border:1px solid ${C.bdr}!important;border-radius:8px!important;padding:4px 10px!important;font-family:"IBM Plex Sans",sans-serif!important;font-size:11px!important;font-weight:600!important;color:${C.txt}!important;box-shadow:0 4px 20px rgba(0,0,0,.4)!important}
        .mt-tip::before,.leaflet-tooltip-bottom::before{border-bottom-color:${C.bdr}!important}
        .mt-do{width:36px;height:36px;border-radius:50%;background:${C.dotG}22;display:flex;align-items:center;justify-content:center;animation:mt-dt 2s ease-in-out infinite}
        .mt-di{width:26px;height:26px;border-radius:50%;background:${C.dot};display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px ${C.dotG}88,0 2px 8px rgba(0,0,0,.3)}
        @keyframes mt-dt{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:.85}}
        @keyframes mt-p{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes mt-pt{0%,100%{transform:scale(1);box-shadow:0 0 12px ${C.danger}44}50%{transform:scale(1.12);box-shadow:0 0 24px ${C.danger}66}}
        @keyframes mt-sp{to{transform:rotate(360deg)}}
        @keyframes mt-up{from{transform:translateX(-50%) translateY(10px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
        .leaflet-control-attribution{background:transparent!important;font-size:9px!important;color:${C.muted}88!important}
        .leaflet-control-attribution a{color:${C.muted}88!important}
        .leaflet-control-zoom a{background:${C.card}!important;color:${C.txt}!important;border-color:${C.bdr}!important}
        .leaflet-control-zoom a:hover{background:${C.primary}22!important}
      `}</style>
    </div>
  );
}

function Alrt({ title, sub, color }) {
  return (
    <div style={{ position: "absolute", bottom: 56, left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 12, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, animation: "mt-up .3s ease-out", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", whiteSpace: "nowrap" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: "mt-p .8s ease-in-out infinite" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"><path d="M7 1L1 13h12L7 1z"/><path d="M7 5v3"/><circle cx="7" cy="10.5" r=".5" fill={color}/></svg>
      </div>
      <div>
        <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", fontSize: 12, fontWeight: 600, color }}>{title}</div>
        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: `${color}aa`, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Leg({ color, label, dashed, pulse }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 18, height: 3, borderRadius: 2, background: dashed ? "transparent" : color, opacity: dashed ? .6 : 1, backgroundImage: dashed ? `repeating-linear-gradient(90deg,${color} 0,${color} 4px,transparent 4px,transparent 8px)` : "none", animation: pulse ? "mt-p .8s ease-in-out infinite" : "none" }} />
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color, letterSpacing: ".5px", whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}