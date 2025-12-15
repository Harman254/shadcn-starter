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
import prisma from '@/lib/prisma';
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
    // Convert messages to conversation history format
    const conversationHistory = input.conversationHistory
      .filter(msg => {
        // Filter out system messages or complex data types not supported by simple history
        return (msg.role === 'user' || msg.role === 'assistant');
      })
      .map(msg => {
        // If content is empty (e.g. tool call in new SDK), allow it if we could recreate tool calls
        // BUT for this simple server action flow, we just want text context.
        // If content is empty and it has toolInvocations, we should summarize it.
        let content = msg.content;

        if (!content && msg.toolInvocations && msg.toolInvocations.length > 0) {
          content = `[Tool Executed: ${msg.toolInvocations.map(t => t.toolName).join(', ')}]`;
        }

        return {
          role: msg.role as 'user' | 'assistant',
          content: content || '[Complex Content]', // Fallback to avoid empty string crash
        };
      })
      .filter(msg => msg.content && msg.content.trim() !== '');

    // Process with orchestrated chat flow
    const chatFlow = getOrchestratedChatFlow();

    console.log(`[OrchestratedChat] Processing message for User ${userId?.slice(0, 8)}...`);
    console.time('[OrchestratedChat] Processing Time');

    try {
      // 1. Persist USER message to DB (so it shows up in history)
      if (sessionId && userId) {
        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: 'user',
            content: input.message,
            // Schema check: ChatMessage has (sessionId, role, content). Session has userId.
            // ChatMessage does NOT have userId directly in schema shown in Step 641.
          }
        }).catch(e => console.error('[OrchestratedChat] Failed to save User message:', e));
      }

      const result = await chatFlow.processMessage({
        message: input.message,
        userId,
        sessionId,
        conversationHistory,
        userPreferences,
        locationData,
      });

      // 2. Persist ASSISTANT message to DB
      if (sessionId && userId) {
        // Embed UI metadata if present, so it survives page reloads
        let dbContent = result.response;
        if (result.structuredData && Object.keys(result.structuredData).length > 0) {
          try {
            const metadataStr = btoa(JSON.stringify(result.structuredData));
            dbContent += `\n<!-- UI_DATA_START:${metadataStr}:UI_DATA_END -->`;
          } catch (err) {
            console.warn('[OrchestratedChat] Failed to encode UI metadata for DB:', err);
          }
        }

        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: 'assistant',
            content: dbContent
          }
        }).catch(e => console.error('[OrchestratedChat] Failed to save Assistant message:', e));
      }

      console.timeEnd('[OrchestratedChat] Processing Time');
      console.log('[OrchestratedChat] Success. Response length:', result.response.length);

      return result;
    } catch (innerError) {
      console.error('[OrchestratedChat] Inner Process Error:', innerError);
      throw innerError;
    }
  } catch (error) {
    console.error('[OrchestratedChat] Error:', error);

    return {
      response: 'I encountered an error processing your request. Please try again.',
      confidence: 'low',
    };
  }
}



