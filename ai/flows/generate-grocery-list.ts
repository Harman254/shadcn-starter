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

const LocationEnhancementSchema = z.object({
  currencySymbol: z.string().describe("The appropriate currency symbol for this location (e.g., '$', '€', '£', 'KSh', '₹')"),
  currencyCode: z.string().describe("The ISO currency code for this location (e.g., 'USD', 'EUR', 'GBP', 'KES', 'INR')"),
  localStores: z.array(z.string()).describe("List of popular grocery stores/supermarkets in this specific city and country"),
  priceContext: z.string().describe("Brief context about typical grocery pricing in this location")
});

const GenerateGroceryListOutputSchema = z.object({
  groceryList: z.array(GroceryItemSchema).describe("Consolidated grocery list with localized estimated prices and store suggestions."),
  locationInfo: LocationEnhancementSchema.describe("Enhanced location information including currency and stores")
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

const prompt = ai.definePrompt({
  name: 'generateGroceryListPrompt',
  input: { schema: GenerateGroceryListInputSchema },
  output: { schema: GenerateGroceryListOutputSchema },
  prompt: `
You are a comprehensive grocery and location assistant with deep knowledge of global markets, currencies, and retail chains.

## USER LOCATION
- City: {{userLocation.city}}
- Country: {{userLocation.country}}

## YOUR TASKS

### 1. LOCATION ANALYSIS
First, analyze the user's location and provide:
- **Currency Symbol**: The correct currency symbol used in {{userLocation.city}}, {{userLocation.country}}
- **Currency Code**: The ISO currency code for this location
- **Local Stores**: List 5-8 popular grocery stores, supermarkets, or food retailers that actually exist in {{userLocation.city}}, {{userLocation.country}}. Include both major chains and notable local stores.
- **Price Context**: Brief overview of typical grocery pricing levels in this location

### 2. GROCERY LIST GENERATION
Using the location analysis above, create a consolidated grocery list from these meals:

{{#each meals}}
**{{this.name}}**: {{#each this.ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

## CRITICAL RULES
1. **INGREDIENTS ONLY**: Use only the exact ingredients listed above. Do not add, modify, or omit anything.
2. **REALISTIC PRICING**: 
   - Research actual current grocery prices for {{userLocation.city}}, {{userLocation.country}}
   - Consider local economic conditions and cost of living
   - Provide realistic price ranges using the correct local currency
   - Base prices on typical single-item purchases, not bulk quantities
3. **ACCURATE STORES**:
   - Use only real grocery stores that exist in {{userLocation.city}}, {{userLocation.country}}
   - Match items to appropriate store types (fresh produce → supermarkets, specialty items → specialty stores)
   - Prioritize well-known chains and popular local stores
4. **CONSOLIDATION**: 
   - Merge identical ingredients (case-insensitive)
   - Combine similar items logically (e.g., "red onion" + "onion" = "onion")
5. **CURRENCY ACCURACY**: Use the correct currency symbol and realistic amounts for the location

## OUTPUT REQUIREMENTS
- Provide comprehensive location information including real stores and accurate currency details
- Generate realistic grocery list with proper local pricing
- Ensure all store suggestions are legitimate businesses in the specified location
- Use current market knowledge for accurate price estimates

Return a properly structured JSON response with both the grocery list and enhanced location information.
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
      currencyCode: result.locationInfo.currencyCode,
      localStores: result.locationInfo.localStores,
      priceContext: result.locationInfo.priceContext
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