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
  multiFactor?: {
    enrolledFactors?: Array<{ uid?: string; factorId?: string; displayName?: string }>;
  };
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

const ALLOWED_ROLES = new Set(["Owner", "Admin", "Editor", "Viewer", "User"]);
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1000;
const MAX_FILTER_ITERATIONS = 20;
const FILTER_CURSOR_PREFIX = "filtered:";

interface FilterCursor {
  firebasePageToken?: string;
  offsetInPage: number;
}

function encodeFilterCursor(cursor: FilterCursor): string {
  return `${FILTER_CURSOR_PREFIX}${Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")}`;
}

function decodeFilterCursor(pageToken?: string): FilterCursor {
  if (!pageToken) {
    return { firebasePageToken: undefined, offsetInPage: 0 };
  }

  if (!pageToken.startsWith(FILTER_CURSOR_PREFIX)) {
    return { firebasePageToken: pageToken, offsetInPage: 0 };
  }

  try {
    const payload = pageToken.slice(FILTER_CURSOR_PREFIX.length);
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<FilterCursor>;
    return {
      firebasePageToken: typeof parsed.firebasePageToken === "string" ? parsed.firebasePageToken : undefined,
      offsetInPage:
        typeof parsed.offsetInPage === "number" && Number.isInteger(parsed.offsetInPage) && parsed.offsetInPage >= 0
          ? parsed.offsetInPage
          : 0,
    };
  } catch {
    return { firebasePageToken: undefined, offsetInPage: 0 };
  }
}

function toListedUser(u: admin.auth.UserRecord): ListedUser {
  return {
    uid: u.uid,
    email: u.email ?? undefined,
    phoneNumber: u.phoneNumber ?? undefined,
    displayName: u.displayName ?? undefined,
    disabled: u.disabled,
    providerIds: u.providerData.map((p) => p.providerId).filter(Boolean) as string[],
    multiFactor: u.multiFactor?.enrolledFactors
      ? {
          enrolledFactors: u.multiFactor.enrolledFactors.map((factor) => ({
            uid: factor.uid,
            factorId: factor.factorId,
            displayName: factor.displayName,
          })),
        }
      : undefined,
    metadata: {
      creationTime: u.metadata?.creationTime,
      lastSignInTime: u.metadata?.lastSignInTime,
    },
    customClaims: u.customClaims ?? undefined,
  };
}

export async function updateUserRole(uid: string, role: string): Promise<void> {
  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(
      `Invalid role "${role}". Allowed roles: ${Array.from(ALLOWED_ROLES).join(", ")}`,
    );
  }

  const app = getAdmin();
  const auth: admin.auth.Auth = app.auth();

  const user = await auth.getUser(uid);
  const existingClaims = (user.customClaims ?? {}) as Record<string, unknown>;
  const nextClaims = { ...existingClaims };

  if (role === "User") {
    delete nextClaims.role;
  } else {
    nextClaims.role = role;
  }

  await auth.setCustomUserClaims(uid, nextClaims);
}

export async function listUsers(params: ListUsersParams): Promise<ListUsersResponse> {
  const app = getAdmin();
  const auth: admin.auth.Auth = app.auth();

  const maxResults = Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const hasEmailFilter = Boolean(params.emailContains?.trim());
  const hasDisabledFilter = params.disabled === "true" || params.disabled === "false";
  const hasServerSideFilter = hasEmailFilter || hasDisabledFilter;
  const decodedCursor = decodeFilterCursor(params.pageToken);

  if (!hasServerSideFilter) {
    const result = await auth.listUsers(maxResults, decodedCursor.firebasePageToken);
    const users = result.users.map(toListedUser);

    return {
      users,
      nextPageToken: result.pageToken,
      count: users.length,
    };
  }

  const users: ListedUser[] = [];
  let firebasePageToken = decodedCursor.firebasePageToken;
  let offsetInPage = decodedCursor.offsetInPage;
  let nextPageToken: string | undefined;
  let iterations = 0;

  while (users.length < maxResults && iterations < MAX_FILTER_ITERATIONS) {
    const pageStartToken = firebasePageToken;
    const result = await auth.listUsers(maxResults, pageStartToken);
    firebasePageToken = result.pageToken;
    iterations += 1;

    const q = params.emailContains?.toLowerCase();
    const filteredUsersOnPage = result.users
      .map(toListedUser)
      .filter((u) => {
        if (q && !(u.email ?? "").toLowerCase().includes(q)) {
          return false;
        }
        if (params.disabled === "true" || params.disabled === "false") {
          const want = params.disabled === "true";
          return u.disabled === want;
        }
        return true;
      });

    let consumedFromFiltered = offsetInPage;
    const remainingFilteredUsers = filteredUsersOnPage.slice(offsetInPage);

    for (const user of remainingFilteredUsers) {
      users.push(user);
      consumedFromFiltered += 1;
      if (users.length >= maxResults) {
        break;
      }
    }

    if (users.length >= maxResults && consumedFromFiltered < filteredUsersOnPage.length) {
      nextPageToken = encodeFilterCursor({
        firebasePageToken: pageStartToken,
        offsetInPage: consumedFromFiltered,
      });
      break;
    }

    offsetInPage = 0;

    if (!firebasePageToken) {
      nextPageToken = undefined;
      break;
    }

    nextPageToken = firebasePageToken;
  }

  return {
    users,
    nextPageToken,
    count: users.length,
  };
}
