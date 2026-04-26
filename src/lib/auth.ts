const TOKEN_KEY = "vibe_token"

function parsePayload(token: string): Record<string, unknown> | null {
    try {
        return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    } catch {
        return null
    }
}

function isExpired(token: string): boolean {
    const p = parsePayload(token)
    return !p?.exp || (p.exp as number) < Date.now() / 1000
}

export function storeToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY)
}

export function getValidToken(): string | null {
    if (typeof window === "undefined") return null
    const t = localStorage.getItem(TOKEN_KEY)
    return t && !isExpired(t) ? t : null
}

export function getSession(): { user: { id: string; email: string; name: string } } | null {
    const t = getValidToken()
    if (!t) return null
    const p = parsePayload(t)
    if (!p) return null
    return {
        user: {
            id: (p.sub as string) || "",
            email: (p.email as string) || "",
            name: (p.name as string) || "",
        },
    }
}

export async function signOut() {
    clearToken()
    try {
        await fetch(`${process.env.NEXT_PUBLIC_VIBE_AUTH_URL}/api/auth/sign-out`, {
            method: "POST",
            credentials: "include",
        })
    } catch {}
}
