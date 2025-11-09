import { handlers } from "@/lib/auth"
import { NextResponse } from "next/server"

// Provide fallback handlers if NextAuth didn't initialize
const fallbackHandler = async () => {
  return NextResponse.json(
    { error: "Authentication not configured. Please set required environment variables." },
    { status: 503 }
  )
}

export const GET = handlers?.GET || fallbackHandler
export const POST = handlers?.POST || fallbackHandler
