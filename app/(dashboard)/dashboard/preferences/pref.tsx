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
  Search,
  X,
  Plus,
} from "lucide-react"
import { CUISINE_OPTIONS } from "@/lib/constants"
import { saveOnboardingData } from "@/actions/saveData"
import { fetchOnboardingData } from "@/data"
import { useSession } from "@/lib/auth-client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

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

interface UserPreferences {
  dietaryPreference: string
  goal: string
  householdSize: number
  cuisinePreferences: string[]
}

// Default preferences to use when no data is found
const DEFAULT_PREFERENCES: UserPreferences = {
  dietaryPreference: "",
  goal: "",
  householdSize: 1,
  cuisinePreferences: [],
}

interface Props {
  userId: string
}

const Preferences = ({userId}:Props ) => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [cuisineSearch, setCuisineSearch] = useState("")
  const [customCuisine, setCustomCuisine] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const router = useRouter()

  // Filter cuisines based on search - using 'id' property from CUISINE_OPTIONS
  const filteredCuisines = CUISINE_OPTIONS.filter(cuisine =>
    cuisine.label.toLowerCase().includes(cuisineSearch.toLowerCase())
  )

  /**
   * Convert API response to UserPreferences format
   * Handles both array responses and direct object responses
   */
  const convertToUserPreferences = (data: any): UserPreferences => {
    // Handle null or undefined data
    if (!data) {
      return DEFAULT_PREFERENCES
    }

    // Handle array response (take first item)
    if (Array.isArray(data)) {
      if (data.length === 0) {
        return DEFAULT_PREFERENCES
      }
      data = data[0]
    }

    // Ensure all required fields exist with proper defaults
    const fetchedDietaryPreference = data.dietaryPreference
    const matchedDietaryPreference = DIETARY_OPTIONS.find(
      (option) => option.label === fetchedDietaryPreference || option.value === fetchedDietaryPreference
    )?.value || ""

    const fetchedGoal = data.goal
    const matchedGoal = GOAL_OPTIONS.find(
      (option) => option.label === fetchedGoal || option.value === fetchedGoal
    )?.value || ""

    return {
      dietaryPreference: matchedDietaryPreference,
      goal: matchedGoal,
      householdSize: typeof data.householdSize === 'number' ? data.householdSize : 1,
      cuisinePreferences: Array.isArray(data.cuisinePreferences) ? data.cuisinePreferences : [],
    }
  }

  /**
   * Load user preferences from the database
   */
  const loadPreferences = async () => {
    if (!userId) {
      console.warn("No user ID available for loading preferences")
      return
    }

    setIsLoading(true)
    try {
      console.log("Loading preferences for user:", userId)
      const userPrefsData = await fetchOnboardingData(userId)
      console.log("Raw preferences data:", userPrefsData)
      
      const userPrefs = convertToUserPreferences(userPrefsData)
      console.log("Converted preferences:", userPrefs)
      
      setPreferences(userPrefs)
      setOriginalPreferences(userPrefs)
      setDataLoaded(true)
      
      // Only show success message on manual refresh, not initial load
      if (dataLoaded) {
        toast.success("Preferences loaded successfully.")
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
      toast.error("Failed to load your preferences. Using default values.")
      
      // Set defaults on error
      setPreferences(DEFAULT_PREFERENCES)
      setOriginalPreferences(DEFAULT_PREFERENCES)
    } finally {
      setIsLoading(false)
    }
  }

  // Load preferences on component mount and when userId changes
  useEffect(() => {
    loadPreferences()
  }, [userId])

  // Check for changes whenever preferences or originalPreferences change
  useEffect(() => {
    const changed =
      preferences.dietaryPreference !== originalPreferences.dietaryPreference ||
      preferences.goal !== originalPreferences.goal ||
      preferences.householdSize !== originalPreferences.householdSize ||
      JSON.stringify(preferences.cuisinePreferences.sort()) !==
        JSON.stringify(originalPreferences.cuisinePreferences.sort())

    setHasChanges(changed)
  }, [preferences, originalPreferences])

  // Debug effect to log preference changes
  useEffect(() => {
    console.log("Preferences state updated:", preferences)
    console.log("Dietary preference:", preferences.dietaryPreference)
    console.log("Goal:", preferences.goal)
    console.log("Household size:", preferences.householdSize)
    console.log("Cuisine preferences:", preferences.cuisinePreferences)
  }, [preferences])

  /**
   * Save preferences to the database
   * Note: saveOnboardingData function gets user ID from session internally
   */
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // The saveOnboardingData function gets the user ID from the session internally
      await saveOnboardingData(preferences)
      setOriginalPreferences({ ...preferences }) // Create a new object to ensure state update
      setHasChanges(false)
      toast.success("Your meal preferences have been updated successfully.")
      router.push('meal-plans/new')
    } catch (error) {
      console.error("Save error:", error)
      console.log(error)
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Reset preferences to the last saved state
   */
  const handleReset = () => {
    setPreferences({ ...originalPreferences }) // Create a new object to ensure state update
    toast.success("Changes have been reset to last saved state.")
  }

  /**
   * Refresh preferences from the database
   */

  /**
   * Add a custom cuisine to preferences
   */
  const addCustomCuisine = () => {
    const trimmedCuisine = customCuisine.trim().toLowerCase()
    
    if (!trimmedCuisine) {
      toast.error("Please enter a cuisine name")
      return
    }

    if (preferences.cuisinePreferences.includes(trimmedCuisine)) {
      toast.error("This cuisine is already in your preferences")
      return
    }

    setPreferences(prev => ({
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
    setPreferences(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.filter(id => id !== cuisineId)
    }))
    
    // Find the cuisine label for the toast message - using 'id' property
    const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
    const cuisineName = cuisine ? cuisine.label : cuisineId
    toast.success(`Removed "${cuisineName}" from your preferences`)
  }

  /**
   * Toggle cuisine selection
   */
  const toggleCuisine = (cuisineId: string) => {
    const isSelected = preferences.cuisinePreferences.includes(cuisineId)
    
    if (isSelected) {
      removeCuisine(cuisineId)
    } else {
      setPreferences(prev => ({
        ...prev,
        cuisinePreferences: [...prev.cuisinePreferences, cuisineId]
      }))
      
      // Find the cuisine label for the toast message - using 'id' property
      const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
      const cuisineName = cuisine ? cuisine.label : cuisineId
      toast.success(`Added "${cuisineName}" to your preferences`)
    }
  }

  const cn = (...classes: string[]) => classes.filter(Boolean).join(' ')

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background/95 flex items-center justify-center">
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
    <div className="min-h-screen bg-background/95 ">
      {/* Action Bar */}
      <div className="sticky top-0 z-10 bg-background/95 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
                <Rocket className="w-6 h-6" />
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
             
              
              {hasChanges && (
                <button
                  onClick={handleReset}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-700"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4 leading-tight">Your Taste Preferences</h2>
          <p className="text-lg sm:text-xl font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            Customize your meal recommendations to match your lifestyle and preferences. We will use these to create personalized meal plans just for you.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 md:gap-10 lg:grid-cols-2">
          {/* Dietary Preferences */}
          <div className="bg-background/95 shadow-2xl rounded-2xl sm:rounded-3xl border  backdrop-blur-sm">
            <div className="p-6 sm:p-8 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
                  <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dietary Preference</h3>
                  <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
                    Choose your dietary lifestyle to get personalized meal suggestions.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              <div className="space-y-3 sm:space-y-4">
                {DIETARY_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setPreferences(prev => ({ ...prev, dietaryPreference: option.value }))}
                    className={cn(
                      "relative rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 transition-all duration-300 cursor-pointer group hover:shadow-xl",
                      preferences.dietaryPreference === option.value
                        ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-xl scale-[1.02]"
                        : `${option.color} border-transparent hover:shadow-lg`,
                    )}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                      <div className="text-2xl sm:text-3xl">{option.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-1">{option.label}</p>
                        <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                          preferences.dietaryPreference === option.value
                            ? "border-emerald-500 bg-emerald-500 shadow-lg"
                            : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400",
                        )}
                      >
                        {preferences.dietaryPreference === option.value && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals Card */}
          <div className="bg-background/95 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Primary Goal</h3>
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                Tell us what matters most to you for better recommendations.
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className="space-y-3">
                {GOAL_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setPreferences(prev => ({ ...prev, goal: option.value }))}
                    className={cn(
                      "relative rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer group",
                      preferences.goal === option.value
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md"
                        : `${option.color} border-transparent hover:shadow-sm`,
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{option.icon}</div>
                      <div className="flex-1">
                        <p className="text-base font-semibold tracking-tight text-gray-900 dark:text-white">{option.label}</p>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-0.5">{option.description}</p>
                      </div>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          preferences.goal === option.value
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 dark:border-gray-600 group-hover:border-green-400",
                        )}
                      >
                        {preferences.goal === option.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Household Size */}
          <div className="bg-background/95 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="p-6 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">Household Size</h3>
              </div>
              <p className="text-base font-medium text-gray-600 dark:text-gray-400">
                How many people are you cooking for regularly?
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, householdSize: Math.max(1, prev.householdSize - 1) }))}
                  disabled={preferences.householdSize <= 1}
                  className="h-10 w-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex-1 text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{preferences.householdSize}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {preferences.householdSize === 1 ? "person" : "people"}
                  </div>
                </div>
                
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, householdSize: Math.min(10, prev.householdSize + 1) }))}
                  disabled={preferences.householdSize >= 10}
                  className="h-10 w-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cuisine Preferences */}
          <div className="bg-background/95 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-200/60  backdrop-blur-sm">
            <div className="p-6 sm:p-8 pb-4 sm:pb-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25">
                  <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Favorite Cuisines</h3>
                  <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-400">
                    Select the cuisines you enjoy most. We&#39;ll prioritize these in your recommendations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
              {/* Search and Add Custom */}
              <div className="mb-6 space-y-4">
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
                      // onKeyPress={(e) => e.key === 'Enter' && addCustomCuisine()}
                      className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base sm:text-lg font-medium"
                      autoFocus
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={addCustomCuisine}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-emerald-600 text-white rounded-xl sm:rounded-2xl hover:bg-emerald-700 transition-colors font-semibold shadow-lg"
                      >
                        <Check className="w-5 h-5" />
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
              {preferences.cuisinePreferences.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Selected ({preferences.cuisinePreferences.length})</h4>
                  <div className="flex flex-wrap gap-3">
                    {preferences.cuisinePreferences.map((cuisineId) => {
                      // Find cuisine using 'id' property
                      const cuisine = CUISINE_OPTIONS.find(c => c.id === cuisineId)
                      const displayName = cuisine ? cuisine.label : cuisineId
                      
                      return (
                        <span
                          key={cuisineId}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 text-base font-semibold rounded-2xl shadow-lg"
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
              <div className="grid grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                {filteredCuisines.map((cuisine) => {
                  // Use 'id' property for selection check
                  const isSelected = preferences.cuisinePreferences.includes(cuisine.id)
                  
                  return (
                    <button
                      key={cuisine.id}
                      onClick={() => toggleCuisine(cuisine.id)}
                      className={cn(
                        "group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                        "hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]",
                        "focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:ring-offset-2",
                        isSelected
                          ? "border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-emerald-900/40 shadow-xl shadow-emerald-500/25"
                          : "border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-slate-50 hover:to-emerald-50/30 dark:hover:from-slate-700 dark:hover:to-emerald-950/20"
                      )}
                    >
                      {/* Background gradient overlay */}
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
                          isSelected
                            ? "from-emerald-500/5 to-teal-500/5 opacity-100"
                            : "from-emerald-500/0 to-teal-500/0 group-hover:opacity-100"
                        )}
                      />
                      
                      {/* Content */}
                      <div className="relative z-10 flex items-center gap-4 w-full">
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-slate-900 dark:text-white truncate tracking-tight">
                            {cuisine.label}
                          </p>
                        </div>
                        
                        {/* Enhanced checkbox */}
                        <div
                          className={cn(
                            "relative w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0",
                            "shadow-sm",
                            isSelected
                              ? "border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110"
                              : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 group-hover:scale-105"
                          )}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-75 duration-200" />
                          )}
                          
                          {/* Ripple effect for selected state */}
                          {isSelected && (
                            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20" />
                          )}
                        </div>
                      </div>
                      
                      {/* Subtle border glow */}
                      <div
                        className={cn(
                          "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none",
                          isSelected
                            ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-100"
                            : "bg-gradient-to-r from-emerald-500/0 to-teal-500/0 opacity-0 group-hover:opacity-50"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preferences