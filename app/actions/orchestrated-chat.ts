/**
 * @fileOverview
 * Server Action for Orchestrated Chat Flow
 * Integrates the orchestration system with Next.js server actions
 */

'use server';

import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fetchOnboardingData } from '@/data';
import { getLocationDataWithCaching } from '@/lib/location';
import type { Message } from '@/types';

export interface OrchestratedChatInput {
  message: string;
  conversationHistory: Message[];
}

export interface OrchestratedChatOutput {
  response: string;
  structuredData?: any;
  suggestions?: string[];
  toolResults?: Record<string, any>;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Process chat message with orchestration
 */
export async function processOrchestratedChat(
  input: OrchestratedChatInput
): Promise<OrchestratedChatOutput> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;
    const sessionId = session?.session?.id;

    // Fetch user preferences
    let userPreferences = null;
    if (userId) {
      try {
        const preferences = await fetchOnboardingData(userId);
        if (preferences.length > 0) {
          userPreferences = preferences[0];
        }
      } catch (error) {
        console.warn('[OrchestratedChat] Failed to fetch preferences:', error);
      }
    }

    // Fetch location data
    let locationData = null;
    if (userId && sessionId) {
      try {
        locationData = await getLocationDataWithCaching(userId, sessionId);
      } catch (error) {
        console.warn('[OrchestratedChat] Failed to fetch location:', error);
      }
    }

    // Convert messages to conversation history format
    const conversationHistory = input.conversationHistory
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Process with orchestrated chat flow
    const chatFlow = getOrchestratedChatFlow();
    const result = await chatFlow.processMessage({
      message: input.message,
      userId,
      sessionId,
      conversationHistory,
      userPreferences,
      locationData,
    });

    return result;
  } catch (error) {
    console.error('[OrchestratedChat] Error:', error);

    return {
      response: 'I encountered an error processing your request. Please try again.',
      confidence: 'low',
    };
  }
}


