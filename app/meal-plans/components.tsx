import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ChefHat, Target, Users, Star, TrendingUp, CalendarIcon, Heart, Delete, List } from "lucide-react"
import DeleteButton from "@/components/delete-button"
import type { MealPlan } from "@/types"

export const MetricCard = ({
  value,
  label,
  icon: Icon,
  color,
  trend,
}: {
  value: number
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend: string
}) => {
  const colorClasses = {
    violet: "from-violet-500 to-violet-600",
    purple: "from-purple-500 to-purple-600", 
    indigo: "from-indigo-500 to-indigo-600",
    pink: "from-pink-500 to-rose-500"
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      <div className="relative backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-violet-200/50 dark:border-violet-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="relative flex items-start justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs border-green-200 dark:border-green-700">
            {trend}
          </Badge>
        </div>
        <div className="relative">
          <div className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-1">{value}</div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">{label}</div>
        </div>
      </div>
    </div>
  )
}

export const PlanCard = ({ plan, index }: { plan: MealPlan; index: number }) => {
  const gradients = [
    "from-violet-500 via-purple-500 to-indigo-500",
    "from-indigo-500 via-blue-500 to-cyan-500", 
    "from-purple-500 via-pink-500 to-rose-500",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-orange-500 via-red-500 to-pink-500",
    "from-blue-500 via-indigo-500 to-purple-500"
  ]

  return (
    <div
      className="group relative"
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "fadeInUp 0.8s ease-out forwards",
        opacity: 0,
        transform: "translateY(40px)",
      }}
    >
      <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-500"></div>
      <Card className="relative backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-violet-200/50 dark:border-violet-700/50 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-3">
        {/* Cover Image */}
        <div className="h-48 w-full relative overflow-hidden">
          <img
            src="https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg"
            alt={`${plan.title} cover`}
            className="object-cover w-full h-full"
            style={{ objectPosition: "center" }}
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/30" />
        </div>
        {/* Dynamic Header (overlay) */}
        <div className="absolute top-0 left-0 w-full h-48 p-6 flex flex-col justify-between pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <Badge className="bg-white/25 border-white/40 text-white backdrop-blur-sm shadow-lg text-sm">
                <Target className="w-3 h-3 mr-1" />
                {plan.mealsPerDay} meals/day
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-white/90 text-sm font-medium">Duration</div>
              <div className="text-white text-2xl font-bold">{plan.duration}d</div>
            </div>
          </div>
          <div className="text-white">
            <div className="text-3xl font-black mb-2 leading-tight opacity-90">
              {plan.duration * plan.mealsPerDay}
            </div>
            <div className="text-white/80 font-medium">total experiences</div>
          </div>
        </div>
        <CardHeader className="pb-4 pt-8">
          <Link
            href={`/meal-plans/${plan.id}`}
            className="group/link block hover:scale-105 transition-transform duration-300"
          >
            <CardTitle className="text-3xl font-black mb-3 leading-tight text-slate-900 dark:text-slate-100 group-hover/link:bg-gradient-to-r group-hover/link:from-violet-600 group-hover/link:to-indigo-600 group-hover/link:bg-clip-text group-hover/link:text-transparent transition-all duration-300">
              {plan.title}
            </CardTitle>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xl font-bold text-violet-600 dark:text-violet-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                {plan.duration}-Day Journey
              </div>
              <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700">
                <Users className="w-3 h-3 mr-1" />
                Personal
              </Badge>
            </div>
            <CardDescription className="flex items-center text-slate-600 dark:text-slate-400 text-base">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Created on{" "}
              {new Date(plan.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long", 
                day: "numeric",
              })}
            </CardDescription>
          </Link>
        </CardHeader>
        <CardContent className="pt-0 pb-8">
          <div className="flex items-center justify-between pt-6 border-t border-violet-200/50 dark:border-violet-700/50">
            <Link
              href={`/meal-plans/${plan.id}`}
              className="group/view flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>Explore Journey</span>
              <TrendingUp className="w-4 h-4 group-hover/view:translate-x-1 group-hover/view:scale-110 transition-transform duration-300" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-slate-400 hover:text-red-500 transition-colors">
                <DeleteButton id={plan.id} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 