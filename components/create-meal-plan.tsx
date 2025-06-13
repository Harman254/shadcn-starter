"use client"

import { useState } from "react"
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
import { Loader2, RefreshCcw, CheckCircle2, Clock, Utensils, Rocket, ArrowRight } from "lucide-react"
import toast from "react-hot-toast"
import { generateMealPlanTitle } from "@/ai/flows/generateMealPlanTitle"
import { useRouter } from "next/navigation"
import MealLoading from "./meal-plan-loading"

/* ======================== */
/*        Interfaces         */
/* ======================== */

interface Meal {
  name: string
  ingredients: string[]
  instructions: string
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
  const { setTitle, resetTitle } = useMealPlanTitleStore()
  const router = useRouter()

  const title = useMealPlanTitleStore((state) => state.title)

  /* ======================== */
  /*       Functions           */
  /* ======================== */

  const generateMealPlan = async () => {
    const { duration, mealsPerDay } = useMealPlanStore.getState()

    try {
      setLoading(true)
      resetTitle() // Reset title before generating a new meal plan

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
        clearMealPlan()
        return
      }

      const titleresult = await generateMealPlanTitle(result.mealPlan)
      setTitle(titleresult.title) // Set the title state

      console.log("Generated title:", titleresult)

      if (!titleresult?.title) {
        toast.error("Failed to generate meal plan title")
        clearMealPlan()
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

    try {
      setRegenerating(true)

      const { duration, mealsPerDay } = useMealPlanStore.getState()

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
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

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-700/50">
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
        <Card className="shadow-md border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <CardHeader className="bg-neutral-50 dark:bg-neutral-900 px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">Your Meal Plan</CardTitle>
                <CardDescription className="mt-1 text-neutral-500 dark:text-neutral-400">
                  {duration} days • {mealsPerDay} meals per day
                </CardDescription>
              </div>
              {/* Actions */}
              <div className="flex gap-3 mt-2 sm:mt-0">
                <Button
                  onClick={handleSaveMealPlan}
                  disabled={savingMealPlan}
                  variant="outline"
                  className="h-9 px-4 text-sm font-medium border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {savingMealPlan ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        className="mr-1.5 h-3.5 w-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Plan
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRejectPlan}
                  disabled={regenerating}
                  variant="destructive"
                  className="h-9 px-4 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 border-0 transition-colors"
                >
                  {regenerating ? (
                    <>
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-6 space-y-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-fade-in">
                  {title}
                </h1>

                {mealPlan.map((dayPlan) => (
                  <div key={dayPlan.day} className="space-y-4">
                    <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">Day {dayPlan.day}</h3>
                    <div className="space-y-4">
                      {dayPlan.meals.map((meal, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h4 className="text-base font-semibold tracking-tight">{meal.name}</h4>
                          <div className="space-y-2">
                            <Badge
                              variant="secondary"
                              className="mb-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm px-2.5 py-0.5"
                            >
                              Ingredients
                            </Badge>
                            <ul className="list-disc pl-5 text-md text-neutral-600 dark:text-neutral-400 space-y-1">
                              {meal.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <Badge
                              variant="secondary"
                              className="mb-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-sm px-2.5 py-0.5"
                            >
                              Cooking Procedure
                            </Badge>
                            <p className="text-md text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {meal.instructions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CreateMealPlan
