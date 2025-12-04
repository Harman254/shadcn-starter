"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"
import { motion } from "framer-motion"

interface ToolCardProps {
  children: ReactNode
  className?: string
}

export function ToolCard({ children, className }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full overflow-hidden rounded-2xl",
        "bg-card border border-border/50 shadow-lg",
        className
      )}
    >
      {children}
    </motion.div>
  )
}
