'use client';

import { useEffect, useCallback } from 'react';
import { offlineQueue, type QueuedMessage } from '@/utils/offline-queue';
import { useChatStore } from '@/store/chat-store';
import { getResponse } from '@/app/actions';
import type { Message } from '@/types';
import { logger } from '@/utils/logger';

interface UseOfflineChatOptions {
  sessionId: string | null;
  chatType: 'context-aware' | 'tool-selection';
  onMessageQueued?: (messageId: string) => void;
  onMessageSynced?: (messageId: string) => void;
}

/**
 * Hook to handle offline chat message queuing and syncing
 */
export function useOfflineChat({
  sessionId,
  chatType,
  onMessageQueued,
  onMessageSynced,
}: UseOfflineChatOptions) {
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const getCurrentSession = useChatStore((state) => state.getCurrentSession);

  // Setup sync callback for offline queue
  useEffect(() => {
    if (!sessionId) return;

    const syncMessage = async (queuedMessage: QueuedMessage) => {
      try {
        logger.log('[OfflineChat] Syncing queued message:', queuedMessage.id);

        // Get current messages from store
        const session = getCurrentSession();
        if (!session || session.id !== queuedMessage.sessionId) {
          logger.warn('[OfflineChat] Session mismatch, skipping sync');
          return;
        }

        // Check if message already exists (it should from optimistic UI)
        const existingMessage = session.messages.find(m => m.id === queuedMessage.id);

        if (!existingMessage) {
          // If missing (e.g. page reload cleared non-persisted state?), add it back
          const userMessage: Message = {
            id: queuedMessage.id,
            role: 'user',
            content: queuedMessage.content,
            timestamp: new Date(queuedMessage.timestamp),
            status: 'sending',
          };
          addMessage(sessionId, userMessage);
        }

        // Get fresh messages list including the user message
        const currentMessages = getCurrentSession()?.messages || [];

        // Get AI response
        const response = await getResponse(chatType, currentMessages);
        const assistantMessage: Message = {
          ...response,
          timestamp: new Date(),
        };

        // Add assistant message
        addMessage(sessionId, assistantMessage);

        // Update user message status to sent
        updateMessageStatus(sessionId, queuedMessage.id, 'sent');

        // Notify callback
        onMessageSynced?.(queuedMessage.id);

        logger.log('[OfflineChat] ✅ Successfully synced message:', queuedMessage.id);
      } catch (error) {
        logger.error('[OfflineChat] Failed to sync message:', error);

        // Update status to failed if possible
        updateMessageStatus(sessionId, queuedMessage.id, 'failed');

        throw error; // Re-throw to let queue handle retry logic
      }
    };

    offlineQueue.setSyncCallback(syncMessage);

    // Sync any pending messages when hook is initialized (client-side only)
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine) {
      offlineQueue.syncAll();
    }
  }, [sessionId, chatType, addMessage, updateMessageStatus, getCurrentSession, onMessageSynced]);

  /**
   * Queue a message for offline sending
   */
  const queueMessage = useCallback(
    (content: string): string | null => {
      if (!sessionId) return null;

      const messageId = offlineQueue.enqueue(sessionId, content);

      // Optimistic UI: Add message to store immediately
      const optimisticMessage: Message = {
        id: messageId,
        role: 'user',
        content,
        timestamp: new Date(),
        status: 'sending',
      };

      addMessage(sessionId, optimisticMessage);

      onMessageQueued?.(messageId);
      logger.log('[OfflineChat] Message queued and added to store:', messageId);
      return messageId;
    },
    [sessionId, onMessageQueued, addMessage]
  );

  /**
   * Check if there are pending messages
   */
  const hasPendingMessages = useCallback((): boolean => {
    if (!sessionId) return false;
    const pending = offlineQueue.getPendingMessages(sessionId);
    return pending.length > 0;
  }, [sessionId]);

  /**
   * Get pending messages count
   */
  const getPendingCount = useCallback((): number => {
    if (!sessionId) return 0;
    return offlineQueue.getPendingMessages(sessionId).length;
  }, [sessionId]);

  return {
    queueMessage,
    hasPendingMessages,
    getPendingCount,
  };
}

