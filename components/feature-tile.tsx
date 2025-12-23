import type React from "react"
import { cn } from "@/lib/utils"

interface FeatureTileProps {
  title: string
  description: string
  children: React.ReactNode
  className?: string
}

export function FeatureTile({ title, description, children, className }: FeatureTileProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 shadow-sm hover:shadow-md hover:border-border transition-all duration-300",
        className,
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative flex flex-col gap-3">
        <h3 className="text-foreground text-lg sm:text-xl font-semibold leading-tight tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{description}</p>
      </div>

      <div className="relative flex-1">{children}</div>
    </div>
  )
}


