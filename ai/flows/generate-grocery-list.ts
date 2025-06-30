'use server'; // For Next.js Server Actions

import { ai } from '../instance';
import { z } from 'zod';
import { fetchMealPlanById } from '@/data/index';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getLocationDataWithCaching } from '@/lib/location';

/* ========================== */
/*       OUTPUT SCHEMA        */
/* ========================== */

const GroceryItemSchema = z.object({
  item: z.string().describe("Name of the grocery item (consolidated)."),
  quantity: z.string().describe('Quantity needed (e.g., "2 lbs", "1 cup", "3 units")'),
  category: z.string().describe('Category (e.g., "Produce", "Dairy", "Meat", "Pantry")'),
  estimatedPrice: z.string().describe("Estimated price range with local currency symbol (e.g., '$3.50', '€2-€4')."),
  suggestedLocation: z.string().describe("Suggested local store (e.g., 'Kroger', 'Tesco', 'Local Butcher')."),
});

const LocationInfoSchema = z.object({
  currencySymbol: z.string().describe("The currency symbol for the location (e.g., '$', '€')."),
  localStores: z.array(z.string()).describe("List of popular local grocery stores."),
});

const GenerateGroceryListOutputSchema = z.object({
  groceryList: z.array(GroceryItemSchema),
  locationInfo: LocationInfoSchema,
});

export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

/* ========================== */
/*       INPUT SCHEMA         */
/* ========================== */

const MealIngredientSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string())
});

const BasicLocationSchema = z.object({
  country: z.string(),
  city: z.string()
});

const GenerateGroceryListInputSchema = z.object({
  meals: z.array(MealIngredientSchema),
  userLocation: BasicLocationSchema
});

export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const groceryListPrompt = ai.definePrompt({
  name: 'groceryListPrompt',
  prompt: `
    You are a hyper-local grocery expert. Given a meal plan and user location, generate a consolidated grocery list with realistic local pricing and store suggestions.

    ## USER LOCATION
    - City: {{userLocation.city}}
    - Country: {{userLocation.country}}

    ## MEAL PLAN
    {{#each meals}}
    - **{{name}}**: {{ingredients}}
    {{/each}}

    ## CRITICAL RULES
    1.  **Local Pricing:** Provide realistic price ranges in the local currency ({{userLocation.currencySymbol}}).
    2.  **Local Stores:** Suggest real grocery stores that exist in {{userLocation.city}}.
    3.  **Consolidate:** Combine identical ingredients and sum their quantities.
    4.  **Categorize:** Assign a category to each item (Produce, Dairy, Meat, etc.).
    5.  **Complete Output:** You MUST return a valid JSON object containing both the 'groceryList' and the 'locationInfo'.

    Return nothing but the JSON object.
  `,
});

/* ========================== */
/*        FLOW DEFINITION     */
/* ========================== */

const generateGroceryListFlow = ai.defineFlow<
  typeof GenerateGroceryListInputSchema,
  typeof GenerateGroceryListOutputSchema
>(
  {
    name: 'generateGroceryListFlow',
    inputSchema: GenerateGroceryListInputSchema,
    outputSchema: GenerateGroceryListOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await groceryListPrompt(input);

      if (!output) {
        throw new Error("Failed to generate grocery list. AI did not return expected output.");
      }

      // Validate the response structure
      if (!output.groceryList || !Array.isArray(output.groceryList)) {
        throw new Error("Invalid grocery list format received from AI");
      }

      if (!output.locationInfo) {
        throw new Error("Missing location information from AI response");
      }

      return output;
    } catch (error) {
      console.error("Error in grocery list generation:", error);
      throw new Error("Failed to generate grocery list. Please try again later.");
    }
  }
);

/* ========================== */
/*     EXPORTED FUNCTIONS     */
/* ========================== */

export async function generateGroceryList(
  input: GenerateGroceryListInput
): Promise<GenerateGroceryListOutput> {
  return generateGroceryListFlow(input);
}

export async function generateGroceryListFromMealPlan(
  mealplanId: string
): Promise<{ groceryList: GenerateGroceryListOutput; locationData: any }> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Get the user's meal plan from database using the provided mealplanId
    const MealPlan = await fetchMealPlanById(mealplanId);
    if (!MealPlan || !MealPlan.days) {
      throw new Error("No meal plan found");
    }

    // Get basic location data (just city and country)
    const locationData = await getLocationDataWithCaching(userId, session.session.id);
    console.log("Basic location data:", locationData);
    
    // Extract only meal names and ingredients from the existing meal plan
    const simplifiedMeals = [];
    for (const day of MealPlan.days) {
      for (const meal of day.meals) {
        simplifiedMeals.push({
          name: meal.name,
          ingredients: meal.ingredients
        });
      }
    }
    
    // Prepare the input with minimal location data - let AI enhance it
    const input: GenerateGroceryListInput = {
      meals: simplifiedMeals,
      userLocation: {
        country: locationData.country || 'Unknown',
        city: locationData.city || 'Unknown'
      },
    };

    // Generate grocery list with AI-enhanced location data
    const result = await generateGroceryListFlow(input);
    
    // Merge AI-enhanced location data with original location data
    const enhancedLocationData = {
      ...locationData,
      currencySymbol: result.locationInfo.currencySymbol,
      localStores: result.locationInfo.localStores,
    };
    
    console.log("AI-enhanced location data:", enhancedLocationData);
    
    return { 
      groceryList: {
        groceryList: result.groceryList,
        locationInfo: result.locationInfo
      }, 
      locationData: enhancedLocationData 
    };
  } catch (error) {
    console.error("Error in generateGroceryListFromMealPlan:", error);
    throw error;
  }
}

export async function generateGroceryListFromLatest(): Promise<{ groceryList: GenerateGroceryListOutput; locationData: any }> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // This function is deprecated - suggest using the new function
    throw new Error("This function is deprecated. Please use generateGroceryListFromMealPlan with a mealplanId parameter.");
  } catch (error) {
    console.error("Error in generateGroceryListFromLatest:", error);
    throw error;
  }
}

// Helper function to get the current user ID
async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error('Authentication required');
  }
  return session.user.id;
}

export async function generateGroceryListById(mealPlanId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) throw new Error("Authentication required to generate grocery list.");

  const mealPlan = await fetchMealPlanById(mealPlanId);
  if (!mealPlan) throw new Error(`Meal plan with ID ${mealPlanId} not found.`);

  // Location data is crucial for the prompt's context
  const locationData = await getLocationDataWithCaching(userId, session.session.id);
  
  const mealsForPrompt = mealPlan.days.flatMap(day => 
    day.meals.map(meal => ({
      name: meal.name,
      ingredients: meal.ingredients.join(', '),
    }))
  );

  const inputForAI = {
    userLocation: {
      city: locationData.city || 'San Francisco',
      country: locationData.country || 'USA',
      currencySymbol: locationData.currencySymbol || '$',
    },
    meals: mealsForPrompt,
  };

  // Correctly call the defined prompt function with proper configuration
  const { output } = await groceryListPrompt(inputForAI, {
    model: 'gemini-2.0-flash',
    output: { schema: GenerateGroceryListOutputSchema },
    config: {
      temperature: 0.1,
    },
  });

  if (!output) {
    throw new Error("Failed to generate grocery list from AI. The response was empty.");
  }
  
  return output;
}