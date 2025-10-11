"use client"

import { useQuery, useMutation } from "convex/react"
import { useSession } from "next-auth/react"

export function useSavedRepositories() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const savedRepos = useQuery(userId ? "savedRepositories:getSavedRepositories" : null, userId ? { userId } : "skip")

  const saveRepository = useMutation("savedRepositories:saveRepository")
  const removeSavedRepository = useMutation("savedRepositories:removeSavedRepository")

  const isSaved = (repositoryId: number) => {
    if (!savedRepos) return false
    return savedRepos.some((repo: any) => repo.repositoryId === repositoryId)
  }

  const toggleSave = async (repo: any) => {
    if (!userId) return

    if (isSaved(repo.id)) {
      await removeSavedRepository({
        userId,
        repositoryId: repo.id,
      })
    } else {
      await saveRepository({
        userId,
        repositoryId: repo.id,
        repositoryName: repo.name,
        repositoryUrl: repo.url,
      })
    }
  }

  return { savedRepos, toggleSave, isSaved }
}
