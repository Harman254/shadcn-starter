'use server'; // For Next.js Server Actions

import { ai } from '../instance';
import { z } from 'genkit';
import { fetchMealPlanById} from '@/data';
import type { FullMealPlanWithDays } from '@/types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getLocationDataWithCaching } from '@/lib/location';

/* ========================== */
/*       OUTPUT SCHEMA        */
/* ========================== */

const GroceryItemSchema = z.object({
  item: z.string().describe("Name of the grocery item (consolidated)."),
  estimatedPrice: z.string().describe("Estimated price range with appropriate currency symbol (e.g., '$3.50', '€2.00 - €4.00')."),
  suggestedLocation: z.string().describe("Suggested store or location, preferably local to the user (e.g., 'Kroger', 'Tesco', 'Local Butcher')."),
});

const GenerateGroceryListOutputSchema = z.object({
  groceryList: z.array(GroceryItemSchema).describe("Consolidated grocery list with localized estimated prices and store suggestions."),
});

export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

/* ========================== */
/*       INPUT SCHEMA         */
/* ========================== */

// Simplified schemas to avoid duplication and circular references
const MealIngredientSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string())
});

const LocationSchema = z.object({
  country: z.string(),
  city: z.string(),
  currencyCode: z.string(),
  currencySymbol: z.string(),
  localStores: z.array(z.string()).optional()
});

const GenerateGroceryListInputSchema = z.object({
  meals: z.array(MealIngredientSchema),
  userLocation: LocationSchema
});

export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const prompt = ai.definePrompt({
  name: 'generateGroceryListPrompt',
  input: { schema: GenerateGroceryListInputSchema },
  output: { schema: GenerateGroceryListOutputSchema },
  prompt: `
You are a grocery assistant. Your task is to generate a clean, consolidated grocery list based only on the meals below.

## USER LOCATION
- Country: {{userLocation.country}}
- City: {{userLocation.city}}
- Currency: {{userLocation.currencyCode}} ({{userLocation.currencySymbol}})
{{#if userLocation.localStores}}
- Local Stores: {{#each userLocation.localStores}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{else}}
- Local Stores: Use generic names like "Supermarket", "Butcher", or "Grocery Store".
{{/if}}

## RULES
1. Use **only** the ingredients listed below — do not invent, modify, or omit anything.
2. For each unique ingredient (case-insensitive):
   - "item": Name of the ingredient (as provided).
   - "estimatedPrice": Local price range using the currency (e.g., '{{userLocation.currencySymbol}}5.00 - {{userLocation.currencySymbol}}7.00').
   - "suggestedLocation": A store from the list above or a generic one.
3. Group identical or similar items as one (e.g., "Tomatoes" and "tomatoes" = same).
4. The response must be a JSON object with **only** one key: 'groceryList', which is an array of objects like:
   {
     "item": "Onion",
     "estimatedPrice": "KSh20 - KSh40",
     "suggestedLocation": "Naivas"
   }

## MEALS
{{#each meals}}
- {{this.name}}: {{#each this.ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Return only the valid JSON. Do not include any explanation or commentary.
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
      const { output } = await prompt(input);

      if (!output) {
        throw new Error("Failed to generate grocery list. AI did not return expected output.");
      }

      return output;
    } catch (error) {
      console.error("Error in grocery list generation:", error);
      throw new Error("Failed to generate grocery list. Please try again later.");
    }
  }
);

/* ========================== */
/*     CURRENCY MAPPINGS      */
/* ========================== */






/* ========================== */
/*     EXPORTED FUNCTIONS     */
/* ========================== */

export async function generateGroceryList(
  input: GenerateGroceryListInput
): Promise<GenerateGroceryListOutput> {
  return generateGroceryListFlow(input);
}

// Modified function to accept mealplanId as a parameter
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

    // Get location data with caching
    console.log(session.session.id)
    const locationData = await getLocationDataWithCaching(userId, session.session.id);
    console.log(locationData)
    
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
    
    // Prepare the input with the existing meal data and enhanced location data
    const input: GenerateGroceryListInput = {
      meals: simplifiedMeals,
      userLocation: {
        country: locationData.country || 'Unknown',
        city: locationData.city || 'Unknown',
        currencyCode: locationData.currencyCode,
        currencySymbol: locationData.currencySymbol,
        localStores: [], // AI will infer or use generic if not provided
      },
    };

    // Generate grocery list from existing meal plan data
    const groceryList = await generateGroceryListFlow(input);
    
    return { groceryList, locationData };
  } catch (error) {
    console.error("Error in generateGroceryListFromMealPlan:", error);
    throw error;
  }
}

// Keep the original function for backward compatibility but update it to use the new function
export async function generateGroceryListFromLatest(): Promise<{ groceryList: GenerateGroceryListOutput; locationData: any }> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // This function would typically get the latest meal plan
    // For now, we'll throw an error suggesting to use the new function
    throw new Error("This function is deprecated. Please use generateGroceryListFromMealPlan with a mealplanId parameter.");
  } catch (error) {
    console.error("Error in generateGroceryListFromLatest:", error);
    throw error;
  }
}
