import type admin from "firebase-admin";
import { getAdmin } from "../src/lib/firebase.js";

type ApiRequest = {
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function getHeader(headers: ApiRequest["headers"], name: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function isAdminClaims(claims: admin.auth.DecodedIdToken): boolean {
  const role = typeof claims.role === "string" ? claims.role.toLowerCase() : "";
  return claims.admin === true || role === "admin" || role === "owner";
}

export async function requireAdmin(
  req: ApiRequest,
  res: ApiResponse,
): Promise<admin.auth.DecodedIdToken | null> {
  const authorization = getHeader(req.headers, "authorization");

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return null;
  }

  try {
    const decoded = await getAdmin().auth().verifyIdToken(token, true);
    if (!isAdminClaims(decoded)) {
      res.status(403).json({ error: "Admin access required" });
      return null;
    }
    return decoded;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
}
