"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, UtensilsCrossed, ChevronDown, ShoppingCart, Wand2, ChefHat, Check, Save, Loader2, Flame, Clock, TrendingUp, Timer, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getAllMealImages } from '@/lib/constants/meal-images'
import { ToolErrorDisplay } from './tool-error-display'

const MEAL_IMAGES = getAllMealImages();

// Meal type colors from reference
const mealTypeColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  lunch: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  dinner: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  snack: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

// Helper to normalize meal type for color mapping
const getMealTypeColor = (index: number, name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('breakfast')) return mealTypeColors.breakfast;
  if (lowerName.includes('lunch')) return mealTypeColors.lunch;
  if (lowerName.includes('dinner') || lowerName.includes('supper')) return mealTypeColors.dinner;
  if (lowerName.includes('snack')) return mealTypeColors.snack;
  
  // Fallback by index
  const types = ['breakfast', 'lunch', 'dinner', 'snack'];
  return mealTypeColors[types[index % 4]];
};

interface MealPlanDisplayProps {
  // Accepts the tool output structure which contains days
  mealPlan: any
  onActionClick?: (action: string) => void
  error?: string | { message?: string; error?: string; code?: string; metadata?: any }
}

export function MealPlanDisplay({ mealPlan, onActionClick, error }: MealPlanDisplayProps) {
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [checkingSave, setCheckingSave] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportFormats, setExportFormats] = useState<string[]>(['pdf'])
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if meal plan is already saved on mount
  useEffect(() => {
    const checkSaved = async () => {
      if (!mealPlan?.title) {
        setCheckingSave(false)
        return
      }
      try {
        const response = await fetch('/api/meal-plans')
        if (response.ok) {
          const data = await response.json()
          const mealPlans = data.mealPlans || data.mealPlan ? [data.mealPlan] : []
          const existing = mealPlans.find((mp: any) => 
            mp && mp.title && mp.title.toLowerCase().trim() === mealPlan.title.toLowerCase().trim()
          )
          if (existing) {
            setSavedId(existing.id)
          }
        }
      } catch (e) {
        // Silently fail - user can still save
        console.error('[MealPlanDisplay] Failed to check if saved:', e)
      } finally {
        setCheckingSave(false)
      }
    }
    checkSaved()
  }, [mealPlan?.title])

  // Fetch user's export formats on mount
  useEffect(() => {
    const fetchExportFormats = async () => {
      try {
        const response = await fetch('/api/usage/features')
        if (response.ok) {
          const data = await response.json()
          // API returns { limits, featureUsage, plan }
          // Ensure we have the correct structure
          if (data && typeof data === 'object' && 'limits' in data) {
            const exportFormats = data.limits?.exportFormats
            if (Array.isArray(exportFormats) && exportFormats.length > 0) {
              setExportFormats(exportFormats)
            } else {
              // Fallback to PDF if exportFormats is missing or invalid
              setExportFormats(['pdf'])
            }
          } else {
            // If response structure is unexpected, default to PDF
            console.warn('[MealPlanDisplay] Unexpected API response structure:', data)
            setExportFormats(['pdf'])
          }
        } else {
          console.error('[MealPlanDisplay] API response not OK:', response.status)
          setExportFormats(['pdf'])
        }
      } catch (e) {
        // Silently fail, default to PDF only
        console.error('[MealPlanDisplay] Failed to fetch export formats:', e)
        setExportFormats(['pdf'])
      }
    }
    fetchExportFormats()
  }, [])

  // Calculate total meals
  const totalMeals = useMemo(() => {
    return mealPlan.days?.reduce((total: number, day: any) => {
      return total + (day.meals?.length || 0)
    }, 0) || 0
  }, [mealPlan.days])

  // Generate fallback images for meals that don't have imageUrl (stable across re-renders)
  // Note: We prefer meal.imageUrl from the AI-generated meal plan, but provide fallbacks
  const mealImages = useMemo(() => {
    const images: Record<string, string> = {}
    mealPlan.days.forEach((day: any, dIndex: number) => {
      day.meals.forEach((meal: any, mIndex: number) => {
        const key = `${dIndex}-${mIndex}`
        // Use meal.imageUrl if available (from AI generation), otherwise generate a fallback
        images[key] = meal.imageUrl || MEAL_IMAGES[Math.floor(Math.random() * MEAL_IMAGES.length)]
      })
    })
    return images
  }, [mealPlan])

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  const handleSave = async () => {
    if (savedId) return
    try {
      setSaving(true)
      const response = await fetch('/api/savemealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...mealPlan, 
          duration: Math.round(Number(mealPlan.duration)) || mealPlan.days?.length || 1,
          mealsPerDay: Math.round(Number(mealPlan.mealsPerDay)) || (mealPlan.days?.[0]?.meals?.length) || 3,
          createdAt: new Date().toISOString() 
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSavedId(result.mealPlan.id)
        toast.success("Meal plan saved!", {
          description: `"${mealPlan.title}" has been added to your saved plans.`,
        })
        router.refresh()
      } else {
        toast.error("Failed to save", {
          description: result.error || "Please try again."
        })
      }
    } catch (e) {
      toast.error("Error", { description: "An unexpected error occurred." })
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    if (!savedId) {
      toast.error("Please save the meal plan first", {
        description: "You need to save the meal plan before exporting."
      })
      return
    }

    try {
      setExporting(true)
      const response = await fetch(`/api/meal-plans/${savedId}/export?format=${format}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meal-plan-${savedId}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Exported as ${format.toUpperCase()}`, {
          description: "Your meal plan has been downloaded."
        })
      } else {
        const error = await response.json()
        toast.error("Export failed", {
          description: error.error || "Please try again."
        })
      }
    } catch (e) {
      toast.error("Error", { description: "Failed to export meal plan." })
    } finally {
      setExporting(false)
    }
  }

  // Handle error state
  if (error) {
    return (
      <ToolErrorDisplay
        error={error}
        toolName="Meal Plan Generation"
        onRetry={onActionClick ? () => onActionClick("Generate a meal plan again") : undefined}
      />
    );
  }

  // Validate mealPlan structure
  if (!mealPlan || !mealPlan.days || !Array.isArray(mealPlan.days) || mealPlan.days.length === 0) {
    return (
      <ToolErrorDisplay
        error="The meal plan data is incomplete or invalid. Please try generating a new meal plan."
        toolName="Meal Plan Display"
        onRetry={onActionClick ? () => onActionClick("Generate a new meal plan") : undefined}
      />
    );
  }

  // Flatten meals from days for the grid view, or show day sections?
  // User design implies a flat list or at least a grid. 
  // Let's iterate days and show a section for each day if >1 day, or just the meals if 1 day.
  const isMultiDay = mealPlan.duration > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/50 rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-foreground">{mealPlan.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {mealPlan.duration} Days</span>
            <span>•</span>
            <span className="flex items-center gap-1"><UtensilsCrossed className="w-3 h-3" /> {totalMeals} Meals</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Wand2 className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
          {savedId && mounted && exportFormats.length > 1 && (
            <div className="flex items-center gap-1">
              {exportFormats.includes('csv') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="gap-1.5"
                >
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  CSV
                </Button>
              )}
              {exportFormats.includes('json') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  className="gap-1.5"
                >
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  JSON
                </Button>
              )}
            </div>
          )}
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving || !!savedId || checkingSave}
            className={cn(
              "gap-1.5 transition-all",
              savedId ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" : ""
            )}
            variant={savedId ? "outline" : "default"}
          >
            {checkingSave ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : savedId ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {mealPlan.days.map((day: any, dayIndex: number) => {
          const isExpanded = expandedDay === day.day
          return (
            <div key={dayIndex} className="bg-transparent">
              <button
                onClick={() => toggleDay(day.day)}
                className="w-full flex items-center justify-between py-2 px-1 mb-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm transition-colors",
                    isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {day.day}
                  </div>
                  <h4 className="font-semibold text-foreground">Day {day.day}</h4>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                      {day.meals.map((meal: any, mealIndex: number) => {
                        const mealId = `${dayIndex}-${mealIndex}`
                        const colorClass = getMealTypeColor(mealIndex, meal.name)
                        
                        return (
                          <Card 
                            key={mealIndex} 
                            className="overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-md cursor-pointer group"
                            onClick={() => onActionClick?.(`Generate the full recipe for ${meal.name}`)}
                          >
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={meal.imageUrl || mealImages[mealId] || MEAL_IMAGES[0]}
                                alt={meal.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                              <Badge 
                                className={cn("absolute top-2 left-2 border-0 shadow-sm", colorClass)}
                              >
                                {['Breakfast', 'Lunch', 'Dinner', 'Snack'][mealIndex % 4]}
                              </Badge>
                            </div>
                            <CardContent className="p-3">
                              <h4 className="font-medium text-foreground text-sm line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                                {meal.name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                {meal.calories && (
                                  <span className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    {meal.calories}
                                  </span>
                                )}
                                {meal.cookTime && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {meal.cookTime}
                                  </span>
                                )}
                                {meal.servings && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {meal.servings}
                                  </span>
                                )}
                              </div>
                              {meal.description && (
                                <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2">
                                  {meal.description}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Footer Actions */}
      {onActionClick && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 gap-2 border-dashed border-border hover:border-primary/50"
            onClick={() => onActionClick("Generate a grocery list for this meal plan")}
          >
            <ShoppingCart className="w-4 h-4" />
            Shopping List
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onActionClick("Analyze nutrition for this meal plan")}
          >
            <TrendingUp className="w-4 h-4" />
            Nutrition
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onActionClick("Create a prep timeline for this meal plan")}
          >
            <Timer className="w-4 h-4" />
            Timeline
          </Button>
        </div>
      )}
    </motion.div>
  )
}
