'use server';

import {
  chat as contextAwareChat,
  type ContextAwareChatInput,
} from '@/ai/flows/chat/context-aware';
import {
  answerQuestion,
  type AnswerQuestionInput,
} from '@/ai/flows/chat/dynamic-select-tools';
import {
  generateChatTitle,
  type GenerateChatTitleInput,
} from '@/ai/flows/chat/generate-chat-title';
import type { Message } from '@/types';
import { randomUUID } from 'crypto';

/**
 * Handles chat responses for both context-aware and tool-selection chat types.
 * This function is server-side and safely handles AI or schema failures
 * to ensure the user always gets a graceful response.
 */
export async function getResponse(
  chatType: 'context-aware' | 'tool-selection',
  messages: Message[]
): Promise<Message> {
  // 🧩 Ensure the last message exists and is from the user
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Invalid request: Last message must be from the user.');
  }

  try {
    let responseContent = '';

    if (chatType === 'context-aware') {
      // 🧠 Context-aware chat — uses FULL message history for complete context
      // Pass all previous messages (excluding the current user message) as chat history
      const chatHistory = messages.slice(0, -1).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      
      // Log context for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Context-Aware] Passing ${chatHistory.length} messages as context`);
      }
      
      const input: ContextAwareChatInput = {
        message: lastMessage.content,
        chatHistory: chatHistory, // Full conversation history for context-awareness
      };

      const result = await contextAwareChat(input);

      // ✅ Defensive handling for missing or invalid results
      responseContent =
        result?.response ??
        'Sorry, I could not generate a response at the moment.';
    } else {
      // 🧠 Tool-selection chat — uses dynamic tool AI flow
      const input: AnswerQuestionInput = {
        question: lastMessage.content,
      };

      const result = await answerQuestion(input);

      // ✅ Defensive handling for missing or invalid results
      responseContent =
        result?.answer ??
        'Sorry, I could not generate an answer at the moment.';
    }

    // ✅ Always return a valid message object
    return {
      id: randomUUID(),
      role: 'assistant',
      content: responseContent,
    };
  } catch (error) {
    // 🔍 Log the error for debugging
    console.error(`Error in getResponse (${chatType}):`, error);

    // ✅ Graceful fallback message to the user
    return {
      id: randomUUID(),
      role: 'assistant',
      content:
        'Sorry, I encountered an error while generating a response. Please try again.',
    };
  }
}

/**
 * Generates a title for a chat session based on the conversation messages.
 * This is called after a few messages to create a meaningful title.
 */
export async function generateSessionTitle(
  messages: Message[]
): Promise<string> {
  try {
    // Only generate title if there are at least 2 messages
    if (messages.length < 2) {
      return 'New Chat';
    }

    const input: GenerateChatTitleInput = {
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    };

    const result = await generateChatTitle(input);
    return result?.title || 'New Chat';
  } catch (error) {
    console.error('Error generating chat title:', error);
    return 'New Chat';
  }
}
