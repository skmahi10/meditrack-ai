import { db } from "../../../lib/firebase-admin.js";
import { simulateScenario } from "../../../lib/gemini.js";

export const runtime = "nodejs";

const KNOWN_ROUTE_POINTS = {
  Mumbai: { city: "Mumbai", lat: 19.076, lng: 72.877 },
  Surat: { city: "Surat", lat: 21.17, lng: 72.831 },
  Ahmedabad: { city: "Ahmedabad", lat: 23.022, lng: 72.571 },
  Jaipur: { city: "Jaipur", lat: 26.912, lng: 75.787 },
  Delhi: { city: "Delhi", lat: 28.614, lng: 77.209 },
  Udaipur: { city: "Udaipur", lat: 24.5854, lng: 73.7125 },
  Gurugram: { city: "Gurugram", lat: 28.4595, lng: 77.0266 },
  Indore: { city: "Indore", lat: 22.7196, lng: 75.8577 },
  Vadodara: { city: "Vadodara", lat: 22.3072, lng: 73.1812 },
};

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

function predictedRisk(currentRiskScore, whatIf) {
  const text = whatIf.toLowerCase();
  let delta = 10;

  if (text.includes("temperature") || text.includes("cooling") || text.includes("battery")) {
    delta += 25;
  }

  if (text.includes("delay") || text.includes("traffic") || text.includes("reroute")) {
    delta += 15;
  }

  if (text.includes("backup") || text.includes("recover") || text.includes("cold storage")) {
    delta -= 20;
  }

  return Math.max(0, Math.min(100, currentRiskScore + delta));
}

async function getShipment(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

function routePoint(city, lat, lng) {
  return { city, lat, lng };
}

function currentRouteFor(shipment) {
  return [
    routePoint(shipment.origin.city, shipment.origin.lat, shipment.origin.lng),
    ...(shipment.checkpoints || []).map((checkpoint) =>
      routePoint(checkpoint.city, checkpoint.lat, checkpoint.lng),
    ),
    routePoint(
      shipment.destination.city,
      shipment.destination.lat,
      shipment.destination.lng,
    ),
  ];
}

function currentPositionFor(shipment) {
  return routePoint(
    shipment.status === "created" ? shipment.origin.city : "Current Position",
    shipment.status === "created" ? shipment.origin.lat : shipment.currentLat,
    shipment.status === "created" ? shipment.origin.lng : shipment.currentLng,
  );
}

function firstMentionedCity(whatIf) {
  const text = whatIf.toLowerCase();
  return Object.values(KNOWN_ROUTE_POINTS).find((point) =>
    text.includes(point.city.toLowerCase()),
  );
}

function rerouteWaypoints(shipment, whatIf) {
  const explicitCity = firstMentionedCity(whatIf);
  const destination = routePoint(
    shipment.destination.city,
    shipment.destination.lat,
    shipment.destination.lng,
  );

  if (explicitCity && explicitCity.city !== shipment.destination.city) {
    return [explicitCity, destination];
  }

  if (shipment.origin.city === "Mumbai" && shipment.destination.city === "Delhi") {
    return [
      KNOWN_ROUTE_POINTS.Udaipur,
      KNOWN_ROUTE_POINTS.Gurugram,
      destination,
    ];
  }

  return [
    currentPositionFor(shipment),
    destination,
  ];
}

export async function POST(request) {
  try {
    const { shipmentId, whatIf } = await request.json();

    if (!shipmentId || !whatIf) {
      return jsonError("shipmentId and whatIf are required", 400);
    }

    const shipment = await getShipment(shipmentId);

    if (!shipment) {
      return jsonError("Shipment not found", 404);
    }

    const currentRiskScore = shipment.riskScore || 0;
    const predictedRiskScore = predictedRisk(currentRiskScore, whatIf);
    const prediction = await simulateScenario({ ...shipment, predictedRiskScore }, whatIf);
    const currentRoute = currentRouteFor(shipment);
    const rerouteRoute = [
      currentPositionFor(shipment),
      ...rerouteWaypoints(shipment, whatIf),
    ];

    return Response.json({
      prediction,
      currentRiskScore,
      predictedRiskScore,
      shipmentId,
      currentRoute,
      rerouteRoute,
      mapOverlay: {
        primaryColor: "#4f46e5",
        rerouteColor: "#f97316",
      },
    });
  } catch (error) {
    console.error("Scenario simulation failed:", error);
    return jsonError(error.message || "Scenario simulation failed", 500);
  }
}
