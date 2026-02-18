import admin from "firebase-admin";
import { getServiceAccountFromEnv } from "./serviceAccount";

let initialized = false;

export function getAdmin(): admin.app.App {
  if (!initialized) {
    const serviceAccount = getServiceAccountFromEnv();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // databaseURL: "https://<your-db>.firebaseio.com" // only if using RTDB
    });
    initialized = true;
  }
  return admin.app();
}
