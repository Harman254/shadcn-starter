/**
 * @fileOverview
 * React Component for Orchestrated Chat Panel
 * Example integration of orchestration system with React/Next.js
 */

'use client';

import { useState, useCallback } from 'react';
import { processOrchestratedChat } from '@/app/actions/orchestrated-chat';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { EmptyScreen } from './empty-screen';
import type { Message } from '@/types';
import { useChatStore } from '@/store/chat-store';
import { useToast } from '@/hooks/use-toast';

interface OrchestratedChatPanelProps {
  chatType?: 'context-aware' | 'tool-selection';
}

export function OrchestratedChatPanel({ 
  chatType = 'context-aware' 
}: OrchestratedChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toolResults, setToolResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Get current session from store
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSubmit = useCallback(async (value: string) => {
    if (!value.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value.trim(),
      timestamp: new Date(),
      status: 'sent',
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    if (currentSessionId) {
      addMessage(currentSessionId, userMessage);
    }

    setIsLoading(true);

    try {
      // Process with orchestrated chat
      const result = await processOrchestratedChat({
        message: value.trim(),
        conversationHistory: messages,
      });

      // Create assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        status: 'sent',
        // Add structured data as UI metadata
        ui: result.structuredData ? {
          mealPlan: result.structuredData.mealPlan,
          groceryList: result.structuredData.groceryList,
        } : undefined,
      };

      // Add assistant message
      setMessages(prev => [...prev, assistantMessage]);
      if (currentSessionId) {
        addMessage(currentSessionId, assistantMessage);
      }

      // Store tool results for debugging/display
      if (result.toolResults) {
        setToolResults(result.toolResults);
      }

      // Show suggestions as toast or inline
      if (result.suggestions && result.suggestions.length > 0) {
        // You can display suggestions in the UI
        console.log('[OrchestratedChat] Suggestions:', result.suggestions);
      }

      // Show confidence warning if low
      if (result.confidence === 'low') {
        toast({
          title: 'Response may be incomplete',
          description: 'Some information could not be retrieved. Please try rephrasing your request.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[OrchestratedChat] Error:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        status: 'failed',
      };

      setMessages(prev => [...prev, errorMessage]);
      if (currentSessionId) {
        addMessage(currentSessionId, errorMessage);
      }

      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, currentSessionId, addMessage, toast]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {hasMessages ? (
          <ChatMessages messages={messages} isLoading={isLoading} />
        ) : (
          <EmptyScreen onExampleClick={handleSubmit} requireAuth={false} />
        )}
      </div>

      {/* Input area */}
      <div className="relative shrink-0 border-t border-border/50 bg-background/95 dark:bg-background/90 backdrop-blur-xl">
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} disabled={false} />
      </div>
    </div>
  );
}

