'use server';
/**
 * @fileOverview Generates a personalized meal plan based on user preferences, duration, and meals per day.
 *
 * - generatePersonalizedMealPlan - A function that generates the meal plan.
 * - GenerateMealPlanInput - The input type for the generatePersonalMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generatePersonalMealPlan function.
 */

import { ai } from '../instance';
import { z } from 'genkit';

const GenerateMealPlanInputSchema = z.object({
  duration: z.number().describe('The duration of the meal plan in days.'),
  mealsPerDay: z.number().describe('The number of meals per day.'),
  preferences: z.array(z.object({
    dietaryPreference: z.string().describe('The user\'s dietary preference.'),
    goal: z.string().describe('The user\'s fitness or dietary goal.'),
    householdSize: z.number().describe('The size of the user\'s household.'),
    cuisinePreferences: z.array(z.string()).describe('Preferred cuisines.'),
  })).describe('The user preferences including dietary goals and cuisine choices.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  ingredients: z.array(z.string()).describe('The ingredients of the meal.'),
  instructions: z.string().describe('The cooking instructions for the meal.'),
});

const DayMealPlanSchema = z.object({
  day: z.number().describe('The day number in the meal plan.'),
  meals: z.array(MealSchema).describe('The meals for the day.'),
});

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z.array(DayMealPlanSchema).describe('The generated meal plan.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generatePersonalizedMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {
    schema: z.object({
      duration: z.number().describe('The duration of the meal plan in days.'),
      mealsPerDay: z.number().describe('The number of meals per day.'),
      preferences: z.array(z.object({
        dietaryPreference: z.string().describe('The user\'s dietary preference.'),
        goal: z.string().describe('The user\'s fitness or dietary goal.'),
        householdSize: z.number().describe('The size of the user\'s household.'),
        cuisinePreferences: z.array(z.string()).describe('Preferred cuisines.'),
      })),
    }),
  },
  output: {
    schema: z.object({
      mealPlan: z.array(z.object({
        day: z.number().describe('The day number in the meal plan.'),
        meals: z.array(z.object({
          name: z.string().describe('The name of the meal.'),
          ingredients: z.array(z.string()).describe('The ingredients of the meal.'),
          instructions: z.string().describe('The cooking instructions for the meal.'),
        })),
      })),
    }),
  },
  prompt: `Generate a personalized meal plan for {{duration}} days with {{mealsPerDay}} meals per day, considering the following preferences:

Dietary Preferences: {{#each preferences}}{{this.dietaryPreference}}{{#unless @last}}, {{/unless}}{{/each}}
Goals: {{#each preferences}}{{this.goal}}{{#unless @last}}, {{/unless}}{{/each}}
Household Sizes: {{#each preferences}}{{this.householdSize}}{{#unless @last}}, {{/unless}}{{/each}}
Cuisine Preferences: {{#each preferences}}{{#each this.cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{#unless @last}}, {{/unless}}{{/each}}

Ensure each meal includes a name, ingredients, and cooking instructions. Output the meal plan as a JSON object.`,
});

const generateMealPlanFlow = ai.defineFlow<
  typeof GenerateMealPlanInputSchema,
  typeof GenerateMealPlanOutputSchema
>(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
