"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { UserMenu } from "@/components/user-menu"
import { BeamsBackground } from "@/components/opensource/bg-beams"
import { AdminRepoTable } from "@/components/admin/admin-repo-table"
import type { Repository } from "@/components/opensource/repo-table"
import { Loader2, Search, ShieldCheck, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const BADGE_OPTIONS = [
  { value: "startup", label: "Startup" },
  { value: "bug_bounty", label: "Bug Bounty" },
  { value: "gssoc", label: "GSSoC" },
  { value: "ai", label: "AI" },
  { value: "devtools", label: "DevTools" },
] as const

type BadgeValue = (typeof BADGE_OPTIONS)[number]["value"]

type GitHubRepo = Repository & {
  staffPickBadges?: BadgeValue[]
  isStaffPicked?: boolean
  repoId?: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  // @ts-ignore - NextAuth augments user
  const userId = session?.user?.id as string | undefined

  const isAdmin = useQuery(
    api.users.checkIsAdmin,
    userId ? { userId } : "skip"
  )

  const overview = useQuery(
    api.admin.getOverview,
    userId && isAdmin ? { userId } : "skip"
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 250)
    return () => clearTimeout(id)
  }, [searchTerm])

  const [badgeFilter, setBadgeFilter] = useState<BadgeValue | null>(null)
  const [staffOnly, setStaffOnly] = useState(false)
  const [sort, setSort] = useState<"stars" | "updated">("stars")
  const [repositories, setRepositories] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Fetch all staff picks from Convex to merge with GitHub data
  const staffPicks = useQuery(
    api.admin.getAllStaffPicks,
    userId && isAdmin ? { userId } : "skip"
  )

  const setStaffPick = useMutation(api.admin.setStaffPick)

  const [optimistic, setOptimistic] = useState<Record<number, Partial<{ isStaffPicked: boolean; staffPickBadges: BadgeValue[] }>>>({})
  const [modalRepo, setModalRepo] = useState<GitHubRepo | null>(null)
  const [modalBadges, setModalBadges] = useState<BadgeValue[]>([])
  const [modalNote, setModalNote] = useState("")
  const [modalTargetPick, setModalTargetPick] = useState<boolean>(true)

  // Fetch repositories from GitHub API (same as /opensource)
  useEffect(() => {
    if (!isAdmin) return

    const fetchRepos = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) {
          params.append("search", debouncedSearch)
        }
        params.append("sortBy", sort)
        params.append("language", "all")
        params.append("minStars", "any")

        const response = await fetch(`/api/opensource?${params.toString()}`)
        const data = await response.json()
        let repos: GitHubRepo[] = (data.repositories || []).map((repo: Repository) => ({
          ...repo,
          repoId: repo.id,
        }))

        // Merge with staff pick data from Convex
        if (staffPicks) {
          const staffPickMap = new Map(
            staffPicks.map((sp: any) => [sp.repoId, { badges: sp.staffPickBadges || [], isStaffPicked: true }])
          )
          repos = repos.map((repo) => {
            const staffPick = staffPickMap.get(repo.id)
            if (staffPick) {
              return {
                ...repo,
                isStaffPicked: true,
                staffPickBadges: staffPick.badges,
              }
            }
            return repo
          })
        }

        // Apply optimistic updates
        repos = repos.map((repo) => ({
          ...repo,
          ...(optimistic[repo.id] ?? {}),
        }))

        // Filter by staff picks if enabled
        if (staffOnly) {
          repos = repos.filter((repo) => repo.isStaffPicked)
        }

        // Filter by badge if selected
        if (badgeFilter) {
          repos = repos.filter((repo) => repo.staffPickBadges?.includes(badgeFilter))
        }

        // Sort
        if (sort === "stars") {
          repos.sort((a, b) => b.stargazers_count - a.stargazers_count)
        } else if (sort === "updated") {
          repos.sort((a, b) => {
            const aDate = new Date((a as any).updated_at || 0).getTime()
            const bDate = new Date((b as any).updated_at || 0).getTime()
            return bDate - aDate
          })
        }

        setRepositories(repos)
      } catch (error) {
        console.error("Error fetching repositories:", error)
        setRepositories([])
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [debouncedSearch, sort, staffOnly, badgeFilter, isAdmin, staffPicks, optimistic])

  const handleOpenModal = (repo: GitHubRepo, nextPicked: boolean) => {
    setModalRepo(repo)
    setModalTargetPick(nextPicked)
    setModalBadges((repo.staffPickBadges ?? []) as BadgeValue[])
    setModalNote("")
  }

  const handleConfirmStaffPick = async () => {
    if (!modalRepo || !userId) return
    const repoId = modalRepo.id
    const badges: BadgeValue[] = modalTargetPick ? modalBadges : []

    setOptimistic((prev) => ({
      ...prev,
      [repoId]: {
        isStaffPicked: modalTargetPick,
        staffPickBadges: badges,
      },
    }))

    try {
      await setStaffPick({
        userId,
        repoId,
        badges,
        note: modalNote || undefined,
        picked: modalTargetPick,
        // Include repo data so Convex can create the record if it doesn't exist
        repoData: modalTargetPick
          ? {
              name: modalRepo.name,
              fullName: modalRepo.full_name,
              description: modalRepo.description,
              htmlUrl: modalRepo.html_url,
              ownerLogin: modalRepo.owner.login,
              ownerAvatarUrl: modalRepo.owner.avatar_url,
              language: modalRepo.language,
              topics: modalRepo.topics,
              stars: modalRepo.stargazers_count,
              forks: modalRepo.forks_count,
            }
          : undefined,
      })
      // Refresh staff picks to get updated data
      // The useEffect will re-run and merge the new data
    } catch (error) {
      console.error(error)
      // revert
      setOptimistic((prev) => {
        const next = { ...prev }
        delete next[repoId]
        return next
      })
      alert("Unable to update staff pick. Please try again.")
    } finally {
      setModalRepo(null)
    }
  }

  if (status === "loading") {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading session...</div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Authentication Required</h1>
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isAdmin === undefined) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Checking permissions...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#121212" }}>
        <BeamsBackground className="fixed inset-0 -z-10" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">Access denied</h1>
            <p className="text-gray-400">You need admin privileges to view this page.</p>
            <Link href="/opensource">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full text-white" style={{ backgroundColor: "#0e0e0e" }}>
      <BeamsBackground className="fixed inset-0 -z-10" />

      <header className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-lg bg-black/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/opensource">
              <span className="text-lg font-semibold text-white">reposs</span>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-200">Admin</span>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader className="pb-2">
              <CardDescription>Total repositories</CardDescription>
              <CardTitle className="text-3xl">
                {overview ? overview.totalRepositories : <Loader2 className="h-5 w-5 animate-spin" />}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader className="pb-2">
              <CardDescription>Staff picks</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <ShieldCheck className="h-5 w-5 text-blue-300" />
                {overview ? overview.staffPickCount : <Loader2 className="h-5 w-5 animate-spin" />}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-white/10 bg-[#141414]">
            <CardHeader className="pb-2">
              <CardDescription>Badges</CardDescription>
              <CardContent className="flex flex-wrap gap-2 p-0 pt-2">
                {BADGE_OPTIONS.map((badge) => (
                  <Badge key={badge.value} variant="outline" className="border-white/20 text-xs text-white">
                    {badge.label}: {overview?.badgeCounts?.[badge.value] ?? 0}
                  </Badge>
                ))}
              </CardContent>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-white/10 bg-[#141414]">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between">
              <span>Repositories</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={staffOnly ? "default" : "outline"}
                  onClick={() => setStaffOnly((prev) => !prev)}
                >
                  Staff picks only
                </Button>
                <Button
                  size="sm"
                  variant={sort === "stars" ? "default" : "outline"}
                  onClick={() => setSort("stars")}
                >
                  Sort: Stars
                </Button>
                <Button
                  size="sm"
                  variant={sort === "updated" ? "default" : "outline"}
                  onClick={() => setSort("updated")}
                >
                  Sort: Updated
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search repositories (owner/name)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-black/40 border-white/10 text-white"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {BADGE_OPTIONS.map((badge) => {
                  const active = badgeFilter === badge.value
                  return (
                    <Button
                      key={badge.value}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      onClick={() => setBadgeFilter(active ? null : badge.value)}
                    >
                      {badge.label}
                    </Button>
                  )
                })}
                <Button size="sm" variant="ghost" onClick={() => setBadgeFilter(null)}>
                  Clear badges
                </Button>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <AdminRepoTable
              repositories={repositories}
              loading={loading && repositories.length === 0}
              badgeOptions={BADGE_OPTIONS}
              onStaffPickClick={(repo) => {
                handleOpenModal(repo, !repo.isStaffPicked)
              }}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {repositories.length} repositories
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!modalRepo} onOpenChange={(open: boolean) => !open && setModalRepo(null)}>
        <DialogContent className="bg-[#0f0f0f] text-white border-white/10">
          <DialogHeader>
            <DialogTitle>
              {modalTargetPick ? "Mark as staff pick" : "Remove staff pick"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {modalRepo?.full_name}
            </DialogDescription>
          </DialogHeader>
          {modalTargetPick && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-gray-400">Select badges to apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {BADGE_OPTIONS.map((badge) => {
                  const checked = modalBadges.includes(badge.value)
                  return (
                    <label
                      key={badge.value}
                      className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 hover:border-white/30 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v: boolean) => {
                          setModalBadges((prev) =>
                            v
                              ? [...prev, badge.value]
                              : prev.filter((b) => b !== badge.value)
                          )
                        }}
                      />
                      <span className="text-sm">{badge.label}</span>
                    </label>
                  )
                })}
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-400">Note (optional)</p>
                <Input
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Short internal note"
                  className="bg-black/40 border-white/10 text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setModalRepo(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStaffPick} className="gap-2">
              {modalTargetPick ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {modalTargetPick ? "Confirm" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
