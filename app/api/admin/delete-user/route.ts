'use server'

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(req: NextRequest) {
    try {
        // Verify admin access
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Delete user data in order (respecting foreign key constraints)
        // Start with child records first

        // 1. Delete chat messages (via chat sessions)
        const chatSessions = await prisma.chatSession.findMany({
            where: { userId: user.id },
            select: { id: true },
        })

        if (chatSessions.length > 0) {
            await prisma.chatMessage.deleteMany({
                where: {
                    sessionId: {
                        in: chatSessions.map((s: { id: string }) => s.id),
                    },
                },
            })
        }

        // 2. Delete chat sessions
        await prisma.chatSession.deleteMany({
            where: { userId: user.id },
        })

        // 3. Delete recipes
        await prisma.recipe.deleteMany({
            where: { userId: user.id },
        })

        // 4. Delete grocery lists
        await prisma.groceryList.deleteMany({
            where: { userId: user.id },
        })

        // 5. Delete meals (via day meals and meal plans)
        const mealPlans = await prisma.mealPlan.findMany({
            where: { userId: user.id },
            select: { id: true },
        })

        if (mealPlans.length > 0) {
            const dayMeals = await prisma.dayMeal.findMany({
                where: {
                    mealPlanId: {
                        in: mealPlans.map((mp: { id: string }) => mp.id),
                    },
                },
                select: { id: true },
            })

            if (dayMeals.length > 0) {
                await prisma.meal.deleteMany({
                    where: {
                        dayMealId: {
                            in: dayMeals.map((dm: { id: string }) => dm.id),
                        },
                    },
                })

                await prisma.dayMeal.deleteMany({
                    where: {
                        mealPlanId: {
                            in: mealPlans.map((mp: { id: string }) => mp.id),
                        },
                    },
                })
            }
        }

        // 6. Delete meal plans
        await prisma.mealPlan.deleteMany({
            where: { userId: user.id },
        })

        // 7. Delete favorite meals
        await prisma.favoriteMeal.deleteMany({
            where: { userId: user.id },
        })

        // 8. Delete onboarding data
        await prisma.onboardingData.deleteMany({
            where: { userId: user.id },
        })

        // 9. Delete user analytics
        await prisma.userAnalytics.deleteMany({
            where: { userId: user.id },
        })

        // 10. Delete meal swap counts
        await prisma.mealSwapCount.deleteMany({
            where: { userId: user.id },
        })

        // 11. Delete subscription
        await prisma.subscription.deleteMany({
            where: { userID: user.id },
        })

        // 12. Delete sessions
        await prisma.session.deleteMany({
            where: { userId: user.id },
        })

        // 13. Delete accounts
        await prisma.account.deleteMany({
            where: { userId: user.id },
        })

        // 14. Finally, delete the user
        await prisma.user.delete({
            where: { id: user.id },
        })

        return NextResponse.json({
            success: true,
            message: `All data for ${email} has been deleted.`,
        })
    } catch (error) {
        console.error('[Delete User] Error:', error)
        return NextResponse.json(
            { error: 'Failed to delete user data' },
            { status: 500 }
        )
    }
}
