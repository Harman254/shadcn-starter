'use server';

/**
 * @fileOverview
 * Generates a personalized meal plan based on user preferences, duration, and meals per day.
 * Includes AI-generated images for each meal using Gemini 2.0 Flash.
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
  conversationContext: z.string().optional().describe('Relevant context from the conversation (e.g., specific dietary needs, health conditions, mentioned foods, preferences expressed in chat).'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

// Output schema
const MealSchema = z.object({
  name: z.string().describe('Name of the meal.'),
  description: z.string().describe('A brief, engaging description of the meal.'),
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'),
  instructions: z.string().describe('Detailed cooking instructions for the meal.'),
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
/*           AI PROMPTS       */
/* ========================== */

// Prompt for generating meal plan structure
const mealPlanPrompt = ai.definePrompt({
  name: 'generateMealPlanStructurePrompt',
  input: {
    schema: GenerateMealPlanInputSchema,
  },
  output: {
    schema: z.object({
      mealPlan: z.array(z.object({
        day: z.number(),
        meals: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          ingredients: z.array(z.string()),
          instructions: z.string(),
        }))
      }))
    }),
  },
  prompt: `
You are an expert meal planner and nutritionist.

Generate a **personalized meal plan** for {{duration}} days with {{mealsPerDay}} meals per day. The meal plan should reflect the following user preferences:

- **Dietary Preferences**: {{#each preferences}}{{this.dietaryPreference}}{{#unless @last}}, {{/unless}}{{/each}}
- **Health or Fitness Goals**: {{#each preferences}}{{this.goal}}{{#unless @last}}, {{/unless}}{{/each}}
- **Household Size**: {{#each preferences}}{{this.householdSize}}{{#unless @last}}, {{/unless}}{{/each}}
- **Cuisine Preferences**: {{#each preferences}}{{#each this.cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if conversationContext}}
**IMPORTANT - Conversation Context:**
The user has mentioned the following in our conversation: {{conversationContext}}

You MUST incorporate this context into the meal plan. For example:
- If they mentioned specific foods (e.g., "toast with avocado", "ginger tea"), include these in appropriate meals
- If they mentioned health conditions (e.g., "hangover", "light and easy to digest"), tailor meals accordingly
- If they mentioned dietary needs or restrictions, prioritize those over general preferences
- If they mentioned specific cuisines or dishes, incorporate those into the plan

The conversation context takes PRIORITY over general preferences when there's a conflict.
{{/if}}

Use the optional **randomSeed** ({{randomSeed}}) to introduce variety on regeneration.

For each meal, include:
- A **unique and descriptive title**
- A short, engaging **description** (1–2 sentences)
- A **realistic and complete list of ingredients**
- **Clear, beginner-friendly cooking instructions**

Return a well-structured meal plan for each day as valid JSON conforming to the output schema. Do **not** include any explanation or formatting outside of the JSON response.

Ensure meals are diverse, not repeated, and aligned with BOTH the dietary preferences AND the conversation context provided.
  `,
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
    // Step 1: Generate meal plan structure
    const { output: mealPlanStructure } = await mealPlanPrompt(input);
    
    if (!mealPlanStructure?.mealPlan) {
      throw new Error('Failed to generate meal plan structure');
    }

    // No image generation, just return the structure
    return {
      mealPlan: mealPlanStructure.mealPlan,
    };
  }
);
