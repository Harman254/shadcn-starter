import GroceryListButton from "@/components/groceries-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { fetchMealPlanById } from "@/data"
import {
  Utensils,
  ChevronRight,
  Info,
  ChevronLeft,
  ArrowLeft,
  Flame,
  Users,
  Target,
  TrendingUp,
  Star,
  Heart,
  Share2,
} from "lucide-react"

// TypeScript types
type MealType = string

type Meal = {
  id: string
  type: MealType
  name: string
  description: string
  ingredients: string[]
  calories: number
  dayMealId: string
}

type DayMeal = {
  id: string
  date: Date
  mealPlanId: string
  meals: Meal[]
}

type MealPlan = {
  id: string
  duration: number
  mealsPerDay: number
  createdAt: Date
  days: DayMeal[]
}

type MealPlanDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export const force = "force-cache"

const MealPlanDetailPage = async ({ params }: MealPlanDetailPageProps) => {
  const { id } = await params
  const mealPlan: MealPlan | null = await fetchMealPlanById(id)

  if (!mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Meal Plan Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The requested meal plan could not be found or may have been deleted.
            </p>
            <Button asChild className="w-full">
              <a href="/meal-plans">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Meal Plans
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0,
  )
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/10 to-muted/20 dark:from-muted/900/10 dark:to-muted/900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
                      <Utensils className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-bold mb-2">Your Meal Plan</h1>
                      <p className="text-emerald-100 text-lg">Personalized nutrition for your fitness journey</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <GroceryListButton mealplanId={mealPlan.id} />
                  <Button variant="secondary" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Plan
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Quick Stats Bar */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mealPlan.duration}</div>
                    <div className="text-emerald-100 text-sm">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mealPlan.mealsPerDay}</div>
                    <div className="text-emerald-100 text-sm">Meals/Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{avgCaloriesPerDay}</div>
                    <div className="text-emerald-100 text-sm">Avg Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{mealPlan.days.length}</div>
                    <div className="text-emerald-100 text-sm">Total Days</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: Target,
              label: "Plan Duration",
              value: `${mealPlan.duration} days`,
              subtext: "Total program length",
              color: "text-blue-600",
              bgColor: "bg-blue-50 dark:bg-blue-950/50",
            },
            {
              icon: Utensils,
              label: "Daily Meals",
              value: mealPlan.mealsPerDay.toString(),
              subtext: "Meals per day",
              color: "text-emerald-600",
              bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
            },
            {
              icon: Flame,
              label: "Daily Average",
              value: `${avgCaloriesPerDay}`,
              subtext: "calories per day",
              color: "text-orange-600",
              bgColor: "bg-orange-50 dark:bg-orange-950/50",
            },
            {
              icon: TrendingUp,
              label: "Total Calories",
              value: `${totalPlanCalories.toLocaleString()}`,
              subtext: "across all days",
              color: "text-purple-600",
              bgColor: "bg-purple-50 dark:bg-purple-950/50",
            },
          ].map(({ icon: Icon, label, value, subtext, color, bgColor }, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-lg ${bgColor} mb-4`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">{label}</h3>
                <p className="text-2xl font-bold mb-1">{value}</p>
                <p className="text-xs text-muted-foreground">{subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Timeline */}
        <Card className="mb-8">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Calendar Timeline</h2>
            <p className="text-muted-foreground">Click any day to jump to its meals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 p-4 pb-6">
            {mealPlan.days.map((day: DayMeal, index: number) => {
              const date = new Date(day.date);
              const isToday = new Date().toDateString() === date.toDateString();
              const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);

              return (
                <a
                  key={day.id}
                  href={`#day-${day.id}`}
                  className={`flex-shrink-0 w-24 p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
                    isToday
                      ? "bg-emerald-600 text-white shadow-lg"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent hover:border-emerald-200"
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-medium opacity-75">
                      {date.toLocaleDateString(undefined, { weekday: "short" })}
                    </p>
                    <p className="text-xl font-bold">{date.getDate()}</p>
                    <p className="text-xs opacity-75">{date.toLocaleDateString(undefined, { month: "short" })}</p>
                    <Badge variant={isToday ? "secondary" : "outline"} className="text-xs">
                      {totalCalories} cal
                    </Badge>
                  </div>
                </a>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>

        {/* Daily Meal Plans */}
        <div className="space-y-8">
          {mealPlan.days.map((day: DayMeal, dayIndex: number) => (
            <Card key={day.id} id={`day-${day.id}`} className="overflow-hidden scroll-mt-24">
              {/* Day Header */}
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg">
                      {dayIndex + 1}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {new Date(day.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <p className="text-muted-foreground">
                        {day.meals.length} meals • {day.meals.reduce((sum, meal) => sum + meal.calories, 0)} total
                        calories
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      <Utensils className="h-3 w-3 mr-1" />
                      {day.meals.length} meals
                    </Badge>
                    <Badge className="bg-emerald-600">
                      <Flame className="h-3 w-3 mr-1" />
                      {day.meals.reduce((sum, meal) => sum + meal.calories, 0)} cal
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              {/* Meals Grid */}
              <CardContent className="p-0">
                <div className="divide-y">
                  {day.meals.map((meal: Meal) => {
                    const mealTypeColors = {
                      breakfast: "bg-yellow-50 border-l-yellow-400 dark:bg-yellow-950/20",
                      lunch: "bg-emerald-50 border-l-emerald-400 dark:bg-emerald-950/20",
                      dinner: "bg-blue-50 border-l-blue-400 dark:bg-blue-950/20",
                      snack: "bg-purple-50 border-l-purple-400 dark:bg-purple-950/20",
                      default: "bg-slate-50 border-l-slate-400 dark:bg-slate-950/20",
                    }

                    const mealTypeBadges = {
                      breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
                      lunch: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
                      dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
                      snack: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
                      default: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
                    }

                    const mealType = meal.type?.toLowerCase() || "default"
                    const bgColor = mealTypeColors[mealType as keyof typeof mealTypeColors] || mealTypeColors.default
                    const badgeColor = mealTypeBadges[mealType as keyof typeof mealTypeBadges] || mealTypeBadges.default

                    return (
                      <div key={meal.id} className={`p-6 border-l-4 ${bgColor} hover:bg-opacity-80 transition-colors`}>
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            {/* Meal Header */}
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge className={badgeColor}>{meal.type}</Badge>
                              <Badge variant="outline">
                                <Flame className="h-3 w-3 mr-1" />
                                {meal.calories} cal
                              </Badge>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                                4.8
                              </div>
                            </div>

                            {/* Meal Content */}
                            <div>
                              <h3 className="text-lg font-bold mb-2">{meal.name}</h3>
                              <p className="text-muted-foreground leading-relaxed">{meal.description}</p>
                            </div>

                            {/* Ingredients */}
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                Ingredients ({meal.ingredients.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {meal.ingredients.slice(0, 6).map((ingredient, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {meal.ingredients.length > 6 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{meal.ingredients.length - 6} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 lg:min-w-[160px]">
                            <Button className="w-full">View Recipe</Button>
                            <Button variant="outline" className="w-full">
                              Swap Meal
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MealPlanDetailPage
