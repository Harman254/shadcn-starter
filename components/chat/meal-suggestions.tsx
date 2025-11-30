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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl",
                  "bg-muted/30 hover:bg-muted/50",
                  "border border-border/50 hover:border-primary/30",
                  "transition-all duration-200",
                  "hover:shadow-md"
                )}
              >
                {/* Image Area */}
                <div className="relative w-full aspect-video overflow-hidden bg-muted">
                  <img 
                    src={meal.image || "https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg"} 
                    alt={meal.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                     <h4 className="font-bold text-white text-sm sm:text-base leading-tight shadow-sm">
                        {meal.name}
                     </h4>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="h-3 w-3" />
                      {meal.calories || '---'} cal
                    </span>
                    <span className="flex items-center gap-1">
                      <Leaf className="h-3 w-3" />
                      {meal.protein || '--'}g prot
                    </span>
                  </div>

                  {meal.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {meal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1 mt-auto pt-2">
                    {meal.tags.slice(0, 3).map((tag, i) => (
                      <span 
                        key={i}
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-background border border-border/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full mt-2 h-8 text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => onAdd?.(meal)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    View Recipe
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
