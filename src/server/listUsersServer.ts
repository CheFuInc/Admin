import cors from "cors";
import express, { type Request, type Response } from "express";
import { listUsers, type ListUsersParams } from "../app/services/listUsers";
import { getAdmin } from "../lib/firebase";

const app = express();
app.use(cors());
app.use(express.json());

// SIMPLE AUTH (replace with your real auth/SSO + RBAC middleware)
app.use((_req, _res, next) => {
    // e.g., check an admin bearer token or your SSO session
    // if (!req.headers.authorization?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    next();
});

app.get("/admin/users", async (req: Request, res: Response) => {
    try {
        // Touch the admin app to fail fast if creds are bad
        getAdmin();

        const params: ListUsersParams = {
            pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
            pageToken: req.query.pageToken as string | undefined,
            emailContains: req.query.emailContains as string | undefined,
            disabled: req.query.disabled as "true" | "false" | undefined,
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
