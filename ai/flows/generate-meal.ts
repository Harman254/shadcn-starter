import { ai } from '../instance';
import { z } from 'genkit';

/* ========== SCHEMAS ========== */

const SwapMealInputSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  dietaryPreference: z.string(),
  goal: z.string(),
  cuisinePreferences: z.array(z.string()),
  currentMealName: z.string(),
  currentMealIngredients: z.array(z.string()),
  calories: z.number().optional(),
  dayMealId: z.string(), // Add this to ensure we can preserve the relationship
});

const SwapMealOutputSchema = z.object({
  id: z.string(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().describe('Name of the meal'), // Name of the meal
  description: z.string().describe('A brief, engaging description of the meal.'), 
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'), // List of ingredients
  instructions: z.string().describe('Detailed cooking instructions for the meal.'), // Detailed instructions
  calories: z.number(),
  dayMealId: z.string(), 
});

export type SwapMealInput = z.infer<typeof SwapMealInputSchema>;
export type SwapMealOutput = z.infer<typeof SwapMealOutputSchema>;

/* ========== PROMPT ========== */

const swapMealPrompt = ai.definePrompt({
  name: 'swapMealPrompt',
  input: { schema: SwapMealInputSchema },
  output: { schema: SwapMealOutputSchema },
  prompt: `
You are a helpful meal-planning assistant.

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
- A brief, engaging description (1-2 sentences)
- A list of ingredients (as an array of strings)
- Clear, detailed cooking instructions
- Similar calorie range (±50 calories from {{calories}})
- Same type: {{type}}
- Preserve the dayMealId: {{dayMealId}}

Important: Return a valid JSON object that matches the expected format exactly. The meal should be different from the current one but appropriate for the same meal type and user preferences.
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


