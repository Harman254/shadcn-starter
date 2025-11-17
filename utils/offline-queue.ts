/**
 * Offline message queue utility for PWA
 * Queues messages when offline and syncs when connection is restored
 */

import { logger } from './logger';

export interface QueuedMessage {
  id: string;
  sessionId: string;
  content: string;
  timestamp: number;
  retries: number;
  status: 'pending' | 'sending' | 'failed';
}

const QUEUE_STORAGE_KEY = 'offline-message-queue';
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 50;

export class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private syncCallback: ((message: QueuedMessage) => Promise<void>) | null = null;
  private isOnline: boolean = true;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Set the callback function to sync messages when online
   */
  setSyncCallback(callback: (message: QueuedMessage) => Promise<void>) {
    this.syncCallback = callback;
  }

  /**
   * Add a message to the queue
   */
  enqueue(sessionId: string, content: string): string {
    const message: QueuedMessage = {
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      sessionId,
      content,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    // Prevent queue from growing too large
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest messages
      this.queue = this.queue.slice(-MAX_QUEUE_SIZE + 1);
    }

    this.queue.push(message);
    this.saveQueue();

    // Try to sync immediately if online
    if (this.isOnline && this.syncCallback) {
      this.syncMessage(message);
    }

    return message.id;
  }

  /**
   * Remove a message from the queue (after successful sync)
   */
  dequeue(messageId: string): void {
    this.queue = this.queue.filter((msg) => msg.id !== messageId);
    this.saveQueue();
  }

  /**
   * Get all pending messages for a session
   */
  getPendingMessages(sessionId: string): QueuedMessage[] {
    return this.queue.filter(
      (msg) => msg.sessionId === sessionId && msg.status === 'pending'
    );
  }

  /**
   * Get all queued messages
   */
  getAllMessages(): QueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Sync a single message
   */
  private async syncMessage(message: QueuedMessage): Promise<void> {
    if (!this.syncCallback) return;

    message.status = 'sending';
    this.saveQueue();

    try {
      await this.syncCallback(message);
      // Success - remove from queue
      this.dequeue(message.id);
    } catch (error) {
      logger.error('[OfflineQueue] Failed to sync message:', error);
      message.retries += 1;
      message.status = message.retries >= MAX_RETRIES ? 'failed' : 'pending';
      this.saveQueue();
    }
  }

  /**
   * Sync all pending messages
   */
  async syncAll(): Promise<void> {
    if (!this.isOnline || !this.syncCallback) return;

    const pendingMessages = this.queue.filter((msg) => msg.status === 'pending');
    
    for (const message of pendingMessages) {
      await this.syncMessage(message);
      // Small delay between syncs to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Clear failed messages
   */
  clearFailed(): void {
    this.queue = this.queue.filter((msg) => msg.status !== 'failed');
    this.saveQueue();
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    this.isOnline = navigator.onLine;

    const handleOnline = () => {
      this.isOnline = true;
      this.syncAll();
    };

    const handleOffline = () => {
      this.isOnline = false;
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Remove messages older than 7 days
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.queue = this.queue.filter((msg) => msg.timestamp > sevenDaysAgo);
        this.saveQueue();
      }
    } catch (error) {
      logger.error('[OfflineQueue] Failed to load queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      logger.error('[OfflineQueue] Failed to save queue:', error);
    }
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueue();

