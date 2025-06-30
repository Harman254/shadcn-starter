'use server';

/**
 * @fileOverview
 * Generates a consolidated grocery list from a meal plan, tailored to the user's location.
 * It provides local pricing, store suggestions, and categorizes items.
 *
 * Exports:
 * - generateGroceryListFromMealPlan: Main server action to generate a grocery list.
 * - GenerateGroceryListInput: Input type for the generation flow.
 * - GenerateGroceryListOutput: Output type for the generation flow.
 */

import { ai } from '../instance';
import { z } from 'zod';
import { fetchMealPlanById } from '@/data/index';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getLocationDataWithCaching } from '@/lib/location';

/* ========================== */
/*         SCHEMAS            */
/* ========================== */

// Schema for a single grocery item in the list
const GroceryItemSchema = z.object({
  id: z.string().describe("A unique ID for the grocery item."),
  item: z.string().describe("Name of the grocery item (consolidated)."),
  quantity: z.string().describe('Quantity needed (e.g., "2 lbs", "1 cup", "3 units")'),
  category: z.string().describe('Category (e.g., "Produce", "Dairy", "Meat", "Pantry")'),
  estimatedPrice: z.string().describe("Estimated price range with local currency symbol (e.g., '$3.50', '€2-€4')."),
  suggestedLocation: z.string().describe("Suggested local store (e.g., 'Kroger', 'Tesco', 'Local Butcher')."),
});

// Schema for location-specific information returned by the AI
const LocationInfoSchema = z.object({
  currencySymbol: z.string().describe("The currency symbol for the location (e.g., '$', '€')."),
  localStores: z.array(z.string()).describe("List of popular local grocery stores."),
});

// Input schema for the grocery list generation flow
const GenerateGroceryListInputSchema = z.object({
  meals: z.array(z.object({
    name: z.string(),
    ingredients: z.array(z.string())
  })),
  userLocation: z.object({
    country: z.string(),
    city: z.string(),
    currencySymbol: z.string().optional().describe("Local currency symbol, e.g., $."),
  })
});
export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;


// Output schema for the grocery list generation flow
const GenerateGroceryListOutputSchema = z.object({
  groceryList: z.array(GroceryItemSchema),
  locationInfo: LocationInfoSchema,
});
export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const groceryListPrompt = ai.definePrompt({
  name: 'groceryListPrompt',
  input: {
    schema: GenerateGroceryListInputSchema,
  },
  output: {
    schema: GenerateGroceryListOutputSchema,
  },
  prompt: `
    You are a hyper-local grocery expert. Given a meal plan and user location, generate a consolidated grocery list with realistic local pricing and store suggestions.

    ## USER LOCATION
    - City: {{userLocation.city}}
    - Country: {{userLocation.country}}

    ## MEAL PLAN
    {{#each meals}}
    - **{{name}}**: {{#each ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
    {{/each}}

    ## CRITICAL RULES
    1.  **Local Pricing:** Provide realistic price ranges in the local currency ({{userLocation.currencySymbol}}).
    2.  **Local Stores:** Suggest real grocery stores that exist in {{userLocation.city}}.
    3.  **Consolidate:** Combine identical ingredients and sum their quantities.
    4.  **Categorize:** Assign a category to each item (Produce, Dairy, Meat, etc.).
    5.  **Generate IDs:** Assign a unique string ID to each item.
    6.  **Complete Output:** You MUST return a valid JSON object containing both the 'groceryList' and the 'locationInfo'.

    Return nothing but the JSON object.
  `,
});

/* ========================== */
/*        FLOW DEFINITION     */
/* ========================== */

const generateGroceryListFlow = ai.defineFlow(
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
/*      SERVER ACTIONS        */
/* ========================== */

/**
 * Generates a grocery list for a given meal plan ID.
 * This function is a server action that can be called from client components.
 */
export async function generateGroceryListFromMealPlan(
  mealplanId: string
): Promise<{ groceryList: GenerateGroceryListOutput; locationData: any }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("Unauthorized: A user ID must be provided.");
    }

    const MealPlan = await fetchMealPlanById(mealplanId);
    if (!MealPlan || !MealPlan.days) {
      throw new Error("No meal plan found");
    }

    const locationData = await getLocationDataWithCaching(userId, session.session.id);
    
    const simplifiedMeals = MealPlan.days.flatMap(day => 
      day.meals.map(meal => ({
        name: meal.name,
        ingredients: meal.ingredients
      }))
    );
    
    const input: GenerateGroceryListInput = {
      meals: simplifiedMeals,
      userLocation: {
        country: locationData.country || 'USA',
        city: locationData.city || 'San Francisco',
        currencySymbol: locationData.currencySymbol || '$',
      },
    };

    const result = await generateGroceryListFlow(input);
    
    const enhancedLocationData = {
      ...locationData,
      currencySymbol: result.locationInfo.currencySymbol,
      localStores: result.locationInfo.localStores,
    };
    
    return { 
      groceryList: {
        groceryList: result.groceryList,
        locationInfo: result.locationInfo
      }, 
      locationData: enhancedLocationData 
    };
  } catch (error) {
    console.error("Error in generateGroceryListFromMealPlan, returning empty list:", error);
    // Return a default empty state to prevent UI errors
    return {
      groceryList: {
        groceryList: [],
        locationInfo: {
          currencySymbol: '$',
          localStores: [],
        },
      },
      locationData: {
        country: 'United States',
        city: 'San Francisco',
        currencyCode: 'USD',
        currencySymbol: '$',
        localStores: [],
      },
    };
  }
}

