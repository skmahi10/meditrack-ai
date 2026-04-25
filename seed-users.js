const { readFileSync } = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Load .env.local manually
const envFile = readFileSync(".env.local", "utf8");
envFile.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
});

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
sa.private_key = sa.private_key.replace(/\\n/g, "\n");
initializeApp({ credential: cert(sa) });
const db = getFirestore();

const users = [
  { id: "USR-001", name: "Dr. Priya Sharma", email: "mahishaik567@gmail.com", role: "hospital", organization: "Apollo Hospital Delhi", location: "New Delhi", verified: true, trustScore: 92, activeShipments: 0 },
  { id: "USR-002", name: "Serum Institute", email: "mahishaik567@gmail.com", role: "manufacturer", organization: "Serum Institute of India", location: "Pune", verified: true, trustScore: 96, activeShipments: 0 },
  { id: "USR-003", name: "BlueDart Pharma", email: "mahishaik567@gmail.com", role: "carrier", organization: "BlueDart Pharma Logistics", location: "Mumbai", verified: true, trustScore: 88, activeShipments: 0 },
];

Promise.all(users.map((u) => db.collection("users").doc(u.id).set(u)))
  .then(() => {
    console.log("3 users created successfully!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  });