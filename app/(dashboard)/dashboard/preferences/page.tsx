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
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

// Import server actions
import { saveOnboardingData } from "@/actions/saveData"
import { fetchOnboardingData } from "@/data"
import { useSession } from "@/lib/auth-client"

// Constants
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
  {
    id: "kenyan",
    label: "Kenyan",
    icon: "🍜",
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  },
  {
    id: "Nigerian",
    label: "Nigerian",
    icon: "🍜",
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  },
  {
    id: "Halaal",
    label: "Halaal",
    icon: "🍜",
    color: "bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800",
  },
]

// Define both interfaces to handle the type conversion
interface UserPreference {
  userId: string
  dietaryPreference: string
  goal: string
  householdSize: number
  cuisinePreferences: string[]
  // Add any other fields that might be in the database model
}

interface UserPreferences {
  dietaryPreference: string
  goal: string
  householdSize: number
  cuisinePreferences: string[]
}

// Helper function to convert from server response to component state
const convertToUserPreferences = (data: UserPreference[] | null): UserPreferences => {
  // If we have data and at least one preference record
  if (data && data.length > 0) {
    const firstPreference = data[0];
    return {
      dietaryPreference: firstPreference.dietaryPreference,
      goal: firstPreference.goal,
      householdSize: firstPreference.householdSize,
      cuisinePreferences: firstPreference.cuisinePreferences,
    };
  }
  
  // Return default values if no data
  return {
    dietaryPreference: "",
    goal: "",
    householdSize: 1,
    cuisinePreferences: [],
  };
};


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
  const [isRefreshing, setIsRefreshing] = useState(false)

  const user = useSession()
  const id = user?.data?.user?.id
  
  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!id) return;
      
      setIsLoading(true)
      try {
        const userPrefsData = await fetchOnboardingData(id);
        // Convert the array response to our expected UserPreferences format
        const userPrefs = convertToUserPreferences(userPrefsData);
        setPreferences(userPrefs);
        setOriginalPreferences(userPrefs);
      } catch (error) {
        console.error("Error loading preferences:", error)
        toast.error("Failed to load your preferences. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPreferences()
  }, [id])

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
      await saveOnboardingData(preferences)
      setOriginalPreferences(preferences)
      setHasChanges(false)
      toast.success("Your meal preferences have been updated successfully.")
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (originalPreferences) {
      setPreferences(originalPreferences)
    }
  }

  const handleRefresh = async () => {
    if (!id) return;
    
    setIsRefreshing(true)
    try {
      const userPrefsData = await fetchOnboardingData(id);
      // Convert the array response to our expected UserPreferences format
      const userPrefs = convertToUserPreferences(userPrefsData);
      setPreferences(userPrefs);
      setOriginalPreferences(userPrefs);
      toast.success("Preferences refreshed successfully.")
    } catch (error) {
      console.error("Refresh error:", error)
      toast.error("Failed to refresh preferences. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Loading</p>
      </div>
    </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-800 flex items-center justify-center text-white shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your preferences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Header */}
      <div className="w-full bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-green-500 text-foreground shadow-lg">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meal <span className="text-green-500">Wise</span></h1>
                <p className="text-sm font-medium text-muted-foreground">Manage your preferences</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="text-sm font-medium text-muted-foreground"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              {hasChanges && (
                <>
                  <Button variant="outline" size="sm" onClick={handleReset} className="text-sm font-medium text-muted-foreground">
                    Reset
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl bg-background mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-4xl font-bold tracking-tight text-foreground mb-3">Your Taste Preferences</h2>
          <p className="text-lg font-medium text-muted-foreground leading-relaxed">
            Customize your meal recommendations to match your lifestyle and preferences.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Dietary Preferences */}
          <Card className="border shadow-lg bg-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-primary-foreground">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Dietary Preference</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-muted-foreground">
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
                        ? "border-primary bg-primary/5 shadow-md"
                        : `${option.color} border-transparent hover:shadow-sm`,
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <Label htmlFor={option.value} className="flex items-center gap-4 cursor-pointer w-full">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className="text-base font-semibold tracking-tight text-foreground">{option.label}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          preferences.dietaryPreference === option.value
                            ? "border-primary bg-primary"
                            : "border-muted group-hover:border-primary/50",
                        )}
                      >
                        {preferences.dietaryPreference === option.value && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Goals Card */}
          <Card className="border shadow-lg bg-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-primary-foreground">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Primary Goal</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-muted-foreground">
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
                        ? "border-primary bg-primary/5 shadow-md"
                        : `${option.color} border-transparent hover:shadow-sm`,
                    )}
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                    <Label htmlFor={option.value} className="flex items-center gap-4 cursor-pointer w-full">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className="text-base font-semibold tracking-tight text-foreground">{option.label}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          preferences.goal === option.value
                            ? "border-primary bg-primary"
                            : "border-muted group-hover:border-primary/50",
                        )}
                      >
                        {preferences.goal === option.value && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Household Size */}
          <Card className="border shadow-lg bg-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-primary-foreground">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Household Size</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-muted-foreground">
                How many people are you cooking for regularly?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreferences((prev) => ({ ...prev, householdSize: Math.max(1, prev.householdSize - 1) }))}
                  disabled={preferences.householdSize <= 1}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center">
                  <div className="text-4xl font-bold text-foreground mb-1">{preferences.householdSize}</div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {preferences.householdSize === 1 ? "Person" : "People"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPreferences((prev) => ({ ...prev, householdSize: Math.min(10, prev.householdSize + 1) }))}
                  disabled={preferences.householdSize >= 10}
                  className="h-10 w-10 rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cuisine Preferences */}
          <Card className="border shadow-lg bg-card">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-primary-foreground">
                  <Cookie className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Cuisine Preferences</CardTitle>
              </div>
              <CardDescription className="text-base font-medium text-muted-foreground">
                Select your favorite cuisines to get more relevant recipes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {CUISINE_OPTIONS.map((cuisine) => {
                  const isSelected = preferences.cuisinePreferences.includes(cuisine.id)
                  return (
                    <div
                      key={cuisine.id}
                      onClick={() => {
                        setPreferences((prev) => {
                          const newCuisines = isSelected
                            ? prev.cuisinePreferences.filter((id) => id !== cuisine.id)
                            : [...prev.cuisinePreferences, cuisine.id]
                          return { ...prev, cuisinePreferences: newCuisines }
                        })
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : `${cuisine.color} border-transparent hover:shadow-sm`,
                      )}
                    >
                      <div className="text-2xl">{cuisine.icon}</div>
                      <div className="font-medium">{cuisine.label}</div>
                      {isSelected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
