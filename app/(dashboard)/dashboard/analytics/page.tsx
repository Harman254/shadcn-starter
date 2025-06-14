"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Utensils,
  Heart,
  ChefHat,
  Target,
  Apple,
  Flame,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Users,
  Star,
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalMealsCooked: number
    totalRecipesTried: number
    averageCookTime: number
    favoriteRecipes: number
    weeklyMealPlanCompletion: number
    caloriesThisWeek: number
    targetCalories: number
  }
  nutrition: {
    dailyCalories: number[]
    macros: {
      protein: number
      carbs: number
      fats: number
    }
    weeklyNutritionScore: number
    hydrationGoal: number
    hydrationActual: number
  }
  mealPlanning: {
    plannedVsActual: {
      planned: number
      actual: number
    }
    mealPrepFrequency: {
      breakfast: number
      lunch: number
      dinner: number
      snacks: number
    }
    cuisinePreferences: Array<{
      cuisine: string
      percentage: number
      count: number
    }>
  }
  recipes: {
    topPerforming: Array<{
      id: string
      name: string
      rating: number
      cookCount: number
      avgCookTime: number
      difficulty: string
      image: string
    }>
    recentActivity: Array<{
      action: string
      recipe: string
      date: string
      rating?: number
    }>
  }
  trends: {
    weeklyStats: Array<{
      week: string
      mealsCooked: number
      recipesDiscovered: number
      avgRating: number
    }>
    monthlyComparison: {
      thisMonth: number
      lastMonth: number
      change: number
    }
  }
}

// Mock analytics data
const mockAnalyticsData: AnalyticsData = {
  overview: {
    totalMealsCooked: 127,
    totalRecipesTried: 43,
    averageCookTime: 32,
    favoriteRecipes: 18,
    weeklyMealPlanCompletion: 85,
    caloriesThisWeek: 12450,
    targetCalories: 14000,
  },
  nutrition: {
    dailyCalories: [1850, 2100, 1950, 2200, 1800, 2050, 1900],
    macros: {
      protein: 25,
      carbs: 45,
      fats: 30,
    },
    weeklyNutritionScore: 87,
    hydrationGoal: 8,
    hydrationActual: 6.5,
  },
  mealPlanning: {
    plannedVsActual: {
      planned: 21,
      actual: 18,
    },
    mealPrepFrequency: {
      breakfast: 85,
      lunch: 70,
      dinner: 95,
      snacks: 40,
    },
    cuisinePreferences: [
      { cuisine: "Italian", percentage: 28, count: 12 },
      { cuisine: "Asian", percentage: 22, count: 9 },
      { cuisine: "Mediterranean", percentage: 18, count: 8 },
      { cuisine: "American", percentage: 15, count: 6 },
      { cuisine: "Mexican", percentage: 10, count: 4 },
      { cuisine: "Other", percentage: 7, count: 4 },
    ],
  },
  recipes: {
    topPerforming: [
      {
        id: "1",
        name: "Creamy Garlic Pasta",
        rating: 4.9,
        cookCount: 8,
        avgCookTime: 25,
        difficulty: "Easy",
        image: "/placeholder.svg?height=60&width=60",
      },
      {
        id: "2",
        name: "Honey Glazed Salmon",
        rating: 4.8,
        cookCount: 6,
        avgCookTime: 20,
        difficulty: "Medium",
        image: "/placeholder.svg?height=60&width=60",
      },
      {
        id: "3",
        name: "Thai Green Curry",
        rating: 4.7,
        cookCount: 5,
        avgCookTime: 35,
        difficulty: "Hard",
        image: "/placeholder.svg?height=60&width=60",
      },
    ],
    recentActivity: [
      { action: "Cooked", recipe: "Mediterranean Quinoa Bowl", date: "2024-01-15", rating: 5 },
      { action: "Liked", recipe: "BBQ Pulled Pork", date: "2024-01-14" },
      { action: "Cooked", recipe: "Chocolate Chip Cookies", date: "2024-01-13", rating: 4 },
      { action: "Saved", recipe: "Vegetarian Tacos", date: "2024-01-12" },
      { action: "Cooked", recipe: "Creamy Garlic Pasta", date: "2024-01-11", rating: 5 },
    ],
  },
  trends: {
    weeklyStats: [
      { week: "Week 1", mealsCooked: 18, recipesDiscovered: 5, avgRating: 4.2 },
      { week: "Week 2", mealsCooked: 21, recipesDiscovered: 7, avgRating: 4.5 },
      { week: "Week 3", mealsCooked: 19, recipesDiscovered: 4, avgRating: 4.3 },
      { week: "Week 4", mealsCooked: 23, recipesDiscovered: 8, avgRating: 4.6 },
    ],
    monthlyComparison: {
      thisMonth: 127,
      lastMonth: 98,
      change: 29.6,
    },
  },
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("week")

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setData(mockAnalyticsData)
      setLoading(false)
    }

    fetchAnalytics()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getChangeIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl tracking-tight font-bold">Meal<span className="text-green-500">Wise</span> Analytics</h1>
        </div>
        <p className="text-muted-foreground">Insights into your cooking journey and meal planning habits</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {["week", "month", "quarter"].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meals Cooked</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.totalMealsCooked}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  {getChangeIcon(data.trends.monthlyComparison.change)}
                  <span>+{data.trends.monthlyComparison.change.toFixed(1)}% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recipes Tried</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.totalRecipesTried}</div>
                <p className="text-xs text-muted-foreground">New recipes discovered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Cook Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.averageCookTime}m</div>
                <p className="text-xs text-muted-foreground">Per meal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorite Recipes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.overview.favoriteRecipes}</div>
                <p className="text-xs text-muted-foreground">Recipes you loved</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Weekly Meal Plan Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{data.overview.weeklyMealPlanCompletion}%</span>
                  </div>
                  <Progress value={data.overview.weeklyMealPlanCompletion} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round((data.overview.weeklyMealPlanCompletion / 100) * 21)} of 21 planned meals completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Weekly Calorie Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Calories</span>
                    <span>
                      {data.overview.caloriesThisWeek.toLocaleString()} /{" "}
                      {data.overview.targetCalories.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={(data.overview.caloriesThisWeek / data.overview.targetCalories) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.overview.targetCalories - data.overview.caloriesThisWeek} calories remaining this week
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Daily Calories This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(data.nutrition.dailyCalories[index] / 2500) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {data.nutrition.dailyCalories[index]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Macronutrient Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-sm">Protein</span>
                    </div>
                    <span className="text-sm font-medium">{data.nutrition.macros.protein}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Carbs</span>
                    </div>
                    <span className="text-sm font-medium">{data.nutrition.macros.carbs}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Fats</span>
                    </div>
                    <span className="text-sm font-medium">{data.nutrition.macros.fats}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Nutrition Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{data.nutrition.weeklyNutritionScore}</div>
                  <p className="text-sm text-muted-foreground">Weekly nutrition score</p>
                  <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                    Excellent
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hydration Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Average</span>
                    <span>
                      {data.nutrition.hydrationActual} / {data.nutrition.hydrationGoal} glasses
                    </span>
                  </div>
                  <Progress
                    value={(data.nutrition.hydrationActual / data.nutrition.hydrationGoal) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.nutrition.hydrationGoal - data.nutrition.hydrationActual} more glasses to reach daily goal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Planned vs Actual Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Planned Meals</span>
                    <span className="text-2xl font-bold">{data.mealPlanning.plannedVsActual.planned}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Actual Meals</span>
                    <span className="text-2xl font-bold text-green-600">
                      {data.mealPlanning.plannedVsActual.actual}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (data.mealPlanning.plannedVsActual.actual / data.mealPlanning.plannedVsActual.planned) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Meal Prep Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(data.mealPlanning.mealPrepFrequency).map(([meal, percentage]) => (
                    <div key={meal} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{meal}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cuisine Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.mealPlanning.cuisinePreferences.map((cuisine) => (
                  <div key={cuisine.cuisine} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">{cuisine.percentage}%</div>
                    <div className="text-sm font-medium mb-1">{cuisine.cuisine}</div>
                    <div className="text-xs text-muted-foreground">{cuisine.count} recipes</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recipes Tab */}
        <TabsContent value="recipes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performing Recipes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recipes.topPerforming.map((recipe, index) => (
                    <div key={recipe.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={recipe.image || "/placeholder.svg"} alt={recipe.name} />
                        <AvatarFallback>{recipe.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{recipe.name}</div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>★ {recipe.rating}</span>
                          <span>{recipe.cookCount} times cooked</span>
                          <span>{recipe.avgCookTime}m avg</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recipes.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium">{activity.action}</span>
                        <span className="text-muted-foreground"> {activity.recipe}</span>
                        {activity.rating && <span className="text-yellow-600"> (★ {activity.rating})</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Cooking Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.trends.weeklyStats.map((week, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Week</div>
                      <div className="font-medium">{week.week}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Meals</div>
                      <div className="font-medium">{week.mealsCooked}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">New Recipes</div>
                      <div className="font-medium">{week.recipesDiscovered}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Avg Rating</div>
                      <div className="font-medium">★ {week.avgRating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.trends.monthlyComparison.thisMonth}</div>
                <p className="text-xs text-muted-foreground">meals cooked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Last Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.trends.monthlyComparison.lastMonth}</div>
                <p className="text-xs text-muted-foreground">meals cooked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <div className="text-2xl font-bold text-green-600">
                    +{data.trends.monthlyComparison.change.toFixed(1)}%
                  </div>
                  {getChangeIcon(data.trends.monthlyComparison.change)}
                </div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
