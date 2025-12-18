"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Package, ChefHat, Clock, Star, ShoppingCart, Plus, Check, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InventoryPlanDisplayProps {
  data: {
    possibleMeals: Array<{
      name: string
      description: string
      ingredientsUsed: string[]
      additionalNeeded: string[]
      cookTime: string
      difficulty: 'easy' | 'medium' | 'hard'
      matchScore: number
    }>
    bestMatch: {
      name: string
      reason: string
    }
    shoppingListAdditions: string[]
    tip: string
  }
  availableIngredients?: string[]
  onActionClick?: (action: string) => void
}

export function InventoryPlanDisplay({ data, availableIngredients, onActionClick }: InventoryPlanDisplayProps) {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)

  const difficultyColors = {
    easy: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    hard: 'bg-red-500/20 text-red-400',
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-red-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950",
        "border border-cyan-500/20",
        "shadow-2xl shadow-cyan-500/10"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30">
                <Package className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <ChefHat className="h-3 w-3 text-cyan-400" />
                Inventory Chef
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              What You Can Make
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {data.possibleMeals.length} meals from your ingredients
            </p>
          </motion.div>

          {/* Best Match */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30"
          >
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="text-white font-semibold">{data.bestMatch.name}</span>
            </div>
            <p className="text-white/60 text-sm mt-1">{data.bestMatch.reason}</p>
          </motion.div>
        </div>

        {/* Meals Grid */}
        <div className="relative px-6 sm:px-8 pb-6 space-y-3">
          {data.possibleMeals.map((meal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={cn(
                "rounded-2xl p-4 border backdrop-blur-sm cursor-pointer transition-all",
                "bg-gradient-to-br from-white/10 to-white/5 border-white/10",
                selectedMeal === meal.name && "ring-2 ring-cyan-500/50",
                meal.name === data.bestMatch.name && "ring-2 ring-emerald-500/50"
              )}
              onClick={() => setSelectedMeal(selectedMeal === meal.name ? null : meal.name)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{meal.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-lg text-xs font-medium",
                      difficultyColors[meal.difficulty]
                    )}>
                      {meal.difficulty}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm">{meal.description}</p>
                </div>
                <div className="text-right">
                  <div className={cn("text-2xl font-bold", getScoreColor(meal.matchScore))}>
                    {meal.matchScore}%
                  </div>
                  <div className="text-white/40 text-xs">match</div>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedMeal === meal.name && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-3">
                    <Clock className="h-4 w-4" />
                    {meal.cookTime}
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Using from your pantry:</p>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredientsUsed.map((ing, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  {meal.additionalNeeded.length > 0 && (
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Need to buy:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.additionalNeeded.map((ing, i) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center gap-1">
                            <Plus className="h-3 w-3" />
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    size="sm"
                    className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      onActionClick?.(`Generate recipe for ${meal.name}`)
                    }}
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    Get Full Recipe
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Shopping Additions */}
        {data.shoppingListAdditions.length > 0 && (
          <div className="relative px-6 sm:px-8 pb-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Stock these for more options
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.shoppingListAdditions.map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tip */}
        <div className="relative px-6 sm:px-8 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20"
          >
            <p className="text-white/70 text-sm">💡 {data.tip}</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        {onActionClick && (
          <div className="relative px-6 sm:px-8 pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                className="h-14 rounded-2xl font-semibold text-base gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                onClick={() => {
                  const mealNames = data.possibleMeals.map(m => m.name).join(', ');
                  onActionClick(`Create a meal plan with these meals: ${mealNames}`);
                }}
              >
                <Calendar className="h-5 w-5" /> Create Plan
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl font-semibold text-base gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => {
                  const ingredients = availableIngredients?.join(', ') || data.possibleMeals.flatMap(m => [...m.ingredientsUsed, ...m.additionalNeeded]).join(', ');
                  onActionClick(`Generate a grocery list for these ingredients: ${ingredients}`);
                }}
              >
                <ShoppingCart className="h-5 w-5" /> Grocery List
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
