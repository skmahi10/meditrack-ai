import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Timestamp } = await import("firebase-admin/firestore");
const { db } = await import("../app/lib/firebase-admin.js");
const { generateHash, GENESIS_PREV_HASH } = await import("../app/lib/blockchain.js");

const now = new Date("2026-04-24T09:00:00.000Z");

function minutesAgo(minutes) {
  return Timestamp.fromDate(new Date(now.getTime() - minutes * 60 * 1000));
}

function isoMinutesAgo(minutes) {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

function makeBlock(shipmentId, blockNumber, eventType, data, prevHash, timestamp) {
  const id = `${shipmentId}-BLK-${String(blockNumber).padStart(3, "0")}`;
  const block = {
    id,
    blockNumber,
    eventType,
    shipmentId,
    data,
    prevHash,
    timestamp,
    verified: true,
  };

  block.hash = generateHash(block);
  return block;
}

function chain(shipmentId, events, startMinutesAgo) {
  let prevHash = GENESIS_PREV_HASH;

  return events.map((event, index) => {
    const block = makeBlock(
      shipmentId,
      index + 1,
      event.eventType,
      event.data,
      prevHash,
      isoMinutesAgo(startMinutesAgo - index * 8),
    );
    prevHash = block.hash;
    return block;
  });
}

function telemetry(idPrefix, shipmentId, points, startMinutesAgo, route, tempRange, breachAt = -1) {
  return Array.from({ length: points }, (_, index) => {
    const ratio = points === 1 ? 1 : index / (points - 1);
    const temperature =
      index === breachAt ? tempRange.max + 6 : Number((tempRange.min + (tempRange.max - tempRange.min) * 0.55).toFixed(1));

    return {
      id: `${idPrefix}-${String(index + 1).padStart(3, "0")}`,
      shipmentId,
      temperature,
      humidity: 42 + (index % 5),
      speed: ratio >= 1 ? 0 : 48 + (index % 6) * 4,
      lat: Number((route.origin.lat + (route.destination.lat - route.origin.lat) * ratio).toFixed(6)),
      lng: Number((route.origin.lng + (route.destination.lng - route.origin.lng) * ratio).toFixed(6)),
      batteryLevel: Math.max(18, 95 - index * 3),
      isViolation: temperature < tempRange.min || temperature > tempRange.max,
      timestamp: minutesAgo(startMinutesAgo - index * 4),
    };
  });
}

const users = [
  {
    id: "USR-001",
    uid: "USR-001",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@example.com",
    role: "hospital",
    organization: "Apollo Hospital Delhi",
    location: "Delhi",
    avatar: null,
    verified: true,
    trustScore: 92,
    activeShipments: 1,
    createdAt: minutesAgo(15000),
    lastLoginAt: minutesAgo(45),
  },
  {
    id: "USR-002",
    uid: "USR-002",
    name: "Rajesh Mehta",
    email: "rajesh.mehta@example.com",
    role: "manufacturer",
    organization: "Bharat Biotech",
    location: "Hyderabad",
    avatar: null,
    verified: true,
    trustScore: 88,
    activeShipments: 2,
    createdAt: minutesAgo(15200),
    lastLoginAt: minutesAgo(30),
  },
  {
    id: "USR-003",
    uid: "USR-003",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    role: "carrier",
    organization: "BlueDart Pharma",
    location: "Mumbai",
    avatar: null,
    verified: true,
    trustScore: 84,
    activeShipments: 3,
    createdAt: minutesAgo(14800),
    lastLoginAt: minutesAgo(12),
  },
  {
    id: "USR-004",
    uid: "USR-004",
    name: "Anita Desai",
    email: "anita.desai@example.com",
    role: "distributor",
    organization: "MedSupply India",
    location: "Pune",
    avatar: null,
    verified: true,
    trustScore: 86,
    activeShipments: 1,
    createdAt: minutesAgo(14500),
    lastLoginAt: minutesAgo(90),
  },
  {
    id: "USR-005",
    uid: "USR-005",
    name: "Dr. Amit Patel",
    email: "amit.patel@example.com",
    role: "hospital",
    organization: "AIIMS Mumbai",
    location: "Mumbai",
    avatar: null,
    verified: true,
    trustScore: 90,
    activeShipments: 0,
    createdAt: minutesAgo(14650),
    lastLoginAt: minutesAgo(300),
  },
  {
    id: "USR-006",
    uid: "USR-006",
    name: "Suresh Kumar",
    email: "suresh.kumar@example.com",
    role: "regulator",
    organization: "CDSCO",
    location: "Delhi",
    avatar: null,
    verified: true,
    trustScore: 95,
    activeShipments: 0,
    createdAt: minutesAgo(14000),
    lastLoginAt: minutesAgo(60),
  },
];

const shipments = [
  {
    id: "SHP-2026-0042",
    shipmentId: "SHP-2026-0042",
    product: "Covaxin",
    productCategory: "vaccine",
    batchNumber: "BB-CVX-26042",
    tempRange: { min: -20, max: -15 },
    quantity: 500,
    origin: { city: "Mumbai", lat: 19.076, lng: 72.877 },
    destination: { city: "Delhi", lat: 28.614, lng: 77.209 },
    checkpoints: [],
    carrierId: "USR-003",
    receiverId: "USR-001",
    createdBy: "USR-002",
    status: "created",
    priority: "critical",
    currentTemp: -18,
    currentHumidity: 43,
    currentSpeed: 0,
    currentLat: 19.076,
    currentLng: 72.877,
    riskScore: 24,
    riskFactors: { temperature: 15, delay: 10, route: 10, weather: 10, cooling: 20, transit: 15 },
    eta: 720,
    progress: 0,
    distanceTotal: 1420,
    distanceCovered: 0,
    aiRecommendation: null,
    incidentReport: null,
    complianceReport: null,
    receiverSignature: false,
    qrCodeUrl: null,
    createdAt: minutesAgo(60),
    pickedUpAt: null,
    deliveredAt: null,
  },
  {
    id: "SHP-2026-0041",
    shipmentId: "SHP-2026-0041",
    product: "Insulin Glargine",
    productCategory: "insulin",
    batchNumber: "IGL-26041",
    tempRange: { min: 2, max: 8 },
    quantity: 200,
    origin: { city: "Mumbai", lat: 19.076, lng: 72.877 },
    destination: { city: "Pune", lat: 18.52, lng: 73.856 },
    checkpoints: [{ city: "Lonavala", lat: 18.7546, lng: 73.4062, crossedAt: minutesAgo(220) }],
    carrierId: "USR-003",
    receiverId: "USR-004",
    createdBy: "USR-002",
    status: "delivered",
    priority: "normal",
    currentTemp: 5.2,
    currentHumidity: 44,
    currentSpeed: 0,
    currentLat: 18.52,
    currentLng: 73.856,
    riskScore: 12,
    riskFactors: { temperature: 5, delay: 10, route: 5, weather: 10, cooling: 10, transit: 8 },
    eta: 0,
    progress: 100,
    distanceTotal: 150,
    distanceCovered: 150,
    aiRecommendation: "Shipment completed within the 2°C to 8°C insulin range.",
    incidentReport: null,
    complianceReport: "Temperature compliance 100%. Delivered with verified signature and valid chain.",
    receiverSignature: true,
    qrCodeUrl: "/verify/SHP-2026-0041",
    createdAt: minutesAgo(620),
    pickedUpAt: minutesAgo(560),
    deliveredAt: minutesAgo(120),
  },
  {
    id: "SHP-2026-0040",
    shipmentId: "SHP-2026-0040",
    product: "Remdesivir",
    productCategory: "biologic",
    batchNumber: "RMD-26040",
    tempRange: { min: 2, max: 25 },
    quantity: 300,
    origin: { city: "Chennai", lat: 13.0827, lng: 80.2707 },
    destination: { city: "Bangalore", lat: 12.9716, lng: 77.5946 },
    checkpoints: [{ city: "Vellore", lat: 12.9165, lng: 79.1325, crossedAt: minutesAgo(360) }],
    carrierId: "USR-003",
    receiverId: "USR-005",
    createdBy: "USR-002",
    status: "delivered",
    priority: "urgent",
    currentTemp: 7.8,
    currentHumidity: 47,
    currentSpeed: 0,
    currentLat: 12.9716,
    currentLng: 77.5946,
    riskScore: 18,
    riskFactors: { temperature: 10, delay: 20, route: 10, weather: 10, cooling: 12, transit: 12 },
    eta: 0,
    progress: 100,
    distanceTotal: 350,
    distanceCovered: 350,
    aiRecommendation: "Delivered under acceptable biologic transport conditions.",
    incidentReport: null,
    complianceReport: "Temperature compliance 100%. Blockchain verification valid.",
    receiverSignature: true,
    qrCodeUrl: "/verify/SHP-2026-0040",
    createdAt: minutesAgo(840),
    pickedUpAt: minutesAgo(780),
    deliveredAt: minutesAgo(260),
  },
  {
    id: "SHP-2026-0039",
    shipmentId: "SHP-2026-0039",
    product: "Covishield",
    productCategory: "vaccine",
    batchNumber: "CSH-26039",
    tempRange: { min: 2, max: 8 },
    quantity: 1000,
    origin: { city: "Hyderabad", lat: 17.385, lng: 78.4867 },
    destination: { city: "Mumbai", lat: 19.076, lng: 72.877 },
    checkpoints: [{ city: "Solapur", lat: 17.6599, lng: 75.9064, crossedAt: minutesAgo(95) }],
    carrierId: "USR-003",
    receiverId: "USR-005",
    createdBy: "USR-002",
    status: "in-transit",
    priority: "critical",
    currentTemp: 5.4,
    currentHumidity: 45,
    currentSpeed: 62,
    currentLat: 18.093,
    currentLng: 75.02,
    riskScore: 31,
    riskFactors: { temperature: 12, delay: 30, route: 20, weather: 10, cooling: 25, transit: 32 },
    eta: 180,
    progress: 58,
    distanceTotal: 710,
    distanceCovered: 412,
    aiRecommendation: "Continue monitoring cooling battery and maintain current route.",
    incidentReport: null,
    complianceReport: null,
    receiverSignature: false,
    qrCodeUrl: null,
    createdAt: minutesAgo(300),
    pickedUpAt: minutesAgo(240),
    deliveredAt: null,
  },
  {
    id: "SHP-2026-0038",
    shipmentId: "SHP-2026-0038",
    product: "Tocilizumab",
    productCategory: "biologic",
    batchNumber: "TCZ-26038",
    tempRange: { min: 2, max: 8 },
    quantity: 150,
    origin: { city: "Delhi", lat: 28.614, lng: 77.209 },
    destination: { city: "Kolkata", lat: 22.5726, lng: 88.3639 },
    checkpoints: [{ city: "Kanpur", lat: 26.4499, lng: 80.3319, crossedAt: minutesAgo(130) }],
    carrierId: "USR-003",
    receiverId: "USR-004",
    createdBy: "USR-002",
    status: "at-risk",
    priority: "urgent",
    currentTemp: 12.6,
    currentHumidity: 52,
    currentSpeed: 48,
    currentLat: 25.5941,
    currentLng: 85.1376,
    riskScore: 74,
    riskFactors: { temperature: 85, delay: 55, route: 30, weather: 10, cooling: 80, transit: 50 },
    eta: 260,
    progress: 64,
    distanceTotal: 1500,
    distanceCovered: 960,
    aiRecommendation: "Activate backup cooling and divert to the nearest certified cold storage point.",
    incidentReport: "Temperature excursion detected at 12.6°C for a 2°C to 8°C biologic shipment.",
    complianceReport: null,
    receiverSignature: false,
    qrCodeUrl: null,
    createdAt: minutesAgo(420),
    pickedUpAt: minutesAgo(360),
    deliveredAt: null,
  },
];

const payments = [
  ["PAY-0042", "SHP-2026-0042", "created", 125000, "USR-002", "Bharat Biotech", "USR-003", "BlueDart Pharma"],
  ["PAY-0041", "SHP-2026-0041", "released", 42000, "USR-002", "Bharat Biotech", "USR-003", "BlueDart Pharma"],
  ["PAY-0040", "SHP-2026-0040", "released", 78000, "USR-002", "Bharat Biotech", "USR-003", "BlueDart Pharma"],
  ["PAY-0039", "SHP-2026-0039", "held", 160000, "USR-002", "Bharat Biotech", "USR-003", "BlueDart Pharma"],
  ["PAY-0038", "SHP-2026-0038", "under-review", 98000, "USR-002", "Bharat Biotech", "USR-003", "BlueDart Pharma"],
].map(([paymentId, shipmentId, status, amount, payerId, payerName, payeeId, payeeName]) => ({
  id: paymentId,
  paymentId,
  shipmentId,
  payerId,
  payerName,
  payeeId,
  payeeName,
  amount,
  currency: "INR",
  status,
  conditions: {
    deliveryConfirmed: status === "released",
    tempCompliance: status === "released",
    chainVerified: status === "released",
    signatureReceived: status === "released",
  },
  disputeReason: null,
  disputeSeverity: null,
  blockchainRef: status === "released" ? "11" : null,
  createdAt: minutesAgo(700),
  heldAt: status === "created" ? null : minutesAgo(650),
  releasedAt: status === "released" ? minutesAgo(140) : null,
}));

const deliveredEvents = (shipment) => [
  { eventType: "SHIPMENT_CREATED", data: { shipmentId: shipment.shipmentId, product: shipment.product, origin: shipment.origin, destination: shipment.destination, carrier: shipment.carrierId } },
  { eventType: "PAYMENT_HELD", data: { paymentId: `PAY-${shipment.shipmentId.slice(-4)}`, shipmentId: shipment.shipmentId, amount: shipment.shipmentId.endsWith("0041") ? 42000 : 78000 } },
  { eventType: "SHIPMENT_PICKED_UP", data: { shipmentId: shipment.shipmentId, carrierId: shipment.carrierId } },
  { eventType: "CHECKPOINT_CROSSED", data: { shipmentId: shipment.shipmentId, checkpoint: shipment.checkpoints[0].city, lat: shipment.checkpoints[0].lat, lng: shipment.checkpoints[0].lng } },
  { eventType: "RISK_UPDATED", data: { shipmentId: shipment.shipmentId, oldScore: 24, newScore: shipment.riskScore, factors: shipment.riskFactors } },
  { eventType: "AI_RECOMMENDATION", data: { shipmentId: shipment.shipmentId, recommendation: shipment.aiRecommendation, riskReduction: "stable" } },
  { eventType: "CHECKPOINT_CROSSED", data: { shipmentId: shipment.shipmentId, checkpoint: shipment.destination.city, lat: shipment.destination.lat, lng: shipment.destination.lng } },
  { eventType: "DELIVERED", data: { shipmentId: shipment.shipmentId, receivedBy: shipment.receiverId, temperature: shipment.currentTemp, condition: "accepted" } },
  { eventType: "SIGNATURE_RECEIVED", data: { shipmentId: shipment.shipmentId, signedBy: shipment.receiverId } },
  { eventType: "PAYMENT_RELEASED", data: { paymentId: `PAY-${shipment.shipmentId.slice(-4)}`, shipmentId: shipment.shipmentId, amount: shipment.shipmentId.endsWith("0041") ? 42000 : 78000, conditions: { deliveryConfirmed: true, tempCompliance: true, chainVerified: true, signatureReceived: true } } },
  { eventType: "AI_RECOMMENDATION", data: { shipmentId: shipment.shipmentId, recommendation: "Archive audit package for regulator review.", riskReduction: "complete" } },
];

const blockchains = [
  ...chain("SHP-2026-0041", deliveredEvents(shipments[1]), 620),
  ...chain("SHP-2026-0040", deliveredEvents(shipments[2]), 840),
  ...chain("SHP-2026-0039", [
    { eventType: "SHIPMENT_CREATED", data: { shipmentId: "SHP-2026-0039", product: "Covishield", origin: shipments[3].origin, destination: shipments[3].destination, carrier: "USR-003" } },
    { eventType: "PAYMENT_HELD", data: { paymentId: "PAY-0039", shipmentId: "SHP-2026-0039", amount: 160000 } },
    { eventType: "SHIPMENT_PICKED_UP", data: { shipmentId: "SHP-2026-0039", carrierId: "USR-003" } },
    { eventType: "CHECKPOINT_CROSSED", data: { shipmentId: "SHP-2026-0039", checkpoint: "Solapur", lat: 17.6599, lng: 75.9064 } },
    { eventType: "RISK_UPDATED", data: { shipmentId: "SHP-2026-0039", oldScore: 22, newScore: 31, factors: shipments[3].riskFactors } },
  ], 300),
  ...chain("SHP-2026-0038", [
    { eventType: "SHIPMENT_CREATED", data: { shipmentId: "SHP-2026-0038", product: "Tocilizumab", origin: shipments[4].origin, destination: shipments[4].destination, carrier: "USR-003" } },
    { eventType: "PAYMENT_HELD", data: { paymentId: "PAY-0038", shipmentId: "SHP-2026-0038", amount: 98000 } },
    { eventType: "SHIPMENT_PICKED_UP", data: { shipmentId: "SHP-2026-0038", carrierId: "USR-003" } },
    { eventType: "TEMP_VIOLATION", data: { shipmentId: "SHP-2026-0038", temperature: 12.6, threshold: { min: 2, max: 8 }, duration: "18 minutes" } },
    { eventType: "RISK_UPDATED", data: { shipmentId: "SHP-2026-0038", oldScore: 38, newScore: 74, factors: shipments[4].riskFactors } },
    { eventType: "AI_RECOMMENDATION", data: { shipmentId: "SHP-2026-0038", recommendation: shipments[4].aiRecommendation, riskReduction: "pending" } },
  ], 420),
  ...chain("SHP-2026-0042", [
    { eventType: "SHIPMENT_CREATED", data: { shipmentId: "SHP-2026-0042", product: "Covaxin", origin: shipments[0].origin, destination: shipments[0].destination, carrier: "USR-003" } },
  ], 60),
];

const allTelemetry = [
  ...telemetry("TEL-0041", "SHP-2026-0041", 16, 560, shipments[1], shipments[1].tempRange),
  ...telemetry("TEL-0040", "SHP-2026-0040", 16, 780, shipments[2], shipments[2].tempRange),
  ...telemetry("TEL-0039", "SHP-2026-0039", 18, 240, shipments[3], shipments[3].tempRange),
  ...telemetry("TEL-0038", "SHP-2026-0038", 18, 360, shipments[4], shipments[4].tempRange, 14),
];

const notifications = Array.from({ length: 20 }, (_, index) => {
  const shipment = shipments[index % shipments.length];
  const severity = index % 7 === 0 ? "critical" : index % 3 === 0 ? "warning" : "info";
  const type = index % 5 === 0 ? "payment" : index % 4 === 0 ? "email" : severity === "critical" ? "alert" : "system";

  return {
    id: `NOTIF-${String(index + 1).padStart(3, "0")}`,
    type,
    severity,
    title:
      severity === "critical"
        ? "Cold-chain alert"
        : type === "payment"
          ? "Payment update"
          : "Shipment update",
    message: `${shipment.shipmentId} ${shipment.product} update for ${shipment.origin.city} to ${shipment.destination.city}.`,
    shipmentId: shipment.shipmentId,
    userId: index % 2 === 0 ? shipment.receiverId : shipment.carrierId,
    read: index % 4 === 0,
    actionUrl: `/shipments/${shipment.shipmentId}`,
    emailSentTo: type === "email" ? users[index % users.length].email : null,
    emailStatus: type === "email" ? "sent" : null,
    timestamp: minutesAgo(500 - index * 12),
  };
});

const DEMO_SHIPMENT_IDS = shipments.map((shipment) => shipment.shipmentId);
const DEMO_USER_IDS = users.map((user) => user.id);

async function commitDeletes(refs) {
  const uniqueRefs = Array.from(new Map(refs.map((ref) => [ref.path, ref])).values());

  for (let index = 0; index < uniqueRefs.length; index += 450) {
    const batch = db.batch();
    uniqueRefs.slice(index, index + 450).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

async function queryDemoRefs(collectionName) {
  const snapshot = await db
    .collection(collectionName)
    .where("shipmentId", "in", DEMO_SHIPMENT_IDS)
    .get();

  return snapshot.docs.map((doc) => doc.ref);
}

async function clearDemoData() {
  const refs = [
    ...DEMO_USER_IDS.map((id) => db.collection("users").doc(id)),
    ...DEMO_SHIPMENT_IDS.map((id) => db.collection("shipments").doc(id)),
    ...payments.map((payment) => db.collection("payments").doc(payment.id)),
    ...blockchains.map((block) => db.collection("blockchain").doc(block.id)),
    ...allTelemetry.map((reading) => db.collection("telemetry").doc(reading.id)),
    ...notifications.map((notification) => db.collection("notifications").doc(notification.id)),
  ];

  const generatedRefs = await Promise.all([
    queryDemoRefs("payments"),
    queryDemoRefs("blockchain"),
    queryDemoRefs("telemetry"),
    queryDemoRefs("notifications"),
  ]);

  await commitDeletes([...refs, ...generatedRefs.flat()]);
}

async function seed() {
  await clearDemoData();

  const batch = db.batch();

  users.forEach((user) => {
    batch.set(db.collection("users").doc(user.id), user);
  });

  shipments.forEach((shipment) => {
    batch.set(db.collection("shipments").doc(shipment.id), shipment);
  });

  payments.forEach((payment) => {
    batch.set(db.collection("payments").doc(payment.id), payment);
  });

  blockchains.forEach((block) => {
    batch.set(db.collection("blockchain").doc(block.id), block);
  });

  allTelemetry.forEach((reading) => {
    batch.set(db.collection("telemetry").doc(reading.id), reading);
  });

  notifications.forEach((notification) => {
    batch.set(db.collection("notifications").doc(notification.id), notification);
  });

  await batch.commit();

  console.log("MediTrack AI seed data written successfully.");
  console.log(`Users: ${users.length}`);
  console.log(`Shipments: ${shipments.length}`);
  console.log(`Payments: ${payments.length}`);
  console.log(`Blockchain blocks: ${blockchains.length}`);
  console.log(`Telemetry readings: ${allTelemetry.length}`);
  console.log(`Notifications: ${notifications.length}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
