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
  userPreferences?: any;
  locationData?: any;
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
  async processMessageStream(input: OrchestratedChatInput, data: StreamData) {
    try {
      const context = await this.contextManager.getContext(input.userId, input.sessionId);

      // 1. Plan
      data.append({ type: 'status', content: '🤔 Analyzing your request...' });
      const plan = await this.reasoningEngine.generatePlan(input.message, {
        ...context,
        userPreferences: input.userPreferences,
        location: input.locationData
      }, tools);

      data.append({ type: 'plan', content: plan as any });

      // 2. Execute
      const toolResults = await this.toolExecutor.executePlan(plan,
        (step) => {
          data.append({ type: 'status', content: `⚙️ Executing step: ${step.description}` });
        },
        (toolName) => {
          // Optional: finer grained updates
        },
        (result) => {
          if (result.status === 'success') {
            // We could stream intermediate results here if needed
          }
        }
      );

      // Store context
      if (input.userId && input.sessionId) {
        // We do this asynchronously to not block the stream start
        this.contextManager.extractAndStoreEntities(input.userId, input.sessionId, toolResults).catch(console.error);
      }

      // 3. Synthesize
      data.append({ type: 'status', content: '✍️ Synthesizing response...' });

      const result = streamText({
        model: google('gemini-2.0-flash-exp'),
        system: this.buildSystemPrompt(input, context, false),
        prompt: this.buildSynthesisPrompt(input.message, toolResults),
        onFinish: () => {
          data.close();
        }
      });

      return result;

    } catch (error) {
      console.error('[OrchestratedChatFlow] Stream Error:', error);
      data.append({ type: 'error', content: 'An error occurred during processing.' });
      data.close();
      throw error;
    }
  }

  private buildSynthesisPrompt(userMessage: string, toolResults: Record<string, any>): string {
    return `
      USER MESSAGE: "${userMessage}"
      
      TOOL RESULTS:
      ${JSON.stringify(toolResults, null, 2)}
      
      INSTRUCTIONS:
      - Synthesize a helpful, natural language response based on the tool results.
      - If a meal plan was generated, summarize it enthusiastically.
      - If a grocery list was generated, mention the total cost and store count.
      - If nutrition was analyzed, give the key stats.
      - Be concise but friendly.
      - Use markdown for formatting.
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
