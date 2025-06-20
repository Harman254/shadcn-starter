// app/meal-plans/page.tsx
import { Metadata } from 'next'
import { fetchMealPlansByUserId } from "@/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UtensilsIcon, Plus, TrendingUp, Clock, Rocket, Target, BarChart3, Zap, Star, Crown } from "lucide-react"
import DeleteButton from "@/components/delete-button"
import Link from "next/link"
import type { MealPlan } from "@/types"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-3xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Authentication Required</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Sign in to access your personalized meal planning experience and unlock your culinary journey.
          </p>
          <div className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-semibold">Please Sign In</span>
          </div>
        </div>
      </div>
    )
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId)

  if (mealPlans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-3xl p-12 max-w-lg text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Start Your Culinary Journey</h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
            Create your first meal plan and discover amazing recipes tailored just for you.
          </p>
          <Link
            href="/meal-plans/new"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-slate-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="relative container max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/50 dark:to-green-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 shadow-sm">
                  Premium Experience
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-green-900 dark:from-slate-100 dark:via-emerald-100 dark:to-green-100 bg-clip-text text-transparent mb-6 leading-tight">
                Your Meal Plans
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans
                designed just for you.
              </p>
            </div>
            <Link
              href="/meal-plans/new"
              className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-3">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Create New Plan
              </div>
            </Link>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <StatCard value={mealPlans.length} label="Active Plans" icon={Rocket} color="emerald" />
            <StatCard value={totalDays} label="Total Days" icon={Clock} color="green" />
            <StatCard value={totalMeals} label="Total Meals" icon={TrendingUp} color="slate" />
          </div>
        </div>
      </div>

      {/* Meal Plans Grid */}
      <div className="container max-w-7xl mx-auto px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {mealPlans.map((mealPlan, index) => (
            <Card
              key={mealPlan.id}
              className="group relative backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
                opacity: 0,
                transform: "translateY(30px)",
              }}
            >
              {/* Header */}
              <div
                className={`h-40 bg-gradient-to-br relative overflow-hidden ${
                  index % 3 === 0
                    ? "from-emerald-500 via-green-500 to-slate-600"
                    : index % 3 === 1
                    ? "from-green-500 via-emerald-500 to-slate-700"
                    : "from-slate-600 via-emerald-600 to-green-600"
                }`}
              >
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_70%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                
                {/* Floating elements */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 text-white backdrop-blur-sm shadow-lg">
                    <Rocket className="w-3 h-3 mr-1" />
                    {mealPlan.mealsPerDay} meals/day
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-6 text-white/90 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{mealPlan.duration} days</span>
                </div>
                
                <div className="absolute top-4 left-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4 pt-6">
                <Link
                  href={`/meal-plans/${mealPlan.id}`}
                  className="hover:underline group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                >
                  <CardTitle className="text-2xl font-bold mb-2 leading-tight text-slate-900 dark:text-slate-100">
                    {mealPlan.title}
                  </CardTitle>
                  <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    {mealPlan.duration}-Day Meal Plan
                  </div>
                  <CardDescription className="flex items-center text-slate-600 dark:text-slate-400">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Created on{" "}
                    {new Date(mealPlan.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </Link>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UtensilsIcon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {mealPlan.duration * mealPlan.mealsPerDay}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">total meals planned</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href={`/meal-plans/${mealPlan.id}`}
                    className="group/link flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <span>View Details</span>
                    <TrendingUp className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <DeleteButton id={mealPlan.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MealPlans

const StatCard = ({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) => (
  <div className="group relative backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative flex items-center gap-4">
      <div
        className={`w-16 h-16 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div>
        <p className="text-4xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-slate-600 dark:text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  </div>
)
