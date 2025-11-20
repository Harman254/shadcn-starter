'use server';

import { ai } from "@/ai/instance";
import { z } from "genkit";
import { generatePersonalizedMealPlan } from "@/ai/flows/generate-meal-plan";
import { generateMealPlanTitle } from "@/ai/flows/generateMealPlanTitle";
import { ai as aiInstance } from "@/ai/instance";
import type { GenerateGroceryListInput } from "@/ai/flows/generate-grocery-list";
import { generateGroceryListFlow } from "@/ai/flows/generate-grocery-list";
import { fetchOnboardingData } from "@/data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { saveMealPlanAction } from "@/actions/save-meal-plan";
import { getLocationDataWithCaching } from "@/lib/location";

const LogMealInputSchema = z.object({
  meal_description: z
    .string()
    .describe(
      "A description of the meal the user ate, including the name of the food and any other details provided."
    ),
});

const LogMealOutputSchema = z
  .string()
  .describe("A confirmation message to the user that the meal has been logged.");

const logMeal = ai.defineTool(
  {
    name: "logMeal",
    description: "Logs a meal that the user has eaten.",
    inputSchema: LogMealInputSchema,
    outputSchema: LogMealOutputSchema,
  },
  async (input) => {
    return `Meal logged: ${input.meal_description}. Great job!`;
  }
);

// Generate Meal Plan Tool
const GenerateMealPlanInputSchema = z.object({
  duration: z
    .number()
    .int()
    .min(1)
    .max(30)
    .optional()
    .default(1)
    .describe("Number of days (1-30). REQUIRED: Use the EXACT number user specifies. Only default to 1 if user doesn't mention any number."),
  mealsPerDay: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .default(3)
    .describe("Meals per day (1-5). REQUIRED: Use the EXACT number user specifies. Only default to 3 if user doesn't mention any number."),
  title: z
    .string()
    .optional()
    .describe("Optional title for the meal plan. If not provided, a title will be auto-generated based on duration and mealsPerDay."),
  chatMessages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional().describe("Recent chat messages (last 3-5) to understand what the user actually wants. Include these to prioritize user needs over saved preferences."),
});

const GenerateMealPlanOutputSchema = z.object({
  success: z.boolean().describe("Whether the meal plan was generated successfully."),
  mealPlan: z
    .object({
      title: z.string().describe("Title of the generated meal plan."),
      duration: z.number().describe("Duration in days."),
      mealsPerDay: z.number().describe("Number of meals per day."),
      days: z
        .array(
          z.object({
            day: z.number().describe("Day number (1-based)."),
            meals: z
              .array(
                z.object({
                  name: z.string().describe("Name of the meal."),
                  description: z.string().describe("Description of the meal."),
                  ingredients: z.array(z.string()).describe("List of ingredients."),
                  instructions: z.string().describe("Cooking instructions."),
                  imageUrl: z.string().optional().describe("Optional image URL for the meal."),
                })
              )
              .describe("Meals for this day."),
          })
        )
        .describe("Days in the meal plan."),
    })
    .optional()
    .describe("The generated meal plan data."),
  message: z.string().describe("A message describing the result."),
});

// Core meal plan generation logic - can be called directly or via tool
async function generateMealPlanCore(input: {
  duration?: number;
  mealsPerDay?: number;
  title?: string;
  chatMessages?: Array<{ role: 'user' | 'assistant'; content: string }>; // Recent chat messages
}): Promise<{
  success: boolean;
  mealPlan?: any;
  message: string;
}> {
    // Log immediately when tool is invoked
    console.log('[generateMealPlan] 🔧 TOOL CALLED! Input received:', { 
      duration: input.duration, 
      mealsPerDay: input.mealsPerDay, 
      title: input.title,
      timestamp: new Date().toISOString(),
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateMealPlan] Full input object:', JSON.stringify(input, null, 2));
    }
    
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return {
          success: false,
          message: "You must be logged in to generate a meal plan. Please sign in first.",
        };
      }

      const userId = session.user.id;

      // Fetch user preferences
      const preferencesData = await fetchOnboardingData(userId);

      if (!preferencesData || preferencesData.length === 0) {
        return {
          success: false,
          message:
            "Please set up your dietary preferences first. Go to Dashboard > Preferences to configure your meal planning preferences.",
        };
      }

      // Convert preferences to the format expected by generatePersonalizedMealPlan
      const preferences = preferencesData.map((pref) => ({
        dietaryPreference: pref.dietaryPreference,
        goal: pref.goal,
        householdSize: pref.householdSize,
        cuisinePreferences: pref.cuisinePreferences,
      }));

      // Use defaults if not provided (1 day default to save tokens - only extend if user explicitly requests)
      const duration = input.duration ?? 1;
      const mealsPerDay = input.mealsPerDay ?? 3;

      // Generate the meal plan with chat messages if provided
      const result = await generatePersonalizedMealPlan({
        duration,
        mealsPerDay,
        preferences,
        randomSeed: Math.floor(Math.random() * 1000),
        chatMessages: input.chatMessages, // Pass actual chat messages
      });

      if (!result?.mealPlan) {
        return {
          success: false,
          message: "Failed to generate meal plan. Please try again.",
        };
      }

      // Transform to match the save API format first
      // Note: generatePersonalizedMealPlan doesn't return imageUrl, so we set it to undefined
      const mealPlanData = {
        duration,
        mealsPerDay,
        days: result.mealPlan.map((day) => ({
          day: day.day,
          meals: day.meals.map((meal) => {
            // Extract only the properties that exist on the meal type
            return {
              name: meal.name,
              description: meal.description,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
              // imageUrl is not generated by the meal plan flow, so we set it to undefined
              imageUrl: undefined as string | undefined,
            };
          }),
        })),
      };

      // Generate AI-powered title if not provided
      let title = input.title;
      if (!title) {
        try {
          // Convert meal plan to SimplifiedMealPlan format for title generation
          const simplifiedMealPlan = mealPlanData.days.map((day) => ({
            day: day.day,
            meals: day.meals.map((meal) => ({
              name: meal.name,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
            })),
          }));
          
          const titleResult = await generateMealPlanTitle(simplifiedMealPlan);
          title = titleResult.title;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[generateMealPlanCore] ✅ Generated AI title:', title);
          }
        } catch (titleError) {
          console.error('[generateMealPlanCore] Error generating title:', titleError);
          // Fallback to simple template if AI title generation fails
          title = `${duration}-Day Meal Plan (${mealsPerDay} meals/day)`;
          if (process.env.NODE_ENV === 'development') {
            console.log('[generateMealPlanCore] Using fallback title:', title);
          }
        }
      }

      // Add title to mealPlanData
      const mealPlanDataWithTitle = {
        ...mealPlanData,
        title,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('[generateMealPlan] ✅ Successfully generated meal plan:', {
          title: mealPlanDataWithTitle.title,
          days: mealPlanDataWithTitle.days.length,
          totalMeals: mealPlanDataWithTitle.days.reduce((sum: number, day: any) => sum + day.meals.length, 0),
        });
      }

      // Include preferences in the message so AI knows what was used (but keep it concise)
      const firstPreference = preferences[0];
      const preferencesSummary = firstPreference 
        ? `${firstPreference.dietaryPreference} diet, ${firstPreference.goal} goal, ${firstPreference.householdSize} person household, ${firstPreference.cuisinePreferences.slice(0, 3).join(', ')}${firstPreference.cuisinePreferences.length > 3 ? '...' : ''} cuisines`
        : 'your saved preferences';

      const totalMeals = mealPlanDataWithTitle.days.reduce((sum: number, day: any) => sum + day.meals.length, 0);
      
      // Create UI metadata for save button and meal plan display
      // Encode meal plan data as base64 so it can be passed to save tool and displayed
      const uiMetadata = {
        actions: [
          {
            label: 'Save Meal Plan',
            action: 'save' as const,
            data: mealPlanDataWithTitle, // Include full meal plan data with title for saving
          },
        ],
        mealPlan: mealPlanDataWithTitle, // Include meal plan with title for display in chat
      };
      
      // Encode UI metadata as base64 (same pattern as saveMealPlan tool)
      const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');
      
      return {
        success: true,
        mealPlan: mealPlanDataWithTitle,
        message: `✅ Generated ${duration}-day meal plan (${mealsPerDay} meals/day) for ${preferencesSummary}. Includes ${mealPlanDataWithTitle.days.length} days with ${totalMeals} total meals. [UI_METADATA:${uiMetadataEncoded}]`,
      };
    } catch (error) {
      console.error("[generateMealPlan] Error:", error);
      return {
        success: false,
        message: `Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
}

// Export the core function for direct calls
export { generateMealPlanCore };

// Tool wrapper that uses the core function
export const generateMealPlan = ai.defineTool(
  {
    name: "generate_meal_plan",
        description:
          "MANDATORY: Call this function IMMEDIATELY when user asks to generate, create, or plan meals. Do NOT say 'Okay, I will' or 'I will create' - just call this function. NO TEXT BEFORE THE TOOL CALL. CRITICAL: Always use the EXACT duration and mealsPerDay the user specifies. Only use defaults (duration: 1, mealsPerDay: 3) if user does NOT mention numbers. IMPORTANT: Pass the last 3-5 chat messages as chatMessages parameter so the meal plan prioritizes what the user actually wants right now over saved preferences.",
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    // Log immediately when tool is invoked
    console.log('[generateMealPlan] 🔧 TOOL CALLED! Input received:', { 
      duration: input.duration, 
      mealsPerDay: input.mealsPerDay, 
      title: input.title,
      timestamp: new Date().toISOString(),
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateMealPlan] Full input object:', JSON.stringify(input, null, 2));
    }
    
    // Call the core function
    return await generateMealPlanCore(input);
  }
);

// Save Meal Plan Tool
const SaveMealPlanInputSchema = z.object({
  title: z.string().optional().describe("Title of the meal plan. If not provided, will be auto-generated as '{duration}-Day Meal Plan ({mealsPerDay} meals/day)'."),
  duration: z.number().describe("Duration in days."),
  mealsPerDay: z.number().describe("Number of meals per day."),
  days: z
    .array(
      z.object({
        day: z.number().describe("Day number (1-based)."),
        meals: z
          .array(
            z.object({
              name: z.string().describe("Name of the meal."),
              description: z.string().describe("Description of the meal."),
              ingredients: z.array(z.string()).describe("List of ingredients."),
              instructions: z.string().describe("Cooking instructions."),
              imageUrl: z.string().optional().describe("Optional image URL for the meal."),
            })
          )
          .describe("Meals for this day."),
      })
    )
    .describe("Days in the meal plan."),
});

const SaveMealPlanOutputSchema = z.object({
  success: z.boolean().describe("Whether the meal plan was saved successfully."),
  mealPlanId: z.string().optional().describe("ID of the saved meal plan."),
  message: z.string().describe("A message describing the result."),
  ui: z.object({
    actions: z.array(z.object({
      label: z.string(),
      action: z.enum(['navigate', 'save', 'view']),
      url: z.string().optional(),
      onClick: z.string().optional(),
      data: z.record(z.any()).optional(),
    })),
  }).optional().describe("UI metadata for rendering buttons/actions in the chat."),
});

export const saveMealPlan = ai.defineTool(
  {
    name: "save_meal_plan",
    description:
      "Saves a meal plan to user's account. Call after generating a meal plan or when user asks to save. Requires: duration, mealsPerDay, days array. Title is optional and will be auto-generated if not provided.",
    inputSchema: SaveMealPlanInputSchema,
    outputSchema: SaveMealPlanOutputSchema,
  },
  async (input) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[saveMealPlan] Tool called with input:', {
        title: input.title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        daysCount: input.days.length,
        totalMeals: input.days.reduce((sum, day) => sum + day.meals.length, 0),
      });
    }
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return {
          success: false,
          message: "You must be logged in to save a meal plan. Please sign in first.",
        };
      }

      // Ensure title is always present - generate AI title if missing
      let title = input.title;
      if (!title) {
        try {
          // Convert meal plan to SimplifiedMealPlan format for title generation
          const simplifiedMealPlan = input.days.map((day) => ({
            day: day.day,
            meals: day.meals.map((meal) => ({
              name: meal.name,
              ingredients: meal.ingredients,
              instructions: meal.instructions,
            })),
          }));
          
          const titleResult = await generateMealPlanTitle(simplifiedMealPlan);
          title = titleResult.title;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[saveMealPlan] ✅ Generated AI title:', title);
          }
        } catch (titleError) {
          console.error('[saveMealPlan] Error generating title:', titleError);
          // Fallback to simple template if AI title generation fails
          title = `${input.duration}-Day Meal Plan (${input.mealsPerDay} meals/day)`;
          if (process.env.NODE_ENV === 'development') {
            console.log('[saveMealPlan] Using fallback title:', title);
          }
        }
      }
      
      // Prepare data in the format expected by the save action
      const saveData = {
        title: title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        days: input.days,
        createdAt: new Date().toISOString(),
      };

      // Call the save action directly
      const result = await saveMealPlanAction(saveData);

      // Handle success case - TypeScript narrows the discriminated union here
      if (result.success) {
        // Log result for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('[saveMealPlan] Save result:', {
            success: true,
            mealPlanId: result.mealPlan.id,
          });
        }

        // Create UI metadata for buttons
        const uiMetadata = {
          actions: [
            {
              label: 'View Meal Plan',
              action: 'navigate' as const,
              url: `/meal-plans/${result.mealPlan.id}`,
            },
            {
              label: 'View All Meal Plans',
              action: 'navigate' as const,
              url: '/meal-plans',
            },
          ],
        };

        // Encode UI metadata as base64 to avoid issues with special characters in JSON
        const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');
        
        return {
          success: true,
          mealPlanId: result.mealPlan.id,
          message: `Meal plan "${title}" has been saved successfully! You can view it in your meal plans. [MEAL_PLAN_SAVED:${result.mealPlan.id}][UI_METADATA:${uiMetadataEncoded}]`,
          // Include UI metadata for rendering a button
          ui: uiMetadata,
        };
      }

      // Handle error case - TypeScript knows result.success is false here
      // Use type assertion through unknown for safety
      const errorResult = result as unknown as { success: false; error: string; code: string };
      
      // Log result for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[saveMealPlan] Save result:', {
          success: false,
          error: errorResult.error,
          code: errorResult.code,
        });
      }

      return {
        success: false,
        message: `Failed to save meal plan: ${errorResult.error}`,
      };
    } catch (error) {
      console.error("[saveMealPlan] Error:", error);
      return {
        success: false,
        message: `Failed to save meal plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
);

// Generate Grocery List Tool
const GenerateGroceryListInputSchema = z.object({
  mealPlan: z.object({
    title: z.string().optional().describe("Title of the meal plan."),
    duration: z.number().describe("Duration in days."),
    mealsPerDay: z.number().describe("Number of meals per day."),
    days: z.array(
      z.object({
        day: z.number().describe("Day number (1-based)."),
        meals: z.array(
          z.object({
            name: z.string().describe("Name of the meal."),
            description: z.string().optional().describe("Description of the meal."),
            ingredients: z.array(z.string()).describe("List of ingredients."),
            instructions: z.string().optional().describe("Cooking instructions."),
          })
        ).describe("Meals for this day."),
      })
    ).describe("Days in the meal plan."),
  }).describe("The meal plan to generate a grocery list for. Can be from a recently generated meal plan in the conversation."),
});

const GenerateGroceryListOutputSchema = z.object({
  success: z.boolean().describe("Whether the grocery list was generated successfully."),
  groceryList: z.array(
    z.object({
      id: z.string().describe("Unique ID for the item."),
      item: z.string().describe("Name of the grocery item."),
      quantity: z.string().describe("Quantity needed."),
      category: z.string().describe("Category (e.g., Produce, Dairy, Meat)."),
      estimatedPrice: z.string().describe("Estimated price with currency symbol."),
      suggestedLocation: z.string().describe("Suggested local store."),
    })
  ).optional().describe("The generated grocery list with price estimates."),
  locationInfo: z.object({
    currencySymbol: z.string().describe("Currency symbol."),
    localStores: z.array(z.string()).describe("List of local stores."),
  }).optional().describe("Location-specific information."),
  message: z.string().describe("A message describing the result."),
});

// Core grocery list generation logic - can be called directly or via tool
export async function generateGroceryListCore(input: {
  mealPlan: {
    title?: string;
    duration?: number;
    mealsPerDay?: number;
    days: Array<{
      day: number;
      meals: Array<{
        name: string;
        description?: string;
        ingredients: string[];
        instructions?: string;
      }>;
    }>;
  };
}): Promise<{
  success: boolean;
  groceryList?: any;
  locationInfo?: any;
  message: string;
}> {
  try {
    // Validate input structure
    if (!input || !input.mealPlan) {
      console.error('[generateGroceryListCore] ❌ Invalid input: mealPlan is missing');
      return {
        success: false,
        message: "Invalid meal plan data. Please generate a new meal plan first.",
      };
    }
    
    if (!input.mealPlan.days || !Array.isArray(input.mealPlan.days) || input.mealPlan.days.length === 0) {
      console.error('[generateGroceryListCore] ❌ Invalid input: days array is missing or empty');
      return {
        success: false,
        message: "The meal plan doesn't contain any days. Please generate a new meal plan first.",
      };
    }
    
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to generate a grocery list. Please sign in first.",
      };
    }

    const userId = session.user.id;

    // Get user location
    const locationData = await getLocationDataWithCaching(userId, session.session.id);
    
    // Convert meal plan to simplified format for grocery list generation
    // Filter out invalid days/meals
    const simplifiedMeals = input.mealPlan.days
      .filter((day: any) => day && day.meals && Array.isArray(day.meals))
      .flatMap((day: any) => 
        day.meals
          .filter((meal: any) => meal && meal.name && meal.ingredients && Array.isArray(meal.ingredients))
          .map((meal: any) => ({
            name: meal.name,
            ingredients: meal.ingredients || []
          }))
      );
    
    if (simplifiedMeals.length === 0) {
      console.error('[generateGroceryListCore] ❌ No valid meals found in meal plan');
      return {
        success: false,
        message: "The meal plan doesn't contain any valid meals with ingredients. Please generate a new meal plan first.",
      };
    }

    const groceryListInput: GenerateGroceryListInput = {
      meals: simplifiedMeals,
      userLocation: {
        country: locationData.country || 'USA',
        city: locationData.city || 'San Francisco',
        currencySymbol: locationData.currencySymbol || '$',
      },
    };

    const result = await generateGroceryListFlow(groceryListInput);

    if (!result?.groceryList || !Array.isArray(result.groceryList)) {
      return {
        success: false,
        message: "Failed to generate grocery list. Please try again.",
      };
    }

    // Calculate total estimated cost (safely handle missing prices)
    const totalCost = result.groceryList.reduce((sum: number, item: any) => {
      if (!item || !item.estimatedPrice) return sum;
      try {
        const priceStr = String(item.estimatedPrice).replace(/[^\d.]/g, '');
        const price = parseFloat(priceStr) || 0;
        return sum + price;
      } catch (e) {
        return sum;
      }
    }, 0);
    const currencySymbol = result.locationInfo?.currencySymbol || locationData?.currencySymbol || '$';

    // Create UI metadata for displaying the grocery list
    const uiMetadata = {
      groceryList: {
        items: result.groceryList,
        locationInfo: result.locationInfo,
        totalEstimatedCost: `${currencySymbol}${totalCost.toFixed(2)}`,
      },
    };

    // Log the metadata structure for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateGroceryListCore] 📦 Creating UI metadata:', {
        itemsCount: result.groceryList.length,
        itemsType: Array.isArray(result.groceryList) ? 'array' : typeof result.groceryList,
        hasLocationInfo: !!result.locationInfo,
        totalCost: `${currencySymbol}${totalCost.toFixed(2)}`,
        metadataStructure: JSON.stringify(uiMetadata, null, 2).substring(0, 500),
      });
    }

    // Encode UI metadata as base64
    const uiMetadataEncoded = Buffer.from(JSON.stringify(uiMetadata)).toString('base64');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateGroceryListCore] ✅ UI metadata encoded, length:', uiMetadataEncoded.length);
    }

    return {
      success: true,
      groceryList: result.groceryList,
      locationInfo: result.locationInfo,
      message: `✅ Generated grocery list for your ${input.mealPlan.duration || input.mealPlan.days?.length || 'meal'} plan! Found ${result.groceryList.length} items with estimated total cost of ${currencySymbol}${totalCost.toFixed(2)}. [UI_METADATA:${uiMetadataEncoded}]`,
    };
  } catch (error) {
    console.error("[generateGroceryList] Error:", error);
    return {
      success: false,
      message: `Failed to generate grocery list: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

    export const generateGroceryList = ai.defineTool(
      {
        name: "generate_grocery_list",
        description:
          "CRITICAL: This tool ONLY generates grocery lists - it does NOT generate meal plans. MANDATORY: Call this IMMEDIATELY when user asks for: 'grocery list', 'shopping list', 'ingredients list', 'grocery list for meal plan', 'shopping list for meals', 'grocery list for this meal plan', 'what do I need to buy', 'what ingredients', 'create grocery list', 'generate grocery list', or any variation asking for a list of items to buy. IMPORTANT: The mealPlan parameter is REQUIRED and will be automatically extracted from the conversation history by the system. You just need to call this function - the system will handle finding the meal plan. DO NOT call generate_meal_plan() - only use existing meal plans from the conversation. NEVER say 'I will create' or 'I can create' - YOU MUST CALL THIS FUNCTION IMMEDIATELY. If you cannot find a meal plan in the conversation, still call this function and the system will handle it appropriately.",
        inputSchema: GenerateGroceryListInputSchema,
        outputSchema: GenerateGroceryListOutputSchema,
      },
  async (input) => {
    // Log to confirm grocery list tool is being called (not meal plan)
    console.log('[generateGroceryList] 🛒 GROCERY LIST TOOL CALLED - NOT meal plan generation');
    console.log('[generateGroceryList] Input received:', JSON.stringify(input, null, 2));
    
    // Validate meal plan structure
    if (!input.mealPlan) {
      console.warn('[generateGroceryList] ⚠️ Meal plan is missing in tool input');
      return {
        success: false,
        message: "I need a meal plan to generate a grocery list. Please generate a meal plan first, then I can create a shopping list with price estimates.",
      };
    }
    
    // Validate meal plan has days array
    if (!input.mealPlan.days || !Array.isArray(input.mealPlan.days) || input.mealPlan.days.length === 0) {
      console.warn('[generateGroceryList] ⚠️ Meal plan days array is missing or empty:', {
        hasDays: !!input.mealPlan.days,
        isArray: Array.isArray(input.mealPlan.days),
        length: input.mealPlan.days?.length || 0,
        mealPlanKeys: Object.keys(input.mealPlan),
      });
      return {
        success: false,
        message: "The meal plan structure is invalid. Please generate a new meal plan first, then I can create a shopping list with price estimates.",
      };
    }
    
    // Validate that days have meals
    const hasValidMeals = input.mealPlan.days.some((day: any) => 
      day && day.meals && Array.isArray(day.meals) && day.meals.length > 0
    );
    
    if (!hasValidMeals) {
      console.warn('[generateGroceryList] ⚠️ Meal plan days have no valid meals');
      return {
        success: false,
        message: "The meal plan doesn't contain any meals. Please generate a new meal plan first, then I can create a shopping list with price estimates.",
      };
    }
    
    return await generateGroceryListCore(input);
  }
);

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe("The user question to answer."),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe("The answer to the user question."),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(
  input: AnswerQuestionInput
): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const answerQuestionPrompt = ai.definePrompt({
  name: "answerQuestionPrompt",
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  tools: [logMeal, generateMealPlan, saveMealPlan],
  prompt: `You are Mealwise, a helpful kitchen assistant. Your primary roles are:
1. **Provide cooking instructions and recipes** - When users ask how to cook something (e.g., "how to cook lasagna"), provide detailed, step-by-step cooking instructions with ingredients, measurements, and cooking methods.
2. **Offer culinary advice** - Answer questions about cooking techniques, ingredients, food safety, and kitchen tips.
3. **Generate meal plans** - Use the generate_meal_plan tool when users ask to create, generate, or plan meals. The tool automatically uses their stored preferences (dietary preference, goals, household size, cuisine preferences) - DO NOT ask follow-up questions about these. The tool only needs duration and mealsPerDay.
4. **Save meal plans** - Use the save_meal_plan tool when users want to save a generated meal plan to their account. Always save meal plans after generating them unless the user explicitly says not to.
5. **Track meals** - Only use the logMeal tool when the user explicitly states they have ALREADY EATEN a meal and want to track/log it.

**CRITICAL RULES FOR MEAL PLAN GENERATION:**
- NEVER ask follow-up questions about dietary preferences, goals, household size, or cuisine preferences
- The generate_meal_plan tool automatically retrieves and uses the user's stored preferences from their account
- If the user doesn't specify duration or mealsPerDay, use defaults: 7 days and 3 meals per day
- Simply call the tool with duration and mealsPerDay - the tool handles everything else automatically
- If the tool returns an error about missing preferences, inform the user they need to set up preferences first

**IMPORTANT RULES:**
- ALWAYS provide cooking instructions when asked. Never refuse to help with cooking questions.
- If a user asks "how to cook [dish]" or "recipe for [dish]", they want cooking instructions, NOT meal logging.
- When users ask to create/generate/plan meals, immediately use generate_meal_plan tool with duration and mealsPerDay (or defaults). DO NOT ask about their preferences - the tool uses stored preferences automatically.
- Only use the logMeal tool when the user says they have eaten something (e.g., "I ate lasagna for dinner" or "I just had pizza").
- Be detailed and helpful with cooking instructions - include ingredients, measurements, cooking times, temperatures, and step-by-step methods.

Question: {{{question}}}`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: "answerQuestionFlow",
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    // Log tool availability for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[answerQuestionFlow] Tools available:', ['logMeal', 'generateMealPlan', 'saveMealPlan']);
      console.log('[answerQuestionFlow] Processing question:', input.question);
    }

    const { output } = await answerQuestionPrompt(input);

    // Log the output for debugging (especially tool calls)
    if (process.env.NODE_ENV === 'development') {
      console.log('[answerQuestionFlow] Received output:', {
        hasAnswer: !!output?.answer,
        answerLength: output?.answer?.length || 0,
        answerPreview: output?.answer?.substring(0, 100) || 'N/A',
      });
    }

    // ✅ Defensive fix
    if (!output || typeof output.answer !== "string") {
      console.warn("[Mealwise] answerQuestionPrompt returned invalid output:", output);
      return { answer: "Sorry, I could not generate an answer right now. Please try again." };
    }

    return output;
  }
);
