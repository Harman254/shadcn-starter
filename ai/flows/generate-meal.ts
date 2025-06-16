import { ai } from '../instance';
import { z } from 'genkit';

/* ========================== */
/*         SCHEMAS            */
/* ========================== */

const SwapMealInputSchema = z.object({
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  dietaryPreference: z.string(),
  goal: z.string(),
  cuisinePreferences: z.array(z.string()),
  currentMealName: z.string(),
  currentMealIngredients: z.array(z.string()),
  calories: z.number().optional(),
  dayMealId: z.string(),
});

const SwapMealOutputSchema = z.object({
  id: z.string(),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  name: z.string().describe('Name of the meal.'),
  description: z.string().describe('A brief, engaging description of the meal.'),
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'),
  instructions: z.string().describe('Detailed cooking instructions for the meal.'),
  calories: z.number(),
  dayMealId: z.string(),
});

export type SwapMealInput = z.infer<typeof SwapMealInputSchema>;
export type SwapMealOutput = z.infer<typeof SwapMealOutputSchema>;

/* ========================== */
/*           PROMPT           */
/* ========================== */

const swapMealPrompt = ai.definePrompt({
  name: 'swapMealPrompt',
  input: { schema: SwapMealInputSchema },
  output: { schema: SwapMealOutputSchema },
  prompt: `
You are an expert AI assistant in meal planning.

A user wants to swap their current {{type}} meal. The current meal is:
- Name: {{currentMealName}}
- Ingredients: {{#each currentMealIngredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Calories: {{calories}}

User Preferences:
- Dietary Preference: {{dietaryPreference}}
- Goal: {{goal}}
- Preferred Cuisines: {{#each cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

Your task:
Generate a **different** meal for the same type ({{type}}) that fits the user’s preferences and has a calorie value within ±50 of {{calories}}.

Make sure the new meal includes:
- A unique name
- A brief, engaging 1–2 sentence description
- A list of realistic ingredients (array of strings)
- Clear and beginner-friendly cooking instructions
- The same meal type
- Similar calorie range (±50)
- The original dayMealId: {{dayMealId}}

Only return a valid JSON object that conforms to the expected schema. Do not include any extra commentary.
`,
});

/* ========================== */
/*        FLOW DEFINITION     */
/* ========================== */

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
