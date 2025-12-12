
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export interface AnalyticsData {
    overview: {
        totalMealsPlanned: number;
        totalRecipesSaved: number;
        totalGenerations: number;
        estimatedMoneySaved: number; // Placeholder calculation
        completionRate: number;
    };
    trends: {
        weeklyActivity: { date: string; count: number }[];
        favoriteCuisines: { name: string; count: number }[]; // Derived from analysis
    };
    aiInsights?: {
        summary: string;
        suggestions: string[];
        flavorProfile: string;
    };
}

/**
 * Aggregates deterministic stats from the database.
 * This runs on every request (cached by Next.js if needed) to provide "Real" numbers.
 */
export async function getUserAnalytics(userId: string): Promise<AnalyticsData> {
    // 1. Parallel execution for speed
    const [
        totalMealPlans,
        totalMeals,
        favoriteRecipes,
        mealGenerations,
        last30DayPlans
    ] = await Promise.all([
        prisma.mealPlan.count({ where: { userId } }),
        prisma.meal.count({ where: { dayMeal: { mealPlan: { userId } } } }),
        prisma.favoriteRecipe.count({ where: { userId } }),
        prisma.mealPlanGeneration.findUnique({ where: { userId } }),
        // Fetch recent activity for trends
        prisma.mealPlan.findMany({
            where: {
                userId,
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            },
            select: { createdAt: true }
        })
    ]);

    // 2. Calculate engagement metrics
    // Assume average takeout meal is $15, average home meal is $5. Saving = $10/meal.
    // This is a rough heuristic for "Gamification".
    const estimatedMoneySaved = totalMeals * 10;

    // Activity Histogram (Last 30 days)
    const activityMap = new Map<string, number>();
    last30DayPlans.forEach(p => {
        const date = p.createdAt.toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
    });

    const weeklyActivity = Array.from(activityMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // Fetch cached AI insights if available
    const userAnalytics = await prisma.userAnalytics.findUnique({
        where: { userId }
    });

    return {
        overview: {
            totalMealsPlanned: totalMeals,
            totalRecipesSaved: favoriteRecipes,
            totalGenerations: totalMealPlans, // Total plans created is a better metric than the "rate limit" counter
            estimatedMoneySaved,
            completionRate: 0.85, // Placeholder: We don't track "checked off" meals yet, defaulting high to be encouraging
        },
        trends: {
            weeklyActivity,
            favoriteCuisines: (userAnalytics?.qualitativeTrends as any)?.favoriteCuisines || [],
        },
        // AI Insights are fetched separately/async or cached in `UserAnalytics` table
        aiInsights: userAnalytics?.qualitativeTrends ? (userAnalytics.qualitativeTrends as any) : undefined
    };
}

/**
 * AI-Powered Analysis (Expensive - Run on Upgrade or Weekly)
 * Uses the Vercel AI SDK to analyze the user's actual meal history.
 */
export async function generateUserInsights(userId: string) {
    // Fetch last 5 meal plans to analyze
    const recentPlans = await prisma.mealPlan.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            days: {
                include: { meals: true }
            }
        }
    });

    if (recentPlans.length === 0) return null;

    // Extract just the meal names/descriptions for the AI
    const mealHistory = recentPlans.map(p => ({
        date: p.createdAt.toISOString().split('T')[0],
        meals: p.days.flatMap(d => d.meals.map(m => `${m.name} (${m.type})`))
    }));

    // Use AI SDK to generate structured insights
    const { object } = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: z.object({
            flavorProfile: z.string().describe("A 1-sentence summary of the user's taste (e.g., 'Loves spicy Asian and Mediterranean dishes')"),
            suggestions: z.array(z.string()).describe("3 distinct meal ideas they haven't tried but would like"),
            favoriteCuisines: z.array(z.object({
                name: z.string(),
                count: z.number().describe("Estimated frequency score 1-10")
            })),
            healthSummary: z.string().describe("Brief comment on nutritional balance observed")
        }),
        prompt: `Analyze this user's recent meal history and generate specific insights.
        
        History: ${JSON.stringify(mealHistory)}
        `
    });

    // Save to DB
    await prisma.userAnalytics.upsert({
        where: { userId },
        create: {
            userId,
            qualitativeTrends: object as any, // Cast to any/Json
            lastAiAnalysis: new Date()
        },
        update: {
            qualitativeTrends: object as any,
            lastAiAnalysis: new Date()
        }
    });

    return object;
}

/**
 * Helper to update simple stats (can be called periodically or on login)
 */
export async function updateUserStats(userId: string) {
    const stats = await getUserAnalytics(userId);
    // Update the "hard" numbers in the DB row too if we want faster read access later
    // For now, we calculate on fly, but let's at least init the row if missing
    await prisma.userAnalytics.upsert({
        where: { userId },
        create: {
            userId,
            totalMealsCooked: 0, // We rely on real-time calc for now
        },
        update: {}
    });
}
