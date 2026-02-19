import { getAdmin } from "../src/lib/firebase.js";
import { listUsers, updateUserRole } from "../src/app/services/listUsers.js";
import { requireAdmin } from "./_auth.js";

type QueryValue = string | string[] | undefined;
type QueryMap = Record<string, QueryValue>;

type ApiRequest = {
  method?: string;
  query?: QueryMap;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function first(value: QueryValue): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

const MAX_PAGE_SIZE = 100;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    getAdmin();
    const adminUser = await requireAdmin(req, res);
    if (!adminUser) {
      return;
    }

    if (req.method === "GET") {
      const pageSizeRaw = first(req.query?.pageSize);
      const disabledRaw = first(req.query?.disabled);
      let pageSize: number | undefined;
      if (typeof pageSizeRaw === "string" && pageSizeRaw.trim() !== "") {
        const parsedPageSize = Number.parseInt(pageSizeRaw, 10);
        if (!Number.isNaN(parsedPageSize)) {
          pageSize = Math.min(Math.max(parsedPageSize, 1), MAX_PAGE_SIZE);
        }
      }

      const data = await listUsers({
        pageSize,
        pageToken: first(req.query?.pageToken),
        emailContains: first(req.query?.emailContains),
        disabled:
          disabledRaw === "true" || disabledRaw === "false"
            ? disabledRaw
            : undefined,
      });

      res.status(200).json(data);
      return;
    }

    const payload = (req.body ?? {}) as { uid?: string; role?: string };
    const uid = payload.uid?.trim();
    const role = payload.role?.trim();

    if (!uid || !role) {
      res.status(400).json({ error: "uid and role are required" });
      return;
    }

    const allowedRoles = new Set(["Owner", "Admin", "Editor", "Viewer", "User"]);
    if (!allowedRoles.has(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    await updateUserRole(uid, role);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Users API error:", error);
    res.status(500).json({ error: "Failed to process users request" });
  }
}
