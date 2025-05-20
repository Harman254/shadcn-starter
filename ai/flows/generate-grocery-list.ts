'use server'; // For Next.js Server Actions

import { ai } from '../instance';
import { z } from 'genkit';
import { getLatestFullMealPlanByUserId} from '@/data';
import type { FullMealPlanWithDays } from '@/types';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { getLocationDataFromIp, getUserIpAddress } from '@/lib/location';

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
You are a grocery list generator. Your task is to create a consolidated grocery list based on the provided meal ingredients.

User Location Information:
- Country: {{userLocation.country}}
- City: {{userLocation.city}}
- Currency: {{userLocation.currencyCode}} ({{userLocation.currencySymbol}})
{{#if userLocation.localStores}}
- Local Grocery Stores: {{#each userLocation.localStores}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}

Instructions:
1. Use ONLY the ingredients already provided in the meals list. DO NOT add, modify, or suggest new ingredients.
2. For each unique ingredient from the provided meals, list:
   - The item name exactly as provided (e.g., "Chicken Breasts", "Onion", "Olive Oil").
   - An estimated price range in the user's local currency (e.g., '{{userLocation.currencySymbol}}5.00 - {{userLocation.currencySymbol}}7.00').
   - A suggested store where it's typically purchased, using local store chains from the user's location when available.
3. Consolidate quantities implicitly – just list each unique ingredient once.
4. Format the output as a valid JSON object containing a single key "groceryList" which holds an array of objects. Each object must have the keys: "item", "estimatedPrice", and "suggestedLocation".

Meals and Ingredients:
{{#each meals}}
- {{this.name}}: {{#each this.ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Respond ONLY with the valid JSON object adhering to the specified output schema.
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

// Fallback currency data by country
const countryCurrencyMap: Record<string, { code: string, symbol: string }> = {
  'Kenya': { code: 'KES', symbol: 'KSh' },
  'United States': { code: 'USD', symbol: '$' },
  'United Kingdom': { code: 'GBP', symbol: '£' },
  'European Union': { code: 'EUR', symbol: '€' },
  'Canada': { code: 'CAD', symbol: 'C$' },
  'Australia': { code: 'AUD', symbol: 'A$' },
  'Japan': { code: 'JPY', symbol: '¥' },
  'India': { code: 'INR', symbol: '₹' },
  'China': { code: 'CNY', symbol: '¥' },
  'Brazil': { code: 'BRL', symbol: 'R$' },
  'South Africa': { code: 'ZAR', symbol: 'R' },
  'Nigeria': { code: 'NGN', symbol: '₦' },
  'Mexico': { code: 'MXN', symbol: '$' },
  // Add more countries as needed
};

// Default fallback if country is not in the map
const defaultCurrency = { code: 'USD', symbol: '$' };

/* ========================== */
/*     EXPORTED FUNCTIONS     */
/* ========================== */

export async function generateGroceryList(
  input: GenerateGroceryListInput
): Promise<GenerateGroceryListOutput> {
  return generateGroceryListFlow(input);
}

export async function generateGroceryListFromLatest(): Promise<GenerateGroceryListOutput> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers()
    });

    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    // Get the user's meal plan from database
    const latestMealPlan: FullMealPlanWithDays | null = await getLatestFullMealPlanByUserId(userId);
    if (!latestMealPlan || !latestMealPlan.days) {
      throw new Error("No meal plan found");
    }

    // Get location data
    const sessionID = 'SxFpZB2PfuXQT8BS8xcR1Bbbnxe4jOao';
    const userIpAddress = await getUserIpAddress(sessionID);
    if (!userIpAddress) {
      throw new Error("User IP address not found");
    }
    
    const locationData = await getLocationDataFromIp(userIpAddress);
    
    // Extract only meal names and ingredients from the existing meal plan
    const simplifiedMeals = [];
    for (const day of latestMealPlan.days) {
      for (const meal of day.meals) {
        simplifiedMeals.push({
          name: meal.name,
          ingredients: meal.ingredients
        });
      }
    }
    
    // Ensure currency data is present
    let currencyCode = locationData.currencyCode;
    let currencySymbol = locationData.currencySymbol;
    
    // If currency data is missing, use fallbacks based on country
    if (!currencyCode || !currencySymbol) {
      const countryCurrency = locationData.country ? countryCurrencyMap[locationData.country] : null;
      
      if (countryCurrency) {
        currencyCode = currencyCode || countryCurrency.code;
        currencySymbol = currencySymbol || countryCurrency.symbol;
      } else {
        // Use default fallback if country not found in map
        currencyCode = currencyCode || defaultCurrency.code;
        currencySymbol = currencySymbol || defaultCurrency.symbol;
      }
      
      console.log(`Using fallback currency for ${locationData.country}: ${currencyCode} (${currencySymbol})`);
    }
    
    // Prepare the input with the existing meal data and location data
    const input: GenerateGroceryListInput = {
      meals: simplifiedMeals,
      userLocation: {
        country: locationData.country || 'Unknown',
        city: locationData.city || 'Unknown',
        currencyCode: currencyCode,
        currencySymbol: currencySymbol,
        localStores: locationData.popularGroceryStores || [],
      },
    };

    // Generate grocery list from existing meal plan data
    return generateGroceryListFlow(input);
  } catch (error) {
    console.error("Error in generateGroceryListFromLatest:", error);
    throw error;
  }
}
