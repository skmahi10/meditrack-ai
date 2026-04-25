import { Timestamp } from "firebase-admin/firestore";
import { db } from "../../../lib/firebase-admin.js";
import { generateHash, GENESIS_PREV_HASH } from "../../../lib/blockchain.js";
import {
  generateComplianceReport,
  generateIncidentReport,
  generateRiskRecommendation,
} from "../../../lib/gemini.js";
import {
  sendBreachAlert,
  sendDeliveryConfirmation,
  sendShipmentCreated,
} from "../../../lib/email.js";

export const runtime = "nodejs";

const ROUTE = [
  { city: "Mumbai", lat: 19.076, lng: 72.877, progress: 0 },
  { city: "Surat", lat: 21.17, lng: 72.831, progress: 25 },
  { city: "Ahmedabad", lat: 23.022, lng: 72.571, progress: 40 },
  { city: "Jaipur", lat: 26.912, lng: 75.787, progress: 70 },
  { city: "Delhi", lat: 28.614, lng: 77.209, progress: 100 },
];

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

function timestampAt(start, seconds) {
  return Timestamp.fromDate(new Date(start.getTime() + seconds * 1000));
}

function isoAt(start, seconds) {
  return new Date(start.getTime() + seconds * 1000).toISOString();
}

function positionAt(progress) {
  for (let index = 0; index < ROUTE.length - 1; index += 1) {
    const current = ROUTE[index];
    const next = ROUTE[index + 1];

    if (progress >= current.progress && progress <= next.progress) {
      const ratio = (progress - current.progress) / (next.progress - current.progress || 1);
      return {
        lat: Number((current.lat + (next.lat - current.lat) * ratio).toFixed(6)),
        lng: Number((current.lng + (next.lng - current.lng) * ratio).toFixed(6)),
      };
    }
  }

  return { lat: ROUTE[ROUTE.length - 1].lat, lng: ROUTE[ROUTE.length - 1].lng };
}

function telemetryPoint(start, shipmentId, seconds, temperature, humidity, speed, batteryLevel, progress) {
  const { lat, lng } = positionAt(progress);

  return {
    shipmentId,
    temperature,
    humidity,
    speed,
    lat,
    lng,
    batteryLevel,
    isViolation: temperature < -20 || temperature > -15,
    timestamp: timestampAt(start, seconds),
  };
}

function buildTelemetry(start, shipmentId) {
  return [
    telemetryPoint(start, shipmentId, 3, -17.8, 43, 58, 95, 6),
    telemetryPoint(start, shipmentId, 5, -17.5, 42, 64, 94, 12),
    telemetryPoint(start, shipmentId, 7, -18.1, 44, 68, 93, 18),
    telemetryPoint(start, shipmentId, 9, -17.3, 43, 66, 92, 24),
    telemetryPoint(start, shipmentId, 11, -17.6, 45, 70, 91, 28),
    telemetryPoint(start, shipmentId, 13, -18.0, 44, 72, 90, 32),
    telemetryPoint(start, shipmentId, 15, -17.4, 42, 61, 89, 35),
    telemetryPoint(start, shipmentId, 17, -17.7, 43, 59, 88, 38),
    telemetryPoint(start, shipmentId, 19, -17.2, 45, 57, 86, 40),
    telemetryPoint(start, shipmentId, 20, -15.0, 48, 52, 45, 42),
    telemetryPoint(start, shipmentId, 22, -12.0, 51, 49, 25, 45),
    telemetryPoint(start, shipmentId, 24, -5.0, 55, 42, 15, 48),
    telemetryPoint(start, shipmentId, 26, -8.0, 53, 45, 22, 52),
    telemetryPoint(start, shipmentId, 28, -14.0, 49, 51, 45, 56),
    telemetryPoint(start, shipmentId, 30, -17.0, 46, 58, 45, 63),
    telemetryPoint(start, shipmentId, 32, -17.4, 44, 62, 46, 70),
    telemetryPoint(start, shipmentId, 35, -17.8, 43, 64, 50, 75),
    telemetryPoint(start, shipmentId, 37, -17.6, 42, 68, 53, 82),
    telemetryPoint(start, shipmentId, 39, -17.3, 43, 66, 56, 88),
    telemetryPoint(start, shipmentId, 41, -17.9, 44, 63, 60, 94),
    telemetryPoint(start, shipmentId, 43, -17.5, 43, 55, 63, 98),
    telemetryPoint(start, shipmentId, 45, -17.2, 42, 0, 65, 100),
  ];
}

async function getShipment(shipmentId) {
  const snapshot = await db
    .collection("shipments")
    .where("shipmentId", "==", shipmentId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { ref: doc.ref, data: { id: doc.id, ...doc.data() } };
}

async function getUser(userId) {
  if (!userId) {
    return null;
  }

  const direct = await db.collection("users").doc(userId).get();

  if (direct.exists) {
    return { id: direct.id, ...direct.data() };
  }

  const snapshot = await db.collection("users").where("id", "==", userId).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function findPayment(shipmentId) {
  const snapshot = await db
    .collection("payments")
    .where("shipmentId", "==", shipmentId)
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0];
}

async function getLastBlock(shipmentId) {
  const snapshot = await db
    .collection("blockchain")
    .where("shipmentId", "==", shipmentId)
    .get();

  const blocks = snapshot.docs.map((doc) => doc.data()).sort((a, b) => b.blockNumber - a.blockNumber);
  return blocks[0] || null;
}

export async function POST(request) {
  try {
    const { shipmentId } = await request.json();

    if (!shipmentId) {
      return jsonError("shipmentId is required", 400);
    }

    const shipmentDoc = await getShipment(shipmentId);

    if (!shipmentDoc) {
      return jsonError("Shipment not found", 404);
    }

    const start = new Date();
    const originalShipment = shipmentDoc.data;
    const telemetry = buildTelemetry(start, shipmentId);
    const carrier = await getUser(originalShipment.carrierId);
    const receiver = await getUser(originalShipment.receiverId);
    const creator = await getUser(originalShipment.createdBy);
    const paymentDoc = await findPayment(shipmentId);
    const paymentId = paymentDoc?.data().paymentId || `PAY-${shipmentId.slice(-4)}`;
    const paymentRef = paymentDoc?.ref || db.collection("payments").doc(paymentId);

    const breachDetails = { temperature: -5, batteryLevel: 15, detectedAt: isoAt(start, 24) };
    const incidentContext = {
      ...originalShipment,
      status: "at-risk",
      currentTemp: -5,
      riskScore: 72,
    };

    const [incidentReport, aiRecommendation] = await Promise.all([
      generateIncidentReport(incidentContext, telemetry, "TEMP_VIOLATION"),
      generateRiskRecommendation(incidentContext, telemetry),
    ]);

    const deliveredShipment = {
      ...originalShipment,
      status: "delivered",
      currentTemp: -17.2,
      currentHumidity: 42,
      currentSpeed: 0,
      currentLat: 28.614,
      currentLng: 77.209,
      riskScore: 45,
      riskFactors: {
        temperature: 45,
        delay: 20,
        route: 10,
        weather: 10,
        cooling: 35,
        transit: 25,
      },
      eta: 0,
      progress: 100,
      distanceTotal: 1420,
      distanceCovered: 1420,
      aiRecommendation,
      incidentReport,
      receiverSignature: true,
      qrCodeUrl: `/verify/${shipmentId}`,
      pickedUpAt: timestampAt(start, 2),
      deliveredAt: timestampAt(start, 45),
      checkpoints: [
        { city: "Surat", lat: 21.17, lng: 72.831, crossedAt: timestampAt(start, 10) },
        { city: "Ahmedabad", lat: 23.022, lng: 72.571, crossedAt: timestampAt(start, 18) },
        { city: "Jaipur", lat: 26.912, lng: 75.787, crossedAt: timestampAt(start, 32) },
      ],
    };

    const lastBlock = await getLastBlock(shipmentId);
    let nextBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
    let previousHash = lastBlock ? lastBlock.hash : GENESIS_PREV_HASH;
    const blocks = [];

    function queueBlock(eventType, data, seconds) {
      const ref = db.collection("blockchain").doc();
      const block = {
        id: ref.id,
        blockNumber: nextBlockNumber,
        eventType,
        shipmentId,
        data,
        prevHash: previousHash,
        timestamp: isoAt(start, seconds),
        verified: true,
      };

      block.hash = generateHash(block);
      blocks.push({ ref, block });
      previousHash = block.hash;
      nextBlockNumber += 1;
    }

    queueBlock(
      "SHIPMENT_CREATED",
      {
        shipmentId,
        product: originalShipment.product,
        origin: originalShipment.origin,
        destination: originalShipment.destination,
        carrier: originalShipment.carrierId,
      },
      0,
    );
    queueBlock("PAYMENT_HELD", { paymentId, shipmentId, amount: 125000 }, 1);
    queueBlock("SHIPMENT_PICKED_UP", { shipmentId, carrierId: originalShipment.carrierId }, 2);
    queueBlock("CHECKPOINT_CROSSED", { shipmentId, checkpoint: "Surat", lat: 21.17, lng: 72.831 }, 10);
    queueBlock(
      "TEMP_VIOLATION",
      { shipmentId, temperature: -5, threshold: originalShipment.tempRange, duration: "8 seconds" },
      24,
    );
    queueBlock(
      "AI_RECOMMENDATION",
      { shipmentId, recommendation: aiRecommendation, riskReduction: "72 to 45" },
      27,
    );
    queueBlock("TEMP_RECOVERED", { shipmentId, temperature: -17, recoveredAt: isoAt(start, 30) }, 30);
    queueBlock("CHECKPOINT_CROSSED", { shipmentId, checkpoint: "Jaipur", lat: 26.912, lng: 75.787 }, 32);
    queueBlock("DELIVERED", { shipmentId, receivedBy: originalShipment.receiverId, temperature: -17.2, condition: "accepted" }, 45);
    queueBlock("SIGNATURE_RECEIVED", { shipmentId, signedBy: originalShipment.receiverId }, 46);
    queueBlock(
      "PAYMENT_RELEASED",
      {
        paymentId,
        shipmentId,
        amount: 125000,
        conditions: {
          deliveryConfirmed: true,
          tempCompliance: true,
          chainVerified: true,
          signatureReceived: true,
        },
      },
      55,
    );

    const complianceReport = await generateComplianceReport(
      deliveredShipment,
      telemetry,
      blocks.map((entry) => entry.block),
    );

    const finalShipment = {
      ...deliveredShipment,
      complianceReport,
    };

    const emailResults = await Promise.all([
      sendShipmentCreated(carrier?.email, originalShipment),
      sendShipmentCreated(receiver?.email, originalShipment),
      sendBreachAlert(carrier?.email, originalShipment, breachDetails),
      sendBreachAlert(receiver?.email, originalShipment, breachDetails),
      sendDeliveryConfirmation(receiver?.email, finalShipment),
    ]);

    const batch = db.batch();
    const telemetryRefs = telemetry.map(() => db.collection("telemetry").doc());

    telemetryRefs.forEach((ref, index) => {
      batch.set(ref, { id: ref.id, ...telemetry[index] });
    });

    blocks.forEach(({ ref, block }) => {
      batch.set(ref, block);
    });

    const notificationPayloads = [
      {
        type: "system",
        severity: "info",
        title: "Shipment picked up",
        message: `${shipmentId} is now in transit from Mumbai to Delhi.`,
        userId: originalShipment.carrierId,
        timestamp: timestampAt(start, 2),
      },
      {
        type: "system",
        severity: "info",
        title: "Shipment tracking started",
        message: `${shipmentId} has started live cold-chain tracking.`,
        userId: originalShipment.receiverId,
        timestamp: timestampAt(start, 2),
      },
      {
        type: "alert",
        severity: "critical",
        title: "Temperature breach detected",
        message: `${shipmentId} reached -5°C, outside the required ${originalShipment.tempRange.min}°C to ${originalShipment.tempRange.max}°C range.`,
        userId: originalShipment.carrierId,
        timestamp: timestampAt(start, 24),
      },
      {
        type: "alert",
        severity: "critical",
        title: "Temperature breach detected",
        message: `${shipmentId} reached -5°C and requires receiver quality inspection.`,
        userId: originalShipment.receiverId,
        timestamp: timestampAt(start, 24),
      },
      {
        type: "system",
        severity: "info",
        title: "Delivery confirmed",
        message: `${shipmentId} was delivered in Delhi with receiver signature.`,
        userId: originalShipment.receiverId,
        timestamp: timestampAt(start, 45),
      },
      {
        type: "payment",
        severity: "info",
        title: "Payment released",
        message: `${paymentId} was released after delivery, signature, and chain verification.`,
        userId: originalShipment.createdBy,
        timestamp: timestampAt(start, 55),
      },
      {
        type: "email",
        severity: "info",
        title: "Shipment assignment email",
        message: `Assignment email sent for ${shipmentId}.`,
        userId: originalShipment.carrierId,
        emailSentTo: carrier?.email || null,
        emailStatus: emailResults[0].status,
        timestamp: timestampAt(start, 2),
      },
      {
        type: "email",
        severity: "info",
        title: "Delivery summary email",
        message: `Delivery confirmation email sent for ${shipmentId}.`,
        userId: originalShipment.receiverId,
        emailSentTo: receiver?.email || null,
        emailStatus: emailResults[4].status,
        timestamp: timestampAt(start, 55),
      },
    ];

    notificationPayloads.forEach((payload) => {
      const ref = db.collection("notifications").doc();
      batch.set(ref, {
        id: ref.id,
        shipmentId,
        read: false,
        actionUrl: `/shipments/${shipmentId}`,
        emailSentTo: payload.emailSentTo ?? null,
        emailStatus: payload.emailStatus ?? null,
        ...payload,
      });
    });

    batch.set(
      paymentRef,
      {
        id: paymentRef.id,
        paymentId,
        shipmentId,
        payerId: originalShipment.createdBy,
        payerName: creator?.organization || "Bharat Biotech",
        payeeId: originalShipment.carrierId,
        payeeName: carrier?.organization || "BlueDart Pharma",
        amount: 125000,
        currency: "INR",
        status: "released",
        conditions: {
          deliveryConfirmed: true,
          tempCompliance: true,
          chainVerified: true,
          signatureReceived: true,
        },
        disputeReason: null,
        disputeSeverity: null,
        blockchainRef: String(blocks[blocks.length - 1].block.blockNumber),
        createdAt: originalShipment.createdAt || timestampAt(start, 0),
        heldAt: timestampAt(start, 1),
        releasedAt: timestampAt(start, 55),
      },
      { merge: true },
    );

    batch.update(shipmentDoc.ref, finalShipment);
    await batch.commit();

    return Response.json({
      success: true,
      message: `Simulation data generated for ${shipmentId}`,
      totalTelemetryPoints: telemetry.length,
      totalBlocks: blocks.length,
      estimatedDuration: 55,
    });
  } catch (error) {
    console.error("Simulation failed:", error);
    return jsonError(error.message || "Simulation failed", 500);
  }
}
