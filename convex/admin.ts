import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Helper function to verify admin role - throws if not admin
async function verifyAdmin(ctx: any, userId: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .first()

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required")
  }

  return user
}

// Admin-only query to check admin access (for UI gating)
export const checkAdminAccess = query({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    await verifyAdmin(ctx, args.userId)
    return { isAdmin: true }
  },
})

// Admin-only query to get all staff picks
export const getStaffPicks = query({
  args: {
    userId: v.string(),
  },
  async handler(ctx, args) {
    await verifyAdmin(ctx, args.userId)

    const staffPicks = await ctx.db
      .query("staffPicks")
      .withIndex("by_order")
      .collect()

    return staffPicks.sort((a, b) => a.order - b.order)
  },
})

// Admin-only mutation to add a staff pick
export const addStaffPick = mutation({
  args: {
    userId: v.string(),
    repoId: v.number(),
    reason: v.string(),
    order: v.number(),
  },
  async handler(ctx, args) {
    await verifyAdmin(ctx, args.userId)

    // Check if repo already exists
    const existing = await ctx.db
      .query("staffPicks")
      .withIndex("by_repo_id", (q) => q.eq("repoId", args.repoId))
      .first()

    if (existing) {
      throw new Error("Repository is already a staff pick")
    }

    const now = Date.now()
    const id = await ctx.db.insert("staffPicks", {
      repoId: args.repoId,
      reason: args.reason,
      order: args.order,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(id)
  },
})

// Admin-only mutation to update a staff pick
export const updateStaffPick = mutation({
  args: {
    userId: v.string(),
    staffPickId: v.id("staffPicks"),
    reason: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  async handler(ctx, args) {
    await verifyAdmin(ctx, args.userId)

    const staffPick = await ctx.db.get(args.staffPickId)
    if (!staffPick) {
      throw new Error("Staff pick not found")
    }

    const updates: any = {
      updatedAt: Date.now(),
    }

    if (args.reason !== undefined) {
      updates.reason = args.reason
    }

    if (args.order !== undefined) {
      updates.order = args.order
    }

    await ctx.db.patch(args.staffPickId, updates)
    return await ctx.db.get(args.staffPickId)
  },
})

// Admin-only mutation to remove a staff pick
export const removeStaffPick = mutation({
  args: {
    userId: v.string(),
    staffPickId: v.id("staffPicks"),
  },
  async handler(ctx, args) {
    await verifyAdmin(ctx, args.userId)

    const staffPick = await ctx.db.get(args.staffPickId)
    if (!staffPick) {
      throw new Error("Staff pick not found")
    }

    await ctx.db.delete(args.staffPickId)
    return { success: true }
  },
})
