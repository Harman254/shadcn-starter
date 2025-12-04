"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, UtensilsCrossed, Star, ChevronDown, ShoppingCart, Wand2, ChefHat, Check, Save, Loader2, Flame, Clock, Apple, Zap, TrendingUp, Timer, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface MealPlanDisplayProps {
  mealPlan: any
  onActionClick?: (action: string) => void
}

export function MealPlanDisplay({ mealPlan, onActionClick }: MealPlanDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [hoveredMeal, setHoveredMeal] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

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
        body: JSON.stringify({ ...mealPlan, createdAt: new Date().toISOString() }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSavedId(result.mealPlan.id)
        toast({ title: "Success!", description: "Meal plan saved to your collection." })
        router.refresh()
      } else {
        toast({ title: "Failed to save", description: result.error || "Please try again.", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const totalMeals = mealPlan.days.reduce((sum: any, day: any) => sum + day.meals.length, 0)

  // Meal type config with colors and icons
  const getMealConfig = (index: number) => {
    const configs = [
      { icon: <Flame className="h-4 w-4" />, label: "Breakfast", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
      { icon: <Apple className="h-4 w-4" />, label: "Lunch", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
      { icon: <UtensilsCrossed className="h-4 w-4" />, label: "Dinner", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
      { icon: <Zap className="h-4 w-4" />, label: "Snack", gradient: "from-pink-500 to-rose-500", bg: "bg-pink-500/10", border: "border-pink-500/20" }
    ]
    return configs[index % configs.length]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-[2rem]",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        "border border-white/[0.08]",
        "shadow-2xl shadow-black/50"
      )}>
        {/* Ambient glow effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-500/30 to-teal-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/25 to-purple-500/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent" />
        </div>
        
        {/* Hero Header Section */}
        <div className="relative">
          <div className="relative h-56 sm:h-64 w-full overflow-hidden">
            {/* Image with overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60 z-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-violet-500/20 mix-blend-overlay z-10" />
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src="https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg" 
              alt="Meal Plan" 
              className="w-full h-full object-cover"
            />
            
            {/* Floating AI Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute top-5 right-5 z-20"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Wand2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-300">AI Crafted</span>
              </div>
            </motion.div>

            {/* Title Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
                  {mealPlan.title}
                </h2>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] shadow-lg"
                  >
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span className="font-semibold text-white text-sm">{mealPlan.duration} Days</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.08] shadow-lg"
                  >
                    <UtensilsCrossed className="h-4 w-4 text-violet-400" />
                    <span className="font-semibold text-white text-sm">{mealPlan.mealsPerDay} Per Day</span>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 shadow-lg"
                  >
                    <Star className="h-4 w-4 text-amber-400" />
                    <span className="font-semibold text-amber-200 text-sm">{totalMeals} Meals</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Days Timeline */}
        <div className="relative px-4 sm:px-6 py-6 space-y-3">
          {mealPlan.days.map((day: any, dayIndex: number) => {
            const isExpanded = expandedDay === day.day
            return (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: dayIndex * 0.08 + 0.5 }}
                layout
                className={cn(
                  "group rounded-2xl overflow-hidden transition-all duration-500",
                  isExpanded 
                    ? "bg-gradient-to-br from-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/[0.15] shadow-xl shadow-black/20" 
                    : "bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1]"
                )}
              >
                <button
                  onClick={() => toggleDay(day.day)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "relative flex items-center justify-center w-14 h-14 rounded-2xl text-xl font-bold transition-all duration-500",
                      isExpanded 
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30" 
                        : "bg-gradient-to-br from-white/[0.08] to-white/[0.04] text-white/70 group-hover:text-white"
                    )}>
                      {isExpanded && (
                        <motion.div 
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 opacity-20"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <span className="relative z-10">{day.day}</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-lg">Day {day.day}</h5>
                      <p className="text-sm text-white/40 flex items-center gap-1.5">
                        <UtensilsCrossed className="h-3 w-3" />
                        {day.meals.length} meals planned
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={cn(
                      "p-2 rounded-xl transition-colors",
                      isExpanded ? "bg-white/10" : "bg-transparent"
                    )}
                  >
                    <ChevronDown className="h-5 w-5 text-white/50" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-4 sm:px-5 pb-5 space-y-3">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        
                        {day.meals.map((meal: any, mealIndex: number) => {
                          const config = getMealConfig(mealIndex)
                          const mealId = `${dayIndex}-${mealIndex}`
                          return (
                            <motion.div 
                              key={mealIndex}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: mealIndex * 0.1 }}
                              className={cn(
                                "relative p-4 rounded-xl overflow-hidden",
                                "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
                                "border border-white/[0.08]",
                                "hover:border-white/[0.15] hover:from-white/[0.08]",
                                "transition-all duration-300 cursor-pointer group/meal"
                              )}
                              onMouseEnter={() => setHoveredMeal(mealId)}
                              onMouseLeave={() => setHoveredMeal(null)}
                              onClick={() => onActionClick?.(`Show me the full recipe for ${meal.name}`)}
                            >
                              {/* Hover effect line */}
                              <motion.div 
                                className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b", config.gradient)}
                                initial={{ opacity: 0.3, scaleY: 0.5 }}
                                animate={{ 
                                  opacity: hoveredMeal === mealId ? 1 : 0.3,
                                  scaleY: hoveredMeal === mealId ? 1 : 0.5
                                }}
                                transition={{ duration: 0.3 }}
                              />
                              
                              <div className="flex items-start gap-4 pl-3">
                                {/* Meal Type Icon */}
                                <div className={cn(
                                  "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                                  "bg-gradient-to-br", config.gradient,
                                  "text-white shadow-lg shadow-black/20"
                                )}>
                                  {config.icon}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className={cn("text-[10px] font-semibold uppercase tracking-wider", 
                                        mealIndex === 0 ? "text-amber-400" : 
                                        mealIndex === 1 ? "text-emerald-400" : 
                                        mealIndex === 2 ? "text-violet-400" : "text-pink-400"
                                      )}>
                                        {config.label}
                                      </span>
                                      <h6 className="font-semibold text-white text-base mt-0.5 group-hover/meal:text-emerald-300 transition-colors">
                                        {meal.name}
                                      </h6>
                                    </div>
                                    {meal.cookTime && (
                                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.05] text-white/50 text-xs shrink-0">
                                        <Timer className="h-3 w-3" />
                                        {meal.cookTime}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {meal.description && (
                                    <p className="text-sm text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
                                      {meal.description}
                                    </p>
                                  )}
                                  
                                  {/* Ingredients Pills */}
                                  <div className="flex flex-wrap gap-1.5 mt-3">
                                    {meal.ingredients?.slice(0, 4).map((ing: string, i: number) => (
                                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-white/[0.05] border border-white/[0.08] text-white/60">
                                        {ing}
                                      </span>
                                    ))}
                                    {meal.ingredients?.length > 4 && (
                                      <span className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                                        +{meal.ingredients.length - 4} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Actions Footer */}
        <div className="relative px-4 sm:px-6 pb-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          
          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className={cn(
                "flex-1 h-14 rounded-2xl font-bold gap-2 text-base transition-all duration-300",
                savedId 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" 
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              )}
              onClick={handleSave}
              disabled={saving || !!savedId}
            >
              {saving ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</>
              ) : savedId ? (
                <><Check className="h-5 w-5" /> Saved to Collection</>
              ) : (
                <><Save className="h-5 w-5" /> Save This Plan</>
              )}
            </Button>
            
            {onActionClick && (
              <Button 
                size="lg"
                variant="outline"
                className="flex-1 h-14 rounded-2xl font-bold gap-2 text-base bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1] hover:border-white/[0.2] hover:scale-[1.02] transition-all duration-300"
                onClick={() => onActionClick("Generate a grocery list for this plan")}
              >
                <ShoppingCart className="h-5 w-5" />
                Get Shopping List
              </Button>
            )}
          </div>

          {/* Secondary Actions */}
          {onActionClick && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mt-5"
            >
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 rounded-xl px-4 text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                onClick={() => onActionClick("Analyze the nutrition of this meal plan")}
              >
                <TrendingUp className="h-4 w-4 mr-1.5" />
                Nutrition
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 rounded-xl px-4 text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                onClick={() => onActionClick("Create a meal prep timeline for this plan")}
              >
                <Timer className="h-4 w-4 mr-1.5" />
                Prep Timeline
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 rounded-xl px-4 text-sm text-white/50 hover:text-white hover:bg-white/[0.08] transition-all"
                onClick={() => {
                  if (savedId) router.push(`/meal-plans/${savedId}/explore`)
                  else {
                    sessionStorage.setItem('mealPlanPreview', JSON.stringify(mealPlan))
                    router.push('/meal-plans/preview')
                  }
                }}
              >
                <ChefHat className="h-4 w-4 mr-1.5" />
                Full View
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
