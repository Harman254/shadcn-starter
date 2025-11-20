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
import { ReliableToolCaller, ConversationFlowManager } from '@/lib/orchestration/reliable-tool-caller';

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
  prompt: `You are Mealwise — an AI meal planning and nutrition assistant.

**CRITICAL RULE: When user asks for a meal plan or grocery list, you MUST call the tool IMMEDIATELY. Do NOT say "Okay, I will" or "I will create". Do NOT acknowledge. Just call the tool. The tool call is your ONLY response.**

Your responsibilities are split into two modes:

1. **TOOL MODE (meal plans & grocery lists) — CALL TOOLS, NO TEXT**

2. **CHAT MODE (cooking, recipes, nutrition) — TEXT RESPONSES ONLY**

These modes MUST NEVER mix.

====================================================
### 1. TOOL MODE — MEAL PLAN GENERATION
====================================================

**IMPORTANT: Only call this if the user does NOT mention "grocery list" or "shopping list".**

You MUST call \`generate_meal_plan\` when the user does ANY of the following:
- Asks for a meal plan ("meal plan", "plan meals", "create a plan", "one-day plan", "2 day plan") **WITHOUT mentioning "grocery list" or "shopping list"**
- Uses action words ("generate", "create", "make", "do it") **WITHOUT mentioning "grocery list" or "shopping list"**
- **CRITICAL: Responds "yes", "ok", "sure", "yeah", "yep", or similar after YOU asked about creating a meal plan (e.g., "Would you like me to create a meal plan...")** - but ONLY if your question was about meal plans, not grocery lists
- Responds "yes", "ok", "sure", or similar after discussing a meal plan (not grocery list)
- Mentions number of days or meals (e.g., "4 meals", "one day", "seven days") **WITHOUT mentioning "grocery list" or "shopping list"**

**CRITICAL: If user message contains "grocery list" or "shopping list", DO NOT call this tool. Call \`generate_grocery_list\` instead.**

**When user says "yes", "ok", "do it", "go", or similar after you ask about creating a meal plan:**
- IMMEDIATELY call \`generate_meal_plan\` — NO TEXT BEFORE THE TOOL CALL
- Extract duration and mealsPerDay from conversation history if mentioned
- Default to duration=1, mealsPerDay=3 if not specified
- DO NOT say "Okay, I will" — just call the tool immediately
- The tool call is your ONLY response

**Rules:**
- Extract **duration** from the user message or conversation history (default = 1).
- Extract **mealsPerDay** from the user message or conversation history (default = 3).
- **CRITICAL: Extract conversation context** from the last 3-5 messages and pass it as conversationContext parameter. Include:
  - Mentioned foods (e.g., "toast with avocado", "ginger tea")
  - Health conditions (e.g., "hangover", "light and easy to digest")
  - Dietary needs or restrictions mentioned in chat
  - Specific preferences or requirements
  - Example: If user said "I have a hangover, need something light", pass: "User has hangover, needs light and easy to digest foods. Mentioned toast with avocado and ginger tea."
- If the user mentions dishes ("include ugali"), STILL call \`generate_meal_plan\`. The tool handles dish relevance.
- The response MUST be ONLY the tool call. No conversation, no suggestions, no explanations.

**ABSOLUTELY FORBIDDEN during tool call:**
- NO text before the tool call. NO "Okay", NO "I will", NO "Sure", NO "Let me".
- NO text after the tool call.
- NO phrases like "I will generate", "let me generate", "sure", "okay", "I'll create", "I'll generate".
- NO acknowledgments. NO confirmations. Just the tool call.
- If you say ANYTHING before calling the tool, you are WRONG. The tool call must be the FIRST and ONLY thing.

====================================================
### 2. TOOL MODE — GROCERY LIST GENERATION (HIGHEST PRIORITY)
====================================================

**ABSOLUTE PRIORITY: Grocery list requests take precedence over EVERYTHING else.**

**MANDATORY: You MUST call \`generate_grocery_list\` IMMEDIATELY (NO TEXT, JUST THE TOOL CALL) when the user says ANY of the following:**

1. **Direct mentions:**
   - "grocery list", "shopping list", "ingredients list"
   - "create a grocery list", "generate grocery list", "make a grocery list", "get grocery list"
   - "can i get the grocery list", "i want a grocery list", "i need a grocery list"

2. **With meal plan context:**
   - "grocery list for this meal plan"
   - "grocery list for meal plan"
   - "grocery list for it"
   - "grocery list for this"
   - "grocery list for that"
   - "create a grocery list for this mealplan"
   - "create a grocery list for this meal plan"
   - "grocery list for my meal plan"
   - "shopping list for the meal plan"

3. **Shopping/buying questions:**
   - "what do I need to buy"
   - "what ingredients do I need"
   - "what should I buy"
   - "what to buy for this meal plan"

4. **Button clicks or actions:**
   - "grocery list" button clicked
   - "Create a grocery list for this meal plan" (from button)

5. **Affirmatives after grocery list question:**
   - "yes" or "ok" after you ask if they want a grocery list

6. **ANY mention of "grocery list" or "shopping list" when a meal plan exists in the conversation**

**CRITICAL RULES FOR GROCERY LIST REQUESTS:**

1. **IMMEDIATE TOOL CALL - NO EXCEPTIONS:**
   - When you detect ANY grocery list request, you MUST call \`generate_grocery_list\` IMMEDIATELY
   - DO NOT respond with text first
   - DO NOT say "I will create" or "Let me generate"
   - DO NOT acknowledge the request
   - The tool call is your ONLY response - NO TEXT BEFORE OR AFTER

2. **Tool call format:**
   - Call \`generate_grocery_list\` with: \`{ mealPlan: {} }\`
   - The system will automatically extract the meal plan from conversation history
   - You do NOT need to pass the meal plan data - just call the tool

3. **Detection priority:**
   - If the message contains "grocery list" or "shopping list" in ANY form, it's a grocery list request
   - Even if the message also mentions "meal plan", it's STILL a grocery list request
   - Example: "create a grocery list for this meal plan" = GROCERY LIST REQUEST, NOT meal plan request

**CRITICAL PRIORITY RULES (MUST FOLLOW):**
1. **If the user message contains "grocery list" or "shopping list" in ANY form, you MUST call \`generate_grocery_list\`, NOT \`generate_meal_plan\`.**
2. If the user message contains BOTH "grocery list" AND "meal plan" (e.g., "Create a grocery list for this meal plan"), this is ALWAYS a grocery list request, NOT a meal plan request.
3. The phrase "grocery list for meal plan" means: "generate a grocery list FROM the existing meal plan", not "generate a new meal plan".
4. **NEVER call \`generate_meal_plan\` when user explicitly mentions "grocery list" or "shopping list" in their message.**
5. **Even if you see "meal plan" in the message, if it also contains "grocery list", it's a grocery list request.**

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

2. **User responds "yes", "ok", "do it", or similar to your meal plan question**:
   - IMMEDIATELY call \`generate_meal_plan\` — NO TEXT, JUST THE TOOL CALL
   - Extract dishes mentioned in conversation (e.g., "ugali and omena")
   - Use default duration=1, mealsPerDay=3 unless user specified otherwise
   - DO NOT say "Okay, I will" — the tool call IS your response

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
    ### 5. PRIORITY ORDER (CRITICAL - FOLLOW EXACTLY)
    ====================================================

    When deciding what to do, prioritize in this EXACT order:

    1. **GROCERY LIST REQUESTS (HIGHEST PRIORITY)** - If user says "grocery list", "shopping list", "create grocery list", "grocery list for meal plan", or ANY variation → IMMEDIATELY call \`generate_grocery_list\`. NEVER call \`generate_meal_plan\` for grocery list requests.
    
    2. **Explicit meal plan request** (if user explicitly says "meal plan", "generate meal plan", "create meal plan" WITHOUT mentioning "grocery list") → call \`generate_meal_plan\`
    
    3. **Cooking/recipe/nutrition → direct chat response** (if user mentions dish names, cooking questions, or recipe requests WITHOUT "meal plan" or "grocery list" keywords)
    
    4. **After tool result → offer next-step guidance**

    **CRITICAL RULE:** If the user message contains "grocery list" or "shopping list" in ANY form, you MUST call \`generate_grocery_list\`, NOT \`generate_meal_plan\`. Even if the message also contains "meal plan" (e.g., "grocery list for meal plan"), it's still a grocery list request.

====================================================
### 6. SAFETY & CONSISTENCY RULES (CRITICAL)
====================================================

- **NEVER say "I will", "Okay, I will", "I'll create", "Let me generate" — just call the tool immediately.**
- Tool calls must be the ONLY output — NO text before or after.
- Do NOT confirm actions ("okay", "sure", "alright") — just call the tool.
- Do NOT generate meal plans or grocery lists without tools.
- Do NOT ask unnecessary clarifying questions if intent is clear.
- If user says "do it", "yes", "ok", "go" after you ask about a meal plan → call the tool IMMEDIATELY with NO text.
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
    // PRE-FLIGHT: Deterministic tool call detection (runs before AI processes)
    // This ensures reliable tool calling like Perplexity AI
    const toolDecision = ReliableToolCaller.detectToolCall(
      input.message,
      input.chatHistory || [],
      {
        conversationHistory: input.chatHistory || [],
        userPreferences: undefined,
      }
    );

    // Log tool decision for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[contextAwareChatFlow] 🔍 Pre-flight tool call decision:', {
        shouldCallTool: toolDecision.shouldCallTool,
        toolName: toolDecision.toolName,
        confidence: toolDecision.confidence,
        reason: toolDecision.reason,
      });
    }

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
          
          // Extract recent chat messages for meal plan generation (last 5 messages)
          // This ensures meal plans prioritize what user actually wants
          const recentChatMessages = finalHistory.slice(-5).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content.substring(0, 500), // Limit each message to 500 chars
          }));

      // Extract output and check for tool calls
      const { output } = result;
      const fullResult = result as any;
      
      // Check if tool was actually called
      const hasToolCalls = !!(fullResult?.calls?.length || fullResult?.steps?.length);
      
      // Check which tool was called
      let calledToolName = null;
      if (hasToolCalls) {
        const toolCalls = fullResult?.calls || fullResult?.steps || [];
        if (toolCalls.length > 0) {
          calledToolName = toolCalls[0]?.name || toolCalls[0]?.tool || null;
          if (process.env.NODE_ENV === 'development') {
            console.log('[contextAwareChatFlow] 🔧 Tool called:', calledToolName);
          }
        }
      }
      
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
          // RELIABLE TOOL CALLING: If pre-flight detection says we should call a tool,
          // but AI didn't call it, force the tool call for reliability (like Perplexity AI)
          if (toolDecision.shouldCallTool && toolDecision.confidence === 'high' && !hasToolCalls) {
            console.log('[contextAwareChatFlow] ⚡ FORCING TOOL CALL: Pre-flight detection requires tool but AI did not call it');
            console.log('[contextAwareChatFlow] 🔧 Tool:', toolDecision.toolName, 'Confidence:', toolDecision.confidence);
            
            // Force tool call based on pre-flight detection
            if (toolDecision.toolName === 'generate_grocery_list') {
              // Extract meal plan and call tool directly
              const extractMealPlanFromHistory = (): any => {
                for (let i = (input.chatHistory || []).length - 1; i >= 0; i--) {
                  const msg = (input.chatHistory || [])[i];
                  if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
                    try {
                      const matches = msg.content.matchAll(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/g);
                      for (const match of matches) {
                        try {
                          const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
                          const uiMetadata = JSON.parse(decoded);
                          if (uiMetadata.mealPlan && uiMetadata.mealPlan.days && Array.isArray(uiMetadata.mealPlan.days) && uiMetadata.mealPlan.days.length > 0) {
                            return uiMetadata.mealPlan;
                          }
                        } catch (e) {
                          continue;
                        }
                      }
                    } catch (e) {
                      continue;
                    }
                  }
                }
                return null;
              };

              const mealPlanData = extractMealPlanFromHistory();
              if (mealPlanData) {
                try {
                  const toolResult = await generateGroceryListCore({ mealPlan: mealPlanData });
                  if (toolResult.success && toolResult.groceryList) {
                    console.log('[contextAwareChatFlow] ✅ Forced grocery list tool call succeeded');
                    return { response: toolResult.message };
                  } else {
                    console.warn('[contextAwareChatFlow] ⚠️ Forced grocery list tool call returned failure');
                  }
                } catch (error) {
                  console.error('[contextAwareChatFlow] ❌ Forced tool call failed:', error);
                  // Fall through to natural response
                }
              } else {
                console.warn('[contextAwareChatFlow] ⚠️ Cannot force grocery list - no meal plan found');
              }
            }
            // For meal plan, the prompt should handle it, but we've logged the decision
          }

          // Check if response suggests tool should have been called
          const responseText = output?.response?.toLowerCase() || '';
          const suggestsMealPlan = /generate|creating|planning|meal.*plan|will generate/i.test(responseText);
          
          // Check if AI just said "ok" or "I will" without calling tool - this is a problem
          const justAcknowledged = /^(ok|okay|sure|alright|got it|will do)$/i.test(responseText.trim()) ||
            /^ok,?\s*(i\s+will|i'll|i\s+can)/i.test(responseText.trim()) ||
            /i\s+will\s+(generate|create|proceed|do)/i.test(responseText) ||
            /okay,?\s*i\s+will/i.test(responseText) ||
            /i\s+will\s+create/i.test(responseText) ||
            /okay.*create.*meal.*plan/i.test(responseText);
          
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
          // CRITICAL: "grocery list for meal plan" = grocery list request, NOT meal plan request
          // Enhanced patterns to catch: "grocery list for meal plan", "shopping list for meals", etc.
          const messageLower = input.message.toLowerCase().trim();
          
          // Comprehensive grocery list detection patterns
          const isGroceryListRequest = 
            // Direct grocery list mentions (highest priority)
            /grocery.*list|shopping.*list|ingredients.*list/i.test(messageLower) ||
            // Action verbs + grocery list
            /^(create|generate|make|get|show|give|can.*i.*get|i.*want|i.*need|i.*would.*like).*grocery.*list/i.test(messageLower) ||
            // Grocery list for meal plan variations
            /grocery.*list.*for.*(this|that|the|it|meal|plan|mealplan|my|your)/i.test(messageLower) ||
            /(create|generate|make|get).*grocery.*list.*for.*(this|that|the|it|meal|plan|mealplan)/i.test(messageLower) ||
            // List for meal plan (when "list" is mentioned)
            /(create|generate|make|get|show|give).*list.*for.*(this|that|the|it|meal|plan|mealplan)/i.test(messageLower) ||
            // Shopping/buying related
            /what.*do.*i.*need.*to.*buy|what.*ingredients|buy.*for.*meal|shopping.*for.*meal|grocery.*for.*meal|ingredients.*for.*meal|what.*to.*buy.*for|need.*to.*buy|what.*should.*i.*buy/i.test(messageLower) ||
            // Button clicks or quick actions
            /grocery.*list.*button|create.*grocery.*list.*button|get.*shopping.*list/i.test(messageLower) ||
            // Short affirmatives after grocery list question
            (isShortAffirmative && chatHistory.some(msg => 
              msg.role === 'assistant' && /grocery.*list|shopping.*list|price.*estimate|create.*grocery|generate.*grocery|would.*you.*like.*grocery/i.test(msg.content.toLowerCase())
            ));
          
          // Log for debugging
          if (process.env.NODE_ENV === 'development' && isGroceryListRequest) {
            console.log('[contextAwareChatFlow] ✅ GROCERY LIST REQUEST DETECTED:', input.message);
          }
          
          // Check if there's a meal plan in the conversation history (for grocery list generation)
          // This is a quick check - actual extraction happens in extractMealPlanFromHistory()
          const hasMealPlanInHistory = chatHistory.some(msg => {
            if (msg.role === 'assistant') {
              // Check if message contains UI_METADATA with meal plan
              return /\[UI_METADATA:.*mealPlan|meal.*plan.*generated|generated.*meal.*plan/i.test(msg.content);
            }
            return false;
          });
          
          // Log meal plan detection for debugging
          if (process.env.NODE_ENV === 'development' && isGroceryListRequest) {
            console.log('[contextAwareChatFlow] 🔍 Checking for meal plan in history:', {
              hasMealPlanInHistory,
              chatHistoryLength: chatHistory.length,
              recentMessages: chatHistory.slice(-3).map(m => ({ role: m.role, hasUIMetadata: m.content.includes('[UI_METADATA:') })),
            });
          }
          
          // CRITICAL: Handle grocery list requests FIRST, before meal plan fallback
          // This prevents grocery list requests from triggering meal plan generation
          // Also check if wrong tool was called (meal plan instead of grocery list)
          const wrongToolCalled = hasToolCalls && calledToolName === 'generate_meal_plan' && isGroceryListRequest;
          
          // Helper function to extract meal plan from conversation history
          // This function searches through all assistant messages to find meal plans
          const extractMealPlanFromHistory = (): any => {
            console.log('[contextAwareChatFlow] 🔍 Starting meal plan extraction from conversation history...');
            console.log('[contextAwareChatFlow] 📊 Chat history length:', chatHistory.length);
            
            // Look for the most recent meal plan in assistant messages
            // Search in reverse order (most recent first) to get the latest meal plan
            for (let i = chatHistory.length - 1; i >= 0; i--) {
              const msg = chatHistory[i];
              
              // Check if message is from assistant and contains UI metadata
              if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
                console.log(`[contextAwareChatFlow] 🔎 Checking message ${i} for meal plan...`);
                
                try {
                  // Find all UI_METADATA matches in the message (there might be multiple)
                  const matches = Array.from(msg.content.matchAll(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/g));
                  console.log(`[contextAwareChatFlow] 📦 Found ${matches.length} UI_METADATA tag(s) in message ${i}`);
                  
                  for (const match of matches) {
                    try {
                      const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
                      const uiMetadata = JSON.parse(decoded);
                      
                      console.log(`[contextAwareChatFlow] 🔓 Decoded UI metadata, keys:`, Object.keys(uiMetadata));
                      
                      if (uiMetadata.mealPlan) {
                        // Validate meal plan structure before returning
                        const mealPlan = uiMetadata.mealPlan;
                        
                        console.log('[contextAwareChatFlow] ✅ Found meal plan in metadata:', {
                          hasTitle: !!mealPlan.title,
                          hasDays: !!mealPlan.days,
                          daysType: Array.isArray(mealPlan.days) ? 'array' : typeof mealPlan.days,
                          daysLength: mealPlan.days?.length || 0,
                        });
                        
                        // Ensure days array exists and is valid
                        if (!mealPlan.days || !Array.isArray(mealPlan.days) || mealPlan.days.length === 0) {
                          console.warn('[contextAwareChatFlow] ⚠️ Meal plan found but days array is invalid:', {
                            hasDays: !!mealPlan.days,
                            isArray: Array.isArray(mealPlan.days),
                            length: mealPlan.days?.length || 0,
                          });
                          continue; // Try next match
                        }
                        
                        // Validate that days have meals
                        const hasValidMeals = mealPlan.days.some((day: any) => 
                          day && day.meals && Array.isArray(day.meals) && day.meals.length > 0
                        );
                        
                        if (!hasValidMeals) {
                          console.warn('[contextAwareChatFlow] ⚠️ Meal plan found but has no valid meals');
                          continue; // Try next match
                        }
                        
                        const totalMeals = mealPlan.days.reduce((sum: number, day: any) => sum + (day.meals?.length || 0), 0);
                        
                        console.log('[contextAwareChatFlow] ✅ Found valid meal plan in conversation history:', {
                          title: mealPlan.title,
                          duration: mealPlan.duration,
                          mealsPerDay: mealPlan.mealsPerDay,
                          daysCount: mealPlan.days.length,
                          totalMeals,
                          messageIndex: i,
                        });
                        return mealPlan;
                      } else {
                        console.log(`[contextAwareChatFlow] ℹ️ UI metadata found but no mealPlan key (has keys: ${Object.keys(uiMetadata).join(', ')})`);
                      }
                    } catch (parseError) {
                      console.warn(`[contextAwareChatFlow] ⚠️ Error parsing UI_METADATA match:`, parseError);
                      // Try next match
                      continue;
                    }
                  }
                } catch (e) {
                  console.warn('[contextAwareChatFlow] ⚠️ Error parsing UI_METADATA:', e);
                  // Continue searching in other messages
                }
              } else if (msg.role === 'assistant') {
                // Log if assistant message doesn't have UI_METADATA
                if (process.env.NODE_ENV === 'development') {
                  console.log(`[contextAwareChatFlow] ℹ️ Message ${i} is assistant but has no UI_METADATA`);
                }
              }
            }
            
            // If no meal plan found in UI_METADATA, log for debugging
            console.warn('[contextAwareChatFlow] ⚠️ No valid meal plan found in conversation history');
            console.warn('[contextAwareChatFlow] 📋 Chat history summary:', chatHistory.map((m, idx) => ({
              index: idx,
              role: m.role,
              hasUIMetadata: m.content.includes('[UI_METADATA:'),
              uiMetadataCount: (m.content.match(/\[UI_METADATA:/g) || []).length,
              contentPreview: m.content.substring(0, 150),
            })));
            
            return null;
          };
          
          // CRITICAL: If wrong tool was called (meal plan instead of grocery list), override it
          if (wrongToolCalled) {
            console.error('[contextAwareChatFlow] 🚨 WRONG TOOL CALLED: AI called generate_meal_plan but user asked for grocery list!');
            console.error('[contextAwareChatFlow] 🔧 OVERRIDING: Redirecting to grocery list generation...');
            
            const mealPlanData = extractMealPlanFromHistory();
            
            if (!mealPlanData) {
              console.warn('[contextAwareChatFlow] ⚠️ No meal plan found in conversation history');
              return {
                response: 'I need a meal plan to generate a grocery list. Please generate a meal plan first, then I can create a shopping list with price estimates.',
              };
            }
            
            try {
              const toolResult = await generateGroceryListCore({ mealPlan: mealPlanData });
              
              if (toolResult.success && toolResult.groceryList) {
                console.log('[contextAwareChatFlow] ✅ Grocery list generated successfully (after wrong tool override):', {
                  itemCount: toolResult.groceryList.length,
                  hasLocationInfo: !!toolResult.locationInfo,
                  messageHasUIMetadata: toolResult.message.includes('[UI_METADATA:'),
                });
                
                return {
                  response: toolResult.message, // Contains UI_METADATA for grocery list display
                };
              } else {
                console.error('[contextAwareChatFlow] ❌ Grocery list generation failed:', toolResult.message);
                return {
                  response: toolResult.message || 'Failed to generate grocery list. Please try again.',
                };
              }
            } catch (toolError) {
              console.error('[contextAwareChatFlow] ❌ Error generating grocery list:', toolError);
              return {
                response: 'I encountered an error generating your grocery list. Please try again or contact support.',
              };
            }
          }
          
          // CRITICAL: Always check for grocery list requests, even if AI called a tool
          // This ensures we catch cases where AI responds with text instead of calling the tool
          if (isGroceryListRequest) {
            console.log('[contextAwareChatFlow] 🛒 GROCERY LIST REQUEST DETECTED - Processing immediately...');
            console.log('[contextAwareChatFlow] 📝 User message:', input.message);
            console.log('[contextAwareChatFlow] 🔍 AI called tool?', hasToolCalls, calledToolName);
            
            // If AI called the wrong tool (meal plan instead of grocery list), we already handled it above
            // If AI called the correct tool (grocery list), let it proceed
            // If AI didn't call any tool, we need to trigger it manually
            
            if (!hasToolCalls || (hasToolCalls && calledToolName !== 'generate_grocery_list')) {
              // AI didn't call grocery list tool - trigger it immediately
              console.log('[contextAwareChatFlow] ⚡ AI did not call grocery list tool - triggering manually...');
              
              // STEP 1: Extract meal plan from conversation history
              console.log('[contextAwareChatFlow] 🔍 Extracting meal plan from conversation history...');
              const mealPlanData = extractMealPlanFromHistory();
              
              if (!mealPlanData) {
                // No meal plan found - inform user they need one first
                console.warn('[contextAwareChatFlow] ⚠️ No meal plan found in conversation history');
                console.warn('[contextAwareChatFlow] Chat history:', chatHistory.map(m => ({
                  role: m.role,
                  hasUIMetadata: m.content.includes('[UI_METADATA:'),
                  contentPreview: m.content.substring(0, 100),
                })));
                return {
                  response: 'I need a meal plan to generate a grocery list. Please generate a meal plan first, then I can create a shopping list with price estimates.',
                };
              }
              
              console.log('[contextAwareChatFlow] ✅ Meal plan extracted:', {
                title: mealPlanData.title,
                duration: mealPlanData.duration,
                mealsPerDay: mealPlanData.mealsPerDay,
                days: mealPlanData.days?.length || 0,
                totalMeals: mealPlanData.days?.reduce((sum: number, day: any) => sum + (day.meals?.length || 0), 0) || 0,
              });
              
              // STEP 2: Generate grocery list using AI flow (with prices)
              // This calls generateGroceryListFlow which uses AI to generate the list and prices
              console.log('[contextAwareChatFlow] 🤖 Calling generateGroceryListCore to generate grocery list with prices...');
              
              try {
                const toolResult = await generateGroceryListCore({ mealPlan: mealPlanData });
                
                if (toolResult.success && toolResult.groceryList) {
                  console.log('[contextAwareChatFlow] ✅ Grocery list generated successfully:', {
                    itemCount: toolResult.groceryList.length,
                    hasLocationInfo: !!toolResult.locationInfo,
                    messageHasUIMetadata: toolResult.message.includes('[UI_METADATA:'),
                  });
                  
                  // STEP 3: Return tool call result with UI metadata for display
                  // The message contains [UI_METADATA:...] which will be extracted by chat-panel.tsx
                  // and displayed as a tool call result in the UI
                  return {
                    response: toolResult.message, // Contains UI_METADATA for grocery list display
                  };
                } else {
                  console.error('[contextAwareChatFlow] ❌ Grocery list generation failed:', toolResult.message);
                  return {
                    response: toolResult.message || 'Failed to generate grocery list. Please try again.',
                  };
                }
              } catch (toolError) {
                console.error('[contextAwareChatFlow] ❌ Error generating grocery list:', toolError);
                return {
                  response: 'I encountered an error generating your grocery list. Please try again or contact support.',
                };
              }
            } else {
              // AI called the correct tool - let it proceed
              console.log('[contextAwareChatFlow] ✅ AI correctly called generate_grocery_list tool');
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
            // Final safety check: if message contains "grocery list", do NOT generate meal plan
            const messageLower = input.message.toLowerCase();
            if (/grocery.*list|shopping.*list/i.test(messageLower)) {
              console.error('[contextAwareChatFlow] 🚨 BLOCKED: Message contains "grocery list" - NOT generating meal plan!');
              console.error('[contextAwareChatFlow] User message:', input.message);
              // Try to handle as grocery list instead
              if (hasMealPlanInHistory) {
                console.warn('[contextAwareChatFlow] 🔧 Redirecting to grocery list generation...');
                // Extract meal plan and generate grocery list
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
                    return {
                      response: toolResult.message || 'Generated grocery list successfully.',
                    };
                  } catch (error) {
                    console.error('[contextAwareChatFlow] Error generating grocery list:', error);
                  }
                }
              }
              return {
                response: 'I detected a grocery list request. Let me generate a grocery list for your meal plan.',
              };
            }
            
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
                    console.log('[contextAwareChatFlow] Passing recent chat messages to meal plan generation');
                  }
                  
                  const toolResult = await generateMealPlanCore({
                    ...params,
                    chatMessages: recentChatMessages, // Pass actual chat messages
                  });
              
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
          // Extract recent chat messages for meal plan generation
          const recentChatMessagesForFallback = chatHistory.slice(-5).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content.substring(0, 500), // Limit each message to 500 chars
          }));
          const toolResult = await generateMealPlanCore({
            ...params,
            chatMessages: recentChatMessagesForFallback, // Pass actual chat messages
          });
          
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

