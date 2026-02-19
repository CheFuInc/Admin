import { getAuthToken } from "./authToken";

export interface ListedUser {
    uid: string
    email?: string
    phoneNumber?: string
    displayName?: string
    disabled: boolean
    providerIds: string[]
    multiFactor?: {
        enrolledFactors?: Array<{ uid?: string; factorId?: string; displayName?: string }>
    }
    metadata: {
        creationTime?: string
        lastSignInTime?: string
    }
    customClaims?: Record<string, unknown>
}

export interface ListUsersResponse {
    users: ListedUser[]
    nextPageToken?: string
    count: number
}

export type UserRole = "Owner" | "Admin" | "Editor" | "Viewer" | "User"

export async function fetchUsers(signal?: AbortSignal): Promise<ListUsersResponse> {
    const endpoint = import.meta.env.VITE_LIST_USERS_API_URL ?? '/api/users'
    const token = await getAuthToken()
    const headers: Record<string, string> = {
        Accept: 'application/json',
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        signal,
    })

    if (!response.ok) {
        let details = ""
        try {
            const payload = (await response.json()) as { error?: string }
            if (payload?.error) {
                details = ` - ${payload.error}`
            }
        } catch {
            // Ignore JSON parse failures for non-JSON error bodies.
        }
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}${details}`)
    }

    return (await response.json()) as ListUsersResponse
}

export async function changeUserRole(uid: string, role: UserRole): Promise<void> {
    const endpoint = import.meta.env.VITE_LIST_USERS_API_URL ?? "/api/users"
    const token = await getAuthToken()
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(endpoint, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ uid, role }),
    })

    if (!response.ok) {
        let details = ""
        try {
            const payload = (await response.json()) as { error?: string }
            if (payload?.error) {
                details = ` - ${payload.error}`
            }
        } catch {
            // Ignore JSON parse failures for non-JSON error bodies.
        }
        throw new Error(`Failed to change role: ${response.status} ${response.statusText}${details}`)
    }
}
