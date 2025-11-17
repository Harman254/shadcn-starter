'use client';

import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { useChatStore } from '@/store/chat-store';
import { useSession } from '@/lib/auth-client';
import { useAuthModal } from '@/components/AuthModalProvider';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Loader2, History, LogIn, MessageSquare, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import type { Message } from '@/types';
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

interface ChatHistoryProps {
  chatType: 'context-aware' | 'tool-selection';
  onSessionSelect?: (sessionId: string) => void;
}

// Memoized session item component for better performance
interface SessionItemProps {
  session: any;
  isActive: boolean;
  isMounted: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  getPreview: (session: any) => string;
  getMessageCount: (session: any) => number;
  getLastMessageTime: (session: any) => Date | null;
}

const SessionItem = memo(function SessionItem({
  session,
  isActive,
  isMounted,
  onSelect,
  onDelete,
  getPreview,
  getMessageCount,
  getLastMessageTime,
}: SessionItemProps) {
  const messageCount = getMessageCount(session);
  const preview = getPreview(session);
  const lastMessageTime = getLastMessageTime(session);
  const isRecent = lastMessageTime && (Date.now() - lastMessageTime.getTime()) < 60000; // Less than 1 minute ago

  return (
    <div
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-all",
        "hover:bg-muted/50 active:bg-muted/70",
        isActive
          ? "bg-primary/10 border border-primary/20 shadow-sm"
          : "border border-transparent hover:border-border/50"
      )}
      onClick={() => onSelect(session.id)}
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex-1 min-w-0 pr-2">
          {/* Title with active indicator */}
          <div className="flex items-center gap-2 mb-1">
            <p className={cn(
              "text-xs font-medium truncate",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {session.title || (messageCount > 0 ? 'New conversation' : 'New chat')}
            </p>
            {isActive && (
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>

          {/* Preview text - only show if there are messages */}
          {messageCount > 0 && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {preview}
          </p>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
            {/* Message count */}
            {messageCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{messageCount}</span>
              </div>
            )}

            {/* Last updated time - only show if there are messages */}
            {messageCount > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {isMounted 
                  ? formatDistanceToNow(session.updatedAt, { addSuffix: true })
                  : 'Recently'
                }
              </span>
            </div>
            )}

            {/* Recent indicator */}
            {isRecent && !isActive && (
              <span className="text-primary text-[10px] font-medium">New</span>
            )}
          </div>
        </div>
        
        {/* Delete button - always visible */}
        <div className="shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 transition-all",
                  "text-muted-foreground hover:text-destructive",
                  "hover:bg-destructive/10 active:bg-destructive/20",
                  "bg-muted/30 border border-border/50 rounded-md"
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label="Delete conversation"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete chat session?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this conversation and all its messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </div>
  );
});

export function ChatHistory({ chatType, onSessionSelect }: ChatHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, isPending: isAuthPending } = useSession();
  const isAuthenticated = !!session?.user;
  const { open: openAuthModal } = useAuthModal();
  
  // Reactively subscribe to store changes for real-time updates
  // This ensures history updates when messages are added, titles change, etc.
  const sessions = useChatStore((state) => state.sessions);
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const setCurrentSession = useChatStore((state) => state.setCurrentSession);
  const createSession = useChatStore((state) => state.createSession);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const syncFromDatabase = useChatStore((state) => state.syncFromDatabase);

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track if we've loaded sessions initially
  const hasLoadedRef = useRef(false);

  // Load sessions from database on mount and when chatType changes
  // CRITICAL: Don't run when currentSessionId changes - that means user selected a session
  useEffect(() => {
    // Only load if authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // CRITICAL: If currentSessionId is set (user selected a session), NEVER reload
    // This is the most important check - if user selected a session, don't touch it
    if (currentSessionId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] 🚫 BLOCKED reload - user selected session:', currentSessionId);
      }
      // Mark as loaded to prevent future reloads
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
      }
      setIsLoading(false);
      return;
    }

    // If we've already loaded, don't reload
    if (hasLoadedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] Skipping reload - already loaded');
      }
      return;
    }

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat/sessions', {
          credentials: 'include', // Include cookies for authentication
        });
        
        if (response.status === 401) {
          // Not authenticated - show auth modal
          openAuthModal('sign-in');
          setIsLoading(false);
          return;
        }
        
        if (response.ok) {
          const { sessions: dbSessions } = await response.json();
          
          // CRITICAL: Check again if currentSessionId was set while we were fetching
          // If user selected a session during the fetch, don't override it
          const currentState = useChatStore.getState();
          if (currentState.currentSessionId) {
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatHistory] 🚫 User selected session during fetch, skipping sync');
            }
            hasLoadedRef.current = true;
            setIsLoading(false);
            return;
          }
          
          // Sync database sessions to store (empty array if not authenticated)
          // CRITICAL: Don't use replaceForChatType - preserve local sessions
          if (dbSessions && dbSessions.length > 0) {
            syncFromDatabase(dbSessions);
            
            // Only set current session if none is set (don't override user selection)
            // Double-check currentSessionId is still null
            const finalState = useChatStore.getState();
            if (!finalState.currentSessionId) {
            const matchingSession = dbSessions.find(
              (s: any) => s.chatType === chatType
            );
            if (matchingSession) {
              setCurrentSession(matchingSession.id);
                hasLoadedRef.current = true;
              return; // Found matching session, done
            }
            }
          }
          
          // No matching session found - create new one locally ONLY if no currentSessionId
          // Double-check one more time before creating
          const finalCheckState = useChatStore.getState();
          if (!finalCheckState.currentSessionId) {
            const newSessionId = createSession(chatType);
            setCurrentSession(newSessionId);
            hasLoadedRef.current = true;
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatHistory] Created new session locally:', newSessionId);
              console.log('[ChatHistory] Session will be saved to database after AI generates title');
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatHistory] 🚫 User selected session before creating new one, skipping');
            }
            hasLoadedRef.current = true;
          }
        }
      } catch (error) {
        // Network error - chat still works with local storage
        console.warn('Failed to load chat sessions from database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [chatType, setCurrentSession, syncFromDatabase, createSession, isAuthenticated, currentSessionId]); // Added currentSessionId to deps to check it

  // Filter sessions by chat type and sort by updatedAt (most recent first)
  // IMPORTANT: Only show sessions with messages OR the current active session
  // This prevents empty "New Chat" sessions from appearing in history
  // until the user actually starts a conversation
  const sortedSessions = useMemo(() => {
    const filtered = Object.values(sessions).filter(
      (session) => {
        // Always include current session (even if empty) so user can see it's active
        if (session.id === currentSessionId) {
          return true;
        }
        // Only include sessions with messages (conversations that have started)
        return session.chatType === chatType && session.messages && session.messages.length > 0;
      }
    );
    return [...filtered].sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [sessions, chatType, currentSessionId]);

  const handleNewChat = () => {
    // Create new session and set it as current
    // This will update the lock in chat-panel.tsx
    const newSessionId = createSession(chatType);
    
    // CRITICAL: Verify the session was created with empty messages
    const storeState = useChatStore.getState();
    const newSession = storeState.sessions[newSessionId];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistory] ✅ Creating new chat session:', newSessionId);
      console.log('[ChatHistory] New session messages:', newSession?.messages?.length || 0);
      console.log('[ChatHistory] New session should show empty screen');
    }
    
    // Set as current - this will trigger lock update in chat-panel.tsx
    setCurrentSession(newSessionId);
    
    // Verify it was set
    const verifyState = useChatStore.getState();
    if (verifyState.currentSessionId !== newSessionId) {
      console.error('[ChatHistory] Failed to set new session as current! Retrying...');
      setCurrentSession(newSessionId);
    }
    
    // NOTE: Session is created locally but NOT saved to database until AI generates a title
    // The session will be saved automatically after the first AI response generates a title
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistory] ✅ New session set as current:', newSessionId);
      console.log('[ChatHistory] Session will be saved to database after AI generates title');
    }
    
    onSessionSelect?.(newSessionId);
  };

  const handleSessionSelect = async (sessionId: string) => {
    // CRITICAL: Ensure session exists in store IMMEDIATELY before setting it as current
    // This prevents useChatSync from interfering and clearing the session
    const storeState = useChatStore.getState();
    let session = storeState.sessions[sessionId];
    
    // If session doesn't exist in store, fetch it from database immediately
    if (!session && isAuthenticated) {
      try {
        const sessionResponse = await fetch(`/api/chat/sessions`, {
          credentials: 'include',
        });
        if (sessionResponse.ok) {
          const { sessions: dbSessions } = await sessionResponse.json();
          const dbSession = dbSessions.find((s: any) => s.id === sessionId);
          if (dbSession) {
            // Immediately add session to store using syncFromDatabase
            syncFromDatabase([{
              id: dbSession.id,
              chatType: dbSession.chatType,
              title: dbSession.title,
              messages: [], // Messages will be loaded separately
              updatedAt: new Date(dbSession.updatedAt),
            }]);
            // Re-check store state
            const newStoreState = useChatStore.getState();
            session = newStoreState.sessions[sessionId];
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatHistory] Created session in store from database:', sessionId);
            }
          }
        }
      } catch (error) {
        console.error('[ChatHistory] Failed to fetch session info:', error);
      }
    }
    
    // Now set the session as current - it should exist in store now
    // CRITICAL: Set this synchronously and ensure it persists
    // This will update the lock in chat-panel.tsx to allow switching between conversations
    setCurrentSession(sessionId);
    
    // Verify it was set correctly
    const verifyState = useChatStore.getState();
    if (verifyState.currentSessionId !== sessionId) {
      console.error('[ChatHistory] Failed to set currentSessionId! Retrying...');
      setCurrentSession(sessionId);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistory] ✅ Switched to session:', sessionId);
      console.log('[ChatHistory] Verified currentSessionId:', verifyState.currentSessionId);
      console.log('[ChatHistory] Lock will be updated in chat-panel.tsx');
    }
    
    onSessionSelect?.(sessionId);
    
    // Load messages for this session
    // Always check database to ensure we have the latest persisted messages
    // Then merge with local messages (which may have optimistic updates)
    const updatedStoreState = useChatStore.getState();
    session = updatedStoreState.sessions[sessionId] || session;
    const localMessages = session?.messages || [];
    
    // If session still doesn't exist, log a warning
    if (!session && process.env.NODE_ENV === 'development') {
      console.warn('[ChatHistory] Session still not found in store after fetch:', sessionId);
    }
    
    // If not authenticated, messages are only in localStorage
    if (!isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] Not authenticated, using local messages only');
      }
      // Even if not authenticated, ensure session exists in store
      if (!session) {
        // Create a minimal session entry for local storage
        const { createSession } = useChatStore.getState();
        // Don't create a new one, just use the existing sessionId
        // The session should already exist from syncFromDatabase
      }
      return;
    }
    
    // Always try to load from database to ensure persistence
    // This ensures messages persist even if localStorage is cleared
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        openAuthModal('sign-in');
        return;
      }
      
      // Handle 404 - session doesn't exist in database yet (normal for new sessions)
      if (response.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistory] Session not in database yet (new session):', sessionId);
        }
        // Use local messages from store - this is expected for new sessions
        // Session will be saved to DB after AI generates title
        return; // Continue with local session data
      }
      
      if (response.ok) {
        const { messages: dbMessages } = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ChatHistory] Loaded ${dbMessages?.length || 0} messages from database for session ${sessionId}`);
          console.log(`[ChatHistory] Local messages: ${localMessages.length}`);
        }
        
        // Ensure session exists in store - if it doesn't, we need to create it
        const currentStoreState = useChatStore.getState();
        let currentSession = currentStoreState.sessions[sessionId];
        
        if (!currentSession) {
          // Session doesn't exist in store - we need to get session info from database
          // For now, we'll create a minimal session entry
          // The session should have been synced from database, but if not, create it
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] Session not in store, will be created by sync or chat panel');
          }
        }
        
        if (dbMessages && dbMessages.length > 0) {
          // Format messages from database
          const formattedMessages = dbMessages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
          
          // Sort by timestamp
          formattedMessages.sort((a: Message, b: Message) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
            return timeA - timeB;
          });
          
          // Merge database messages with local messages
          // Database is source of truth, but preserve any local optimistic updates
          const { addMessages } = useChatStore.getState();
          
          // Re-check store state after potential session creation
          const updatedStoreState = useChatStore.getState();
          const updatedSession = updatedStoreState.sessions[sessionId];
          const updatedLocalMessages = updatedSession?.messages || [];
          
          // Create a set of database message IDs
          const dbMessageIds = new Set(formattedMessages.map((m: Message) => m.id));
          
          // Find local messages that aren't in database (optimistic updates not yet saved)
          const unsavedLocalMessages = updatedLocalMessages.filter((m: Message) => !dbMessageIds.has(m.id));
          
          // Find database messages that aren't in local (new messages from other devices or first load)
          const localMessageIds = new Set(updatedLocalMessages.map((m: Message) => m.id));
          const newDbMessages = formattedMessages.filter((m: Message) => !localMessageIds.has(m.id));
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ChatHistory] Found ${unsavedLocalMessages.length} unsaved local messages (optimistic updates)`);
            console.log(`[ChatHistory] Found ${newDbMessages.length} new database messages to add`);
          }
          
          // Ensure session exists in store before adding messages
          // If it doesn't exist, we need to create it or get it from the synced sessions
          if (!updatedSession) {
            // Try to find session in the synced sessions list
            const allSessions = Object.values(updatedStoreState.sessions);
            const sessionFromList = allSessions.find(s => s.id === sessionId);
            
            if (!sessionFromList) {
              // Session doesn't exist - we need to create it
              // Get session info from database (we'll need to fetch it)
              // For now, create a minimal session entry
              const { createSession } = useChatStore.getState();
              // We can't create with the same ID, so we need to manually add it
              // Actually, let's fetch the session info from the API
              try {
                const sessionResponse = await fetch(`/api/chat/sessions`, {
                  credentials: 'include',
                });
                if (sessionResponse.ok) {
                  const { sessions: dbSessions } = await sessionResponse.json();
                  const dbSession = dbSessions.find((s: any) => s.id === sessionId);
                  if (dbSession) {
                    // Use syncFromDatabase to add this session
                    syncFromDatabase([{
                      id: dbSession.id,
                      chatType: dbSession.chatType,
                      title: dbSession.title,
                      messages: [], // Messages will be added separately
                      updatedAt: new Date(dbSession.updatedAt),
                    }]);
                    // Re-check store state
                    const newStoreState = useChatStore.getState();
                    const newSession = newStoreState.sessions[sessionId];
                    if (newSession) {
                      // Now add messages
                      addMessages(sessionId, formattedMessages);
                    }
                  }
                }
              } catch (error) {
                console.error('[ChatHistory] Failed to fetch session info:', error);
              }
              return; // Exit early if we couldn't create the session
            }
          }
          
              // If we have database messages but no local messages, load all from database
              // This handles the case where session exists in DB but not in local store
              if (updatedLocalMessages.length === 0 && formattedMessages.length > 0) {
                // Load all messages from database
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatHistory] No local messages, loading all from database');
                }
                // Add all messages
          addMessages(sessionId, formattedMessages);
          
                // Verify messages were added
                const verifyState = useChatStore.getState();
                const verifySession = verifyState.sessions[sessionId];
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatHistory] ✅ After adding messages, session has:', verifySession?.messages?.length || 0, 'messages');
                }
              } else if (newDbMessages.length > 0) {
                // Add only new messages from database
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatHistory] Adding', newDbMessages.length, 'new messages from database');
                }
                addMessages(sessionId, newDbMessages);
                
                // Verify messages were added
                const verifyState = useChatStore.getState();
                const verifySession = verifyState.sessions[sessionId];
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatHistory] ✅ After adding new messages, session has:', verifySession?.messages?.length || 0, 'messages');
                }
              } else {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[ChatHistory] No new messages to add, session already has:', updatedLocalMessages.length, 'messages');
                }
              }
          
          // Ensure unsaved local messages (optimistic updates) are preserved
          if (unsavedLocalMessages.length > 0) {
            // Check if they're already in the store
            const finalStoreState = useChatStore.getState();
            const finalSession = finalStoreState.sessions[sessionId];
            const finalMessageIds = new Set((finalSession?.messages || []).map((m: Message) => m.id));
            const missingMessages = unsavedLocalMessages.filter((m: Message) => !finalMessageIds.has(m.id));
            
            if (missingMessages.length > 0) {
              addMessages(sessionId, missingMessages);
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            const finalMessages = useChatStore.getState().sessions[sessionId]?.messages || [];
            console.log(`[ChatHistory] ✅ Final message count: ${finalMessages.length}`);
          }
        } else if (localMessages.length > 0) {
          // No database messages but we have local messages
          // Keep local messages (they'll be saved by useChatSync)
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] No database messages, keeping local messages');
          }
        } else {
          // No messages at all - session is empty, which is fine
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] No messages found, starting fresh conversation');
          }
        }
      }
    } catch (error) {
      console.error('[ChatHistory] Failed to load messages:', error);
      // On error, keep local messages if available
      if (localMessages.length > 0 && process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] Error loading from database, using local messages');
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });
      deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // Memoize preview generation to prevent unnecessary recalculations
  const getPreview = useCallback((session: any) => {
    if (!session || !session.messages || session.messages.length === 0) return 'New conversation';
    
    // Get the last user message for better context (user's question)
    const userMessages = session.messages.filter((m: Message) => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // If we have a user message, use it; otherwise use the last message
    const previewMessage = lastUserMessage || session.messages[session.messages.length - 1];
    
    if (!previewMessage || !previewMessage.content) return 'New conversation';
    
    // Clean up the preview text
    const preview = previewMessage.content.trim();
    if (preview.length <= 60) return preview;
    return preview.slice(0, 57) + '...';
  }, []);

  // Get message count for a session
  const getMessageCount = useCallback((session: any) => {
    return session?.messages?.length || 0;
  }, []);

  // Get last message timestamp
  const getLastMessageTime = useCallback((session: any) => {
    if (!session?.messages || session.messages.length === 0) return null;
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage?.timestamp || null;
  }, []);

  // Show auth prompt if not authenticated
  if (!isAuthenticated && !isAuthPending && isMounted) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-foreground">Conversations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sign in to view your chat history
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-xs">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-2">Sign in Required</p>
            <p className="text-xs text-muted-foreground mb-4">
              Sign in to access your chat history and continue conversations
            </p>
            <Button
              onClick={() => openAuthModal('sign-in')}
              size="sm"
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-foreground">Conversations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chatType === 'context-aware' ? 'Recipe chats' : 'Meal tracking chats'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="h-8 w-8 p-0 hover:bg-primary/10"
            aria-label="New chat"
            disabled={!isAuthenticated}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading || isAuthPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sortedSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground mb-1">No conversations yet</p>
              <p className="text-xs text-muted-foreground">
                Start chatting to see your conversation history here
              </p>
            </div>
          ) : (
            sortedSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={currentSessionId === session.id}
                isMounted={isMounted}
                onSelect={handleSessionSelect}
                onDelete={handleDeleteSession}
                getPreview={getPreview}
                getMessageCount={getMessageCount}
                getLastMessageTime={getLastMessageTime}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
