import { Suspense } from 'react'
import { headers } from 'next/headers'
import { Loader2 } from 'lucide-react'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { InsightsClient, type InsightData } from '@/components/insights/insights-client'

// Server-side data fetching
async function getInsights(userId: string): Promise<InsightData | null> {
  try {
    const [mealPlans, totalMeals, onboardingData] = await Promise.all([
      prisma.mealPlan.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          days: {
            include: {
              meals: true,
            },
          },
        },
      }),
      prisma.meal.count({
        where: {
          dayMeal: {
            mealPlan: {
              userId,
            },
          },
        },
      }),
      prisma.onboardingData.findUnique({
        where: { userId },
      }),
    ])

    // Calculate average calories per day
    let totalCalories = 0
    let totalDays = 0

    mealPlans.forEach((plan: typeof mealPlans[number]) => {
      plan.days.forEach((dayMeal: typeof plan.days[number]) => {
        const dayCalories = dayMeal.meals.reduce((sum: number, meal: typeof dayMeal.meals[number]) => sum + (meal.calories || 0), 0)
        if (dayCalories > 0) {
          totalCalories += dayCalories
          totalDays++
        }
      })
    })

    const avgCaloriesPerDay = totalDays > 0 ? Math.round(totalCalories / totalDays) : 0
    const mostPopularCuisine = onboardingData?.cuisinePreferences?.[0] || 'Not set'
    const lastPlanDate = mealPlans.length > 0 ? mealPlans[0].createdAt.toISOString() : null
    const weeklyProgress = mealPlans.length > 0 ? Math.min(100, Math.round((mealPlans.length / 4) * 100)) : 0

    return {
      totalMealPlans: mealPlans.length,
      totalMeals,
      avgCaloriesPerDay,
      mostPopularCuisine,
      lastPlanDate,
      weeklyProgress,
    }
  } catch (error) {
    console.error('[Meal Insights] Error fetching data:', error)
    return null
  }
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

async function InsightsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const insights = session?.user?.id 
    ? await getInsights(session.user.id) 
    : null

  return <InsightsClient insights={insights} />
}

export default function MealInsightsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InsightsContent />
    </Suspense>
  )
}
