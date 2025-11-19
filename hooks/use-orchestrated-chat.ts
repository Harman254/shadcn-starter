/**
 * @fileOverview
 * React Hook for Orchestrated Chat with Progress Tracking
 * Use this hook in your React components for orchestrated chat functionality
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { processOrchestratedChat } from '@/app/actions/orchestrated-chat';
import type { Message } from '@/types';
import type { ExecutionProgressData } from '@/components/chat/tool-progress';

export interface UseOrchestratedChatReturn {
  sendMessage: (
    message: string,
    conversationHistory: Message[]
  ) => Promise<{
    response: string;
    structuredData?: any;
    suggestions?: string[];
    confidence: 'high' | 'medium' | 'low';
  }>;
  isLoading: boolean;
  error: Error | null;
  progress: ExecutionProgressData | null;
  cancel: () => void;
}

export function useOrchestratedChat(): UseOrchestratedChatReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<ExecutionProgressData | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    conversationHistory: Message[]
  ) => {
    setIsLoading(true);
    setError(null);
    setProgress(null);

    // Create abort controller for cancellation (future use)
    abortControllerRef.current = new AbortController();

    try {
      const result = await processOrchestratedChat({
        message,
        conversationHistory,
        // Note: signal and onProgress will be added when server action supports them
        // For now, progress tracking will be implemented via polling or WebSocket
      });

      return result;
    } catch (err) {
      // Don't set error if it was a cancellation
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          response: 'Operation cancelled',
          confidence: 'low' as const,
        };
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setProgress(null);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    progress,
    cancel,
  };
}


