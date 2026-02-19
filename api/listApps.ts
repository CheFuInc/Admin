import { fetchFirebaseWebApps } from "../src/server/listAppsServer.js";
import { requireAdmin } from "./_auth.js";

type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const adminUser = await requireAdmin(req, res);
  if (!adminUser) {
    return;
  }

  try {
    const apps = await fetchFirebaseWebApps();
    res.status(200).json({ apps });
  } catch (error) {
    console.error("List apps error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to list apps",
    });
  }
}
