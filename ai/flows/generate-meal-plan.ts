'use server';

/**
 * @fileOverview
 * Generates a personalized meal plan based on user preferences, duration, and meals per day.
 * 
 * Exports:
 * - generatePersonalizedMealPlan: Main function to generate meal plans.
 * - GenerateMealPlanInput: Input type for the function.
 * - GenerateMealPlanOutput: Output type for the function.
 */

import { ai } from '../instance';
import { z } from 'genkit';

/* ========================== */
/*         SCHEMAS            */
/* ========================== */

// Input schema
const GenerateMealPlanInputSchema = z.object({
  duration: z.number().describe('Duration of the meal plan in days.'),
  mealsPerDay: z.number().describe('Number of meals per day.'),
  preferences: z.array(
    z.object({
      dietaryPreference: z.string().describe("User's dietary preference."),
      goal: z.string().describe("User's fitness or dietary goal."),
      householdSize: z.number().describe("User's household size."),
      cuisinePreferences: z.array(z.string()).describe('Preferred cuisines.'),
    })
  ).describe('User preferences including dietary goals and cuisine choices.'),
  randomSeed: z.number().optional().describe('A random seed to introduce variation on regeneration.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

// Output schema
const MealSchema = z.object({
  id: z.string().describe('Unique identifier for the meal.'),
  name: z.string().describe('Name of the meal.'),
  description: z.string().describe('A brief, engaging description of the meal.'),
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'),
  instructions: z.string().describe('Detailed cooking instructions for the meal.'),
  imageUrl: z.string().describe('A URL to an image of the meal.'),
  isLiked: z.boolean().optional().describe('Whether the meal is liked by the user.'),
});

const DayMealPlanSchema = z.object({
  day: z.number().describe('Day number in the meal plan.'),
  meals: z.array(MealSchema).describe('Meals for that day.'),
});

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z.array(DayMealPlanSchema).describe('Generated meal plan.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

/* ========================== */
/*       MAIN FUNCTION        */
/* ========================== */

export async function generatePersonalizedMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {
    schema: GenerateMealPlanInputSchema,
  },
  output: {
    schema: GenerateMealPlanOutputSchema,
  },
  prompt: `Each time generate a new different meal plan.
Generate a personalized meal plan for {{duration}} days with {{mealsPerDay}} meals per day, considering the following preferences:

Dietary Preferences: {{#each preferences}}{{this.dietaryPreference}}{{#unless @last}}, {{/unless}}{{/each}}
Goals: {{#each preferences}}{{this.goal}}{{#unless @last}}, {{/unless}}{{/each}}
Household Sizes: {{#each preferences}}{{this.householdSize}}{{#unless @last}}, {{/unless}}{{/each}}
Cuisine Preferences: {{#each preferences}}{{#each this.cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{#unless @last}}, {{/unless}}{{/each}}

Random Seed: {{randomSeed}}.

Ensure each meal includes:
- A name
- A brief, engaging description (1-2 sentences)
- A list of ingredients
- Clear, detailed cooking instructions
- A valid image URL (realistic, symbolic, or AI-generated)

Return the meal plan as a valid JSON object.`,
});

/* ========================== */
/*        FLOW DEFINITION     */
/* ========================== */

const generateMealPlanFlow = ai.defineFlow<
  typeof GenerateMealPlanInputSchema,
  typeof GenerateMealPlanOutputSchema
>(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
