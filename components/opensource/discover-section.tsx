"use client"
import { RepoTable, type Repository } from "./repo-table"

export function DiscoverSection({
  repositories,
  loading,
  showType = false,
}: {
  repositories: Repository[]
  loading: boolean
  showType?: boolean
}) {
  return <RepoTable repositories={repositories} loading={loading} showType={showType} />
}
