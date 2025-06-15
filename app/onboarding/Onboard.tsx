"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronRight,
  ChevronLeft,
  Users,
  UtensilsCrossed,
  Target,
  Cookie,
  Loader2,
  CheckCircle,
  Rocket,
  Search,
  X,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { saveOnboardingData } from "@/actions/saveData"
import type { OnboardingData } from "@/types"
import { CUISINE_OPTIONS } from "@/lib/constants"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

const dietaryOptions = [
  {
    value: "Vegetarian",
    description: "Plant-based diet excluding meat and fish",
    icon: "🥗",
    color:
      "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:hover:bg-green-900/40",
  },
  {
    value: "Vegan",
    description: "Plant-based diet excluding all animal products",
    icon: "🌱",
    color:
      "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
  {
    value: "Pescatarian",
    description: "Plant-based diet including fish and seafood",
    icon: "🐟",
    color:
      "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:hover:bg-blue-900/40",
  },
  {
    value: "Gluten-Free",
    description: "Diet excluding gluten-containing grains",
    icon: "🌾",
    color:
      "bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:hover:bg-amber-900/40",
  },
  {
    value: "None (All foods)",
    description: "No dietary restrictions",
    icon: "🍽️",
    color:
      "bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/30 dark:border-slate-700 dark:hover:bg-slate-700/40",
  },
]

const goalOptions = [
  {
    value: "Eat Healthier",
    description: "Focus on nutritious and balanced meals",
    icon: "🥦",
    color:
      "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:hover:bg-green-900/40",
  },
  {
    value: "Save Money",
    description: "Budget-friendly meal options and planning",
    icon: "💰",
    color:
      "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800 dark:hover:bg-yellow-900/40",
  },
  {
    value: "Learn to Cook",
    description: "Develop culinary skills with easy-to-follow recipes",
    icon: "👨‍🍳",
    color:
      "bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800 dark:hover:bg-orange-900/40",
  },
  {
    value: "Reduce Food Waste",
    description: "Smart shopping and ingredient utilization",
    icon: "♻️",
    color:
      "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
  {
    value: "Try New Cuisines",
    description: "Explore diverse flavors and cooking styles",
    icon: "🌍",
    color:
      "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800 dark:hover:bg-purple-900/40",
  },
]

const OnboardingPage = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [cuisineSearch, setCuisineSearch] = useState("")
  const [customCuisine, setCustomCuisine] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const [formData, setFormData] = useState<OnboardingData>({
    dietaryPreference: "",
    goal: "",
    householdSize: 1,
    cuisinePreferences: [],
  })

  // Filter cuisines based on search
  const filteredCuisines = CUISINE_OPTIONS.filter(cuisine =>
    cuisine.label.toLowerCase().includes(cuisineSearch.toLowerCase())
  )

  /**
   * Add a custom cuisine to preferences
   */
  const addCustomCuisine = () => {
    const trimmedCuisine = customCuisine.trim().toLowerCase()
    
    if (!trimmedCuisine) {
      toast.error("Please enter a cuisine name")
      return
    }

    if (formData.cuisinePreferences.includes(trimmedCuisine)) {
      toast.error("This cuisine is already in your preferences")
      return
    }

    setFormData(prev => ({
      ...prev,
      cuisinePreferences: [...prev.cuisinePreferences, trimmedCuisine]
    }))
    
    setCustomCuisine("")
    setShowCustomInput(false)
    toast.success(`Added "${trimmedCuisine}" to your cuisine preferences`)
  }

  /**
   * Remove a cuisine from preferences
   */
  const removeCuisine = (cuisineId: string) => {
    setFormData(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.filter(id => id !== cuisineId)
    }))
    
    // Find the cuisine label for the toast message
    const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
    const cuisineName = cuisine ? cuisine.label : cuisineId
    toast.success(`Removed "${cuisineName}" from your preferences`)
  }

  /**
   * Toggle cuisine selection
   */
  const toggleCuisine = (cuisineId: string) => {
    const isSelected = formData.cuisinePreferences.includes(cuisineId)
    
    if (isSelected) {
      removeCuisine(cuisineId)
    } else {
      setFormData(prev => ({
        ...prev,
        cuisinePreferences: [...prev.cuisinePreferences, cuisineId]
      }))
      
      // Find the cuisine label for the toast message
      const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
      const cuisineName = cuisine ? cuisine.label : cuisineId
      toast.success(`Added "${cuisineName}" to your preferences`)
    }
  }

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      setIsSaving(true)
      try {
        await saveOnboardingData(formData)
      } catch (error) {
        console.error("Error saving onboarding data:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return !!formData.dietaryPreference
      case 2:
        return !!formData.goal
      case 3:
        return formData.householdSize > 0
      case 4:
        return formData.cuisinePreferences.length > 0
      default:
        return false
    }
  }

  const progressPercentage = (step / 4) * 100

  const stepIcons = [
    { icon: UtensilsCrossed, label: "Dietary" },
    { icon: Target, label: "Goals" },
    { icon: Users, label: "Household" },
    { icon: Cookie, label: "Cuisines" },
  ]

  const stepTitles = [
    "What's your dietary preference?",
    "What's your main goal?",
    "How many people in your household?",
    "Which cuisines do you love?",
  ]

  const stepDescriptions = [
    "Help us understand your dietary needs so we can create the perfect meal plans for you.",
    "Tell us what matters most to you and we'll tailor our recommendations accordingly.",
    "We'll adjust portion sizes and shopping lists based on your household size.",
    "Select your favorite cuisines to get personalized recipe suggestions you'll actually enjoy.",
  ]

  return (
    <div className="min-h-screen bg-background/95 flex flex-col">
      {/* Header */}
      <div className="w-full bg-background/95 backdrop-blur-md sticky top-0 z-10  ">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
              Step {step} of 4
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-background/95 backdrop-blur-sm  ">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="w-full bg-background/95 rounded-full h-2 sm:h-3 mb-4 sm:mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between">
            {stepIcons.map((stepIcon, index) => {
              const StepIcon = stepIcon.icon
              const stepNumber = index + 1
              const uniqueKey = `step-${stepNumber}-${stepIcon.label}`
              return (
                <div
                  key={uniqueKey}
                  className={cn(
                    "flex flex-col items-center transition-all duration-300",
                    step >= stepNumber ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-600",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-sm mb-2 sm:mb-3 transition-all duration-300 shadow-lg",
                      step > stepNumber
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 scale-110"
                        : step === stepNumber
                          ? "bg-white dark:bg-slate-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-lg"
                          : "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-600",
                    )}
                  >
                    {step > stepNumber ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" /> : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                  </div>
                  <span className="text-xs font-semibold tracking-wide hidden sm:block">{stepIcon.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl">
          <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-background/95 backdrop-blur-sm overflow-hidden">
            <CardHeader className="text-center pb-6 sm:pb-8 md:pb-10 pt-8 sm:pt-12 md:pt-16">
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/25">
                  {React.createElement(stepIcons[step - 1].icon, { className: "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" })}
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight leading-tight">
                {stepTitles[step - 1]}
              </CardTitle>
              <CardDescription className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                {stepDescriptions[step - 1]}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-8 md:px-16 pb-8 sm:pb-12 md:pb-16">
              {step === 1 && (
                <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                  <RadioGroup
                    value={formData.dietaryPreference}
                    onValueChange={(value) => setFormData({ ...formData, dietaryPreference: value })}
                    className="grid gap-4 sm:gap-6"
                  >
                    {dietaryOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-6 md:p-8 transition-all duration-300 cursor-pointer group hover:shadow-xl",
                          formData.dietaryPreference === option.value
                            ? "border-emerald-400 bg-gradient-to-r bg-background/95 shadow-xl scale-[1.02]"
                            : `${option.color} border-transparent hover:scale-[1.01] hover:shadow-lg`,
                        )}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8 cursor-pointer w-full">
                          <div className="text-4xl sm:text-5xl">{option.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight">{option.value}</p>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{option.description}</p>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                              formData.dietaryPreference === option.value
                                ? "border-emerald-400 bg-emerald-400 shadow-lg"
                                : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-300",
                            )}
                          >
                            {formData.dietaryPreference === option.value && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData({ ...formData, goal: value })}
                    className="grid gap-4 sm:gap-6"
                  >
                    {goalOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative rounded-2xl sm:rounded-3xl border-2 p-4 sm:p-6 md:p-8 transition-all duration-300 cursor-pointer group hover:shadow-xl",
                          formData.goal === option.value
                            ? "border-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 shadow-xl scale-[1.02]"
                            : `${option.color} border-transparent hover:scale-[1.01] hover:shadow-lg`,
                        )}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-8 cursor-pointer w-full">
                          <div className="text-4xl sm:text-5xl">{option.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-1 sm:mb-2 tracking-tight">{option.value}</p>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{option.description}</p>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                              formData.goal === option.value
                                ? "border-emerald-400 bg-emerald-400 shadow-lg"
                                : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-300",
                            )}
                          >
                            {formData.goal === option.value && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 sm:space-y-10 max-w-3xl mx-auto">
                  <div className="flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-xl">
                    <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                      <Users className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Household Size</span>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            householdSize: Math.max(1, formData.householdSize - 1),
                          })
                        }
                        disabled={formData.householdSize <= 1}
                        className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all shadow-lg"
                      >
                        <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        <span className="sr-only">Decrease</span>
                      </Button>

                      <div className="flex flex-col items-center">
                        <span className="text-6xl sm:text-7xl md:text-8xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
                          {formData.householdSize}
                        </span>
                        <span className="text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300 mt-2 sm:mt-4">
                          {formData.householdSize === 1 ? "Person" : "People"}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            householdSize: Math.min(10, formData.householdSize + 1),
                          })
                        }
                        disabled={formData.householdSize >= 10}
                        className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl sm:rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all shadow-lg"
                      >
                        <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        <span className="sr-only">Increase</span>
                      </Button>
                    </div>

                    <Input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.householdSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          householdSize: Number.parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full max-w-md h-3 sm:h-4 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${((formData.householdSize - 1) / 9) * 100}%, ${
                          document.documentElement.classList.contains("dark") ? "#064e3b" : "#d1fae5"
                        } ${((formData.householdSize - 1) / 9) * 100}%, ${
                          document.documentElement.classList.contains("dark") ? "#064e3b" : "#d1fae5"
                        } 100%)`,
                      }}
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-emerald-100 dark:border-slate-700 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
                          Perfect! We&#39;ll customize everything for {formData.householdSize}{" "}
                          {formData.householdSize === 1 ? "person" : "people"}
                        </p>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          Recipe portions, shopping lists, and meal planning will all be tailored to your household
                          size.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 sm:space-y-10 max-w-6xl mx-auto">
                  {/* Search and Add Custom */}
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search cuisines..."
                        value={cuisineSearch}
                        onChange={(e) => setCuisineSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 sm:py-4 border border-slate-300 dark:border-slate-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base sm:text-lg font-medium shadow-lg"
                      />
                    </div>
                    
                    {showCustomInput ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="Enter custom cuisine..."
                          value={customCuisine}
                          onChange={(e) => setCustomCuisine(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomCuisine()}
                          className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base sm:text-lg font-medium"
                          autoFocus
                        />
                        <div className="flex gap-2 sm:gap-3">
                          <button
                            onClick={addCustomCuisine}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setShowCustomInput(false)
                              setCustomCuisine("")
                            }}
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-slate-600 text-white rounded-xl sm:rounded-2xl hover:bg-slate-700 transition-colors font-semibold shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCustomInput(true)}
                        className="flex items-center gap-3 px-4 py-3 text-base sm:text-lg font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Add custom cuisine
                      </button>
                    )}
                  </div>

                  {/* Selected Cuisines */}
                  {formData.cuisinePreferences.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">Selected ({formData.cuisinePreferences.length})</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {formData.cuisinePreferences.map((cuisineId) => {
                          // Find cuisine using 'id' property
                          const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
                          const displayName = cuisine ? cuisine.label : cuisineId
                          
                          return (
                            <span
                              key={cuisineId}
                              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl shadow-lg"
                            >
                              {displayName}
                              <button
                                onClick={() => removeCuisine(cuisineId)}
                                className="ml-1 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Available Cuisines */}
                  <motion.div 
                    className="flex flex-wrap gap-3 overflow-visible"
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.5,
                    }}
                  >
                    {filteredCuisines.map((cuisine) => {
                      const isSelected = formData.cuisinePreferences.includes(cuisine.id)
                      return (
                        <motion.button
  key={cuisine.id}
  onClick={() => toggleCuisine(cuisine.id)}
                          layout
                          initial={false}
                          animate={{
                            backgroundColor: isSelected ? "#10b981" : "rgba(255, 255, 255, 0.9)",
                          }}
                          whileHover={{
                            backgroundColor: isSelected ? "#059669" : "rgba(255, 255, 255, 1)",
                          }}
                          whileTap={{
                            backgroundColor: isSelected ? "#047857" : "rgba(240, 240, 240, 1)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.5,
                            backgroundColor: { duration: 0.1 },
                          }}
                          className={`
                            inline-flex items-center px-4 py-2 rounded-full text-base font-medium
                            whitespace-nowrap overflow-hidden ring-2 ring-inset shadow-md
                            ${isSelected 
                              ? "text-white ring-emerald-500 shadow-emerald-500/25" 
                              : "text-slate-700 ring-slate-300 hover:ring-emerald-300 shadow-slate-200/50"}
                          `}
                        >
                          <motion.div 
                            className="relative flex items-center"
                            animate={{ 
                              width: isSelected ? "auto" : "100%",
                              paddingRight: isSelected ? "1.5rem" : "0",
                            }}
                            transition={{
                              ease: [0.175, 0.885, 0.32, 1.275],
                              duration: 0.3,
                            }}
                          >
                            <span className="font-semibold">{cuisine.label}</span>
                            <AnimatePresence>
    {isSelected && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  transition={{ 
                                    type: "spring", 
                                    stiffness: 500, 
                                    damping: 30, 
                                    mass: 0.5 
                                  }}
                                  className="absolute right-0"
                                >
                                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <CheckCircle className="w-3 h-3 text-emerald-600" strokeWidth={2} />
                                  </div>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                </div>
              )}

              <div className="flex justify-between mt-16 pt-10 border-t border-slate-200 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="min-w-40 h-14 font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 text-lg rounded-2xl shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5 mr-3" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isSaving}
                  className="min-w-40 h-14 font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 text-lg rounded-2xl"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-3" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {step === 4 ? "Complete Setup" : "Continue"}
                      {step !== 4 && <ChevronRight className="w-5 h-5 ml-3" />}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
