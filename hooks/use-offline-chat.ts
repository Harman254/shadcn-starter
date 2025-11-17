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

        const messages = session.messages;

        // Create user message from queued content
        const userMessage: Message = {
          id: queuedMessage.id,
          role: 'user',
          content: queuedMessage.content,
          timestamp: new Date(queuedMessage.timestamp),
          status: 'sending',
        };

        // Add user message to store
        addMessage(sessionId, userMessage);

        // Get AI response
        const response = await getResponse(chatType, [...messages, userMessage]);
        const assistantMessage: Message = {
          ...response,
          timestamp: new Date(),
        };

        // Add assistant message
        addMessage(sessionId, assistantMessage);

        // Update status to sent
        updateMessageStatus(sessionId, userMessage.id, 'sent');

        // Notify callback
        onMessageSynced?.(queuedMessage.id);

        logger.log('[OfflineChat] ✅ Successfully synced message:', queuedMessage.id);
      } catch (error) {
        logger.error('[OfflineChat] Failed to sync message:', error);
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
      onMessageQueued?.(messageId);
      logger.log('[OfflineChat] Message queued:', messageId);
      return messageId;
    },
    [sessionId, onMessageQueued]
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

