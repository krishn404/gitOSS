"use client"

import { useQuery, useMutation } from "convex/react"
import { useSession } from "next-auth/react"

export function useUserPreferences() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const preferences = useQuery(userId ? "preferences:getUserPreferences" : null, userId ? { userId } : "skip")

  const updatePreferences = useMutation("preferences:updateUserPreferences")

  const setPreferredLanguages = async (languages: string[]) => {
    if (!userId) return
    await updatePreferences({
      userId,
      preferredLanguages: languages,
    })
  }

  const setTheme = async (theme: string) => {
    if (!userId) return
    await updatePreferences({
      userId,
      theme,
    })
  }

  return {
    preferences,
    setPreferredLanguages,
    setTheme,
    updatePreferences,
  }
}
