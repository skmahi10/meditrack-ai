import { db } from "../../lib/firebase-admin.js";
import { generateRiskRecommendation } from "../../lib/gemini.js";

export const runtime = "nodejs";

const WEIGHTS = {
  temperature: 0.3,
  delay: 0.2,
  route: 0.15,
  weather: 0.15,
  cooling: 0.1,
  transit: 0.1,
};

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

function severityFor(score) {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "medium";
  return "low";
}

async function getShipmentDoc(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

function timestampMillis(value) {
  return value?.toMillis ? value.toMillis() : new Date(value).getTime();
}

function calculateFactors(shipment, telemetry) {
  const latest = telemetry[telemetry.length - 1] || {};
  const maxExcursion = telemetry.reduce((max, reading) => {
    const low = Math.max(0, shipment.tempRange.min - reading.temperature);
    const high = Math.max(0, reading.temperature - shipment.tempRange.max);
    return Math.max(max, low, high);
  }, 0);
  const violationCount = telemetry.filter((reading) => reading.isViolation).length;
  const battery = latest.batteryLevel ?? 80;
  const progress = shipment.progress || 0;
  const eta = shipment.eta || 0;

  return {
    temperature: Math.min(100, Math.round(maxExcursion * 10 + violationCount * 8)),
    delay: Math.min(100, Math.round(eta > 0 && progress < 75 ? eta / 2 : eta / 5)),
    route: progress > 0 && progress < 100 ? 20 : 10,
    weather: 10,
    cooling: Math.min(100, Math.round(100 - battery + (battery < 25 ? 35 : 0))),
    transit: shipment.status === "at-risk" ? 65 : shipment.status === "in-transit" ? 35 : 15,
  };
}

export async function POST(request) {
  try {
    const { shipmentId } = await request.json();

    if (!shipmentId) {
      return jsonError("shipmentId is required", 400);
    }

    const shipmentDoc = await getShipmentDoc(shipmentId);

    if (!shipmentDoc) {
      return jsonError("Shipment not found", 404);
    }

    const shipment = { id: shipmentDoc.id, ...shipmentDoc.data() };
    const telemetrySnapshot = await db
      .collection("telemetry")
      .where("shipmentId", "==", shipmentId)
      .get();
    const telemetry = telemetrySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => timestampMillis(a.timestamp) - timestampMillis(b.timestamp));
    const factors = calculateFactors(shipment, telemetry);
    const riskScore = Math.round(
      Object.entries(WEIGHTS).reduce((total, [key, weight]) => total + factors[key] * weight, 0),
    );
    const recommendation = await generateRiskRecommendation({ ...shipment, riskScore, riskFactors: factors }, telemetry);
    const severity = severityFor(riskScore);

    await shipmentDoc.ref.update({
      riskScore,
      riskFactors: factors,
      aiRecommendation: recommendation,
    });

    return Response.json({ shipmentId, riskScore, factors, recommendation, severity });
  } catch (error) {
    console.error("Risk analysis failed:", error);
    return jsonError(error.message || "Risk analysis failed", 500);
  }
}
