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
  chatMessages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ).optional().describe('Recent chat messages to understand what the user actually wants right now.'),
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
You are an expert meal planner creating meal plans that serve the user's ACTUAL needs right now.

Generate a **personalized meal plan** for {{duration}} days with {{mealsPerDay}} meals per day.

{{#if chatMessages}}
**CRITICAL - What the user ACTUALLY wants (READ THIS FIRST):**
{{#each chatMessages}}
{{this.role}}: {{this.content}}
{{/each}}

**PRIORITY RULES:**
1. If the user mentioned specific foods, dishes, or cuisines in the chat above → INCLUDE THEM in the meal plan
2. If the user mentioned health conditions, dietary needs, or restrictions → TAILOR ALL MEALS to address them
3. If the user asked for something specific (e.g., "light meals", "comfort food", "quick meals") → MAKE THAT THE FOCUS
4. The chat messages above are MORE IMPORTANT than saved preferences below - always prioritize what the user said in chat

{{#if preferences}}
**Background - Saved Preferences (use as reference, but chat takes priority):**
- Dietary: {{#each preferences}}{{this.dietaryPreference}}{{#unless @last}}, {{/unless}}{{/each}}
- Goals: {{#each preferences}}{{this.goal}}{{#unless @last}}, {{/unless}}{{/each}}
- Household: {{#each preferences}}{{this.householdSize}}{{#unless @last}}, {{/unless}}{{/each}}
- Cuisines: {{#each preferences}}{{#each this.cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{#unless @last}}, {{/unless}}{{/each}}

Use these as background info, but if chat messages conflict with these, follow the chat messages.
{{/if}}
{{else}}
{{#if preferences}}
**User Preferences:**
- Dietary: {{#each preferences}}{{this.dietaryPreference}}{{#unless @last}}, {{/unless}}{{/each}}
- Goals: {{#each preferences}}{{this.goal}}{{#unless @last}}, {{/unless}}{{/each}}
- Household: {{#each preferences}}{{this.householdSize}}{{#unless @last}}, {{/unless}}{{/each}}
- Cuisines: {{#each preferences}}{{#each this.cuisinePreferences}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{#unless @last}}, {{/unless}}{{/each}}

Use these preferences to guide your meal plan, but be flexible and creative.
{{/if}}
{{/if}}

Use randomSeed {{randomSeed}} for variety.

For each meal, include:
- A **unique and descriptive title**
- A short, engaging **description** (1–2 sentences)
- A **realistic and complete list of ingredients**
- **Clear, beginner-friendly cooking instructions**

Return ONLY valid JSON conforming to the output schema. No explanations outside JSON.

Create meals the user will actually want to eat based on what they told you in chat.
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
