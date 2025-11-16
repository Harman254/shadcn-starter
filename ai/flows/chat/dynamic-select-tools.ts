'use server';

import { ai } from "@/ai/instance";
import { z } from "genkit";

const LogMealInputSchema = z.object({
  meal_description: z
    .string()
    .describe(
      "A description of the meal the user ate, including the name of the food and any other details provided."
    ),
});

const LogMealOutputSchema = z
  .string()
  .describe("A confirmation message to the user that the meal has been logged.");

const logMeal = ai.defineTool(
  {
    name: "logMeal",
    description: "Logs a meal that the user has eaten.",
    inputSchema: LogMealInputSchema,
    outputSchema: LogMealOutputSchema,
  },
  async (input) => {
    return `Meal logged: ${input.meal_description}. Great job!`;
  }
);

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe("The user question to answer."),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe("The answer to the user question."),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(
  input: AnswerQuestionInput
): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const answerQuestionPrompt = ai.definePrompt({
  name: "answerQuestionPrompt",
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  tools: [logMeal],
  prompt: `You are Mealwise, a helpful kitchen assistant. Your primary roles are:
1. **Provide cooking instructions and recipes** - When users ask how to cook something (e.g., "how to cook lasagna"), provide detailed, step-by-step cooking instructions with ingredients, measurements, and cooking methods.
2. **Offer culinary advice** - Answer questions about cooking techniques, ingredients, food safety, and kitchen tips.
3. **Track meals** - Only use the logMeal tool when the user explicitly states they have ALREADY EATEN a meal and want to track/log it.

**IMPORTANT RULES:**
- ALWAYS provide cooking instructions when asked. Never refuse to help with cooking questions.
- If a user asks "how to cook [dish]" or "recipe for [dish]", they want cooking instructions, NOT meal logging.
- Only use the logMeal tool when the user says they have eaten something (e.g., "I ate lasagna for dinner" or "I just had pizza").
- Be detailed and helpful with cooking instructions - include ingredients, measurements, cooking times, temperatures, and step-by-step methods.

Question: {{{question}}}`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: "answerQuestionFlow",
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await answerQuestionPrompt(input);

    // ✅ Defensive fix
    if (!output || typeof output.answer !== "string") {
      console.warn("[Mealwise] answerQuestionPrompt returned invalid output:", output);
      return { answer: "Sorry, I could not generate an answer right now. Please try again." };
    }

    return output;
  }
);
