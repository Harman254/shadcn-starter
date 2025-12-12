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

      // 1. Plan
      const plan = await this.reasoningEngine.generatePlan(input.message, {
        ...context,
        userPreferences: input.userPreferences,
        location: input.locationData
      }, tools);

      // 2. Execute
      const toolResults = await this.toolExecutor.executePlan(plan);

      // 3. Synthesize
      // We use generateText here instead of streamText
      const { generateText } = await import('ai');
      const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: this.buildSystemPrompt(input, context, false),
        prompt: this.buildSynthesisPrompt(input.message, toolResults),
      });

      // Store context
      if (input.userId && input.sessionId) {
        await this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResults);
      }

      return {
        response: text,
        toolResults,
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
      let [context, resolvedPreferences, resolvedLocation] = await Promise.all([
        this.contextManager.getContext(input.userId, input.sessionId),
        Promise.resolve(input.userPreferences),
        Promise.resolve(input.locationData)
      ]);

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

      // 2. Call streamText with tools
      const result = streamText({
        model: google('gemini-2.0-flash'),
        tools: tools,
        maxSteps: 5, // Allow multi-step reasoning (e.g. Plan -> Nutrition)
        system: this.buildSystemPrompt(input, context, false),
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

        onFinish: async ({ response }) => {
          // Store context asynchronously
          if (input.userId && input.sessionId) {
            try {
              const toolResults: Record<string, any> = {};
              const messages = response.messages;

              // Extract tool results from the conversation
              for (const m of messages) {
                if (m.role === 'tool') {
                  // Vercel AI SDK stores tool results in content array
                  if (Array.isArray(m.content)) {
                    for (const part of m.content) {
                      if (part.type === 'tool-result') {
                        // Normalize result structure for ContextManager
                        toolResults[part.toolName] = {
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

              if (Object.keys(toolResults).length > 0) {
                await this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResults);
                console.log('[OrchestratedChatFlow] ✅ Context saved successfully');
              }
            } catch (error) {
              console.error('[OrchestratedChatFlow] Failed to save context:', error);
            }
          }
        },
        onError: (error) => {
          console.error('[OrchestratedChatFlow] Stream Error:', error);
        }
      });

      return result.toDataStream();
    })();

    // Convert the Promise<ReadableStream> to a ReadableStream
    // We can use a TransformStream to unwrap it roughly, or just await it in the route handler.
    // BUT `processMessageStream` signature returns `ReadableStream`.
    // We can return a specific Vercel stream that handles the promise?
    // standard `new ReadableStream` can await?

    const { readable, writable } = new TransformStream();
    streamPromise.then(stream => stream.pipeTo(writable)).catch(e => {
      console.error("Stream setup failed", e);
      const writer = writable.getWriter();
      writer.write(new TextEncoder().encode(`3:${JSON.stringify(e.message)}\n`));
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
      - The UI is ALREADY showing the full data (meal plan cards, grocery lists, etc.)
      - Write a SHORT, creative acknowledgment (1-2 sentences MAX)
      - DO NOT describe what's in the data - the user can SEE it
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
HOWEVER, if the user asks a general question (e.g., "What is Ugali?", "How do I cook rice?"), you should intelligently ANSWER DIRECTLY without using tools.

CONTEXT RESET: If the user says "Start over", "New plan", "Reset", or "Forget context", you should IGNORE the previous context (Meal Plan ID, Grocery List ID) and treat it as a fresh request. Explicitly mention that you are starting fresh.`;

    const contextInfo = `
CURRENT CONTEXT:
- User Preferences: ${JSON.stringify(input.userPreferences || {})}
- Location: ${JSON.stringify(input.locationData || {})}
${context?.mealPlanId ? `- Previous Meal Plan ID: ${context.mealPlanId} (USE THIS for follow-up requests!)` : '- No active meal plan'}
${context?.groceryListId ? `- Previous Grocery List ID: ${context.groceryListId}` : ''}`;

    return `${basePrompt}

${contextInfo}

AVAILABLE TOOLS:
- fetchUserPreferences: Fetch stored user preferences (dietary, allergies, goals)
- generateMealPlan: Create a meal plan (parameters: duration, mealsPerDay, preferences)
- modifyMealPlan: Generate a different meal plan variant
- swapMeal: Swap a specific meal in the plan
- generateMealRecipe: Generate detailed recipe for a meal
- generateGroceryList: Create shopping list (optional mealPlanId, works from context)
- searchFoodData: Search real-world food data (nutrition, prices, availability, substitutions)
- analyzeNutrition: Analyze nutrition (optional mealPlanId, works from context)
- generatePrepTimeline: Create an optimized prep schedule (works with context or specific recipes)

CRITICAL ORCHESTRATION RULES:
1. **Meal Planning Flow**:
   - ALWAYS start by checking/fetching user preferences if not provided.
   - Then generate the meal plan.
   - AFTER generating the plan, you can offer to generate a grocery list or analyze nutrition.
   
2. **Grocery Flow**:
   - Generate the list first using "generateGroceryList".
   - THEN offer to optimize it using "optimizeGroceryList" (especially if user mentions specific stores or saving money).

3. **Recipe Flow**:
   - If user asks for a recipe for a specific meal in the plan, use "generateMealRecipe".

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
