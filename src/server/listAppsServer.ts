import { google } from "googleapis";
import serviceAccount from "../lib/service-account.json";
import type { ServiceAccount } from "../types/ServiceAccount";

export interface FirebaseWebApp {
    appId?: string;
    displayName?: string;
    projectId?: string;
    apiKeyId?: string;
    state?: string;
    expireTime?: string;
    name?: string;
    platform?: string;
}

export async function fetchFirebaseWebApps(
    projectId = "cheforumreal",
): Promise<FirebaseWebApp[]> {
    const credentials: ServiceAccount = serviceAccount;

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/firebase"],
    });

    const firebase = google.firebase({
        version: "v1beta1",
        auth,
    });

    const res = await firebase.projects.webApps.list({
        parent: `projects/${projectId}`,
    });

    return (res.data.apps as FirebaseWebApp[] | undefined) ?? [];
}
