"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Loader2, Github } from "lucide-react"

interface GitHubUsernameInputProps {
  onSubmit: (username: string) => Promise<void>
  loading?: boolean
}

export function GitHubUsernameInput({ onSubmit, loading = false }: GitHubUsernameInputProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const exampleUsernames = ["torvalds", "gvanrossum", "gaearon", "sindresorhus"]

  useEffect(() => {
    if (error && username) {
      setError(null)
    }
  }, [username, error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) {
      setError("Please enter a GitHub username")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onSubmit(username.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
      setIsLoading(false)
    }
  }

  function handleExampleClick(example: string) {
    setUsername(example)
    setError(null)
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
          <Github className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Get Recommendations</h3>
          <p className="text-xs text-white/50">Enter your GitHub username</p>
        </div>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">@</div>
          <Input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || loading}
            className={`pl-8 pr-4 py-2.5 bg-white/[0.02] border-white/10 text-white placeholder:text-white/30 transition-colors ${
              error ? "border-rose-500/50" : "hover:border-white/20 focus:border-white/30"
            }`}
          />
        </div>

        <Button
          type="submit"
          disabled={!username.trim() || isLoading || loading}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading || loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Get Recommendations"
          )}
        </Button>
      </form>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Example usernames */}
      {!error && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/40">Examples:</span>
          {exampleUsernames.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              type="button"
              disabled={isLoading || loading}
              className="text-xs text-white/50 hover:text-white/70 transition-colors disabled:opacity-50"
            >
              @{example}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
