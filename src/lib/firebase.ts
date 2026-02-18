import admin from "firebase-admin";
import serviceAccount from "./service-account.json";

let initialized = false;

export function getAdmin(): admin.app.App {
  if (!initialized) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      // databaseURL: "https://<your-db>.firebaseio.com" // only if using RTDB
    });
    initialized = true;
  }
  return admin.app();
}