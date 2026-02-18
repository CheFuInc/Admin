export interface ListedUser {
    uid: string
    email?: string
    phoneNumber?: string
    displayName?: string
    disabled: boolean
    providerIds: string[]
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

export async function fetchUsers(signal?: AbortSignal): Promise<ListUsersResponse> {
    const endpoint = import.meta.env.VITE_LIST_USERS_API_URL ?? '/api/users'

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        signal,
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as ListUsersResponse
}
