import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  Activity,
  Award,
  Star,
  Crown,
  Zap,
  Trophy,
  Timer,
  BookOpen,
} from "lucide-react"

export default async function AnalyticsDashboard() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sign In Required</h2>
            <p className="text-slate-600 mb-4">Please sign in to view your analytics dashboard.</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userId = session.user.id
  const analytics = await prisma.userAnalytics.findUnique({ where: { userId } })
  const account = await prisma.account.findFirst({ where: { userId }, select: { isPro: true } })

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Start Your Journey</h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              No analytics data found yet. Start saving meal plans and cooking recipes to see your personalized insights
              and achievements!
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              <Utensils className="mr-2 h-4 w-4" />
              Create Your First Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Milestone badges
  const mealBadges = [
    { count: 10, label: "First 10 Meals", icon: <Utensils className="h-4 w-4" />, color: "bg-green-500" },
    { count: 50, label: "Half Century", icon: <Trophy className="h-4 w-4" />, color: "bg-blue-500" },
    { count: 100, label: "Centurion Chef", icon: <Crown className="h-4 w-4" />, color: "bg-yellow-500" },
  ].filter((b) => analytics.totalMealsCooked >= b.count)

  const recipeBadges = [
    { count: 5, label: "Recipe Explorer", icon: <BookOpen className="h-4 w-4" />, color: "bg-purple-500" },
    { count: 20, label: "Culinary Adventurer", icon: <Trophy className="h-4 w-4" />, color: "bg-indigo-500" },
    { count: 50, label: "Master Chef", icon: <ChefHat className="h-4 w-4" />, color: "bg-orange-500" },
  ].filter((b) => analytics.totalRecipesTried >= b.count)

  // Motivational message
  let motivation = {
    title: "Keep Going Strong! 💪",
    message: "Every meal you cook is a step toward mastering your culinary journey.",
  }

  if (analytics.totalMealsCooked >= 100) {
    motivation = {
      title: "Meal Master Achieved! 🏆",
      message: "Incredible consistency and dedication to your cooking goals.",
    }
  } else if (analytics.totalMealsCooked >= 50) {
    motivation = {
      title: "Amazing Progress! 🌟",
      message: "50+ meals cooked shows real commitment to your culinary journey.",
    }
  } else if (analytics.totalMealsCooked >= 10) {
    motivation = {
      title: "Great Start! 🚀",
      message: "You're building excellent cooking habits. Keep it up!",
    }
  }

  // Helper functions
  const getChangeIcon = (change: number) => {
    return change > 0 ? (
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    ) : change < 0 ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <Activity className="h-4 w-4 text-slate-400" />
    )
  }

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    if (percentage >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Pro Banner or Upgrade CTA */}
        {account?.isPro ? (
          <Card className="mb-8 border-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 dark:text-zinc-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <Crown className="h-6 w-6" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">MealWise Pro Member</h3>
                  <p className="text-emerald-100 text-sm dark:text-zinc-300">
                    Thank you for supporting us! Enjoy unlimited access to all premium features.
                  </p>
                </div>
                <Crown className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-white shadow-xl dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 dark:text-zinc-100">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-semibold">Unlock Premium Insights</h3>
                    <p className="text-orange-100 text-sm dark:text-zinc-300">
                      Get advanced analytics, meal recommendations, and exclusive features
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md dark:bg-zinc-700 dark:text-yellow-400 dark:hover:bg-zinc-600"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500 dark:from-zinc-800 dark:to-zinc-900 dark:border-l-zinc-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center dark:bg-zinc-700">
                <Heart className="h-6 w-6 text-green-600 dark:text-zinc-200" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 dark:text-zinc-100">{motivation.title}</h3>
                <p className="text-green-700 dark:text-zinc-300">{motivation.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badges */}
        {(mealBadges.length > 0 || recipeBadges.length > 0) && (
          <Card className="mb-8 dark:bg-zinc-800 dark:text-zinc-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {mealBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    className={`${badge.color} text-white px-4 py-2 text-sm font-medium shadow-md dark:bg-zinc-700 dark:text-zinc-100`}
                  >
                    <div className="flex items-center gap-2">
                      {badge.icon}
                      {badge.label}
                    </div>
                  </Badge>
                ))}
                {recipeBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    className={`${badge.color} text-white px-4 py-2 text-sm font-medium shadow-md dark:bg-zinc-700 dark:text-zinc-100`}
                  >
                    <div className="flex items-center gap-2">
                      {badge.icon}
                      {badge.label}
                    </div>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center dark:from-zinc-700 dark:to-zinc-900">
              <BarChart3 className="h-6 w-6 text-white dark:text-zinc-200" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Meal<span className="text-green-600 dark:text-green-400">Wise</span> Analytics
              </h1>
              <p className="text-lg text-slate-600 mt-1 dark:text-zinc-400">
                Insights into your culinary journey and meal planning success
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5 h-12 bg-slate-100 p-1 rounded-lg dark:bg-zinc-800">
            <TabsTrigger value="overview" className="text-sm font-medium">
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-sm font-medium">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="text-sm font-medium" disabled={!account?.isPro}>
              Nutrition {account?.isPro ? null : <span className="ml-1 text-xs text-zinc-400">Pro</span>}
            </TabsTrigger>
            <TabsTrigger value="planning" className="text-sm font-medium" disabled={!account?.isPro}>
              Planning {account?.isPro ? null : <span className="ml-1 text-xs text-zinc-400">Pro</span>}
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-sm font-medium" disabled={!account?.isPro}>
              Recipes {account?.isPro ? null : <span className="ml-1 text-xs text-zinc-400">Pro</span>}
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-sm font-medium" disabled={!account?.isPro}>
              Trends {account?.isPro ? null : <span className="ml-1 text-xs text-zinc-400">Pro</span>}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - for all users */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Meals
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{analytics.totalMealsCooked}</div>
                  <div className="flex items-center gap-2 text-sm">
                    {getChangeIcon(5)}
                    <span className="text-emerald-600 font-medium">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Recipes Tried
                  </CardTitle>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{analytics.totalRecipesTried}</div>
                  <p className="text-sm text-slate-500 font-medium">New recipes discovered</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Avg Cook Time
                  </CardTitle>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {analytics.averageCookTime}
                    <span className="text-lg text-slate-500">min</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Per meal preparation</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Favorites
                  </CardTitle>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-2">{analytics.favoriteRecipes}</div>
                  <p className="text-sm text-slate-500 font-medium">Recipes you loved</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Monthly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Meals Cooked</span>
                      <span className="text-sm font-semibold text-slate-900">15/20</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">New Recipes</span>
                      <span className="text-sm font-semibold text-slate-900">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Healthy Meals</span>
                      <span className="text-sm font-semibold text-slate-900">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Utensils className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Cooked Chicken Stir Fry</p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Saved Mediterranean Bowl</p>
                        <p className="text-xs text-slate-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Heart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Favorited Pasta Recipe</p>
                        <p className="text-xs text-slate-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab - for all users */}
          <TabsContent value="achievements" className="space-y-8">
            {(mealBadges.length > 0 || recipeBadges.length > 0) ? (
              <Card className="mb-8 dark:bg-zinc-800 dark:text-zinc-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {mealBadges.map((badge) => (
                      <Badge
                        key={badge.label}
                        className={`${badge.color} text-white px-4 py-2 text-sm font-medium shadow-md dark:bg-zinc-700 dark:text-zinc-100`}
                      >
                        <div className="flex items-center gap-2">
                          {badge.icon}
                          {badge.label}
                        </div>
                      </Badge>
                    ))}
                    {recipeBadges.map((badge) => (
                      <Badge
                        key={badge.label}
                        className={`${badge.color} text-white px-4 py-2 text-sm font-medium shadow-md dark:bg-zinc-700 dark:text-zinc-100`}
                      >
                        <div className="flex items-center gap-2">
                          {badge.icon}
                          {badge.label}
                        </div>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-zinc-400 dark:text-zinc-500">No achievements yet. Start cooking to earn badges!</div>
            )}
          </TabsContent>

          {/* Pro-only Tabs with placeholders if not dynamic */}
          <TabsContent value="nutrition" className="space-y-8">
            {account?.isPro ? (
              <Card className="dark:bg-zinc-800 dark:text-zinc-100">
                <CardContent className="p-8 text-center">
                  <Apple className="mx-auto mb-4 h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-xl font-semibold mb-2">Nutrition Analytics</div>
                  <div className="text-zinc-500 dark:text-zinc-400">Advanced nutrition analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
          <TabsContent value="planning" className="space-y-8">
            {account?.isPro ? (
              <Card className="dark:bg-zinc-800 dark:text-zinc-100">
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto mb-4 h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-xl font-semibold mb-2">Meal Planning Insights</div>
                  <div className="text-zinc-500 dark:text-zinc-400">Advanced planning analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
          <TabsContent value="recipes" className="space-y-8">
            {account?.isPro ? (
              <Card className="dark:bg-zinc-800 dark:text-zinc-100">
                <CardContent className="p-8 text-center">
                  <ChefHat className="mx-auto mb-4 h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-xl font-semibold mb-2">Recipe Analytics</div>
                  <div className="text-zinc-500 dark:text-zinc-400">Advanced recipe analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
          <TabsContent value="trends" className="space-y-8">
            {account?.isPro ? (
              <Card className="dark:bg-zinc-800 dark:text-zinc-100">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="mx-auto mb-4 h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="text-xl font-semibold mb-2">Trends & Insights</div>
                  <div className="text-zinc-500 dark:text-zinc-400">Trends analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
