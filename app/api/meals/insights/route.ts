import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id

        // Get meal plan statistics
        const [
            mealPlans,
            totalMeals,
            onboardingData,
        ] = await Promise.all([
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

        // Get most popular cuisine from preferences
        const mostPopularCuisine = onboardingData?.cuisinePreferences?.[0] || 'Not set'

        // Get last plan date
        const lastPlanDate = mealPlans.length > 0 ? mealPlans[0].createdAt.toISOString() : null

        // Calculate weekly progress (placeholder - could be enhanced with actual tracking)
        const weeklyProgress = mealPlans.length > 0 ? Math.min(100, Math.round((mealPlans.length / 4) * 100)) : 0

        return NextResponse.json({
            totalMealPlans: mealPlans.length,
            totalMeals,
            avgCaloriesPerDay,
            mostPopularCuisine,
            lastPlanDate,
            weeklyProgress,
        })
    } catch (error) {
        console.error('[Meal Insights] Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch insights' },
            { status: 500 }
        )
    }
}
