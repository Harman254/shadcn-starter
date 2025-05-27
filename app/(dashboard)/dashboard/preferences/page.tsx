"use client"

import { useState, useEffect } from "react"
import {
  Save,
  Check,
  Loader2,
  UtensilsCrossed,
  Target,
  Users,
  Cookie,
  ChevronLeft,
  ChevronRight,
  Rocket,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

// Mock data - replace with your actual constants
const DIETARY_OPTIONS = [
  {
    value: "vegetarian",
    label: "Vegetarian",
    description: "Plant-based diet excluding meat and fish",
    icon: "🥗",
    color:
      "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:hover:bg-green-900/40",
  },
  {
    value: "vegan",
    label: "Vegan",
    description: "Plant-based diet excluding all animal products",
    icon: "🌱",
    color:
      "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
  {
    value: "pescatarian",
    label: "Pescatarian",
    description: "Plant-based diet including fish and seafood",
    icon: "🐟",
    color:
      "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800 dark:hover:bg-blue-900/40",
  },
  {
    value: "gluten_free",
    label: "Gluten-Free",
    description: "Diet excluding gluten-containing grains",
    icon: "🌾",
    color:
      "bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800 dark:hover:bg-amber-900/40",
  },
  {
    value: "omnivore",
    label: "No Restrictions",
    description: "No dietary restrictions",
    icon: "🍽️",
    color:
      "bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/30 dark:border-slate-700 dark:hover:bg-slate-700/40",
  },
]

const GOAL_OPTIONS = [
  {
    value: "eat_healthier",
    label: "Eat Healthier",
    description: "Focus on nutritious and balanced meals",
    icon: "🥦",
    color:
      "bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800 dark:hover:bg-green-900/40",
  },
  {
    value: "save_money",
    label: "Save Money",
    description: "Budget-friendly meal options and planning",
    icon: "💰",
    color:
      "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-800 dark:hover:bg-yellow-900/40",
  },
  {
    value: "learn_cooking",
    label: "Learn to Cook",
    description: "Develop culinary skills with easy-to-follow recipes",
    icon: "👨‍🍳",
    color:
      "bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800 dark:hover:bg-orange-900/40",
  },
  {
    value: "reduce_waste",
    label: "Reduce Food Waste",
    description: "Smart shopping and ingredient utilization",
    icon: "♻️",
    color:
      "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800 dark:hover:bg-emerald-900/40",
  },
  {
    value: "try_cuisines",
    label: "Try New Cuisines",
    description: "Explore diverse flavors and cooking styles",
    icon: "🌍",
    color:
      "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800 dark:hover:bg-purple-900/40",
  },
]

const CUISINE_OPTIONS = [
  {
    id: "italian",
    label: "Italian",
    icon: "🍝",
    color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  },
  {
    id: "japanese",
    label: "Japanese",
    icon: "🍣",
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  },
  {
    id: "mexican",
    label: "Mexican",
    icon: "🌮",
    color: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
  },
  {
    id: "indian",
    label: "Indian",
    icon: "🍛",
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  },
  {
    id: "chinese",
    label: "Chinese",
    icon: "🥡",
    color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
  },
  {
    id: "thai",
    label: "Thai",
    icon: "🍲",
    color: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    icon: "🫒",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
  },
  {
    id: "american",
    label: "American",
    icon: "🍔",
    color: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
  },
  {
    id: "french",
    label: "French",
    icon: "🥐",
    color: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
  },
  {
    id: "korean",
    label: "Korean",
    icon: "🍜",
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  },
]

interface UserPreferences {
  dietaryPreference: string
  goal: string
  householdSize: number
  cuisinePreferences: string[]
}

// Mock functions - replace with your actual API calls
const fetchUserPreferences = async (): Promise<UserPreferences> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    dietaryPreference: "vegetarian",
    goal: "eat_healthier",
    householdSize: 2,
    cuisinePreferences: ["italian", "japanese", "mediterranean"],
  }
}

const saveUserPreferences = async (preferences: UserPreferences): Promise<void> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))
  console.log("Saving preferences:", preferences)
}

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryPreference: "",
    goal: "",
    householdSize: 1,
    cuisinePreferences: [],
  })
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userPrefs = await fetchUserPreferences()
        setPreferences(userPrefs)
        setOriginalPreferences(userPrefs)
      } catch (error) {
        toast.error("Failed to load your preferences. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [])

  // Check for changes
  useEffect(() => {
    if (!originalPreferences) return

    const changed =
      preferences.dietaryPreference !== originalPreferences.dietaryPreference ||
      preferences.goal !== originalPreferences.goal ||
      preferences.householdSize !== originalPreferences.householdSize ||
      JSON.stringify(preferences.cuisinePreferences.sort()) !==
        JSON.stringify(originalPreferences.cuisinePreferences.sort())

    setHasChanges(changed)
  }, [preferences, originalPreferences])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveUserPreferences(preferences)
      setOriginalPreferences(preferences)
      setHasChanges(false)
      toast.success("Your meal preferences have been updated successfully.")
    } catch (error) {
      toast.error("Failed to save your preferences. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-orange-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">MealCraft</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your preferences</p>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleReset} className="text-gray-600 dark:text-gray-300">
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Taste Preferences</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Customize your meal recommendations to match your lifestyle and preferences.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Dietary Preferences */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Dietary Preference</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Choose your dietary lifestyle to get personalized meal suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.dietaryPreference}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, dietaryPreference: value }))}
                className="space-y-3"
              >
                {DIETARY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer group",
                      preferences.dietaryPreference === option.value
                        ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50 shadow-md"
                        : `${option.color} border-transparent hover:shadow-sm`,
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <Label htmlFor={option.value} className="flex items-center gap-4 cursor-pointer w-full">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          preferences.dietaryPreference === option.value
                            ? "border-orange-400 bg-orange-400"
                            : "border-gray-300 dark:border-gray-600 group-hover:border-orange-300",
                        )}
                      >
                        {preferences.dietaryPreference === option.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Primary Goal</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Tell us what matters most to you for better recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.goal}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, goal: value }))}
                className="space-y-3"
              >
                {GOAL_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer group",
                      preferences.goal === option.value
                        ? "border-orange-400 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/50 dark:to-pink-950/50 shadow-md"
                        : `${option.color} border-transparent hover:shadow-sm`,
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <Label htmlFor={option.value} className="flex items-center gap-4 cursor-pointer w-full">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          preferences.goal === option.value
                            ? "border-orange-400 bg-orange-400"
                            : "border-gray-300 dark:border-gray-600 group-hover:border-orange-300",
                        )}
                      >
                        {preferences.goal === option.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Household Size */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Household Size</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                We'll adjust portion sizes and shopping lists accordingly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-orange-100 dark:border-slate-700">
                  <div className="flex items-center gap-6 mb-6">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          householdSize: Math.max(1, prev.householdSize - 1),
                        }))
                      }
                      disabled={preferences.householdSize <= 1}
                      className="h-12 w-12 rounded-full border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <div className="flex flex-col items-center">
                      <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
                        {preferences.householdSize}
                      </span>
                      <span className="text-lg font-medium text-gray-600 dark:text-gray-300 mt-1">
                        {preferences.householdSize === 1 ? "Person" : "People"}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          householdSize: Math.min(8, prev.householdSize + 1),
                        }))
                      }
                      disabled={preferences.householdSize >= 8}
                      className="h-12 w-12 rounded-full border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <Input
                    type="range"
                    min="1"
                    max="8"
                    value={preferences.householdSize}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        householdSize: Number.parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full max-w-sm h-3 bg-orange-200 dark:bg-orange-900 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cuisine Preferences */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-red-500 flex items-center justify-center text-white">
                  <Cookie className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">Favorite Cuisines</CardTitle>
              </div>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                Select cuisines you enjoy for personalized recipe suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {CUISINE_OPTIONS.map((cuisine) => {
                    const isSelected = preferences.cuisinePreferences.includes(cuisine.id)
                    return (
                      <div
                        key={`cuisine-${cuisine.id}`}
                        onClick={() => {
                          setPreferences((prev) => ({
                            ...prev,
                            cuisinePreferences: isSelected
                              ? prev.cuisinePreferences.filter((c) => c !== cuisine.id)
                              : [...prev.cuisinePreferences, cuisine.id],
                          }))
                        }}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 text-center group",
                          isSelected
                            ? "bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg scale-105 border-2 border-orange-400"
                            : `${cuisine.color} hover:scale-105 hover:shadow-md border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600`,
                        )}
                      >
                        <div className="text-2xl mb-2">{cuisine.icon}</div>
                        <span
                          className={cn(
                            "text-sm font-semibold transition-colors",
                            isSelected
                              ? "text-white"
                              : "text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white",
                          )}
                        >
                          {cuisine.label}
                        </span>

                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-3 h-3 text-orange-500" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-orange-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {preferences.cuisinePreferences.length}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {preferences.cuisinePreferences.length === 0
                        ? "No cuisines selected"
                        : preferences.cuisinePreferences.length === 1
                          ? "1 cuisine selected"
                          : `${preferences.cuisinePreferences.length} cuisines selected`}
                    </span>
                  </div>
                  {preferences.cuisinePreferences.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferences((prev) => ({ ...prev, cuisinePreferences: [] }))}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button - Mobile */}
        {hasChanges && (
          <div className="lg:hidden fixed bottom-6 left-6 right-6 z-20">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 h-12 font-semibold bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-12 font-semibold bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
