'use server';

import { ai } from '../instance';
import { z } from 'genkit';

/* ========================== */
/*       OUTPUT SCHEMA        */
/* ========================== */


export type SimplifiedMealPlan = {
    meals: {
      name: string;
      ingredients: string[];
      instructions: string;
    }[];
    day: number;
  }[];

const GenerateTitleOutputSchema = z.object({
  title: z.string().describe("A catchy, relevant, and personalized title for the meal plan."),
});

export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;

/* ========================== */
/*       INPUT SCHEMA         */
/* ========================== */

const GenerateTitleInputSchema = z.object({
  mealPlan: z.custom<SimplifiedMealPlan>(), // You can use a simplified schema if needed
});

export type GenerateTitleInput = z.infer<typeof GenerateTitleInputSchema>;

/* ========================== */
/*           AI PROMPT        */
/* ========================== */

const generateTitlePrompt = ai.definePrompt({
  name: 'generateTitlePrompt',
  input: { schema: GenerateTitleInputSchema },
  output: { schema: GenerateTitleOutputSchema },
  prompt: `
You are a naming assistant for a smart meal planning app. Based on the provided meal plan, generate a short and engaging title that:

- Reflects the overall theme, diversity, or nutritional goal of the meal plan.
- Is no more than 6 words.
- Avoids generic phrases like "Weekly Plan" or "Meal List".
- Feels tailored to the user based on the meals and structure.

Meal Plan:
{{#each mealPlan.days}}
  Day {{@index}}:
  {{#each this.meals}}
    - {{this.name}}
  {{/each}}
{{/each}}

Respond ONLY with a valid JSON object: { "title": "..." }.
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
      throw new Error("Failed to generate title. Please try again later.");
    }
  }
);

/* ========================== */
/*     EXPORTED FUNCTION      */
/* ========================== */

export async function generateMealPlanTitle(
  mealPlan: SimplifiedMealPlan
): Promise<GenerateTitleOutput> {
  return generateTitleFlow({ mealPlan });
}
