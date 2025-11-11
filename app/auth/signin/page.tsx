"use client"

import React from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const [isLoading, setIsLoading] = React.useState<string | null>(null)

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { redirect: true, callbackUrl: "/opensource" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">GitOSS</CardTitle>
          <CardDescription>Sign in to discover and explore amazing open-source projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => handleSignIn("github")} disabled={isLoading !== null} className="w-full" size="lg">
            {isLoading === "github" ? "Signing in..." : "Continue with GitHub"}
          </Button>

          <Button
            onClick={() => handleSignIn("google")}
            disabled={isLoading !== null}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {isLoading === "google" ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Link href="/opensource" className="block">
            <Button variant="ghost" className="w-full">
              Continue as Guest
            </Button>
          </Link>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
