"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useQuery } from "convex/react"
import { authClient } from "@/lib/auth"
import { api } from "../../../convex/_generated/api"

export default function DashboardPage() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()
    const me = useQuery(api.users.me)

    useEffect(() => {
        if (!isPending && !session) {
            router.push(`${process.env.NEXT_PUBLIC_VIBE_AUTH_URL}/auth/sign-in?callbackURL=${encodeURIComponent(window.location.origin)}`)
        }
    }, [session, isPending, router])

    if (isPending || !session) return null

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button
                    onClick={() => authClient.signOut().then(() => router.push("/"))}
                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                    Sign out
                </button>
            </div>

            <div className="rounded-lg border p-6 flex flex-col gap-4">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">VibeAuth session</p>
                    <p className="font-medium">{session.user.name || session.user.email}</p>
                    <p className="text-sm text-gray-500">{session.user.email}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {session.user.id}</p>
                </div>

                <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Convex record</p>
                    {me === undefined ? (
                        <p className="text-sm text-gray-400">Loading...</p>
                    ) : me === null ? (
                        <p className="text-sm text-gray-400">No Convex record yet.</p>
                    ) : (
                        <pre className="text-xs font-mono text-gray-600 bg-gray-50 rounded p-2 overflow-auto">{JSON.stringify(me, null, 2)}</pre>
                    )}
                </div>
            </div>
        </main>
    )
}
