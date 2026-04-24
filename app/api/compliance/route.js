import { db } from "../../lib/firebase-admin.js";
import { verifyChain } from "../../lib/blockchain.js";
import { generateComplianceReport } from "../../lib/gemini.js";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

async function getShipmentDoc(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

function scoreTelemetry(telemetry) {
  if (!telemetry.length) return 100;
  const compliant = telemetry.filter((reading) => !reading.isViolation).length;
  return Number(((compliant / telemetry.length) * 100).toFixed(1));
}

function statusFor(score, delivered) {
  if (!delivered) return "pending";
  if (score >= 98) return "compliant";
  if (score >= 85) return "conditional";
  return "non-compliant";
}

function timestampMillis(value) {
  return value?.toMillis ? value.toMillis() : new Date(value).getTime();
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
    const chain = await verifyChain(db, shipmentId);
    const complianceScore = scoreTelemetry(telemetry);
    const status = chain.valid ? statusFor(complianceScore, shipment.status === "delivered") : "non-compliant";
    const summary = await generateComplianceReport(shipment, telemetry, blockchain);

    await shipmentDoc.ref.update({ complianceReport: summary });

    return Response.json({ summary, complianceScore, status, shipmentId });
  } catch (error) {
    console.error("Compliance failed:", error);
    return jsonError(error.message || "Compliance failed", 500);
  }
}
