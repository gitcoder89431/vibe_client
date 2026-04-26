"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithAuth } from "convex/react"
import { useCallback, useMemo } from "react"
import { authClient } from "@/lib/auth"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function useVibeAuth() {
    const { data: session, isPending } = authClient.useSession()

    const fetchAccessToken = useCallback(async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        if (!session) return null
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_VIBE_AUTH_URL}/api/auth/token`,
                {
                    credentials: "include",
                    cache: forceRefreshToken ? "no-store" : "default",
                }
            )
            if (!res.ok) return null
            const { token } = await res.json()
            return token ?? null
        } catch {
            return null
        }
    }, [session])

    return useMemo(() => ({
        isLoading: isPending,
        isAuthenticated: !!session,
        fetchAccessToken,
    }), [isPending, session, fetchAccessToken])
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConvexProviderWithAuth client={convex} useAuth={useVibeAuth}>
            {children}
        </ConvexProviderWithAuth>
    )
}
