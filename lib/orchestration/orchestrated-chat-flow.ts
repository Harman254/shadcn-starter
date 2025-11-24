/**
 * @fileOverview
 * Main Orchestrated Chat Flow
 * Integrates all components: orchestrator, tools, state management, response generation
 * This is the main entry point for the Perplexity-like chat experience
 */

import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from './ai-tools';
import { z } from 'zod';

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

  constructor() { }

  /**
   * Process user message and orchestrate tool calls
   */
  async processMessage(input: OrchestratedChatInput): Promise<OrchestratedChatOutput> {
    try {
      // Prepare system prompt with context
      const systemPrompt = `
You are an expert AI assistant for a meal planning application.
Your goal is to help users plan meals, analyze nutrition, check grocery prices, and generate grocery lists.

User Preferences: ${JSON.stringify(input.userPreferences || {})}
Location Data: ${JSON.stringify(input.locationData || {})}

You have access to the following tools:
- generateMealPlan: Create a meal plan.
- analyzeNutrition: Analyze nutrition for a meal plan (requires mealPlanId).
- getGroceryPricing: Get pricing for a meal plan (requires mealPlanId).
- generateGroceryList: Create a grocery list (requires mealPlanId).

Rules:
1. ALWAYS use the provided tools when the user asks for these specific tasks.
2. If you generate a meal plan, the tool will return a 'mealPlan' object. You MUST refer to its ID for subsequent tool calls.
3. Be helpful and concise in your natural language responses.
4. If a tool fails, explain the error to the user and suggest a fix.
`;

      // Convert history to Vercel AI SDK format
      const messages = [
        ...input.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: input.message }
      ];

      // Call the model with tools
      const { text, toolResults, steps } = await generateText({
        model: google('gemini-2.0-flash-001'), // Ensure this model name is correct for the provider
        system: systemPrompt,
        messages: messages as any, // Type cast to avoid strict type issues with 'user' | 'assistant' vs 'system' | 'user' | 'assistant' | 'data'
        tools: tools,
        maxSteps: 5, // Allow multi-step orchestration
      });

      // Extract structured data from tool results
      // We iterate through steps to find the latest relevant data
      let structuredData: any = {};
      let aggregatedToolResults: Record<string, any> = {};

      if (toolResults && toolResults.length > 0) {
        toolResults.forEach(tr => {
          aggregatedToolResults[tr.toolName] = tr.result;

          // Populate structuredData based on tool type
          if (tr.toolName === 'generateMealPlan' && tr.result.success) {
            structuredData.mealPlan = (tr.result as any).mealPlan;
          }
          if (tr.toolName === 'generateGroceryList' && tr.result.success) {
            structuredData.groceryList = (tr.result as any).groceryList;
          }
          if (tr.toolName === 'getGroceryPricing' && tr.result.success) {
            structuredData.prices = (tr.result as any).prices;
          }
          if (tr.toolName === 'analyzeNutrition' && tr.result.success) {
            structuredData.nutrition = (tr.result as any).totalNutrition;
          }
        });
      }

      return {
        response: text,
        structuredData,
        suggestions: [], // We could ask the model to generate these too
        toolResults: aggregatedToolResults,
        confidence: 'high',
      };

    } catch (error) {
      console.error('[OrchestratedChatFlow] Error:', error);
      return {
        response: "I'm sorry, I encountered an error while processing your request.",
        confidence: 'low',
      };
    }
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


