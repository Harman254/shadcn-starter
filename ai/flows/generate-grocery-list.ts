'use server'; // For Next.js Server Actions

import { ai } from '../instance'; // Your Genkit instance
import { z } from 'genkit';
import { getLatestFullMealPlanByUserId } from '@/data';
import { auth } from "@clerk/nextjs/server";

/* ========================== */
/*       INPUT SCHEMA         */
/* ========================== */

const MealSchema = z.object({
  name: z.string().describe('Name of the meal.'),
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'),
  instructions: z.string().describe('Cooking instructions for the meal.'), // Added 'instructions'
});

const DayMealPlanSchema = z.object({
  day: z.number().describe('Day number in the meal plan.'),
  meals: z.array(MealSchema).describe('Meals for that day.'),
});

const GenerateGroceryListInputSchema = z.object({
  mealPlan: z.array(DayMealPlanSchema).describe('The meal plan to generate a grocery list from.'),
});

export type GenerateGroceryListInput = z.infer<typeof GenerateGroceryListInputSchema>;

/* ========================== */
/*       OUTPUT SCHEMA        */
/* ========================== */

const GroceryItemSchema = z.object({
  item: z.string().describe("Name of the grocery item (consolidated)."),
  estimatedPrice: z.string().describe("Estimated price range (e.g., '$3.50', '$2.00 - $4.00')."),
  suggestedLocation: z.string().describe("Suggested store type or location (e.g., 'Supermarket', 'Butcher', 'Bakery', 'Farmer's Market')."),
});

const GenerateGroceryListOutputSchema = z.object({
  groceryList: z.array(GroceryItemSchema).describe("Consolidated grocery list with estimated prices and locations."),
});

export type GenerateGroceryListOutput = z.infer<typeof GenerateGroceryListOutputSchema>;

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const prompt = ai.definePrompt({
  name: 'generateGroceryListPrompt',
  input: { schema: GenerateGroceryListInputSchema },
  output: { schema: GenerateGroceryListOutputSchema },
  prompt: `
Based on the following meal plan, create a consolidated grocery list.

Instructions:
1. Identify all unique ingredients required across all meals in the provided plan.
2. For each unique ingredient, list:
   - The item name (e.g., "Chicken Breasts", "Onion", "Olive Oil").
   - An estimated price range in USD (e.g., '$5.00 - $7.00', '~ $3.50'). Be realistic but approximate.
   - A suggested type of store or location where it's typically purchased (e.g., 'Supermarket', 'Butcher', 'Bakery', 'Farmer's Market', 'Any Grocery Store').
3. Consolidate quantities implicitly – just list the item needed once. Do *not* list quantities like "2 lbs" or "3 units".
4. Format the output as a valid JSON object containing a single key "groceryList" which holds an array of objects. Each object in the array must have the keys: "item", "estimatedPrice", and "suggestedLocation".

Meal Plan Details:
{{#each mealPlan}}
Day {{this.day}}:
  {{#each this.meals}}
  - {{this.name}}: Ingredients: {{#each this.ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}.
  {{/each}}
{{/each}}

Respond *only* with the valid JSON object adhering to the specified output schema.
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
    console.log("Generating grocery list for meal plan:", JSON.stringify(input, null, 2));

    const { output } = await prompt(input);

    if (!output) {
      console.error("Grocery list generation failed, AI output was null or undefined.");
      throw new Error("Failed to generate grocery list. AI did not return expected output.");
    }

    console.log("Generated grocery list:", JSON.stringify(output, null, 2));
    return output;
  }
);

/* ========================== */
/*     EXPORTED FUNCTIONS     */
/* ========================== */

/**
 * Generates a grocery list from the given meal plan input.
 */
export async function generateGroceryList(
  input: GenerateGroceryListInput
): Promise<GenerateGroceryListOutput> {
  return generateGroceryListFlow(input);
}

/**
 * Generates a grocery list from the latest full meal plan for the authenticated user.
 */
export async function generateGroceryListFromLatest(): Promise<GenerateGroceryListOutput> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const latestMealPlan = await getLatestFullMealPlanByUserId(userId);
  if (!latestMealPlan || !latestMealPlan.days) {
    throw new Error("No meal plan found");
  }

  const input: GenerateGroceryListInput = {
    mealPlan: latestMealPlan.days.map(day => ({
      day: day.date.getDate(),
      meals: day.meals.map(meal => ({
        name: meal.name,
        ingredients: meal.ingredients,
        instructions: meal.description
      })),
    })),
  };

  return generateGroceryListFlow(input);
}

// export async function getLatestFullMealPlanByUserId(userId: string) {
//   return await prisma.mealPlan.findFirst({
//     where: { userId },
//     orderBy: {
//       createdAt: "desc",
//     },
//     include: {
//       days: {
//         orderBy: { date: "asc" },
//         include: {
//           meals: {
//             orderBy: { name: "asc" },
//             select: {
//               name: true,
//               ingredients: true,
//               description: true,
//             },
//           },
//         },
//       },
//     },
//   });
// }
