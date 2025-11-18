"use client"
import { RepoTable, type Repository } from "@/components/opensource/repo-table"

export function HomeSection({
  repositories,
  loading,
  variant = "default",
}: {
  repositories: Repository[]
  loading: boolean
  variant?: "default" | "landing"
}) {
  return <RepoTable repositories={repositories} loading={loading} variant={variant} />
}
