import type { UserProfile, RepoSignals } from "@/types/index"
import { callGroqWithFallback } from "@/lib/groq-fallback"

/**
 * System Prompt (openai/gpt-oss-120b):
 * Analyze user GitHub profile + candidate repos and recommend contribution-ready matches
 */
export const OSS120B_SYSTEM_PROMPT = `You are an open-source contribution recommender.

You will receive:
1) A GitHub user profile summary built from Octokit signals (languages, frameworks, topics, repo types, contribution activity).
2) A candidate list of repositories fetched from the GitHub API.

Your job:
- Select 5–10 repositories the user has NOT starred, forked, owned, or previously contributed to.
- Prefer NEW open-source suggestions (fresh repos beyond the user's starred/forked list).
- Rank recommendations by compatibility and contribution readiness.

Hard rules:
- Do NOT recommend any repo that appears in the excluded list.
- Do NOT recommend repos owned by the user.
- Do NOT recommend repos the user already starred or forked.
- Only choose from the provided candidate list (no hallucinated repos).

Ranking signals:
- Language + framework alignment with the user's primary stack
- Topic/domain overlap (DX tools, web dev, backend, frontend, devtools, AI tooling, etc.)
- Repo health: recent updates, active maintainers, reasonable open issues/PR activity
- Contributor friendliness: clear README, CONTRIBUTING, labels like "good first issue" / "help wanted"
- Practical onboarding: clear tasks suitable for first PRs

Output requirements:
Return ONLY valid JSON (no markdown, no commentary) in this exact format:
[
  {
    "full_name": "owner/repo",
    "matchScore": 0,
    "summary": "Unique, specific reason why THIS repo matches the user (80-120 chars). Be specific about the repo's features, domain, or tech stack that aligns with the user's profile. Avoid generic phrases.",
    "whyMatches": ["Reason 1", "Reason 2"],
    "firstSteps": ["Step 1", "Step 2"],
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]

Content style rules:
- The "summary" field is critical - make it unique per repo. Reference specific technologies, features, or project goals that match the user's experience.
- Example good summary: "Builds React components like your starred projects, needs help with TypeScript migrations"
- Example bad summary: "A good open source project" (too generic)
- Keep explanations concrete and contribution-focused (what the user can ship).
- If no good matches exist, return an empty JSON array [].`

/**
 * Build comprehensive user profile summary for LLM analysis
 */
function buildUserProfileSummary(userProfile: UserProfile): string {
  const topLanguages = Array.from(userProfile.languages.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)

  return `
GitHub User Profile:
- Primary Languages: ${topLanguages.join(", ")}
- Interests/Topics: ${Array.from(userProfile.topics).slice(0, 10).join(", ") || "None specified"}
- Frameworks: ${Array.from(userProfile.frameworks).join(", ") || "None specified"}
- Recent Activity: Active in last ${userProfile.lastActivityWindow} days
- Repository Preferences: ${JSON.stringify(userProfile.repoTypes)}
- Active Repos: ${userProfile.activeRepos.length} repos updated in last 90 days
`
}

/**
 * Build candidate repositories summary for LLM analysis
 */
function buildCandidateReposSummary(candidateRepos: any[]): string {
  return candidateRepos
    .slice(0, 50)
    .map((repo, idx) => {
      return `${idx + 1}. ${repo.full_name}
   - Description: ${repo.description || "N/A"}
   - Language: ${repo.language || "Multiple"}
   - Stars: ${repo.stargazers_count}, Forks: ${repo.forks_count}
   - Open Issues: ${repo.open_issues_count || 0}
   - Topics: ${(repo.topics || []).slice(0, 5).join(", ") || "None"}
   - Updated: ${repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : "Unknown"}`
    })
    .join("\n\n")
}

/**
 * Alias for getOss120bRecommendations (Groq-compatible)
 */
export const getGroqRecommendations = getOss120bRecommendations

/**
 * Use openai/gpt-oss-120b to analyze user profile and select best matching repos from candidates
 */
export async function getOss120bRecommendations(
  userProfile: UserProfile,
  candidateRepos: any[],
  existingRepos: Set<string>,
): Promise<any[]> {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn("[Groq] GROQ_API_KEY not set, skipping LLM recommendations")
      return []
    }

    const userProfileSummary = buildUserProfileSummary(userProfile)
    const reposSummary = buildCandidateReposSummary(candidateRepos)
    const excludedRepos = Array.from(existingRepos).slice(0, 30).join(", ")

    const prompt = `${OSS120B_SYSTEM_PROMPT}

${userProfileSummary}

Candidate Repositories (must pick ONLY from these):
${reposSummary}

Excluded Repos (user already starred/forked/owns/contributed): ${excludedRepos}

Task:
Pick 5–10 NEW open-source repos from the candidate list only.
Do not include anything from the excluded list.
Return JSON only in the required schema.`

    // Use Groq fallback system
    const result = await callGroqWithFallback(prompt, {
      temperature: 0.4,
      maxTokens: 2000,
      timeout: 30000, // 30 seconds for batch analysis
    })

    if (!result.success) {
      console.warn(`[Groq] Failed to get recommendations: ${result.error}`)
      return []
    }

    const response = result.data.trim()
    if (!response) throw new Error("Empty Groq response")

    // Extract JSON (in case it wraps, still harden)
    let jsonStr = response
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const selections = JSON.parse(jsonStr)

    // Map selections back to full repo objects
    const selectedRepos: any[] = []
    for (const selection of selections) {
      const repo = candidateRepos.find((r) => r.full_name === selection.full_name)
      if (repo && !existingRepos.has(repo.full_name)) {
        selectedRepos.push({
          ...repo,
          groqData: selection, // Renamed from llmData to groqData for clarity
        })
      }
    }

    console.log(`[Groq] Successfully selected ${selectedRepos.length} repos using model: ${result.modelUsed}`)
    return selectedRepos
  } catch (error) {
    console.error("[Groq] Error getting recommendations:", error)
    return []
  }
}

/**
 * Generate match reasoning for a single repo (fallback if batch groqData missing)
 */
export async function generateMatchReasoning(
  userProfile: UserProfile,
  repo: any,
  repoSignals: RepoSignals,
  groqData?: any,
): Promise<{
  reason: string
  matchFactors: string[]
  firstSteps: string[]
  matchScore: number
  difficulty: string
}> {
  // If batch analysis already provided reasoning, use it
  if (groqData) {
    return {
      reason: groqData.summary || "Well-matched for your profile",
      matchFactors: groqData.whyMatches || [],
      firstSteps: groqData.firstSteps || [],
      matchScore: groqData.matchScore || 75,
      difficulty: groqData.difficulty || "Medium",
    }
  }

  // Otherwise do single-repo reasoning via Groq (optional)
  try {
    if (!process.env.GROQ_API_KEY) {
      return {
        reason: "Recommended for your profile",
        matchFactors: ["Open source", "Active repository"],
        firstSteps: ["Explore the repository", "Read the README"],
        matchScore: 60,
        difficulty: "Medium",
      }
    }

    const userProfileStr = `
Languages: ${Array.from(userProfile.languages.keys()).join(", ")}
Topics: ${Array.from(userProfile.topics).join(", ")}
Frameworks: ${Array.from(userProfile.frameworks).join(", ")}
Recent Activity Window: ${userProfile.lastActivityWindow} days
Repository Types: ${JSON.stringify(userProfile.repoTypes)}
`

    const repoDataStr = `
Repository: ${repo.full_name}
Description: ${repo.description || "N/A"}
Language: ${repo.language}
Topics: ${repo.topics?.join(", ") || "N/A"}
Stars: ${repo.stargazers_count}
Forks: ${repo.forks_count}
Open Issues: ${repo.open_issues_count}
Has Good First Issue: ${repoSignals.hasGoodFirstIssue}
Has Help Wanted: ${repoSignals.hasHelpWanted}
Maintenance Health: ${repoSignals.maintenanceHealth}%
Contribution Friendliness: ${repoSignals.contributionFriendliness}%
`

    const prompt = `${OSS120B_SYSTEM_PROMPT}

User Profile:
${userProfileStr}

Repo:
${repoDataStr}

Return JSON only:
{"summary":"...", "matchScore":0, "whyMatches":["...","..."], "firstSteps":["...","..."], "difficulty":"Easy|Medium|Hard"}`

    const result = await callGroqWithFallback(prompt, {
      temperature: 0.3,
      maxTokens: 500,
      timeout: 15000, // 15 seconds for single repo
    })

    if (!result.success) {
      throw new Error(result.error)
    }

    const response = result.data.trim()
    if (!response) throw new Error("Empty Groq response")

    let jsonStr = response
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(jsonStr)

    return {
      reason: parsed.summary || "Well-matched for your profile",
      matchFactors: parsed.whyMatches || [],
      firstSteps: parsed.firstSteps || [],
      matchScore: parsed.matchScore || 75,
      difficulty: parsed.difficulty || "Medium",
    }
  } catch (error) {
    console.error("[Groq] Error generating match reasoning:", error)
    return {
      reason: "Recommended for your profile",
      matchFactors: ["Open source", "Active repository"],
      firstSteps: ["Explore the repository", "Read the README"],
      matchScore: 60,
      difficulty: "Medium",
    }
  }
}
