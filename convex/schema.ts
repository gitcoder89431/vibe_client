import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    users: defineTable({
        vibeAuthId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        image: v.optional(v.string()),
    }).index("by_vibe_auth_id", ["vibeAuthId"]),
})
