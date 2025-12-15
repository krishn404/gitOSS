import { query } from "./_generated/server"
import { v } from "convex/values"

// Public read-only query to get all staff picks ordered by weight
export const getPublicStaffPicks = query({
  args: {},
  async handler(ctx) {
    const staffPicks = await ctx.db
      .query("staffPicks")
      .withIndex("by_order")
      .collect()

    // Sort by order (lower = higher priority)
    return staffPicks.sort((a, b) => a.order - b.order)
  },
})
