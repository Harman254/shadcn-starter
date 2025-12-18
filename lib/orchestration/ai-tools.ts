import { tool } from 'ai';
import { z } from 'zod';
import { getNutritionClient } from './api-clients/nutrition-api';
import { getPricingClient } from './api-clients/grocery-pricing-api';
import prisma from '@/lib/prisma';
import { ToolResult, ErrorCode, successResponse, errorResponse } from '@/lib/types/tool-result';

// Helper to validate URLs
function isValidUrl(urlString: string | undefined): boolean {
    if (!urlString) return false;
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

// ============================================================================
// FETCH USER PREFERENCES TOOL
// ============================================================================

export const fetchUserPreferences = tool({
    description: 'Fetch stored user preferences (dietary, allergies, goals, etc.) to inform meal planning.',
    parameters: z.object({
        userId: z.string().describe('The ID of the user to fetch preferences for'),
    }),
    execute: async ({ userId }): Promise<ToolResult> => {
        try {
            console.log('[fetchUserPreferences] 👤 Fetching preferences for:', userId);
            const prisma = (await import('@/lib/prisma')).default;
            const onboarding = await prisma.onboardingData.findUnique({
                where: { userId }
            });

            if (!onboarding) {
                return successResponse({ preferences: {} }, 'No saved preferences found.');
            }

            const preferences = {
                dietary: onboarding.dietaryPreference,
                cuisine: onboarding.cuisinePreferences,
                goal: onboarding.goal,
            };

            return successResponse(
                { preferences },
                `✅ Fetched user preferences: ${onboarding.dietaryPreference}, ${onboarding.goal}.`
            );
        } catch (error) {
            console.error('[fetchUserPreferences] Error:', error);
            return errorResponse('Failed to fetch preferences.', ErrorCode.INTERNAL_ERROR);
        }
    },
});

// ============================================================================
// MEAL PLAN GENERATION TOOL
// ============================================================================

// Cloudinary food image pools for realistic meal display
const MEAL_IMAGES = {
    breakfast: [
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg',
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg',
    ],
    lunch: [
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg',
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
    ],
    dinner: [
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg',
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-5.jpg',
    ],
    snack: [
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742111996/samples/food/spices.jpg',
        'https://res.cloudinary.com/dcidanigq/image/upload/v1742112002/samples/breakfast.jpg',
    ],
};

function getMealTypeFromIndex(index: number, mealsPerDay: number): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    if (mealsPerDay <= 3) {
        if (index === 0) return 'breakfast';
        if (index === 1) return 'lunch';
        return 'dinner';
    }
    // For 4+ meals per day
    if (index === 0) return 'breakfast';
    if (index === 1) return 'lunch';
    if (index === mealsPerDay - 1) return 'dinner';
    return 'snack';
}

function getRandomImage(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string {
    const images = MEAL_IMAGES[mealType];
    return images[Math.floor(Math.random() * images.length)];
}

function getRandomRecipeImage(): string {
    const allImages = Object.values(MEAL_IMAGES).flat();
    return allImages[Math.floor(Math.random() * allImages.length)];
}

export const generateMealPlan = tool({
    description: 'Generate a meal plan based on user preferences, duration, and meals per day.',
    parameters: z.object({
        duration: z.number().min(1).max(30).default(1).describe('Number of days for the meal plan'),
        mealsPerDay: z.number().min(1).max(5).default(3).describe('Number of meals per day'),
        preferences: z.string().optional().describe('User dietary preferences or restrictions'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
        })).optional().describe('Recent chat messages to understand context and specific requests'),
    }),
    execute: async ({ duration, mealsPerDay, preferences, chatMessages }): Promise<ToolResult> => {
        try {
            console.log('[generateMealPlan] 🍳 Generating plan with AI SDK. Duration:', duration, 'Context:', chatMessages?.length || 0, 'msgs');

            // 1. Get User Session & Preferences
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            if (!session?.user?.id) {
                return errorResponse('You must be logged in to generate a meal plan.', ErrorCode.UNAUTHORIZED);
            }

            // Fetch full preferences for context if not passed explicitly
            let userPrefsContext = preferences || '';
            if (!userPrefsContext) {
                const prisma = (await import('@/lib/prisma')).default;
                const onboarding = await prisma.onboardingData.findUnique({
                    where: { userId: session.user.id }
                });
                if (onboarding) {
                    userPrefsContext = `Dietary: ${onboarding.dietaryPreference}, Goal: ${onboarding.goal}, Cuisines: ${onboarding.cuisinePreferences.join(', ')}`;
                }
            }

            // 2. Generate Meal Plan using AI SDK
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'),
                temperature: 0.7, // Higher temperature for variety
                schema: z.object({
                    title: z.string().describe('A catchy title for this meal plan'),
                    days: z.array(z.object({
                        day: z.number(),
                        meals: z.array(z.object({
                            name: z.string(),
                            description: z.string(),
                            ingredients: z.array(z.string()),
                            instructions: z.string(),
                            calories: z.number().describe('Estimated calories for this meal'),
                            prepTime: z.string().describe('Prep time like "15 min" or "30 min"'),
                            servings: z.number().min(1).max(8).describe('Number of servings'),
                        }))
                    }))
                }),
                prompt: `Generate a personalized meal plan for ${duration} days with ${mealsPerDay} meals per day.

CRITICAL: PRIORITIZE THE USER'S RECENT REQUESTS IN CHAT MESSAGES ABOVE ALL ELSE.

## User's Recent Chat Context (HIGHEST PRIORITY)
${chatMessages?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No recent context.'}

## Saved User Preferences (Use as default, but OVERRIDE if Chat Context conflicts)
${userPrefsContext || 'No saved preferences. Use balanced diet.'}

## Requirements
1. **Specific Requests:** If user asked for specific foods (e.g. "ugali", "keto", "pasta"), YOU MUST INCLUDE THEM.
2. **Variety:** Ensure meals are diverse and not repetitive.
3. **Completeness:** For each meal, provide a name, brief description, full ingredient list, and simple instructions.
4. **Nutrition:** Estimate realistic calories for each meal (300-800 for most meals).
5. **Timing:** Provide realistic prep times (5-45 min).
6. **Servings:** Suggest 1-4 servings per meal.
7. **Structure:** Generate exactly ${duration} days with ${mealsPerDay} meals each.
8. **Title:** Create a catchy, descriptive title for the plan (e.g. "Mediterranean 3-Day Reset", "High-Protein Keto Week").

Return a valid JSON object.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate meal plan data');
            }

            // 3. Enrich meals with images and meal types
            const enrichedDays = result.object.days.map(day => ({
                day: day.day,
                meals: day.meals.map((meal, mealIndex) => {
                    const mealType = getMealTypeFromIndex(mealIndex, mealsPerDay);
                    return {
                        ...meal,
                        mealType,
                        imageUrl: getRandomImage(mealType),
                    };
                })
            }));

            const mealPlanData = {
                title: result.object.title,
                duration,
                mealsPerDay,
                days: enrichedDays
            };

            // 4. Create UI Metadata for Save Button
            const uiMetadata = {
                actions: [
                    {
                        label: 'Save Meal Plan',
                        action: 'save' as const,
                        data: mealPlanData,
                    },
                ],
                mealPlan: mealPlanData,
            };

            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            // 5. Return Success Response
            const totalMeals = mealPlanData.days.reduce((sum, day) => sum + day.meals.length, 0);

            return successResponse(
                {
                    mealPlan: mealPlanData,
                },
                `✅ Generated ${duration}-day meal plan: "${mealPlanData.title}". Includes ${totalMeals} meals. [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[generateMealPlan] Error:', error);
            return errorResponse(error instanceof Error ? error.message : 'Unknown error', ErrorCode.GENERATION_FAILED, true);
        }
    },
});


// ============================================================================
// NUTRITION ANALYSIS TOOL
// ============================================================================

export const analyzeNutrition = tool({
    description: 'Analyze the nutritional value of a meal plan, recipe, or grocery list. Use this when user asks about "nutrition", "calories", "macros", or "healthiness".',
    parameters: z.object({
        query: z.string().optional().describe('A specific food item, dish, or description to analyze (e.g., "apple", "chicken breast", "my lunch"). Use this if the user asks about a specific food not in a plan.'),
        mealPlanId: z.string().optional().describe('The ID of the meal plan to analyze.'),
        recipeName: z.string().optional().describe('The name of the recipe to analyze.'),
        groceryListId: z.string().optional().describe('The ID of the grocery list to analyze.'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
            toolInvocations: z.array(z.any()).optional(),
        })).optional().describe('Recent chat messages to understand context and find previous meal plans or lists'),
    }),
    execute: async ({ query, mealPlanId, recipeName, groceryListId, chatMessages }, options): Promise<ToolResult> => {
        try {
            console.log(`[analyzeNutrition] 🍎 Analyzing nutrition...`);

            // 1. Get Context
            // @ts-ignore
            const context = (options as any)?.context;

            let itemsToAnalyze: string[] = [];
            let title = "Meal Plan";
            let type = 'plan';

            // 2. Resolve Content
            if (mealPlanId) {
                const prisma = (await import('@/lib/prisma')).default;
                const mealPlan = await prisma.mealPlan.findUnique({
                    where: { id: mealPlanId },
                    include: { days: { include: { meals: true } } }
                });

                if (mealPlan) {
                    title = `Meal Plan(${mealPlan.days.length} Days)`;
                    type = 'plan';
                    mealPlan.days.forEach((d: any) => {
                        d.meals.forEach((m: any) => {
                            itemsToAnalyze.push(`${m.name}(${m.ingredients.join(', ')})`);
                        });
                    });
                }
            } else if (groceryListId) {
                const prisma = (await import('@/lib/prisma')).default;
                const groceryList = await prisma.groceryList.findUnique({
                    where: { id: groceryListId }
                });

                if (groceryList && Array.isArray(groceryList.items)) {
                    title = "Grocery List";
                    type = 'plan'; // Treat as a plan for aggregation
                    (groceryList.items as any[]).forEach((item: any) => {
                        itemsToAnalyze.push(`${item.item || item.name}(${item.quantity || ''} ${item.unit || ''})`);
                    });
                }
            } else if (query) {
                // 2a. Handle explicit query (Highest priority after IDs)
                title = query;
                type = 'food';
                itemsToAnalyze.push(query);
            } else if (recipeName) {
                title = recipeName;
                type = 'recipe';
                itemsToAnalyze.push(recipeName);
            } else {
                // Try to find from context (messages OR lastToolResult)
                // Use explicit chatMessages param first, then fallback to options
                // @ts-ignore
                const messages = chatMessages || (options as any)?.messages || context?.messages;

                console.log(`[analyzeNutrition] 🔍 Searching context in ${messages?.length || 0} messages...`);

                // 1. Check lastToolResult (Most reliable for immediate follow-ups)
                const lastMealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan;

                const lastRecipe = context?.lastToolResult?.generateMealRecipe?.data?.recipe;

                const lastGroceryList = context?.lastToolResult?.generateGroceryList?.data?.groceryList;

                // 2. Fallback to checking messages if no lastToolResult
                // Helper to safely check tool invocations
                const findToolResult = (toolName: string) => {
                    if (!messages) return null;
                    // Search backwards
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        if (m.role === 'assistant' && m.toolInvocations) {
                            const invocation = m.toolInvocations.find((t: any) => t.toolName === toolName && (t.result?.success || t.state === 'result'));
                            if (invocation?.result) {
                                // Handle both direct result and result.data wrapper
                                return invocation.result[toolName === 'generateMealRecipe' ? 'recipe' : toolName === 'generateGroceryList' ? 'groceryList' : 'mealPlan'] ||
                                    invocation.result.data?.[toolName === 'generateMealRecipe' ? 'recipe' : toolName === 'generateGroceryList' ? 'groceryList' : 'mealPlan'];
                            }
                        }
                    }
                    return null;
                };

                const msgMealPlan = !lastMealPlan ? findToolResult('generateMealPlan') : null;
                const msgRecipe = !lastRecipe ? findToolResult('generateMealRecipe') : null;
                const msgGroceryList = !lastGroceryList ? findToolResult('generateGroceryList') : null;

                const activeMealPlan = lastMealPlan || msgMealPlan;
                const activeRecipe = lastRecipe || msgRecipe;
                const activeGroceryList = lastGroceryList || msgGroceryList;

                if (activeMealPlan) {
                    console.log('[analyzeNutrition] Found Meal Plan in context');
                    title = `Meal Plan(${activeMealPlan.days.length} Days)`;
                    type = 'plan';
                    activeMealPlan.days.forEach((d: any) => {
                        d.meals.forEach((m: any) => {
                            itemsToAnalyze.push(`${m.name}(${m.ingredients.join(', ')})`);
                        });
                    });
                } else if (activeRecipe) {
                    console.log('[analyzeNutrition] Found Recipe in context');
                    title = activeRecipe.name;
                    type = 'recipe';
                    itemsToAnalyze.push(...activeRecipe.ingredients);
                } else if (activeGroceryList) {
                    console.log('[analyzeNutrition] Found Grocery List in context');
                    title = "Grocery List";
                    type = 'plan';
                    if (Array.isArray(activeGroceryList.items)) {
                        activeGroceryList.items.forEach((item: any) => {
                            if (typeof item === 'string') {
                                itemsToAnalyze.push(item);
                            } else {
                                itemsToAnalyze.push(`${item.item || item.name}(${item.quantity || ''} ${item.unit || ''})`);
                            }
                        });
                    }
                } else {
                    return errorResponse("Please provide a meal plan, recipe, or grocery list to analyze.", ErrorCode.INVALID_INPUT);
                }
            }

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.2,
                schema: z.object({
                    totalNutrition: z.object({
                        calories: z.number().describe('Total calories'),
                        protein: z.number().describe('Total protein in grams'),
                        carbs: z.number().describe('Total carbohydrates in grams'),
                        fat: z.number().describe('Total fat in grams'),
                        fiber: z.number().optional().describe('Total fiber in grams'),
                        sugar: z.number().optional().describe('Total sugar in grams'),
                    }),
                    dailyAverage: z.object({
                        calories: z.number(),
                        protein: z.number(),
                        carbs: z.number(),
                        fat: z.number(),
                    }),
                    insights: z.array(z.string()).describe('Nutritional insights and recommendations'),
                    healthScore: z.number().min(0).max(100).describe('Overall health score (0-100)'),
                    summary: z.string().describe('A concise 1-2 sentence summary of the nutritional analysis (e.g., "High protein plan with balanced macros, suitable for muscle gain.")'),
                    citations: z.array(z.object({
                        url: z.string().describe('Source URL where nutritional data was found'),
                        title: z.string().describe('Title or name of the source'),
                    })).optional().describe('List of sources used for nutritional data, extracted from search results'),
                }),
                prompt: `You are a nutrition expert.Analyze the following ${type} and provide detailed nutrition information.

## ${type === 'plan' ? 'Meal Plan/List' : type === 'food' ? 'Food Item' : 'Recipe'}: "${title}"

## Items:
${itemsToAnalyze.join('\n')}

## Instructions:
1. ** SEARCH GROUNDING IS ENABLED:** You MUST use the search results to find ACCURATE, REAL - WORLD nutritional data for these specific items.Do not just guess.
2. Calculate TOTAL nutrition based on the search data.
3. ${type === 'plan' ? 'Calculate DAILY AVERAGE nutrition (if it is a grocery list, assume it covers 3-4 days unless specified).' : 'For a single recipe or food item, Daily Average = Total.'}
4. Provide 3 - 5 actionable insights about the nutritional balance.
5. Give a health score(0 - 100).
6. Write a concise summary(1 - 2 sentences).

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to analyze nutrition data');
            }

            const nutritionData = result.object;

            const uiMetadata = {
                nutrition: {
                    total: nutritionData.totalNutrition,
                    dailyAverage: nutritionData.dailyAverage,
                    insights: nutritionData.insights,
                    healthScore: nutritionData.healthScore,
                    summary: nutritionData.summary,
                    citations: nutritionData.citations?.filter((c: any) => isValidUrl(c.url)) || [],
                    title: title,
                    type: type
                }
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    totalNutrition: nutritionData.totalNutrition,
                    dailyAverage: nutritionData.dailyAverage,
                    insights: nutritionData.insights,
                    healthScore: nutritionData.healthScore,
                    summary: nutritionData.summary,
                    citations: nutritionData.citations?.filter((c: any) => isValidUrl(c.url)) || [],
                },
                `✅ Nutrition Analysis: ${nutritionData.summary} (Health Score: ${nutritionData.healthScore}/100)[UI_METADATA: ${uiMetadataEncoded}]`
            );
        } catch (error) {
            console.error('[analyzeNutrition] Error:', error);
            return errorResponse('Failed to analyze nutrition.', ErrorCode.INTERNAL_ERROR, true);
        }
    }
});


// ============================================================================
// GROCERY PRICING TOOL
// ============================================================================

export const getGroceryPricing = tool({
    description: 'Get estimated grocery pricing for a meal plan or recipe from different store types.',
    parameters: z.object({
        mealPlanId: z.string().optional().describe('The ID of the meal plan. If not provided, will use context.'),
        city: z.string().optional().describe('User city for local pricing'),
        country: z.string().optional().describe('User country'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
            toolInvocations: z.array(z.any()).optional(),
        })).optional().describe('Recent chat messages to understand context'),
    }),
    execute: async ({ mealPlanId, city, country, chatMessages }, options): Promise<ToolResult> => {
        try {
            console.log(`[getGroceryPricing] 💰 Estimating prices...`);

            // 1. Get Context
            // @ts-ignore
            const context = (options as any)?.context;
            // @ts-ignore
            const messages = chatMessages || (options as any)?.messages || context?.messages;

            let mealPlan;
            let recipe;

            // 2. Resolve Content
            if (mealPlanId) {
                const prisma = (await import('@/lib/prisma')).default;
                mealPlan = await prisma.mealPlan.findUnique({
                    where: { id: mealPlanId },
                    include: { days: { include: { meals: true } } }
                });
            } else {
                // Helper to safely check tool invocations
                const findToolResult = (toolName: string) => {
                    if (!messages) return null;
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        if (m.role === 'assistant' && m.toolInvocations) {
                            const invocation = m.toolInvocations.find((t: any) => t.toolName === toolName && (t.result?.success || t.state === 'result'));
                            if (invocation?.result) {
                                return invocation.result[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'] ||
                                    invocation.result.data?.[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'];
                            }
                        }
                    }
                    return null;
                };

                mealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan ||
                    findToolResult('generateMealPlan');

                recipe =
                    context?.lastToolResult?.generateMealRecipe?.data?.recipe ||
                    findToolResult('generateMealRecipe');
            }

            if (!mealPlan && !recipe) {
                return errorResponse("I can't find a meal plan or recipe to price. Please generate one first.", ErrorCode.INVALID_INPUT);
            }

            // 3. Extract Ingredients
            const allIngredients: string[] = [];
            let title = '';

            if (mealPlan) {
                title = mealPlan.title;
                if (mealPlan.days) {
                    mealPlan.days.forEach((day: any) => {
                        if (day.meals) {
                            day.meals.forEach((meal: any) => {
                                if (meal.ingredients) allIngredients.push(...meal.ingredients);
                            });
                        }
                    });
                }
            } else if (recipe) {
                title = recipe.name;
                if (recipe.ingredients) allIngredients.push(...recipe.ingredients);
            }

            if (allIngredients.length === 0) {
                return errorResponse("No ingredients found to price.", ErrorCode.INVALID_INPUT);
            }

            // 4. Use AI to estimate pricing
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.2,
                schema: z.object({
                    prices: z.array(z.object({
                        store: z.string().describe('Store name or type (e.g., "Whole Foods", "Walmart", "Local Market")'),
                        total: z.number().describe('Estimated total cost'),
                        currency: z.string().describe('Currency symbol'),
                        notes: z.string().optional().describe('Brief note about pricing tier or specific deals found'),
                        sourceUrl: z.string().optional().describe('URL to the store or pricing source if available')
                    }))
                }),
                prompt: `Find CURRENT, REAL - WORLD grocery prices for these ingredients in ${city || 'San Francisco'}, ${country || 'US'}.
                
Ingredients for "${title}":
${allIngredients.slice(0, 50).join(', ')} ${allIngredients.length > 50 ? `...and ${allIngredients.length - 50} more items` : ''}

## INSTRUCTIONS:
1. ** USE SEARCH RESULTS:** You MUST extract ACTUAL prices from the search results.Do not hallucinate prices.
2. ** SOURCE URLS:** You MUST include the specific URL where you found the price in the 'sourceUrl' field.
3. ** TIERS:** Provide 3 pricing estimates from different store tiers(Budget, Standard, Premium) found in the search results.
4. ** ACCURACY:** If you can't find an exact match, find the closest substitute and note it.

Return valid JSON.`,
            });

            if (!result.object?.prices) {
                throw new Error('Failed to generate pricing estimates');
            }

            const sanitizedPrices = result.object.prices.map(p => ({
                ...p,
                sourceUrl: isValidUrl(p.sourceUrl) ? p.sourceUrl : undefined
            }));

            const uiMetadata = {
                prices: sanitizedPrices,
                title: title
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    prices: sanitizedPrices
                },
                `✅ Estimated grocery costs for "${title}": ${sanitizedPrices.map(p => `${p.store}: ${p.currency}${p.total}`).join(', ')}.[UI_METADATA: ${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[getGroceryPricing] Error:', error);
            return errorResponse("Failed to estimate grocery prices.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// GROCERY LIST GENERATION TOOL
// ============================================================================

export const generateGroceryList = tool({
    description: 'Generate a consolidated grocery/shopping list with local prices and store suggestions. Can work with EITHER a full meal plan OR a single recipe. Use source="mealplan" for multi-day meal plans, source="recipe" for individual recipes or dishes. The tool will automatically find meal plans or recipes from conversation context if not explicitly provided.',
    parameters: z.object({
        source: z.enum(['mealplan', 'recipe', 'meal']).describe('Whether generating from a meal plan or single recipe or meal'),
        mealPlanId: z.string().optional().describe('ID of saved meal plan (if source is mealplan)'),
        fromContext: z.string().optional().describe('Set to "true" to use the meal plan from conversation context'),
        mealPlan: z.object({
            title: z.string().optional(),
            duration: z.number(),
            mealsPerDay: z.number(),
            days: z.array(z.object({
                day: z.number(),
                meals: z.array(z.object({
                    name: z.string(),
                    description: z.string().optional(),
                    ingredients: z.array(z.string()),
                    instructions: z.string().optional(),
                }))
            }))
        }).optional().describe('Meal plan object directly from context (if not saved yet or source is recipe)'),
        recipeName: z.string().optional().describe('Name of the recipe to create grocery list for (if source is recipe)'),
        ingredients: z.array(z.string()).optional().describe('List of ingredients from the recipe (if source is recipe)'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
            toolInvocations: z.array(z.any()).optional(),
        })).optional().describe('Recent chat messages to understand context'),
    }),
    execute: async ({ source, mealPlanId, mealPlan, recipeName, ingredients, fromContext, chatMessages }, options): Promise<ToolResult> => {
        try {
            console.log('[generateGroceryList] 🛒 Source:', source);

            // 1. Get User Session
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            if (!session?.user?.id) {
                return errorResponse('You must be logged in to generate a grocery list.', ErrorCode.UNAUTHORIZED);
            }

            // 2. Get User Location
            const { getLocationDataWithCaching } = await import('@/lib/location');
            const locationData = await getLocationDataWithCaching(session.user.id, session.session.id);

            // 3. Gather Ingredients
            let allIngredients: string[] = [];
            let planTitle = '';

            if (source === 'recipe' && recipeName && ingredients) {
                console.log('[generateGroceryList] Creating list for recipe:', recipeName);
                allIngredients = ingredients;
                planTitle = recipeName;
            }
            else if (source === 'mealplan' && mealPlanId) {
                console.log('[generateGroceryList] Loading meal plan from DB:', mealPlanId);
                const prisma = (await import('@/lib/prisma')).default;
                const dbMealPlan = await prisma.mealPlan.findUnique({
                    where: { id: mealPlanId },
                    include: { days: { include: { meals: true } } }
                });

                if (!dbMealPlan) {
                    return errorResponse("Couldn't find that meal plan.", ErrorCode.RESOURCE_NOT_FOUND);
                }
                allIngredients = dbMealPlan.days.flatMap((d: { meals: { ingredients: string[] }[] }) => d.meals.flatMap((m: { ingredients: string[] }) => m.ingredients));
                planTitle = dbMealPlan.title;
            }
            else if (source === 'mealplan' && mealPlan) {
                console.log('[generateGroceryList] Using meal plan from context');
                allIngredients = mealPlan.days.flatMap(d => d.meals.flatMap(m => m.ingredients));
                planTitle = mealPlan.title || 'Your meal plan';
            }
            // Fallback: Check injected context for last generated meal plan
            else if (source === 'mealplan' && (fromContext === 'true' || (!mealPlanId && !mealPlan))) {
                console.log('[generateGroceryList] 🔍 Looking for meal plan in context...');
                // @ts-ignore - context is injected by ToolExecutor via options
                const context = (options as any)?.context;
                // @ts-ignore
                const messages = chatMessages || (options as any)?.messages || context?.messages;

                // Helper to safely check tool invocations
                const findToolResult = (toolName: string) => {
                    if (!messages) return null;
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        if (m.role === 'assistant' && m.toolInvocations) {
                            const invocation = m.toolInvocations.find((t: any) => t.toolName === toolName && (t.result?.success || t.state === 'result'));
                            if (invocation?.result) {
                                return invocation.result[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'] ||
                                    invocation.result.data?.[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'];
                            }
                        }
                    }
                    return null;
                };

                const lastMealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan ||
                    findToolResult('generateMealPlan');

                if (lastMealPlan) {
                    console.log('[generateGroceryList] 💡 Found meal plan in conversation context!');
                    allIngredients = lastMealPlan.days.flatMap((d: any) => d.meals.flatMap((m: any) => m.ingredients));
                    planTitle = lastMealPlan.title || 'Your meal plan';
                } else {
                    console.error('[generateGroceryList] ❌ No meal plan found in context');
                    return errorResponse("Missing meal plan data. Please generate a meal plan first.", ErrorCode.INVALID_INPUT);
                }
            }
            // Fallback: Check injected context for last generated recipe
            else if (source === 'recipe' && (!recipeName || !ingredients)) {
                console.log('[generateGroceryList] 🔍 Looking for recipe in context...');
                // @ts-ignore
                const context = (options as any)?.context;
                // @ts-ignore
                const messages = chatMessages || (options as any)?.messages || context?.messages;

                // Helper to safely check tool invocations
                const findToolResult = (toolName: string) => {
                    if (!messages) return null;
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        if (m.role === 'assistant' && m.toolInvocations) {
                            const invocation = m.toolInvocations.find((t: any) => t.toolName === toolName && (t.result?.success || t.state === 'result'));
                            if (invocation?.result) {
                                return invocation.result[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'] ||
                                    invocation.result.data?.[toolName === 'generateMealRecipe' ? 'recipe' : 'mealPlan'];
                            }
                        }
                    }
                    return null;
                };

                const lastRecipe =
                    context?.lastToolResult?.generateMealRecipe?.data?.recipe ||
                    findToolResult('generateMealRecipe');

                if (lastRecipe) {
                    console.log('[generateGroceryList] 💡 Found recipe in conversation context!');
                    allIngredients = lastRecipe.ingredients || [];
                    planTitle = lastRecipe.name;
                } else {
                    return errorResponse("Missing recipe data. Please generate a recipe first.", ErrorCode.INVALID_INPUT);
                }
            }
            else {
                return errorResponse("Missing meal plan or recipe data.", ErrorCode.INVALID_INPUT);
            }

            if (allIngredients.length === 0) {
                return errorResponse("No ingredients found to generate list.", ErrorCode.INVALID_INPUT);
            }

            // 4. Pre-process: Consolidate Ingredients
            const ingredientCount = allIngredients.length;
            const consolidatedListPrompt = allIngredients.map(i => `- ${i} `).join('\n');

            console.log(`[generateGroceryList] Processing ${ingredientCount} ingredients for AI...`);

            // 5. Generate List with AI SDK
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true, // Enable search for real local stores
                }),
                temperature: 0.2,
                schema: z.object({
                    groceryList: z.array(z.object({
                        id: z.string(),
                        item: z.string(),
                        quantity: z.string(),
                        category: z.string(),
                        estimatedPrice: z.string(),
                        suggestedLocation: z.string(),
                    })),
                    locationInfo: z.object({
                        currencySymbol: z.string(),
                        localStores: z.array(z.string()).describe('Real grocery store names with specific locations near the user, e.g., "Naivas Westlands", "Carrefour Two Rivers"'),
                    }),
                }),
                prompt: `You are a smart grocery assistant. Convert this list of ingredients into a consolidated shopping list.

## USER LOCATION (CRITICAL - Use search to find REAL stores here)
- City: ${locationData.city || 'San Francisco'}
- Currency: ${locationData.currencySymbol || '$'}

## INGREDIENTS TO PROCESS
${consolidatedListPrompt}

## INSTRUCTIONS
1. **Consolidate:** Combine similar items (e.g., "2 onions" and "chopped onion" -> "Onions", Quantity: "3").
2. **Categorize:** Group by aisle (Produce, Dairy, Meat, Pantry, Spices).
3. **Price:** Use search to estimate REAL local prices in ${locationData.city || 'San Francisco'} using ${locationData.currencySymbol || '$'}.
4. **Local Stores (CRITICAL):** You MUST search for and return 4-6 REAL grocery stores that exist in ${locationData.city || 'San Francisco'}, ${locationData.country || 'US'}. Include specific store names with their area/location.

Return JSON only.`,
            });

            if (!result.object?.groceryList) {
                throw new Error('AI returned empty grocery list');
            }

            // 6. Calculate Totals
            const totalCost = result.object.groceryList.reduce((sum, item) => {
                const price = parseFloat(item.estimatedPrice.replace(/[^0-9.]/g, '')) || 0;
                return sum + price;
            }, 0);

            const currency = result.object.locationInfo?.currencySymbol || '$';

            // 7. Save to Database (Persistence)
            // Auto-save disabled in favor of manual save button in UI
            // const prisma = (await import('@/lib/prisma')).default;
            // const savedList = await prisma.groceryList.create({
            //     data: {
            //         userId: session.user.id,
            //         mealPlanId: mealPlanId || null,
            //         items: result.object.groceryList as any, // Cast to Json
            //         totalCost: totalCost,
            //         currency: currency,
            //     }
            // });

            const uiMetadata = {
                groceryList: {
                    id: 'temp-' + Date.now(), // Temporary ID until DB save is re-enabled
                    items: result.object.groceryList,
                    locationInfo: result.object.locationInfo,
                    totalEstimatedCost: `${currency}${totalCost.toFixed(2)} `,
                },
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    groceryList: {
                        id: uiMetadata.groceryList.id,
                        items: result.object.groceryList,
                        locationInfo: result.object.locationInfo,
                        totalEstimatedCost: `${currency}${totalCost.toFixed(2)} `
                    }
                },
                `✅ Generated and saved grocery list for ${planTitle}! ${result.object.groceryList.length} items, approx ${currency}${totalCost.toFixed(2)}.[UI_METADATA: ${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[generateGroceryList] Error:', error);
            return errorResponse("I had trouble generating the grocery list. Please try again in a moment.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});



// ============================================================================
// MODIFY MEAL PLAN TOOL
// ============================================================================

export const modifyMealPlan = tool({
    description: 'Generate a different meal plan variant based on user preferences. Works just like generateMealPlan but produces a different plan. Use when user wants a new/different/alternative meal plan.',
    parameters: z.object({
        duration: z.number().min(1).max(30).default(1).describe('Number of days for the meal plan'),
        mealsPerDay: z.number().min(1).max(5).default(3).describe('Number of meals per day'),
        preferences: z.string().optional().describe('User dietary preferences or restrictions'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
        })).optional().describe('Recent chat messages to understand context'),
        differentFrom: z.string().optional().describe('Context about what to make different from previous plan'),
    }),
    execute: async ({ duration, mealsPerDay, preferences, chatMessages, differentFrom }): Promise<ToolResult> => {
        try {
            console.log('[modifyMealPlan] 🔄 Generating DIFFERENT meal plan variant. Duration:', duration, 'Context:', chatMessages?.length || 0, 'msgs');

            // 1. Get User Session & Preferences
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            if (!session?.user?.id) {
                return errorResponse('You must be logged in to generate a meal plan.', ErrorCode.UNAUTHORIZED);
            }

            // Fetch full preferences for context if not passed explicitly
            let userPrefsContext = preferences || '';
            if (!userPrefsContext) {
                const prisma = (await import('@/lib/prisma')).default;
                const onboarding = await prisma.onboardingData.findUnique({
                    where: { userId: session.user.id }
                });
                if (onboarding) {
                    userPrefsContext = `Dietary: ${onboarding.dietaryPreference}, Goal: ${onboarding.goal}, Cuisines: ${onboarding.cuisinePreferences.join(', ')} `;
                }
            }

            // 2. Generate DIFFERENT Meal Plan using AI SDK with HIGHER temperature and explicit variation instructions
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'),
                temperature: 0.9, // HIGHER temperature for more variation
                schema: z.object({
                    title: z.string().describe('A catchy title for this meal plan'),
                    days: z.array(z.object({
                        day: z.number(),
                        meals: z.array(z.object({
                            name: z.string(),
                            description: z.string(),
                            ingredients: z.array(z.string()),
                            instructions: z.string(),
                        }))
                    }))
                }),
                prompt: `Generate a COMPLETELY DIFFERENT personalized meal plan for ${duration} days with ${mealsPerDay} meals per day.

🚨 CRITICAL: This is a MODIFICATION / ALTERNATIVE request.You MUST generate DIFFERENT meals from what was previously suggested.
    ${differentFrom ? `\n🚨 AVOID THESE: ${differentFrom}\n` : ''}

## User's Recent Chat Context (HIGHEST PRIORITY)
${chatMessages?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No recent context.'}

## Saved User Preferences(Use as default, but OVERRIDE if Chat Context conflicts)
${userPrefsContext || 'No saved preferences. Use balanced diet.'}

## VARIATION REQUIREMENTS(CRITICAL)
1. ** Different Meals:** Generate COMPLETELY DIFFERENT meals from any previous suggestions
2. ** Different Cuisines:** Explore different cuisines and cooking styles
3. ** Variety:** Ensure maximum diversity and creativity
4. ** Fresh Ideas:** Think outside the box - suggest unexpected but delicious combinations
5. ** Specific Requests:** Still honor user's specific food requests if mentioned in chat context

## Standard Requirements
1. ** Completeness:** For each meal, provide name, description, ingredients list, and instructions
2. ** Structure:** Generate exactly ${duration} days with ${mealsPerDay} meals each

Return a valid JSON object.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate modified meal plan data');
            }

            const mealPlanData = {
                title: result.object.title,
                duration,
                mealsPerDay,
                days: result.object.days
            };

            // 3. Create UI Metadata for Save Button
            const uiMetadata = {
                actions: [
                    {
                        label: 'Save Meal Plan',
                        action: 'save' as const,
                        data: mealPlanData,
                    },
                ],
                mealPlan: mealPlanData,
            };

            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            // 4. Return Success Response
            const totalMeals = mealPlanData.days.reduce((sum, day) => sum + day.meals.length, 0);

            return successResponse(
                {
                    mealPlan: mealPlanData,
                },
                `✅ Generated alternative ${duration} -day meal plan: "${mealPlanData.title}".Includes ${totalMeals} different meals. [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[modifyMealPlan] Error:', error);
            return errorResponse(error instanceof Error ? error.message : 'Unknown error', ErrorCode.GENERATION_FAILED, true);
        }
    },
});



// ============================================================================
// OPTIMIZE GROCERY LIST TOOL
// ============================================================================

export const optimizeGroceryList = tool({
    description: 'Optimize a grocery list by finding the best prices and substitutions at specific stores.',
    parameters: z.object({
        listId: z.string().optional().describe('ID of the grocery list to optimize'),
        storeIds: z.array(z.string()).optional().describe('List of preferred store IDs (e.g., "partner_store_nairobi")'),
        items: z.array(z.object({
            item: z.string(),
            quantity: z.string(),
        })).optional().describe('List of items if no listId is provided'),
    }),
    execute: async ({ listId, storeIds, items }, options): Promise<ToolResult> => {
        try {
            console.log('[optimizeGroceryList] 🛒 Optimizing list...', { listId, storeIds });

            // 1. Resolve Items
            let itemsToOptimize = items || [];
            if (!itemsToOptimize.length && listId) {
                // In a real app, fetch from DB. For now, check context or error.
                // @ts-ignore
                const context = (options as any)?.context;
                const lastList = context?.lastToolResult?.generateGroceryList?.data?.groceryList;
                if (lastList) {
                    itemsToOptimize = lastList;
                }
            }

            if (!itemsToOptimize.length) {
                return errorResponse('No items found to optimize.', ErrorCode.INVALID_INPUT);
            }

            // 2. Simulate Optimization with AI
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'),
                temperature: 0.2,
                schema: z.object({
                    optimizedItems: z.array(z.object({
                        originalItem: z.string(),
                        optimizedItem: z.string().describe('Brand or specific product match'),
                        store: z.string(),
                        price: z.number(),
                        savings: z.number().optional(),
                        reason: z.string().optional().describe('Why this was chosen (e.g. "Best value", "On sale")'),
                    })),
                    totalCost: z.number(),
                    totalSavings: z.number(),
                }),
                prompt: `Optimize this grocery list for stores: ${storeIds?.join(', ') || 'Best local stores'}.
Items: ${JSON.stringify(itemsToOptimize)}
                
                Find the best value options, suggest specific brands or substitutions where appropriate to save money or improve quality.`,
            });

            if (!result.object) {
                throw new Error('Failed to optimize list');
            }

            const optimizationResult = result.object;
            const uiMetadata = { optimization: optimizationResult };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                { optimization: optimizationResult },
                `✅ Optimized your grocery list! Total estimated cost: $${optimizationResult.totalCost.toFixed(2)} (Savings: $${optimizationResult.totalSavings.toFixed(2)}).[UI_METADATA: ${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[optimizeGroceryList] Error:', error);
            return errorResponse('Failed to optimize grocery list.', ErrorCode.INTERNAL_ERROR);
        }
    },
});

// ============================================================================
// SWAP MEAL TOOL
// ============================================================================

export const swapMeal = tool({
    description: 'Swap a specific meal in a meal plan with a new option based on user preferences. Use this when the user wants to change just ONE meal (e.g., "Change Tuesday dinner") while keeping the rest of the plan.',
    parameters: z.object({
        day: z.number().describe('The day number to swap (e.g., 1 for Day 1)'),
        mealIndex: z.number().describe('The index of the meal to swap (0 for Breakfast, 1 for Lunch, 2 for Dinner, etc.)'),
        reason: z.string().optional().describe('Why the user wants to swap (e.g., "I don\'t like fish", "Make it vegetarian")'),
    }),
    execute: async ({ day, mealIndex, reason }, options): Promise<ToolResult> => {
        try {
            console.log(`[swapMeal] 🔄 Swapping meal for Day ${day}, Index ${mealIndex}.Reason: ${reason || 'None'} `);

            // 1. Get Current Meal Plan from Context
            // @ts-ignore - context is injected by ToolExecutor via options
            const context = (options as any)?.context;

            // Look for the most recent meal plan in the context history
            // It could be from generateMealPlan, modifyMealPlan, or even a previous swapMeal
            const lastMealPlan =
                context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                context?.lastToolResult?.swapMeal?.data?.mealPlan;

            if (!lastMealPlan) {
                console.error('[swapMeal] ❌ No active meal plan found in context');
                return errorResponse("I can't find an active meal plan to modify. Please generate one first.", ErrorCode.INVALID_INPUT);
            }

            // 2. Validate Target
            const targetDay = lastMealPlan.days.find((d: any) => d.day === day);
            if (!targetDay) {
                return errorResponse(`Day ${day} not found in the current plan.`, ErrorCode.INVALID_INPUT);
            }

            const targetMeal = targetDay.meals[mealIndex];
            if (!targetMeal) {
                return errorResponse(`Meal index ${mealIndex} not found for Day ${day}.`, ErrorCode.INVALID_INPUT);
            }

            console.log(`[swapMeal] 🎯 Target: ${targetMeal.name} `);

            // 3. Generate NEW Meal using AI
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'),
                temperature: 0.8, // High temperature for variety
                schema: z.object({
                    name: z.string(),
                    description: z.string(),
                    ingredients: z.array(z.string()),
                    instructions: z.string(),
                }),
                prompt: `Generate a replacement meal for Day ${day}, Meal ${mealIndex + 1} of a meal plan.
                
CURRENT MEAL(To Replace): "${targetMeal.name}" - ${targetMeal.description}
REASON FOR SWAP: ${reason || "User wants something different"}

CONTEXT(Other meals in the plan to avoid repetition):
${lastMealPlan.days.map((d: any) => `Day ${d.day}: ${d.meals.map((m: any) => m.name).join(', ')}`).join('\n')}

INSTRUCTIONS:
1. Generate a COMPLETELY DIFFERENT meal than the current one.
2. Respect the "Reason for Swap" strictly(e.g.if "vegetarian", no meat).
3. Ensure it fits the meal type(Breakfast / Lunch / Dinner) based on index ${mealIndex}.
4. Provide full details(ingredients, instructions).

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate new meal');
            }

            const newMeal = result.object;

            // 4. Construct Updated Plan
            // Deep copy the plan to avoid mutating the context directly (though context is likely immutable/copied)
            const updatedPlan = JSON.parse(JSON.stringify(lastMealPlan));
            updatedPlan.days.find((d: any) => d.day === day).meals[mealIndex] = newMeal;

            // 5. Create UI Metadata
            const uiMetadata = {
                actions: [
                    {
                        label: 'Save Updated Plan',
                        action: 'save' as const,
                        data: updatedPlan,
                    },
                ],
                mealPlan: updatedPlan, // Render the FULL updated plan
            };

            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    mealPlan: updatedPlan,
                    swappedMeal: newMeal,
                    originalMeal: targetMeal
                },
                `✅ Swapped Day ${day} meal! Replaced "${targetMeal.name}" with "${newMeal.name}". [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[swapMeal] Error:', error);
            return errorResponse("Failed to swap meal.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});



export const searchRecipes = tool({
    description: 'Search for recipes based on a query. Use this when user asks to "find", "search", or "suggest" recipes without asking for a full meal plan (e.g., "Find me a spicy chicken pasta recipe", "Vegan breakfast ideas").',
    parameters: z.object({
        query: z.string().describe('The search query or description of the recipe(s) to find.'),
        count: z.number().min(1).max(5).default(3).describe('Number of recipes to return (default 3).'),
    }),
    execute: async ({ query, count }): Promise<ToolResult> => {
        try {
            console.log(`[searchRecipes] 🔍 Searching for "${query}"(Limit: ${count})`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.7,
                schema: z.object({
                    recipes: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                        prepTime: z.string(),
                        calories: z.number().optional(),
                        tags: z.array(z.string()),
                        sourceUrl: z.string().optional().describe('URL to the original recipe if found'),
                        imageUrl: z.string().optional().describe('Image URL from the search result if available'),
                    }))
                }),
                prompt: `Find ${count} distinct, highly - rated recipes for: "${query}".
                
## INSTRUCTIONS:
1. ** USE SEARCH RESULTS:** You MUST find REAL recipes from reputable cooking websites using the search results.
2. ** SOURCE URLS:** You MUST extract the actual URL of the recipe into 'sourceUrl'.
3. ** IMAGES:** You MUST extract the actual image URL from the search result into 'imageUrl' if available.
4. ** DETAILS:** Extract accurate prep times, calories, and tags from the search result.

Return valid JSON with a list of recipes found.`,
            });

            if (!result.object?.recipes) {
                throw new Error('Failed to generate recipes');
            }

            const recipes = result.object.recipes;

            // Create UI metadata
            const uiMetadata = {
                recipeResults: recipes,
                query: query
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    recipes: recipes,
                    query: query
                },
                `✅ Found ${recipes.length} recipes for "${query}". [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[searchRecipes] Error:', error);
            return errorResponse("I couldn't find any recipes matching that description. Please try a different search.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// SEARCH FOOD DATA TOOL - THE ONLY SEARCH-GROUNDED TOOL
// ============================================================================

export const searchFoodData = tool({
    description: `Search for real-world, up-to-date food data. This is the ONLY tool with search grounding enabled. Use when user asks about:
- Real nutrition facts ("calories in ugali", "protein in 100g omena", "KFC Zinger nutrition")
- Kenyan/African foods ("calories in matoke", "nduma nutrition", "nyama choma macros")
- Food prices ("price of 1kg beef in Nairobi", "milk price at Naivas")
- Food availability ("where to buy quinoa in Kenya", "is almond flour available locally")
- Ingredient substitutions ("alternative to heavy cream", "butter substitute")
- Health facts ("are mangoes high in sugar", "do bananas cause weight gain", "foods high in iron")`,
    parameters: z.object({
        query: z.string().describe('The food-related question or search query'),
        queryType: z.enum([
            'nutrition',      // Calories, macros, vitamins, minerals
            'price',          // Local food prices
            'availability',   // Where to buy, local availability
            'substitution',   // Ingredient alternatives
            'health_fact',    // General health/nutrition facts
            'comparison',     // Compare two foods
        ]).describe('Type of food data being requested'),
        foodItem: z.string().optional().describe('Specific food item being queried (e.g., "ugali", "KFC Zinger")'),
        location: z.string().optional().describe('Location context for prices/availability (e.g., "Nairobi", "Kenya")'),
    }),
    execute: async ({ query, queryType, foodItem, location }): Promise<ToolResult> => {
        try {
            console.log(`[searchFoodData] 🔍 Query: "${query}" | Type: ${queryType}`);

            // 1. Get User Location for Context
            let userLocation = location || '';
            if (!userLocation) {
                try {
                    const { auth } = await import('@/lib/auth');
                    const { headers } = await import('next/headers');
                    const session = await auth.api.getSession({ headers: await headers() });
                    if (session?.user?.id) {
                        const { getLocationDataWithCaching } = await import('@/lib/location');
                        const locationData = await getLocationDataWithCaching(session.user.id, session.session.id);
                        userLocation = `${locationData.city || ''}, ${locationData.country || 'Kenya'}`;
                    }
                } catch (e) {
                    userLocation = 'Kenya'; // Default fallback
                }
            }

            // 2. Build Query-Type Specific Schema
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true, // ⭐ THE KEY - REAL WEB SEARCH
                }),
                temperature: 0.1, // Low temperature for factual accuracy
                schema: z.object({
                    query: z.string(),
                    queryType: z.string(),
                    foodItem: z.string().optional(),

                    // Nutrition Data (if applicable)
                    nutrition: z.object({
                        servingSize: z.string().optional(),
                        calories: z.number().optional(),
                        protein: z.number().optional(),
                        carbs: z.number().optional(),
                        fat: z.number().optional(),
                        fiber: z.number().optional(),
                        sugar: z.number().optional(),
                        sodium: z.number().optional(),
                        vitamins: z.array(z.object({
                            name: z.string(),
                            amount: z.string(),
                            dailyValue: z.string().optional(),
                        })).optional(),
                        minerals: z.array(z.object({
                            name: z.string(),
                            amount: z.string(),
                            dailyValue: z.string().optional(),
                        })).optional(),
                        glycemicIndex: z.number().optional(),
                        allergens: z.array(z.string()).optional(),
                    }).optional(),

                    // Price Data (if applicable)
                    pricing: z.object({
                        item: z.string(),
                        prices: z.array(z.object({
                            store: z.string(),
                            price: z.string(),
                            unit: z.string(),
                            notes: z.string().optional(),
                        })),
                        averagePrice: z.string().optional(),
                        currency: z.string(),
                        lastUpdated: z.string().optional(),
                    }).optional(),

                    // Availability Data (if applicable)
                    availability: z.object({
                        item: z.string(),
                        isAvailableLocally: z.boolean(),
                        stores: z.array(z.object({
                            name: z.string(),
                            location: z.string().optional(),
                            notes: z.string().optional(),
                        })),
                        alternatives: z.array(z.string()).optional(),
                        onlineOptions: z.array(z.string()).optional(),
                    }).optional(),

                    // Substitution Data (if applicable)
                    substitutions: z.array(z.object({
                        name: z.string(),
                        ratio: z.string(),
                        notes: z.string(),
                        bestFor: z.array(z.string()).optional(),
                    })).optional(),

                    // Health Facts (if applicable)
                    healthFacts: z.object({
                        summary: z.string(),
                        benefits: z.array(z.string()).optional(),
                        concerns: z.array(z.string()).optional(),
                        recommendation: z.string().optional(),
                    }).optional(),

                    // Comparison Data (if applicable)
                    comparison: z.object({
                        items: z.array(z.string()),
                        winner: z.string().optional(),
                        summary: z.string(),
                        differences: z.array(z.object({
                            metric: z.string(),
                            values: z.array(z.string()),
                        })).optional(),
                    }).optional(),

                    // Sources
                    sources: z.array(z.object({
                        name: z.string(),
                        url: z.string().optional(),
                    })).optional(),

                    // Summary
                    summary: z.string().describe('A concise answer to the user query'),
                }),
                prompt: `You are a food data specialist with access to real-world databases. Search and extract ACCURATE, VERIFIED data.

## USER QUERY
"${query}"

## QUERY TYPE
${queryType}

## FOOD ITEM
${foodItem || 'Not specified'}

## USER LOCATION
${userLocation || 'Kenya'}

## CRITICAL INSTRUCTIONS
1. **USE SEARCH:** You MUST use search grounding to find REAL data. Do NOT guess or hallucinate.
2. **SOURCES:** Include the sources where you found the data (USDA, nutritional databases, local supermarket sites, etc.).
3. **ACCURACY:** For nutrition, use verified sources like USDA, Kenya Nutrition Tables, or official brand data.
4. **LOCAL CONTEXT:** For prices/availability, focus on ${userLocation || 'Kenyan'} markets (Naivas, Carrefour, Quickmart, local markets).
5. **KENYAN FOODS:** If asking about local foods (ugali, matoke, nduma, omena, nyama choma), use East African nutritional data.
6. **BE SPECIFIC:** Include exact values with units (g, mg, kcal, KES, etc.).

## QUERY-SPECIFIC FOCUS
${queryType === 'nutrition' ? '- Extract complete nutritional breakdown per serving\n- Include vitamins and minerals if available\n- Note allergens and glycemic index' : ''}
${queryType === 'price' ? '- Find CURRENT prices from local supermarkets\n- Include multiple stores for comparison\n- Specify currency (KES/USD)' : ''}
${queryType === 'availability' ? '- Check if item is available in local markets\n- Suggest specific stores and locations\n- Offer alternatives if not available' : ''}
${queryType === 'substitution' ? '- Provide 3-5 substitutes ranked by effectiveness\n- Include exact ratios\n- Note taste/texture differences' : ''}
${queryType === 'health_fact' ? '- Provide evidence-based health information\n- Cite studies or reputable sources\n- Give balanced pros and cons' : ''}
${queryType === 'comparison' ? '- Compare nutritionally and practically\n- Declare a winner with reasoning\n- Use a table format internally' : ''}

Return valid JSON with ONLY the relevant sections populated.`,
            });

            if (!result.object) {
                throw new Error('Failed to search food data');
            }

            const foodData = result.object;

            // 3. Create UI Metadata
            const uiMetadata = {
                foodData: foodData,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                foodData,
                `✅ ${foodData.summary} [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[searchFoodData] Error:', error);
            return errorResponse("I couldn't find that food information. Please try rephrasing your question.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

export const generateMealRecipe = tool({
    description: 'Generate a detailed recipe for a specific dish. Use this when the user asks for a specific recipe (e.g. "Recipe for Chapati", "How to make Sushi") or clicks on a recipe suggestion.',
    parameters: z.object({
        name: z.string().describe('The name of the dish to generate a recipe for.'),
        description: z.string().optional().describe('Additional context or preferences (e.g. "spicy", "vegan").'),
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
        })).optional().describe('Recent chat messages to understand context and specific requests'),
    }),
    execute: async ({ name, description, chatMessages }): Promise<ToolResult> => {
        try {
            console.log(`[generateMealRecipe] 🍳 Generating recipe for "${name}"...`);

            // 1. Get User Session & Preferences
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            let userPrefsContext = '';
            if (session?.user?.id) {
                const prisma = (await import('@/lib/prisma')).default;
                const onboarding = await prisma.onboardingData.findUnique({
                    where: { userId: session.user.id }
                });
                if (onboarding) {
                    userPrefsContext = `User Preferences: Dietary: ${onboarding.dietaryPreference}, Goal: ${onboarding.goal}, Cuisines: ${onboarding.cuisinePreferences.join(', ')}`;
                }
            }

            // 2. Generate Recipe with AI SDK
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true, // Enable search for accurate recipe data
                }),
                temperature: 0.4,
                schema: z.object({
                    name: z.string(),
                    description: z.string(),
                    prepTime: z.string(),
                    cookTime: z.string(),
                    totalTime: z.string(),
                    servings: z.number(),
                    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
                    calories: z.number(),
                    ingredients: z.array(z.string()),
                    instructions: z.array(z.string()),
                    tags: z.array(z.string()),
                    nutrition: z.object({
                        calories: z.number(),
                        protein: z.number(),
                        carbs: z.number(),
                        fat: z.number(),
                        fiber: z.number().optional(),
                    }),
                    tips: z.array(z.string()).describe('Chef tips for best results'),
                    variations: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                    })).describe('Recipe variations (e.g., vegan, spicy, etc.)'),
                    sourceUrl: z.string().optional().describe('URL to original recipe if found via search'),
                }),
                prompt: `Generate a detailed, accurate recipe for "${name}"${description ? ` (${description})` : ''}.

## User Context
${userPrefsContext || 'No saved preferences.'}

## Recent Chat Context (if relevant)
${chatMessages?.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No recent context.'}

## INSTRUCTIONS
1. **USE SEARCH:** Find REAL recipes from reputable sources. Extract accurate measurements and techniques.
2. **Respect Preferences:** If user has dietary restrictions, adapt the recipe accordingly.
3. **Include Details:** Provide accurate prep/cook times, servings, and nutritional info per serving.
4. **Chef Tips:** Add 2-3 practical tips for best results.
5. **Variations:** Suggest 2-3 recipe variations (e.g., healthier, spicier, vegan).
6. **Source:** If found from a real recipe site, include the sourceUrl.

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate recipe');
            }

            const recipe = {
                ...result.object,
                // Use random Cloudinary image for variety
                imageUrl: getRandomRecipeImage()
            };

            // 3. Create UI Metadata with Save Action
            const uiMetadata = {
                actions: [
                    {
                        label: 'Save Recipe',
                        action: 'save_recipe' as const,
                        data: recipe,
                    },
                ],
                mealRecipe: recipe,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    recipe: recipe
                },
                `✅ Here is the recipe for "${recipe.name}". [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[generateMealRecipe] Error:', error);
            return errorResponse("Failed to generate recipe.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// INGREDIENT SUBSTITUTIONS TOOL
// ============================================================================

export const suggestIngredientSubstitutions = tool({
    description: 'Suggest ingredient substitutions for dietary restrictions, allergies, preferences, availability, or health goals. Use when user asks to "replace", "substitute", "swap", or "alternative for" an ingredient.',
    parameters: z.object({
        ingredient: z.string().describe('The ingredient to substitute (e.g., "eggs", "butter", "flour")'),
        reason: z.enum(['allergy', 'vegan', 'vegetarian', 'healthier', 'cheaper', 'unavailable', 'preference', 'keto', 'low-carb', 'gluten-free']).describe('Why the substitution is needed'),
        recipeContext: z.string().optional().describe('The recipe or dish context (e.g., "brownies", "stir fry") to ensure substitution works'),
        quantity: z.string().optional().describe('Original quantity to calculate substitution ratios'),
    }),
    execute: async ({ ingredient, reason, recipeContext, quantity }): Promise<ToolResult> => {
        try {
            console.log(`[suggestIngredientSubstitutions] 🔄 Finding substitutes for "${ingredient}" (${reason})`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.3,
                schema: z.object({
                    originalIngredient: z.string(),
                    substitutions: z.array(z.object({
                        name: z.string().describe('Name of the substitute'),
                        ratio: z.string().describe('Substitution ratio (e.g., "1:1", "1 egg = 1/4 cup applesauce")'),
                        notes: z.string().describe('Important notes about using this substitute'),
                        bestFor: z.array(z.string()).describe('What types of recipes this works best for'),
                        nutritionChange: z.object({
                            calories: z.string().optional(),
                            protein: z.string().optional(),
                            carbs: z.string().optional(),
                            fat: z.string().optional(),
                        }).optional(),
                        difficulty: z.enum(['easy', 'moderate', 'advanced']),
                    })),
                    bestMatch: z.string().describe('The single best substitution for this context'),
                    tip: z.string().describe('A helpful tip for successful substitution'),
                }),
                prompt: `You are a culinary expert specializing in ingredient substitutions.

## SUBSTITUTION REQUEST
- **Ingredient:** ${ingredient}${quantity ? ` (${quantity})` : ''}
- **Reason:** ${reason}
- **Recipe Context:** ${recipeContext || 'General cooking'}

## INSTRUCTIONS
1. **USE SEARCH:** Find ACCURATE, REAL substitution ratios from trusted culinary sources.
2. **Provide 3-5 alternatives** ranked by how well they work for this specific context.
3. **Include ratios:** Be specific (e.g., "1 egg = 3 tbsp aquafaba, whipped").
4. **Note texture/flavor changes:** Warn about any significant differences.
5. **Nutrition impact:** Note if the substitute is higher/lower in calories, protein, etc.

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate substitution suggestions');
            }

            const uiMetadata = {
                substitutions: result.object,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    ...result.object,
                },
                `✅ Found ${result.object.substitutions.length} substitutes for ${ingredient}. Best match: ${result.object.bestMatch}. [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[suggestIngredientSubstitutions] Error:', error);
            return errorResponse('Failed to find ingredient substitutions.', ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// SEASONAL INGREDIENTS TOOL
// ============================================================================

export const getSeasonalIngredients = tool({
    description: 'Get seasonal ingredients for the user\'s location. Use when user asks about "what\'s in season", "seasonal produce", or "fresh local ingredients". Also useful for suggesting cheaper, fresher options.',
    parameters: z.object({
        category: z.enum(['all', 'fruits', 'vegetables', 'herbs', 'seafood']).default('all').describe('Type of seasonal ingredients to find'),
        includeRecipes: z.boolean().default(true).describe('Whether to include recipe suggestions using seasonal items'),
    }),
    execute: async ({ category, includeRecipes }, options): Promise<ToolResult> => {
        try {
            console.log(`[getSeasonalIngredients] 🌿 Finding seasonal ${category}...`);

            // Get user location
            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            let location = { city: 'San Francisco', country: 'US', hemisphere: 'northern' };

            if (session?.user?.id) {
                const { getLocationDataWithCaching } = await import('@/lib/location');
                const locationData = await getLocationDataWithCaching(session.user.id, session.session.id);
                location = {
                    city: locationData.city || 'San Francisco',
                    country: locationData.country || 'US',
                    hemisphere: (locationData as any).latitude && (locationData as any).latitude < 0 ? 'southern' : 'northern'
                };
            }

            // Get current month for seasonality
            const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.4,
                schema: z.object({
                    season: z.string().describe('Current season name'),
                    location: z.string(),
                    seasonalItems: z.array(z.object({
                        name: z.string(),
                        category: z.string(),
                        peakMonths: z.string(),
                        priceAdvantage: z.string().describe('e.g., "30% cheaper than off-season"'),
                        localTip: z.string().optional().describe('Where to find locally or local name'),
                    })),
                    recipeSuggestions: z.array(z.object({
                        name: z.string(),
                        featuredIngredient: z.string(),
                        description: z.string(),
                    })).optional(),
                    shoppingTip: z.string(),
                }),
                prompt: `You are a local produce expert.

## LOCATION & TIME
- **City:** ${location.city}
- **Country:** ${location.country}
- **Hemisphere:** ${location.hemisphere}
- **Current Month:** ${currentMonth}

## TASK
Find what ${category === 'all' ? 'produce, fruits, vegetables, and herbs are' : category + ' are'} currently IN SEASON in ${location.city}, ${location.country}.

## INSTRUCTIONS
1. **USE SEARCH:** Find ACCURATE seasonal produce for this specific location and time of year.
2. **Include 8-12 seasonal items** that are at peak freshness RIGHT NOW.
3. **Price advantage:** Note typical savings compared to off-season.
4. **Local names:** Include local market names if different (e.g., "sukuma wiki" for kale in Kenya).
${includeRecipes ? '5. **Recipe suggestions:** Include 3 simple recipes using these seasonal items.' : ''}

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to get seasonal ingredients');
            }

            const uiMetadata = {
                seasonal: result.object,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    ...result.object,
                },
                `✅ Found ${result.object.seasonalItems.length} seasonal items for ${result.object.season} in ${location.city}! ${result.object.shoppingTip} [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[getSeasonalIngredients] Error:', error);
            return errorResponse('Failed to get seasonal ingredients.', ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// PLAN FROM INVENTORY TOOL
// ============================================================================

export const planFromInventory = tool({
    description: 'Generate meal suggestions based on ingredients the user already has. Use when user asks "what can I make with...", "I have X, Y, Z...", or "use up my..." ingredients.',
    parameters: z.object({
        ingredients: z.array(z.string()).describe('List of ingredients the user has available'),
        preferences: z.string().optional().describe('Dietary preferences or restrictions'),
        mealType: z.enum(['any', 'breakfast', 'lunch', 'dinner', 'snack']).default('any'),
        maxCookTime: z.number().optional().describe('Maximum cooking time in minutes'),
    }),
    execute: async ({ ingredients, preferences, mealType, maxCookTime }): Promise<ToolResult> => {
        try {
            console.log(`[planFromInventory] 🏠 Planning with ${ingredients.length} ingredients...`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash', {
                    useSearchGrounding: true,
                }),
                temperature: 0.6,
                schema: z.object({
                    possibleMeals: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                        ingredientsUsed: z.array(z.string()),
                        additionalNeeded: z.array(z.string()).describe('Ingredients needed but not in inventory'),
                        cookTime: z.string(),
                        difficulty: z.enum(['easy', 'medium', 'hard']),
                        matchScore: z.number().min(0).max(100).describe('How well this uses available ingredients'),
                    })),
                    bestMatch: z.object({
                        name: z.string(),
                        reason: z.string(),
                    }),
                    shoppingListAdditions: z.array(z.string()).describe('Common items to buy to unlock more recipes'),
                    tip: z.string(),
                }),
                prompt: `You are a resourceful home chef.

## AVAILABLE INGREDIENTS
${ingredients.map(i => `- ${i}`).join('\n')}

## CONSTRAINTS
- Meal type: ${mealType}
- Preferences: ${preferences || 'None specified'}
${maxCookTime ? `- Max cook time: ${maxCookTime} minutes` : ''}

## TASK
Suggest 4-6 meals that can be made with these ingredients. Prioritize recipes that use MORE of the available ingredients and need FEWER additional items.

## INSTRUCTIONS
1. **USE SEARCH:** Find REAL recipes that work with these combinations.
2. **Match score:** Rate how well each recipe uses the available ingredients (100 = uses all, needs nothing else).
3. **Practical additions:** What 3-5 pantry staples would unlock the most new recipes?
4. **Be creative:** Think of unexpected but delicious combinations.

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to plan from inventory');
            }

            const uiMetadata = {
                inventoryPlan: result.object,
                availableIngredients: ingredients,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    ...result.object,
                },
                `✅ Found ${result.object.possibleMeals.length} meals you can make! Best match: "${result.object.bestMatch.name}" - ${result.object.bestMatch.reason} [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[planFromInventory] Error:', error);
            return errorResponse('Failed to plan from inventory.', ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// MEAL PREP TIMELINE TOOL
// ============================================================================

export const generatePrepTimeline = tool({
    description: 'Generate an optimized meal prep timeline/schedule. Use when user wants to "batch cook", "meal prep", "prep ahead", or asks "how to prepare multiple meals efficiently".',
    parameters: z.object({
        recipes: z.array(z.string()).describe('List of recipe names to prep'),
        targetDate: z.string().optional().describe('When the meals should be ready (e.g., "Sunday dinner", "this week")'),
        prepStyle: z.enum(['batch', 'same-day', 'week-ahead']).default('batch').describe('Prep strategy'),
        availableTime: z.number().optional().describe('Available prep time in minutes'),
    }),
    execute: async ({ recipes, targetDate, prepStyle, availableTime }): Promise<ToolResult> => {
        try {
            // Validate recipes array
            if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
                console.error('[generatePrepTimeline] ❌ No recipes provided');
                return errorResponse('No recipes provided. Please specify which recipes to prep.', ErrorCode.INVALID_INPUT, true);
            }

            // Filter out empty recipe names
            const validRecipes = recipes.filter(r => r && typeof r === 'string' && r.trim().length > 0);
            
            if (validRecipes.length === 0) {
                console.error('[generatePrepTimeline] ❌ No valid recipes found');
                return errorResponse('No valid recipe names found. Please provide recipe names.', ErrorCode.INVALID_INPUT, true);
            }

            console.log(`[generatePrepTimeline] ⏱️ Creating prep timeline for ${validRecipes.length} recipes:`, validRecipes);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'),
                temperature: 0.3,
                schema: z.object({
                    prepDate: z.string(),
                    totalActiveTime: z.number().describe('Total hands-on time in minutes'),
                    totalPassiveTime: z.number().describe('Total waiting/cooking time in minutes'),
                    timeline: z.array(z.object({
                        time: z.string().describe('Time marker (e.g., "0:00", "0:15")'),
                        duration: z.number().describe('Duration in minutes'),
                        action: z.string().describe('What to do'),
                        recipe: z.string().describe('Which recipe this is for'),
                        type: z.enum(['active', 'passive']),
                        parallelTask: z.string().optional().describe('What else can be done during this step'),
                    })),
                    storageInstructions: z.array(z.object({
                        item: z.string(),
                        method: z.string(),
                        duration: z.string(),
                        reheatingTip: z.string(),
                    })),
                    equipmentNeeded: z.array(z.string()),
                    proTips: z.array(z.string()),
                }),
                prompt: `You are a meal prep efficiency expert.

## RECIPES TO PREP
${validRecipes.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## PREP STYLE
- Style: ${prepStyle}
- Target: ${targetDate || 'This week'}
${availableTime ? `- Available time: ${availableTime} minutes` : ''}

## TASK
Create an optimized prep schedule that minimizes total time by:
1. **Batching similar tasks** (e.g., chop all vegetables at once)
2. **Using passive time** (while something bakes, prep the next thing)
3. **Identifying parallel tasks** (what can be done simultaneously)

## INSTRUCTIONS
1. Create a minute-by-minute timeline starting from 0:00.
2. Identify when the oven, stovetop, or appliances can run in parallel.
3. Include storage instructions for prepped items.
4. List all equipment needed upfront so user can prepare.
5. Add 3-5 pro tips for efficient prepping.

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate prep timeline');
            }

            const uiMetadata = {
                prepTimeline: result.object,
                recipes: validRecipes,
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            const totalTime = result.object.totalActiveTime + result.object.totalPassiveTime;
            const hours = Math.floor(totalTime / 60);
            const mins = totalTime % 60;

            return successResponse(
                {
                    ...result.object,
                },
                `✅ Created prep timeline for ${validRecipes.length} recipes! Total time: ${hours > 0 ? hours + 'h ' : ''}${mins}m (${result.object.totalActiveTime}m active). [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[generatePrepTimeline] Error:', error);
            return errorResponse('Failed to generate prep timeline.', ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// SMART PANTRY VISION TOOL
// ============================================================================

export const analyzePantryImage = tool({
    description: 'Analyze an image of a fridge or pantry to identify ingredients. Use this whenever the user uploads an image and asks to "scan my fridge", "check my pantry", or "add these to inventory".',
    parameters: z.object({
        imageUrl: z.string().describe('The URL of the image to analyze.'),
    }),
    execute: async ({ imageUrl }): Promise<ToolResult> => {
        try {
            console.log(`[analyzePantryImage] 📸 Analyzing image: ${imageUrl}`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-3-flash'), // Supports vision
                schema: z.object({
                    items: z.array(z.object({
                        name: z.string(),
                        category: z.enum(['produce', 'dairy', 'protein', 'grains', 'spices', 'other']),
                        quantity: z.string().describe('Estimated quantity (e.g. "2", "1/2 gallon")'),
                        expiryEstimate: z.string().optional().describe('Estimated shelf life (e.g., "1 week", "3 days")'),
                    })),
                    summary: z.string().describe('Brief summary of what was found'),
                }),
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analyze this image and identify all food ingredients visible. Estimate quantities and expiry where possible.' },
                            { type: 'image', image: imageUrl }
                        ],
                    },
                ],
            });

            if (!result.object) {
                throw new Error('Failed to analyze image');
            }

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

        } catch (error) {
            console.error('[analyzePantryImage] Error:', error);
            return errorResponse("Failed to analyze image.", ErrorCode.GENERATION_FAILED, true);
        }
    },
});

// ============================================================================
// UPDATE PANTRY TOOL
// ============================================================================

export const updatePantry = tool({
    description: 'Update the user\'s pantry/inventory with new items or changes. Use this after analyzing an image or when user explicitly adds items.',
    parameters: z.object({
        items: z.array(z.object({
            name: z.string(),
            category: z.string().optional(),
            quantity: z.string().optional(),
            expiryEstimate: z.string().optional(),
        })).describe('List of items to add or update'),
    }),
    execute: async ({ items }): Promise<ToolResult> => {
        try {
            console.log(`[updatePantry] 📝 Updating pantry with ${items.length} items...`);

            const { auth } = await import('@/lib/auth');
            const { headers } = await import('next/headers');
            const session = await auth.api.getSession({ headers: await headers() });

            if (!session?.user?.id) {
                return errorResponse('You must be logged in to update your pantry.', ErrorCode.UNAUTHORIZED);
            }

            const prisma = (await import('@/lib/prisma')).default;

            // Process items in transaction
            await prisma.$transaction(
                items.map(item =>
                    prisma.pantryItem.create({
                        data: {
                            userId: session.user.id,
                            name: item.name,
                            category: item.category || 'Uncategorized',
                            quantity: item.quantity || '1',
                            expiry: item.expiryEstimate ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // Default 1 week if not specific, logic can be improved
                        }
                    })
                )
            );

            return successResponse(
                { count: items.length },
                `✅ Added ${items.length} items to your pantry!`
            );

        } catch (error) {
            console.error('[updatePantry] Error:', error);
            return errorResponse("Failed to update pantry.", ErrorCode.INTERNAL_ERROR, true);
        }
    },
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
};
