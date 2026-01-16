"use client"

import { Star, GitFork, Bookmark, BookmarkCheck, Github, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useBookmarks } from "@/hooks/use-bookmarks"
import type { Repository } from "@/components/opensource/repo-table"

interface ContributionPicksCardProps {
  repo: Repository & {
    matchReason?: string
    matchFactors?: string[]
    firstSteps?: string[]
    matchScore?: number
    difficulty?: "Easy" | "Medium" | "Hard"
  }
  index: number
}

export function ContributionPicksCard({ repo, index }: ContributionPicksCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(repo.id)

  const matchScore = repo.matchScore || 75

  // Status based on match score
  const getStatus = () => {
    if (matchScore >= 80) return { label: "Excellent Match", color: "bg-emerald-500", dotColor: "bg-emerald-500" }
    if (matchScore >= 65) return { label: "Good Match", color: "bg-blue-500", dotColor: "bg-blue-500" }
    return { label: "Recommended", color: "bg-amber-500", dotColor: "bg-amber-500" }
  }

  const status = getStatus()

  function formatNumber(num: number) {
    if (num >= 1000) return (num / 1000).toFixed(1) + "k"
    return num.toString()
  }

  const handleBookmark = async () => {
    try {
      await toggleBookmark({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        topics: repo.topics,
        html_url: repo.html_url,
        owner: repo.owner,
      })
    } catch (error) {
      console.error("[v0] Failed to toggle bookmark:", error)
    }
  }


  return (
    <div className="group relative bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300">
      {/* Top row: Status only */}
      <div className="flex items-start justify-end mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
            <span className="text-xs font-medium text-white/70">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Title + Owner Avatar */}
      <div className="mb-2.5 flex items-start gap-2">
        <Avatar className="w-7 h-7 flex-shrink-0 border border-white/10">
          <AvatarImage src={repo.owner.avatar_url || "/placeholder.svg"} alt={repo.owner.login} />
          <AvatarFallback className="bg-white/10 text-white/70 text-xs">
            {repo.owner.login.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-0.5 line-clamp-1">{repo.name}</h3>
          <p className="text-xs text-white/50 line-clamp-1">@{repo.owner.login}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-white/60 line-clamp-2 mb-3">{repo.description || "No description provided"}</p>

      {/* Associated details: Language */}
      <div className="mb-3">
        <p className="text-xs text-white/50">
          {repo.language || "Multiple languages"} • {formatNumber(repo.stargazers_count)} stars
        </p>
      </div>

      {/* Compact Stats Row */}
      <div className="mb-3 flex items-center gap-3 text-xs text-white/50 pb-3 border-b border-white/10">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400" />
          <span>{formatNumber(repo.stargazers_count)}</span>
        </div>
        <div className="flex items-center gap-1">
          <GitFork className="w-3 h-3 text-blue-400" />
          <span>{formatNumber(repo.forks_count)}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-white/40" />
          <span>{(repo as any).open_issues_count || 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 bg-transparent hover:bg-white/5 text-white/90 border-white/20 hover:border-white/30 text-xs font-medium transition-all duration-200 group/btn"
          >
            <Github className="w-3.5 h-3.5 mr-1.5 opacity-70 group-hover/btn:opacity-100 transition-opacity" />
            Visit
          </Button>
        </a>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBookmark}
          className="h-8 border-white/10 hover:bg-white/5 bg-transparent transition-all duration-200"
          title={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-blue-400" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-white/40" />
          )}
        </Button>
      </div>
    </div>
  )
}
