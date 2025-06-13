"use client"
import { fetchMealPlansByUserId } from "@/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UtensilsIcon, Plus, TrendingUp, Clock, Rocket } from "lucide-react"
import DeleteButton from "@/components/delete-button"
import Link from "next/link"
import type { MealPlan } from "@/types"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

const MealPlans = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-3xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Authentication Required</h3>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Sign in to access your personalized meal planning experience and unlock your culinary journey.
          </p>
          <div className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-semibold">Please Sign In</span>
          </div>
        </div>
      </div>
    )
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId)

  if (mealPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-3xl p-12 max-w-lg text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Start Your Culinary Journey</h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
            Create your first meal plan and discover amazing recipes tailored just for you.
          </p>
          <Link
            href="/meal-plans/new"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-800/30">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 dark:from-blue-400/10 dark:to-indigo-400/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2),transparent_50%)]"></div>
        <div className="relative container max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                  Premium Experience
                </Badge>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent mb-6">
                Your Meal Plans
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans
                designed just for you.
              </p>
            </div>
            <Link
              href="/meal-plans/new"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Create New Plan
            </Link>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="group backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <UtensilsIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{mealPlans.length}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Active Plans</p>
                </div>
              </div>
            </div>
            <div className="group backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalDays}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Total Days</p>
                </div>
              </div>
            </div>
            <div className="group backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-700/40 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalMeals}</p>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Total Meals</p>
                </div>
              </div>
            </div>
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
              }}
            >
              {/* Gradient Header with Dynamic Colors */}
              <div
                className={`h-32 bg-gradient-to-br ${
                  index % 3 === 0
                    ? "from-blue-500 via-indigo-500 to-purple-600"
                    : index % 3 === 1
                      ? "from-emerald-500 via-teal-500 to-cyan-600"
                      : "from-orange-500 via-pink-500 to-rose-600"
                } relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_70%)]"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 dark:bg-white/10 border-white/30 dark:border-white/20 text-white backdrop-blur-sm">
                    {mealPlan.mealsPerDay} meals/day
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{mealPlan.duration} days</span>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-4 pt-6">
                <Link
                  href={`/meal-plans/${mealPlan.id}`}
                  className="hover:underline group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  <CardTitle className="text-2xl font-bold mb-2 leading-tight text-slate-900 dark:text-slate-100">
                    {mealPlan.title}
                  </CardTitle>
                  <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 rounded-xl flex items-center justify-center">
                    <UtensilsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {mealPlan.duration * mealPlan.mealsPerDay}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">total meals planned</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href={`/meal-plans/${mealPlan.id}`}
                    className="group/link flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    <span>View Details</span>
                    <TrendingUp className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" />
                  </Link>
                  <DeleteButton id={mealPlan.id} />
                </div>
              </CardContent>

              {/* Enhanced Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 dark:from-blue-400/10 dark:via-indigo-400/10 dark:to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>

              {/* Subtle Border Glow */}
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 dark:from-blue-400/30 dark:via-indigo-400/30 dark:to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)",
                  filter: "blur(1px)",
                }}
              ></div>
            </Card>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default MealPlans
