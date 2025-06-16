"use client"

import { useState, useEffect } from "react"
import { type GenerateMealPlanInput, generatePersonalizedMealPlan } from "@/ai/flows/generate-meal-plan"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useMealPlanStore, useMealPlanTitleStore } from "@/store"
import type { UserPreference } from "@/types"
import { Loader2, RefreshCcw, CheckCircle2, Clock, Utensils, Rocket, ArrowRight, Crown, Lock } from "lucide-react"
import toast from "react-hot-toast"
import { generateMealPlanTitle } from "@/ai/flows/generateMealPlanTitle"
import { useRouter } from "next/navigation"
import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features"
import MealLoading from "./meal-plan-loading-new"

/* ======================== */
/*        Interfaces         */
/* ======================== */

interface Meal {
  name: string
  ingredients: string[]
  instructions: string
  imageUrl?: string
}

export interface DayMealPlan {
  day: number
  meals: Meal[]
}

interface CreateMealPlanProps {
  preferences: UserPreference[]
}

/* ======================== */
/*         Component         */
/* ======================== */
const CreateMealPlan = ({ preferences }: CreateMealPlanProps) => {
  const { mealPlan, duration, mealsPerDay, setDuration, setMealsPerDay, setMealPlan, clearMealPlan } =
    useMealPlanStore()

  const [loading, setLoading] = useState(false)
  const [savingMealPlan, setSavingMealPlan] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const [maxGenerations, setMaxGenerations] = useState(2)
  const { setTitle, resetTitle } = useMealPlanTitleStore()
  const router = useRouter()
  const { hasFeature, unlockFeature, getFeatureBadge } = useProFeatures()

  const title = useMealPlanTitleStore((state) => state.title)
  const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")

  // Fetch generation count on mount
  useEffect(() => {
    const fetchGenerationCount = async () => {
      if (!isUnlimitedGenerations) {
        try {
          const response = await fetch("/api/meal-plan-generations")
          if (response.ok) {
            const data = await response.json()
            setGenerationCount(data.generationCount)
            setMaxGenerations(data.maxGenerations)
          }
        } catch (error) {
          console.error("Error fetching generation count:", error)
        }
      }
    }

    fetchGenerationCount()
  }, [isUnlimitedGenerations])

  /* ======================== */
  /*       Functions           */
  /* ======================== */

  const generateMealPlan = async () => {
    const { duration, mealsPerDay } = useMealPlanStore.getState()
    const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")

    try {
      setLoading(true)
      resetTitle() // Reset title before generating a new meal plan

      // ATOMIC VALIDATION AND INCREMENT for free users - MAXIMUM SECURITY
      if (!isUnlimitedGenerations) {
        const validationResponse = await fetch("/api/meal-plan-generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "validate-and-increment" })
        })
        
        if (validationResponse.status === 429) {
          // Limit reached
          const errorData = await validationResponse.json()
          
          unlockFeature(PRO_FEATURES["unlimited-meal-plans"])
          setLoading(false)
          return
        } else if (!validationResponse.ok) {
          toast.error("Failed to validate generation limits. Please try again.")
          setLoading(false)
          return
        } else {
          // Successfully validated and incremented
          const validationData = await validationResponse.json()
          setGenerationCount(validationData.generationCount)
        }
      }

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
        clearMealPlan()
        setLoading(false)
        return
      }

      // Debug: Log the meal plan to see if imageUrl is included
      console.log("Generated meal plan:", JSON.stringify(result.mealPlan, null, 2))

      const titleresult = await generateMealPlanTitle(result.mealPlan)
      setTitle(titleresult.title) // Set the title state

      console.log("Generated title:", titleresult)

      if (!titleresult?.title) {
        toast.error("Failed to generate meal plan title")
        clearMealPlan()
        setLoading(false)
        return
      }

      const today = new Date().toISOString()
      setMealPlan(result.mealPlan, duration, mealsPerDay, today)

      setGenerated(true)
      setTimeout(() => setGenerated(false), 3000)
      toast.success("Meal plan generated successfully!")
    } catch (error) {
      console.error("Error generating meal plan:", error)
      toast.error("Failed to generate meal plan")
      clearMealPlan()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMealPlan = async () => {
    try {
      setSavingMealPlan(true)

      const response = await fetch("/api/savemealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          duration,
          mealsPerDay,
          days: mealPlan,
          createdAt: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save meal plan")
      }
      clearMealPlan()
      resetTitle()
      router.push("/meal-plans")

      toast.success("Meal plan saved successfully!")
    } catch (error) {
      console.error("Error saving meal plan:", error)
      toast.error("Failed to save meal plan")
    } finally {
      setSavingMealPlan(false)
    }
  }

  const handleRejectPlan = async () => {
    if (regenerating) return

    const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")

    try {
      setRegenerating(true)

      // ATOMIC VALIDATION AND INCREMENT for free users - MAXIMUM SECURITY
      if (!isUnlimitedGenerations) {
        const validationResponse = await fetch("/api/meal-plan-generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "validate-and-increment" })
        })
        
        if (validationResponse.status === 429) {
          // Limit reached
          const errorData = await validationResponse.json()
          toast.error("You've reached your weekly meal plan generation limit! Upgrade to Pro for unlimited generations.", {
            duration: 4000,
            icon: "👑"
          })
          unlockFeature(PRO_FEATURES["unlimited-meal-plans"])
          setRegenerating(false)
          return
        } else if (!validationResponse.ok) {
          toast.error("Failed to validate generation limits. Please try again.")
          setRegenerating(false)
          return
        } else {
          // Successfully validated and incremented
          const validationData = await validationResponse.json()
          setGenerationCount(validationData.generationCount)
        }
      }

      const { duration, mealsPerDay } = useMealPlanStore.getState()

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
        setRegenerating(false)
        return
      }

      const today = new Date().toISOString()
      setMealPlan(result.mealPlan, duration, mealsPerDay, today)

      toast.success("Meal plan regenerated successfully!")
    } catch (error) {
      console.error("Error regenerating meal plan:", error)
      toast.error("Failed to regenerate meal plan")
    } finally {
      setRegenerating(false)
    }
  }

  const totalMeals = duration * mealsPerDay
  const estimatedTime = Math.ceil(duration * 0.5)

  /* ======================== */
  /*         Render            */
  /* ======================== */

  if (loading || regenerating) {
    return <MealLoading />
  }

  return (
    <div suppressHydrationWarning className="container max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Enhanced Configuration Section */}
      <div className="w-full">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
            <Rocket className="h-4 w-4" />
            AI-Powered Meal Planning
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create Your Perfect Meal Plan</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Personalized nutrition planning made simple</p>
        </div>

        {/* Generation Limit Indicator */}
        {!isUnlimitedGenerations && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Free Plan: {generationCount}/{maxGenerations} generations used this week
                  </span>
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {maxGenerations - generationCount} remaining • Resets every Monday
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro Badge for Unlimited Users */}
        {isUnlimitedGenerations && (
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Pro Plan: Unlimited meal plan generations
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-background/95 backdrop-blur-sm">
          <CardHeader className="bg-background/95 border-b border-slate-200/50 dark:border-slate-700/50">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-emerald-600" />
              Configuration
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Customize your meal plan preferences below
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Plan Duration
                  </Label>
                  <Select value={duration.toString()} onValueChange={(v) => setDuration(Number.parseInt(v))}>
                    <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 2, label: "2 days", subtitle: "Quick start" },
                        { value: 3, label: "3 days", subtitle: "Weekend plan" },
                        { value: 5, label: "5 days", subtitle: "Work week" },
                        { value: 7, label: "7 days", subtitle: "Most popular" },
                        { value: 10, label: "10 days", subtitle: "Extended plan" },
                        { value: 14, label: "14 days", subtitle: "Full cycle" },
                      ].map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="py-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-slate-500 ml-2">{option.subtitle}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Meals per Day Selector */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Daily Meals
                  </Label>
                  <Select value={mealsPerDay.toString()} onValueChange={(v) => setMealsPerDay(Number.parseInt(v))}>
                    <SelectTrigger className="h-12 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 1, label: "1 meal", subtitle: "OMAD" },
                        { value: 2, label: "2 meals", subtitle: "Intermittent" },
                        { value: 3, label: "3 meals", subtitle: "Traditional" },
                        { value: 4, label: "4 meals", subtitle: "With snack" },
                        { value: 5, label: "5 meals", subtitle: "Frequent" },
                        { value: 6, label: "6 meals", subtitle: "Athletic" },
                      ].map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="py-3">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-slate-500 ml-2">{option.subtitle}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-700" />

              {/* Plan Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Plan Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{duration}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalMeals}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Meals</div>
                  </div>
                  <div className="text-center col-span-2 md:col-span-1">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">~{estimatedTime}h</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Prep Time</div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex flex-col gap-4">
                <Button
                  onClick={generateMealPlan}
                  disabled={loading}
                  size="lg"
                  className="h-14 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Your Plan...
                    </>
                  ) : generated ? (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Plan Generated!
                    </>
                  ) : (
                    <>
                      Generate Meal Plan
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Features */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    Nutritionally Balanced
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Shopping List Included
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  >
                    Dietary Preferences
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Display Meal Plan */}
      {mealPlan.length > 0 && (
        <div className="space-y-6">
          {/* Header Section with Actions */}
          <div className="bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/40 backdrop-blur-sm">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Title Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        Your Personalized Meal Plan
                      </h2>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {duration} days
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                        >
                          <Utensils className="h-3 w-3 mr-1" />
                          {mealsPerDay} meals/day
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300"
                        >
                          {totalMeals} total meals
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSaveMealPlan}
                    disabled={savingMealPlan}
                    className="h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 font-medium"
                  >
                    {savingMealPlan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Plan...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Plan
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRejectPlan}
                    disabled={regenerating}
                    variant="outline"
                    className="h-11 px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium"
                  >
                    {regenerating ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Try Different Plan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Plan Content */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
                  {title}
                </h1>
              </div>

              <ScrollArea className="h-[700px]">
                <div className="p-8 space-y-12">
                  {mealPlan.map((dayPlan, dayIndex) => (
                    <div key={dayPlan.day} className="space-y-6">
                      {/* Day Header */}
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <span className="text-white font-bold text-lg">{dayPlan.day}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Day {dayPlan.day}</h3>
                          <p className="text-slate-600 dark:text-slate-400">{dayPlan.meals.length} meals planned</p>
                        </div>
                      </div>

                      {/* Meals Grid */}
                      <div className="grid gap-6">
                        {dayPlan.meals.map((meal, mealIndex) => (
                          <div
                            key={mealIndex}
                            className="group relative bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-800 dark:via-slate-900/50 dark:to-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 overflow-hidden"
                          >
                            {/* Meal Header */}
                            <div className="p-6 pb-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md">
                                      <Utensils className="h-4 w-4 text-white" />
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                    >
                                      Meal {mealIndex + 1}
                                    </Badge>
                                  </div>
                                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                    {meal.name}
                                  </h4>
                                </div>
                              </div>
                            </div>

                            {/* Meal Content */}
                            <div className="px-6 pb-6 space-y-6">
                              {/* Meal Image */}
                              {meal.imageUrl && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-md bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                      <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                                    </div>
                                    <h5 className="font-semibold text-slate-900 dark:text-slate-100">Meal Preview</h5>
                                  </div>
                                  <div className="relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                                    <img
                                      src={meal.imageUrl}
                                      alt={`${meal.name} - Meal preview`}
                                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        // Fallback for broken images
                                        console.log("Image failed to load:", meal.imageUrl)
                                        e.currentTarget.style.display = 'none';
                                      }}
                                      onLoad={() => {
                                        console.log("Image loaded successfully:", meal.imageUrl)
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                  </div>
                                </div>
                              )}
                              {!meal.imageUrl && (
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  Debug: No imageUrl for meal &quot;{meal.name}&quot;
                                </div>
                              )}

                              {/* Ingredients Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></div>
                                  </div>
                                  <h5 className="font-semibold text-slate-900 dark:text-slate-100">Ingredients</h5>
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {meal.ingredients.length} items
                                  </Badge>
                                </div>
                                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {meal.ingredients.map((ingredient, i) => (
                                      <div
                                        key={i}
                                        className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                                      >
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0"></div>
                                        <span>{ingredient}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Instructions Section */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                                  </div>
                                  <h5 className="font-semibold text-slate-900 dark:text-slate-100">
                                    Cooking Instructions
                                  </h5>
                                </div>
                                <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {meal.instructions}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        ))}
                      </div>

                      {/* Day Separator */}
                      {dayIndex < mealPlan.length - 1 && (
                        <div className="flex items-center gap-4 py-4">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                          <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default CreateMealPlan
