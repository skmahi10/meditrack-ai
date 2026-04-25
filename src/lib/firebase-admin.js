import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminConfig() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    const parsed = JSON.parse(serviceAccount);

    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }

    return {
      credential: cert(parsed),
      projectId: parsed.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    };
  }

  return {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "meditrack-ai",
  };
}

const app = getApps().length ? getApp() : initializeApp(getAdminConfig());

export const db = getFirestore(app);
export { app as adminApp };
