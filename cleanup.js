const { readFileSync } = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const envFile = readFileSync(".env.local", "utf8");
envFile.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && !process.env[key]) process.env[key] = value;
  }
});

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
sa.private_key = sa.private_key.replace(/\\n/g, "\n");
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function deleteCollection(name) {
  const snap = await db.collection(name).get();
  const count = snap.size;
  for (const doc of snap.docs) await doc.ref.delete();
  console.log("Deleted " + count + " docs from " + name);
}

async function run() {
  await deleteCollection("shipments");
  await deleteCollection("telemetry");
  await deleteCollection("blockchain");
  await deleteCollection("payments");
  await deleteCollection("notifications");
  console.log("\nAll collections cleared!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });