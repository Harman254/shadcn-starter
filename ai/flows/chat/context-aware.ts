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
import { generateMealPlan, saveMealPlan, generateMealPlanCore } from "./dynamic-select-tools";

// Helper to extract duration and mealsPerDay from user message or chat history
// Prioritizes explicit user requests over defaults
function extractMealPlanParams(message: string, chatHistory?: Array<{ role: string; content: string }>): { duration: number; mealsPerDay: number } {
  // If message is short (like "do it"), check chat history for parameters
  const isShortMessage = message.trim().length < 20 && /^(do it|yes|ok|sure|go|generate)$/i.test(message.trim());
  
  // Search in reverse order (most recent first) to find the latest meal plan request
  const searchText = isShortMessage && chatHistory 
    ? [...chatHistory].reverse().map(m => m.content).join(' ') + ' ' + message
    : message;
  // Extract duration - look for numbers followed by "day" or "days"
  // Also handle written numbers like "one", "two", etc.
  const durationPatterns = [
    /(\d+)\s*(?:day|days?)/i,  // "1 day", "2 days"
    /(?:one|1)\s*(?:day|days?)/i,  // "one day"
    /(?:two|2)\s*(?:day|days?)/i,  // "two days"
    /(?:three|3)\s*(?:day|days?)/i, // "three days"
    /(?:four|4)\s*(?:day|days?)/i, // "four days"
    /(?:five|5)\s*(?:day|days?)/i, // "five days"
    /(?:six|6)\s*(?:day|days?)/i,  // "six days"
    /(?:seven|7)\s*(?:day|days?)/i, // "seven days"
  ];
  
  let duration = 1; // Default is 1 day to save tokens - only extend if user explicitly requests
  for (const pattern of durationPatterns) {
    const match = searchText.match(pattern);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 
                  pattern.source.includes('one') ? 1 :
                  pattern.source.includes('two') ? 2 :
                  pattern.source.includes('three') ? 3 :
                  pattern.source.includes('four') ? 4 :
                  pattern.source.includes('five') ? 5 :
                  pattern.source.includes('six') ? 6 :
                  pattern.source.includes('seven') ? 7 : 7;
      duration = num;
      break;
    }
  }
  
  // Extract mealsPerDay - look for numbers followed by "meal" or "meals"
  const mealsPatterns = [
    /(\d+)\s*(?:meal|meals?)\s*(?:per\s*day|a\s*day|daily)?/i,  // "4 meals", "4 meals per day"
    /(?:one|1)\s*(?:meal|meals?)/i,  // "one meal"
    /(?:two|2)\s*(?:meal|meals?)/i,  // "two meals"
    /(?:three|3)\s*(?:meal|meals?)/i, // "three meals"
    /(?:four|4)\s*(?:meal|meals?)/i, // "four meals"
    /(?:five|5)\s*(?:meal|meals?)/i, // "five meals"
  ];
  
  let mealsPerDay = 3; // Default (keep at 3)
  for (const pattern of mealsPatterns) {
    const match = searchText.match(pattern);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 
                  pattern.source.includes('one') ? 1 :
                  pattern.source.includes('two') ? 2 :
                  pattern.source.includes('three') ? 3 :
                  pattern.source.includes('four') ? 4 :
                  pattern.source.includes('five') ? 5 : 3;
      mealsPerDay = num;
      break;
    }
  }
  
  return { duration, mealsPerDay };
}

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
  preferencesSummary: z
    .string()
    .optional()
    .describe("A one-sentence summary of the user's dietary preferences for personalized meal planning context."),
});
export type ContextAwareChatInput = z.infer<typeof ContextAwareChatInputSchema>;

const ContextAwareChatOutputSchema = z.object({
  response: z.string().describe("The chatbot response."),
});
export type ContextAwareChatOutput = z.infer<typeof ContextAwareChatOutputSchema>;

// Use a focused context window for better performance and cost efficiency
// Reduced from 5 to 3 messages to significantly reduce token usage
const MAX_CONTEXT_MESSAGES = 3; // Using last 3 messages for context awareness

// Character limits to prevent token overflow
const MAX_CHARS_PER_MESSAGE = 500; // Max chars per history message
const MAX_CHARS_CURRENT_MESSAGE = 700; // Max chars for current user message
const MAX_TOTAL_CONTEXT_CHARS = 2000; // Max total chars for all context (3 messages + current)

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
  prompt: `You are Mealwise, a meal planning and nutrition assistant. Focus on meal plans, recipes, nutrition, and health.

**TOOLS:**
- generate_meal_plan(duration, mealsPerDay) - Generate meal plans. Default: 1 day, 3 meals/day. Use user's numbers if specified.
- save_meal_plan(title, duration, mealsPerDay, days) - Save meal plans

**RULES:**
- For meal plan requests → CALL generate_meal_plan() immediately. Use user's numbers (e.g., "2 days, 4 meals" = duration:2, mealsPerDay:4). Defaults only if no numbers.
- For cooking/nutrition questions → Provide recipes, ingredients, steps, health tips.
- Keep responses concise and focused on meals/nutrition.

{{#if preferencesSummary}}
**PREFERENCES:** {{preferencesSummary}}
{{/if}}

**HISTORY:**
{{#each chatHistory}}{{role}}: {{content}}
{{/each}}

**USER:** {{message}}`,
});

const contextAwareChatFlow = ai.defineFlow(
  {
    name: "contextAwareChatFlow",
    inputSchema: ContextAwareChatInputSchema,
    outputSchema: ContextAwareChatOutputSchema,
  },
      async (input) => {
        const chatHistory = input.chatHistory || [];
        const preferencesSummary = input.preferencesSummary || '';
        
        try {
    
      // Use full history if it's within limit, otherwise use most recent messages
      // This ensures context-awareness while staying within token limits
      const contextHistory = chatHistory.length <= MAX_CONTEXT_MESSAGES
        ? chatHistory // Use full history if within limit
        : chatHistory.slice(-MAX_CONTEXT_MESSAGES); // Use most recent messages if too long

      // Limit individual message content length to prevent token overflow
      const limitedHistory = contextHistory.map(msg => ({
        role: msg.role,
        content: msg.content.length > MAX_CHARS_PER_MESSAGE 
          ? msg.content.substring(0, MAX_CHARS_PER_MESSAGE) + '...' 
          : msg.content,
      }));

      // Limit current message length
      const limitedCurrentMessage = input.message.length > MAX_CHARS_CURRENT_MESSAGE
        ? input.message.substring(0, MAX_CHARS_CURRENT_MESSAGE) + '...'
        : input.message;

      // Calculate total context size
      const totalContextChars = limitedHistory.reduce((sum, m) => sum + m.content.length, 0) 
        + limitedCurrentMessage.length 
        + (preferencesSummary?.length || 0);

      // If total context exceeds limit, intelligently truncate oldest messages first
      let finalHistory = limitedHistory;
      if (totalContextChars > MAX_TOTAL_CONTEXT_CHARS) {
        const excessChars = totalContextChars - MAX_TOTAL_CONTEXT_CHARS;
        // Truncate from oldest messages first, preserving most recent context
        finalHistory = limitedHistory.map((msg, index) => {
          if (index === limitedHistory.length - 1) {
            // Keep the most recent message mostly intact
            return msg;
          }
          // Truncate older messages more aggressively
          const targetLength = Math.max(100, msg.content.length - Math.floor(excessChars / (limitedHistory.length - 1)));
          return {
            ...msg,
            content: msg.content.length > targetLength 
              ? msg.content.substring(0, targetLength) + '...' 
              : msg.content,
          };
        });
      }

      // Preferences summary is only passed on first message (handled in app/actions.ts)
      // So if it's provided here, it means it's a new conversation
      const finalTotalChars = finalHistory.reduce((sum, m) => sum + m.content.length, 0) 
        + limitedCurrentMessage.length 
        + (preferencesSummary?.length || 0);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[contextAwareChatFlow] Processing ${finalHistory.length} messages, ${finalTotalChars} total chars (limit: ${MAX_TOTAL_CONTEXT_CHARS})`);
        if (finalTotalChars > MAX_TOTAL_CONTEXT_CHARS) {
          console.warn(`[contextAwareChatFlow] ⚠️ Context exceeded limit, truncated to ${finalTotalChars} chars`);
        }
        if (preferencesSummary) {
          console.log(`[contextAwareChatFlow] Preferences summary included (new conversation): "${preferencesSummary}"`);
        }
      }

      const result = await prompt({
        message: limitedCurrentMessage,
        chatHistory: finalHistory,
        preferencesSummary: preferencesSummary || undefined, // Only set if provided (new conversation)
      });

      // Extract output and check for tool calls
      const { output } = result;
      const fullResult = result as any;
      
      // Check if tool was actually called
      const hasToolCalls = !!(fullResult?.calls?.length || fullResult?.steps?.length);
      
      // Log tool calls and response for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('[contextAwareChatFlow] Response summary:', {
          hasOutput: !!output,
          responseLength: output?.response?.length || 0,
          responsePreview: output?.response?.substring(0, 150) || 'N/A',
          hasToolCalls,
          toolCallCount: fullResult?.calls?.length || fullResult?.steps?.length || 0,
          fullResultKeys: Object.keys(fullResult || {}),
        });
        
        if (hasToolCalls) {
          console.log('[contextAwareChatFlow] ✅ Tool calls detected:', {
            calls: fullResult?.calls || [],
            steps: fullResult?.steps || [],
          });
        } else {
          // Check if response suggests tool should have been called
          const responseText = output?.response?.toLowerCase() || '';
          const suggestsMealPlan = /generate|creating|planning|meal.*plan|will generate/i.test(responseText);
          // Check for meal plan requests - be more aggressive in detection
          const isMealPlanRequest = /generate|create|plan|need.*meal.*plan|do it|get me|give me.*meal/i.test(input.message) ||
                                   /one day|two day|1 day|2 day|3 day|4 day|5 day|6 day|7 day/i.test(input.message);
          
          // Also check chat history for meal plan context
          const hasMealPlanContext = chatHistory.some(msg => 
            /meal.*plan|generate|create.*plan/i.test(msg.content.toLowerCase())
          );
          
          if ((isMealPlanRequest || hasMealPlanContext) && !hasToolCalls) {
            console.warn('[contextAwareChatFlow] ⚠️ WARNING: User requested meal plan but tool was NOT called!');
            console.warn('[contextAwareChatFlow] Response was:', output?.response);
            console.warn('[contextAwareChatFlow] 🔧 FALLBACK: Manually calling generateMealPlan tool...');
            
            // Fallback: Manually call the tool core function if model didn't
            try {
              // Use chat history to extract params if current message is short
              const params = extractMealPlanParams(input.message, chatHistory);
              const toolResult = await generateMealPlanCore(params);
              
              if (toolResult.success && toolResult.mealPlan) {
                // Return the tool result message which includes UI metadata
                // The UI metadata will be extracted by chat-panel.tsx
                return {
                  response: toolResult.message,
                };
              } else {
                return {
                  response: toolResult.message || 'Failed to generate meal plan. Please try again.',
                };
              }
            } catch (toolError) {
              console.error('[contextAwareChatFlow] Error in fallback tool call:', toolError);
              return {
                response: 'I encountered an error generating your meal plan. Please try again or contact support.',
              };
            }
          }
        }
      }

    // ✅ Defensive fallback to avoid schema errors
    if (!output || typeof output.response !== "string") {
      console.warn(
        "[Mealwise] contextAwareChatPrompt returned invalid output:",
        output
      );
      return {
        response:
            "Sorry, I couldn't generate a response at the moment. Please try again.",
      };
    }

    return output;
    } catch (error) {
      console.error("[contextAwareChatFlow] Error:", error);
      if (process.env.NODE_ENV === 'development') {
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
      }
      
      // Check if this was a meal plan request - if so, try fallback
      const isMealPlanRequest = /generate|create|plan|need.*meal.*plan|do it|get me|give me.*meal/i.test(input.message) ||
                                /one day|two day|1 day|2 day|3 day|4 day|5 day|6 day|7 day/i.test(input.message);
      
      if (isMealPlanRequest) {
        try {
          console.warn('[contextAwareChatFlow] 🔧 Error occurred, trying fallback meal plan generation...');
          // Use chat history to extract params if current message is short
          const params = extractMealPlanParams(input.message, chatHistory);
          const toolResult = await generateMealPlanCore(params);
          
          if (toolResult.success && toolResult.mealPlan) {
            return {
              response: toolResult.message,
            };
          } else {
            return {
              response: toolResult.message || 'Failed to generate meal plan. Please try again.',
            };
          }
        } catch (fallbackError) {
          console.error('[contextAwareChatFlow] Fallback also failed:', fallbackError);
          return {
            response: "I encountered an error generating your meal plan. Please try again with a shorter message or contact support.",
          };
        }
      }
      
      return {
        response: "Sorry, I encountered an error. Please try again with a shorter message.",
      };
    }
  }
);
