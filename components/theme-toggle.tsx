"use client"

import { useId } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const ThemeToggle = () => {
  const id = useId()
  const { resolvedTheme, setTheme } = useTheme()
  const checked = resolvedTheme === "dark"

  return (
    <div className="inline-flex items-center gap-2">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={v => setTheme(v ? "dark" : "light")}
        aria-label="Toggle switch"
      />
      <Label htmlFor={id}>
        <span className="sr-only">Toggle switch</span>
        {checked ? (
          <SunIcon size={16} aria-hidden="true" />
        ) : (
          <MoonIcon size={16} aria-hidden="true" />
        )}
      </Label>
    </div>
  )
}

export default ThemeToggle
