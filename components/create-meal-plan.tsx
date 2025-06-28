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
import {
  Loader2,
  RefreshCcw,
  CheckCircle2,
  Utensils,
  Rocket,
  ArrowRight,
  Crown,
  Lock,
  Calendar,
  ChefHat,
  Target,
} from "lucide-react"
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
  description: string
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
      resetTitle()

      // 1. Validate only (no increment)
      const validateResponse = await fetch("/api/meal-plan-generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "validate-only" }),
      })

      if (validateResponse.status === 429) {
        unlockFeature(PRO_FEATURES["unlimited-meal-plans"])
        setLoading(false)
        return
      }

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      // 2. Generate meal plan
      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
        clearMealPlan()
        setLoading(false)
        return
      }

      // 3. Increment only after success
      const incrementResponse = await fetch("/api/meal-plan-generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment" }),
      })

      if (!incrementResponse.ok) {
        toast.error("Failed to increment generation count. Please try again.")
        setLoading(false)
        return
      }

      const incrementData = await incrementResponse.json()
      setGenerationCount(incrementData.generationCount)

      const titleresult = await generateMealPlanTitle(result.mealPlan)
      setTitle(titleresult.title)

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
      
      // Log the data being sent for debugging
      const saveData = {
        title,
        duration,
        mealsPerDay,
        days: mealPlan,
        createdAt: new Date().toISOString(),
      }
      
      console.log('Saving meal plan with data:', saveData)
      
      const response = await fetch("/api/savemealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      })

      console.log('Save response status:', response.status)
      
      const data = await response.json()
      console.log('Save response data:', data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save meal plan")
      }

      clearMealPlan()
      resetTitle()
      router.push("/meal-plans")
      toast.success("Meal plan saved successfully!")
    } catch (error) {
      console.error("Error saving meal plan:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save meal plan")
    } finally {
      setSavingMealPlan(false)
    }
  }

  const handleRejectPlan = async () => {
    if (regenerating) return
    const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")

    try {
      setRegenerating(true)

      if (!isUnlimitedGenerations) {
        const validationResponse = await fetch("/api/meal-plan-generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "validate-and-increment" }),
        })

        if (validationResponse.status === 429) {
          const errorData = await validationResponse.json()
          toast.error(
            "You've reached your weekly meal plan generation limit! Upgrade to Pro for unlimited generations.",
            {
              duration: 4000,
              icon: "👑",
            },
          )
          unlockFeature(PRO_FEATURES["unlimited-meal-plans"])
          setRegenerating(false)
          return
        } else if (!validationResponse.ok) {
          toast.error("Failed to validate generation limits. Please try again.")
          setRegenerating(false)
          return
        } else {
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
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      <div className="w-full max-w-7xl mx-auto py-6 md:py-12 px-3 md:px-6 lg:px-8 space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-lime-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-green-200/50 dark:border-emerald-800/50 text-green-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
            <Utensils className="h-4 w-4" />
            AI-Powered Nutrition Planning
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Create Your Perfect
              <span className="block bg-gradient-to-r from-[#08e605] via-green-500 to-lime-500 bg-clip-text text-transparent">
                Meal Plan
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Personalized nutrition planning powered by AI. Get custom meal plans that fit your lifestyle, preferences,
              and goals.
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4">
          {!isUnlimitedGenerations ? (
            <Card className="border-amber-200/60 dark:border-amber-800/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-amber-950/30 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-green-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 dark:text-amber-100">Free Plan Active</p>
                      <p className="text-sm text-green-700 dark:text-amber-300">
                        {generationCount}/{maxGenerations} generations used this week
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-amber-400">
                      {maxGenerations - generationCount}
                    </div>
                    <div className="text-xs text-green-600/80 dark:text-amber-400/80">remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200/60 dark:border-emerald-800/60 bg-gradient-to-r from-green-50 via-lime-50 to-green-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-green-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-green-900 dark:text-emerald-100">Pro Plan Active</p>
                    <p className="text-sm text-green-700 dark:text-emerald-300">Unlimited meal plan generations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Configuration Section */}
        <Card className="border-0 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 border-b border-slate-200/50 dark:border-slate-700/50 p-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#08e605] to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Plan Configuration
                </CardTitle>
                <CardDescription className="text-base text-slate-600 dark:text-slate-400 mt-1">
                  Customize your meal plan to match your lifestyle and goals
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Duration Selector */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Plan Duration
                </Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number.parseInt(v))}>
                  <SelectTrigger className="h-14 text-base border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 2, label: "2 days", subtitle: "Quick start", popular: false },
                      { value: 3, label: "3 days", subtitle: "Weekend plan", popular: false },
                      { value: 5, label: "5 days", subtitle: "Work week", popular: false },
                      { value: 7, label: "7 days", subtitle: "Most popular", popular: true },
                      { value: 10, label: "10 days", subtitle: "Extended plan", popular: false },
                      { value: 14, label: "14 days", subtitle: "Full cycle", popular: false },
                    ].map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base">{option.label}</span>
                            {option.popular && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs"
                              >
                                Popular
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400">{option.subtitle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Meals per Day Selector */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-green-600" />
                  Daily Meals
                </Label>
                <Select value={mealsPerDay.toString()} onValueChange={(v) => setMealsPerDay(Number.parseInt(v))}>
                  <SelectTrigger className="h-14 text-base border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { value: 1, label: "1 meal", subtitle: "OMAD", popular: false },
                      { value: 2, label: "2 meals", subtitle: "Intermittent", popular: false },
                      { value: 3, label: "3 meals", subtitle: "Traditional", popular: true },
                      { value: 4, label: "4 meals", subtitle: "With snack", popular: false },
                      { value: 5, label: "5 meals", subtitle: "Frequent", popular: false },
                      { value: 6, label: "6 meals", subtitle: "Athletic", popular: false },
                    ].map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base">{option.label}</span>
                            {option.popular && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs"
                              >
                                Popular
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-slate-500 dark:text-slate-400 ml-3">{option.subtitle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

            {/* Plan Summary */}
            <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#08e605] to-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                Plan Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{duration}</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Days</div>
                </div>
                <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{totalMeals}</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Meals</div>
                </div>
                <div className="text-center p-6 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">~{estimatedTime}h</div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Prep Time</div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="space-y-6">
              <Button
                onClick={generateMealPlan}
                disabled={loading}
                size="lg"
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-[#08e605] via-green-600 to-lime-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Generating Your Perfect Plan...
                  </>
                ) : generated ? (
                  <>
                    <CheckCircle2 className="mr-3 h-6 w-6" />
                    Plan Generated Successfully!
                  </>
                ) : (
                  <>
                    <Rocket className="mr-3 h-6 w-6" />
                    Generate My Meal Plan
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 dark:bg-emerald-950 dark:text-emerald-300 px-4 py-2 text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Nutritionally Balanced
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-4 py-2 text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Shopping List Included
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-4 py-2 text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Dietary Preferences
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Meal Plan */}
        {mealPlan.length > 0 && (
          <div className="space-y-8">
            {/* Results Header */}
            <Card className="border-0 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 backdrop-blur-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#08e605]/10 via-green-500/10 to-lime-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  {/* Title Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#08e605] to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                        <CheckCircle2 className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                          Your Personalized Meal Plan
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                          Ready to transform your nutrition journey
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-sm font-medium"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        {duration} days
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 px-3 py-1.5 text-sm font-medium"
                      >
                        <Utensils className="h-4 w-4 mr-2" />
                        {mealsPerDay} meals/day
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300 px-3 py-1.5 text-sm font-medium"
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {totalMeals} total meals
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleSaveMealPlan}
                      disabled={savingMealPlan}
                      size="lg"
                      className="h-12 px-8 bg-gradient-to-r from-[#08e605] to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 font-semibold"
                    >
                      {savingMealPlan ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Plan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Save Plan
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleRejectPlan}
                      disabled={regenerating}
                      variant="outline"
                      size="lg"
                      className="h-12 px-8 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-semibold bg-transparent"
                    >
                      {regenerating ? (
                        <>
                          <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-5 w-5" />
                          Try Different Plan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Meal Plan Content */}
            <Card className="border-0 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 p-8 border-b border-slate-200/50 dark:border-slate-700/50">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
          {title}
        </h1>
      </div>

      <ScrollArea className="h-[600px] md:h-[700px] lg:h-[800px]">
      <div className="p-4 md:p-6 lg:p-8 space-y-8 md:space-y-12 lg:space-y-16">
      {mealPlan.map((dayPlan, dayIndex) => (
            <div key={dayPlan.day} className="space-y-8">
              {/* Day Header */}
              <div className="flex items-center gap-3 md:gap-4 lg:gap-6">
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#08e605] to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                  <span className="text-white font-bold text-xl">{dayPlan.day}</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Day {dayPlan.day}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {dayPlan.meals.length} meals planned for today
                  </p>
                </div>
              </div>

                      {/* Meals Grid */}
                      <div className="grid gap-8">
                {dayPlan.meals.map((meal, mealIndex) => (
                  <Card
                    key={mealIndex}
                    className="group relative bg-gradient-to-br from-white via-slate-50/30 to-white dark:from-slate-800 dark:via-slate-900/30 dark:to-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 overflow-hidden"
                  >
                            {/* Meal Header */}
                            <div className="p-4 md:p-6 lg:p-8 pb-3 md:pb-4 lg:pb-6">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                              <Utensils className="h-5 w-5 text-white" />
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1.5"
                            >
                              Meal {mealIndex + 1}
                            </Badge>
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {meal.name}
                          </h4>
                        </div>
                      </div>
                    </div>

                            {/* Meal Content */}
                            <div className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 space-y-6 md:space-y-8">
                      {/* Meal Image */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-purple-600 dark:bg-purple-400"></div>
                          </div>
                          <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">Meal Preview</h5>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                          <img
                            src={
                              meal.imageUrl ||
                              `/placeholder.svg?height=256&width=400&text=${encodeURIComponent(meal.name)}`
                            }
                            alt={`${meal.name} - Meal preview`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = `/placeholder.svg?height=256&width=400&text=${encodeURIComponent(meal.name)}`
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                        </div>
                      </div>

                              {/* Ingredients Section */}
                              <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-green-600 dark:bg-green-400"></div>
                          </div>
                          <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ingredients</h5>
                          <Badge variant="outline" className="ml-auto text-sm font-medium">
                            {meal.ingredients.length} items
                          </Badge>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                            {meal.ingredients.map((ingredient, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 text-base text-slate-700 dark:text-slate-300"
                              >
                                <div className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0"></div>
                                <span className="font-medium">{ingredient}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                              {/* Instructions Section */}
                              <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                          </div>
                          <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            Cooking Instructions
                          </h5>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/50 dark:via-slate-900/50 dark:to-slate-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                          <div className="space-y-3">
                            {meal.instructions
                              .split(/(?=\d+\.)/)
                              .filter((step) => step.trim())
                              .map((step, index) => {
                                const cleanStep = step.replace(/^\d+\.\s*/, "").trim()
                                if (!cleanStep) return null

                                return (
                                  <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mt-0.5">
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium flex-1">
                                      {cleanStep}
                                    </p>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#08e605]/0 via-[#08e605]/5 to-lime-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </Card>
                ))}
              </div>


                      {/* Day Separator */}
              {dayIndex < mealPlan.length - 1 && (
                <div className="flex items-center gap-6 py-8">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                  <div className="h-3 w-3 rounded-full bg-gradient-to-r from-[#08e605] to-green-600 shadow-lg shadow-emerald-500/25"></div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateMealPlan
