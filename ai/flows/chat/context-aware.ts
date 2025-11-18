'use server';

/**
 * @fileOverview Implements a context-aware chatbot flow using a sliding window strategy.
 *
 * - chat - The main function to initiate and manage the chat flow.
 * - ContextAwareChatInput - Input type for the chat function, including the user's message.
 * - ContextAwareChatOutput - Output type for the chat function, providing the chatbot's response.
 */

import { ai } from "@/ai/instance";
import { z } from "genkit";
import { generateMealPlan, saveMealPlan } from "./dynamic-select-tools";

// Shared type for user preferences in AI context
const UserPreferenceSchema = z.object({
  dietaryPreference: z.string(),
  goal: z.string(),
  householdSize: z.number(),
  cuisinePreferences: z.array(z.string()),
});

const ContextAwareChatInputSchema = z.object({
  message: z.string().describe("The user message."),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .describe("The chat history."),
  userPreferences: z
    .array(UserPreferenceSchema)
    .optional()
    .describe("User's dietary preferences for personalized meal planning context."),
});
export type ContextAwareChatInput = z.infer<typeof ContextAwareChatInputSchema>;

const ContextAwareChatOutputSchema = z.object({
  response: z.string().describe("The chatbot response."),
});
export type ContextAwareChatOutput = z.infer<typeof ContextAwareChatOutputSchema>;

// Use a focused context window for better performance and cost efficiency
// If conversation is very long, we'll use the most recent messages but prioritize recent context
const MAX_CONTEXT_MESSAGES = 5; // Using last 5 messages for context awareness

export async function chat(
  input: ContextAwareChatInput
): Promise<ContextAwareChatOutput> {
  return contextAwareChatFlow(input);
}

const prompt = ai.definePrompt({
  name: "contextAwareChatPrompt",
  input: {
    schema: ContextAwareChatInputSchema,
  },
  output: {
    schema: ContextAwareChatOutputSchema,
  },
  tools: [generateMealPlan, saveMealPlan],
  prompt: `You are Mealwise, an expert culinary assistant and cooking instructor. Your primary role is to help users with cooking, recipes, and culinary knowledge.

**YOUR CORE RESPONSIBILITIES:**
1. **Provide detailed cooking instructions** - When users ask how to cook something (e.g., "how to cook lasagna"), give them complete, step-by-step cooking instructions with ingredients, preparation methods, cooking times, and techniques.
2. **Share recipes** - Provide full recipes including ingredients lists, measurements, and detailed cooking steps.
3. **Offer culinary advice** - Answer questions about cooking techniques, ingredient substitutions, food safety, and kitchen tips.
4. **Remember conversation context** - Reference previous messages and maintain context throughout the conversation.
5. **Generate meal plans** - Use the generate_meal_plan tool when users ask to create, generate, or plan meals. The tool automatically uses their stored preferences (dietary preference, goals, household size, cuisine preferences) - DO NOT ask follow-up questions about these. The tool only needs duration and mealsPerDay.
6. **Save meal plans** - Use the save_meal_plan tool when users want to save a generated meal plan to their account. Always save meal plans after generating them unless the user explicitly says not to.

**CRITICAL RULES FOR MEAL PLAN GENERATION:**
- NEVER ask follow-up questions about dietary preferences, goals, household size, or cuisine preferences
- The generate_meal_plan tool automatically retrieves and uses the user's stored preferences from their account
- If the user doesn't specify duration or mealsPerDay, use defaults: 7 days and 3 meals per day
- Simply call the tool with duration and mealsPerDay - the tool handles everything else automatically
- If the tool returns an error about missing preferences, inform the user they need to set up preferences first

**IMPORTANT RULES:**
- ALWAYS provide cooking instructions when asked. Never refuse to help with cooking questions.
- Be detailed and helpful. Include ingredient lists, measurements, cooking times, temperatures, and step-by-step instructions.
- If a user asks "how to cook [dish]", they want cooking instructions, not meal logging assistance.
- Only suggest meal logging if the user explicitly mentions they have already eaten something and want to track it.
- When users ask to create/generate/plan meals, immediately use generate_meal_plan tool with duration and mealsPerDay (or defaults). DO NOT ask about their preferences - the tool uses stored preferences automatically.

{{#if userPreferences}}
**USER PREFERENCES (for personalized meal planning context):**
{{#each userPreferences}}
- Dietary Preference: {{dietaryPreference}}
- Goal: {{goal}}
- Household Size: {{householdSize}} people
- Cuisine Preferences: {{cuisinePreferences}}
{{/each}}

Use these preferences to provide personalized meal suggestions and recommendations. When suggesting meals or recipes, consider their dietary preferences and goals.
{{/if}}

Chat History (full conversation context):
{{#each chatHistory}}
  {{role}}: {{content}}
{{/each}}

User Message: {{message}}

Remember the full conversation context above when responding. Reference previous messages when relevant. Provide helpful, detailed cooking instructions and recipes when requested. If user preferences are provided, use them to personalize your suggestions.`,
});

const contextAwareChatFlow = ai.defineFlow(
  {
    name: "contextAwareChatFlow",
    inputSchema: ContextAwareChatInputSchema,
    outputSchema: ContextAwareChatOutputSchema,
  },
  async (input) => {
    const chatHistory = input.chatHistory || [];
    const userPreferences = input.userPreferences || [];
    
    // Use full history if it's within limit, otherwise use most recent messages
    // This ensures context-awareness while staying within token limits
    const contextHistory = chatHistory.length <= MAX_CONTEXT_MESSAGES
      ? chatHistory // Use full history if within limit
      : chatHistory.slice(-MAX_CONTEXT_MESSAGES); // Use most recent messages if too long

    const { output } = await prompt({
      ...input,
      chatHistory: contextHistory,
      userPreferences: userPreferences,
    });

    // ✅ Defensive fallback to avoid schema errors
    if (!output || typeof output.response !== "string") {
      console.warn(
        "[Mealwise] contextAwareChatPrompt returned invalid output:",
        output
      );
      return {
        response:
          "Sorry, I couldn’t generate a response at the moment. Please try again.",
      };
    }

    return output;
  }
);
