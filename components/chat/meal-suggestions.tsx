"use client"

import { motion } from "framer-motion"
import { Plus, Check, Utensils, Leaf, Clock, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { VerifiedBadge } from "./verified-badge"

export interface MealSuggestion {
  name: string
  calories: number
  protein: number
  tags: string[]
  image?: string
  description?: string
}

interface MealSuggestionsProps {
  suggestions: MealSuggestion[]
  onAdd?: (suggestion: MealSuggestion) => void
}

export function MealSuggestions({ suggestions, onAdd }: MealSuggestionsProps) {
  return (
    <div className="w-full my-4">
      <div className={cn(
        "rounded-2xl border bg-card overflow-hidden",
        "border-emerald-500/20 dark:border-emerald-500/10", // Green border as requested
        "shadow-sm"
      )}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 bg-emerald-500/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VerifiedBadge source="USDA FoodData" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {suggestions.length} options
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="h-4 w-4 text-foreground" />
            <h3 className="font-semibold text-foreground">Meal Suggestions</h3>
          </div>

          <div className="space-y-3">
            {suggestions.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group flex items-start gap-4 p-3 rounded-xl",
                  "bg-muted/30 hover:bg-muted/50",
                  "border border-transparent hover:border-border/50",
                  "transition-all duration-200"
                )}
              >
                {/* Image Placeholder or Icon */}
                <div className="shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/10 w-full h-full flex items-center justify-center">
                       <span className="text-2xl">🥗</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground leading-tight mb-1">
                        {meal.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {meal.calories} cal
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>{meal.protein}g protein</span>
                      </div>
                    </div>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 rounded-full border border-border/50 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      onClick={() => onAdd?.(meal)}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add meal</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {meal.tags.map((tag, i) => (
                      <span 
                        key={i}
                        className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                          "bg-background border border-border/50 text-muted-foreground"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
