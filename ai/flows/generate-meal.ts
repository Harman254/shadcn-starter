import { ai } from '../instance';
import { z } from 'genkit';

/* ========== SCHEMAS ========== */

const SwapMealInputSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']), // Replace with your MealType enum if available
  dietaryPreference: z.string(),
  goal: z.string(),
  cuisinePreferences: z.array(z.string()),
  currentMealName: z.string(),
  currentMealIngredients: z.array(z.string()),
  calories: z.number().optional(),
});

const SwapMealOutputSchema = z.object({
  id: z.string(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  calories: z.number(),
  dayMealId: z.string().optional(), // Optional here, can be added later
});

export type SwapMealInput = z.infer<typeof SwapMealInputSchema>;
export type SwapMealOutput = z.infer<typeof SwapMealOutputSchema>;

/* ========== PROMPT ========== */

const swapMealPrompt = ai.definePrompt({
  name: 'swapMealPrompt',
  input: { schema: SwapMealInputSchema },
  output: { schema: SwapMealOutputSchema },
  prompt: `
YouAre a helpful meal-planning assistant.

A user wants to swap out the following {{type}} meal:
- Name: {{currentMealName}}
- Ingredients: {{#each currentMealIngredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Calories: {{calories}}

User Preferences:
- Dietary: {{dietaryPreference}}
- Goal: {{goal}}
- Preferred Cuisines: {{#each cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Return a *different* meal with:
- A new name
- A short description
- A list of ingredients
- Similar calorie range
- Same type: {{type}}

Respond with a valid JSON object that matches the expected format.
`,
});

/* ========== FLOW DEFINITION ========== */

export const swapMealFlow = ai.defineFlow<
  typeof SwapMealInputSchema,
  typeof SwapMealOutputSchema
>(
  {
    name: 'swapMealFlow',
    inputSchema: SwapMealInputSchema,
    outputSchema: SwapMealOutputSchema,
  },
  async (input) => {
    const { output } = await swapMealPrompt(input);
    return output!;
  }
);


