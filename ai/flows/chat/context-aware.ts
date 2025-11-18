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
import { generateMealPlan, saveMealPlan, generateMealPlanCore, generateGroceryList, generateGroceryListCore } from "./dynamic-select-tools";

// Helper to extract duration and mealsPerDay from user message or chat history
// Prioritizes explicit user requests over defaults
function extractMealPlanParams(message: string, chatHistory?: Array<{ role: string; content: string }>): { duration: number; mealsPerDay: number } {
  // If message is short (like "do it", "yes", "ok"), check chat history for parameters
  const isShortMessage = message.trim().length < 20 && /^(do it|yes|yeah|yep|yup|ok|okay|sure|alright|go|generate|create|plan)$/i.test(message.trim());
  
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
// Increased limits to handle longer messages better - only truncate when really necessary
const MAX_CHARS_PER_MESSAGE = 1000; // Max chars per history message (increased from 500)
const MAX_CHARS_CURRENT_MESSAGE = 1500; // Max chars for current user message (increased from 700)
const MAX_TOTAL_CONTEXT_CHARS = 4000; // Max total chars for all context (3 messages + current) (increased from 2000)

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
  tools: [generateMealPlan, saveMealPlan, generateGroceryList],
  prompt: `You are Mealwise, a meal planning and nutrition assistant. You help with:
1. **Meal Planning** - Generate personalized meal plans (use tools)
2. **Cooking & Recipes** - Provide detailed cooking instructions, recipes, and cooking advice (respond directly)
3. **Nutrition & Health** - Answer questions about ingredients, nutrition, dietary advice
4. **Grocery Lists** - Generate shopping lists with price estimates (use tools)

**CRITICAL: YOU MUST USE TOOLS FOR MEAL PLANS - BUT PROVIDE DIRECT ANSWERS FOR COOKING QUESTIONS**

**TOOLS:**
1. generate_meal_plan(duration, mealsPerDay) - Generates meal plans. Default: duration=1, mealsPerDay=3. Use user's numbers if specified.
2. save_meal_plan(title, duration, mealsPerDay, days) - Saves meal plans
3. generate_grocery_list(mealPlan) - Generates a grocery list with price estimates for a meal plan. Requires meal plan data from conversation.

**CRITICAL: USER REQUESTS ALWAYS OVERRIDE DEFAULTS - YOU MUST CALL THE TOOL, NOT JUST SAY YOU WILL**

**MEAL PLAN GENERATION:**
- When user says "generate/create/plan meals", "meal plan", "one day meal plan", "include [dish]", mentions days/meals, OR responds "yes"/"ok"/"do it" to meal plan questions → YOU MUST IMMEDIATELY CALL generate_meal_plan() function.
- **CRITICAL: Even if user mentions specific dishes (e.g., "include ugali and fish"), you MUST STILL CALL generate_meal_plan() - the tool will generate a meal plan that can include those dishes.**
- **NEVER say "I will generate", "I can generate", "ok", or "sure" without calling the function - YOU MUST ACTUALLY CALL THE FUNCTION RIGHT NOW.**
- Extract duration from user message or chat history (e.g., "1 day" = duration: 1, "2 days" = duration: 2, "one day" = duration: 1). If user specifies a number, USE THAT NUMBER.
- Extract mealsPerDay from user message or chat history (e.g., "4 meals" = mealsPerDay: 4, "four meals" = mealsPerDay: 4). If user specifies a number, USE THAT NUMBER.
- **ONLY use defaults (1 day, 3 meals/day) if user does NOT specify any numbers.**
- Examples:
  - User says "one day meal plan" → IMMEDIATELY CALL generate_meal_plan({duration: 1, mealsPerDay: 3})
  - User says "generate a meal plan with ugali and fish" → IMMEDIATELY CALL generate_meal_plan({duration: 1, mealsPerDay: 3}) - the tool will include those dishes
  - User says "one day meal plan with 4 meals" → IMMEDIATELY CALL generate_meal_plan({duration: 1, mealsPerDay: 4})
  - User says "yes" or "ok" or "do it" (after mentioning meal plan) → CALL generate_meal_plan() with parameters from conversation history
  - User says "get me a 2 day plan" → IMMEDIATELY CALL generate_meal_plan({duration: 2, mealsPerDay: 3})
  - User says "I need a meal plan" (no numbers) → IMMEDIATELY CALL generate_meal_plan({duration: 1, mealsPerDay: 3})
- **FORBIDDEN RESPONSES:** "I will generate", "I can generate", "Let me generate", "ok" (without calling tool), "sure" (without calling tool) - THESE ARE WRONG. CALL THE FUNCTION INSTEAD.
- After generating a meal plan, inform the user they can save it and naturally suggest: "Would you like me to create a grocery list with price estimates for this meal plan?"

**GROCERY LIST GENERATION:**
- When user asks for "grocery list", "shopping list", "ingredients list", "what do I need to buy", or "what ingredients" → CALL generate_grocery_list() immediately.
- **CRITICAL: Do NOT call generate_meal_plan() when user asks for a grocery list - they want a shopping list, not a new meal plan.**
- Extract meal plan data from the conversation history (look for recently generated meal plan in assistant messages).
- If a meal plan was just generated in this conversation, use that meal plan data for the grocery list.
- Examples:
  - User says "create a grocery list" or "what do I need to buy" → CALL generate_grocery_list() with meal plan from conversation (NOT generate_meal_plan)
  - User says "yes" to grocery list suggestion → CALL generate_grocery_list() with meal plan from conversation (NOT generate_meal_plan)
  - User says "shopping list" or "ingredients" → CALL generate_grocery_list() with meal plan from conversation (NOT generate_meal_plan)
- The grocery list will include price estimates and local store suggestions based on user's location.

**COOKING/NUTRITION QUESTIONS:**
- When users ask about specific dishes, recipes, ingredients, or cooking methods → **PROVIDE DETAILED COOKING INSTRUCTIONS DIRECTLY** (do NOT say you only do meal planning).
- Examples of questions you MUST answer:
  - "how to cook ugali and fish" → Provide step-by-step recipe for both dishes
  - "recipe for pasta" → Provide detailed pasta recipe
  - "what is ugali" → Explain what ugali is and how to make it
  - "how to prepare [dish]" → Provide cooking instructions
  - Any cooking, recipe, or ingredient question → Answer directly with helpful details
- Include: ingredients, measurements, step-by-step instructions, cooking times, temperatures, tips, cultural context.
- Answer questions about: traditional dishes, cooking techniques, ingredient substitutions, nutrition facts, meal preparation.
- **NEVER refuse cooking questions** - providing cooking help is a core function, not optional.

{{#if preferencesSummary}}
**USER PREFERENCES:** {{preferencesSummary}}
{{/if}}

**CONVERSATION:**
{{#each chatHistory}}{{role}}: {{content}}
{{/each}}

**USER:** {{message}}

**REMEMBER:**
- User's explicit requests (like "1 day", "4 meals") ALWAYS override defaults
- If user says "one day meal plan with 4 meals" → duration=1, mealsPerDay=4
- If user says "one day meal plan include ugali and fish" → CALL generate_meal_plan({duration: 1, mealsPerDay: 3}) - tool handles dishes
- If user says "I need a meal plan" (no numbers) → duration=1, mealsPerDay=3
- If user says "yes", "ok", "do it" after meal plan discussion → CALL generate_meal_plan() with params from history (NEVER just say "ok")
- After generating a meal plan, naturally guide conversation: "Would you like me to create a grocery list with price estimates?"
- When user asks for grocery list → Extract meal plan from conversation history and CALL generate_grocery_list()
- Preferences are for dietary restrictions/goals, NOT for duration/mealsPerDay
- **NEVER respond with just "ok" or "sure" when user requests meal plan - YOU MUST CALL THE TOOL**

**CONVERSATION FLOW:**
1. User requests meal plan → CALL generate_meal_plan()
2. After meal plan generated → Suggest grocery list: "Would you like me to create a grocery list with price estimates?"
3. User requests grocery list → CALL generate_grocery_list() with meal plan from conversation

**IMPORTANT:**
- If user asks about cooking, recipes, or specific dishes → Provide detailed cooking help (this is a core function, not optional).
- If user wants a meal plan → CALL generate_meal_plan() immediately.
- If user wants a grocery list → CALL generate_grocery_list() with meal plan from conversation (NOT generate_meal_plan).
- **CRITICAL: Grocery list requests are DIFFERENT from meal plan requests - do NOT confuse them.**
- You are a meal and nutrition assistant - cooking questions are just as important as meal planning.`,
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
          
          // Extract UI metadata from tool call results if present
          // When tools are called, the result might contain UI_METADATA that needs to be preserved
          if (output && output.response) {
            const toolResults = fullResult?.calls || fullResult?.steps || [];
            for (const toolCall of toolResults) {
              // Check different possible structures for tool result
              const toolResult = toolCall?.result || toolCall?.output || toolCall;
              
              // Check if result has a message property
              if (toolResult?.message && typeof toolResult.message === 'string') {
                const toolMessage = toolResult.message;
                const uiMetadataMatch = toolMessage.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);
                if (uiMetadataMatch) {
                  // If tool result has UI_METADATA, ensure it's in the final response
                  if (!output.response.includes('[UI_METADATA:')) {
                    // Append UI_METADATA to response if not already present
                    output.response = output.response + ' ' + uiMetadataMatch[0];
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[contextAwareChatFlow] ✅ Preserved UI_METADATA from tool result');
                    }
                  }
                }
              }
              
              // Also check if the result itself is a string with UI_METADATA
              if (typeof toolResult === 'string') {
                const uiMetadataMatch = toolResult.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);
                if (uiMetadataMatch && !output.response.includes('[UI_METADATA:')) {
                  output.response = output.response + ' ' + uiMetadataMatch[0];
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[contextAwareChatFlow] ✅ Preserved UI_METADATA from tool result (string)');
                  }
                }
              }
            }
            
            // Log tool results structure for debugging
            if (process.env.NODE_ENV === 'development' && toolResults.length > 0) {
              console.log('[contextAwareChatFlow] Tool results structure:', JSON.stringify(toolResults, null, 2));
            }
          }
        } else {
          // Check if response suggests tool should have been called
          const responseText = output?.response?.toLowerCase() || '';
          const suggestsMealPlan = /generate|creating|planning|meal.*plan|will generate/i.test(responseText);
          
          // Check if AI just said "ok" or "sure" without calling tool - this is a problem
          const justAcknowledged = /^(ok|okay|sure|alright|got it|will do)$/i.test(responseText.trim());
          
          // Check for meal plan requests - be more aggressive in detection
          // Include short affirmative responses that might be responding to meal plan questions
          const currentMessageLower = input.message.toLowerCase().trim();
          const isShortAffirmative = /^(yes|yeah|yep|yup|ok|okay|sure|alright|go|do it|generate|create|plan)$/i.test(currentMessageLower);
          
          const isMealPlanRequest = 
            /generate|create|plan|need.*meal.*plan|get me|give me.*meal|meal.*plan/i.test(input.message) ||
            /one day|two day|1 day|2 day|3 day|4 day|5 day|6 day|7 day/i.test(input.message) ||
            /meal.*plan.*include|include.*meal.*plan|meal.*plan.*with/i.test(input.message) || // "meal plan with ugali"
            (isShortAffirmative && chatHistory.some(msg => /meal.*plan|generate.*plan|create.*plan/i.test(msg.content.toLowerCase()))); // Short affirmative + meal plan context
          
          // If AI just said "ok" and user requested meal plan, definitely trigger fallback
          if (justAcknowledged && isMealPlanRequest) {
            console.warn('[contextAwareChatFlow] ⚠️ AI just acknowledged without calling tool!');
          }
          
          // Also check chat history for meal plan context
          // Check if assistant recently asked about generating a meal plan
          const hasMealPlanContext = chatHistory.some(msg => {
            const content = msg.content.toLowerCase();
            return /meal.*plan|generate.*meal|create.*meal|plan.*meal|would you like.*meal/i.test(content);
          });
          
          // Check if user previously mentioned wanting a meal plan
          const userWantsMealPlan = chatHistory.some(msg => 
            msg.role === 'user' && /meal.*plan|generate|create.*plan|need.*plan/i.test(msg.content.toLowerCase())
          );
          
          // Check for grocery list requests - MUST check this BEFORE meal plan requests
          // Use more specific patterns to avoid confusion with meal plan requests
          const isGroceryListRequest = 
            /grocery.*list|shopping.*list|ingredients.*list|what.*do.*i.*need.*to.*buy|what.*ingredients|buy.*for.*meal.*plan|shopping.*for.*meal/i.test(input.message) ||
            (isShortAffirmative && chatHistory.some(msg => 
              msg.role === 'assistant' && /grocery.*list|shopping.*list|price.*estimate|create.*grocery/i.test(msg.content.toLowerCase())
            ));
          
          // Check if there's a meal plan in the conversation history (for grocery list generation)
          const hasMealPlanInHistory = chatHistory.some(msg => {
            if (msg.role === 'assistant') {
              // Check if message contains UI_METADATA with meal plan
              return /\[UI_METADATA:.*mealPlan|meal.*plan.*generated|generated.*meal.*plan/i.test(msg.content);
            }
            return false;
          });
          
          // CRITICAL: Handle grocery list requests FIRST, before meal plan fallback
          // This prevents grocery list requests from triggering meal plan generation
          if (isGroceryListRequest && !hasToolCalls) {
            console.warn('[contextAwareChatFlow] ⚠️ WARNING: User requested grocery list but tool was NOT called!');
            console.warn('[contextAwareChatFlow] 🔧 FALLBACK: Attempting to extract meal plan from conversation...');
            
            // Try to extract meal plan from conversation history
            // Look for the most recent meal plan in assistant messages
            let mealPlanData = null;
            for (let i = chatHistory.length - 1; i >= 0; i--) {
              const msg = chatHistory[i];
              if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
                try {
                  const match = msg.content.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);
                  if (match) {
                    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
                    const uiMetadata = JSON.parse(decoded);
                    if (uiMetadata.mealPlan) {
                      mealPlanData = uiMetadata.mealPlan;
                      break;
                    }
                  }
                } catch (e) {
                  // Continue searching
                }
              }
            }
            
            if (mealPlanData) {
              try {
                const toolResult = await generateGroceryListCore({ mealPlan: mealPlanData });
                
                if (toolResult.success && toolResult.groceryList) {
                  return {
                    response: toolResult.message,
                  };
                } else {
                  return {
                    response: toolResult.message || 'Failed to generate grocery list. Please try again.',
                  };
                }
              } catch (toolError) {
                console.error('[contextAwareChatFlow] Error in fallback grocery list call:', toolError);
                return {
                  response: 'I encountered an error generating your grocery list. Please try again or contact support.',
                };
              }
            } else {
              return {
                response: 'I need a meal plan to generate a grocery list. Please generate a meal plan first, then I can create a shopping list with price estimates.',
              };
            }
          }
          
          // Only trigger meal plan fallback if it's NOT a grocery list request
          // This prevents grocery list requests from incorrectly triggering meal plan generation
          if (!isGroceryListRequest && (isMealPlanRequest || hasMealPlanContext || (isShortAffirmative && userWantsMealPlan) || (justAcknowledged && isMealPlanRequest)) && !hasToolCalls) {
            console.warn('[contextAwareChatFlow] ⚠️ WARNING: User requested meal plan but tool was NOT called!');
            console.warn('[contextAwareChatFlow] Response was:', output?.response);
            console.warn('[contextAwareChatFlow] User message was:', input.message);
            console.warn('[contextAwareChatFlow] Is grocery list request?', isGroceryListRequest);
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

    // Final check: If we had tool calls but UI_METADATA is missing from response,
    // try to extract it from tool results one more time
    const hasToolCallsFinal = !!(fullResult?.calls?.length || fullResult?.steps?.length);
    if (hasToolCallsFinal && !output.response.includes('[UI_METADATA:')) {
      const toolResults = fullResult?.calls || fullResult?.steps || [];
      for (const toolCall of toolResults) {
        // Try multiple possible structures
        const possibleResults = [
          toolCall?.result,
          toolCall?.output,
          toolCall?.response,
          toolCall,
        ].filter(Boolean);
        
        for (const toolResult of possibleResults) {
          let searchText = '';
          if (typeof toolResult === 'string') {
            searchText = toolResult;
          } else if (toolResult?.message && typeof toolResult.message === 'string') {
            searchText = toolResult.message;
          } else if (toolResult?.content && typeof toolResult.content === 'string') {
            searchText = toolResult.content;
          }
          
          if (searchText) {
            const uiMetadataMatch = searchText.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);
            if (uiMetadataMatch) {
              output.response = output.response + ' ' + uiMetadataMatch[0];
              if (process.env.NODE_ENV === 'development') {
                console.log('[contextAwareChatFlow] ✅ Restored UI_METADATA from tool result');
              }
              break;
            }
          }
        }
      }
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
      const currentMessageLower = input.message.toLowerCase().trim();
      const isShortAffirmative = /^(yes|yeah|yep|yup|ok|okay|sure|alright|go|do it|generate|create|plan)$/i.test(currentMessageLower);
      
      const isMealPlanRequest = 
        /generate|create|plan|need.*meal.*plan|get me|give me.*meal/i.test(input.message) ||
        /one day|two day|1 day|2 day|3 day|4 day|5 day|6 day|7 day/i.test(input.message) ||
        (isShortAffirmative && chatHistory.length > 0); // Short affirmative + history = likely meal plan response
      
      // Also check if there's meal plan context in history
      const hasMealPlanContext = chatHistory.some(msg => {
        const content = msg.content.toLowerCase();
        return /meal.*plan|generate.*meal|create.*meal|plan.*meal|would you like.*meal/i.test(content);
      });
      
      if (isMealPlanRequest || hasMealPlanContext) {
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
