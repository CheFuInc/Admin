import admin from "firebase-admin";
import { getAdmin } from "../../lib/firebase.js";

export interface ListUsersParams {
  pageSize?: number;           // 1..1000 (Firebase max is 1000)
  pageToken?: string;          // from previous response
  emailContains?: string;      // optional filter (client-side, after list)
  disabled?: "true" | "false"; // optional filter (client-side, after list)
}

export interface ListedUser {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  disabled: boolean;
  providerIds: string[];
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  customClaims?: Record<string, unknown>;
}

export interface ListUsersResponse {
  users: ListedUser[];
  nextPageToken?: string;
  count: number; // number returned in this page
}

export async function listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
  const app = getAdmin();
  const auth: admin.auth.Auth = app.auth();

  const maxResults = Math.min(Math.max(params.pageSize ?? 100, 1), 1000);

  const result = await auth.listUsers(maxResults, params.pageToken);

  // Transform to a clean shape
  let users: ListedUser[] = result.users.map((u) => ({
    uid: u.uid,
    email: u.email ?? undefined,
    phoneNumber: u.phoneNumber ?? undefined,
    displayName: u.displayName ?? undefined,
    disabled: u.disabled,
    providerIds: u.providerData.map((p) => p.providerId).filter(Boolean) as string[],
    metadata: {
      creationTime: u.metadata?.creationTime,
      lastSignInTime: u.metadata?.lastSignInTime,
    },
    customClaims: u.customClaims ?? undefined,
  }));

  // Optional in-memory filters (use sparingly; for large sets do it client-side with pagination)
  if (params.emailContains) {
    const q = params.emailContains.toLowerCase();
    users = users.filter((u) => (u.email ?? "").toLowerCase().includes(q));
  }
  if (params.disabled === "true" || params.disabled === "false") {
    const want = params.disabled === "true";
    users = users.filter((u) => u.disabled === want);
  }

  return {
    users,
    nextPageToken: result.pageToken,
    count: users.length,
  };
}
