"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getSession, signOut, storeToken } from "@/lib/auth"

type Session = ReturnType<typeof getSession>

export default function HomePage() {
    const [session, setSession] = useState<Session>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const urlToken = params.get("_vibe_token")
        if (urlToken) {
            storeToken(urlToken)
            params.delete("_vibe_token")
            const clean = window.location.pathname + (params.toString() ? "?" + params.toString() : "")
            window.history.replaceState({}, "", clean)
        }
        setSession(getSession())
        setIsLoading(false)
    }, [])

    if (isLoading) return null

    const authUrl = process.env.NEXT_PUBLIC_VIBE_AUTH_URL

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">vibe_client</h1>
                <p className="text-gray-500 mt-2">Next.js + Convex + VibeAuth</p>
            </div>

            {session ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-gray-600">
                        Signed in as <span className="font-medium">{session.user.email}</span>
                    </p>
                    <div className="flex gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Go to dashboard
                        </Link>
                        <button
                            onClick={async () => { await signOut(); setSession(null) }}
                            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            ) : (
                <a
                    href={`${authUrl}/api/relay?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
                    className="rounded-lg bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                    Sign in with VibeAuth
                </a>
            )}
        </main>
    )
}
