/**
 * @fileOverview
 * Reliable Tool Caller - Deterministic tool calling system for smooth conversation flow
 * 
 * This system ensures:
 * - Tool calls are always reliable and deterministic
 * - Conversation flows smoothly without interruptions
 * - Tool failures don't break the conversation
 * - Natural responses that feel like Perplexity AI
 */

import { OrchestrationContext } from './tool-orchestrator';

// ============================================================================
// TYPES
// ============================================================================

export type ToolCallDecision = {
  shouldCallTool: boolean;
  toolName: string | null;
  toolInput: any;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
};

export type ConversationFlow = {
  mode: 'tool' | 'chat';
  toolCall?: ToolCallDecision;
  naturalResponse?: string;
  shouldContinue: boolean;
};

// ============================================================================
// TOOL CALL DETECTOR
// ============================================================================

/**
 * Deterministic tool call detection
 * Pre-flight checks to ensure tools are called reliably
 */
export class ReliableToolCaller {
  /**
   * Determine if a tool should be called based on user message
   * This is deterministic and runs BEFORE the AI processes the message
   */
  static detectToolCall(
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): ToolCallDecision {
    const messageLower = userMessage.toLowerCase().trim();
    
    // Priority 1: Grocery List Requests (highest priority)
    const groceryListDecision = this.detectGroceryListRequest(messageLower, conversationHistory, context);
    if (groceryListDecision.shouldCallTool) {
      return groceryListDecision;
    }
    
    // Priority 2: Meal Plan Requests
    const mealPlanDecision = this.detectMealPlanRequest(messageLower, conversationHistory, context);
    if (mealPlanDecision.shouldCallTool) {
      return mealPlanDecision;
    }
    
    // Priority 3: Save Meal Plan Requests
    const saveMealPlanDecision = this.detectSaveMealPlanRequest(messageLower, conversationHistory, context);
    if (saveMealPlanDecision.shouldCallTool) {
      return saveMealPlanDecision;
    }
    
    // No tool call needed - use chat mode
    return {
      shouldCallTool: false,
      toolName: null,
      toolInput: {},
      confidence: 'high',
      reason: 'User message does not require a tool call - use chat mode',
    };
  }

  /**
   * Detect grocery list requests with high confidence
   */
  private static detectGroceryListRequest(
    messageLower: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): ToolCallDecision {
    // High confidence patterns
    const highConfidencePatterns = [
      /^(create|generate|make|get|show|give|can.*i.*get|i.*want|i.*need).*grocery.*list/i,
      /grocery.*list.*for.*(this|that|the|it|meal|plan|mealplan|my|your)/i,
      /shopping.*list.*for.*(this|that|the|it|meal|plan)/i,
      /what.*do.*i.*need.*to.*buy|what.*ingredients.*do.*i.*need|what.*should.*i.*buy/i,
      /create.*grocery.*list.*for.*this.*mealplan/i,
    ];

    // Medium confidence patterns
    const mediumConfidencePatterns = [
      /grocery.*list|shopping.*list|ingredients.*list/i,
      /list.*for.*(meal|this|that|the|it)/i,
    ];

    // Check high confidence first
    for (const pattern of highConfidencePatterns) {
      if (pattern.test(messageLower)) {
        // Check if meal plan exists in context
        const hasMealPlan = this.hasMealPlanInContext(conversationHistory, context);
        
        return {
          shouldCallTool: true,
          toolName: 'generate_grocery_list',
          toolInput: { mealPlan: {} }, // System will extract from context
          confidence: hasMealPlan ? 'high' : 'medium',
          reason: hasMealPlan 
            ? 'Grocery list request detected with meal plan available'
            : 'Grocery list request detected but meal plan may be missing',
        };
      }
    }

    // Check medium confidence
    for (const pattern of mediumConfidencePatterns) {
      if (pattern.test(messageLower)) {
        const hasMealPlan = this.hasMealPlanInContext(conversationHistory, context);
        
        return {
          shouldCallTool: hasMealPlan, // Only call if meal plan exists
          toolName: hasMealPlan ? 'generate_grocery_list' : null,
          toolInput: { mealPlan: {} },
          confidence: 'medium',
          reason: hasMealPlan 
            ? 'Possible grocery list request with meal plan available'
            : 'Possible grocery list request but no meal plan found',
        };
      }
    }

    // Check for short affirmatives after grocery list question
    const isShortAffirmative = /^(yes|yeah|yep|ok|okay|sure|go|do it)$/i.test(messageLower);
    if (isShortAffirmative) {
      const lastAssistantMessage = conversationHistory
        .filter(m => m.role === 'assistant')
        .slice(-1)[0];
      
      if (lastAssistantMessage && /grocery.*list|shopping.*list/i.test(lastAssistantMessage.content.toLowerCase())) {
        const hasMealPlan = this.hasMealPlanInContext(conversationHistory, context);
        return {
          shouldCallTool: hasMealPlan,
          toolName: hasMealPlan ? 'generate_grocery_list' : null,
          toolInput: { mealPlan: {} },
          confidence: hasMealPlan ? 'high' : 'low',
          reason: 'User confirmed grocery list request',
        };
      }
    }

    return {
      shouldCallTool: false,
      toolName: null,
      toolInput: {},
      confidence: 'high',
      reason: 'No grocery list request detected',
    };
  }

  /**
   * Detect meal plan requests with high confidence
   */
  private static detectMealPlanRequest(
    messageLower: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): ToolCallDecision {
    // Skip if grocery list is mentioned (grocery list takes priority)
    if (/grocery.*list|shopping.*list/i.test(messageLower)) {
      return {
        shouldCallTool: false,
        toolName: null,
        toolInput: {},
        confidence: 'high',
        reason: 'Grocery list mentioned - not a meal plan request',
      };
    }

    // High confidence patterns
    const highConfidencePatterns = [
      /^(create|generate|make|plan|get|give).*meal.*plan/i,
      /meal.*plan.*for.*(\d+|one|two|three|four|five|six|seven)/i,
      /(\d+|one|two|three|four|five|six|seven).*day.*meal.*plan/i,
      /create.*plan.*(\d+|one|two|three|four|five|six|seven).*day/i,
    ];

    // Medium confidence patterns
    const mediumConfidencePatterns = [
      /meal.*plan|plan.*meal|mealplan/i,
      /(\d+|one|two|three|four|five|six|seven).*day/i,
      /(\d+)\s*meal/i,
    ];

    // Check high confidence first
    for (const pattern of highConfidencePatterns) {
      if (pattern.test(messageLower)) {
        const params = this.extractMealPlanParams(messageLower, conversationHistory);
        return {
          shouldCallTool: true,
          toolName: 'generate_meal_plan',
          toolInput: params,
          confidence: 'high',
          reason: 'Explicit meal plan request detected',
        };
      }
    }

    // Check medium confidence
    for (const pattern of mediumConfidencePatterns) {
      if (pattern.test(messageLower)) {
        const params = this.extractMealPlanParams(messageLower, conversationHistory);
        return {
          shouldCallTool: true,
          toolName: 'generate_meal_plan',
          toolInput: params,
          confidence: 'medium',
          reason: 'Possible meal plan request detected',
        };
      }
    }

    // Check for short affirmatives after meal plan question
    const isShortAffirmative = /^(yes|yeah|yep|ok|okay|sure|go|do it|generate|create|plan)$/i.test(messageLower);
    if (isShortAffirmative) {
      const lastAssistantMessage = conversationHistory
        .filter(m => m.role === 'assistant')
        .slice(-1)[0];
      
      if (lastAssistantMessage && /meal.*plan|generate.*plan|create.*plan/i.test(lastAssistantMessage.content.toLowerCase())) {
        const params = this.extractMealPlanParams(messageLower, conversationHistory);
        return {
          shouldCallTool: true,
          toolName: 'generate_meal_plan',
          toolInput: params,
          confidence: 'high',
          reason: 'User confirmed meal plan request',
        };
      }
    }

    return {
      shouldCallTool: false,
      toolName: null,
      toolInput: {},
      confidence: 'high',
      reason: 'No meal plan request detected',
    };
  }

  /**
   * Detect save meal plan requests
   */
  private static detectSaveMealPlanRequest(
    messageLower: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): ToolCallDecision {
    const savePatterns = [
      /^(save|store|keep).*meal.*plan/i,
      /save.*this.*meal.*plan/i,
      /save.*the.*plan/i,
    ];

    for (const pattern of savePatterns) {
      if (pattern.test(messageLower)) {
        // Check if meal plan exists in context
        const mealPlan = this.extractMealPlanFromContext(conversationHistory, context);
        if (mealPlan) {
          return {
            shouldCallTool: true,
            toolName: 'save_meal_plan',
            toolInput: mealPlan,
            confidence: 'high',
            reason: 'Save meal plan request with meal plan available',
          };
        }
      }
    }

    return {
      shouldCallTool: false,
      toolName: null,
      toolInput: {},
      confidence: 'high',
      reason: 'No save meal plan request detected',
    };
  }

  /**
   * Check if meal plan exists in conversation context
   */
  private static hasMealPlanInContext(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): boolean {
    // Check previous results
    if (context.previousResults?.generateMealPlan) {
      return true;
    }

    // Check conversation history for UI_METADATA
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
        try {
          const matches = msg.content.matchAll(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/g);
          for (const match of matches) {
            try {
              const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
              const uiMetadata = JSON.parse(decoded);
              if (uiMetadata.mealPlan) {
                return true;
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

    return false;
  }

  /**
   * Extract meal plan from context
   */
  private static extractMealPlanFromContext(
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    context: OrchestrationContext
  ): any {
    // Check previous results first
    if (context.previousResults?.generateMealPlan?.mealPlan) {
      return context.previousResults.generateMealPlan.mealPlan;
    }

    // Check conversation history
    for (let i = conversationHistory.length - 1; i >= 0; i--) {
      const msg = conversationHistory[i];
      if (msg.role === 'assistant' && msg.content.includes('[UI_METADATA:')) {
        try {
          const matches = msg.content.matchAll(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/g);
          for (const match of matches) {
            try {
              const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
              const uiMetadata = JSON.parse(decoded);
              if (uiMetadata.mealPlan) {
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
  }

  /**
   * Extract meal plan parameters from message
   */
  private static extractMealPlanParams(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ): { duration: number; mealsPerDay: number } {
    // Extract duration
    const durationPatterns = [
      /(\d+)\s*day/i,
      /(one|two|three|four|five|six|seven)\s*day/i,
    ];

    let duration = 1; // Default
    for (const pattern of durationPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1].match(/\d+/)) {
          duration = parseInt(match[1], 10);
        } else {
          const wordToNum: Record<string, number> = {
            one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
          };
          duration = wordToNum[match[1].toLowerCase()] || 1;
        }
        break;
      }
    }

    // Extract meals per day
    const mealsPatterns = [
      /(\d+)\s*meal/i,
      /(one|two|three|four|five)\s*meal/i,
    ];

    let mealsPerDay = 3; // Default
    for (const pattern of mealsPatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1].match(/\d+/)) {
          mealsPerDay = parseInt(match[1], 10);
        } else {
          const wordToNum: Record<string, number> = {
            one: 1, two: 2, three: 3, four: 4, five: 5,
          };
          mealsPerDay = wordToNum[match[1].toLowerCase()] || 3;
        }
        break;
      }
    }

    return { duration, mealsPerDay };
  }
}

// ============================================================================
// CONVERSATION FLOW MANAGER
// ============================================================================

/**
 * Manages conversation flow to ensure smooth, Perplexity-like experience
 */
export class ConversationFlowManager {
  /**
   * Determine conversation flow based on tool call decision
   */
  static determineFlow(
    toolDecision: ToolCallDecision,
    context: OrchestrationContext
  ): ConversationFlow {
    if (toolDecision.shouldCallTool && toolDecision.confidence === 'high') {
      return {
        mode: 'tool',
        toolCall: toolDecision,
        shouldContinue: true,
      };
    }

    // Medium confidence - let AI decide but provide guidance
    if (toolDecision.shouldCallTool && toolDecision.confidence === 'medium') {
      return {
        mode: 'tool',
        toolCall: toolDecision,
        shouldContinue: true,
      };
    }

    // Low confidence or no tool - use chat mode
    return {
      mode: 'chat',
      shouldContinue: true,
    };
  }

  /**
   * Handle tool failure gracefully without breaking conversation
   */
  static handleToolFailure(
    toolName: string,
    error: Error,
    context: OrchestrationContext
  ): ConversationFlow {
    // Generate a natural response that doesn't break the flow
    const errorMessages: Record<string, string> = {
      'generate_meal_plan': "I'm having trouble generating your meal plan right now. Could you try again, or would you like me to suggest some meal ideas instead?",
      'generate_grocery_list': "I couldn't generate the grocery list at the moment. If you have a meal plan, I can try again, or we can discuss the ingredients you'll need.",
      'save_meal_plan': "I wasn't able to save your meal plan right now. Don't worry - you can try saving it again later.",
    };

    return {
      mode: 'chat',
      naturalResponse: errorMessages[toolName] || "I encountered an issue, but we can continue. How else can I help?",
      shouldContinue: true,
    };
  }
}

