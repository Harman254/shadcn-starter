/**
 * @fileOverview
 * Genkit Flow for Orchestrated Chat
 * Integrates the orchestration system with Genkit AI framework
 */

'use server';

import { ai } from '@/ai/instance';
import { z } from 'genkit';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';

// ============================================================================
// SCHEMAS
// ============================================================================

const OrchestratedChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  userId: z.string().optional().describe('User ID for personalization.'),
  sessionId: z.string().optional().describe('Session ID for context.'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('Conversation history for context.'),
  userPreferences: z.any().optional().describe('User dietary preferences.'),
  locationData: z
    .object({
      city: z.string(),
      country: z.string(),
      currencyCode: z.string(),
      currencySymbol: z.string(),
    })
    .optional()
    .describe('User location for pricing and store suggestions.'),
});

const OrchestratedChatOutputSchema = z.object({
  response: z.string().describe('The natural language response.'),
  structuredData: z
    .object({
      mealPlan: z.any().optional(),
      nutrition: z.any().optional(),
      prices: z.array(z.any()).optional(),
      groceryList: z.any().optional(),
    })
    .optional()
    .describe('Structured data from tool executions.'),
  suggestions: z
    .array(z.string())
    .optional()
    .describe('Suggested next actions for the user.'),
  confidence: z
    .enum(['high', 'medium', 'low'])
    .describe('Confidence level of the response.'),
});

export type OrchestratedChatInput = z.infer<typeof OrchestratedChatInputSchema>;
export type OrchestratedChatOutput = z.infer<typeof OrchestratedChatOutputSchema>;

// ============================================================================
// GENKIT FLOW
// ============================================================================

export const orchestratedChatFlow = ai.defineFlow(
  {
    name: 'orchestratedChatFlow',
    inputSchema: OrchestratedChatInputSchema,
    outputSchema: OrchestratedChatOutputSchema,
  },
  async (input) => {
    try {
      const chatFlow = getOrchestratedChatFlow();
      
      const result = await chatFlow.processMessage({
        message: input.message,
        userId: input.userId,
        sessionId: input.sessionId,
        conversationHistory: input.conversationHistory || [],
        userPreferences: input.userPreferences,
        locationData: input.locationData,
      });

      return {
        response: result.response,
        structuredData: result.structuredData,
        suggestions: result.suggestions,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('[OrchestratedChatFlow] Error:', error);
      
      return {
        response: 'I encountered an error processing your request. Please try again.',
        confidence: 'low' as const,
      };
    }
  }
);


