import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // Cache for GitHub repository searches
  repositoriesCache: defineTable({
    cacheKey: v.string(),
    repositories: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        full_name: v.string(),
        description: v.optional(v.string()),
        html_url: v.string(),
        language: v.optional(v.string()),
        stargazers_count: v.number(),
        forks_count: v.number(),
        topics: v.optional(v.array(v.string())),
        updated_at: v.optional(v.string()),
        owner: v.object({
          avatar_url: v.string(),
          login: v.string(),
        }),
      }),
    ),
    total: v.number(),
    hasMore: v.boolean(),
    page: v.number(),
    query: v.string(),
    language: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_cache_key", ["cacheKey"])
    .index("by_expires", ["expiresAt"]),

  // User saved repositories
  savedRepositories: defineTable({
    userId: v.string(),
    repositoryId: v.number(),
    repositoryName: v.string(),
    repositoryUrl: v.string(),
    savedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_repository", ["repositoryId"]),

  // User preferences
  userPreferences: defineTable({
    userId: v.string(),
    preferredLanguages: v.array(v.string()),
    theme: v.string(),
    resultsPerPage: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Trending repositories cache
  trendingRepositories: defineTable({
    repositories: v.array(
      v.object({
        id: v.number(),
        name: v.string(),
        full_name: v.string(),
        description: v.optional(v.string()),
        url: v.string(),
        language: v.optional(v.string()),
        stargazers_count: v.number(),
      }),
    ),
    period: v.string(), // "today", "week", "month"
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_period", ["period"])
    .index("by_expires", ["expiresAt"]),
})
