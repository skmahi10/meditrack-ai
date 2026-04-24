import { db } from "../../lib/firebase-admin.js";
import { generateIncidentReport } from "../../lib/gemini.js";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

function determineSeverity(telemetry) {
  const worstExcursion = telemetry.reduce((max, reading) => {
    if (!reading.isViolation) return max;
    return Math.max(max, Math.abs(reading.temperature));
  }, 0);

  if (worstExcursion >= 20) return "high";
  if (worstExcursion >= 10) return "moderate";
  return telemetry.some((reading) => reading.isViolation) ? "moderate" : "low";
}

async function getShipmentDoc(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

function timestampMillis(value) {
  return value?.toMillis ? value.toMillis() : new Date(value).getTime();
}

export async function POST(request) {
  try {
    const { shipmentId, eventType } = await request.json();

    if (!shipmentId || !eventType) {
      return jsonError("shipmentId and eventType are required", 400);
    }

    const shipmentDoc = await getShipmentDoc(shipmentId);

    if (!shipmentDoc) {
      return jsonError("Shipment not found", 404);
    }

    const telemetrySnapshot = await db
      .collection("telemetry")
      .where("shipmentId", "==", shipmentId)
      .get();
    const blockSnapshot = await db
      .collection("blockchain")
      .where("shipmentId", "==", shipmentId)
      .get();

    const shipment = { id: shipmentDoc.id, ...shipmentDoc.data() };
    const telemetry = telemetrySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => timestampMillis(a.timestamp) - timestampMillis(b.timestamp));
    const blockchain = blockSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.blockNumber - b.blockNumber);
    const report = await generateIncidentReport({ ...shipment, blockchain }, telemetry, eventType);
    const severity = determineSeverity(telemetry);

    await shipmentDoc.ref.update({ incidentReport: report });

    return Response.json({
      report,
      severity,
      shipmentId,
      eventType,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Incident report failed:", error);
    return jsonError(error.message || "Incident report failed", 500);
  }
}
