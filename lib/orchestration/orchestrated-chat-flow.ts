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
        model: google('gemini-2.0-flash-exp'),
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
        }, 2000);

        try {
          // 1. Initial Status
          controller.enqueue(formatData({ type: 'status', content: '🤔 Analyzing your request...' }));

          // Load context and preferences in parallel
          const [context, resolvedPreferences, resolvedLocation] = await Promise.all([
            this.contextManager.getContext(input.userId, input.sessionId),
            Promise.resolve(input.userPreferences),
            Promise.resolve(input.locationData)
          ]);

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
            model: google('gemini-2.0-flash-exp'),
            system: this.buildSystemPrompt(input, context, false),
            prompt: this.buildSynthesisPrompt(input.message, toolResults),
          });

          // Pipe the text stream to our controller
          // result.toDataStream() returns a stream of formatted chunks (0:"text", etc.)
          const reader = result.toDataStream().getReader();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
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

        } catch (error) {
          clearInterval(keepAliveInterval);
          console.error('[OrchestratedChatFlow] Stream Error:', error);
          controller.enqueue(formatError(error instanceof Error ? error.message : 'An error occurred'));
          controller.close();
        }
      }
    });
  }

  private buildSynthesisPrompt(userMessage: string, toolResults: Record<string, any>): string {
    // Extract clean messages without UI_METADATA
    const toolMessages = Object.entries(toolResults)
      .map(([tool, result]) => {
        if (result) {
          if (result.status === 'error') {
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

    return `
      USER MESSAGE: "${userMessage}"
      
      TOOL EXECUTION SUMMARY:
      ${hasResults ? toolMessages.join('\n') : 'No tools were executed.'}
      
      CRITICAL INSTRUCTIONS:
      ${hasResults ? `
      - The UI is ALREADY showing the full data (meal plan cards, grocery lists, etc.)
      - Your job is to write a SHORT, friendly acknowledgment (1-2 sentences MAX)
      - DO NOT describe what's in the meal plan - the user can see it in the UI
      - DO NOT list meals, ingredients, or prices - they're already displayed
      - Just say something like "I've created your meal plan! Enjoy!" or "Here's your grocery list!"
      - If there are ERRORS in the summary, apologize specifically for that part (e.g. "I couldn't get the prices, but here is the plan.")
      - Keep it enthusiastic but VERY brief
      ` : `
      - No tools were executed. This means the user likely asked a general question or just said hello.
      - Answer the user's question directly and helpfully.
      - Be conversational, friendly, and engaging.
      - If they asked about the app's capabilities, explain that you can help with meal planning, grocery lists, and nutrition.
      - Do NOT apologize unless there was an actual error.
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
    const basePrompt = `You are an expert AI assistant for a meal planning application.
Your goal is to help users plan meals, analyze nutrition, check grocery prices, and generate grocery lists.

CRITICAL RULE: When users request specific actions, you MUST use the corresponding tools. DO NOT just describe what you would do - actually call the tool.`;

    const contextInfo = `
CURRENT CONTEXT:
- User Preferences: ${JSON.stringify(input.userPreferences || {})}
- Location: ${JSON.stringify(input.locationData || {})}
${context?.mealPlanId ? `- Previous Meal Plan ID: ${context.mealPlanId} (USE THIS for follow-up requests!)` : '- No active meal plan'}
${context?.groceryListId ? `- Previous Grocery List ID: ${context.groceryListId}` : ''}`;

    return `${basePrompt}

${contextInfo}

AVAILABLE TOOLS:
- generateMealPlan: Create a meal plan (parameters: duration, mealsPerDay, preferences)
- analyzeNutrition: Analyze nutrition for a meal plan (requires: mealPlanId)
- getGroceryPricing: Get pricing for a meal plan (requires: mealPlanId)
- generateGroceryList: Create a grocery list (requires: mealPlanId)

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
