import type { ServiceAccount } from "../types/ServiceAccount";

function normalizePrivateKey(value: string | undefined): string | undefined {
    return value ? value.replace(/\\n/g, "\n") : undefined;
}

export function getServiceAccountFromEnv(): ServiceAccount {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (rawJson) {
        const parsed = JSON.parse(rawJson) as ServiceAccount;
        if (parsed.private_key) {
            parsed.private_key = normalizePrivateKey(parsed.private_key) ?? parsed.private_key;
        }
        return parsed;
    }

    const required = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI ?? "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI ?? "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
            process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ?? "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    };

    const missing = Object.entries(required)
        .filter(([key, value]) => key !== "universe_domain" && !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing Firebase service-account env vars: ${missing.join(", ")}`);
    }

    return required as ServiceAccount;
}
