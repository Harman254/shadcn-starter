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
  messages: Message[],
  preferencesSummary?: string
): Promise<Message> {
  // 🧩 Ensure the last message exists and is from the user
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new Error('Invalid request: Last message must be from the user.');
  }

  try {
    let responseContent = '';

    if (chatType === 'context-aware') {
      // 🧠 Context-aware chat — uses message history for context
      // Limit to last 10 messages to avoid token limits (the flow will further limit to 5)
      const allHistory = messages.slice(0, -1).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      
      // Limit chat history early to prevent passing too much data
      // Reduced from 10 to 5 messages to reduce token usage
      const MAX_HISTORY = 5;
      const chatHistory = allHistory.length > MAX_HISTORY 
        ? allHistory.slice(-MAX_HISTORY) 
        : allHistory;
      
      // Limit message content length to prevent token overflow
      // The context-aware flow will further limit this, but we limit here too for safety
      const MAX_CURRENT_MESSAGE_CHARS = 700;
      const limitedMessage = lastMessage.content.length > MAX_CURRENT_MESSAGE_CHARS 
        ? lastMessage.content.substring(0, MAX_CURRENT_MESSAGE_CHARS) + '...' 
        : lastMessage.content;
      
      // 🎯 Only include preferences summary on the very first message (when conversation is new)
      // After that, the AI will remember preferences from the initial context
      // This reduces token usage by not repeating preferences on every message
      // chatHistory.length === 0 means this is the first message in the conversation
      const isFirstMessage = chatHistory.length === 0;
      const shouldIncludePreferences = isFirstMessage && preferencesSummary;
      
      // Log context for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        const totalChars = chatHistory.reduce((sum, m) => sum + m.content.length, 0) + limitedMessage.length + (shouldIncludePreferences ? preferencesSummary.length : 0);
        console.log(`[Context-Aware] Passing ${chatHistory.length} messages (${totalChars} chars) as context`);
        if (shouldIncludePreferences) {
          console.log(`[Context-Aware] Including preferences summary (first message): "${preferencesSummary}"`);
        } else if (preferencesSummary && !isFirstMessage) {
          console.log(`[Context-Aware] Skipping preferences summary (conversation ongoing, AI remembers from context)`);
        } else {
          console.log(`[Context-Aware] No user preferences provided`);
        }
      }
      
      const input: ContextAwareChatInput = {
        message: limitedMessage,
        chatHistory: chatHistory, // Limited conversation history for context-awareness
        preferencesSummary: shouldIncludePreferences ? preferencesSummary : undefined, // Only include on first message
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
    // 🔍 Log the error for debugging with more details
    console.error(`Error in getResponse (${chatType}):`, error);
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error && typeof error === 'object' && 'cause' in error) {
        console.error('Error cause:', error.cause);
      }
    }

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
