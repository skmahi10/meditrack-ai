import { db } from "../../../lib/firebase-admin.js";
import { generateChatResponse } from "../../../lib/gemini.js";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

function timestampMillis(value) {
  return value?.toMillis ? value.toMillis() : new Date(value).getTime();
}

async function getShipment(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export async function POST(request) {
  try {
    const { shipmentId, question } = await request.json();

    if (!shipmentId || !question) {
      return jsonError("shipmentId and question are required", 400);
    }

    const shipment = await getShipment(shipmentId);

    if (!shipment) {
      return jsonError("Shipment not found", 404);
    }

    // Fetch latest telemetry for context
    const telemetrySnapshot = await db
      .collection("telemetry")
      .where("shipmentId", "==", shipmentId)
      .get();

    const telemetry = telemetrySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => timestampMillis(b.timestamp) - timestampMillis(a.timestamp))
      .slice(0, 5)
      .reverse();

    // Add latest telemetry context to shipment for richer AI answers
    const latestReading = telemetry[telemetry.length - 1];
    const enrichedShipment = {
      ...shipment,
      currentTemp: latestReading?.temperature ?? shipment.currentTemp,
      currentHumidity: latestReading?.humidity ?? shipment.currentHumidity,
      currentSpeed: latestReading?.speed ?? shipment.currentSpeed,
    };

    const answer = await generateChatResponse(enrichedShipment, question);

    return Response.json({ answer });
  } catch (error) {
    console.error("Chat failed:", error);
    return jsonError(error.message || "Chat failed", 500);
  }
}