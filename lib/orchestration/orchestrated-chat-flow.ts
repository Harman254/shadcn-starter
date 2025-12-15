/**
 * @fileOverview
 * Main Orchestrated Chat Flow with Robust Tool Execution
 * Features: Intent validation, retry logic, context tracking, comprehensive logging
 */

import { streamText, StreamData } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from './ai-tools';
import { getIntentValidator } from './intent-validator';
import { getLogger } from './tool-execution-logger';
import { getContextManager } from './conversation-context';
import { getReasoningEngine } from './reasoning-engine';
import { getToolExecutor } from './tool-executor';

// ============================================================================
// TYPES
// ============================================================================

export interface OrchestratedChatInput {
  message: string | Array<any>;
  userId?: string;
  sessionId?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userPreferences?: any | Promise<any>;
  locationData?: any | Promise<any>;
}

export interface OrchestratedChatOutput {
  response: string;
  structuredData?: any;
  suggestions?: string[];
  toolResults?: Record<string, any>;
  confidence: 'high' | 'medium' | 'low';
  debug?: {
    intent?: string;
    retried?: boolean;
    validationPassed?: boolean;
  };
}

// ============================================================================
// ORCHESTRATED CHAT FLOW
// ============================================================================

export class OrchestratedChatFlow {
  private validator = getIntentValidator();
  private logger = getLogger();
  private contextManager = getContextManager();
  private reasoningEngine = getReasoningEngine();
  private toolExecutor = getToolExecutor();

  constructor() { }

  /**
   * Process user message with multi-phase orchestration (Legacy Promise-based)
   */
  async processMessage(input: OrchestratedChatInput): Promise<OrchestratedChatOutput> {
    // This is a wrapper around the streaming implementation for backward compatibility
    // It collects the stream and returns the final result
    // Note: This loses the streaming benefits but keeps the API consistent for server actions

    // For now, we'll implement a simplified version that just waits for the result
    // In a real scenario, we'd consume the stream.
    // But since we are moving to streaming, we might just want to implement the core logic here
    // and have processMessageStream use it.

    // Let's implement the core logic directly here for non-streaming, 
    // but reusing the engines.

    try {
      const context = await this.contextManager.getContext(input.userId, input.sessionId);

      // Ensure message is a string
      const messageText = typeof input.message === 'string'
        ? input.message
        : Array.isArray(input.message)
          ? input.message.map((part: any) => part.text || JSON.stringify(part)).join(' ')
          : String(input.message);

      // Analyze Intent for Robustness (Unified Logic)
      const intentAnalysis = this.validator.analyzeIntent(messageText);
      const intentSystemInstruction = intentAnalysis.confidence === 'high' && intentAnalysis.expectedTools.length > 0
        ? `\n\n🚨 SYSTEM OVERRIDE: User intent detected as ${intentAnalysis.intent}. You MUST use the tool "${intentAnalysis.expectedTools[0]}" to satisfy this request. Do not generate text only.`
        : '';

      // Use AI SDK generateText for unified execution
      const { generateText } = await import('ai');
      const { text, steps } = await generateText({
        model: google('gemini-2.0-flash'),
        tools: tools,
        maxSteps: 5,
        system: this.buildSystemPrompt(input, context, false) + intentSystemInstruction,
        messages: [
          ...input.conversationHistory,
          { role: 'user', content: messageText }
        ],
      });

      // Extract tool results from steps
      const toolResults: Record<string, any> = {};

      for (const step of steps) {
        if (step.toolCalls) {
          for (const toolCall of step.toolCalls) {
            // The SDK executes the tool, but we need the result.
            // Steps contain toolCalls and toolResults if we use the right structure.
            // Actually generateText returns 'steps' which include 'toolCalls' and 'toolResults'.
            // We need to match the toolResult with the call by ID or just collect them.
          }
        }
      }

      // Better extraction from flat tool executions if available or iterate steps
      // generateText steps: { text, toolCalls, toolResults }[]
      for (const step of steps) {
        if (step.toolResults) {
          for (const tr of step.toolResults) {
            const baseResult = { success: true, data: tr.result };
            toolResults[tr.toolName] = typeof tr.result === 'object' ? { ...baseResult, ...tr.result } : { ...baseResult, result: tr.result };
          }
        }
      }

      // Store context
      if (input.userId && input.sessionId && Object.keys(toolResults).length > 0) {
        await this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResults);
      }

      // Map tool results to structuredData for UI rendering
      const structuredData: any = {};

      // Check for meal plan in tool results
      if (toolResults.generateMealPlan && toolResults.generateMealPlan.data) {
        // The tool result structure from ai-tools.ts: { mealPlan: ... } inside the data
        if (toolResults.generateMealPlan.data.mealPlan) {
          structuredData.mealPlan = toolResults.generateMealPlan.data.mealPlan;
        } else if (toolResults.generateMealPlan.data.result?.mealPlan) {
          // Handle potential nesting variation
          structuredData.mealPlan = toolResults.generateMealPlan.data.result.mealPlan;
        }
      }

      // Check for grocery list in tool results
      if (toolResults.generateGroceryList && toolResults.generateGroceryList.data) {
        if (toolResults.generateGroceryList.data.groceryList) {
          structuredData.groceryList = toolResults.generateGroceryList.data.groceryList;
        } else if (toolResults.generateGroceryList.data.result?.groceryList) {
          structuredData.groceryList = toolResults.generateGroceryList.data.result.groceryList;
        }
      }

      return {
        response: text,
        toolResults,
        structuredData,
        confidence: 'high'
      };

    } catch (error) {
      console.error('[OrchestratedChatFlow] Error:', error);
      return {
        response: "I'm sorry, I encountered an error. Please try again.",
        confidence: 'low'
      };
    }
  }

  /**
   * Process user message with streaming support
   */
  /**
   * Process user message with streaming support
   * Returns a ReadableStream that streams status updates, tool results, and final text
   */
  /**
   * Process user message with streaming support
   * Returns a ReadableStream that streams status updates, tool results, and final text
   */
  processMessageStream(input: OrchestratedChatInput): ReadableStream {
    // 1. Load context and preferences (in parallel)
    // We do this BEFORE starting the stream to ensure the system prompt has valid context.
    // In a pure edge case we might want to stream this loading state too, but for now strict await is safer for context integrity.

    // Create a TransformStream to inject initial status messages if needed, 
    // but for "ChatGPT-like" speed, we want to start streaming text ASAP.
    // However, we need to fetch context first.

    const streamPromise = (async () => {
      try {
        console.log('[OrchestratedChatFlow] Starting stream processing...');
        
        let [context, resolvedPreferences, resolvedLocation] = await Promise.all([
          this.contextManager.getContext(input.userId, input.sessionId),
          Promise.resolve(input.userPreferences),
          Promise.resolve(input.locationData)
        ]);
        
        console.log('[OrchestratedChatFlow] Context loaded, preferences resolved');

      // RECOVERY LOGIC
      if ((!context || !context.lastToolResult) && input.conversationHistory.length > 0) {
        const recovered = this.contextManager.recoverContextFromHistory(input.conversationHistory);
        if (recovered.lastToolResult) {
          console.log('[OrchestratedChatFlow] 🩹 Context recovered from history');
          if (!context) {
            context = { timestamp: new Date(), ...recovered } as any;
          } else {
            context.lastToolResult = recovered.lastToolResult;
            if (recovered.mealPlanId) context.mealPlanId = recovered.mealPlanId;
            if (recovered.groceryListId) context.groceryListId = recovered.groceryListId;
          }
        }
      }

      // 1.5 Analyze Intent for Robustness (Scalable Pattern)
      const messageText = typeof input.message === 'string'
        ? input.message
        : Array.isArray(input.message)
          ? input.message.map((p: any) => p.text || '').join(' ')
          : '';

      const intentAnalysis = this.validator.analyzeIntent(messageText);
      // Build intent override instruction
      let intentSystemInstruction = '';
      let forcedTool: string | undefined = undefined;
      
      if (intentAnalysis.confidence === 'high' && intentAnalysis.expectedTools.length > 0) {
        const toolName = intentAnalysis.expectedTools[0];
        forcedTool = toolName;
        
        intentSystemInstruction = `\n\n🚨🚨🚨 CRITICAL SYSTEM OVERRIDE 🚨🚨🚨\nUser intent detected as ${intentAnalysis.intent}.\nYOU MUST CALL THE TOOL "${toolName}" IMMEDIATELY.\nDO NOT generate any text description of meals, plans, recipes, or lists.\nDO NOT write meal names, ingredients, recipe steps, or instructions in your response.\nDO NOT say "Here is the recipe" and then describe it - CALL THE TOOL.\nDO NOT say "Here's the full recipe" - CALL THE TOOL.\nCALL THE TOOL NOW. The tool will generate the UI automatically.\nAfter the tool executes, keep your text response to 1-2 sentences maximum.\nExample: "Here's the recipe!" or "Here's your meal plan!" - DO NOT describe the content.\n🚨🚨🚨 END OVERRIDE 🚨🚨🚨`;
        
        console.log(`[OrchestratedChatFlow] 🔨 FORCING TOOL: ${toolName} for intent: ${intentAnalysis.intent}`);
      }

      // 2. Call streamText with tools
      console.log('[OrchestratedChatFlow] Calling streamText with model: gemini-2.0-flash');
      
      // Check if API key is available
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('[OrchestratedChatFlow] ❌ No Google API key found!');
        throw new Error('Google Generative AI API key is not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY environment variable.');
      }
      console.log('[OrchestratedChatFlow] ✅ API key found');
      
      // Log available tools for debugging
      const toolNames = Object.keys(tools);
      console.log(`[OrchestratedChatFlow] 📦 Available tools (${toolNames.length}):`, toolNames);
      console.log('[OrchestratedChatFlow] Message:', typeof input.message === 'string' ? input.message.substring(0, 100) : 'Array/object');
      console.log('[OrchestratedChatFlow] Conversation history length:', input.conversationHistory.length);
      if (intentAnalysis.confidence === 'high' && intentAnalysis.expectedTools.length > 0) {
        console.log(`[OrchestratedChatFlow] 🎯 Intent detected: ${intentAnalysis.intent}, Expected tool: ${intentAnalysis.expectedTools[0]}`);
      }
      
      // Force tool usage for high-confidence intents
      const toolChoice = forcedTool ? { type: 'tool' as const, toolName: forcedTool } : undefined;
      
      if (toolChoice) {
        console.log(`[OrchestratedChatFlow] 🎯 Using toolChoice to force: ${forcedTool}`);
      }
      
      const result = streamText({
        model: google('gemini-2.0-flash'),
        tools: tools,
        maxSteps: 5, // Allow multi-step reasoning (e.g. Plan -> Nutrition)
        system: this.buildSystemPrompt(input, context, false) + intentSystemInstruction,
        toolChoice: toolChoice, // Force tool usage for recipe/meal plan requests
        messages: [
          ...input.conversationHistory,
          { role: 'user', content: input.message as string }
        ],
        // Pass context to tools via implicit state if needed, but our tools read from 'messages' or 'toolInvocations' usually.
        // However, Vercel AI SDK tools don't automatically get "context" object unless we use the 'experimental_toolCallHandler' or similar.
        // BUT, our tools in ai-tools.ts are defined with `tool()` which doesn't natively accept a separate context arg in the new SDK version strictly?
        // Wait, in previous toolExecutor we passed `context` manually.
        // `ai-tools.ts` defines tools with `execute: async (args, options)`.
        // We need to ensure `options` contains what we need. 
        // Vercel AI SDK `streamText` passes `{ toolCallId, messages }` to tools.
        // Our tools look for `options.context`. 
        // We might need to rely on `messages` to reconstruct context OR rely on the system prompt context.
        // FORTUNATELY, `ai-tools.ts` tools I verified primarily check `input` args, and fallback to `chatMessages`.
        // The `chatMessages` parameter in our tools schema creates a way to pass context!
        // The model sees `chatMessages` as an optional param and might NOT fill it.
        // CRITICAL FIX: The tools need context. 
        // We can use `experimental_prepareToolResult` or similar? No.
        // Simpler: The System Prompt contains the context IDs (MealPlanID, etc).
        // The Model SHOULD pass these IDs to the tools if instructed.
        // My previous fix to `generatePrepTimeline` ADDED `chatMessages` to schema.

        onFinish: async ({ response, text }) => {
          // Log tool usage for debugging
          const toolCalls = response.steps?.flatMap(step => step.toolCalls || []) || [];
          const toolResults = response.steps?.flatMap(step => step.toolResults || []) || [];
          
          console.log('[OrchestratedChatFlow] onFinish - Tool calls:', toolCalls.length);
          console.log('[OrchestratedChatFlow] onFinish - Tool results:', toolResults.length);
          
          if (forcedTool && toolCalls.length === 0) {
            console.error(`[OrchestratedChatFlow] ❌ CRITICAL: Tool ${forcedTool} was FORCED but NOT CALLED!`);
            console.error(`[OrchestratedChatFlow] Response text: ${text.substring(0, 200)}`);
          } else if (forcedTool && toolCalls.length > 0) {
            const calledTool = toolCalls.find(tc => tc.toolName === forcedTool);
            if (calledTool) {
              console.log(`[OrchestratedChatFlow] ✅ Tool ${forcedTool} was successfully called!`);
            } else {
              console.warn(`[OrchestratedChatFlow] ⚠️ Tool ${forcedTool} was forced but different tool was called:`, toolCalls.map(tc => tc.toolName));
            }
          }
          
          // Store context asynchronously
          if (input.userId && input.sessionId) {
            try {
              const toolResultsMap: Record<string, any> = {};
              const messages = response.messages;

              // Extract tool results from the conversation
              for (const m of messages) {
                if (m.role === 'tool') {
                  // Vercel AI SDK stores tool results in content array
                  if (Array.isArray(m.content)) {
                    for (const part of m.content) {
                      if (part.type === 'tool-result') {
                        // Normalize result structure for ContextManager
                        toolResultsMap[part.toolName] = {
                          success: !part.isError,
                          data: part.result,
                          // Infer result if it's the raw object
                          ...(typeof part.result === 'object' ? part.result : { result: part.result })
                        };
                      }
                    }
                  }
                }
              }

              if (Object.keys(toolResultsMap).length > 0) {
                await this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResultsMap);
                console.log('[OrchestratedChatFlow] ✅ Context saved successfully');
              }
            } catch (error) {
              console.error('[OrchestratedChatFlow] Failed to save context:', error);
            }
          }
        },
        onError: (error) => {
          console.error('[OrchestratedChatFlow] Stream Error:', error);
          console.error('[OrchestratedChatFlow] Error details:', {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
            cause: error?.cause
          });
        }
      });

      console.log('[OrchestratedChatFlow] streamText called, converting to data stream...');
      const dataStream = result.toDataStream();
      console.log('[OrchestratedChatFlow] ✅ Data stream created successfully');
      return dataStream;
      } catch (error: any) {
        console.error('[OrchestratedChatFlow] Error in streamPromise:', {
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          code: error?.code
        });
        throw error;
      }
    })();

    // Convert the Promise<ReadableStream> to a ReadableStream
    // We can use a TransformStream to unwrap it roughly, or just await it in the route handler.
    // BUT `processMessageStream` signature returns `ReadableStream`.
    // We can return a specific Vercel stream that handles the promise?
    // standard `new ReadableStream` can await?

    const { readable, writable } = new TransformStream();
    
    streamPromise
      .then(stream => {
        // Pipe the stream to writable
        return stream.pipeTo(writable);
      })
      .catch(e => {
        console.error("[OrchestratedChatFlow] Stream setup failed:", e);
        const writer = writable.getWriter();
        
        // Write error in AI SDK format
        const errorMessage = e?.message || 'Stream initialization failed';
        const errorData = JSON.stringify({ 
          type: 'error', 
          error: errorMessage,
          code: e?.code || 'STREAM_ERROR'
        });
        
        // AI SDK error format: "3:{"error":"message"}\n"
        writer.write(new TextEncoder().encode(`3:${errorData}\n`));
        writer.close();
      });

    return readable;
  }

  private buildSynthesisPrompt(userMessage: string, toolResults: Record<string, any>): string {
    // Extract clean messages without UI_METADATA
    const toolMessages = Object.entries(toolResults)
      .map(([tool, result]) => {
        if (result) {
          if (result.success === false || result.isSystemError) {
            return `Tool '${tool}' FAILED: ${result.error || 'Unknown error'}`;
          }
          if (typeof result.message === 'string') {
            return result.message.replace(/\s*\[UI_METADATA:[^\]]+\]/, '');
          }
        }
        return '';
      })
      .filter(Boolean);

    const hasResults = toolMessages.length > 0;
    const hasErrors = toolMessages.some(m => m.includes('FAILED'));

    // Randomize personality for variety
    const personalities = [
      'a friendly chef who loves sharing food wisdom',
      'an enthusiastic food blogger excited about healthy eating',
      'a warm kitchen companion who makes cooking fun',
      'a supportive nutritionist who celebrates every meal',
      'a cheerful sous chef who loves to help'
    ];
    const personality = personalities[Math.floor(Math.random() * personalities.length)];

    return `
      USER MESSAGE: "${userMessage}"
      
      TOOL EXECUTION SUMMARY:
      ${hasResults ? toolMessages.join('\n') : 'No tools were executed.'}
      
      YOUR PERSONALITY: You are ${personality}.
      
      CREATIVE RESPONSE GUIDELINES:
      ${hasResults ? `
      - The UI is ALREADY showing the full data cards.
      - DO NOT summarize or describe the data (e.g. dont say "Here is the recipe for...").
      - Be ULTRA-CONCISE (under 15 words).
      - Just say a quick creative confirmation or nothing at all if not needed.
      - BE CREATIVE! Vary your responses each time:
        * Use different greetings (Awesome! / Voilà! / Ta-da! / Here you go! / Done!)
        * Add relevant emojis sparingly (🎉 🍳 🥗 ✨)
        * Occasionally add a fun food fact or tip
        * Sometimes ask a follow-up question ("Want me to adjust anything?")
      - If there are ERRORS, be honest but helpful ("Hmm, couldn't get prices, but here's your plan!")
      - Match the user's energy - if they're excited, be excited back!
      ` : `
      - No tools were executed - this is a general chat.
      - Be conversational, witty, and engaging.
      - Show your food expertise naturally.
      - Ask clarifying questions if unsure what they need.
      - If they said hello, greet them warmly and ask how you can help with their meal planning.
      `}
      `;
  }

  /**
   * Build system prompt with context and examples
   */
  private buildSystemPrompt(
    input: OrchestratedChatInput,
    context: any,
    isRetry: boolean,
    forcedTools?: string[]
  ): string {
    const basePrompt = `You are a diverse expert AI assistant for a meal planning application.
Your goal is to help users plan meals, analyze nutrition, check grocery prices, and generate grocery lists.
You are also a knowledgeable culinary expert who can discuss food, recipes, ingredients, and cooking techniques freely.

CRITICAL RULE: When users request specific actions (Meals, Meal planning, shoppinglist generation, analysis, nutrition, Recipes, Recipe analysis), you MUST use the corresponding tools.
🚨 ENFORCEMENT: If user asks for a meal plan in ANY form (e.g., "meal plan", "plan", "what should I eat", "create a plan", "generate", "do it again" after a plan request), you MUST call 'generateMealPlan' tool. DO NOT generate text descriptions of meals.
HOWEVER, if the user asks a non-food general question (e.g., "How does this app work?"), answer directly.
If the user mentions a specific food item or dish (e.g., "Chicken Biryani", "Ugali"), you SHOULD use "generateMealRecipe" (for dishes) or "searchFoodData" (for ingredients/nutrition) to provide rich content, UNLESS they explicitly ask for a simple text definition only.

CONTEXT RESET: If the user says "Start over", "New plan", "Reset", or "Forget context", you should IGNORE the previous context (Meal Plan ID, Grocery List ID) and treat it as a fresh request. Explicitly mention that you are starting fresh.`;

    const contextInfo = `
CURRENT CONTEXT:
- User Preferences: ${JSON.stringify(input.userPreferences || {})}
- Location: ${JSON.stringify(input.locationData || {})}
${context?.mealPlanId ? `- Previous Meal Plan ID: ${context.mealPlanId} (USE THIS for follow-up requests!)` : '- No active meal plan'}
${context?.groceryListId ? `- Previous Grocery List ID: ${context.groceryListId}` : ''}`;

    return `${basePrompt}

${contextInfo}

AVAILABLE TOOLS (YOU MUST USE THESE - DO NOT GENERATE TEXT):
    
    🍽️ MEAL PLANNING TOOLS:
    - generateMealPlan: Use when user asks for "meal plan", "what should I eat", "create a plan", "plan for X days", "just get me something", "do it again" (after a plan request)
      → Creates a complete meal plan with meals, ingredients, and instructions
      → Parameters: duration (days), mealsPerDay, preferences (optional)
      → EXAMPLE: User says "meal plan" → CALL generateMealPlan with duration=1, mealsPerDay=3
    
    - modifyMealPlan: Use when user wants a "different plan", "new plan", "alternative plan" (after already having a plan)
      → Generates a different variant of a meal plan
      → EXAMPLE: User says "give me a different plan" → CALL modifyMealPlan
    
    - swapMeal: Use when user wants to "swap" or "replace" a specific meal in the plan
      → EXAMPLE: User says "swap breakfast" → CALL swapMeal
    
    📝 RECIPE TOOLS:
    - generateMealRecipe: MANDATORY when user asks "how to make X", "recipe for X", "full recipe for X", "give me recipe for X", "show me recipe for X", OR mentions any dish name
      → Generates detailed recipe with ingredients and steps in a rich UI card
      → DO NOT write recipes in text - the UI needs the tool result
      → EXAMPLE: User says "Give me the full recipe for Jamaican Beef Patties" → CALL generateMealRecipe with name="Jamaican Beef Patties"
      → EXAMPLE: User says "Jamaican Beef Patties" → CALL generateMealRecipe with name="Jamaican Beef Patties"
    
    - searchRecipes: Use when user asks for "recipe ideas", "find recipes", "pasta recipes", "breakfast ideas"
      → Searches for multiple recipe suggestions
      → EXAMPLE: User says "find me pasta recipes" → CALL searchRecipes
    
    🛒 GROCERY TOOLS:
    - generateGroceryList: Use when user asks for "grocery list", "shopping list", "what to buy"
      → Creates a shopping list from meal plan or recipe
      → Works from context if meal plan exists
      → EXAMPLE: User says "grocery list" → CALL generateGroceryList
    
    - optimizeGroceryList: Use when user asks to "optimize" or "find best prices" for grocery list
      → Optimizes list with pricing and substitutions
      → EXAMPLE: User says "optimize my grocery list" → CALL optimizeGroceryList
    
    - getGroceryPricing: Use when user asks "how much will this cost", "price", "budget"
      → Estimates costs for groceries
      → EXAMPLE: User says "how much will this cost" → CALL getGroceryPricing
    
    📊 ANALYSIS TOOLS:
    - analyzeNutrition: Use when user asks about "nutrition", "calories", "macros", "healthiness"
      → Analyzes nutritional content
      → EXAMPLE: User says "how many calories" → CALL analyzeNutrition
    
    - searchFoodData: Use when user asks about specific food items, ingredients, nutrition facts
      → Searches real-world food data
      → EXAMPLE: User says "how much protein in chicken" → CALL searchFoodData
    
    🥘 SPECIAL TOOLS:
    - planFromInventory: Use when user says "I have X ingredients", "plan from what I have"
      → Creates meal plan from available ingredients
      → EXAMPLE: User says "I have chicken and rice" → CALL planFromInventory
    
    - generatePrepTimeline: Use when user asks for "prep schedule", "batch cooking", "meal prep timeline"
      → Creates optimized prep schedule
      → EXAMPLE: User says "prep schedule" → CALL generatePrepTimeline
    
    - getSeasonalIngredients: Use when user asks about "seasonal", "what's in season"
      → Finds seasonal produce
      → EXAMPLE: User says "what's in season" → CALL getSeasonalIngredients
    
    - suggestIngredientSubstitutions: Use when user says "don't have X", "substitute X", "alternative to X"
      → Suggests ingredient alternatives
      → EXAMPLE: User says "I don't have chicken" → CALL suggestIngredientSubstitutions
    
    - analyzePantryImage: Use when user uploads an image of their pantry/fridge
      → Identifies ingredients from photo
      → EXAMPLE: User uploads image → CALL analyzePantryImage
    
    - updatePantry: Use when user wants to "add to pantry", "update inventory"
      → Updates user's pantry inventory
      → EXAMPLE: User says "add chicken to my pantry" → CALL updatePantry
    
    ⚙️ UTILITY TOOLS:
    - fetchUserPreferences: Use to get user's saved dietary preferences (usually called automatically)

TOOL SELECTION DECISION TREE (FOLLOW THIS EXACTLY):
    
    Step 1: What is the user asking for?
    
    A. Meal Plan Request?
       - Keywords: "meal plan", "plan", "what should I eat", "create a plan", "generate", "just get me something", "do it again"
       - → CALL generateMealPlan (duration=1, mealsPerDay=3 by default)
       - → DO NOT describe meals in text
    
    B. Recipe Request?
       - Keywords: "how to make", "recipe for", "show me recipe", "full recipe", "give me recipe", "complete recipe", "recipe", ANY dish name (e.g., "ugali", "chapati", "Jamaican Beef Patties", "Jamaican Jerk Chicken")
       - → 🚨 IMMEDIATELY CALL generateMealRecipe (name="dish name")
       - → 🛑 NEVER write recipe steps, ingredients, or instructions in text
       - → 🛑 NEVER say "Here is the recipe" and then describe it - CALL THE TOOL
       - → CRITICAL: The tool generates a beautiful UI card. Text descriptions are USELESS and will be IGNORED by the UI
    
    C. Grocery List Request?
       - Keywords: "grocery list", "shopping list", "what to buy"
       - → CALL generateGroceryList (works from context if meal plan exists)
       - → DO NOT list items in text
    
    D. Nutrition Analysis?
       - Keywords: "nutrition", "calories", "macros", "healthiness"
       - → CALL analyzeNutrition (works from context)
       - → DO NOT calculate in text
    
    E. Pricing Request?
       - Keywords: "price", "cost", "how much", "budget"
       - → CALL getGroceryPricing (works from context)
       - → DO NOT estimate in text
    
    F. Different/New Plan?
       - Keywords: "different plan", "new plan", "alternative", "another one"
       - → CALL modifyMealPlan
       - → DO NOT describe in text
    
    G. Swap Meal?
       - Keywords: "swap", "replace", "change" + meal name
       - → CALL swapMeal
       - → DO NOT describe in text
    
    H. Recipe Search/Ideas?
       - Keywords: "recipe ideas", "find recipes", "pasta recipes", "breakfast ideas"
       - → CALL searchRecipes
       - → DO NOT list in text
    
    I. Food Data Query?
       - Keywords: "how much protein in", "nutrition facts for", "calories in", "price of", "where to buy", ingredient questions
       - → CALL searchFoodData
       - → DO NOT answer in text
    
    J. Optimize Grocery List?
       - Keywords: "optimize list", "find best prices", "cheapest options"
       - → CALL optimizeGroceryList
       - → DO NOT suggest in text
    
    K. Update Pantry?
       - Keywords: "add to pantry", "update inventory", "save to pantry"
       - → CALL updatePantry
       - → DO NOT confirm in text only
    
    L. Other Requests?
       - Check the tool descriptions above for other tools (prep timeline, seasonal, etc.)
       - → CALL appropriate tool
       - → DO NOT generate content in text

CRITICAL ORCHESTRATION RULES:
      1. ** Meal Planning Flow **:
    - **Smart Defaults**: If user asks for a meal plan without specifics, IMMEDIATELY call 'generateMealPlan' with defaults (duration: 1, mealsPerDay: 3) and use saved preferences from database.
    - **Only Ask Questions When Critical**: Only ask follow-up questions if:
      * User has conflicting requirements (e.g., "keto but also pasta")
      * User explicitly asks for clarification ("what do you prefer?")
      * Missing critical info that affects safety (severe allergies)
    - **Generate First, Refine Later**: Generate the plan immediately, then offer to modify it. Users prefer seeing results over answering questions.
    - AFTER generating the plan, you can offer to generate a grocery list or analyze nutrition.
   
2. ** Text vs Tools(ABSOLUTE RULE - DO NOT VIOLATE) **:
    - 🛑 CRITICAL: NEVER generate a meal plan, recipe, grocery list, or prep schedule as TEXT in your response.
   - 🛑 NEVER write lists of ingredients, meal names, or instructions in the chat message.
   - 🛑 NEVER describe meals in text format (e.g., "Tuna Salad for breakfast, Chicken Salad Sandwich for lunch").
   - 🛑 NEVER write recipe steps, ingredients, or cooking instructions in text (e.g., "Here is the recipe: 1. Mix... 2. Cook...").
   - 🛑 NEVER say "Here is the recipe" and then describe it - YOU MUST CALL THE TOOL.
   - ✅ YOU MUST CALL THE TOOL 'generateMealPlan' IMMEDIATELY when user asks for a meal plan.
   - ✅ YOU MUST CALL THE TOOL 'generateMealRecipe' IMMEDIATELY when user asks for ANY recipe (even "full recipe", "complete recipe").
   - ✅ The tool generates beautiful UI cards - your text response will be IGNORED by the UI.
   - ✅ After calling the tool, keep your text response SHORT (1-2 sentences max). Just say "Here's your meal plan!" or "Here's the recipe!" - DO NOT describe the content.
   - ✅ If user says "meal plan", "plan", "what should I eat", "create a plan", "generate a plan" → CALL 'generateMealPlan' TOOL IMMEDIATELY.
   - ✅ If user says "recipe", "recipe for X", "full recipe", "how to make X", "give me recipe for X" → CALL 'generateMealRecipe' TOOL IMMEDIATELY.
   - ✅ If user says "do it again" or "generate again" after a meal plan request → CALL 'generateMealPlan' TOOL AGAIN.
   - If you write the plan or recipe in text, the user sees NOTHING useful. The UI will be EMPTY. You MUST use the tools.

3. ** Thinking Process **:
    - Before answering, think: "Does this request need a UI card?"
      - Meal Request -> UI Card -> Use Tool 'generateMealPlan' or 'generateMealRecipe'.
   - Grocery Request -> UI Card -> Use Tool 'generateGroceryList'.

4. ** Response Style After Tool Usage(CRITICAL) **:
    - When a tool returns data, the UI AUTOMATICALLY shows a rich card.
   - DO NOT repeat the ingredients, steps, or list items.
   - INSTEAD, add value: share a chef's tip, mention why this dish is great, or suggest a pairing.
      - "Here is the recipe! It's great because..." is better than just "Here is the recipe."

    5. ** Errors **:
    - If a tool fails, tell the user gracefully.Do not try to fake the UI with text.

6. ** FINAL REMINDER **:
    - 🚨 YOU HAVE 17 TOOLS AVAILABLE - USE THEM!
    - 🚨 If user asks for ANY content (meal plan, recipe, grocery list, nutrition) → CALL THE TOOL
    - 🚨 Text descriptions are USELESS - the UI needs tool results to display cards
    - 🚨 When in doubt, check the TOOL SELECTION DECISION TREE above
    - 🚨 After calling a tool, your text response should be 1-2 sentences MAX

      Remember: ALWAYS use tools for user requests. Be helpful and concise in your responses.`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let chatFlowInstance: OrchestratedChatFlow | null = null;

export function getOrchestratedChatFlow(): OrchestratedChatFlow {
  if (!chatFlowInstance) {
    chatFlowInstance = new OrchestratedChatFlow();
  }
  return chatFlowInstance;
}

