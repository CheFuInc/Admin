import { getAuthToken } from "./authToken";

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

type ListAppsResponse = {
  apps?: FirebaseWebApp[];
};

export async function listApps(signal?: AbortSignal): Promise<FirebaseWebApp[]> {
  const endpoint = import.meta.env.VITE_LIST_APPS_API_URL ?? "/api/listApps";
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch apps: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as ListAppsResponse | FirebaseWebApp[];

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.apps ?? [];
}
