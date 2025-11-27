/**
 * @fileOverview
 * Main Orchestrated Chat Flow with Robust Tool Execution
 * Features: Intent validation, retry logic, context tracking, comprehensive logging
 */

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from './ai-tools';
import { getIntentValidator } from './intent-validator';
import { getLogger } from './tool-execution-logger';
import { getContextManager } from './conversation-context';

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

  constructor() { }

  /**
   * Process user message with multi-phase orchestration
   */
  async processMessage(input: OrchestratedChatInput): Promise<OrchestratedChatOutput> {
    const startTime = Date.now();

    try {
      // Phase 1: Analyze Intent
      const context = await this.contextManager.getContext(input.userId, input.sessionId);
      const intentAnalysis = this.validator.analyzeIntent(input.message, {
        hasMealPlanId: !!context?.mealPlanId,
      });

      this.logger.log('info', 'Intent analysis', {
        intent: intentAnalysis.intent,
        confidence: intentAnalysis.confidence,
        expectedTools: intentAnalysis.expectedTools,
        contextAvailable: !!context,
      });

      // LAYER 4: PRE-VALIDATION
      // Check if we have the required context for the detected intent
      if (intentAnalysis.contextNeeded && intentAnalysis.contextNeeded.length > 0) {
        const missingContext = intentAnalysis.contextNeeded.filter(key => {
          if (key === 'mealPlanId') return !context?.mealPlanId;
          return false;
        });

        if (missingContext.length > 0) {
          this.logger.log('warn', 'Blocked due to missing context', { missingContext });

          // Return early with guidance - do not call AI
          return {
            response: this.buildContextMissingResponse(intentAnalysis.intent),
            confidence: 'high',
            structuredData: {
              requiresAction: true,
              missingContext: missingContext[0],
              suggestedAction: 'CREATE_MEAL_PLAN',
            },
            debug: {
              intent: intentAnalysis.intent,
              validationPassed: false,
            }
          };
        }
      }

      // Phase 2: Initial AI Call
      const initialResult = await this.executeAICall(input, context, false);

      // Phase 3: Validation
      const actualTools = initialResult.toolResults
        ? Object.keys(initialResult.toolResults)
        : [];

      const validation = this.validator.validateToolExecution(
        intentAnalysis.expectedTools,
        actualTools
      );

      this.logger.logValidation({
        timestamp: new Date(),
        userMessage: input.message,
        expectedTools: intentAnalysis.expectedTools,
        actualTools,
        passed: validation.passed,
        reason: validation.reason,
      });

      // Phase 4: Retry if needed
      let finalResult = initialResult;
      let retried = false;

      if (this.validator.shouldRetry(validation, intentAnalysis.confidence)) {
        this.logger.logRetry({
          timestamp: new Date(),
          reason: validation.reason || 'Tools not called',
          attempt: 1,
          toolsExpected: intentAnalysis.expectedTools,
        });

        retried = true;
        finalResult = await this.executeAICall(input, context, true, intentAnalysis.expectedTools);
      }

      // Store context if we have userId and sessionId
      if (input.userId && input.sessionId && finalResult.toolResults) {
        await this.contextManager.extractAndStoreEntities(
          input.userId,
          input.sessionId,
          finalResult.toolResults
        );
      }

      const duration = Date.now() - startTime;
      this.logger.log('info', 'Orchestration complete', {
        duration: `${duration}ms`,
        toolsCalled: actualTools.length,
        retried,
        validationPassed: validation.passed,
      });

      return {
        ...finalResult,
        debug: {
          intent: intentAnalysis.intent,
          retried,
          validationPassed: validation.passed,
        },
      };
    } catch (error) {
      this.logger.log('error', 'Orchestration failed', { error });
      console.error('[OrchestratedChatFlow] Error:', error);

      return {
        response: "I'm sorry, I encountered an error while processing your request. Please try again.",
        confidence: 'low',
      };
    }
  }

  /**
   * Build response when required context is missing
   */
  private buildContextMissingResponse(intent: string): string {
    switch (intent) {
      case 'GROCERY_LIST_REQUIRED':
        return "I'd love to help you with a grocery list! However, I need a meal plan first to know what ingredients to include. Would you like me to create a meal plan for you?";
      case 'NUTRITION_ANALYSIS_REQUIRED':
        return "I can analyze nutrition for you, but I need a meal plan first. Would you like to create a meal plan?";
      case 'PRICING_REQUIRED':
        return "I can check grocery prices, but I need a meal plan first to know what to price. Shall we create a meal plan?";
      default:
        return "I need more information to complete this request. It seems I'm missing some context.";
    }
  }

  /**
   * Execute AI call with tools
   */
  private async executeAICall(
    input: OrchestratedChatInput,
    context: any,
    isRetry: boolean,
    forcedTools?: string[]
  ): Promise<OrchestratedChatOutput> {
    const systemPrompt = this.buildSystemPrompt(input, context, isRetry, forcedTools);

    const messages = [
      ...input.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: input.message }
    ];

    const startTime = Date.now();

    try {
      const { text, toolResults } = await generateText({
        model: google('gemini-2.0-flash-exp'),
        system: systemPrompt,
        messages: messages as any,
        tools: tools,
        maxSteps: 5,
      });

      const duration = Date.now() - startTime;

      // Log each tool execution
      if (toolResults) {
        toolResults.forEach(tr => {
          this.logger.logToolExecution({
            timestamp: new Date(),
            toolName: tr.toolName,
            input: tr.args,
            output: tr.result,
            success: tr.result?.success !== false,
            duration,
          });
        });
      }

      // Extract structured data
      let structuredData: any = {};
      let aggregatedToolResults: Record<string, any> = {};

      if (toolResults && toolResults.length > 0) {
        toolResults.forEach(tr => {
          aggregatedToolResults[tr.toolName] = tr.result;

          if (tr.toolName === 'generateMealPlan' && tr.result.success) {
            structuredData.mealPlan = tr.result.mealPlan;
          }
          if (tr.toolName === 'generateGroceryList' && tr.result.success) {
            structuredData.groceryList = tr.result.groceryList;
          }
          if (tr.toolName === 'getGroceryPricing' && tr.result.success) {
            structuredData.prices = tr.result.prices;
          }
          if (tr.toolName === 'analyzeNutrition' && tr.result.success) {
            structuredData.nutrition = tr.result.totalNutrition;
          }
        });
      }

      return {
        response: text,
        structuredData,
        suggestions: [],
        toolResults: aggregatedToolResults,
        confidence: 'high',
      };
    } catch (error) {
      this.logger.log('error', 'AI call failed', { error, isRetry });
      throw error;
    }
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

    const examples = `
EXAMPLES OF CORRECT BEHAVIOR:

User: "Plan a 3 day keto meal"
→ YOU MUST: Call generateMealPlan(duration=3, mealsPerDay=3)
→ WRONG: Responding "I can help you plan a keto meal..." without calling the tool

User: "Give me a grocery list"
→ YOU MUST: Call generateGroceryList(mealPlanId="${context?.mealPlanId || '<from previous>'}")
→ WRONG: Listing items without using the tool

User: "How many calories?"
→ YOU MUST: Call analyzeNutrition(mealPlanId="${context?.mealPlanId || '<from previous>'}")
→ WRONG: Estimating calories without the tool`;

    const contextInfo = `
CURRENT CONTEXT:
- User Preferences: ${JSON.stringify(input.userPreferences || {})}
- Location: ${JSON.stringify(input.locationData || {})}
${context?.mealPlanId ? `- Previous Meal Plan ID: ${context.mealPlanId} (USE THIS for follow-up requests!)` : '- No active meal plan'}
${context?.groceryListId ? `- Previous Grocery List ID: ${context.groceryListId}` : ''}`;

    const criticalRules = `
🚫 CRITICAL RULES - NEVER VIOLATE THESE:

1. GROCERY LIST REQUIRES MEAL PLAN:
   ❌ WRONG: User asks "give me groceries" → You call generateMealPlan
   ✅ RIGHT: User asks "give me groceries" → You return error explaining meal plan needed first
   
2. CONTEXT-DEPENDENT TOOLS:
   - generateGroceryList: REQUIRES mealPlanId (currently: ${context?.mealPlanId || 'MISSING ❌'})
   - analyzeNutrition: REQUIRES mealPlanId (currently: ${context?.mealPlanId || 'MISSING ❌'})
   - getGroceryPricing: REQUIRES mealPlanId (currently: ${context?.mealPlanId || 'MISSING ❌'})
   
3. WHEN CONTEXT IS MISSING:
   - DO NOT attempt to generate a meal plan as a workaround
   - DO return a clear error message
   - DO guide the user to create the required context first`;

    const retryWarning = isRetry ? `
⚠️ RETRY ATTEMPT - YOU DID NOT CALL THE REQUIRED TOOLS IN YOUR PREVIOUS RESPONSE!
${forcedTools ? `YOU MUST CALL THESE TOOLS NOW: ${forcedTools.join(', ')}` : ''}
This is your last chance to use tools correctly before returning an error to the user.` : '';

    return `${basePrompt}

${criticalRules}

${examples}

${contextInfo}

${retryWarning}

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
