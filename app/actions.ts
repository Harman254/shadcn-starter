'use server';

import { generateText, generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import type { Message } from '@/types';
import { randomUUID } from 'crypto';

/**
 * Handles chat responses using AI SDK.
 * This function is server-side and safely handles AI failures
 * to ensure the user always gets a graceful response.
 * 
 * Note: This is used by the offline chat system for fallback.
 * The main chat uses lib/orchestration/orchestrated-chat-flow.ts
 */
export async function getResponse(
  chatType: 'context-aware' | 'tool-selection',
  messages: Message[],
  preferencesSummary?: string
): Promise<Message> {
  // 🧩 Ensure the last message exists and is from the user
  // Filter out any invalid messages first
  const validMessages = messages.filter(m => m && m.role && m.content);
  
  if (validMessages.length === 0) {
    throw new Error('Invalid request: No valid messages provided.');
  }
  
  // Find the last user message (in case assistant messages were added)
  const lastUserMessage = [...validMessages].reverse().find(m => m.role === 'user');
  if (!lastUserMessage) {
    throw new Error('Invalid request: No user message found in the conversation.');
  }
  
  // Use the last user message as the current message
  const lastMessage = lastUserMessage;
  
  // Get messages up to and including the last user message for context
  const lastUserIndex = validMessages.findIndex(m => m.id === lastUserMessage.id);
  const contextMessages = validMessages.slice(0, lastUserIndex + 1);

  try {
    // Build chat history for context (exclude the last user message)
    const chatHistory = contextMessages.slice(-5, -1).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Limit message length
    const MAX_MESSAGE_CHARS = 700;
    const limitedMessage = lastMessage.content.length > MAX_MESSAGE_CHARS
      ? lastMessage.content.substring(0, MAX_MESSAGE_CHARS) + '...'
      : lastMessage.content;

    // Build system prompt
    let systemPrompt = `You are MealWise, a friendly AI meal planning assistant. 
Help users with meal planning, recipes, nutrition advice, and grocery lists.
Be concise, helpful, and personalized.`;

    if (preferencesSummary && chatHistory.length === 0) {
      systemPrompt += `\n\nUser preferences: ${preferencesSummary}`;
    }

    // Build conversation context
    const conversationContext = chatHistory.length > 0
      ? `\n\nRecent conversation:\n${chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`
      : '';

    // Generate response using AI SDK
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      temperature: 0.7,
      maxTokens: 1000,
      system: systemPrompt,
      prompt: `${conversationContext}\n\nUser: ${limitedMessage}\n\nAssistant:`,
    });

    const responseContent = result.text.trim() ||
      'Sorry, I could not generate a response at the moment.';

    // ✅ Always return a valid message object
    return {
      id: randomUUID(),
      role: 'assistant',
      content: responseContent,
    };
  } catch (error) {
    // 🔍 Log the error for debugging
    console.error(`Error in getResponse (${chatType}):`, error);

    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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
 * Uses AI SDK generateObject for structured output.
 */
export async function generateSessionTitle(
  messages: Message[]
): Promise<string> {
  try {
    // Only generate title if there are at least 2 messages
    if (messages.length < 2) {
      return 'New Chat';
    }

    // Take first few messages for context
    const contextMessages = messages.slice(0, 4).map((m) => ({
      role: m.role,
      content: m.content.substring(0, 200), // Limit content length
    }));

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      temperature: 0.3,
      schema: z.object({
        title: z.string().describe('A short, descriptive title for this chat (3-6 words)'),
      }),
      prompt: `Generate a short, descriptive title (3-6 words) for this chat conversation:

${contextMessages.map(m => `${m.role}: ${m.content}`).join('\n')}

The title should capture the main topic or intent of the conversation.`,
    });

    return result.object?.title || 'New Chat';
  } catch (error) {
    console.error('Error generating chat title:', error);
    return 'New Chat';
  }
}

