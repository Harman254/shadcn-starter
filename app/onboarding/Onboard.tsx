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
  Rocket
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { saveOnboardingData } from "@/actions/saveData"
import type { OnboardingData } from "@/types"

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

const cuisineOptions = [
  { value: "Italian", icon: "🍝", color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
  { value: "Japanese", icon: "🍣", color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800" },
  {
    value: "Mexican",
    icon: "🌮",
    color: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
  },
  { value: "Indian", icon: "🍛", color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800" },
  { value: "Chinese", icon: "🥡", color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
  { value: "Thai", icon: "🍲", color: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" },
  { value: "Mediterranean", icon: "🫒", color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800" },
  {
    value: "American",
    icon: "🍔",
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  },
  { value: "French", icon: "🥐", color: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800" },
  { value: "Korean", icon: "🍜", color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800" },
]

const OnboardingPage = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<OnboardingData>({
    dietaryPreference: "",
    goal: "",
    householdSize: 1,
    cuisinePreferences: [],
  })

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
    <div className="min-h-screen bg-gradient-to-br from-muted/65 via-muted/40 to-muted/15  flex flex-col">
      {/* Header */}
      <div className="w-full bg-gradient-to-br from-muted/65 via-muted/40 to-muted/15 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-green-700 text-white shadow-lg">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">MealWise</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Setup your profile</p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Step {step} of 4</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gradient-to-br from-muted/65 via-muted/40 to-muted/15">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="w-full bg-gradient-to-br from-muted/65 via-muted/40 to-muted/15 dark:bg-slate-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-700 ease-out"
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
                    step >= stepNumber ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-600",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm mb-2 transition-all duration-300",
                      step > stepNumber
                        ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg scale-110"
                        : step === stepNumber
                          ? "bg-white dark:bg-slate-800 border-2 border-orange-400 text-orange-600 dark:text-orange-400 shadow-md"
                          : "bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-400 dark:text-gray-600",
                    )}
                  >
                    {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{stepIcon.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  {React.createElement(stepIcons[step - 1].icon, { className: "w-8 h-8" })}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {stepTitles[step - 1]}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {stepDescriptions[step - 1]}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-12 pb-12">
              {step === 1 && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <RadioGroup
                    value={formData.dietaryPreference}
                    onValueChange={(value) => setFormData({ ...formData, dietaryPreference: value })}
                    className="grid gap-4"
                  >
                    {dietaryOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer group",
                          formData.dietaryPreference === option.value
                            ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50 shadow-lg scale-[1.02]"
                            : `${option.color} border-transparent hover:scale-[1.01] hover:shadow-md`,
                        )}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="flex items-center gap-6 cursor-pointer w-full">
                          <div className="text-4xl">{option.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{option.value}</p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{option.description}</p>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              formData.dietaryPreference === option.value
                                ? "border-orange-400 bg-orange-400"
                                : "border-gray-300 dark:border-gray-600 group-hover:border-orange-300",
                            )}
                          >
                            {formData.dietaryPreference === option.value && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData({ ...formData, goal: value })}
                    className="grid gap-4"
                  >
                    {goalOptions.map((option) => (
                      <div
                        key={option.value}
                        className={cn(
                          "relative rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer group",
                          formData.goal === option.value
                            ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50 shadow-lg scale-[1.02]"
                            : `${option.color} border-transparent hover:scale-[1.01] hover:shadow-md`,
                        )}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <Label htmlFor={option.value} className="flex items-center gap-6 cursor-pointer w-full">
                          <div className="text-4xl">{option.icon}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{option.value}</p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{option.description}</p>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              formData.goal === option.value
                                ? "border-orange-400 bg-orange-400"
                                : "border-gray-300 dark:border-gray-600 group-hover:border-orange-300",
                            )}
                          >
                            {formData.goal === option.value && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="flex flex-col items-center justify-center p-12 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-3xl border border-orange-100 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-8">
                      <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">Household Size</span>
                    </div>

                    <div className="flex items-center gap-8 mb-8">
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
                        className="h-14 w-14 rounded-full border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all"
                      >
                        <ChevronLeft className="h-6 w-6" />
                        <span className="sr-only">Decrease</span>
                      </Button>

                      <div className="flex flex-col items-center">
                        <span className="text-7xl font-bold text-gray-900 dark:text-white tabular-nums">
                          {formData.householdSize}
                        </span>
                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-2">
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
                        className="h-14 w-14 rounded-full border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all"
                      >
                        <ChevronRight className="h-6 w-6" />
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
                      className="w-full max-w-sm h-3 bg-orange-200 dark:bg-orange-900 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #fb923c 0%, #fb923c ${((formData.householdSize - 1) / 9) * 100}%, ${
                          document.documentElement.classList.contains("dark") ? "#7c2d12" : "#fed7aa"
                        } ${((formData.householdSize - 1) / 9) * 100}%, ${
                          document.documentElement.classList.contains("dark") ? "#7c2d12" : "#fed7aa"
                        } 100%)`,
                      }}
                    />
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-orange-100 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Perfect! We'll customize everything for {formData.householdSize}{" "}
                          {formData.householdSize === 1 ? "person" : "people"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          Recipe portions, shopping lists, and meal planning will all be tailored to your household
                          size.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {cuisineOptions.map((cuisine) => {
                      const isSelected = formData.cuisinePreferences.includes(cuisine.value)
                      return (
                        <div
                          key={cuisine.value}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              cuisinePreferences: isSelected
                                ? formData.cuisinePreferences.filter((c) => c !== cuisine.value)
                                : [...formData.cuisinePreferences, cuisine.value],
                            })
                          }}
                          className={cn(
                            "relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer transition-all duration-300 text-center group",
                            isSelected
                              ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-xl scale-105 border-2 border-orange-400"
                              : `${cuisine.color} hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600`,
                          )}
                        >
                          <div className="text-4xl mb-3">{cuisine.icon}</div>
                          <span
                            className={cn(
                              "text-sm font-semibold transition-colors",
                              isSelected
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white",
                            )}
                          >
                            {cuisine.value}
                          </span>

                          {isSelected && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <CheckCircle className="w-4 h-4 text-orange-500" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-orange-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {formData.cuisinePreferences.length}
                      </div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formData.cuisinePreferences.length === 0
                          ? "No cuisines selected"
                          : formData.cuisinePreferences.length === 1
                            ? "1 cuisine selected"
                            : `${formData.cuisinePreferences.length} cuisines selected`}
                      </span>
                    </div>
                    {formData.cuisinePreferences.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, cuisinePreferences: [] })}
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-12 pt-8 border-t border-gray-100 dark:border-slate-700">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="min-w-32 h-12 font-semibold border-2 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!isStepValid() || isSaving}
                  className="min-w-32 h-12 font-semibold bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {step === 4 ? "Complete Setup" : "Continue"}
                      {step !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
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
