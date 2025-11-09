import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      provider?: string
    }
  }
}

// Build providers array conditionally based on available env vars
const providers = []

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  )
}

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  )
}

// Use a fallback secret for build time if AUTH_SECRET is not set
// This allows the build to succeed, but auth won't work in production without AUTH_SECRET
// In production, NextAuth will warn if secret is missing, but won't fail the build
const authSecret = process.env.AUTH_SECRET || "dev-secret-change-in-production-min-32-chars"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  providers: providers.length > 0 ? providers : [
    // Fallback: provide a dummy provider to prevent NextAuth from failing
    // This won't work for actual auth, but allows the build to succeed
    GitHub({
      clientId: "dummy",
      clientSecret: "dummy",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.provider = token.provider as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})
