'use server'

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET() {
    try {
        // Verify admin access (customize this based on your auth setup)
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get counts in parallel for efficiency
        const [
            totalUsers,
            activeTodayCount,
            proSubscriptions,
            totalMealPlans,
            totalRecipes,
            totalChatSessions,
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Active today (users with sessions updated today)
            prisma.session.count({
                where: {
                    updatedAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),

            // Pro subscriptions
            prisma.subscription.count({
                where: {
                    plan: {
                        not: 'free',
                    },
                    status: 'active',
                },
            }),

            // Total meal plans
            prisma.mealPlan.count(),

            // Total recipes
            prisma.recipe.count(),

            // Total chat sessions
            prisma.chatSession.count(),
        ])

        return NextResponse.json({
            totalUsers,
            activeToday: activeTodayCount,
            proSubscriptions,
            totalMealPlans,
            totalRecipes,
            totalChatSessions,
        })
    } catch (error) {
        console.error('[Admin Stats] Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
