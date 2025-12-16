"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Star, GitFork, ShieldCheck } from "lucide-react"
import type { Repository } from "@/components/opensource/repo-table"

type AdminRepository = Repository & {
  staffPickBadges?: string[]
  isStaffPicked?: boolean
  repoId?: number
}

type BadgeOption = { value: string; label: string }

function formatNumber(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k"
  return num.toString()
}

function getLanguageBadge(language?: string) {
  const colors: Record<string, string> = {
    Go: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    TypeScript: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    JavaScript: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Python: "bg-green-500/20 text-green-400 border-green-500/30",
    Java: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "C++": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Rust: "bg-red-500/20 text-red-400 border-red-500/30",
    PHP: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  }
  const cls = language && colors[language] ? colors[language] : "bg-gray-500/20 text-gray-400 border-gray-500/30"
  return language ? <Badge className={`${cls} border font-medium`}>{language}</Badge> : null
}

export function AdminRepoTable({
  repositories,
  loading,
  badgeOptions,
  onStaffPickClick,
}: {
  repositories: AdminRepository[]
  loading: boolean
  badgeOptions?: BadgeOption[]
  onStaffPickClick?: (repo: AdminRepository) => void
}) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden backdrop-blur-xl" style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)" }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <th className="text-left p-3 md:p-4 font-medium text-xs md:text-sm text-gray-400">Repository</th>
              <th className="text-left p-3 md:p-4 font-medium text-xs md:text-sm text-gray-400">Language</th>
              <th className="hidden lg:table-cell text-left p-4 font-medium text-sm text-gray-400">Tags</th>
              <th className="text-right p-3 md:p-4 font-medium text-xs md:text-sm text-gray-400">Stars</th>
              <th className="hidden sm:table-cell text-right p-4 font-medium text-sm text-gray-400">Forks</th>
              <th className="text-right p-3 md:p-4 font-medium text-xs md:text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="border-b border-white/5">
                  <td className="p-3 md:p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32 bg-white/10" />
                        <Skeleton className="h-3 w-20 bg-white/10" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <Skeleton className="h-6 w-20 rounded-md bg-white/10" />
                  </td>
                  <td className="hidden lg:table-cell p-4">
                    <div className="flex space-x-2">
                      <Skeleton className="h-5 w-16 rounded bg-white/10" />
                      <Skeleton className="h-5 w-20 rounded bg-white/10" />
                    </div>
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <Skeleton className="h-4 w-12 ml-auto bg-white/10" />
                  </td>
                  <td className="hidden sm:table-cell p-4 text-right">
                    <Skeleton className="h-4 w-12 ml-auto bg-white/10" />
                  </td>
                  <td className="p-3 md:p-4 text-right">
                    <Skeleton className="h-8 w-24 ml-auto bg-white/10" />
                  </td>
                </tr>
              ))
            ) : (
              <TooltipProvider>
                {repositories.map((repo) => (
                  <tr key={repo.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                    <td className="p-3 md:p-4 relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 group cursor-pointer"
                          >
                            <Avatar className="w-8 h-8 ring-1 transition-all duration-200 group-hover:ring-2 group-hover:scale-110 ring-white/10 group-hover:ring-primary/40">
                              <AvatarImage src={repo.owner.avatar_url || "/placeholder.svg"} alt={`${repo.owner.login} avatar`} className="object-cover" />
                              <AvatarFallback className="text-sm font-medium bg-white/10 text-white">
                                {repo.owner.login.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium transition-colors duration-200 text-white group-hover:text-primary">
                                {repo.name}
                              </div>
                              <div className="text-sm text-gray-500">{repo.owner.login}</div>
                            </div>
                          </a>
                        </TooltipTrigger>
                        {repo.description ? (
                          <TooltipContent side="right" sideOffset={8} className="max-w-sm">
                            <p className="text-sm leading-relaxed">{repo.description}</p>
                          </TooltipContent>
                        ) : null}
                      </Tooltip>
                    </td>
                    <td className="p-3 md:p-4">{getLanguageBadge(repo.language)}</td>
                    <td className="hidden lg:table-cell p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {repo.isStaffPicked && (
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-300/30 text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1 inline" />
                            Staff Pick
                          </Badge>
                        )}
                        {repo.staffPickBadges?.map((badge) => (
                          <Badge key={badge} className="text-xs font-normal bg-blue-500/10 text-blue-300 border-blue-500/30">
                            {badgeOptions?.find((b) => b.value === badge)?.label || badge}
                          </Badge>
                        ))}
                        {repo.topics?.slice(0, 3).map((topic) => (
                          <Badge key={topic} className="text-xs font-normal bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      <span className="font-medium text-white">{formatNumber(repo.stargazers_count)}</span>
                    </td>
                    <td className="hidden sm:table-cell p-4 text-right">
                      <span className="font-medium text-gray-400">{formatNumber(repo.forks_count)}</span>
                    </td>
                    <td className="p-3 md:p-4 text-right">
                      {onStaffPickClick && (
                        <Button size="sm" variant="outline" onClick={() => onStaffPickClick(repo)}>
                          {repo.isStaffPicked ? "Unmark" : "Mark staff pick"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </TooltipProvider>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

