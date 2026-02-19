import cors from "cors";
import express, { type Request, type Response } from "express";
import { listUsers, type ListUsersParams } from "../app/services/listUsers";
import { getAdmin } from "../lib/firebase";

const app = express();
const MAX_PAGE_SIZE = 100;
const trustedOrigins = (process.env.ADMIN_CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const requireAuth = process.env.REQUIRE_AUTH !== "false";

if (!requireAuth && process.env.NODE_ENV !== "development") {
    throw new Error("Refusing to start without auth in non-development. Set REQUIRE_AUTH=true.");
}

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || trustedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error("CORS origin not allowed"));
        },
        methods: ["GET", "PATCH", "OPTIONS"],
        credentials: true,
    }),
);
app.use(express.json());

app.use(async (req, res, next) => {
    if (!requireAuth) {
        next();
        return;
    }

    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        res.status(401).json({ error: "Missing bearer token" });
        return;
    }

    try {
        const decoded = await getAdmin().auth().verifyIdToken(token, true);
        const role = typeof decoded.role === "string" ? decoded.role.toLowerCase() : "";
        const isAdmin = decoded.admin === true || role === "admin" || role === "owner";

        if (!isAdmin) {
            res.status(403).json({ error: "Admin access required" });
            return;
        }

        next();
    } catch (error) {
        console.error("Auth middleware rejected request:", error);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

app.get("/admin/users", async (req: Request, res: Response) => {
    try {
        // Touch the admin app to fail fast if creds are bad
        getAdmin();

        const pageSizeRaw = typeof req.query.pageSize === "string" ? req.query.pageSize : undefined;
        let pageSize: number | undefined;
        if (pageSizeRaw && pageSizeRaw.trim() !== "") {
            const parsed = Number.parseInt(pageSizeRaw, 10);
            if (Number.isNaN(parsed)) {
                res.status(400).json({ error: "Invalid pageSize. Expected an integer." });
                return;
            }
            pageSize = Math.min(Math.max(parsed, 1), MAX_PAGE_SIZE);
        }

        const disabledRaw = typeof req.query.disabled === "string" ? req.query.disabled : undefined;
        if (disabledRaw && disabledRaw !== "true" && disabledRaw !== "false") {
            res.status(400).json({ error: "Invalid disabled. Expected 'true' or 'false'." });
            return;
        }

        const params: ListUsersParams = {
            pageSize,
            pageToken: typeof req.query.pageToken === "string" ? req.query.pageToken : undefined,
            emailContains:
                typeof req.query.emailContains === "string"
                    ? req.query.emailContains.trim().slice(0, 256)
                    : undefined,
            disabled: disabledRaw as "true" | "false" | undefined,
        };

        const data = await listUsers(params);
        res.json(data);
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ error: "Failed to list users" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Admin API listening on http://localhost:${PORT}`);
});
