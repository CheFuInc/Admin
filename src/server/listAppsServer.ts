import { google } from "googleapis";
import { getServiceAccountFromEnv } from "../lib/serviceAccount";

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

function resolveProjectId(explicitProjectId?: string): string {
    return (
        explicitProjectId?.trim() ||
        process.env.FIREBASE_PROJECT_ID ||
        process.env.GCLOUD_PROJECT ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        ""
    );
}

export async function fetchFirebaseWebApps(
    projectId?: string,
): Promise<FirebaseWebApp[]> {
    const resolvedProjectId = resolveProjectId(projectId);
    if (!resolvedProjectId) {
        throw new Error(
            "Missing Firebase project id. Set FIREBASE_PROJECT_ID, GCLOUD_PROJECT, or GOOGLE_CLOUD_PROJECT.",
        );
    }

    const credentials = getServiceAccountFromEnv();

    const auth = new google.auth.GoogleAuth({
        scopes: ["https://www.googleapis.com/auth/firebase"],
        ...(credentials ? { credentials } : {}),
    });

    const firebase = google.firebase({
        version: "v1beta1",
        auth,
    });

    const apps: FirebaseWebApp[] = [];
    let pageToken: string | undefined;

    do {
        const res = await firebase.projects.webApps.list({
            parent: `projects/${resolvedProjectId}`,
            pageToken,
        });

        apps.push(...((res.data.apps as FirebaseWebApp[] | undefined) ?? []));
        pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return apps;
}
