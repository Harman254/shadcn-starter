"use client"

import { useId, useState, useEffect } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const ThemeToggle = () => {
  const id = useId()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Default to light theme during SSR to prevent hydration mismatch
  const checked = mounted ? resolvedTheme === "dark" : false

  return (
    <div className="inline-flex items-center gap-2" suppressHydrationWarning>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={v => setTheme(v ? "dark" : "light")}
        aria-label="Toggle switch"
      />
      <Label htmlFor={id} suppressHydrationWarning>
        <span className="sr-only">Toggle switch</span>
        {mounted ? (
          checked ? (
            <SunIcon size={16} aria-hidden="true" />
          ) : (
            <MoonIcon size={16} aria-hidden="true" />
          )
        ) : (
          <MoonIcon size={16} aria-hidden="true" />
        )}
      </Label>
    </div>
  )
}

export default ThemeToggle
