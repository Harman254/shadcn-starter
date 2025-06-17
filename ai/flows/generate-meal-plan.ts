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
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

// Output schema
const MealSchema = z.object({
  id: z.string().describe('Unique identifier for the meal.'),
  name: z.string().describe('Name of the meal.'),
  description: z.string().describe('A brief, engaging description of the meal.'),
  ingredients: z.array(z.string()).describe('Ingredients of the meal.'),
  instructions: z.string().describe('Detailed cooking instructions for the meal.'),
  imageUrl: z.string().describe('A URL or base64 encoded image of the meal.'),
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

Use the optional **randomSeed** ({{randomSeed}}) to introduce variety on regeneration.

For each meal, include:
- A **unique and descriptive title**
- A short, engaging **description** (1–2 sentences)
- A **realistic and complete list of ingredients**
- **Clear, beginner-friendly cooking instructions**

Return a well-structured meal plan for each day as valid JSON conforming to the output schema. Do **not** include any explanation or formatting outside of the JSON response.

Ensure meals are diverse, not repeated, and aligned with the dietary and culinary preferences provided.
  `,
});

// Prompt for generating meal images
const imagePrompt = ai.definePrompt({
  name: 'generateMealImagePrompt',
  input: {
    schema: z.object({
      mealName: z.string(),
      description: z.string(),
      ingredients: z.array(z.string()),
      cuisineStyle: z.string().optional(),
    }),
  },
  output: {
    schema: z.object({
      imageUrl: z.string().describe('A realistic image URL or base64 encoded image data'),
    }),
  },
  prompt: `
Generate a beautiful, appetizing image of the following meal:

**Meal Name**: {{mealName}}
**Description**: {{description}}
**Ingredients**: {{#each ingredients}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
**Cuisine Style**: {{cuisineStyle}}

Create a high-quality, professional food photography style image that showcases the meal in an appealing way. The image should be:
- Well-lit and appetizing
- Show the complete dish as it would be served
- Use natural, warm lighting
- Include appropriate garnishes and presentation
- Be suitable for a recipe website or cookbook

If you can generate an image, provide it as a base64 encoded string that can be directly used in HTML img tags.
If you cannot generate an image, provide a realistic placeholder URL that represents the meal (e.g., "https://images.unsplash.com/photo-...")
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

    // Step 2: Generate images for each meal (with fallbacks)
    const mealPlanWithImages = await Promise.all(
      mealPlanStructure.mealPlan.map(async (dayPlan) => {
        const mealsWithImages = await Promise.all(
          dayPlan.meals.map(async (meal) => {
            try {
              // Try to generate image for this meal
              const { output: imageResult } = await imagePrompt({
                mealName: meal.name,
                description: meal.description,
                ingredients: meal.ingredients,
                cuisineStyle: input.preferences[0]?.cuisinePreferences?.[0] || 'International',
              });

              // Check if we got a valid image result
              if (imageResult?.imageUrl) {
                // If it's a base64 image, use it directly
                if (imageResult.imageUrl.startsWith('data:image/')) {
                  return {
                    ...meal,
                    imageUrl: imageResult.imageUrl,
                  };
                }
                // If it's a URL, validate it
                if (imageResult.imageUrl.startsWith('http')) {
                  return {
                    ...meal,
                    imageUrl: imageResult.imageUrl,
                  };
                }
              }

              // Fallback to a placeholder image
              return {
                ...meal,
                imageUrl: generatePlaceholderImage(meal.name, meal.description),
              };
            } catch (error) {
              console.error(`Failed to generate image for meal: ${meal.name}`, error);
              // Return meal with fallback image
              return {
                ...meal,
                imageUrl: generatePlaceholderImage(meal.name, meal.description),
              };
            }
          })
        );

        return {
          day: dayPlan.day,
          meals: mealsWithImages,
        };
      })
    );

    return {
      mealPlan: mealPlanWithImages,
    };
  }
);

/* ========================== */
/*      HELPER FUNCTIONS      */
/* ========================== */

// Generate a placeholder SVG image based on meal details
function generatePlaceholderImage(mealName: string, description: string): string {
  // Create a simple SVG placeholder with meal information
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#F3F4F6"/>
      <rect x="50" y="50" width="300" height="200" fill="#E5E7EB" rx="8"/>
      <text x="200" y="120" font-family="Arial, sans-serif" font-size="16" fill="#6B7280" text-anchor="middle">🍽️</text>
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="14" fill="#374151" text-anchor="middle" font-weight="bold">${mealName}</text>
      <text x="200" y="170" font-family="Arial, sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">${description.substring(0, 40)}${description.length > 40 ? '...' : ''}</text>
      <text x="200" y="220" font-family="Arial, sans-serif" font-size="10" fill="#9CA3AF" text-anchor="middle">AI Generated Meal</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
