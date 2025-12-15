import { internalMutation } from "./_generated/server";

// One-off migration to backfill missing user roles. Run from the Convex dashboard.
export const backfillUserRoles = internalMutation({
  args: {},
  async handler(ctx) {
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      if (!user.role) {
        await ctx.db.patch(user._id, {
          role: "user",
        });
      }
    }

    return { migrated: users.length };
  },
});
