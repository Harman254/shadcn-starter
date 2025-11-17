import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat-store';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { fetchWithRetry } from '@/utils/api-retry';
import type { Message } from '@/types';

/**
 * Hook to sync chat messages with the database
 * Automatically saves messages to the database and loads them on mount
 */
export function useChatSync(sessionId: string | null, chatType: 'context-aware' | 'tool-selection') {
  const { 
    getCurrentMessages, 
    getCurrentSession,
    addMessage, 
    addMessages, 
    createSession, 
    setCurrentSession,
    syncFromDatabase,
    clearSession,
  } = useChatStore();
  const { toast } = useToast();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize session on mount - verify it exists in database
  // NOTE: We do NOT create sessions here - they must have an AI-generated title first
  // Sessions are created in the database only after the first AI response generates a title
  useEffect(() => {
    if (sessionId && !isInitializedRef.current) {
      // Just verify session exists in database (don't create)
      const initSession = async () => {
        try {
          const response = await fetch(`/api/chat/sessions`, {
            credentials: 'include', // Include cookies for authentication
          });
          
          // API now returns empty array if not authenticated (no 401 error)
          if (response.ok) {
            const { sessions } = await response.json();
            const exists = sessions.some((s: any) => s.id === sessionId);
            
            if (process.env.NODE_ENV === 'development') {
              if (exists) {
                logger.debug('[useChatSync] Session exists in database:', sessionId);
              } else {
                logger.debug('[useChatSync] Session not in database yet (waiting for title):', sessionId);
              }
            }
            
            // Do NOT create session here - it must have an AI-generated title first
            // The session will be created automatically after title generation in chat-panel.tsx
          }
        } catch (error) {
          // Network error - session still works locally
          if (error instanceof Error && !error.message.includes('fetch')) {
            logger.warn('Failed to check session:', error);
          }
        }
      };
      
      initSession();
      isInitializedRef.current = true;
    }
  }, [sessionId, chatType]);

  // Load messages from database when session changes
  // Use a ref to track if we've loaded for this session to prevent overwriting new messages
  const loadedSessionRef = useRef<string | null>(null);
  const lastSessionIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!sessionId) {
      loadedSessionRef.current = null;
      lastSessionIdRef.current = null;
      return;
    }

    // Reset loaded flag if session changed
    if (lastSessionIdRef.current !== sessionId) {
      loadedSessionRef.current = null;
      lastSessionIdRef.current = sessionId;
    }

    // Only load if this is a different session (not already loaded)
    // But always check if we need to load messages
    // IMPORTANT: Check the session by sessionId directly, not getCurrentSession()
    // This ensures we're working with the correct session even if currentSession hasn't updated yet
    const storeState = useChatStore.getState();
    const session = storeState.sessions[sessionId];
    const currentSession = getCurrentSession();
    const hasLocalMessages = session?.messages && session.messages.length > 0;
    
    // CRITICAL: If session doesn't exist in store at all, don't load
    // This means handleSessionSelect is probably loading it - let that handle it
    if (!session) {
      logger.debug(`[useChatSync] Skipping load - session ${sessionId} doesn't exist in store yet (probably being loaded by handleSessionSelect)`);
      return;
    }
    
    // If we've already loaded for this session AND we have local messages, skip
    // NOTE: This prevents duplicate loading when handleSessionSelect already loaded messages
    if (loadedSessionRef.current === sessionId && hasLocalMessages) {
      logger.debug('[useChatSync] Skipping load - already loaded and has local messages');
      return;
    }
    
    // IMPORTANT: If this sessionId doesn't match the current session, don't load
    // This prevents interfering with session selection - let handleSessionSelect handle it
    if (currentSession && currentSession.id !== sessionId) {
      logger.debug(`[useChatSync] Skipping load - sessionId ${sessionId} doesn't match current session ${currentSession.id}`);
      return;
    }

    const loadMessages = async () => {
      try {
        // Use retry logic for robustness - handles network failures gracefully
        const response = await fetchWithRetry(`/api/chat/messages?sessionId=${sessionId}`, {
          credentials: 'include', // Include cookies for authentication
        });
        
        // Handle 404 - session doesn't exist in database yet (newly created, waiting for title)
        if (response.status === 404) {
          logger.debug('[useChatSync] Session not in database yet (waiting for title):', sessionId);
          // Mark as loaded to prevent retrying
          loadedSessionRef.current = sessionId;
          return; // Don't try to load messages for a session that doesn't exist yet
        }
        
        // Handle 401 - not authenticated
        if (response.status === 401) {
          logger.debug('[useChatSync] Not authenticated, skipping message load');
          loadedSessionRef.current = sessionId;
          return;
        }
        
        // API now returns empty array if not authenticated (no 401 error)
        if (response.ok) {
          const { messages } = await response.json();
          
          // If authenticated and messages exist in DB, load them
          // If not authenticated, messages will be empty array and we keep local messages
          if (messages && messages.length > 0) {
            // Check current session state before loading
            // IMPORTANT: Re-check store state to ensure session still exists and is current
            const currentStoreState = useChatStore.getState();
            const currentSession = currentStoreState.currentSessionId === sessionId 
              ? currentStoreState.sessions[sessionId] 
              : null;
            
            // Only proceed if this session is still the current session
            // This prevents interfering with session selection
            if (currentSession && currentSession.id === sessionId) {
              // Only load if this is still the current session
              // Merge with existing messages instead of clearing (preserve optimistic updates)
              const existingMessages = currentSession.messages || [];
              const existingIds = new Set(existingMessages.map((m: Message) => m.id));
              
              // Only add messages from DB that don't exist locally
              const newMessages = messages
                .filter((m: any) => !existingIds.has(m.id))
                .map((m: any) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
                }));
              
              if (newMessages.length > 0) {
                addMessages(sessionId, newMessages);
              } else if (existingMessages.length === 0 && messages.length > 0) {
                // Only load from DB if we have NO local messages AND DB has messages
                // This prevents overwriting optimistic updates
                // CRITICAL: Add a longer delay and more checks to avoid race conditions
                // Never clear a session that's currently being selected
                setTimeout(() => {
                  const finalStoreState = useChatStore.getState();
                  const finalCurrentSessionId = finalStoreState.currentSessionId;
                  const finalSession = finalStoreState.sessions[sessionId];
                  
                  // QUADRUPLE-CHECK: 
                  // 1. Session is still current
                  // 2. Session exists
                  // 3. Session still has no messages (wasn't populated by handleSessionSelect)
                  // 4. We're still loading for this session
                  if (finalCurrentSessionId === sessionId &&
                      finalSession && 
                      finalSession.id === sessionId && 
                      finalSession.messages.length === 0 &&
                      loadedSessionRef.current === sessionId) {
                    // If no local messages and DB has messages, load all from DB
                    const formattedMessages = messages.map((m: any) => ({
                      id: m.id,
                      role: m.role,
                      content: m.content,
                      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
                    }));
                    // Sort by timestamp to ensure correct order
                    formattedMessages.sort((a: Message, b: Message) => {
                      const timeA = a.timestamp instanceof Date 
                        ? a.timestamp.getTime() 
                        : a.timestamp 
                          ? new Date(a.timestamp).getTime() 
                          : 0;
                      const timeB = b.timestamp instanceof Date 
                        ? b.timestamp.getTime() 
                        : b.timestamp 
                          ? new Date(b.timestamp).getTime() 
                          : 0;
                      return timeA - timeB;
                    });
                    clearSession(sessionId);
                    addMessages(sessionId, formattedMessages);
                  } else {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('[useChatSync] Skipping clearSession - session state changed or has messages now');
                    }
                  }
                }, 300); // Increased delay to 300ms to avoid race conditions with handleSessionSelect
              }
            } else {
              logger.debug(`[useChatSync] Skipping load - session ${sessionId} is not current session`);
            }
          }
          // If messages is empty (not authenticated or no messages), keep local messages
          loadedSessionRef.current = sessionId;
        }
      } catch (error) {
        // Network errors - don't spam console, just mark as loaded to prevent retries
        logger.error('[useChatSync] Failed to load messages:', error);
        // Mark as loaded to prevent infinite retries
        loadedSessionRef.current = sessionId;
      }
    };

    loadMessages();
  }, [sessionId, addMessages, clearSession, getCurrentSession]);

  // Save messages to database with debouncing
  // This ensures messages are saved efficiently while preventing excessive API calls
  // Returns a promise that resolves/rejects based on save result
  const saveToDatabase = async (messages: any[]): Promise<void> => {
    if (!sessionId) {
      logger.warn('[useChatSync] Cannot save: no sessionId');
      return;
    }

    // Clear existing timeout to debounce rapid saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves - wait 500ms after last message for better responsiveness
    // This allows multiple messages to be saved together in one API call
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        // Always get the latest messages from store to ensure we save the most current state
        const latestMessages = getCurrentMessages();
        
        // If no messages in store, use the passed messages (fallback)
        const messagesToSave = latestMessages.length > 0 ? latestMessages : messages;
        
        if (messagesToSave.length === 0) {
          logger.debug('[useChatSync] No messages to save');
          return; // Nothing to save
        }
        
        logger.debug(`[useChatSync] 💾 Saving ${messagesToSave.length} messages to database for session ${sessionId}`);
        logger.debug('[useChatSync] Messages:', messagesToSave.map(m => ({ id: m.id, role: m.role, content: m.content.substring(0, 30) + '...' })));
        
        // Use retry logic for robustness - handles network failures gracefully
        const response = await fetchWithRetry('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({
            sessionId,
            messages: messagesToSave.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp 
                ? (msg.timestamp instanceof Date 
                    ? msg.timestamp.toISOString() 
                    : typeof msg.timestamp === 'string' 
                      ? msg.timestamp 
                      : new Date().toISOString())
                : new Date().toISOString(),
              // Include tool call data if present (for future tool call support)
              tool_calls: msg.tool_calls,
              tool_call_id: msg.tool_call_id,
            })),
          }),
        });

        // Parse response once
        const result = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated - messages stored locally only (this is fine)
            if (process.env.NODE_ENV === 'development') {
              console.log(`[useChatSync] 💾 Stored ${messagesToSave.length} messages locally (not authenticated)`);
            }
            return;
          }
          throw new Error(result.error || `Failed to save messages: ${response.status}`);
        }
        
        // Check response - API returns success with saved count
        if (result.saved === 0) {
          // All messages already existed in database (no new ones to save)
          logger.debug(`[useChatSync] ✅ All ${messagesToSave.length} messages already exist in database`);
        } else {
          // Successfully saved new messages to database
          logger.debug(`[useChatSync] ✅ Saved ${result.saved} new messages to database (${messagesToSave.length} total in store)`);
        }
      } catch (error) {
        // Only log real errors, not network issues or unauthenticated states
        if (error instanceof Error && 
            !error.message.includes('fetch') && 
            !error.message.includes('Failed to fetch') &&
            !error.message.includes('401')) {
          logger.error('[useChatSync] Failed to save messages to database:', error);
          toast({
            title: 'Sync error',
            description: 'Failed to save messages. They are stored locally and will sync when online.',
            variant: 'destructive',
          });
        }
        // Network errors or unauthenticated - messages still work locally, no need to show error
      }
    }, 500); // Reduced to 500ms for faster persistence while still debouncing
  };

  // Clear messages from database
  const clearFromDatabase = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error('Failed to clear messages');
      }
    } catch (error) {
      logger.error('Failed to clear messages from database:', error);
      toast({
        title: 'Sync error',
        description: 'Failed to clear messages from database.',
        variant: 'destructive',
      });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveToDatabase,
    clearFromDatabase,
  };
}

