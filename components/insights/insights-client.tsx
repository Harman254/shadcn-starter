'use client'

import React from 'react'
import { 
  TrendingUp, 
  Utensils, 
  Target, 
  Flame,
  Clock,
  ChefHat,
  BarChart3,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DiscoverFeed } from '@/components/insights/discover-feed'

export interface InsightData {
  totalMealPlans: number
  totalMeals: number
  avgCaloriesPerDay: number
  mostPopularCuisine: string
  lastPlanDate: string | null
  weeklyProgress: number
}

interface InsightsClientProps {
  insights: InsightData | null
}

export function InsightsClient({ insights }: InsightsClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Mobile-first: smaller padding on mobile, larger on desktop */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header - mobile-first typography */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Meal Insights</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
            Your Nutrition Journey
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-2">
            Track your progress, discover patterns, and get personalized recommendations.
          </p>
        </div>

        {/* Quick Actions - stacked on mobile, inline on larger screens */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 lg:mb-12">
          <Link href="/chat" className="w-full sm:w-auto">
            <Button className="gap-2 w-full sm:w-auto text-sm">
              <ChefHat className="h-4 w-4" />
              Create New Meal Plan
            </Button>
          </Link>
          <Link href="/dashboard/analytics" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 w-full sm:w-auto text-sm">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>

        {/* Insights Grid - 2 columns on mobile, 3 on large screens */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
          <InsightCard
            icon={<Utensils className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Total Meal Plans"
            value={insights?.totalMealPlans ?? 0}
            description="Plans you've created"
            color="blue"
          />
          <InsightCard
            icon={<Target className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Meals Planned"
            value={insights?.totalMeals ?? 0}
            description="Individual meals"
            color="green"
          />
          <InsightCard
            icon={<Flame className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Avg Calories"
            value={insights?.avgCaloriesPerDay ?? 0}
            description="Per day"
            color="orange"
          />
          <InsightCard
            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Weekly Progress"
            value={`${insights?.weeklyProgress ?? 0}%`}
            description="Meals followed"
            color="purple"
          />
          <InsightCard
            icon={<ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Favorite Cuisine"
            value={insights?.mostPopularCuisine ?? 'None yet'}
            description="Most planned"
            color="pink"
            isText
          />
          <InsightCard
            icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
            label="Last Plan"
            value={insights?.lastPlanDate ? new Date(insights.lastPlanDate).toLocaleDateString() : 'Never'}
            description="Keep going!"
            color="cyan"
            isText
          />
        </div>

        {/* Discover Feed */}
        <DiscoverFeed />
      </div>
    </div>
  )
}

function InsightCard({
  icon,
  label,
  value,
  description,
  color,
  isText = false
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  description: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'cyan'
  isText?: boolean
}) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-200/50 dark:border-blue-800/50',
    green: 'from-green-500/10 to-green-600/5 border-green-200/50 dark:border-green-800/50',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-200/50 dark:border-orange-800/50',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-200/50 dark:border-purple-800/50',
    pink: 'from-pink-500/10 to-pink-600/5 border-pink-200/50 dark:border-pink-800/50',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-200/50 dark:border-cyan-800/50',
  }
  
  const iconColors = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 border shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
        <div className={`${iconColors[color]} p-2 sm:p-3 bg-white/50 dark:bg-black/20 rounded-lg sm:rounded-xl shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1 truncate">{label}</p>
          <p className={`font-bold text-foreground ${isText ? 'text-sm sm:text-lg' : 'text-xl sm:text-2xl lg:text-3xl'} truncate`}>
            {value}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{description}</p>
        </div>
      </div>
    </div>
  )
}
