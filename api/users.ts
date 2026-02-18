import { getAdmin } from "../src/lib/firebase.js";
import { listUsers } from "../src/app/services/listUsers.js";

type QueryValue = string | string[] | undefined;
type QueryMap = Record<string, QueryValue>;

type ApiRequest = {
  method?: string;
  query?: QueryMap;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

function first(value: QueryValue): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    try {
        getAdmin();

        const pageSizeRaw = first(req.query?.pageSize);
        const disabledRaw = first(req.query?.disabled);

        const data = await listUsers({
            pageSize: pageSizeRaw ? Number(pageSizeRaw) : undefined,
            pageToken: first(req.query?.pageToken),
            emailContains: first(req.query?.emailContains),
            disabled:
                disabledRaw === "true" || disabledRaw === "false"
                    ? disabledRaw
                    : undefined,
        });

        res.status(200).json(data);
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ error: "Failed to list users" });
    }
}
