'use client'
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
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
  BarChart3,
  Activity,
  Award,
  Crown,
  Zap,
  Trophy,
  BookOpen,
} from "lucide-react"
import MenuBar from "./Menubar"

// Add prop types for AnalyticsDashboard
interface AnalyticsDashboardProps {
  user: { id?: string } | null;
  analytics?: {
    totalMealsCooked?: number;
    totalRecipesTried?: number;
    averageCookTime?: number;
    favoriteRecipes?: number;
  } | null;
  account?: { isPro?: boolean } | null;
}

const AnalyticsDashboard = ({ user, analytics, account }: AnalyticsDashboardProps) => {
  const [selectedTab, setSelectedTab] = useState<string>("overview")

  // Provide default values to prevent runtime errors
  const safeAnalytics = {
    totalMealsCooked: analytics?.totalMealsCooked || 0,
    totalRecipesTried: analytics?.totalRecipesTried || 0,
    averageCookTime: analytics?.averageCookTime || 0,
    favoriteRecipes: analytics?.favoriteRecipes || 0,
  }

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your analytics dashboard.</p>
            <Button aria-label="Sign In">Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Start Your Journey</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              No analytics data found yet. Start saving meal plans and cooking recipes to see your personalized insights
              and achievements!
            </p>
            <Button className="bg-green-600 hover:bg-green-700 text-white" aria-label="Create Your First Meal Plan"> 
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
  ].filter((b) => safeAnalytics.totalMealsCooked >= b.count)

  const recipeBadges = [
    { count: 5, label: "Recipe Explorer", icon: <BookOpen className="h-4 w-4" />, color: "bg-purple-500" },
    { count: 20, label: "Culinary Adventurer", icon: <Trophy className="h-4 w-4" />, color: "bg-indigo-500" },
    { count: 50, label: "Master Chef", icon: <ChefHat className="h-4 w-4" />, color: "bg-orange-500" },
  ].filter((b) => safeAnalytics.totalRecipesTried >= b.count)

  // Motivational message
  let motivation = {
    title: "Keep Going Strong! 💪",
    message: "Every meal you cook is a step toward mastering your culinary journey.",
  }

  if (safeAnalytics.totalMealsCooked >= 100) {
    motivation = {
      title: "Meal Master Achieved! 🏆",
      message: "Incredible consistency and dedication to your cooking goals.",
    }
  } else if (safeAnalytics.totalMealsCooked >= 50) {
    motivation = {
      title: "Amazing Progress! 🌟",
      message: "50+ meals cooked shows real commitment to your culinary journey.",
    }
  } else if (safeAnalytics.totalMealsCooked >= 10) {
    motivation = {
      title: "Great Start! 🚀",
      message: "You're building excellent cooking habits. Keep it up!",
    }
  }

  // Helper function for change icons
  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-emerald-600" />
    } else if (change < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    } else {
      return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        {/* Pro Banner or Upgrade CTA */}
        {account?.isPro ? (
          <Card className="mb-6 sm:mb-8 border-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-center gap-3">
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold">MealWise Pro Member</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">
                    Thank you for supporting us! Enjoy unlimited access to all premium features.
                  </p>
                </div>
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 sm:mb-8 border-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 text-white shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Unlock Premium Insights</h3>
                    <p className="text-orange-100 text-xs sm:text-sm">
                      Get advanced analytics, meal recommendations, and exclusive features
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md text-sm"
                  aria-label="Upgrade to Pro"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        <Card className="mb-6 sm:mb-8 border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-l-4 border-l-green-500">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">{motivation.title}</h3>
                <p className="text-sm sm:text-base text-green-700 dark:text-green-300">{motivation.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Badges */}
        {(mealBadges.length > 0 || recipeBadges.length > 0) && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {mealBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    className={`${badge.color} text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-md`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {badge.icon}
                      <span className="hidden sm:inline">{badge.label}</span>
                      <span className="sm:hidden">{badge.label.split(' ')[0]}</span>
                    </div>
                  </Badge>
                ))}
                {recipeBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    className={`${badge.color} text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-md`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {badge.icon}
                      <span className="hidden sm:inline">{badge.label}</span>
                      <span className="sm:hidden">{badge.label.split(' ')[0]}</span>
                    </div>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="tracking-tighter text-lg sm:text-xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-foreground/90 to-rose-500 font-bold">
                  MealWise
                </span>
                <span className="text-foreground"> Analytics</span>
              </h1>
              <p className="text-sm sm:text-lg text-muted-foreground mt-1">
                Insights into your culinary journey and meal planning success
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Wrapper Start */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <MenuBar selected={selectedTab} onSelect={setSelectedTab} pro={account?.isPro} />

          <TabsContent value="overview" className="space-y-6 sm:space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Total Meals
                  </CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{safeAnalytics.totalMealsCooked}</div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    {getChangeIcon(5)}
                    <span className="text-emerald-600 font-medium">+12% from last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Recipes Tried
                  </CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{safeAnalytics.totalRecipesTried}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">New recipes discovered</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Avg Cook Time
                  </CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {safeAnalytics.averageCookTime}
                    <span className="text-base sm:text-lg text-muted-foreground">min</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Per meal preparation</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Favorites
                  </CardTitle>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{safeAnalytics.favoriteRecipes}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">Recipes you loved</p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Monthly Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Meals Cooked</span>
                      <span className="text-sm font-semibold text-foreground">15/20</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">New Recipes</span>
                      <span className="text-sm font-semibold text-foreground">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-foreground">Healthy Meals</span>
                      <span className="text-sm font-semibold text-foreground">12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Utensils className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">Cooked Chicken Stir Fry</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">Saved Mediterranean Bowl</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">Favorited Pasta Recipe</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent> 

          <TabsContent value="achievements" className="space-y-6 sm:space-y-8">
            {(mealBadges.length > 0 || recipeBadges.length > 0) ? (
              <Card className="mb-6 sm:mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    Your Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {mealBadges.map((badge) => (
                      <Badge
                        key={badge.label}
                        className={`${badge.color} text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-md`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {badge.icon}
                          {badge.label}
                        </div>
                      </Badge>
                    ))}
                    {recipeBadges.map((badge) => (
                      <Badge
                        key={badge.label}
                        className={`${badge.color} text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-md`}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {badge.icon}
                          {badge.label}
                        </div>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-8">No achievements yet. Start cooking to earn badges!</div>
            )}
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6 sm:space-y-8">
            {account?.isPro ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Apple className="mx-auto mb-4 h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                  <div className="text-lg sm:text-xl font-semibold mb-2">Nutrition Analytics</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Advanced nutrition analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-8">Upgrade to Pro to access nutrition analytics.</div>
            )}
          </TabsContent>

          <TabsContent value="planning" className="space-y-6 sm:space-y-8">
            {account?.isPro ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <Calendar className="mx-auto mb-4 h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                  <div className="text-lg sm:text-xl font-semibold mb-2">Meal Planning Insights</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Advanced planning analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-8">Upgrade to Pro to access planning analytics.</div>
            )}
          </TabsContent>

          <TabsContent value="recipes" className="space-y-6 sm:space-y-8">
            {account?.isPro ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <ChefHat className="mx-auto mb-4 h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                  <div className="text-lg sm:text-xl font-semibold mb-2">Recipe Analytics</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Advanced recipe analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-8">Upgrade to Pro to access recipe analytics.</div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6 sm:space-y-8">
            {account?.isPro ? (
              <Card>
                <CardContent className="p-6 sm:p-8 text-center">
                  <TrendingUp className="mx-auto mb-4 h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                  <div className="text-lg sm:text-xl font-semibold mb-2">Trends & Insights</div>
                  <div className="text-sm sm:text-base text-muted-foreground">Trends analytics coming soon for Pro users!</div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-muted-foreground p-8">Upgrade to Pro to access trends analytics.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AnalyticsDashboard

