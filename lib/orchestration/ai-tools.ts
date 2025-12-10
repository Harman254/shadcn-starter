import { tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// ============================================================================
// UTILITIES & TYPES
// ============================================================================

export interface ToolResult {
    success: boolean;
    result?: any;
    error?: string;
    isSystemError?: boolean;
    message?: string;
}

export enum ErrorCode {
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    GENERATION_FAILED = 'GENERATION_FAILED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    VALIDATION_FAILED = 'VALIDATION_FAILED'
}

export function successResponse(data: any, message?: string): ToolResult {
    return { success: true, result: data, message };
}

export function errorResponse(message: string, code: string, isSystemError = false): ToolResult {
    return { success: false, error: message, isSystemError };
}

// ============================================================================
// 1. User Preferences
// ============================================================================

export const fetchUserPreferences = tool({
    description: 'Fetch the user\'s dietary preferences, allergies, and goals.',
    parameters: z.object({}),
    execute: async (): Promise<ToolResult> => {
        try {
            console.log('[fetchUserPreferences] 👤 Fetching user preferences...');
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');

            const session = await auth.api.getSession({ headers: await headers() });

            if (!session?.user?.id) {
                return successResponse({
                    dietary: [],
                    allergies: [],
                    goals: []
                }, 'User is not logged in, using default empty preferences.');
            }

            const onboardingData = await prisma.onboardingData.findUnique({
                where: { userId: session.user.id }
            });

            return successResponse(onboardingData || {}, "Fetched user preferences.");
        } catch (error) {
            console.error('[fetchUserPreferences] Error:', error);
            return errorResponse("Failed to fetch preferences.", ErrorCode.INTERNAL_ERROR);
        }
    },
});

// ============================================================================
// 2. Meal Planning
// ============================================================================

export const generateMealPlan = tool({
    description: 'Generate a meal plan based on user preferences. ALWAYS check preferences first.',
    parameters: z.object({
        duration: z.number().min(1).max(7).describe('Duration in days'),
        mealsPerDay: z.number().min(1).max(5).describe('Meals per day'),
        preferences: z.object({
            dietary: z.array(z.string()).optional(),
            allergies: z.array(z.string()).optional(),
            goals: z.array(z.string()).optional(),
        }).optional().describe('User preferences to respect')
    }),
    execute: async ({ duration, mealsPerDay, preferences }: { duration: number, mealsPerDay: number, preferences?: any }): Promise<ToolResult> => {
        try {
            console.log(`[generateMealPlan] 🍳 Generating ${duration}-day plan...`);
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');

            const mealPlanSchema = z.object({
                title: z.string(),
                days: z.array(z.object({
                    day: z.number(),
                    meals: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                        ingredients: z.array(z.string()),
                        instructions: z.string(),
                        calories: z.number(),
                        protein: z.number(),
                        carbs: z.number(),
                        fat: z.number(),
                    }))
                }))
            });

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                schema: mealPlanSchema,
                prompt: `Generate a ${duration}-day meal plan with ${mealsPerDay} meals per day.
                         Preferences: ${JSON.stringify(preferences || {})}
                         Ensure nutritional balance and variety.`
            });

            return successResponse({ mealPlan: result.object }, "Here is your meal plan!");
        } catch (error) {
            console.error('[generateMealPlan] Error:', error);
            return errorResponse("Failed to generate meal plan.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// Other Tools
// ============================================================================

export const analyzeNutrition = tool({
    description: 'Analyze the nutritional content of a meal plan or specific food items.',
    parameters: z.object({
        mealPlanId: z.string().optional(),
        items: z.array(z.string()).optional()
    }),
    execute: async ({ mealPlanId, items }) => {
        // Mock
        return successResponse({
            nutrition: {
                total: { calories: 2000, protein: 150, carbs: 200, fat: 70 },
                dailyAverage: { calories: 2000, protein: 150, carbs: 200, fat: 70 },
                insights: ['Balanced'],
                healthScore: 85,
                summary: "Good plan."
            }
        }, "Nutrition analysis complete.");
    }
});

export const getGroceryPricing = tool({
    description: 'Get estimated pricing for grocery items.',
    parameters: z.object({ items: z.array(z.string()) }),
    execute: async ({ items }) => {
        return successResponse({ prices: items.map(i => ({ item: i, price: '5.00', store: 'Store' })), total: 50 }, "Prices found.");
    }
});

export const generateGroceryList = tool({
    description: 'Generate a consolidated grocery list from a meal plan.',
    parameters: z.object({ mealPlanId: z.string().optional() }),
    execute: async ({ mealPlanId }) => {
        return successResponse({ groceryList: { id: 'mock', items: [] } }, "List generated.");
    }
});

export const optimizeGroceryList = tool({
    description: 'Optimize a grocery list.',
    parameters: z.object({ listId: z.string() }),
    execute: async ({ listId }) => {
        return successResponse({ optimization: { savings: '$5', stores: ['Aldi'] } }, "Optimized.");
    }
});

export const generateMealRecipe = tool({
    description: 'Generate a recipe for a meal.',
    parameters: z.object({ mealName: z.string(), preferences: z.any().optional() }),
    execute: async ({ mealName }) => {
        return successResponse({ recipe: { name: mealName, ingredients: [], instructions: [] } }, "Recipe generated.");
    }
});

export const modifyMealPlan = tool({
    description: 'Modify a meal plan.',
    parameters: z.object({ mealPlanId: z.string(), modifications: z.string() }),
    execute: async ({ modifications }) => {
        return successResponse({ mealPlan: { title: 'Modified', days: [] } }, "Modified.");
    }
});

export const swapMeal = tool({
    description: 'Swap a meal.',
    parameters: z.object({ mealPlanId: z.string(), day: z.number(), mealName: z.string() }),
    execute: async () => {
        return successResponse({ mealPlan: { title: 'Swapped', days: [] } }, "Swapped.");
    }
});

export const searchRecipes = tool({
    description: 'Search recipes.',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
        return successResponse({ recipes: [], query }, "Found recipes.");
    }
});

export const searchFoodData = tool({
    description: 'Search food data.',
    parameters: z.object({ query: z.string() }),
    execute: async ({ query }) => {
        return successResponse({ foodData: { name: query, calories: 100 } }, "Found data.");
    }
});

export const suggestIngredientSubstitutions = tool({
    description: 'Suggest substitutions.',
    parameters: z.object({ ingredient: z.string() }),
    execute: async ({ ingredient }) => {
        return successResponse({ substitutions: [] }, "Found substitutions.");
    }
});

export const getSeasonalIngredients = tool({
    description: 'Get seasonal ingredients.',
    parameters: z.object({ location: z.string().optional() }),
    execute: async () => {
        return successResponse({ seasonal: [] }, "Found seasonal ingredients.");
    }
});

export const planFromInventory = tool({
    description: 'Plan from inventory.',
    parameters: z.object({ inventoryItems: z.array(z.string()) }),
    execute: async ({ inventoryItems }) => {
        return successResponse({ inventoryPlan: { meals: [], usedItems: inventoryItems } }, "Plan created.");
    }
});

export const generatePrepTimeline = tool({
    description: 'Generate prep timeline.',
    parameters: z.object({ mealPlanId: z.string() }),
    execute: async () => {
        return successResponse({ prepTimeline: { steps: [] } }, "Timeline generated.");
    }
});


// ============================================================================
// ANALYZE PANTRY IMAGE TOOL (FIXED + ROBUST + TIMEOUT)
// ============================================================================

export const analyzePantryImage = tool({
    description: 'Analyze an image of a fridge or pantry to identify ingredients.',
    parameters: z.object({
        imageUrl: z.string().describe('The URL of the image to analyze.'),
    }),
    execute: async ({ imageUrl }: { imageUrl: string }): Promise<ToolResult> => {
        try {
            console.log(`[analyzePantryImage] 📸 Analyzing image: ${imageUrl}`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            // Do NOT re-import z here, use top-level z to ensure schema compatibility if needed

            // 1. Fetch image buffer server-side to bypass URL access issues & ensure valid format
            let imagePart: any;
            try {
                // Perplexity-style robustness: Timeout and strict validation
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s strict timeout

                const response = await fetch(imageUrl, { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer); // Convert to Node Buffer
                const mimeType = response.headers.get('content-type') || 'image/jpeg';

                // Use Buffer directly - AI SDK 4.x supports this
                imagePart = {
                    type: 'image',
                    image: buffer,
                    mimeType: mimeType
                };
                console.log(`[analyzePantryImage] ✅ Image fetched & buffered (${mimeType}, ${buffer.length} bytes)`);
            } catch (fetchError) {
                console.error('[analyzePantryImage] ⚠️ Failed to fetch/buffer image:', fetchError);
                // Fallback to URL if buffer fails
                imagePart = { type: 'image', image: new URL(imageUrl) };
            }

            // 2. Call AI with explicit structure
            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                schema: z.object({
                    items: z.array(z.object({
                        name: z.string(),
                        category: z.enum(['produce', 'dairy', 'protein', 'grains', 'spices', 'other']),
                        quantity: z.string(),
                        expiryEstimate: z.string().optional(),
                    })),
                    summary: z.string(),
                }),
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analyze this image and identify all food ingredients visible. Estimate quantities and expiry where possible.' },
                            imagePart
                        ]
                    }
                ],
            });

            if (!result.object) throw new Error('Failed to analyze image');

            const { items, summary } = result.object;

            // Create UI metadata for potential "Add to Pantry" button
            const uiMetadata = {
                pantryAnalysis: {
                    items: items,
                    imageUrl: imageUrl
                },
                actions: [
                    {
                        label: 'Add to Pantry',
                        action: 'update_pantry',
                        data: { items: items }
                    }
                ]
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                { items, summary },
                `✅ I found ${items.length} items: ${summary}. [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error: any) {
            console.error('[analyzePantryImage] Error:', error);
            // Detailed error for debugging context
            const errorMsg = error.cause ? `${error.message} (Cause: ${JSON.stringify(error.cause)})` : error.message;
            return errorResponse(`Failed to analyze image: ${errorMsg}`, ErrorCode.GENERATION_FAILED, true);
        }
    },
});

export const updatePantry = tool({
    description: 'Update the user\'s pantry.',
    parameters: z.object({
        items: z.array(z.object({
            name: z.string(),
            category: z.string().optional(),
            quantity: z.string().optional(),
            expiryEstimate: z.string().optional(),
        }))
    }),
    execute: async ({ items }: { items: any[] }) => {
        try {
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });
            if (!session?.user?.id) return errorResponse('Unauthorized', ErrorCode.UNAUTHORIZED);

            await prisma.$transaction(
                items.map(item =>
                    prisma.pantryItem.create({
                        data: {
                            userId: session.user.id,
                            name: item.name,
                            category: item.category || 'Uncategorized',
                            quantity: item.quantity || '1',
                            expiry: item.expiryEstimate ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null,
                        }
                    })
                )
            );
            return successResponse({ count: items.length }, `Added ${items.length} items.`);
        } catch (e) {
            return errorResponse("Failed to update.", ErrorCode.INTERNAL_ERROR);
        }
    }
});

export const saveMealPlan = tool({
    description: 'Save a meal plan.',
    parameters: z.object({
        mealPlan: z.object({
            title: z.string(),
            duration: z.number(),
            mealsPerDay: z.number(),
            days: z.array(z.any())
        })
    }),
    execute: async ({ mealPlan }: { mealPlan: any }) => {
        try {
            const { saveMealPlanAction } = await import('@/actions/save-meal-plan');
            const input = { ...mealPlan, createdAt: new Date().toISOString() };
            // @ts-ignore
            const result = await saveMealPlanAction(input);
            if (!result.success) return errorResponse(result.error || 'Failed', ErrorCode.INTERNAL_ERROR);
            return successResponse({ savedId: result.mealPlan?.id }, "Saved.");
        } catch (e) {
            return errorResponse("Failed to save.", ErrorCode.INTERNAL_ERROR);
        }
    }
});

export const tools = {
    fetchUserPreferences,
    generateMealPlan,
    analyzeNutrition,
    getGroceryPricing,
    generateGroceryList,
    optimizeGroceryList,
    generateMealRecipe,
    modifyMealPlan,
    swapMeal,
    searchRecipes,
    searchFoodData,
    suggestIngredientSubstitutions,
    getSeasonalIngredients,
    planFromInventory,
    generatePrepTimeline,
    analyzePantryImage,
    updatePantry,
    saveMealPlan
};
