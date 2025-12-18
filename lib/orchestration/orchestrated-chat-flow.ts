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
  message: string;
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
        model: google('gemini-3-flash'),
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
  processMessageStream(input: OrchestratedChatInput): ReadableStream {
    const encoder = new TextEncoder();

    // Helper to format data chunks for Vercel AI SDK (2:[data]\n)
    const formatData = (data: any) => {
      return encoder.encode(`2:${JSON.stringify([data])}\n`);
    };

    // Helper to format error chunks (3:"error"\n)
    const formatError = (error: string) => {
      return encoder.encode(`3:${JSON.stringify(error)}\n`);
    };

    return new ReadableStream({
      start: async (controller) => {
        // Keep-alive interval to prevent timeouts during long reasoning/execution
        const keepAliveInterval = setInterval(() => {
          try {
            controller.enqueue(formatData({ type: 'status', content: 'Thinking...' }));
          } catch (e) {
            clearInterval(keepAliveInterval);
          }
        }, 3000); // 3s to reduce noise while preventing timeouts

        try {
          // 1. Initial Status
          controller.enqueue(formatData({ type: 'status', content: '🤔 Analyzing your request...' }));

          // Load context and preferences in parallel
          let [context, resolvedPreferences, resolvedLocation] = await Promise.all([
            this.contextManager.getContext(input.userId, input.sessionId),
            Promise.resolve(input.userPreferences),
            Promise.resolve(input.locationData)
          ]);

          // RECOVERY LOGIC: If DB context is missing/empty, try to recover from chat history
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

          // 2. Plan
          const plan = await this.reasoningEngine.generatePlan(input.message, {
            ...context,
            userPreferences: resolvedPreferences,
            location: resolvedLocation
          }, tools);

          controller.enqueue(formatData({ type: 'plan', content: plan }));

          // 3. Execute
          const fullHistory = [
            ...input.conversationHistory,
            // DO NOT filter the [IMAGE_CONTEXT] here, ensure it reaches the Tool Executor
            { role: 'user' as const, content: input.message }
          ];

          const toolResults = await this.toolExecutor.executePlan(plan,
            (step) => {
              controller.enqueue(formatData({ type: 'status', content: `⚙️ Executing step: ${step.description}` }));
            },
            undefined,
            undefined,
            fullHistory, // Pass FULL history including current message
            context // Pass context for tool execution
          );

          // Extract UI_METADATA from tool results
          let collectedUIData: any = null;
          for (const [toolName, result] of Object.entries(toolResults)) {
            if (result && typeof result.message === 'string') {
              const uiMetadataMatch = result.message.match(/\[UI_METADATA:([^\]]+)\]/);
              if (uiMetadataMatch) {
                try {
                  const decoded = Buffer.from(uiMetadataMatch[1], 'base64').toString('utf-8');
                  collectedUIData = JSON.parse(decoded);
                  console.log('[OrchestratedChatFlow] ✅ Extracted UI data:', collectedUIData);
                  break;
                } catch (e) {
                  console.error('[OrchestratedChatFlow] Failed to parse UI_METADATA:', e);
                }
              }
            }
          }

          // Store context asynchronously
          if (input.userId && input.sessionId) {
            this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResults).catch(console.error);
          }

          // 4. Synthesize
          controller.enqueue(formatData({ type: 'status', content: '✍️ Synthesizing response...' }));

          // Clear keep-alive before streaming text to avoid interleaving issues
          clearInterval(keepAliveInterval);

          const result = streamText({
            model: google('gemini-3-flash'),
            system: this.buildSystemPrompt(input, context, false),
            prompt: this.buildSynthesisPrompt(input.message, toolResults),
          });

          // Pipe the text stream to our controller
          // result.toDataStream() returns a stream of formatted chunks (0:"text", etc.)
          const reader = result.toDataStream().getReader();

          // Track accumulated text to detect empty responses
          let accumulatedText = '';
          const hasSuccessfulTools = Object.values(toolResults).some(
            (result: any) => result && result.success !== false && !result.isSystemError
          );

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Track text chunks (format: 0:"text content")
            const textChunk = value.toString();
            if (textChunk.startsWith('0:')) {
              try {
                const parsed = JSON.parse(textChunk.substring(2));
                accumulatedText += parsed;
              } catch (e) {
                // Ignore parse errors
              }
            }

            controller.enqueue(value);
          }



          // Send UI data as a hidden HTML comment at the end of the message
          // This ensures it travels with the text and is persisted in history
          if (collectedUIData) {
            console.log('[OrchestratedChatFlow] 📤 Embedding UI data in message content');
            const base64Data = Buffer.from(JSON.stringify(collectedUIData)).toString('base64');
            const hiddenBlock = `\n\n<!-- UI_DATA_START:${base64Data}:UI_DATA_END -->`;

            // CRITICAL: Must format as Vercel AI SDK text chunk (0:"text")
            // Otherwise it breaks the stream parsing
            controller.enqueue(encoder.encode(`0:${JSON.stringify(hiddenBlock)}\n`));
          }

          controller.close();

          // Safety timeout
          const safetyTimeout = setTimeout(() => {
            console.warn('[OrchestratedChatFlow] ⚠️ Stream safety timeout reached. Closing controller.');
            try { controller.close(); } catch (e) { }
          }, 60000);

        } catch (error) {
          clearInterval(keepAliveInterval);
          console.error('[OrchestratedChatFlow] Stream Error:', error);
          controller.enqueue(formatError(error instanceof Error ? error.message : 'An error occurred'));
          controller.close();
        } finally {
          console.log('[OrchestratedChatFlow] 🏁 Stream controller closed.');
        }
      }
    });
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
      - Write a creative, engaging response (a paragraph or more is fine - be thorough and helpful)
      - DO NOT describe what's in the data - the user can SEE it
      - BE CREATIVE! Vary your responses each time:
        * Use different greetings (Awesome! / Voilà! / Ta-da! / Here you go! / Done!)
        * Add relevant emojis sparingly (🎉 🍳 🥗 ✨)
        * Occasionally add a fun food fact or tip
        * Sometimes ask a follow-up question ("Want me to adjust anything?")
        * Provide helpful context, tips, or suggestions related to what was generated
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
- analyzePantryImage: Analyze an image of a fridge/pantry for ingredients (Requires imageUrl)
- planFromInventory: Plan meals based on available ingredients
- generatePrepTimeline: Create a meal prep schedule

CRITICAL ORCHESTRATION RULES:
1. **VISION CAPABILITIES**:
   - If the user message contains "[IMAGE_CONTEXT]: https://...", you MUST call the "analyzePantryImage" tool.
   - Extract the URL from the message and pass it as the "imageUrl" argument.
   - Do NOT try to analyze it yourself - use the tool.

2. **Meal Planning Flow**:
   - ALWAYS start by checking/fetching user preferences if not provided.
   - Then generate the meal plan.
   - AFTER generating the plan, you can offer to generate a grocery list or analyze nutrition.
   
3. **Grocery Flow**:
   - Generate the list first using "generateGroceryList".
   - THEN offer to optimize it using "optimizeGroceryList" (especially if user mentions specific stores or saving money).

4. **Recipe Flow**:
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
