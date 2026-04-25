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
export const maxDuration = 60;

const CITY_DATABASE = {
  "Mumbai": { lat: 19.076, lng: 72.877 },
  "Delhi": { lat: 28.614, lng: 77.209 },
  "Bangalore": { lat: 12.972, lng: 77.595 },
  "Chennai": { lat: 13.083, lng: 80.271 },
  "Hyderabad": { lat: 17.385, lng: 78.487 },
  "Pune": { lat: 18.52, lng: 73.857 },
  "Kolkata": { lat: 22.572, lng: 88.364 },
  "Ahmedabad": { lat: 23.022, lng: 72.571 },
  "Jaipur": { lat: 26.912, lng: 75.787 },
  "Lucknow": { lat: 26.847, lng: 80.947 },
  "Surat": { lat: 21.17, lng: 72.831 },
  "Hubli": { lat: 15.365, lng: 75.124 },
  "Kurnool": { lat: 15.828, lng: 78.037 },
  "Kolhapur": { lat: 16.705, lng: 74.243 },
  "Nagpur": { lat: 21.146, lng: 79.088 },
  "Vijayawada": { lat: 16.506, lng: 80.648 },
  "Indore": { lat: 22.72, lng: 75.858 },
  "Bhopal": { lat: 23.259, lng: 77.413 },
};

function generateRoute(origin, destination) {
  const startLat = origin?.lat || 19.076;
  const startLng = origin?.lng || 72.877;
  const endLat = destination?.lat || 28.614;
  const endLng = destination?.lng || 77.209;

  const route = [
    { city: origin?.city || "Origin", lat: startLat, lng: startLng, progress: 0 },
    {
      city: "Checkpoint 1",
      lat: Number((startLat + (endLat - startLat) * 0.25).toFixed(6)),
      lng: Number((startLng + (endLng - startLng) * 0.25).toFixed(6)),
      progress: 25,
    },
    {
      city: "Checkpoint 2",
      lat: Number((startLat + (endLat - startLat) * 0.5).toFixed(6)),
      lng: Number((startLng + (endLng - startLng) * 0.5).toFixed(6)),
      progress: 50,
    },
    {
      city: "Checkpoint 3",
      lat: Number((startLat + (endLat - startLat) * 0.75).toFixed(6)),
      lng: Number((startLng + (endLng - startLng) * 0.75).toFixed(6)),
      progress: 75,
    },
    { city: destination?.city || "Destination", lat: endLat, lng: endLng, progress: 100 },
  ];

  // Match midpoints to nearest real cities
  route.forEach((point, idx) => {
    if (idx === 0 || idx === route.length - 1) return;
    let closest = null;
    let closestDist = Infinity;
    for (const [name, coords] of Object.entries(CITY_DATABASE)) {
      if (name === origin?.city || name === destination?.city) continue;
      const dist = Math.sqrt(Math.pow(point.lat - coords.lat, 2) + Math.pow(point.lng - coords.lng, 2));
      if (dist < closestDist && dist < 3) {
        closestDist = dist;
        closest = { name, ...coords };
      }
    }
    if (closest) {
      point.city = closest.name;
      point.lat = closest.lat;
      point.lng = closest.lng;
    }
  });

  return route;
}

function jsonError(message, status) {
  return Response.json({ success: false, error: message }, { status });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function positionAt(progress, route) {
  for (let index = 0; index < route.length - 1; index += 1) {
    const current = route[index];
    const next = route[index + 1];
    if (progress >= current.progress && progress <= next.progress) {
      const ratio = (progress - current.progress) / (next.progress - current.progress || 1);
      return {
        lat: Number((current.lat + (next.lat - current.lat) * ratio).toFixed(6)),
        lng: Number((current.lng + (next.lng - current.lng) * ratio).toFixed(6)),
      };
    }
  }
  return { lat: route[route.length - 1].lat, lng: route[route.length - 1].lng };
}

const TELEMETRY_TIMELINE = [
  { sec: 3,  temp: -17.8, hum: 43, spd: 0,   bat: 95, prog: 0 },
  { sec: 5,  temp: -17.5, hum: 42, spd: 35,  bat: 94, prog: 3 },
  { sec: 7,  temp: -18.1, hum: 44, spd: 52,  bat: 93, prog: 6 },
  { sec: 9,  temp: -17.3, hum: 43, spd: 68,  bat: 92, prog: 12 },
  { sec: 11, temp: -17.6, hum: 45, spd: 82,  bat: 91, prog: 18 },
  { sec: 13, temp: -18.0, hum: 44, spd: 78,  bat: 90, prog: 24 },
  { sec: 15, temp: -17.4, hum: 42, spd: 45,  bat: 89, prog: 28 },
  { sec: 17, temp: -17.7, hum: 43, spd: 22,  bat: 88, prog: 32 },
  { sec: 19, temp: -17.2, hum: 45, spd: 65,  bat: 86, prog: 38 },
  { sec: 20, temp: -15.0, hum: 48, spd: 55,  bat: 45, prog: 42 },
  { sec: 22, temp: -12.0, hum: 51, spd: 40,  bat: 25, prog: 45 },
  { sec: 24, temp: -5.0,  hum: 55, spd: 15,  bat: 15, prog: 48 },
  { sec: 26, temp: -8.0,  hum: 53, spd: 30,  bat: 22, prog: 52 },
  { sec: 28, temp: -14.0, hum: 49, spd: 58,  bat: 45, prog: 56 },
  { sec: 30, temp: -17.0, hum: 46, spd: 72,  bat: 45, prog: 63 },
  { sec: 32, temp: -17.4, hum: 44, spd: 85,  bat: 46, prog: 70 },
  { sec: 35, temp: -17.8, hum: 43, spd: 90,  bat: 50, prog: 75 },
  { sec: 37, temp: -17.6, hum: 42, spd: 75,  bat: 53, prog: 82 },
  { sec: 39, temp: -17.3, hum: 43, spd: 48,  bat: 56, prog: 88 },
  { sec: 41, temp: -17.9, hum: 44, spd: 62,  bat: 60, prog: 94 },
  { sec: 43, temp: -17.5, hum: 43, spd: 35,  bat: 63, prog: 98 },
  { sec: 45, temp: -17.2, hum: 42, spd: 0,   bat: 65, prog: 100 },
];

async function getShipment(shipmentId) {
  const snapshot = await db
    .collection("shipments")
    .where("shipmentId", "==", shipmentId)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { ref: doc.ref, data: { id: doc.id, ...doc.data() } };
}

async function getUser(userId) {
  if (!userId) return null;
  const direct = await db.collection("users").doc(userId).get();
  if (direct.exists) return { id: direct.id, ...direct.data() };
  const snapshot = await db.collection("users").where("id", "==", userId).limit(1).get();
  return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

async function findPayment(shipmentId) {
  const snapshot = await db.collection("payments").where("shipmentId", "==", shipmentId).limit(1).get();
  return snapshot.empty ? null : snapshot.docs[0];
}

async function getLastBlock(shipmentId) {
  const snapshot = await db.collection("blockchain").where("shipmentId", "==", shipmentId).get();
  const blocks = snapshot.docs.map((doc) => doc.data()).sort((a, b) => b.blockNumber - a.blockNumber);
  return blocks[0] || null;
}

export async function POST(request) {
  try {
    const { shipmentId } = await request.json();
    if (!shipmentId) return jsonError("shipmentId is required", 400);

    const shipmentDoc = await getShipment(shipmentId);
    if (!shipmentDoc) return jsonError("Shipment not found", 404);

    const start = Date.now();
    const originalShipment = shipmentDoc.data;

    // Generate dynamic route based on actual origin/destination
    const ROUTE = generateRoute(originalShipment.origin, originalShipment.destination);
    const originCity = originalShipment.origin?.city || "Origin";
    const destCity = originalShipment.destination?.city || "Destination";

    // Calculate distance between origin and destination
    const distLat = (originalShipment.destination?.lat || 28.614) - (originalShipment.origin?.lat || 19.076);
    const distLng = (originalShipment.destination?.lng || 77.209) - (originalShipment.origin?.lng || 72.877);
    const totalDistance = Math.round(Math.sqrt(distLat * distLat + distLng * distLng) * 111);

    const carrier = await getUser(originalShipment.carrierId);
    const receiver = await getUser(originalShipment.receiverId);
    const creator = await getUser(originalShipment.createdBy);
    const paymentDoc = await findPayment(shipmentId);
    const paymentId = paymentDoc?.data().paymentId || `PAY-${shipmentId.slice(-4)}`;
    const paymentRef = paymentDoc?.ref || db.collection("payments").doc(paymentId);

    // Blockchain tracking
    const lastBlock = await getLastBlock(shipmentId);
    let nextBlockNumber = lastBlock ? lastBlock.blockNumber + 1 : 1;
    let previousHash = lastBlock ? lastBlock.hash : GENESIS_PREV_HASH;

    async function writeBlock(eventType, data) {
      const ref = db.collection("blockchain").doc();
      const block = {
        id: ref.id,
        blockNumber: nextBlockNumber,
        eventType,
        shipmentId,
        data,
        prevHash: previousHash,
        timestamp: new Date().toISOString(),
        verified: true,
      };
      block.hash = generateHash(block);
      await ref.set(block);
      previousHash = block.hash;
      nextBlockNumber += 1;
      return block;
    }

    async function writeNotification(type, severity, title, message, userId) {
      const ref = db.collection("notifications").doc();
      await ref.set({
        id: ref.id,
        shipmentId,
        type,
        severity,
        title,
        message,
        userId,
        read: false,
        actionUrl: `/shipments/${shipmentId}`,
        timestamp: Timestamp.now(),
      });
    }

    async function writeTelemetry(t) {
      const { lat, lng } = positionAt(t.prog, ROUTE);
      const ref = db.collection("telemetry").doc();
      await ref.set({
        id: ref.id,
        shipmentId,
        temperature: t.temp,
        humidity: t.hum,
        speed: t.spd,
        lat,
        lng,
        batteryLevel: t.bat,
        isViolation: t.temp < (originalShipment.tempRange?.min || -20) || t.temp > (originalShipment.tempRange?.max || -15),
        timestamp: Timestamp.now(),
      });
    }

    async function waitUntil(targetSec) {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = targetSec - elapsed;
      if (remaining > 0) await delay(remaining * 1000);
    }

    // Send email notifications
    sendShipmentCreated(carrier?.email, originalShipment).catch(() => {});
    sendShipmentCreated(receiver?.email, originalShipment).catch(() => {});

    // Pre-generate AI content
    const aiPromise = (async () => {
      const incidentContext = {
        ...originalShipment,
        status: "at-risk",
        currentTemp: -5,
        riskScore: 72,
      };
      const [incidentReport, aiRecommendation] = await Promise.all([
        generateIncidentReport(incidentContext, [], "TEMP_VIOLATION"),
        generateRiskRecommendation(incidentContext, []),
      ]);
      return { incidentReport, aiRecommendation };
    })();

    // Track checkpoints that have been logged
    const loggedCheckpoints = new Set();

    // ==========================================
    // PHASE 1: SHIPMENT CREATED (0-2s)
    // ==========================================
    await shipmentDoc.ref.update({
      status: "in-transit",
      currentSpeed: 58,
      distanceTotal: totalDistance,
      pickedUpAt: Timestamp.now(),
    });

    await writeBlock("SHIPMENT_CREATED", {
      shipmentId,
      product: originalShipment.product,
      origin: originalShipment.origin,
      destination: originalShipment.destination,
    });

    await paymentRef.set(
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
        status: "held",
        conditions: {
          deliveryConfirmed: false,
          tempCompliance: true,
          chainVerified: false,
          signatureReceived: false,
        },
        disputeReason: null,
        disputeSeverity: null,
        blockchainRef: null,
        createdAt: originalShipment.createdAt || Timestamp.now(),
        heldAt: Timestamp.now(),
        releasedAt: null,
      },
      { merge: true }
    );

    await writeBlock("PAYMENT_HELD", { paymentId, shipmentId, amount: 125000 });
    await writeBlock("SHIPMENT_PICKED_UP", { shipmentId, carrierId: originalShipment.carrierId });

    await writeNotification("system", "info", "Shipment picked up", `${shipmentId} is now in transit from ${originCity} to ${destCity}.`, originalShipment.carrierId);
    await writeNotification("system", "info", "Shipment tracking started", `${shipmentId} has started live cold-chain tracking.`, originalShipment.receiverId);

    // ==========================================
    // PHASE 2: IN TRANSIT — telemetry points
    // ==========================================
    for (const t of TELEMETRY_TIMELINE) {
      await waitUntil(t.sec);

      await writeTelemetry(t);

      const { lat, lng } = positionAt(t.prog, ROUTE);
      const updateData = {
        currentTemp: t.temp,
        currentHumidity: t.hum,
        currentSpeed: t.spd,
        currentLat: lat,
        currentLng: lng,
        progress: t.prog,
        distanceCovered: Math.round((t.prog / 100) * totalDistance),
        eta: Math.max(0, Math.round((1 - t.prog / 100) * 720)),
      };

      // Check for checkpoint crossings dynamically
      for (const cp of ROUTE.slice(1, -1)) {
        if (!loggedCheckpoints.has(cp.city) && t.prog >= cp.progress && t.prog < cp.progress + 5) {
          loggedCheckpoints.add(cp.city);
          await writeBlock("CHECKPOINT_CROSSED", { shipmentId, checkpoint: cp.city, lat: cp.lat, lng: cp.lng });
          
          // Update checkpoints array
          const currentCheckpoints = originalShipment.checkpoints || [];
          currentCheckpoints.push({ city: cp.city, lat: cp.lat, lng: cp.lng, crossedAt: Timestamp.now() });
          updateData.checkpoints = currentCheckpoints;
        }
      }

      // === BREACH DETECTED at -5C ===
      if (t.temp === -5.0) {
        updateData.status = "at-risk";
        updateData.riskScore = 72;
        updateData.riskFactors = {
          temperature: 85,
          delay: 20,
          route: 10,
          weather: 15,
          cooling: 90,
          transit: 30,
        };

        const { incidentReport, aiRecommendation } = await aiPromise;
        updateData.incidentReport = incidentReport;
        updateData.aiRecommendation = aiRecommendation;

        await writeBlock("TEMP_VIOLATION", {
          shipmentId,
          temperature: -5,
          threshold: originalShipment.tempRange,
          duration: "8 seconds",
        });

        await paymentRef.update({
          status: "on-hold",
          conditions: {
            deliveryConfirmed: false,
            tempCompliance: false,
            chainVerified: false,
            signatureReceived: false,
          },
        });

        await writeNotification("alert", "critical", "Temperature breach detected", `${shipmentId} reached -5\u00B0C, outside the required ${originalShipment.tempRange?.min}\u00B0C to ${originalShipment.tempRange?.max}\u00B0C range.`, originalShipment.carrierId);
        await writeNotification("alert", "critical", "Temperature breach detected", `${shipmentId} reached -5\u00B0C and requires receiver quality inspection.`, originalShipment.receiverId);

        sendBreachAlert(carrier?.email, originalShipment, { temperature: -5, batteryLevel: 15 }).catch(() => {});
        sendBreachAlert(receiver?.email, originalShipment, { temperature: -5, batteryLevel: 15 }).catch(() => {});
      }

      // === AI RECOMMENDATION after breach ===
      if (t.temp === -8.0) {
        const { aiRecommendation } = await aiPromise;
        await writeBlock("AI_RECOMMENDATION", {
          shipmentId,
          recommendation: aiRecommendation,
          riskReduction: "72 to 45",
        });
      }

      // === TEMP RECOVERED ===
      if (t.sec === 30) {
        updateData.status = "in-transit";
        updateData.riskScore = 45;
        updateData.riskFactors = {
          temperature: 45,
          delay: 20,
          route: 10,
          weather: 10,
          cooling: 35,
          transit: 25,
        };

        await writeBlock("TEMP_RECOVERED", { shipmentId, temperature: -17, recoveredAt: new Date().toISOString() });
        await paymentRef.update({ status: "held" });
      }

      // === DELIVERED at 100% ===
      if (t.prog === 100) {
        updateData.status = "delivered";
        updateData.currentSpeed = 0;
        updateData.riskScore = 45;
        updateData.receiverSignature = true;
        updateData.qrCodeUrl = `/verify/${shipmentId}`;
        updateData.deliveredAt = Timestamp.now();
        updateData.currentLat = originalShipment.destination?.lat || endLat;
        updateData.currentLng = originalShipment.destination?.lng || endLng;

        await writeBlock("DELIVERED", {
          shipmentId,
          receivedBy: originalShipment.receiverId,
          temperature: -17.2,
          condition: "accepted",
        });

        await writeBlock("SIGNATURE_RECEIVED", { shipmentId, signedBy: originalShipment.receiverId });

        await writeNotification("system", "info", "Delivery confirmed", `${shipmentId} was delivered in ${destCity} with receiver signature.`, originalShipment.receiverId);
      }

      await shipmentDoc.ref.update(updateData);
    }

    // ==========================================
    // PHASE 3: POST-DELIVERY
    // ==========================================
    await waitUntil(50);

    const { incidentReport, aiRecommendation } = await aiPromise;
    let complianceReport;
    try {
      complianceReport = await generateComplianceReport(
        { ...originalShipment, status: "delivered" },
        [],
        []
      );
    } catch {
      complianceReport = `Compliance report: Shipment ${shipmentId} delivered from ${originCity} to ${destCity} with one temperature breach incident. Overall cold-chain integrity maintained.`;
    }

    await shipmentDoc.ref.update({ complianceReport });

    await paymentRef.update({
      status: "released",
      conditions: {
        deliveryConfirmed: true,
        tempCompliance: true,
        chainVerified: true,
        signatureReceived: true,
      },
      releasedAt: Timestamp.now(),
    });

    await writeBlock("PAYMENT_RELEASED", {
      paymentId,
      shipmentId,
      amount: 125000,
      conditions: {
        deliveryConfirmed: true,
        tempCompliance: true,
        chainVerified: true,
        signatureReceived: true,
      },
    });

    await writeNotification("payment", "info", "Payment released", `${paymentId} was released after delivery, signature, and chain verification.`, originalShipment.createdBy);

    sendDeliveryConfirmation(receiver?.email, { ...originalShipment, status: "delivered", complianceReport }).catch(() => {});

    return Response.json({
      success: true,
      message: `Real-time simulation complete for ${shipmentId} (${originCity} to ${destCity})`,
      totalTelemetryPoints: TELEMETRY_TIMELINE.length,
      totalBlocks: nextBlockNumber - 1,
      durationSeconds: Math.round((Date.now() - start) / 1000),
      route: ROUTE.map((r) => r.city).join(" \u2192 "),
    });
  } catch (error) {
    console.error("Simulation failed:", error);
    return jsonError(error.message || "Simulation failed", 500);
  }
}