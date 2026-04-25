"use client";

import { useEffect, useRef, useState } from "react";

type RoutePoint = {
  city: string;
  lat: number;
  lng: number;
};

type ScenarioResponse = {
  prediction: string;
  currentRiskScore: number;
  predictedRiskScore: number;
  shipmentId: string;
  currentRoute: RoutePoint[];
  rerouteRoute: RoutePoint[];
  mapOverlay: {
    primaryColor: string;
    rerouteColor: string;
  };
};

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type MapLayer = {
  setMap: (map: GoogleMap | null) => void;
};

function isMapLayer(layer: MapLayer | null): layer is MapLayer {
  return layer !== null;
}

type GoogleMap = {
  fitBounds: (bounds: GoogleBounds, padding?: number) => void;
};

type GoogleBounds = {
  extend: (point: LatLngLiteral) => void;
};

type DirectionsServiceLike = {
  route: (request: Record<string, unknown>) => Promise<unknown>;
};

type DirectionsRendererLike = MapLayer & {
  setDirections: (result: unknown) => void;
};

type GoogleMapsApi = {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
    LatLngBounds: new () => GoogleBounds;
    Polyline: new (options: Record<string, unknown>) => MapLayer;
    DirectionsService: new () => DirectionsServiceLike;
    DirectionsRenderer: new (options: Record<string, unknown>) => DirectionsRendererLike;
    TravelMode: {
      DRIVING: string;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
    __meditrackMapsPromise?: Promise<GoogleMapsApi | null>;
  }
}

const DEFAULT_SCENARIO =
  "What if we reroute through Udaipur cold storage and then proceed to Delhi?";

function loadGoogleMaps(apiKey: string) {
  if (!apiKey) {
    return Promise.resolve(null);
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!window.__meditrackMapsPromise) {
    window.__meditrackMapsPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-google-maps="meditrack"]');

      if (existing) {
        existing.addEventListener("load", () => resolve(window.google || null));
        existing.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMaps = "meditrack";
      script.onload = () => resolve(window.google || null);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return window.__meditrackMapsPromise;
}

function toLatLng(points: RoutePoint[]) {
  return points.map((point) => ({ lat: point.lat, lng: point.lng }));
}

function toBounds(google: GoogleMapsApi, points: RoutePoint[]) {
  const bounds = new google.maps.LatLngBounds();
  points.forEach((point) => bounds.extend({ lat: point.lat, lng: point.lng }));
  return bounds;
}

function drawFallbackPolyline(
  google: GoogleMapsApi,
  map: GoogleMap,
  points: RoutePoint[],
  options: Record<string, unknown>,
) {
  return new google.maps.Polyline({
    path: toLatLng(points),
    map,
    ...options,
  });
}

function drawDirectionsRoute(
  google: GoogleMapsApi,
  map: GoogleMap,
  points: RoutePoint[],
  color: string,
): Promise<MapLayer | null> {
  if (points.length < 2) {
    return Promise.resolve(null);
  }

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: false,
    preserveViewport: true,
    polylineOptions: {
      strokeColor: color,
      strokeOpacity: 0.95,
      strokeWeight: 6,
    },
  });

  return directionsService
    .route({
      origin: points[0],
      destination: points[points.length - 1],
      waypoints: points.slice(1, -1).map((point) => ({ location: point, stopover: true })),
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: false,
    })
    .then((result: unknown) => {
      directionsRenderer.setDirections(result);
      return directionsRenderer as MapLayer;
    })
    .catch(() => {
      directionsRenderer.setMap(null);
      return drawFallbackPolyline(google, map, points, {
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: 6,
      });
    });
}

export default function Home() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const routeLayersRef = useRef<MapLayer[]>([]);
  const [scenarioText, setScenarioText] = useState(DEFAULT_SCENARIO);
  const [scenarioData, setScenarioData] = useState<ScenarioResponse | null>(null);
  const [status, setStatus] = useState("Loading reroute preview...");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    let cancelled = false;

    async function fetchScenario() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shipmentId: "SHP-2026-0042",
            whatIf: scenarioText,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load reroute scenario");
        }

        if (!cancelled) {
          setScenarioData(data);
          setStatus("Alternate route ready");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error ? requestError.message : "Failed to load reroute scenario",
          );
          setStatus("Scenario unavailable");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchScenario();
    return () => {
      cancelled = true;
    };
  }, [scenarioText]);

  useEffect(() => {
    let cancelled = false;

    async function renderMap() {
      if (!scenarioData || !mapRef.current) {
        return;
      }

      const google = await loadGoogleMaps(apiKey);

      if (cancelled) {
        return;
      }

      if (!google?.maps) {
        setStatus("Map key missing or Maps JavaScript API unavailable");
        return;
      }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: { lat: 23.5937, lng: 78.9629 },
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#07131f" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#07131f" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#163047" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b2942" }] },
          ],
        });
      }

      routeLayersRef.current.forEach((layer) => layer?.setMap?.(null));
      routeLayersRef.current = [];

      const allPoints = [...scenarioData.currentRoute, ...scenarioData.rerouteRoute];
      mapInstanceRef.current.fitBounds(toBounds(google, allPoints), 96);

      const baseLayer = await drawDirectionsRoute(
        google,
        mapInstanceRef.current,
        scenarioData.currentRoute,
        scenarioData.mapOverlay.primaryColor,
      );
      const rerouteLayer = await drawDirectionsRoute(
        google,
        mapInstanceRef.current,
        scenarioData.rerouteRoute,
        scenarioData.mapOverlay.rerouteColor,
      );

      if (!cancelled) {
        routeLayersRef.current = [baseLayer, rerouteLayer].filter(isMapLayer);
      }
    }

    renderMap();
    return () => {
      cancelled = true;
    };
  }, [apiKey, scenarioData]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#12253a_0%,#09111b_42%,#05080d_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-6">
        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/60 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                  MediTrack AI Control Room
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-white">
                  Reroute overlay for SHP-2026-0042
                </h1>
              </div>
              <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200">
                {status}
              </div>
            </div>
            <div ref={mapRef} className="h-[58vh] min-h-[420px] w-full bg-slate-950" />
          </div>

          <aside className="grid gap-4">
            <section className="rounded-lg border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Route Legend
              </p>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="h-1.5 w-8 rounded-full bg-indigo-500" />
                  Planned route
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="h-1.5 w-8 rounded-full bg-orange-500" />
                  AI reroute path
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-slate-950/60 p-5">
              <label className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Reroute scenario
              </label>
              <textarea
                value={scenarioText}
                onChange={(event) => setScenarioText(event.target.value)}
                className="mt-3 min-h-32 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500"
                placeholder="Describe the reroute scenario"
              />
              <p className="mt-3 text-sm text-slate-400">
                The alternate path is drawn directly on the map instead of only returning text.
              </p>
            </section>

            <section className="rounded-lg border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                Risk Outlook
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md border border-white/10 bg-slate-900/90 p-4">
                  <p className="text-xs text-slate-400">Current risk</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {scenarioData?.currentRiskScore ?? "--"}
                  </p>
                </div>
                <div className="rounded-md border border-orange-400/20 bg-orange-500/10 p-4">
                  <p className="text-xs text-orange-200/70">Predicted after reroute</p>
                  <p className="mt-2 text-3xl font-semibold text-orange-100">
                    {scenarioData?.predictedRiskScore ?? "--"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-slate-950/60 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                AI Summary
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-200">
                {error
                  ? error
                  : loading
                    ? "Preparing the suggested alternate route..."
                    : scenarioData?.prediction}
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
