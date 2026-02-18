import { getFirebaseClientAuth, shouldEnforceAdminAuth } from "../../lib/firebaseClient";

export async function getAuthToken(): Promise<string | null> {
  if (!shouldEnforceAdminAuth()) {
    return null;
  }

  const auth = getFirebaseClientAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user.getIdToken();
}
