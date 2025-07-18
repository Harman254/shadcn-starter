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
  Lightbulb,
} from "lucide-react"
import toast from "react-hot-toast"
import { generateMealPlanTitle } from "@/ai/flows/generateMealPlanTitle"
import { useRouter } from "next/navigation"
import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features"
import MealLoading from "./meal-plan-loading-new"
import { useSession } from "@/lib/auth-client"
import { useAuthModal } from "@/components/AuthModalProvider"
import { User } from "better-auth/types"
import { CldImage } from 'next-cloudinary'
import SubscriptionModal from "./SubscriptionModal"
import { cn } from "@/lib/utils"

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
  isOnboardComplete: boolean
}

/* ======================== */
/*         Component         */
/* ======================== */

const CreateMealPlan = ({ preferences, isOnboardComplete }: CreateMealPlanProps) => {
  const { mealPlan, duration, mealsPerDay, setDuration, setMealsPerDay, setMealPlan, clearMealPlan } =
    useMealPlanStore()
  const [loading, setLoading] = useState(false)
  const [savingMealPlan, setSavingMealPlan] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generationCount, setGenerationCount] = useState<number>(0)
  const [maxGenerations, setMaxGenerations] = useState<number>(3)
  const [countLoading, setCountLoading] = useState<boolean>(true)
  const { setTitle, resetTitle } = useMealPlanTitleStore()
  const { hasFeature, unlockFeature, getFeatureBadge, upgradeModalFeature, setUpgradeModalFeature } = useProFeatures()
  const title = useMealPlanTitleStore((state) => state.title)
  const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")
  const { data: session, isPending } = useSession();
  const { open: openAuthModal } = useAuthModal();
  const [cloudinaryImages, setCloudinaryImages] = useState<string[]>([
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/pot-mussels.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/dessert.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742112003/samples/dessert-on-a-plate.jpg',
    'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg'
  ]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [showSaveHint, setShowSaveHint] = useState(false)

  const router =useRouter()

  // Fetch generation count function (top-level)
  const fetchGenerationCount = async () => {
    setCountLoading(true)
    if (!isUnlimitedGenerations) {
      try {
        const response = await fetch("/api/meal-plan-generations")
        if (response.ok) {
          const data = await response.json()
          // Ensure count is never negative and always a number
          const safeCount = Math.max(0, Number(data.generationCount) || 0)
          setGenerationCount(safeCount)
          setMaxGenerations(Number(data.maxGenerations) || 3)
        } else {
          setGenerationCount(0)
          setMaxGenerations(3)
        }
      } catch (error) {
        setGenerationCount(0)
        setMaxGenerations(3)
      }
    }
    setCountLoading(false)
  }

  // Fetch generation count on mount
  useEffect(() => {
    fetchGenerationCount();
  }, [isUnlimitedGenerations]);

  // Ensure default duration is 5 days if not set
  useEffect(() => {
    if (!duration || ![2, 3, 5].includes(duration)) {
      setDuration(5);
    }
  }, []);

  // Show the save hint only the first time a plan is generated in a session
  useEffect(() => {
    if (mealPlan.length > 0 && !showSaveHint) {
      setShowSaveHint(true)
    }
  }, [mealPlan.length])

  /* ======================== */
  /*       Functions           */
  /* ======================== */

  // Helper to assign images to meals
  const assignCloudinaryImagesToMealPlan = (mealPlan: DayMealPlan[], images: string[]) => {
    let imageIdx = 0;
    return mealPlan.map(day => ({
      ...day,
      meals: day.meals.map(meal => ({
        ...meal,
        imageUrl: images[imageIdx++ % images.length]
      }))
    }));
  };

  const generateMealPlan = async () => {
    // Check authentication before proceeding
    if (!session || !session.user?.id) {
      openAuthModal("sign-in");
      return;
    }
    // Enforce onboarding via prop
    if (!isOnboardComplete) {
      toast.error("Please complete onboarding before generating a meal plan.");
      router.push('/onboarding')
      return;
    }

    const { duration, mealsPerDay } = useMealPlanStore.getState()
    const isUnlimitedGenerations = hasFeature("unlimited-meal-plans")

    if (imagesLoading || cloudinaryImages.length === 0) {
      toast.error('Cloudinary images not loaded. Please try again.');
      return;
    }

    try {
      setLoading(true)
      resetTitle()

      // Backend validation before generation for free users
      if (!isUnlimitedGenerations) {
        const validationResponse = await fetch("/api/meal-plan-generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "validate-only" }),
        })
        if (validationResponse.status === 429) {
          toast.error("You have reached your weekly meal plan limit! Upgrade to Pro for unlimited generations.");
          handleUnlockPro();
          setLoading(false);
          return;
        }
        if (!validationResponse.ok) {
          toast.error("Failed to validate generation limits. Please try again.");
          setLoading(false);
          return;
        }
        const validationData = await validationResponse.json();
        if (!validationData.canGenerate) {
          handleUnlockPro();
          setLoading(false);
          return;
        }
      }

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      }

      // Generate meal plan
      const result = await generatePersonalizedMealPlan(input)

      if (!result?.mealPlan) {
        toast.error("Meal plan service returned invalid data")
        clearMealPlan()
        setLoading(false)
        return
      }

      const titleresult = await generateMealPlanTitle(result.mealPlan)
      const mealPlanWithImages = assignCloudinaryImagesToMealPlan(result.mealPlan, cloudinaryImages).map(day => ({
        ...day,
        coverImageUrl: cloudinaryImages[0],
        meals: day.meals.map(meal => ({
          ...meal,
          coverImageUrl: cloudinaryImages[0]
        })),
      }));

      setTitle(titleresult.title)

      if (!titleresult?.title) {
        toast.error("Failed to generate meal plan title")
        clearMealPlan()
        setLoading(false)
        return
      }

      const today = new Date().toISOString()
      setMealPlan(mealPlanWithImages, duration, mealsPerDay, today)
      setGenerated(true)
      setTimeout(() => setGenerated(false), 3000)
      toast.success("Meal plan generated successfully!")
      // Always refetch generation count after generation
      fetchGenerationCount();
    } catch (error) {
      console.error("Error generating meal plan")
      toast.error("Failed to generate meal plan")
      clearMealPlan()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMealPlan = async () => {
    // Check authentication before proceeding
    if (!session || !session.user?.id) {
      openAuthModal("sign-in");
      return;
    }

    try {
      setSavingMealPlan(true)

      // Log the data being sent for debugging
      const saveData = {
        title,
        duration,
        mealsPerDay,
        days: mealPlan.map(day => ({
          ...day,
          coverImageUrl: cloudinaryImages[0] ,
          meals: day.meals.map(meal => ({
            ...meal,
            coverImageUrl: cloudinaryImages[0] 
          })),
        })),
        createdAt: new Date().toISOString(),
        coverImageUrl: cloudinaryImages[0],
      }
      
      console.log("Saving meal plan with data:", saveData)
      console.log("Data size:", JSON.stringify(saveData).length, "characters")
      
      // Show warning for large meal plans
      if (duration >= 14) {
        toast.loading("Saving large meal plan... This may take a moment.", {
          duration: 3000,
        })
      }
      
      const response = await fetch("/api/savemealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      })

      console.log("Save response status:", response.status)
      console.log("Save response headers:", Object.fromEntries(response.headers.entries()))
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        // Response is not JSON, likely an HTML error page
        const textResponse = await response.text()
        console.error("Non-JSON response received:", textResponse.substring(0, 500))
        throw new Error(`Server returned non-JSON response (${response.status}): ${textResponse.substring(0, 200)}`)
      }
      
      const data = await response.json()
      console.log("Save response data:", data)
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save meal plan")
      }

      clearMealPlan()
      resetTitle()
      router.push("/meal-plans")
      toast.success("Meal plan saved! You can view it in your dashboard.")
      setShowSaveHint(false)
      // Refetch generation count after save
      fetchGenerationCount();
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

      // if (!isUnlimitedGenerations) {
      //   const validationResponse = await fetch("/api/meal-plan-generations", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ action: "validate-and-increment" }),
      //   })

      //   if (validationResponse.status === 429) {
      //     const errorData = await validationResponse.json()
      //     toast.error(
      //       "You\'ve reached your weekly meal plan generation limit! Upgrade to Pro for unlimited generations.",
      //       {
      //         duration: 4000,
      //         icon: "👑",
      //       },
      //     )
      //     handleUnlockPro()
      //     setRegenerating(false)
      //     return
      //   } else if (!validationResponse.ok) {
      //     toast.error("Failed to validate generation limits. Please try again.")
      //     setRegenerating(false)
      //     return
      //   } else {
      //     const validationData = await validationResponse.json()
      //     setGenerationCount(validationData.generationCount)
      //   }
      // }
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
      const mealPlanWithImages = assignCloudinaryImagesToMealPlan(result.mealPlan, cloudinaryImages).map(day => ({
        ...day,
        coverImageUrl: cloudinaryImages[0] || "",
        meals: day.meals.map(meal => ({
          ...meal,
          coverImageUrl: cloudinaryImages[0] || "",
        })),
      }));
      setMealPlan(mealPlanWithImages, duration, mealsPerDay, today)
      toast.success("Meal plan regenerated successfully!")
      // Always refetch generation count after regeneration
      fetchGenerationCount();
    } catch (error) {
      console.error("Error regenerating meal plan:", error)
      toast.error("Failed to regenerate meal plan")
    } finally {
      setRegenerating(false)
    }
  }

  const totalMeals = duration * mealsPerDay
  const estimatedTime = Math.ceil(duration * 0.5)

  // After unlocking pro, reset state and update UI
  const handleUnlockPro = () => {
    unlockFeature(PRO_FEATURES["unlimited-meal-plans"])
    setGenerationCount(0)
    setMaxGenerations(3)
  }

  /* ======================== */
  /*         Render            */
  /* ======================== */

  if (loading || regenerating) {
    return <MealLoading />
  }

  return (
    <>
      <SubscriptionModal
        featureId={upgradeModalFeature?.id}
        open={!!upgradeModalFeature}
        onOpenChange={(open) => {
          if (!open) setUpgradeModalFeature(null);
        }}
      />
      
      <div
        suppressHydrationWarning
        // Main background color from palette
        className="relative min-h-screen w-full bg-[#EAEFEF] dark:bg-[#222222]"
      >
        {/* Premium Background Effects (subtle, using palette) */}
        <div className="absolute inset-0bg-[#EAEFEF] dark:bg-[#222222]"/>
        <div className="absolute inset-0 dark:bg-[#222222]" />
        <div className="relative w-full max-w-6xl mx-auto py-8 lg:py-16 px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-8">
            {/* Info badge using accent color */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold  backdrop-blur-sm
  bg-gradient-to-r from-indigo-800 via-violet-500 to-violet-400 text-white
  ring-2 ring-indigo-300/40
  ">
              <Utensils className="h-4 w-4 text-white drop-shadow" />
              AI-Powered Nutrition Planning
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] font-sans
  bg-gradient-to-r from-indigo-600 via-violet-500 to-rose-500 bg-clip-text text-transparent
  drop-shadow-md dark:drop-shadow-lg">
                Create Your Perfect
                <span className="block">Meal Plan</span>
              </h1>
              <p className="text-xl lg:text-2xl text-[#7F8CAA] max-w-4xl mx-auto leading-relaxed font-medium font-sans">
                Enterprise-grade nutrition planning powered by advanced AI. Get personalized meal plans that align with your lifestyle, preferences, and wellness objectives.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {!isUnlimitedGenerations ? (
              <div className="bg-gradient-to-r from-white via-slate-50/50 to-white dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 border border-slate-200/60 dark:border-zinc-700/60 rounded-3xl shadow-2xl shadow-slate-900/5 dark:shadow-slate-900/20 backdrop-blur-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl tracking-tight font-bold text-slate-900 dark:text-slate-50">Free Plan</h3>
                          <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                            {countLoading
                              ? 'Loading...'
                              : `${Number.isFinite(generationCount) && Number.isFinite(maxGenerations) ? generationCount : 0}/${Number.isFinite(maxGenerations) ? maxGenerations : 3} generations used this week`}
                          </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {countLoading
                          ? '...'
                          : Number.isFinite(maxGenerations - generationCount)
                            ? Math.max(0, maxGenerations - generationCount)
                            : 0}
                      </div>
                      <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-semibold">remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-white via-zinc-50/50 to-white dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-700/60 rounded-3xl shadow-2xl shadow-zinc-900/5 dark:shadow-slate-900/20 backdrop-blur-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                        <Crown className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Professional Plan</h3>
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">Unlimited meal plan generations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">∞</div>
                      <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-semibold">unlimited</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Card className="border-0 shadow-2xl shadow-zinc-900/10 dark:shadow-zinc-900/40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50/90 via-white/90 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/90 dark:to-slate-800/90 border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 antialiased">
                    Plan Configuration
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 font-medium">
                    Customize your meal plan to match your lifestyle and goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
              {/* Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Duration Selector */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    Plan Duration
                  </Label>
                  <Select value={duration?.toString() || '5'} onValueChange={(v) => setDuration(Number.parseInt(v))}>
                    <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white dark:bg-slate-900 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      {[


                        { value: 2, label: "2 days", subtitle: "Quick start", popular: false },
                        { value: 3, label: "3 days", subtitle: "Weekend plan", popular: false },
                        { value: 5, label: "5 days", subtitle: "Work week", popular: false },
                      ].map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="py-2 sm:py-3">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">{option.label}</span>
                              {option.popular && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold"
                                >
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{option.subtitle}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Meals per Day Selector */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                    Daily Meals
                  </Label>
                  <Select value={mealsPerDay.toString()} onValueChange={(v) => setMealsPerDay(Number.parseInt(v))}>
                    <SelectTrigger className="h-12 sm:h-14 text-sm sm:text-base border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-200 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white dark:bg-slate-900 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      {[


                        { value: 1, label: "1 meal", subtitle: "OMAD", popular: false },
                        { value: 2, label: "2 meals", subtitle: "Intermittent", popular: false },
                        { value: 3, label: "3 meals", subtitle: "Traditional", popular: true },
                        { value: 4, label: "4 meals", subtitle: "With snack", popular: false },
                        { value: 5, label: "5 meals", subtitle: "Frequent", popular: false },
                        { value: 6, label: "6 meals", subtitle: "Athletic", popular: false },
                      ].map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()} className="py-2 sm:py-3">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-50">{option.label}</span>
                              {option.popular && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-semibold"
                                >
                                  Popular
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium ml-3">{option.subtitle}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

              {/* Enhanced Plan Summary */}
              {/* Card background and border from palette */}
              <div className="bg-[#B8CFCE] rounded-2xl p-4 sm:p-6 md:p-8 border border-[#7F8CAA] shadow-lg">
                <h3 className="text-lg sm:text-xl font-black text-[#333446] mb-4 sm:mb-6 flex items-center gap-3 antialiased">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-xl bg-[#7F8CAA] flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#EAEFEF]" />
                  </div>
                  Plan Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-[#EAEFEF] rounded-xl border border-[#B8CFCE] shadow-sm">
                    <div className="text-2xl sm:text-3xl font-black text-[#7F8CAA] mb-2">{duration}</div>
                    <div className="text-xs sm:text-sm font-bold text-[#333446]">Days</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-[#EAEFEF] rounded-xl border border-[#B8CFCE] shadow-sm">
                    <div className="text-2xl sm:text-3xl font-black text-[#7F8CAA] mb-2">{totalMeals}</div>
                    <div className="text-xs sm:text-sm font-bold text-[#333446]">Total Meals</div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-[#EAEFEF] rounded-xl border border-[#B8CFCE] shadow-sm">
                    <div className="text-2xl sm:text-3xl font-black text-[#7F8CAA] mb-2">~{estimatedTime}h</div>
                    <div className="text-xs sm:text-sm font-bold text-[#333446]">Prep Time</div>
                  </div>
                </div>
                {/* Warning for large meal plans */}
                {duration >= 14 && (
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#7F8CAA]/20 border border-[#7F8CAA] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#B8CFCE] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#333446]">!</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#333446]">
                        <strong>Note:</strong> 14-day meal plans contain a lot of data and may take longer to save. Please be patient during the save process.
                      </p>
                    </div>
                  </div>
                )}
              </div>

                {/* Generate Button */}
                <div className="space-y-4 sm:space-y-6">
                  <Button
                    onClick={generateMealPlan}
                    disabled={loading || imagesLoading || cloudinaryImages.length === 0 }
                    size="lg"
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-[#7F8CAA] hover:bg-[#333446] text-[#EAEFEF] shadow-xl transition-all duration-300 rounded-lg focus-visible:ring-2 focus-visible:ring-[#B8CFCE] focus-visible:ring-offset-2 disabled:opacity-50"
                  >
                    {imagesLoading ? (
                      <>
                        <Loader2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin text-[#333446]" />
                        Loading Images...
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-spin text-[#333446]" />
                        <span className="hidden sm:inline">Generating Your Perfect Plan...</span>
                        <span className="sm:hidden">Generating...</span>
                      </>
                    ) : generated ? (
                      <>
                        <CheckCircle2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-[#EAEFEF]" />
                        <span className="hidden sm:inline">Plan Generated Successfully!</span>
                        <span className="sm:hidden">Generated!</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-[#EAEFEF]" />
                        <span className="hidden sm:inline">Generate My Meal Plan</span>
                        <span className="sm:hidden">Generate Plan</span>
                        <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 text-[#EAEFEF] group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Nutritionally Balanced
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Shopping List Included
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Dietary Preferences
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Display Meal Plan */}
            {mealPlan.length > 0 && (
              <div className="space-y-6 sm:space-y-8">
                {/* Results Header */}
                <Card className="border-0 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 backdrop-blur-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#08e605]/10 via-green-500/10 to-lime-500/10 dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
                      {/* Title Section */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-[#08e605] to-green-600 flex items-center justify-center shadow-xl shadow-emerald-500/25">
                            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                              Your Personalized Meal Plan
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg mt-1">
                              Ready to transform your nutrition journey
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge
                            variant="outline"
                            className="bg-green-50 border-green-200 text-green-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
                          >
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {duration} days
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
                          >
                            <Utensils className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {mealsPerDay} meals/day
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium"
                          >
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {totalMeals} total meals
                          </Badge>
                        </div>
                      </div>

                      {/* Warning for large meal plans */}
                      {duration >= 14 && (
                        <div className="mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">!</span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                              <strong>Note:</strong> 14-day meal plans contain a lot of data and may take longer to save. Please be patient during the save process.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        {showSaveHint && mealPlan.length > 0 && (
                          <div className="mb-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow pulse-animate">
                            <Lightbulb className="h-6 w-6 text-emerald-500 animate-bounce" />
                            <span className="text-emerald-900 dark:text-emerald-200 font-semibold text-base">
                              Don&apos;t forget to <span className="underline">save your meal plan</span> so you can access it anytime!
                            </span>
                          </div>
                        )}
                        <Button
                          onClick={handleSaveMealPlan}
                          disabled={savingMealPlan}
                          className={cn(
                            "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold text-base shadow transition-all duration-200 whitespace-nowrap",
                            "bg-[#1DCD9F] text-white shadow-lg hover:bg-[#169976] focus-visible:ring-2 focus-visible:ring-[#1DCD9F] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                          )}
                        >
                          {savingMealPlan ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Saving Plan...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              <span>Save Plan</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleRejectPlan}
                          disabled={regenerating}
                          variant="outline"
                          className={cn(
                            "w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-full font-semibold text-base shadow transition-all duration-200 whitespace-nowrap",
                            "border border-[#1DCD9F] text-[#1DCD9F] bg-white hover:bg-[#EAFBF7] dark:bg-[#222222] dark:hover:bg-[#1DCD9F]/10 dark:text-[#1DCD9F] dark:border-[#1DCD9F] disabled:opacity-60 disabled:cursor-not-allowed"
                          )}
                        >
                          {regenerating ? (
                            <>
                              <RefreshCcw className="h-5 w-5 animate-spin" />
                              <span>Regenerating...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCcw className="h-5 w-5" />
                              <span>Try Different Plan</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Meal Plan Content */}
                <Card className="border-0 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 p-4 sm:p-6 md:p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
                      {title}
                    </h1>
                  </div>

                  <ScrollArea className="h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]">
                    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8 md:space-y-12 lg:space-y-16">
                    
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
                          <CldImage
                            width={400}
                            height={256}
                      
                            src={cloudinaryImages[mealIndex % cloudinaryImages.length] || ''}
                            alt={`${meal.name} - Cloudinary preview`}
                            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg"
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
    </>
  );
}

export default CreateMealPlan;    

