/**
 * @fileOverview
 * Main Orchestrated Chat Flow
 * Integrates all components: orchestrator, tools, state management, response generation
 * This is the main entry point for the Perplexity-like chat experience
 */

import { getOrchestrator, OrchestrationContext } from './tool-orchestrator';
import { mealPlanningTools } from './tools/meal-planning-tools';
import { getChatStateManager } from './enhanced-chat-state';
import { getResponseGenerator, ResponseContext } from './response-generator';
import { getCacheManager } from './cache-manager';

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
}

// ============================================================================
// ORCHESTRATED CHAT FLOW
// ============================================================================

export class OrchestratedChatFlow {
  private orchestrator = getOrchestrator();
  private stateManager = getChatStateManager();
  private responseGenerator = getResponseGenerator();
  private cache = getCacheManager();

  constructor() {
    // Register all tools
    this.orchestrator.registerTools(mealPlanningTools);
  }

  /**
   * Process user message and orchestrate tool calls
   */
  async processMessage(input: OrchestratedChatInput): Promise<OrchestratedChatOutput> {
    // Determine which tools to call based on user intent
    const toolCalls = this.determineToolCalls(input);

    if (toolCalls.length === 0) {
      // No tools needed - direct chat response
      return {
        response: await this.generateDirectResponse(input),
        confidence: 'high',
      };
    }

    // Build orchestration context
    const context: OrchestrationContext = {
      userId: input.userId,
      sessionId: input.sessionId,
      conversationHistory: input.conversationHistory,
      userPreferences: input.userPreferences,
      locationData: input.locationData,
      previousResults: this.stateManager.getState().conversationContext,
    };

    // Execute tools
    const orchestrationResult = await this.orchestrator.executeTools(toolCalls, context);

    // Update state with results
    this.updateStateFromResults(orchestrationResult.results);

    // Generate response
    const responseContext: ResponseContext = {
      userMessage: input.message,
      conversationHistory: input.conversationHistory,
      userPreferences: input.userPreferences,
    };

    const generatedResponse = await this.responseGenerator.generateResponse(
      orchestrationResult,
      responseContext
    );

    // Save snapshot
    this.stateManager.saveSnapshot(input.conversationHistory);

    return {
      response: generatedResponse.text,
      structuredData: generatedResponse.structuredData,
      suggestions: generatedResponse.suggestions,
      toolResults: orchestrationResult.results,
      confidence: generatedResponse.confidence,
    };
  }

  /**
   * Determine which tools to call based on user message
   */
  private determineToolCalls(input: OrchestratedChatInput): Array<{ toolName: string; input: any }> {
    const message = input.message.toLowerCase();
    const toolCalls: Array<{ toolName: string; input: any }> = [];

    // Check for meal plan request
    if (
      /meal.*plan|plan.*meal|generate.*meal|create.*meal.*plan/i.test(input.message) ||
      /(\d+)\s*(?:day|days?)/i.test(input.message)
    ) {
      const duration = this.extractDuration(input.message);
      const mealsPerDay = this.extractMealsPerDay(input.message);

      toolCalls.push({
        toolName: 'generateMealPlan',
        input: {
          duration,
          mealsPerDay,
          preferences: input.userPreferences,
        },
      });

      // If user also asks for nutrition or pricing, add those tools
      if (/nutrition|calories|protein|carbs/i.test(message)) {
        toolCalls.push({
          toolName: 'analyzeNutrition',
          input: {}, // Will use meal plan from previous tool
        });
      }

      if (/price|cost|grocery|shopping/i.test(message)) {
        toolCalls.push({
          toolName: 'getGroceryPricing',
          input: {}, // Will use meal plan from previous tool
        });
      }

      if (/grocery.*list|shopping.*list/i.test(message)) {
        toolCalls.push({
          toolName: 'generateGroceryList',
          input: {}, // Will use meal plan from previous tool
        });
      }
    } else if (/grocery.*list|shopping.*list/i.test(message)) {
      // Grocery list request (may need meal plan first)
      const state = this.stateManager.getState();
      if (state.activeMealPlan) {
        toolCalls.push({
          toolName: 'generateGroceryList',
          input: {
            mealPlan: state.activeMealPlan,
          },
        });
      }
    }

    return toolCalls;
  }

  /**
   * Extract duration from message
   */
  private extractDuration(message: string): number {
    const match = message.match(/(\d+)\s*(?:day|days?)/i);
    return match ? parseInt(match[1], 10) : 1;
  }

  /**
   * Extract meals per day from message
   */
  private extractMealsPerDay(message: string): number {
    const match = message.match(/(\d+)\s*(?:meal|meals?)/i);
    return match ? parseInt(match[1], 10) : 3;
  }

  /**
   * Generate direct response when no tools are needed
   */
  private async generateDirectResponse(input: OrchestratedChatInput): Promise<string> {
    // For now, return a simple response
    // In production, you'd call your AI model here
    return "I'm here to help with your meal planning needs. Would you like me to generate a meal plan, analyze nutrition, or create a grocery list?";
  }

  /**
   * Update state from tool results
   */
  private updateStateFromResults(results: Record<string, any>): void {
    if (results.generateMealPlan?.mealPlan) {
      this.stateManager.setActiveMealPlan(results.generateMealPlan.mealPlan);
    }

    if (results.generateGroceryList?.groceryList) {
      this.stateManager.setActiveGroceryList(results.generateGroceryList.groceryList);
    }

    // Update conversation context
    this.stateManager.updateState({
      conversationContext: {
        ...this.stateManager.getState().conversationContext,
        ...results,
      },
    });
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


