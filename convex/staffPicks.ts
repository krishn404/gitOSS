import { query } from "./_generated/server"

// Public read-only query to get all staff picks
// Ordered by staffPickedAt (most recent first)
export const getPublicStaffPicks = query({
  args: {},
  async handler(ctx) {
    const picks = await ctx.db
      .query("repositories")
      .withIndex("by_staff_pick", (q) => q.eq("isStaffPicked", true))
      .order("desc")
      .collect()

    return picks.map((repo, idx) => ({
      repoId: repo.repoId,
      order: idx,
      reason: repo.staffPickNote ?? undefined,
      staffPickBadges: repo.staffPickBadges,
      staffPickedAt: repo.staffPickedAt,
    }))
  },
})
