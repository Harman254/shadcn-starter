"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ProfileForm } from "./ProfileForm"
import {
  CreditCard,
  Settings,
  User,
  Bell,
  Shield,
  Download,
  Calendar,
  Activity,
  TrendingUp,
  Mail,
  CheckCircle,
  XCircle,
  Crown,
  Globe,
  Banknote,
  Utensils,
  Target,
  ChefHat,
  Heart,
  Clock,
  Award,
  Zap,
  BarChart3,
  Apple,
  Dumbbell,
  Leaf,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [mealStatsData, setMealStatsData] = useState({
    totalPlans: 0,
    totalMeals: 0,
    averageRating: 4.8,
    streakDays: 12,
    caloriesGoal: 2000,
    currentCalories: 1850,
    nutritionScore: 92,
    favoriteRecipes: 8,
  })

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) throw new Error("Failed to fetch user profile")
        const data = await res.json()
        setUser(data.user)
        setSubscription(data.user?.Subscription || null)
        
        // Fetch meal planning stats
        const statsRes = await fetch("/api/getmealplans")
        if (statsRes.ok) {
          const mealPlans = await statsRes.json()
                  setMealStatsData(prev => ({
          ...prev,
          totalPlans: mealPlans.length || 0,
          totalMeals: mealPlans.reduce((acc: number, plan: any) => acc + (plan.days?.length || 0) * (plan.mealsPerDay || 3), 0),
        }))
        }
      } catch (err: any) {
        setError(err.message || "Unknown error")
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="text-gray-300">Loading your nutrition profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-gray-900 to-pink-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-red-300 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="h-12 w-12 text-gray-600 mx-auto" />
          <p className="text-gray-300">You must be signed in to view your profile.</p>
        </div>
      </div>
    )
  }

  const mealStats = [
    { 
      label: "Meal Plans Created", 
      value: mealStatsData.totalPlans.toString(), 
      icon: ChefHat, 
      color: "from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-700",
      subtitle: "Total plans generated"
    },
    { 
      label: "Meals Planned", 
      value: mealStatsData.totalMeals.toString(), 
      icon: Utensils, 
      color: "from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-700",
      subtitle: "Individual meals created"
    },
    { 
      label: "Nutrition Score", 
      value: `${mealStatsData.nutritionScore}%`, 
      icon: Target, 
      color: "from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-700",
      subtitle: "Average meal quality"
    },
    { 
      label: "Planning Streak", 
      value: `${mealStatsData.streakDays} days`, 
      icon: Zap, 
      color: "from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-700",
      subtitle: "Consecutive days"
    },
  ]

  const recentAchievements = [
    { title: "First Meal Plan", description: "Created your first personalized meal plan", icon: Star, color: "text-yellow-500" },
    { title: "Nutrition Master", description: "Achieved 90%+ nutrition score for 5 plans", icon: Award, color: "text-purple-500" },
    { title: "Consistency King", description: "Maintained 10+ day planning streak", icon: Zap, color: "text-orange-500" },
    { title: "Variety Explorer", description: "Tried 20+ different recipes", icon: Leaf, color: "text-green-500" },
  ]

  const nutritionGoals = [
    { label: "Daily Calories", current: mealStatsData.currentCalories, target: mealStatsData.caloriesGoal, unit: "kcal", color: "from-red-500 to-red-600" },
    { label: "Protein", current: 85, target: 120, unit: "g", color: "from-blue-500 to-blue-600" },
    { label: "Carbs", current: 220, target: 250, unit: "g", color: "from-yellow-500 to-yellow-600" },
    { label: "Fats", current: 65, target: 70, unit: "g", color: "from-green-500 to-green-600" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-teal-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-800 p-8 mb-8 text-white dark:text-white">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 ring-4 ring-white/30 shadow-2xl">
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl font-bold bg-white/20 text-white backdrop-blur-sm">
                {user.name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/90 text-lg mb-3">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  {subscription?.plan || "Free Plan"}
                </Badge>
                <span className="text-white/80 text-sm">
                  Meal planning since {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{mealStatsData.nutritionScore}%</div>
                <div className="text-sm text-white/80">Nutrition Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{mealStatsData.streakDays}</div>
                <div className="text-sm text-white/80">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {mealStats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 hover:scale-105 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`}></div>
              <CardContent className="p-6 text-center relative z-10">
                <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${stat.color} mb-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.subtitle}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nutrition Goals */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Today's Nutrition Goals
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Track your daily nutrition targets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nutritionGoals.map((goal, index) => {
                  const percentage = Math.min((goal.current / goal.target) * 100, 100)
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{goal.label}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${goal.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
                <Button className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Recent Achievements
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Celebrate your nutrition milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                      <div className={`p-2 rounded-full bg-white dark:bg-slate-600 shadow-sm`}>
                        <achievement.icon className={`h-5 w-5 ${achievement.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Personal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Email Status</p>
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{user.emailVerified ? "Verified" : "Not Verified"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Two-Factor Auth</p>
                        <div className="flex items-center gap-2">
                          {user.twoFactorEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">{user.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                    </div>

                    {user.Account?.isPro !== undefined && (
                      <div className="flex items-center gap-3">
                        <Crown className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Pro Account</p>
                          <div className="flex items-center gap-2">
                            {user.Account.isPro ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{user.Account.isPro ? "Active" : "Inactive"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {user.country && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Location</p>
                          <p className="text-sm">{user.city ? `${user.city}, ${user.country}` : user.country}</p>
                        </div>
                      </div>
                    )}

                    {user.currencyCode && (
                      <div className="flex items-center gap-3">
                        <Banknote className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Currency</p>
                          <p className="text-sm">
                            {user.currencySymbol} {user.currencyCode}
                          </p>
                        </div>
                      </div>
                    )}

                    {user.Account?.isOnboardingComplete !== undefined && (
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Onboarding</p>
                          <div className="flex items-center gap-2">
                            {user.Account.isOnboardingComplete ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {user.Account.isOnboardingComplete ? "Complete" : "Incomplete"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Subscription */}
            {subscription && (
              <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Subscription
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">Your current plan and billing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 rounded-xl">
                    <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-700 mb-4">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{subscription.plan}</h3>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 mb-3">{subscription.price}</p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Plan Features</h4>
                    <div className="space-y-2">
                      {subscription.features?.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Next Billing</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{subscription.nextBilling}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      Update Payment Method
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setShowEditModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <ChefHat className="h-4 w-4 mr-2" />
                  Create New Meal Plan
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Heart className="h-4 w-4 mr-2" />
                  View Favorites
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">This Week's Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Meal Plans</span>
                  <span className="text-sm font-medium">2/3 completed</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: '67%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Nutrition Goals</span>
                  <span className="text-sm font-medium">85% achieved</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: '85%' }}></div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View Full Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                <XCircle className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Edit Profile</h2>
              <ProfileForm user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
