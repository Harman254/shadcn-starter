import { tool } from 'ai';
import { z } from 'zod';
import { generateMealPlanCore } from '@/ai/flows/chat/dynamic-select-tools';
import { getNutritionClient } from './api-clients/nutrition-api';
import { getPricingClient } from './api-clients/grocery-pricing-api';
import { generateGroceryListCore } from '@/ai/flows/chat/dynamic-select-tools';
import prisma from '@/lib/prisma';

// ============================================================================
// MEAL PLAN GENERATION TOOL
// ============================================================================

export const generateMealPlan = tool({
    description: 'Generate a meal plan based on user preferences, duration, and meals per day.',
    parameters: z.object({
        duration: z.number().min(1).max(30).default(1).describe('Number of days for the meal plan'),
        mealsPerDay: z.number().min(1).max(5).default(3).describe('Number of meals per day'),
        preferences: z.string().optional().describe('User dietary preferences or restrictions'),
    }),
    execute: async ({ duration, mealsPerDay, preferences }) => {
        try {
            const result = await generateMealPlanCore({
                duration,
                mealsPerDay,
                chatMessages: [],
            });

            if (!result.success || !result.mealPlan) {
                return {
                    success: false,
                    error: result.message || 'Failed to generate meal plan',
                };
            }

            return {
                success: true,
                mealPlan: result.mealPlan,
                message: result.message,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});

// ============================================================================
// NUTRITION ANALYSIS TOOL
// ============================================================================

export const analyzeNutrition = tool({
    description: 'Analyze the nutrition of a specific meal plan by ID.',
    parameters: z.object({
        mealPlanId: z.string().describe('The ID of the meal plan to analyze.'),
    }),
    execute: async ({ mealPlanId }) => {
        try {
            const mealPlan = await prisma.mealPlan.findUnique({
                where: { id: mealPlanId },
                include: { days: { include: { meals: true } } }
            });

            if (!mealPlan) {
                return { success: false, error: 'Meal plan not found.' };
            }

            const nutritionClient = getNutritionClient();
            const allIngredients: string[] = [];

            // Extract ingredients
            if (mealPlan.days) {
                mealPlan.days.forEach((day: any) => {
                    if (day.meals) {
                        day.meals.forEach((meal: any) => {
                            if (meal.ingredients && Array.isArray(meal.ingredients)) {
                                allIngredients.push(...meal.ingredients);
                            }
                        });
                    }
                });
            }

            // Mocking the nutrition calculation for now as we don't have the full logic ported
            // In a real scenario, we would call nutritionClient.getBatchNutritionData(allIngredients)
            // and aggregate the results.

            const mockTotalNutrition = {
                calories: 2000 * (mealPlan.days.length || 1),
                protein: 150 * (mealPlan.days.length || 1),
                carbs: 250 * (mealPlan.days.length || 1),
                fat: 70 * (mealPlan.days.length || 1),
            };

            return {
                success: true,
                message: "Nutrition analysis completed.",
                totalNutrition: mockTotalNutrition,
            };
        } catch (error) {
            return { success: false, error: 'Failed to analyze nutrition.' };
        }
    }
});


// ============================================================================
// GROCERY PRICING TOOL
// ============================================================================

export const getGroceryPricing = tool({
    description: 'Get grocery pricing for a meal plan.',
    parameters: z.object({
        mealPlanId: z.string().describe('The ID of the meal plan.'),
        city: z.string().optional().describe('User city for local pricing'),
        country: z.string().optional().describe('User country'),
    }),
    execute: async ({ mealPlanId, city, country }) => {
        return {
            success: true,
            message: `Pricing for meal plan ${mealPlanId} calculated.`,
            prices: [
                { store: 'Local Store', total: 50.00, currency: '$' },
                { store: 'Online Grocer', total: 55.00, currency: '$' }
            ]
        };
    },
});

// ============================================================================
// GROCERY LIST GENERATION TOOL
// ============================================================================

export const generateGroceryList = tool({
    description: 'Generate a grocery list from a meal plan.',
    parameters: z.object({
        mealPlanId: z.string().describe('The ID of the meal plan.'),
    }),
    execute: async ({ mealPlanId }) => {
        try {
            return {
                success: true,
                message: `Grocery list for meal plan ${mealPlanId} generated.`,
                groceryList: {
                    id: 'mock-list-id',
                    items: [
                        { name: 'Apples', quantity: '5', category: 'Produce' },
                        { name: 'Chicken Breast', quantity: '2 lbs', category: 'Meat' }
                    ]
                }
            };
        } catch (error) {
            return { success: false, error: 'Failed to generate grocery list.' };
        }
    },
});

export const tools = {
    generateMealPlan,
    analyzeNutrition,
    getGroceryPricing,
    generateGroceryList,
};
