"use client"

import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithAuth } from "convex/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { storeToken, getValidToken } from "@/lib/auth"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

function useVibeAuth() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const urlToken = params.get("_vibe_token")

        if (urlToken) {
            storeToken(urlToken)
            params.delete("_vibe_token")
            const clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
            window.history.replaceState({}, "", clean)
            setIsAuthenticated(true)
        } else {
            setIsAuthenticated(!!getValidToken())
        }
        setIsLoading(false)
    }, [])

    const fetchAccessToken = useCallback(async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
        if (forceRefreshToken) return null
        return getValidToken()
    }, [])

    return useMemo(() => ({ isLoading, isAuthenticated, fetchAccessToken }), [isLoading, isAuthenticated, fetchAccessToken])
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConvexProviderWithAuth client={convex} useAuth={useVibeAuth}>
            {children}
        </ConvexProviderWithAuth>
    )
}
