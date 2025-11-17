'use server';

import { ai } from "@/ai/instance";
import { z } from "genkit";
import { generatePersonalizedMealPlan } from "@/ai/flows/generate-meal-plan";
import { fetchOnboardingData } from "@/data";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { saveMealPlanAction } from "@/actions/save-meal-plan";

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

// Generate Meal Plan Tool
const GenerateMealPlanInputSchema = z.object({
  duration: z
    .number()
    .int()
    .min(1)
    .max(30)
    .describe("Number of days for the meal plan (1-30 days)."),
  mealsPerDay: z
    .number()
    .int()
    .min(1)
    .max(5)
    .describe("Number of meals per day (1-5 meals)."),
  title: z
    .string()
    .optional()
    .describe("Optional title for the meal plan. If not provided, a title will be generated."),
});

const GenerateMealPlanOutputSchema = z.object({
  success: z.boolean().describe("Whether the meal plan was generated successfully."),
  mealPlan: z
    .object({
      title: z.string().describe("Title of the generated meal plan."),
      duration: z.number().describe("Duration in days."),
      mealsPerDay: z.number().describe("Number of meals per day."),
      days: z
        .array(
          z.object({
            day: z.number().describe("Day number (1-based)."),
            meals: z
              .array(
                z.object({
                  name: z.string().describe("Name of the meal."),
                  description: z.string().describe("Description of the meal."),
                  ingredients: z.array(z.string()).describe("List of ingredients."),
                  instructions: z.string().describe("Cooking instructions."),
                  imageUrl: z.string().optional().describe("Optional image URL for the meal."),
                })
              )
              .describe("Meals for this day."),
          })
        )
        .describe("Days in the meal plan."),
    })
    .optional()
    .describe("The generated meal plan data."),
  message: z.string().describe("A message describing the result."),
});

const generateMealPlan = ai.defineTool(
  {
    name: "generate_meal_plan",
    description:
      "Generates a personalized meal plan based on user preferences. Use this when the user asks to create, generate, or plan meals. The meal plan will be tailored to their dietary preferences, goals, household size, and cuisine preferences.",
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[generateMealPlan] Tool called with input:', { duration: input.duration, mealsPerDay: input.mealsPerDay, title: input.title });
    }
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return {
          success: false,
          message: "You must be logged in to generate a meal plan. Please sign in first.",
        };
      }

      const userId = session.user.id;

      // Fetch user preferences
      const preferencesData = await fetchOnboardingData(userId);

      if (!preferencesData || preferencesData.length === 0) {
        return {
          success: false,
          message:
            "Please set up your dietary preferences first. Go to Dashboard > Preferences to configure your meal planning preferences.",
        };
      }

      // Convert preferences to the format expected by generatePersonalizedMealPlan
      const preferences = preferencesData.map((pref) => ({
        dietaryPreference: pref.dietaryPreference,
        goal: pref.goal,
        householdSize: pref.householdSize,
        cuisinePreferences: pref.cuisinePreferences,
      }));

      // Generate the meal plan
      const result = await generatePersonalizedMealPlan({
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        preferences,
        randomSeed: Math.floor(Math.random() * 1000),
      });

      if (!result?.mealPlan) {
        return {
          success: false,
          message: "Failed to generate meal plan. Please try again.",
        };
      }

      // Generate title if not provided
      const title =
        input.title ||
        `${input.duration}-Day Meal Plan (${input.mealsPerDay} meals/day)`;

      // Transform to match the save API format
      const mealPlanData = {
        title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        days: result.mealPlan.map((day) => ({
          day: day.day,
          meals: day.meals.map((meal) => ({
            name: meal.name,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            // imageUrl is optional and not generated by the meal plan flow
            imageUrl: undefined,
          })),
        })),
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('[generateMealPlan] ✅ Successfully generated meal plan:', {
          title: mealPlanData.title,
          days: mealPlanData.days.length,
          totalMeals: mealPlanData.days.reduce((sum, day) => sum + day.meals.length, 0),
        });
      }

      return {
        success: true,
        mealPlan: mealPlanData,
        message: `Successfully generated a ${input.duration}-day meal plan with ${input.mealsPerDay} meals per day! The meal plan is ready to be saved.`,
      };
    } catch (error) {
      console.error("[generateMealPlan] Error:", error);
      return {
        success: false,
        message: `Failed to generate meal plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
);

// Save Meal Plan Tool
const SaveMealPlanInputSchema = z.object({
  title: z.string().describe("Title of the meal plan."),
  duration: z.number().describe("Duration in days."),
  mealsPerDay: z.number().describe("Number of meals per day."),
  days: z
    .array(
      z.object({
        day: z.number().describe("Day number (1-based)."),
        meals: z
          .array(
            z.object({
              name: z.string().describe("Name of the meal."),
              description: z.string().describe("Description of the meal."),
              ingredients: z.array(z.string()).describe("List of ingredients."),
              instructions: z.string().describe("Cooking instructions."),
              imageUrl: z.string().optional().describe("Optional image URL for the meal."),
            })
          )
          .describe("Meals for this day."),
      })
    )
    .describe("Days in the meal plan."),
});

const SaveMealPlanOutputSchema = z.object({
  success: z.boolean().describe("Whether the meal plan was saved successfully."),
  mealPlanId: z.string().optional().describe("ID of the saved meal plan."),
  message: z.string().describe("A message describing the result."),
});

const saveMealPlan = ai.defineTool(
  {
    name: "save_meal_plan",
    description:
      "Saves a meal plan to the user's account. Use this after generating a meal plan or when the user explicitly asks to save a meal plan. The meal plan must be in the correct format with title, duration, mealsPerDay, and days array.",
    inputSchema: SaveMealPlanInputSchema,
    outputSchema: SaveMealPlanOutputSchema,
  },
  async (input) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[saveMealPlan] Tool called with input:', {
        title: input.title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        daysCount: input.days.length,
        totalMeals: input.days.reduce((sum, day) => sum + day.meals.length, 0),
      });
    }
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user?.id) {
        return {
          success: false,
          message: "You must be logged in to save a meal plan. Please sign in first.",
        };
      }

      // Prepare data in the format expected by the save action
      const saveData = {
        title: input.title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        days: input.days,
        createdAt: new Date().toISOString(),
      };

      // Call the save action directly
      const result = await saveMealPlanAction(saveData);

      if (process.env.NODE_ENV === 'development') {
        console.log('[saveMealPlan] Save result:', {
          success: result.success,
          mealPlanId: result.mealPlan?.id,
          error: result.error,
        });
      }

      if (result.success && result.mealPlan) {
        return {
          success: true,
          mealPlanId: result.mealPlan.id,
          message: `Meal plan "${input.title}" has been saved successfully! You can view it in your meal plans.`,
        };
      }

      return {
        success: false,
        message: `Failed to save meal plan: ${result.error || "Unknown error"}`,
      };
    } catch (error) {
      console.error("[saveMealPlan] Error:", error);
      return {
        success: false,
        message: `Failed to save meal plan: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
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
  tools: [logMeal, generateMealPlan, saveMealPlan],
  prompt: `You are Mealwise, a helpful kitchen assistant. Your primary roles are:
1. **Provide cooking instructions and recipes** - When users ask how to cook something (e.g., "how to cook lasagna"), provide detailed, step-by-step cooking instructions with ingredients, measurements, and cooking methods.
2. **Offer culinary advice** - Answer questions about cooking techniques, ingredients, food safety, and kitchen tips.
3. **Generate meal plans** - Use the generate_meal_plan tool when users ask to create, generate, or plan meals. The tool will create a personalized meal plan based on their preferences.
4. **Save meal plans** - Use the save_meal_plan tool when users want to save a generated meal plan to their account. Always save meal plans after generating them unless the user explicitly says not to.
5. **Track meals** - Only use the logMeal tool when the user explicitly states they have ALREADY EATEN a meal and want to track/log it.

**IMPORTANT RULES:**
- ALWAYS provide cooking instructions when asked. Never refuse to help with cooking questions.
- If a user asks "how to cook [dish]" or "recipe for [dish]", they want cooking instructions, NOT meal logging.
- When users ask to create/generate/plan meals, use generate_meal_plan tool. After generating, automatically save it using save_meal_plan unless the user says not to.
- Only use the logMeal tool when the user says they have eaten something (e.g., "I ate lasagna for dinner" or "I just had pizza").
- Be detailed and helpful with cooking instructions - include ingredients, measurements, cooking times, temperatures, and step-by-step methods.
- For meal plan generation, default to 7 days and 3 meals per day if not specified by the user.

Question: {{{question}}}`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: "answerQuestionFlow",
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    // Log tool availability for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[answerQuestionFlow] Tools available:', ['logMeal', 'generateMealPlan', 'saveMealPlan']);
      console.log('[answerQuestionFlow] Processing question:', input.question);
    }

    const { output } = await answerQuestionPrompt(input);

    // Log the output for debugging (especially tool calls)
    if (process.env.NODE_ENV === 'development') {
      console.log('[answerQuestionFlow] Received output:', {
        hasAnswer: !!output?.answer,
        answerLength: output?.answer?.length || 0,
        answerPreview: output?.answer?.substring(0, 100) || 'N/A',
      });
    }

    // ✅ Defensive fix
    if (!output || typeof output.answer !== "string") {
      console.warn("[Mealwise] answerQuestionPrompt returned invalid output:", output);
      return { answer: "Sorry, I could not generate an answer right now. Please try again." };
    }

    return output;
  }
);
