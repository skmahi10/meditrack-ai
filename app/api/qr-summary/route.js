import { db } from "../../lib/firebase-admin.js";
import { verifyChain } from "../../lib/blockchain.js";
import { generateQRSummary } from "../../lib/gemini.js";

export const runtime = "nodejs";

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

async function getShipment(shipmentId) {
  const snapshot = await db.collection("shipments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

function timestampMillis(value) {
  return value?.toMillis ? value.toMillis() : new Date(value).getTime();
}

async function complianceScoreFor(shipmentId) {
  const snapshot = await db
    .collection("telemetry")
    .where("shipmentId", "==", shipmentId)
    .get();

  if (snapshot.empty) {
    return 100;
  }

  const readings = snapshot.docs
    .map((doc) => doc.data())
    .sort((a, b) => timestampMillis(a.timestamp) - timestampMillis(b.timestamp));
  const compliant = readings.filter((reading) => !reading.isViolation).length;
  return Number(((compliant / readings.length) * 100).toFixed(1));
}

export async function POST(request) {
  try {
    const { shipmentId } = await request.json();

    if (!shipmentId) {
      return jsonError("shipmentId is required", 400);
    }

    const shipment = await getShipment(shipmentId);

    if (!shipment) {
      return jsonError("Shipment not found", 404);
    }

    const chain = await verifyChain(db, shipmentId);
    const complianceScore = await complianceScoreFor(shipmentId);
    const safetyStatement = await generateQRSummary(shipment, complianceScore, chain.valid);

    return Response.json({
      safetyStatement,
      verified: chain.valid && complianceScore >= 85,
      shipmentId,
      product: shipment.product,
      batchNumber: shipment.batchNumber,
      deliveredAt: shipment.deliveredAt || null,
      complianceScore,
      blockchainValid: chain.valid,
    });
  } catch (error) {
    console.error("QR summary failed:", error);
    return jsonError(error.message || "QR summary failed", 500);
  }
}
