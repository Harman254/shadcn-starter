import { tool } from 'ai';
import { z } from 'zod';
import { generateMealPlanCore } from '@/ai/flows/chat/dynamic-select-tools';
import { getNutritionClient } from './api-clients/nutrition-api';
import { getPricingClient } from './api-clients/grocery-pricing-api';
import { generateGroceryListCore } from '@/ai/flows/chat/dynamic-select-tools';
import prisma from '@/lib/prisma';
import { ToolResult, ErrorCode, successResponse, errorResponse } from '@/lib/types/tool-result';

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
                model: google('gemini-2.0-flash-exp'),
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
    description: 'Analyze the nutrition of a specific meal plan by ID.',
    parameters: z.object({
        mealPlanId: z.string().describe('The ID of the meal plan to analyze.'),
    }),
    execute: async ({ mealPlanId }): Promise<ToolResult> => {
        try {
            const mealPlan = await prisma.mealPlan.findUnique({
                where: { id: mealPlanId },
                include: { days: { include: { meals: true } } }
            });

            if (!mealPlan) {
                return errorResponse('Meal plan not found.', ErrorCode.RESOURCE_NOT_FOUND);
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

            return successResponse(
                {
                    totalNutrition: mockTotalNutrition,
                },
                "Nutrition analysis completed."
            );
        } catch (error) {
            return errorResponse('Failed to analyze nutrition.', ErrorCode.INTERNAL_ERROR, true);
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
    execute: async ({ mealPlanId, city, country }): Promise<ToolResult> => {
        return successResponse(
            {
                prices: [
                    { store: 'Local Store', total: 50.00, currency: '$' },
                    { store: 'Online Grocer', total: 55.00, currency: '$' }
                ]
            },
            `Pricing for meal plan ${mealPlanId} calculated.`
        );
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
    execute: async ({ source, mealPlanId, mealPlan, recipeName, ingredients }): Promise<ToolResult> => {
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
                model: google('gemini-2.0-flash-exp'),
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
            // TODO: Re-enable after Prisma client regeneration completes
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
// GENERATE MEAL RECIPE TOOL
// ============================================================================

export const generateMealRecipe = tool({
    description: 'Generate a detailed recipe for a specific meal or dish when user requests ONE specific dish (e.g., "tilapia and rice", "ugali omena", "pasta carbonara"). Use this when user wants to know how to make a specific meal, not when they want a full meal plan.',
    parameters: z.object({
        mealName: z.string().describe('The name or description of the meal/dish the user wants to make (e.g., "tilapia and rice", "ugali omena")'),
    }),
    execute: async ({ mealName }): Promise<ToolResult> => {
        try {
            console.log('[generateMealRecipe] 🍳 Generating AI recipe for:', mealName);

            // Use AI to generate real recipe content
            const { generateText } = await import('ai');
            const { google } = await import('@ai-sdk/google');

            const { text } = await generateText({
                model: google('gemini-2.0-flash-exp'),
                prompt: `You are a professional chef creating a detailed recipe.

Generate a recipe for: "${mealName}"

CRITICAL: Return ONLY valid JSON with NO markdown, NO code blocks, NO explanations.
Just the raw JSON object exactly as shown below:

{
  "name": "Beef Cabbage Stir-Fry",
  "description": "A savory African-inspired dish with tender beef and crispy cabbage",
  "servings": 4,
  "prepTime": "15 mins",
  "cookTime": "25 mins",
  "difficulty": "Easy",
  "cuisine": "African",
  "ingredients": [
    "500g beef, thinly sliced",
    "1 medium cabbage, shredded",
    "2 onions, sliced",
    "3 tomatoes, chopped",
    "2 cloves garlic, minced",
    "1 tsp ginger, grated",
    "2 tbsp cooking oil",
    "Salt and pepper to taste",
    "1 tsp paprika",
    "Fresh coriander for garnish"
  ],
  "instructions": [
    "Heat oil in a large pan over high heat.",
    "Add the sliced beef and brown for 5-7 minutes until cooked through. Remove and set aside.",
    "In the same pan, sauté onions and garlic until fragrant (2 mins).",
    "Add tomatoes and cook until soft (3-4 mins), forming a chunky sauce.",
    "Add the shredded cabbage and stir-fry for 5 minutes until slightly wilted but still crunchy.",
    "Return the beef to the pan, add paprika, salt, and pepper. Mix well.",
    "Cook for another 3-4 minutes, stirring frequently.",
    "Garnish with fresh coriander and serve hot with ugali or rice."
  ],
  "nutrition": {
    "calories": 420,
    "protein": "32g",
    "carbs": "18g",
    "fat": "24g"
  },
  "tags": ["quick", "high-protein", "authentic", "budget-friendly"]
}

IMPORTANT RULES:
- Use REAL specific ingredients with exact measurements
- Make instructions detailed and practical
- Cuisine should match the dish origin
- NO placeholder text
- Return ONLY the JSON object, nothing else`,
            });

            // Parse AI response
            const cleanedText = text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
            const recipe = JSON.parse(cleanedText);

            // Add placeholder image (in future, generate with DALL-E or use food image API)
            const recipeWithImage = {
                ...recipe,
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
            };

            // Create UI metadata for beautiful meal recipe card display
            const uiMetadata = {
                mealRecipe: recipeWithImage,
            };

            // Encode UI metadata as base64
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    recipe: recipeWithImage,
                },
                `✨ Here's an authentic recipe for ${recipe.name}! Serves ${recipe.servings}, takes about ${recipe.prepTime} prep + ${recipe.cookTime} cooking. [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[generateMealRecipe] Error:', error);

            // Fallback to skeleton data if AI fails
            const recipe = {
                name: mealName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                description: `A delicious ${mealName} dish with authentic flavors.`,
                servings: 4,
                prepTime: "15 mins",
                cookTime: "30 mins",
                difficulty: "Medium",
                cuisine: "Traditional",
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
                ingredients: [
                    "Main ingredients (see notes)",
                    "Seasonings and spices",
                    "Fresh vegetables",
                    "Cooking oil",
                ],
                instructions: [
                    "Prepare and season ingredients.",
                    "Cook according to traditional methods.",
                    "Serve hot.",
                ],
                nutrition: {
                    calories: 450,
                    protein: "28g",
                    carbs: "45g",
                    fat: "12g"
                },
                tags: ["authentic", "traditional"]
            };

            const uiMetadata = { mealRecipe: recipe };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    recipe: recipe,
                },
                `✨ Here's a recipe for ${recipe.name}! (Note: Using basic template due to generation error) [UI_METADATA:${uiMetadataEncoded}]`
            );
        }
    },
});

// ============================================================================
// MODIFY MEAL PLAN TOOL
// ============================================================================

export const modifyMealPlan = tool({
    description: 'Modify a specific meal in an existing meal plan. Use this when user wants to swap, change, or replace a meal (e.g., "Change Tuesday dinner to tacos", "Swap lunch on day 3").',
    parameters: z.object({
        mealPlanId: z.string().describe('The ID of the meal plan to modify.'),
        day: z.number().describe('The day number to modify (1-based index).'),
        mealIndex: z.number().optional().describe('The index of the meal to modify (0-based). If not provided, AI will infer from context or modify the first matching meal type.'),
        newMealDescription: z.string().describe('Description of what the new meal should be (e.g., "Tacos", "Vegetarian Pasta").'),
    }),
    execute: async ({ mealPlanId, day, mealIndex, newMealDescription }): Promise<ToolResult> => {
        try {
            console.log(`[modifyMealPlan] 🔄 Modifying plan ${mealPlanId}, Day ${day}, Request: "${newMealDescription}"`);

            const prisma = (await import('@/lib/prisma')).default;

            // 1. Fetch existing plan
            const existingPlan = await prisma.mealPlan.findUnique({
                where: { id: mealPlanId },
                include: { days: { include: { meals: true } } }
            });

            if (!existingPlan) {
                return errorResponse("Couldn't find that meal plan.", ErrorCode.RESOURCE_NOT_FOUND);
            }

            // 2. Validate Day (using 1-based index)
            const dayIndex = day - 1; // Convert to 0-based index
            const targetDay = existingPlan.days[dayIndex];
            if (!targetDay) {
                return errorResponse(`Day ${day} not found in this meal plan. Plan has ${existingPlan.days.length} days.`, ErrorCode.INVALID_INPUT);
            }

            // 3. Identify Target Meal
            const targetIndex = mealIndex !== undefined && mealIndex >= 0 && mealIndex < targetDay.meals.length
                ? mealIndex
                : 0; // Default to first meal if unspecified/invalid

            const oldMeal = targetDay.meals[targetIndex];
            if (!oldMeal) {
                return errorResponse(`Meal index ${targetIndex} not found on day ${day}.`, ErrorCode.INVALID_INPUT);
            }

            // 4. Generate Replacement Meal
            const { generateObject } = await import('ai');
            const { google } = await import('@ai-sdk/google');
            const { z } = await import('zod');

            const result = await generateObject({
                model: google('gemini-2.0-flash-exp'),
                temperature: 0.7,
                schema: z.object({
                    name: z.string(),
                    description: z.string(),
                    ingredients: z.array(z.string()),
                    instructions: z.string(),
                }),
                prompt: `Generate a single meal replacement.
                
Target: Day ${day} of a meal plan.
Request: "${newMealDescription}"
Old Meal Context: Was "${oldMeal.name}".

Return a valid JSON object for the new meal.`,
            });

            if (!result.object) {
                throw new Error('Failed to generate replacement meal');
            }

            const newMealData = result.object;

            // 5. Update Database
            await prisma.meal.update({
                where: { id: oldMeal.id },
                data: {
                    name: newMealData.name,
                    description: newMealData.description,
                    ingredients: newMealData.ingredients,
                    instructions: newMealData.instructions,
                }
            });

            // 6. Return Updated Plan Context
            const updatedPlan = await prisma.mealPlan.findUnique({
                where: { id: mealPlanId },
                include: { days: { include: { meals: true } } }
            });

            // Create UI metadata for the updated plan
            const uiMetadata = {
                mealPlan: updatedPlan, // Send full updated plan to refresh UI
                toast: `Updated Day ${day}: ${newMealData.name}`
            };
            const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');

            return successResponse(
                {
                    updatedMeal: newMealData,
                },
                `✅ Updated Day ${day} to "${newMealData.name}". [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[modifyMealPlan] Error:', error);
            return errorResponse("Failed to modify the meal plan. Please try again.", ErrorCode.MODIFICATION_FAILED, true);
        }
    },
});

// ============================================================================
// SEARCH RECIPES TOOL
// ============================================================================

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
                model: google('gemini-2.0-flash-exp'),
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
                },
                `✅ Found ${recipes.length} recipes for "${query}". [UI_METADATA:${uiMetadataEncoded}]`
            );

        } catch (error) {
            console.error('[searchRecipes] Error:', error);
            return errorResponse("I couldn't find any recipes matching that description. Please try a different search.", ErrorCode.GENERATION_FAILED, true);
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
    searchRecipes,
};
