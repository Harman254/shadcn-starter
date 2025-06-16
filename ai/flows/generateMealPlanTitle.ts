'use server';

import { ai } from '../instance';
import { z } from 'genkit';

/* ========================== */
/*        TYPE DEFINITIONS    */
/* ========================== */

export type SimplifiedMealPlan = {
  meals: {
    name: string;
    ingredients: string[];
    instructions: string;
  }[];
  day: number;
}[];

/* ========================== */
/*        SCHEMAS             */
/* ========================== */

// Output
const GenerateTitleOutputSchema = z.object({
  title: z.string().describe("A catchy, relevant, and personalized title for the meal plan."),
});
export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;

// Input
const GenerateTitleInputSchema = z.object({
  mealPlan: z.custom<SimplifiedMealPlan>().describe("A simplified version of the meal plan including meals per day."),
});
export type GenerateTitleInput = z.infer<typeof GenerateTitleInputSchema>;

/* ========================== */
/*           PROMPT           */
/* ========================== */

const generateTitlePrompt = ai.definePrompt({
  name: 'generateTitlePrompt',
  input: { schema: GenerateTitleInputSchema },
  output: { schema: GenerateTitleOutputSchema },
  prompt: `
You are a Meal Plan Title Assistant for a smart nutrition app.

Your task is to generate a **distinctive and engaging title** for the provided meal plan. Consider the variety of meals, their style, health benefits, or ingredients.

Avoid generic names like "Weekly Plan". Be original and make the title:
- Memorable
- Nutrient or cuisine-specific (if possible)
- Varied in tone and phrasing across different requests

Meal Plan:
{{#each mealPlan}}
  Day {{this.day}}:
  {{#each this.meals}}
    - {{this.name}}
  {{/each}}
{{/each}}

Respond ONLY with a valid JSON object:
{ "title": "..." }
`,
});

/* ========================== */
/*        FLOW DEFINITION     */
/* ========================== */

const generateTitleFlow = ai.defineFlow<
  typeof GenerateTitleInputSchema,
  typeof GenerateTitleOutputSchema
>(
  {
    name: 'generateTitleFlow',
    inputSchema: GenerateTitleInputSchema,
    outputSchema: GenerateTitleOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await generateTitlePrompt(input);

      if (!output?.title) {
        throw new Error("AI did not return a title.");
      }

      return output;
    } catch (error) {
      console.error("Error in title generation:", error);
      throw new Error("Failed to generate a meal plan title. Please try again later.");
    }
  }
);

/* ========================== */
/*     MAIN EXPORT FUNCTION   */
/* ========================== */

export async function generateMealPlanTitle(
  mealPlan: SimplifiedMealPlan
): Promise<GenerateTitleOutput> {
  return generateTitleFlow({ mealPlan });
}
