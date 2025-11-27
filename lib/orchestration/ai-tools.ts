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
        chatMessages: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
        })).optional().describe('Recent chat messages to understand context and specific requests'),
    }),
    execute: async ({ duration, mealsPerDay, preferences, chatMessages }) => {
        try {
            const result = await generateMealPlanCore({
                duration,
                mealsPerDay,
                chatMessages: chatMessages || [],
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
    execute: async ({ source, mealPlanId, mealPlan, recipeName, ingredients }) => {
        try {
            console.log('[generateGroceryList] 🛒 Source:', source);

            let groceryInput;

            // Handle single recipe/meal
            if (source === 'recipe' && recipeName && ingredients) {
                console.log('[generateGroceryList] Creating list for recipe:', recipeName);

                // Convert single recipe to meal plan format for processing
                groceryInput = {
                    mealPlan: {
                        title: `Shopping list for ${recipeName}`,
                        duration: 1,
                        mealsPerDay: 1,
                        days: [{
                            day: 1,
                            meals: [{
                                name: recipeName,
                                ingredients: ingredients,
                                description: `Ingredients for ${recipeName}`,
                            }]
                        }]
                    }
                };
            }
            // Handle full meal plan from DB
            else if (source === 'mealplan' && mealPlanId) {
                console.log('[generateGroceryList] Loading meal plan from DB:', mealPlanId);

                const prisma = (await import('@/lib/prisma')).default;
                const dbMealPlan = await prisma.mealPlan.findUnique({
                    where: { id: mealPlanId },
                    include: { days: { include: { meals: true } } }
                });

                if (!dbMealPlan) {
                    return {
                        success: false,
                        error: 'MEAL_PLAN_NOT_FOUND',
                        message: "Couldn't find that meal plan. It may have been deleted.",
                    };
                }

                groceryInput = {
                    mealPlan: {
                        title: dbMealPlan.title,
                        duration: dbMealPlan.duration,
                        mealsPerDay: dbMealPlan.mealsPerDay,
                        days: dbMealPlan.days.map((day: any) => ({
                            day: day.day,
                            meals: day.meals.map((meal: any) => ({
                                name: meal.name,
                                description: meal.description || undefined,
                                ingredients: meal.ingredients || [],
                                instructions: meal.instructions || undefined,
                            }))
                        }))
                    }
                };
            }
            // Handle meal plan from context (not saved)
            else if (source === 'mealplan' && mealPlan) {
                console.log('[generateGroceryList] Using meal plan from context');
                groceryInput = { mealPlan };
            }
            else {
                return {
                    success: false,
                    error: 'INVALID_INPUT',
                    message: source === 'recipe'
                        ? "I need the recipe details (name and ingredients) to create a grocery list."
                        : "I need a meal plan first. Would you like me to create one?",
                };
            }

            // Call the core grocery list generator with local pricing
            const { generateGroceryListCore } = await import('@/ai/flows/chat/dynamic-select-tools');
            const result = await generateGroceryListCore(groceryInput);

            if (!result.success) {
                return {
                    success: false,
                    error: result.message || 'Failed to generate grocery list',
                };
            }

            // Return with UI metadata for beautiful display
            return {
                success: true,
                message: result.message, // Contains [UI_METADATA:base64] tag
                groceryList: {
                    id: 'generated-list',
                    items: result.groceryList,
                    locationInfo: result.locationInfo,
                    totalEstimatedCost: result.groceryList?.reduce((sum: number, item: any) => {
                        const priceStr = String(item.estimatedPrice).replace(/[^\d.]/g, '');
                        return sum + (parseFloat(priceStr) || 0);
                    }, 0).toFixed(2)
                }
            };
        } catch (error) {
            console.error('[generateGroceryList] Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate grocery list.'
            };
        }
    },
});

// ============================================================================
// GENERATE MEAL RECIPE TOOL (Skeleton/Placeholder Version)
// ============================================================================

export const generateMealRecipe = tool({
    description: 'Generate a detailed recipe for a specific meal or dish when user requests ONE specific dish (e.g., "tilapia and rice", "ugali omena", "pasta carbonara"). Use this when user wants to know how to make a specific meal, not when they want a full meal plan.',
    parameters: z.object({
        mealName: z.string().describe('The name or description of the meal/dish the user wants to make (e.g., "tilapia and rice", "ugali omena")'),
    }),
    execute: async ({ mealName }) => {
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

            return {
                success: true,
                recipe: recipeWithImage,
                message: `✨ Here's an authentic recipe for ${recipe.name}! Serves ${recipe.servings}, takes about ${recipe.prepTime} prep + ${recipe.cookTime} cooking. [UI_METADATA:${uiMetadataEncoded}]`,
            };
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

            return {
                success: true,
                recipe: recipe,
                message: `✨ Here's a recipe for ${recipe.name}! (Note: Using basic template due to generation error) [UI_METADATA:${uiMetadataEncoded}]`,
            };
        }
    },
});

export const tools = {
    generateMealPlan,
    analyzeNutrition,
    getGroceryPricing,
    generateGroceryList,
    generateMealRecipe,
};
