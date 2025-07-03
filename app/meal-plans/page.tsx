// app/meal-plans/page.tsx
import { Metadata } from 'next'
import { fetchMealPlansByUserId } from "@/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UtensilsIcon, Plus, TrendingUp, Clock, Target, Users, Filter, Search,  List,  ChefHat, Heart, Award, Star, Grid } from "lucide-react"
import DeleteButton from "@/components/delete-button"
import Link from "next/link"
import type { MealPlan } from "@/types"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { MetricCard, PlanCard } from "./components"

export const metadata: Metadata = {
  title: 'My Meal Plans | MealWise - Personalized AI Meal Planning',
  description: 'Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans designed just for you. Create, manage, and track your meal planning progress.',
  keywords: [
    'meal plans',
    'personalized meal planning',
    'nutrition journey',
    'meal planning dashboard',
    'AI meal plans',
    'healthy eating plans',
    'diet planning',
    'meal prep',
    'food planning',
    'nutrition tracking',
    'meal management',
    'culinary journey'
  ],
  authors: [{ name: 'MealWise Team' }],
  creator: 'MealWise',
  publisher: 'MealWise',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.aimealwise.com'),
  alternates: {
    canonical: '/meal-plans',
  },
  openGraph: {
    title: 'My Meal Plans | MealWise - Personalized AI Meal Planning',
    description: 'Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans designed just for you. Create, manage, and track your meal planning progress.',
    url: 'https://www.aimealwise.com/meal-plans',
    siteName: 'MealWise',
    images: [
      {
        url: '/og-meal-plans.png',
        width: 1200,
        height: 630,
        alt: 'MealWise Meal Plans - Personalized Nutrition Journey',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Meal Plans | MealWise - Personalized AI Meal Planning',
    description: 'Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans designed just for you. Create, manage, and track your meal planning progress.',
    images: ['/og-meal-plans.png'],
    creator: '@mealwise',
    site: '@mealwise',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

const MealPlans = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-violet-950 dark:to-indigo-950">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-violet-200/50 dark:border-violet-700/50 shadow-2xl rounded-3xl p-12 max-w-md text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">Welcome Back!</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              Sign in to unlock your personalized culinary universe and start your flavor-packed adventure.
            </p>
            <div className="relative group/btn">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-50 group-hover/btn:opacity-75 transition-opacity duration-300"></div>
              <div className="relative w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-300">
                <span className="text-white font-semibold">Sign In to Continue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId)

  if (mealPlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-violet-950 dark:to-indigo-950">
        <div className="relative group max-w-2xl">
          <div className="absolute -inset-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
          <div className="relative backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-violet-200/50 dark:border-violet-700/50 shadow-2xl rounded-3xl p-16 text-center">
            <div className="relative mb-12">
              <div className="w-32 h-32 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                <UtensilsIcon className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Your Culinary Canvas Awaits
            </h3>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-lg mx-auto">
              Ready to craft your first masterpiece? Create personalized meal plans that transform cooking into an art form.
            </p>
            <Link
              href="/meal-plans/new"
              className="group/create relative inline-flex items-center gap-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white px-12 py-6 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-110 transition-all duration-500 shadow-xl"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-50 group-hover/create:opacity-75 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-4">
                <Plus className="w-6 h-6 group-hover/create:rotate-180 transition-transform duration-500" />
                Create Your First Masterpiece
                <Star className="w-5 h-5 group-hover/create:animate-spin" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalMeals = mealPlans.reduce((acc, plan) => acc + plan.duration * plan.mealsPerDay, 0)
  const totalDays = mealPlans.reduce((acc, plan) => acc + plan.duration, 0)
  const avgMealsPerDay = Math.round(totalMeals / totalDays * 10) / 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-violet-950 dark:to-indigo-950">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(139,69,244,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.15),transparent_50%),radial-gradient(circle_at_40%_40%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-violet-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-32 right-1/3 w-1 h-1 bg-purple-500 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-40 left-1/6 w-3 h-3 bg-indigo-400 rounded-full animate-bounce opacity-50"></div>
        
        <div className="relative container max-w-7xl mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center animate-pulse">
                  <Heart className="w-3 h-3 text-white fill-current" />
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700 text-lg px-4 py-2 shadow-lg">
                <Award className="w-4 h-4 mr-2" />
                Culinary Master
              </Badge>
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-black mb-8 leading-none">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your Meal
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                Universe
              </span>
            </h1>
            
            <p className="text-2xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
              Welcome to your personalized culinary cosmos where every meal is a new adventure waiting to unfold.
            </p>
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/meal-plans/new"
                className="group relative flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-3">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Craft New Plan
                  <Star className="w-4 h-4 group-hover:animate-spin" />
                </div>
              </Link>
              
              <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-violet-200/50 dark:border-violet-700/50 rounded-2xl px-6 py-4 shadow-lg">
                <Search className="w-5 h-5 text-violet-500" />
                <input 
                  type="text" 
                  placeholder="Search your plans..." 
                  className="bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-500 outline-none w-40"
                />
                <Filter className="w-4 h-4 text-violet-400 cursor-pointer hover:text-violet-600 transition-colors" />
              </div>
              
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-violet-200/50 dark:border-violet-700/50 rounded-2xl p-2 shadow-lg">
                <button className="p-2 rounded-xl bg-violet-500 text-white shadow-md">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl text-violet-500 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
            <MetricCard value={mealPlans.length} label="Active Plans" icon={Target} color="violet" trend="+2 this week" />
            <MetricCard value={totalDays} label="Total Days" icon={Clock} color="purple" trend="Consistent!" />
            <MetricCard value={totalMeals} label="Meals Planned" icon={UtensilsIcon} color="indigo" trend="Growing strong" />
            <MetricCard value={avgMealsPerDay} label="Avg per Day" icon={TrendingUp} color="pink" trend="Perfect balance" />
          </div>
        </div>
      </div>

      {/* Redesigned Plans Grid */}
      <div className="container max-w-7xl mx-auto px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {mealPlans.map((mealPlan, index) => (
            <PlanCard key={mealPlan.id} plan={mealPlan} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MealPlans