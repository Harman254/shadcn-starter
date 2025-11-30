import { tool } from 'ai';
import { z } from 'zod';
import { generateMealPlanCore } from '@/ai/flows/chat/dynamic-select-tools';
import { getNutritionClient } from './api-clients/nutrition-api';
import { getPricingClient } from './api-clients/grocery-pricing-api';
import { generateGroceryListCore } from '@/ai/flows/chat/dynamic-select-tools';
import prisma from '@/lib/prisma';
import { ToolResult, ErrorCode, successResponse, errorResponse } from '@/lib/types/tool-result';

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
                model: google('gemini-2.0-flash'),
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
4. **Structure:** Generate exactly ${duration} days.

Return a valid JSON object.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate meal plan data');
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
    description: 'Analyze the nutritional value of a meal plan or recipe. Use this when user asks about "nutrition", "calories", "macros", or "healthiness" of the generated plan or dish.',
    parameters: z.object({
        mealPlanId: z.string().optional().describe('The ID of the meal plan to analyze. If not provided, will try to analyze the most recent plan or recipe in context.'),
    }),
    execute: async ({ mealPlanId }, options): Promise<ToolResult> => {
        try {
            console.log('[analyzeNutrition] 🔬 Analyzing nutrition...');

            // 1. Get Context
            // @ts-ignore - context is injected by ToolExecutor via options
            const context = (options as any)?.context;

            let mealPlan;
            let recipe;

            // 2. Resolve Content (Meal Plan or Recipe)
            if (mealPlanId) {
                // Fetch from DB if ID provided
                const prisma = (await import('@/lib/prisma')).default;
                mealPlan = await prisma.mealPlan.findUnique({
                    where: { id: mealPlanId },
                    include: { days: { include: { meals: true } } }
                });
            } else {
                // Get from context
                mealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan;

                recipe =
                    context?.lastToolResult?.generateMealRecipe?.data?.recipe;
            }

            if (!mealPlan && !recipe) {
                return errorResponse("I can't find a meal plan or recipe to analyze. Please generate one first.", ErrorCode.INVALID_INPUT);
            }

            // 3. Prepare Data for Analysis
            let itemsToAnalyze: string[] = [];
            let title = '';
            let type = 'plan';

            if (mealPlan) {
                title = mealPlan.title;
                type = 'plan';
                if (mealPlan.days) {
                    mealPlan.days.forEach((day: any) => {
                        if (day.meals) {
                            day.meals.forEach((meal: any) => {
                                itemsToAnalyze.push(`Day ${day.day} - ${meal.name}: ${(meal.ingredients || []).join(', ')}`);
                            });
                        }
                    });
                }
            } else if (recipe) {
                title = recipe.name;
                type = 'recipe';
                itemsToAnalyze.push(`${recipe.name}: ${(recipe.ingredients || []).join(', ')}`);
            }

            if (itemsToAnalyze.length === 0) {
                return errorResponse('No food items found to analyze.', ErrorCode.INVALID_INPUT);
            }

            // 4. Use AI SDK to analyze nutrition
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                temperature: 0.3,
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
                }),
                prompt: `You are a nutrition expert. Analyze the following ${type} and provide detailed nutrition information.

## ${type === 'plan' ? 'Meal Plan' : 'Recipe'}: "${title}"

## Items:
${itemsToAnalyze.join('\n')}

## Instructions:
1. Calculate TOTAL nutrition.
2. ${type === 'plan' ? 'Calculate DAILY AVERAGE nutrition.' : 'For a single recipe, Daily Average = Total.'}
3. Provide 3-5 actionable insights about the nutritional balance.
4. Give a health score (0-100).
5. Write a concise summary (1-2 sentences).

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
                },
                `✅ Nutrition Analysis: ${nutritionData.summary} (Health Score: ${nutritionData.healthScore}/100) [UI_METADATA:${uiMetadataEncoded}]`
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
    }),
    execute: async ({ mealPlanId, city, country }, options): Promise<ToolResult> => {
        try {
            console.log(`[getGroceryPricing] 💰 Estimating prices...`);

            // 1. Get Context
            // @ts-ignore
            const context = (options as any)?.context;

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
                mealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan;

                recipe =
                    context?.lastToolResult?.generateMealRecipe?.data?.recipe;
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
                model: google('gemini-2.0-flash'),
                temperature: 0.2,
                schema: z.object({
                    prices: z.array(z.object({
                        store: z.string().describe('Store name or type (e.g., "Whole Foods", "Walmart", "Local Market")'),
                        total: z.number().describe('Estimated total cost'),
                        currency: z.string().describe('Currency symbol'),
                        notes: z.string().optional().describe('Brief note about pricing tier')
                    }))
                }),
                prompt: `Estimate the total grocery cost for these ingredients in ${city || 'San Francisco'}, ${country || 'US'}.
                
Ingredients for "${title}":
${allIngredients.slice(0, 50).join(', ')} ${allIngredients.length > 50 ? `...and ${allIngredients.length - 50} more items` : ''}

Provide 3 pricing estimates:
1. Budget/Discount Store (e.g., Walmart, Aldi)
2. Mid-range/Standard Store (e.g., Kroger, Safeway)
3. Premium/Organic Store (e.g., Whole Foods)

Return valid JSON.`,
            });

            if (!result.object?.prices) {
                throw new Error('Failed to generate pricing estimates');
            }

            const uiMetadata = {
                prices: result.object.prices,
                title: title
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    prices: result.object.prices
                },
                `✅ Estimated grocery costs for "${title}": ${result.object.prices.map(p => `${p.store}: ${p.currency}${p.total}`).join(', ')}. [UI_METADATA:${uiMetadataEncoded}]`
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
    description: 'Generate a grocery list with local prices from EITHER a meal plan OR a single recipe/meal. Use this when user wants a shopping list.',
    parameters: z.object({
        source: z.enum(['mealplan', 'recipe']).describe('Whether generating from a meal plan or single recipe'),
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
    }),
    execute: async ({ source, mealPlanId, mealPlan, recipeName, ingredients, fromContext }, options): Promise<ToolResult> => {
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
                allIngredients = dbMealPlan.days.flatMap(d => d.meals.flatMap(m => m.ingredients));
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
                const lastMealPlan =
                    context?.lastToolResult?.generateMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.modifyMealPlan?.data?.mealPlan ||
                    context?.lastToolResult?.swapMeal?.data?.mealPlan;

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
                const lastRecipe = context?.lastToolResult?.generateMealRecipe?.data?.recipe;

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
            const consolidatedListPrompt = allIngredients.map(i => `- ${i}`).join('\n');

            console.log(`[generateGroceryList] Processing ${ingredientCount} ingredients for AI...`);

            // 5. Generate List with AI SDK
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
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
                        localStores: z.array(z.string()),
                    }),
                }),
                prompt: `You are a smart grocery assistant. Convert this list of ingredients into a consolidated shopping list.

## USER LOCATION
- City: ${locationData.city || 'San Francisco'}
- Currency: ${locationData.currencySymbol || '$'}

## INGREDIENTS TO PROCESS
${consolidatedListPrompt}

## INSTRUCTIONS
1. **Consolidate:** Combine similar items (e.g., "2 onions" and "chopped onion" -> "Onions", Quantity: "3").
2. **Categorize:** Group by aisle (Produce, Dairy, Meat, Pantry, Spices).
3. **Price:** Estimate TOTAL price for the quantity in ${locationData.currencySymbol || '$'}.
4. **Stores:** Suggest stores in ${locationData.city || 'San Francisco'}.

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
                    totalEstimatedCost: `${currency}${totalCost.toFixed(2)}`,
                },
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    id: uiMetadata.groceryList.id,
                    items: result.object.groceryList,
                    locationInfo: result.object.locationInfo,
                    totalEstimatedCost: `${currency}${totalCost.toFixed(2)}`
                },
                `✅ Generated and saved grocery list for ${planTitle}! ${result.object.groceryList.length} items, approx ${currency}${totalCost.toFixed(2)}. [UI_METADATA:${uiMetadataEncoded}]`
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
                    userPrefsContext = `Dietary: ${onboarding.dietaryPreference}, Goal: ${onboarding.goal}, Cuisines: ${onboarding.cuisinePreferences.join(', ')}`;
                }
            }

            // 2. Generate DIFFERENT Meal Plan using AI SDK with HIGHER temperature and explicit variation instructions
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
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

🚨 CRITICAL: This is a MODIFICATION/ALTERNATIVE request. You MUST generate DIFFERENT meals from what was previously suggested.
${differentFrom ? `\n🚨 AVOID THESE: ${differentFrom}\n` : ''}

## User's Recent Chat Context (HIGHEST PRIORITY)
${chatMessages?.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n') || 'No recent context.'}

## Saved User Preferences (Use as default, but OVERRIDE if Chat Context conflicts)
${userPrefsContext || 'No saved preferences. Use balanced diet.'}

## VARIATION REQUIREMENTS (CRITICAL)
1. **Different Meals:** Generate COMPLETELY DIFFERENT meals from any previous suggestions
2. **Different Cuisines:** Explore different cuisines and cooking styles
3. **Variety:** Ensure maximum diversity and creativity
4. **Fresh Ideas:** Think outside the box - suggest unexpected but delicious combinations
5. **Specific Requests:** Still honor user's specific food requests if mentioned in chat context

## Standard Requirements
1. **Completeness:** For each meal, provide name, description, ingredients list, and instructions
2. **Structure:** Generate exactly ${duration} days with ${mealsPerDay} meals each

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
                `✅ Generated alternative ${duration}-day meal plan: "${mealPlanData.title}". Includes ${totalMeals} different meals. [UI_METADATA:${uiMetadataEncoded}]`
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
                model: google('gemini-2.0-flash'),
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
                `✅ Optimized your grocery list! Total estimated cost: $${optimizationResult.totalCost.toFixed(2)} (Savings: $${optimizationResult.totalSavings.toFixed(2)}). [UI_METADATA:${uiMetadataEncoded}]`
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
            console.log(`[swapMeal] 🔄 Swapping meal for Day ${day}, Index ${mealIndex}. Reason: ${reason || 'None'}`);

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

            console.log(`[swapMeal] 🎯 Target: ${targetMeal.name}`);

            // 3. Generate NEW Meal using AI
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                temperature: 0.8, // High temperature for variety
                schema: z.object({
                    name: z.string(),
                    description: z.string(),
                    ingredients: z.array(z.string()),
                    instructions: z.string(),
                }),
                prompt: `Generate a replacement meal for Day ${day}, Meal ${mealIndex + 1} of a meal plan.
                
CURRENT MEAL (To Replace): "${targetMeal.name}" - ${targetMeal.description}
REASON FOR SWAP: ${reason || "User wants something different"}

CONTEXT (Other meals in the plan to avoid repetition):
${lastMealPlan.days.map((d: any) => `Day ${d.day}: ${d.meals.map((m: any) => m.name).join(', ')}`).join('\n')}

INSTRUCTIONS:
1. Generate a COMPLETELY DIFFERENT meal than the current one.
2. Respect the "Reason for Swap" strictly (e.g. if "vegetarian", no meat).
3. Ensure it fits the meal type (Breakfast/Lunch/Dinner) based on index ${mealIndex}.
4. Provide full details (ingredients, instructions).

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
            console.log(`[searchRecipes] 🔍 Searching for "${query}" (Limit: ${count})`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                temperature: 0.7,
                schema: z.object({
                    recipes: z.array(z.object({
                        name: z.string(),
                        description: z.string(),
                        prepTime: z.string(),
                        calories: z.number().optional(),
                        tags: z.array(z.string()),
                    }))
                }),
                prompt: `Generate ${count} distinct recipe options for: "${query}".
                
Return valid JSON with a list of recipes.
Keep descriptions concise (1 sentence).`,
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

export const generateMealRecipe = tool({
    description: 'Generate a detailed recipe for a specific dish. Use this when the user asks for a specific recipe (e.g. "Recipe for Chapati", "How to make Sushi") or clicks on a recipe suggestion.',
    parameters: z.object({
        name: z.string().describe('The name of the dish to generate a recipe for.'),
        description: z.string().optional().describe('Additional context or preferences (e.g. "spicy", "vegan").'),
    }),
    execute: async ({ name, description }): Promise<ToolResult> => {
        try {
            console.log(`[generateMealRecipe] 🍳 Generating recipe for "${name}"...`);

            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash'),
                temperature: 0.4,
                schema: z.object({
                    name: z.string(),
                    description: z.string(),
                    prepTime: z.string(),
                    cookTime: z.string(),
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
                    }),
                    imageUrl: z.string().optional().describe('A placeholder image URL for the dish'),
                }),
                prompt: `Generate a detailed recipe for "${name}" ${description ? `(${description})` : ''}.
                
Include:
- Accurate ingredients and step-by-step instructions.
- Nutritional estimate per serving.
- A placeholder image URL from Unsplash (source.unsplash.com/800x600/?<dish-name>).

Return valid JSON.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate recipe');
            }

            const recipe = {
                ...result.object,
                // Use Cloudinary placeholder instead of AI-generated or Unsplash
                imageUrl: 'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg'
            };

            // Create UI metadata
            const uiMetadata = {
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

export const tools = {
    generateMealPlan,
    analyzeNutrition,
    getGroceryPricing,
    generateGroceryList,
    generateMealRecipe,
    modifyMealPlan,
    swapMeal,
    searchRecipes,
};
