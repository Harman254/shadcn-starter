// app/meal-plans/page.tsx
import { Metadata } from 'next'
import { fetchMealPlansByUserId } from "@/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UtensilsIcon, Plus, TrendingUp, Clock, Target, Users, Filter, Search, List, ChefHat, Heart, Award, Star, Grid, BookOpen} from "lucide-react"
import DeleteButton from "@/components/delete-button"
import Link from "next/link"
import type { MealPlan } from "@/types"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { MetricCard, PlanCard } from "./components"
import Footer from '@/components/footer'

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
export const dynamic = 'force-dynamic'; // Ensure fresh data on every page load

const MealPlans = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="text-center max-w-sm w-full mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Welcome to MealWise
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            Sign in to access your personalized meal plans and start your nutrition journey.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl w-full"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId)

  if (mealPlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
        <div className="text-center max-w-sm w-full mx-auto">
          <div className="w-32 h-32 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <UtensilsIcon className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Ready to Start Planning?
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
            Create your first meal plan and discover how easy healthy eating can be.
          </p>
          <Link
            href="/meal-plans/new"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 w-full"
          >
            <Plus className="w-5 h-5" />
            Create Your First Plan
          </Link>
        </div>
      </div>
    )
  }

  const totalMeals = mealPlans.reduce((acc, plan) => acc + plan.duration * plan.mealsPerDay, 0)
  const totalDays = mealPlans.reduce((acc, plan) => acc + plan.duration, 0)
  const avgMealsPerDay = Math.round(totalMeals / totalDays * 10) / 10

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-700/50 sticky top-0 z-10 w-full">
        <div className="container max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 w-full min-w-0">
            <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  My Meal Plans
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                  {mealPlans.length} active plans
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search plans..." 
                  className="pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent w-full max-w-full sm:max-w-xs"
                />
              </div>
              
              <button className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-700 rounded-lg p-1">
                <button className="p-1.5 bg-white dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-md shadow-sm">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-md">
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <Link
                href="/meal-plans/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container max-w-7xl  mx-auto px-2 sm:px-4 py-6 sm:py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full">
          <div className="bg-white dark:bg-[#222222] rounded-xl p-4 sm:p-6 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                +2 this week
              </Badge>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {mealPlans.length}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Active Plans
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Consistent
              </Badge>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalDays}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Total Days
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <UtensilsIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Growing
              </Badge>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {totalMeals}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Meals Planned
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 sm:p-6 shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="text-xs">
                Balanced
              </Badge>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {avgMealsPerDay}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Avg per Day
            </p>
          </div>
        </div>

        {/* Meal Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
          {mealPlans.map((mealPlan, index) => (
            <PlanCard key={mealPlan.id} plan={mealPlan} index={index} />
          ))}
        </div>
      </div>
      
    </div>
      <Footer />
      </>

  )
}

export default MealPlans