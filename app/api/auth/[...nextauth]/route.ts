import { handlers } from "@/lib/auth"

// Ensure handlers are available, provide fallback if not
if (!handlers) {
  throw new Error("NextAuth handlers not initialized. Check environment variables.")
}

export const { GET, POST } = handlers
