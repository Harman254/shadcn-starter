'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Message } from '@/types';
import { getResponse, generateSessionTitle } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chat-store';
import { useChatSync } from '@/hooks/use-chat-sync';
import { useOfflineChat } from '@/hooks/use-offline-chat';
import { useSession } from '@/lib/auth-client';
import { useAuthModal } from '@/components/AuthModalProvider';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { EmptyScreen } from './empty-screen';
import { ChatErrorBoundary } from './chat-error-boundary';
import { ConnectionStatus } from './connection-status';
import { MessageSearch } from './message-search';
import { ToolProgress, type ExecutionProgressData } from './tool-progress';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { logger } from '@/utils/logger';
import { fetchWithRetry } from '@/utils/api-retry';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Cache empty arrays outside component to ensure stable references
const EMPTY_MESSAGES: Message[] = [];
const EMPTY_SORTED_MESSAGES: Message[] = [];

export function ChatPanel({
  chatType,
  preferencesSummary = '',
}: {
  chatType: 'context-aware' | 'tool-selection';
  preferencesSummary?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [toolProgress, setToolProgress] = useState<ExecutionProgressData | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Zustand store - use selectors for reactive updates
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const getCurrentSession = useChatStore((state) => state.getCurrentSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const clearSession = useChatStore((state) => state.clearSession);
  const createSession = useChatStore((state) => state.createSession);
  const setCurrentSession = useChatStore((state) => state.setCurrentSession);
  const updateSessionTitle = useChatStore((state) => state.updateSessionTitle);
  
  // Check authentication
  const { data: session, isPending: isAuthPending } = useSession();
  const isAuthenticated = !!session?.user;
  const { open: openAuthModal } = useAuthModal();
  
  const titleGeneratedRef = useRef<string | null>(null);
  // PERMANENT lock on user-selected session - NEVER changes once set
  const lockedSessionRef = useRef<string | null>(null);
  const lockInitializedRef = useRef(false);
  
  // Initialize lock from localStorage on mount
  useEffect(() => {
    if (lockInitializedRef.current) return;
    lockInitializedRef.current = true;
    
    try {
      const stored = localStorage.getItem('chat-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedSessionId = parsed?.state?.currentSessionId;
        if (storedSessionId) {
          lockedSessionRef.current = storedSessionId;
          logger.log('[ChatPanel] 🔒 Locked session from localStorage:', storedSessionId);
        }
      }
    } catch (e) {
      // Ignore
    }
  }, []);
  
  // SMART LOCK: Update lock when user explicitly selects a session (allows switching)
  // Only restore if session was cleared to null, not if user switched to a different one
  useEffect(() => {
    if (currentSessionId) {
      // Update lock if user selected a new session (allows switching between conversations)
      if (currentSessionId !== lockedSessionRef.current) {
        lockedSessionRef.current = currentSessionId;
        // Reset title generation ref when switching to a new/different session
        // This ensures title generation works for new conversations
        titleGeneratedRef.current = null;
        logger.log('[ChatPanel] 🔒 LOCK UPDATED (user switched):', currentSessionId);
        logger.log('[ChatPanel] Title generation ref reset for new session');
      }
    } else {
      // If currentSessionId is null but we have a locked session, restore it
      // This prevents accidental clearing but allows intentional switching
      if (lockedSessionRef.current) {
        const storeState = useChatStore.getState();
        const session = storeState.sessions[lockedSessionRef.current];
        
        // Only restore if session still exists (user didn't delete it)
        if (session) {
          logger.log('[ChatPanel] 🚨 RESTORING (was cleared to null):', lockedSessionRef.current);
          setTimeout(() => {
            setCurrentSession(lockedSessionRef.current!);
          }, 0);
        } else {
          // Session was deleted, clear the lock
          logger.log('[ChatPanel] 🔓 Clearing lock (session deleted):', lockedSessionRef.current);
          lockedSessionRef.current = null;
        }
      }
    }
  }, [currentSessionId, setCurrentSession]);
  
  // Subscribe to store and restore ONLY if cleared to null (not if switched to different session)
  useEffect(() => {
    const unsubscribe = useChatStore.subscribe((state) => {
      // Only restore if currentSessionId is null but we have a locked session
      // Don't restore if user switched to a different session (that's intentional)
      if (!state.currentSessionId && lockedSessionRef.current) {
        const session = state.sessions[lockedSessionRef.current];
        if (session) {
          logger.log('[ChatPanel] 🚨 Store cleared to null! Restoring:', lockedSessionRef.current);
          setTimeout(() => {
            setCurrentSession(lockedSessionRef.current!);
          }, 0);
        }
      }
    });
    
    return unsubscribe;
  }, [setCurrentSession]);
  
  // finalSessionId: Use currentSessionId directly (it's the source of truth)
  // The lock is just for restoration, but currentSessionId is what we should use
  const finalSessionId = useMemo(() => {
    // PRIORITY 1: Current session ID (most up-to-date, reflects user's current selection)
    if (currentSessionId) {
      // Update lock to match currentSessionId (for restoration purposes)
      if (lockedSessionRef.current !== currentSessionId) {
        lockedSessionRef.current = currentSessionId;
        titleGeneratedRef.current = null; // Reset title generation for new/switch
        logger.log('[ChatPanel] 🔒 Lock updated to match currentSessionId:', currentSessionId);
      }
      return currentSessionId;
    }
    
    // PRIORITY 2: Locked session (fallback if currentSessionId is null)
    if (lockedSessionRef.current) {
      logger.log('[ChatPanel] Using locked session (currentSessionId is null):', lockedSessionRef.current);
      return lockedSessionRef.current;
    }
    
    // PRIORITY 3: Create new session (only if no currentSessionId and no lock)
    const newSessionId = createSession(chatType);
    titleGeneratedRef.current = null;
    logger.log('[ChatPanel] Created new session (no currentSessionId, no lock):', newSessionId);
    return newSessionId;
  }, [currentSessionId, createSession, chatType]);
  
  // Get messages reactively from the finalSessionId
  // Use a stable selector that returns the raw messages array
  // Use cached empty array to prevent creating new references
  const rawMessages = useChatStore((state) => {
    if (!finalSessionId) {
      logger.debug('[ChatPanel] No finalSessionId, returning empty messages');
      return EMPTY_MESSAGES;
    }
    const session = state.sessions[finalSessionId];
    if (!session) {
      logger.debug('[ChatPanel] Session not found in store:', finalSessionId);
      return EMPTY_MESSAGES;
    }
    if (!session.messages) {
      logger.debug('[ChatPanel] Session has no messages array:', finalSessionId);
      return EMPTY_MESSAGES;
    }
    // Return the messages array directly - it's already a stable reference from the store
    if (session.messages.length > 0) {
      logger.debug(`[ChatPanel] ✅ Found ${session.messages.length} messages for session ${finalSessionId}`);
    } else {
      logger.debug(`[ChatPanel] 📭 New session has 0 messages - will show empty screen for ${finalSessionId}`);
    }
    return session.messages;
  });
  
  // Memoize sorted messages to avoid creating new array references
  // Use cached empty array to prevent creating new references
  const messages = useMemo(() => {
    if (rawMessages.length === 0) {
      return EMPTY_SORTED_MESSAGES;
    }
    
    // Ensure messages are sorted by timestamp
    return [...rawMessages].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return timeA - timeB;
    });
  }, [rawMessages]);
  
  // Sync with database - only if authenticated
  const { saveToDatabase, clearFromDatabase } = useChatSync(
    isAuthenticated ? finalSessionId : null, 
    chatType
  );

  // Offline chat queue integration
  const { queueMessage, hasPendingMessages, getPendingCount } = useOfflineChat({
    sessionId: finalSessionId,
    chatType,
    onMessageQueued: (messageId) => {
      logger.log('[ChatPanel] Message queued for offline sync:', messageId);
      toast({
        title: 'Message queued',
        description: 'Your message will be sent when you\'re back online.',
        variant: 'default',
      });
    },
    onMessageSynced: (messageId) => {
      logger.log('[ChatPanel] Queued message synced:', messageId);
    },
  });
  
  // Save messages to database when they change
  // Use a ref to track the last saved message count to avoid unnecessary saves
  const lastSavedCountRef = useRef(0);
  const lastSessionIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Reset count when session changes to ensure new session messages are saved
    if (lastSessionIdRef.current !== finalSessionId) {
      lastSavedCountRef.current = 0;
      lastSessionIdRef.current = finalSessionId;
    }
    
    if (isAuthenticated && messages.length > 0 && finalSessionId) {
      // Only save if we have new messages
      if (messages.length > lastSavedCountRef.current) {
        lastSavedCountRef.current = messages.length;
        
        logger.debug(`[ChatPanel] 💾 Triggering save for ${messages.length} messages in session ${finalSessionId}`);
        
        // Save to database - this ensures persistence
        saveToDatabase(messages);
      }
    }
  }, [isAuthenticated, messages.length, finalSessionId, saveToDatabase, messages]);

  // Show auth modal if user tries to interact while not authenticated
  const handleUnauthenticatedAction = useCallback(() => {
    openAuthModal('sign-in');
  }, [openAuthModal]);

  // Fallback: Generate title if it wasn't generated during handleSubmit
  // This ensures titles are generated even if handleSubmit logic didn't trigger it
  useEffect(() => {
    if (messages.length >= 2 && titleGeneratedRef.current !== finalSessionId && finalSessionId && isAuthenticated) {
      const session = getCurrentSession();
      if (session && (!session.title || session.title.startsWith('Chat ') || session.title === 'New Chat')) {
        titleGeneratedRef.current = finalSessionId;
        
        logger.log('[ChatPanel] 🎯 Fallback: Generating title for conversation...');
        
        generateSessionTitle(messages)
          .then((title) => {
            if (title && title !== 'New Chat' && titleGeneratedRef.current === finalSessionId) {
              updateSessionTitle(finalSessionId, title);
              
              logger.log('[ChatPanel] ✅ Fallback: Title generated:', title);
              
              fetchWithRetry(`/api/chat/sessions/${finalSessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ title }),
              })
                .then(async (response) => {
                  if (response.ok) {
                    logger.log('[ChatPanel] ✅ Fallback: Title saved to database');
                  } else if (response.status !== 401) {
                    logger.warn('[ChatPanel] Failed to update session title in database');
                  }
                })
                .catch((error) => {
                  logger.warn('[ChatPanel] Network error updating title:', error);
                });
            }
          })
          .catch((error) => {
            logger.error('[ChatPanel] Failed to generate title:', error);
            titleGeneratedRef.current = null;
          });
      } else if (session && session.title) {
        // Title already exists, mark as generated
        titleGeneratedRef.current = finalSessionId;
      }
    }
  }, [messages.length, finalSessionId, getCurrentSession, updateSessionTitle, isAuthenticated]);

  const handleSubmit = useCallback(async (value: string) => {
    if (!value.trim() || isLoading) {
      logger.debug('[ChatPanel] handleSubmit blocked:', { value: value.trim(), isLoading });
      return;
    }
    
    // Track quick action button clicks
    const isQuickAction = /^(create|generate|make|get|show|give|explain|swap|add).*(grocery|meal|plan|snacks|variations|substitutes|cheaper|healthier|kenyan|dishes|15-min|budget)/i.test(value.trim());
    if (isQuickAction) {
      logger.log('[ChatPanel] 🎯 Quick action button clicked:', value.trim());
      // Identify specific action type
      if (/grocery.*list/i.test(value)) {
        logger.log('[ChatPanel] 📝 Action type: GROCERY LIST REQUEST');
      } else if (/meal.*plan/i.test(value)) {
        logger.log('[ChatPanel] 📝 Action type: MEAL PLAN REQUEST');
      }
    }
    
    if (!isAuthenticated) {
      openAuthModal('sign-in');
      return;
    }

    // Ensure we have a valid finalSessionId
    if (!finalSessionId) {
      logger.error('[ChatPanel] No finalSessionId available');
      toast({
        title: 'Error',
        description: 'Session not initialized. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    // Check if offline - queue message if so
    if (!navigator.onLine) {
      const messageId = queueMessage(value.trim());
      if (messageId) {
        // Message queued successfully
        return;
      }
    }

    // Ensure finalSessionId matches currentSessionId in store
    if (finalSessionId !== currentSessionId) {
      setCurrentSession(finalSessionId);
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value.trim(),
      timestamp: new Date(),
      status: 'sending', // Initial status
    };

    logger.debug('[ChatPanel] Adding user message:', userMessage.id, 'to session:', finalSessionId);

    // Ensure session exists in store before adding message
    const storeState = useChatStore.getState();
    const session = storeState.sessions[finalSessionId];
    
    // If session doesn't exist, something went wrong - try to recover
    if (!session) {
      logger.error('[ChatPanel] Session not found in store:', finalSessionId);
      // Try to get the current session from store
      const currentSession = getCurrentSession();
      if (currentSession && currentSession.chatType === chatType && currentSession.id !== finalSessionId) {
        // Use the current session if it matches chatType
        // The finalSessionId will be updated on next render, so just set it as current
        setCurrentSession(currentSession.id);
        toast({
          title: 'Session updated',
          description: 'Switched to the correct session. Please try sending your message again.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Session not found. Please try again or refresh the page.',
          variant: 'destructive',
        });
      }
      return;
    }

    // Add user message optimistically - this should trigger UI update immediately
    // The message will appear on the RIGHT side (user messages are right-aligned)
    addMessage(finalSessionId, userMessage);
    setIsLoading(true);
    
    logger.debug('[ChatPanel] ✅ User message added optimistically - should be visible immediately on RIGHT');

    // Get updated messages after adding user message
    // Read directly from store state to get the latest messages including the one we just added
    // This ensures we have the most up-to-date messages even if the component hasn't re-rendered yet
    const updatedStoreState = useChatStore.getState();
    const updatedSession = updatedStoreState.sessions[finalSessionId];
    
    if (!updatedSession) {
      logger.error('[ChatPanel] Session disappeared after adding message:', finalSessionId);
      toast({
        title: 'Error',
        description: 'Failed to save message. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    // Verify the message is in the store
    const messageExists = updatedSession.messages.some(m => m.id === userMessage.id);
    if (!messageExists) {
      logger.error('[ChatPanel] Message was not added to store:', userMessage.id);
      toast({
        title: 'Error',
        description: 'Failed to save message. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    const updatedMessages = [...updatedSession.messages];
    
    // Note: We don't save user message alone here - we'll save both user + assistant together
    // This ensures both messages are saved atomically and prevents partial saves
    
    try {
      logger.debug('[ChatPanel] Getting AI response for', updatedMessages.length, 'messages');
      
      // Detect if this is a tool-calling request (meal plan, grocery list, etc.)
      const isToolRequest = /meal.*plan|grocery.*list|generate|create.*plan|shopping.*list/i.test(value.trim());
      
      // Initialize progress tracking if this is a tool request
      if (isToolRequest) {
        // Estimate number of tools that might be called
        let estimatedTools = 1; // Default to 1 tool
        if (/grocery.*list|shopping.*list/i.test(value.trim()) && updatedMessages.some(m => m.ui?.mealPlan)) {
          estimatedTools = 1; // Just grocery list
        } else if (/meal.*plan/i.test(value.trim())) {
          estimatedTools = 1; // Just meal plan (grocery list would be separate)
          if (/nutrition|calories|protein/i.test(value.trim())) {
            estimatedTools = 2; // Meal plan + nutrition
          }
          if (/grocery|shopping|price/i.test(value.trim())) {
            estimatedTools = 2; // Meal plan + grocery list
          }
        }
        
        // Initialize progress state with estimated progress
        const progressData: ExecutionProgressData = {
          totalTools: estimatedTools,
          completedTools: 0,
          failedTools: 0,
          skippedTools: 0,
          currentPhase: 1,
          totalPhases: 1,
          overallProgress: 0,
          tools: new Map(),
          startedAt: new Date(),
        };
        
        // Add estimated tool entries
        if (/grocery.*list|shopping.*list/i.test(value.trim())) {
          progressData.tools.set('grocery-list', {
            toolId: 'grocery-list',
            toolName: 'Generate Grocery List',
            status: 'running',
            progress: 0,
            message: 'Generating grocery list...',
          });
        } else if (/meal.*plan/i.test(value.trim())) {
          progressData.tools.set('meal-plan', {
            toolId: 'meal-plan',
            toolName: 'Generate Meal Plan',
            status: 'running',
            progress: 0,
            message: 'Generating meal plan...',
          });
        }
        
        setToolProgress(progressData);
        
        // Simulate progress updates (basic version - Phase 2 will add real-time server updates)
        const progressInterval = setInterval(() => {
          setToolProgress((prev) => {
            if (!prev || !prev.startedAt) return null;
            
            const updated = { ...prev };
            const elapsed = Date.now() - prev.startedAt.getTime();
            const estimatedTime = 10000; // 10 seconds estimated
            const progress = Math.min(90, Math.floor((elapsed / estimatedTime) * 100));
            
            updated.overallProgress = progress;
            updated.tools = new Map(updated.tools);
            
            // Update tool progress
            for (const [key, tool] of updated.tools.entries()) {
              updated.tools.set(key, {
                ...tool,
                progress: Math.min(90, progress),
              });
            }
            
            return updated;
          });
        }, 500);
        
        // Clean up interval when component unmounts or loading completes
        const cleanup = () => clearInterval(progressInterval);
        // Store cleanup function to call in finally block
        (window as any).__progressCleanup = cleanup;
      }
      
      // Pass the summarized preferences (one sentence) to reduce token usage
      const response = await getResponse(chatType, updatedMessages, preferencesSummary);
      
      // Clear progress and interval when response is received
      if ((window as any).__progressCleanup) {
        (window as any).__progressCleanup();
        delete (window as any).__progressCleanup;
      }
      setToolProgress(null);
      const assistantMessage: Message = {
        ...response,
        timestamp: new Date(),
      };
      
      logger.debug('[ChatPanel] ✅ Assistant message added - should be visible on LEFT');
      
      // Extract UI metadata from message content (if present)
      // Use a more robust pattern that handles base64-encoded JSON
      const uiMetadataMatch = assistantMessage.content.match(/\[UI_METADATA:([A-Za-z0-9+/=]+)\]/);
      if (uiMetadataMatch) {
        try {
          // Decode from base64 and parse JSON (browser-compatible)
          const base64String = uiMetadataMatch[1];
          const decoded = atob(base64String); // Browser's built-in base64 decode
          const uiMetadata = JSON.parse(decoded);
          
          // Log the extracted metadata structure for debugging
          if (process.env.NODE_ENV === 'development') {
            logger.log('[ChatPanel] 🎨 Extracted UI metadata:', {
              hasGroceryList: !!uiMetadata.groceryList,
              hasMealPlan: !!uiMetadata.mealPlan,
              groceryListItems: uiMetadata.groceryList?.items?.length || 0,
              groceryListStructure: uiMetadata.groceryList ? {
                hasItems: !!uiMetadata.groceryList.items,
                itemsType: Array.isArray(uiMetadata.groceryList.items) ? 'array' : typeof uiMetadata.groceryList.items,
                itemsLength: Array.isArray(uiMetadata.groceryList.items) ? uiMetadata.groceryList.items.length : 'N/A',
                hasLocationInfo: !!uiMetadata.groceryList.locationInfo,
                hasTotalCost: !!uiMetadata.groceryList.totalEstimatedCost,
              } : null,
              fullMetadata: uiMetadata,
            });
          }
          
          assistantMessage.ui = uiMetadata;
          // Remove the marker from the message content (don't show it to user)
          assistantMessage.content = assistantMessage.content.replace(/\[UI_METADATA:[A-Za-z0-9+/=]+\]/g, '').trim();
        } catch (error) {
          logger.warn('[ChatPanel] Failed to parse UI metadata:', error);
          if (process.env.NODE_ENV === 'development') {
            logger.warn('[ChatPanel] Base64 string:', uiMetadataMatch[1].substring(0, 50) + '...');
          }
          // Remove the invalid marker anyway
          assistantMessage.content = assistantMessage.content.replace(/\[UI_METADATA:[A-Za-z0-9+/=]+\]/g, '').trim();
        }
      } else {
        // Log when UI_METADATA is expected but not found
        if (process.env.NODE_ENV === 'development' && assistantMessage.content.toLowerCase().includes('grocery list')) {
          logger.warn('[ChatPanel] ⚠️ Grocery list message but no UI_METADATA found:', {
            messagePreview: assistantMessage.content.substring(0, 200),
            hasUIMetadataMarker: assistantMessage.content.includes('[UI_METADATA:'),
          });
        }
      }
      
      // Check if meal plan was saved and redirect if needed
      // Look for the marker in the message content
      const mealPlanSavedMatch = assistantMessage.content.match(/\[MEAL_PLAN_SAVED:([^\]]+)\]/);
      if (mealPlanSavedMatch) {
        const mealPlanId = mealPlanSavedMatch[1];
        if (process.env.NODE_ENV === 'development') {
          logger.log('[ChatPanel] 🍽️ Meal plan saved:', mealPlanId);
        }
        
        // Clean up the marker from the message content (remove it from display)
        assistantMessage.content = assistantMessage.content.replace(/\[MEAL_PLAN_SAVED:[^\]]+\]/g, '').trim();
        
        // Show toast notification (but don't auto-redirect if UI buttons are present)
        if (!assistantMessage.ui?.actions) {
        toast({
          title: 'Meal Plan Saved!',
          description: 'Redirecting to your meal plans...',
          duration: 2000,
        });
        
          // Redirect after a short delay
        setTimeout(() => {
          router.push('/meal-plans');
        }, 1500);
        } else {
          // If UI buttons are present, just show a toast
          toast({
            title: 'Meal Plan Saved!',
            description: 'Your meal plan has been saved successfully.',
            duration: 3000,
          });
        }
      } else {
        // Fallback: Check for keywords indicating meal plan was saved
        // This handles cases where AI might paraphrase the message
        const hasMealPlanKeywords = 
          assistantMessage.content.toLowerCase().includes('meal plan') &&
          (assistantMessage.content.toLowerCase().includes('saved') ||
           assistantMessage.content.toLowerCase().includes('successfully'));
        
        if (hasMealPlanKeywords && assistantMessage.content.toLowerCase().includes('/meal-plans')) {
          if (process.env.NODE_ENV === 'development') {
            logger.log('[ChatPanel] 🍽️ Detected meal plan save keywords');
          }
          
          // Show toast notification
          toast({
            title: 'Meal Plan Saved!',
            description: 'Your meal plan has been saved successfully.',
            duration: 3000,
          });
        }
      }
      
      // Add assistant message - will appear on the LEFT side (assistant messages are left-aligned)
      addMessage(finalSessionId, assistantMessage);
      
      // Get all messages including the new assistant message
      const allMessages = [...updatedMessages, assistantMessage];
      
      // IMPORTANT: Save both user and assistant messages to database
      // The save is debounced, but we update status optimistically
      // Status will be updated to 'sent' after successful AI response
      // (The actual save happens in the background via useChatSync)
      saveToDatabase(allMessages);
      
      // Update status to 'sent' optimistically after successful AI response
      // The debounced save will happen in the background
      updateMessageStatus(finalSessionId, userMessage.id, 'sent');
      
      logger.debug('[ChatPanel] 💾 Saving', allMessages.length, 'messages (user + assistant) to database');
      
      // Generate title IMMEDIATELY after first assistant response (when we have exactly 2 messages: user + assistant)
      // Only generate if title hasn't been generated yet and session doesn't have a custom title
      if (allMessages.length === 2 && titleGeneratedRef.current !== finalSessionId && isAuthenticated) {
        const session = getCurrentSession();
        if (session && (!session.title || session.title.startsWith('Chat ') || session.title === 'New Chat')) {
          titleGeneratedRef.current = finalSessionId;
          
          if (process.env.NODE_ENV === 'development') {
            logger.log('[ChatPanel] 🎯 Generating title for first conversation...');
          }
          
          // Generate title IMMEDIATELY and save session synchronously
          // This ensures the title is saved with the conversation right away
          (async () => {
            try {
              const title = await generateSessionTitle(allMessages);
              
              if (title && title !== 'New Chat' && titleGeneratedRef.current === finalSessionId) {
                // Update title in store IMMEDIATELY
                updateSessionTitle(finalSessionId, title);
                
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatPanel] ✅ Title generated:', title);
                }
                
                // Save the session to database IMMEDIATELY with the AI-generated title
                // This ensures the title is saved right after AI responds
                // Use retry logic for robustness
                try {
                  const response = await fetchWithRetry('/api/chat/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ 
                      chatType,
                      sessionId: finalSessionId,
                      title, // AI-generated title is required
                    }),
                  });
                  
                  if (response.ok) {
                    logger.log('[ChatPanel] ✅ Session saved to database with title:', title);
                  } else if (response.status === 400) {
                    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                    logger.warn('[ChatPanel] Failed to save session (title validation):', error);
                    // Retry with a fallback title if validation fails
                    if (error.error?.includes('title')) {
                      const fallbackTitle = allMessages[0]?.content?.substring(0, 50) || 'New Chat';
                      updateSessionTitle(finalSessionId, fallbackTitle);
                    }
                  } else if (response.status !== 401) {
                    logger.warn('[ChatPanel] Failed to save session to database');
                  }
                } catch (error) {
                  logger.warn('[ChatPanel] Network error saving session:', error);
                  // Title is still updated in store, will sync later
                }
              }
            } catch (error) {
              logger.error('[ChatPanel] Failed to generate title:', error);
              titleGeneratedRef.current = null;
            }
          })();
        }
      }
    } catch (error) {
      logger.error('[ChatPanel] Error getting response:', error);
      
      // Clear progress and interval on error
      if ((window as any).__progressCleanup) {
        (window as any).__progressCleanup();
        delete (window as any).__progressCleanup;
      }
      setToolProgress(null);
      
      toast({
        title: 'An error occurred',
        description: 'Failed to get a response from the chatbot. Please try again.',
        variant: 'destructive',
      });
      // Remove the user message on error
      const session = getCurrentSession();
      if (session && session.id === finalSessionId) {
        const filteredMessages = session.messages.filter((msg) => msg.id !== userMessage.id);
        clearSession(finalSessionId);
        filteredMessages.forEach((msg) => addMessage(finalSessionId, msg));
      }
    } finally {
      setIsLoading(false);
      // Clear progress and interval when loading completes
      if ((window as any).__progressCleanup) {
        (window as any).__progressCleanup();
        delete (window as any).__progressCleanup;
      }
      setToolProgress(null);
    }
  }, [isLoading, chatType, toast, finalSessionId, currentSessionId, addMessage, clearSession, saveToDatabase, isAuthenticated, openAuthModal, setCurrentSession, getCurrentSession, updateSessionTitle, preferencesSummary, toolProgress]);

  const handleClearChat = useCallback(async () => {
    if (!finalSessionId) return;
    
    clearSession(finalSessionId);
    await clearFromDatabase();
    
    toast({
      title: 'Chat cleared',
      description: 'Your conversation history has been cleared.',
    });
  }, [finalSessionId, clearSession, clearFromDatabase, toast]);

  const hasMessages = useMemo(() => {
    const result = messages.length > 0;
    logger.debug('[ChatPanel] hasMessages:', result, 'messageCount:', messages.length, 'finalSessionId:', finalSessionId);
    return result;
  }, [messages.length, finalSessionId]);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Log when finalSessionId or messages change
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[ChatPanel] 📋 Session/Messages state:', {
        finalSessionId,
        messageCount: messages.length,
        hasMessages,
        rawMessageCount: rawMessages.length,
      });
    }
  }, [finalSessionId, messages.length, hasMessages, rawMessages.length]);

  // Show loading state during SSR/hydration
  if (!isMounted || isAuthPending) {
    return (
      <div className="flex flex-col h-full w-full bg-background">
        <div className="flex-1 min-h-0 overflow-hidden relative flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
        <div className="shrink-0 border-t border-border/50 bg-background">
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} disabled={true} />
        </div>
      </div>
    );
  }

  // Show auth prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-full w-full bg-background">
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <EmptyScreen onExampleClick={handleUnauthenticatedAction} requireAuth={true} />
        </div>
        <div className="shrink-0 border-t border-border/50 bg-background">
          <ChatInput onSubmit={handleUnauthenticatedAction} isLoading={false} disabled={true} />
        </div>
      </div>
    );
  }

  return (
    <ChatErrorBoundary>
      <div 
        className="flex flex-col h-full w-full bg-transparent relative" 
        role="main" 
        aria-label="Chat interface"
      >
        <ConnectionStatus />
        
        {/* Search bar - only show when there are messages */}
        {/* Commented out to keep interface clean */}
        {/* {hasMessages && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 border-b border-border/50 bg-background/80 dark:bg-background/70 backdrop-blur-sm p-2.5 sm:p-3 md:p-4"
          >
            <MessageSearch 
              messages={messages} 
              onSelectMessage={(messageId: string) => {
                logger.debug('[ChatPanel] Selected message:', messageId);
              }}
            />
          </motion.div>
        )} */}
        
      {/* Messages area - takes remaining space and scrolls */}
        <div className={cn(
        "flex-1 overflow-hidden relative",
        "bg-background/50 backdrop-blur-3xl" // Enhanced background
      )}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <EmptyScreen onExampleClick={handleSubmit} requireAuth={!isAuthenticated && !isLoading} />
            ) : (
              <div className={cn(
                "max-w-4xl mx-auto w-full",
                "px-4 sm:px-6 md:px-8", // Responsive padding
                "pb-32 sm:pb-40" // Extra padding at bottom for floating input
              )}>
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  onActionClick={handleSubmit}
                />
                
                {/* Tool Progress Indicator */}
                {toolProgress && (
                  <div className="mt-4 mb-8">
                    <ToolProgress progress={toolProgress} />
                  </div>
                )}
                
                <div className="h-4" /> {/* Spacer */}
              </div>
            )}
          </div>
          
          {/* Input Area - Now handled by ChatInput's fixed positioning */}
          <ChatInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            disabled={!isAuthenticated && messages.length > 0}
          />
        </div>
      </div>
      

    </div>
    </ChatErrorBoundary>
  );
}