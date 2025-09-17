export function fetchFromBackend(endpoint: string, options?: RequestInit) {
    return fetch(
        new URL(
            endpoint,
            process.env.NEXT_PUBLIC_BACKEND_URL,
        ),
        {
            ...options,
            credentials: "include",
        },
    );
}