import admin from "firebase-admin";
import { getServiceAccountFromEnv } from "./serviceAccount.js";

export function getAdmin(): admin.app.App {
  const existing = admin.apps.find((app) => app?.name === "[DEFAULT]");
  if (existing) {
    return existing;
  }

  const serviceAccount = getServiceAccountFromEnv();
  const credential = serviceAccount
    ? admin.credential.cert(serviceAccount as admin.ServiceAccount)
    : admin.credential.applicationDefault();

  return admin.initializeApp({
    credential,
    // databaseURL: "https://<your-db>.firebaseio.com" // only if using RTDB
  });
}
