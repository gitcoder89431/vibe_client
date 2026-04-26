import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const me = query({
    async handler(ctx) {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return null
        return ctx.db
            .query("users")
            .withIndex("by_vibe_auth_id", (q) => q.eq("vibeAuthId", identity.subject))
            .unique()
    },
})

export const getOrCreate = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Not authenticated")

        const existing = await ctx.db
            .query("users")
            .withIndex("by_vibe_auth_id", (q) => q.eq("vibeAuthId", identity.subject))
            .unique()

        if (existing) return existing

        const id = await ctx.db.insert("users", {
            vibeAuthId: identity.subject,
            email: args.email,
            name: args.name,
            image: args.image,
        })
        return ctx.db.get(id)
    },
})
