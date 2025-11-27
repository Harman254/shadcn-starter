import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  source: string
  className?: string
}

export function VerifiedBadge({ source, className }: VerifiedBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      className
    )}>    <Check className="h-2.5 w-2.5" />
      <span>Verified by {source}</span>
    </div>
  )
}
