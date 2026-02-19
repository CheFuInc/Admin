import { onAuthStateChanged, type Auth } from "firebase/auth";
import { getFirebaseClientAuth, shouldEnforceAdminAuth } from "../../lib/firebaseClient";

async function waitForAuthReady(auth: Auth): Promise<void> {
  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
    return;
  }

  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe();
      resolve();
    });
  });
}

export async function getAuthToken(): Promise<string | null> {
  if (!shouldEnforceAdminAuth()) {
    return null;
  }

  const auth = getFirebaseClientAuth();
  await waitForAuthReady(auth);
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not authenticated.");
  }

  return user.getIdToken();
}
