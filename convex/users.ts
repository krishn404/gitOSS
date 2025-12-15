import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

async function getUserByUserId(ctx: any, userId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first()
}

export const getUserProfile = query({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    return await getUserByUserId(ctx, args.userId)
  },
})

/**
 * Query to check if a user is an admin (for UI gating only).
 * 
 * This is a read-only query for UI purposes. Security is enforced
 * in mutations via verifyAdmin checks. This query does not require
 * authentication because it only returns a boolean and cannot modify data.
 */
export const checkIsAdmin = query({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    const user = await getUserByUserId(ctx, args.userId)

    return user?.role === "admin"
  },
})

export const createOrUpdateUser = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    provider: v.string(),
    providerAccountId: v.string(),
  },
  async handler(ctx, args) {
    const existing = await getUserByUserId(ctx, args.userId)

    const now = Date.now()

    if (existing) {
      // Update existing user (preserve role - never change via this mutation)
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        email: args.email ?? existing.email,
        image: args.image ?? existing.image,
        lastLoginAt: now,
        loginCount: existing.loginCount + 1,
        role: existing.role ?? "user", // Always preserve existing role
      })
      return await ctx.db.get(existing._id)
    } else {
      // Create new user - always defaults to "user" role
      // Admin promotion must be done via promoteToAdmin mutation
      const id = await ctx.db.insert("users", {
        userId: args.userId,
        name: args.name,
        email: args.email,
        image: args.image,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        role: "user", // Default role - admin promotion is separate
        createdAt: now,
        lastLoginAt: now,
        loginCount: 1,
      })
      return await ctx.db.get(id)
    }
  },
})

/**
 * Internal-only mutation to promote a user to admin.
 * 
 * This mutation is NOT exposed to clients and should only be called:
 * - Directly from the Convex dashboard
 * - Via internal system processes
 * 
 * WARNING: This mutation does NOT check for admin permissions because it is
 * intended to be called only from trusted sources (Convex dashboard).
 */
export const _internalPromoteToAdmin = internalMutation({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    const user = await getUserByUserId(ctx, args.userId)

    if (!user) {
      throw new Error("User not found")
    }

    if (user.role === "admin") {
      return user // Already admin
    }

    // Promote to admin
    await ctx.db.patch(user._id, {
      role: "admin",
    })

    return await ctx.db.get(user._id)
  },
})
