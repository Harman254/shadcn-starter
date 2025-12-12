"use client"

import Link from "next/link"
import { useProFeatures } from "@/hooks/use-pro-features"
import { Button } from "@/components/ui/button"
import { Star, Zap, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface ProUpgradeButtonProps {
  className?: string
  showIconOnly?: boolean
}

export function ProUpgradeButton({ className, showIconOnly }: ProUpgradeButtonProps) {
  const { isPro, isLoading } = useProFeatures()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
        <div className={cn("w-full h-9 rounded-md bg-muted/50 animate-pulse", className)} />
    )
  }

  // If user is already Pro, show a subtle "Manage Subscription" or nothing
  // We'll show a managed link for easy access to portal
  if (isPro) {
    return (
        <Button 
            variant="ghost" 
            size="sm" 
            className={cn("w-full justify-start text-muted-foreground hover:text-foreground", className)}
            asChild
        >
            <Link href="/dashboard/settings">
                <Settings className="w-4 h-4 mr-2" />
                {!showIconOnly && "Manage Subscription"}
            </Link>
        </Button>
    )
  }

  // Free user sees the upgrade call-to-action
  return (
    <Button 
        asChild
        className={cn(
            "w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-sm transition-all duration-200",
            className
        )}
        size="sm"
    >
      <Link href="/pricing">
        <Star className="w-4 h-4 mr-2 fill-white/20" />
        {!showIconOnly && <span className="font-medium">Upgrade to Pro</span>}
      </Link>
    </Button>
  )
}
