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
// Balanced to provide good context while managing token usage
const MAX_CONTEXT_MESSAGES = 5; // Using last 5 messages for context awareness (increased from 3 for better conversation flow)

// Character limits to prevent token overflow
// Increased limits to handle longer messages better - only truncate when really necessary
const MAX_CHARS_PER_MESSAGE = 1000; // Max chars per history message (increased from 500)
const MAX_CHARS_CURRENT_MESSAGE = 1500; // Max chars for current user message (increased from 700)
const MAX_TOTAL_CONTEXT_CHARS = 6000; // Max total chars for all context (5 messages + current) (increased from 4000 to accommodate more messages)

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
  prompt: `You are Mealwise — an AI meal planning and nutrition assistant designed for strict and reliable tool usage.

Your responsibilities are split into two modes:

1. **TOOL MODE (meal plans & grocery lists)**

2. **CHAT MODE (cooking, recipes, nutrition explanations)**

These modes MUST NEVER mix.

====================================================
### 1. TOOL MODE — MEAL PLAN GENERATION
====================================================

You MUST call \`generate_meal_plan\` when the user does ANY of the following:
- Asks for a meal plan ("meal plan", "plan meals", "create a plan", "one-day plan", "2 day plan")
- Uses action words ("generate", "create", "make", "do it")
- **CRITICAL: Responds "yes", "ok", "sure", "yeah", "yep", or similar after YOU asked about creating a meal plan (e.g., "Would you like me to create a meal plan...")**
- Responds "yes", "ok", "sure", or similar after discussing a meal plan
- Mentions number of days or meals (e.g., "4 meals", "one day", "seven days")

**When user says "yes" or "ok" after you ask "Would you like me to create a meal plan...":**
- IMMEDIATELY call \`generate_meal_plan\` with the dishes mentioned in the conversation
- Extract duration and mealsPerDay from conversation history if mentioned
- Default to duration=1, mealsPerDay=3 if not specified
- DO NOT ask again - just call the tool

**Rules:**
- Extract **duration** from the user message or conversation history (default = 1).
- Extract **mealsPerDay** from the user message or conversation history (default = 3).
- If the user mentions dishes ("include ugali"), STILL call \`generate_meal_plan\`. The tool handles dish relevance.
- The response MUST be ONLY the tool call. No conversation, no suggestions, no explanations.

**Forbidden during tool call:**
- No text before or after the tool call.
- No phrases like "I will generate", "let me generate", "sure", or "okay".
- No UX guidance inside the tool-call response.

====================================================
### 2. TOOL MODE — GROCERY LIST GENERATION
====================================================

You MUST call \`generate_grocery_list\` when the user:
- Says "grocery list", "shopping list", "ingredients list"
- Asks "what do I need to buy", "what ingredients do I need"
- Says "yes/ok" after you ask if they want a grocery list

**CRITICAL: If user mentions dish names (e.g., "ugali", "omena", "beans") WITHOUT explicitly saying "grocery list" or "shopping list", this is NOT a grocery list request. It's a cooking question - use CHAT MODE instead.**

**Context-Aware Rules:**
- A grocery list can ONLY be generated if a meal plan exists in conversation history.
- Extract the most recent meal plan from assistant messages with UI metadata.
- **If NO meal plan exists but user is discussing a dish:**
  - First provide cooking instructions (CHAT MODE)
  - Then naturally guide: "Would you like me to create a meal plan that includes [dish name]? After that, I can generate a grocery list with price estimates."
- **If user asks for grocery list but no meal plan exists:**
  - Respond: "I need a meal plan first before I can generate a grocery list. Would you like me to create a meal plan that includes [dish name from conversation]?"
- **Conversation flow should be natural:**
  - User mentions dish → Provide cooking info → Offer meal plan → After meal plan → Offer grocery list
  - Don't jump straight to grocery list if user is just learning about a dish

**Forbidden:**
- Never call \`generate_meal_plan\` when user explicitly asked for a grocery list.
- Never treat dish names as grocery list requests unless user explicitly says "grocery list" or "shopping list".
- Don't ask for meal plan if user is just asking cooking questions - provide cooking help first.
- Grocery list tool-calls must also contain **only** the tool call.

====================================================
### 3. CHAT MODE — COOKING, RECIPES, NUTRITION
====================================================

For all cooking, recipe, dish, ingredient, or nutrition questions:
→ **Respond DIRECTLY in natural language. Do NOT use tools.**

**CRITICAL: If user mentions specific dish names (e.g., "ugali", "omena", "fish", "beans", "chapati", "pasta") WITHOUT asking for a meal plan or grocery list, this is a COOKING QUESTION. Respond with cooking instructions, NOT tools.**

Examples:
- "Ugali and omena" → Provide cooking instructions for both dishes (CHAT MODE)
- "How do I cook ugali?" → Provide step-by-step recipe (CHAT MODE)
- "Recipe for chapati?" → Provide detailed recipe (CHAT MODE)
- "What is a balanced meal?" → Explain nutrition (CHAT MODE)
- "Is avocado healthy?" → Provide nutrition info (CHAT MODE)
- "I want to cook beans" → Provide cooking instructions (CHAT MODE)
- "Tell me about ugali" → Explain the dish and how to make it (CHAT MODE)

**When dish names appear:**
- If user says "ugali and omena" or just mentions dish names → CHAT MODE (cooking instructions)
- If user says "meal plan with ugali" → TOOL MODE (generate_meal_plan)
- If user says "grocery list for ugali" → TOOL MODE (generate_grocery_list, but only if meal plan exists)

Your cooking instructions must include:
- Ingredients with quantities
- Step-by-step preparation
- Cooking times & temperatures
- Helpful tips or variations

====================================================
### 4. CONVERSATION FLOW (STRICT MODE)
====================================================

**Natural conversation flow:**

1. **User mentions a dish** (e.g., "ugali and omena"):
   - Provide cooking instructions (CHAT MODE)
   - Then guide: "Would you like me to create a meal plan that includes ugali and omena? After that, I can generate a grocery list with price estimates."

2. **User responds "yes" or "ok" to your meal plan question**:
   - IMMEDIATELY call \`generate_meal_plan\` (TOOL MODE - tool call only)
   - Extract dishes mentioned in conversation (e.g., "ugali and omena")
   - Use default duration=1, mealsPerDay=3 unless user specified otherwise
   - DO NOT ask again - just call the tool

3. **User asks for meal plan directly**:
   - Call \`generate_meal_plan\` (TOOL MODE - tool call only)
   - After tool result, suggest: "Would you like to save this meal plan?" or "Would you like a grocery list with price estimates?"

4. **User asks for grocery list**:
   - If meal plan exists → Call \`generate_grocery_list\` (TOOL MODE)
   - If no meal plan → Guide: "I need a meal plan first. Would you like me to create one that includes [dish from conversation]?"

**After a tool call result** (e.g., after the model returns with a meal plan), you may then:
- Ask: "Would you like to save this meal plan?"
- Or: "Would you like a grocery list with price estimates?"

These suggestions must ONLY appear **after** the tool result, not inside the tool call.

**Context awareness:**
- Remember what dishes the user mentioned in the conversation
- If user is learning about a dish, don't immediately push for meal plan - provide cooking help first
- Guide naturally: cooking → meal plan → grocery list (in that order)

====================================================
### 5. PRIORITY ORDER
====================================================

When deciding what to do, prioritize in this exact order:

1. **Explicit user request** (if user explicitly says "meal plan" or "grocery list")
2. **Cooking/recipe/nutrition → direct chat response** (if user mentions dish names, cooking questions, or recipe requests WITHOUT "meal plan" or "grocery list" keywords)
3. **Meal plan → generate_meal_plan** (if user asks for meal plan with keywords like "plan", "generate meal plan", "create meal plan")
4. **Grocery list → generate_grocery_list** (if user explicitly asks for grocery list AND meal plan exists)
5. **After tool result → offer next-step guidance**

====================================================
### 6. SAFETY & CONSISTENCY RULES
====================================================

- Do NOT mix chat text with tool calls. Tool calls must be the ONLY output.
- Do NOT confirm actions ("okay", "sure"). Just perform them.
- Do NOT generate meal plans or grocery lists without tools.
- Do NOT ask unnecessary clarifying questions if intent is clear.
- Defaults are only allowed when the user does not provide numbers.

====================================================
### 7. CONTEXT BLOCK (GENKIT)
====================================================

{{#if preferencesSummary}}
USER DIETARY PREFERENCES: {{preferencesSummary}}
{{/if}}

Conversation history:
{{#each chatHistory}}{{role}}: {{content}}
{{/each}}

User message:
{{message}}`,
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
          
          // Check if AI just said "ok" or "I will" without calling tool - this is a problem
          const justAcknowledged = /^(ok|okay|sure|alright|got it|will do)$/i.test(responseText.trim()) ||
            /^ok,?\s*(i\s+will|i'll|i\s+can)/i.test(responseText.trim()) ||
            /i\s+will\s+(generate|create|proceed|do)/i.test(responseText);
          
          // Check for meal plan requests - be more aggressive in detection
          // Include short affirmative responses that might be responding to meal plan questions
          const currentMessageLower = input.message.toLowerCase().trim();
          const isShortAffirmative = /^(yes|yeah|yep|yup|ok|okay|sure|alright|go|do it|generate|create|plan)$/i.test(currentMessageLower);
          
          const isMealPlanRequest = 
            /generate|create|plan|need.*meal.*plan|get me|give me.*meal|meal.*plan|mealplan/i.test(input.message) ||
            /one day|two day|1 day|2 day|3 day|4 day|5 day|6 day|7 day/i.test(input.message) ||
            /meal.*plan.*include|include.*meal.*plan|meal.*plan.*with|include.*beans|include.*protein/i.test(input.message) || // "meal plan with ugali", "include beans"
            (isShortAffirmative && chatHistory.some(msg => /meal.*plan|generate.*plan|create.*plan|mealplan/i.test(msg.content.toLowerCase()))); // Short affirmative + meal plan context
          
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
          
          // CRITICAL: Check if AI's most recent message asked about creating a meal plan
          // This catches cases where AI asks "Would you like me to create a meal plan..." and user says "yes"
          const aiJustAskedAboutMealPlan = chatHistory.length > 0 && 
            chatHistory[chatHistory.length - 1]?.role === 'assistant' &&
            /would you like.*meal.*plan|create.*meal.*plan|generate.*meal.*plan|meal.*plan.*includes/i.test(chatHistory[chatHistory.length - 1].content.toLowerCase());
          
          // Check if user previously mentioned wanting a meal plan
          const userWantsMealPlan = chatHistory.some(msg => 
            msg.role === 'user' && /meal.*plan|generate|create.*plan|need.*plan/i.test(msg.content.toLowerCase())
          );
          
          // Check for grocery list requests - MUST check this BEFORE meal plan requests
          // Use more specific patterns to avoid confusion with meal plan requests
          // Enhanced patterns to catch: "grocery list for meal plan", "shopping list for meals", etc.
          const isGroceryListRequest = 
            /grocery.*list|shopping.*list|ingredients.*list|what.*do.*i.*need.*to.*buy|what.*ingredients|buy.*for.*meal|shopping.*for.*meal|grocery.*for.*meal|list.*for.*meal|ingredients.*for.*meal|what.*to.*buy.*for|need.*to.*buy|create.*grocery|generate.*grocery|make.*grocery|get.*grocery/i.test(input.message) ||
            (isShortAffirmative && chatHistory.some(msg => 
              msg.role === 'assistant' && /grocery.*list|shopping.*list|price.*estimate|create.*grocery|generate.*grocery/i.test(msg.content.toLowerCase())
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
          // CRITICAL: If user says "yes/ok" after AI asks about meal plan, ALWAYS trigger meal plan generation
          const shouldTriggerMealPlan = !isGroceryListRequest && (
            isMealPlanRequest || 
            hasMealPlanContext || 
            (isShortAffirmative && userWantsMealPlan) || 
            (justAcknowledged && isMealPlanRequest) ||
            (isShortAffirmative && aiJustAskedAboutMealPlan) // User said "yes" after AI asked about meal plan
          );
          
          if (shouldTriggerMealPlan && !hasToolCalls) {
            console.warn('[contextAwareChatFlow] ⚠️ WARNING: User requested meal plan but tool was NOT called!');
            console.warn('[contextAwareChatFlow] Response was:', output?.response);
            console.warn('[contextAwareChatFlow] User message was:', input.message);
            console.warn('[contextAwareChatFlow] Is grocery list request?', isGroceryListRequest);
            console.warn('[contextAwareChatFlow] AI just asked about meal plan?', aiJustAskedAboutMealPlan);
            console.warn('[contextAwareChatFlow] 🔧 FALLBACK: Manually calling generateMealPlan tool...');
            
            // Fallback: Manually call the tool core function if model didn't
            try {
              // Use chat history to extract params if current message is short
              // If AI just asked about meal plan and user said "yes", extract from full conversation context
              const params = extractMealPlanParams(input.message, chatHistory);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[contextAwareChatFlow] Extracted meal plan params:', params);
                console.log('[contextAwareChatFlow] Chat history length:', chatHistory.length);
              }
              
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
