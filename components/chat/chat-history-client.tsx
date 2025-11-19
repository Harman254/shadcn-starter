'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useChatStore } from '@/store/chat-store';
import { useSession } from '@/lib/auth-client';
import { useAuthModal } from '@/components/AuthModalProvider';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Loader2, History, LogIn, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import { getChatSessions } from '@/actions/getChatSessions';
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

interface SessionData {
  id: string;
  chatType: 'context-aware' | 'tool-selection';
  title?: string;
  messageCount: number;
  lastMessage?: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  updatedAt: Date;
}

interface ChatHistoryClientProps {
  chatType: 'context-aware' | 'tool-selection';
  initialSessions?: SessionData[];
  onSessionSelect?: (sessionId: string) => void;
}

// Memoized session item component for better performance
interface SessionItemProps {
  session: SessionData;
  isActive: boolean;
  isDeleting?: boolean;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
}

const SessionItem = memo(function SessionItem({
  session,
  isActive,
  isDeleting = false,
  onSelect,
  onDelete,
}: SessionItemProps) {
  return (
    <div
      className={cn(
        "group relative",
        "px-3 sm:px-3.5 py-3 sm:py-2.5",
        "rounded-xl sm:rounded-lg",
        "cursor-pointer transition-all duration-200",
        "hover:bg-muted/60 active:bg-muted/80",
        "border",
        isActive
          ? "bg-primary/10 border-primary/30 shadow-md shadow-primary/5"
          : "border-transparent hover:border-border/60 bg-background/50"
      )}
      onClick={() => onSelect(session.id)}
    >
      <div className="flex items-center gap-2.5 sm:gap-2 w-full">
        {/* Title and indicator */}
        <div className="flex items-center gap-2.5 sm:gap-2 flex-1 min-w-0">
          {isActive && (
            <div className={cn(
              "h-2 w-2 sm:h-1.5 sm:w-1.5",
              "rounded-full bg-primary",
              "animate-pulse shrink-0",
              "ring-2 ring-primary/20"
            )} />
          )}
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm sm:text-[13px] font-semibold truncate",
              "leading-tight",
              isActive ? "text-primary" : "text-foreground"
            )}>
              {session.title || (session.messageCount > 0 ? 'New conversation' : 'New chat')}
            </p>
            {session.messageCount > 0 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5 truncate">
                {session.messageCount} {session.messageCount === 1 ? 'message' : 'messages'}
              </p>
            )}
          </div>
        </div>
        
        {/* Delete button - always visible with better mobile styling */}
        <div className="shrink-0 flex items-center justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeleting}
                className={cn(
                  "min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px]",
                  "h-9 w-9 sm:h-8 sm:w-8",
                  "transition-all duration-200",
                  "opacity-100", // Always fully visible
                  "text-destructive hover:text-destructive",
                  "hover:bg-destructive/20 active:bg-destructive/30",
                  "rounded-lg sm:rounded-md",
                  "border-2 border-destructive/50 hover:border-destructive/70",
                  "bg-destructive/15 hover:bg-destructive/20", // More visible background
                  "shadow-sm hover:shadow-md hover:shadow-destructive/10",
                  "ring-1 ring-destructive/20 hover:ring-destructive/30",
                  isDeleting && "opacity-60 cursor-not-allowed"
                )}
                onClick={(e) => e.stopPropagation()}
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this conversation and all its messages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export function ChatHistoryClient({ chatType, initialSessions = [], onSessionSelect }: ChatHistoryClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [sessions, setSessions] = useState<SessionData[]>(initialSessions);
  const [isLoading, setIsLoading] = useState(!initialSessions.length);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const { data: session, isPending: isAuthPending } = useSession();
  const isAuthenticated = !!session?.user;
  const { open: openAuthModal } = useAuthModal();
  const { toast } = useToast();
  
  // Zustand store for reactive updates
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const setCurrentSession = useChatStore((state) => state.setCurrentSession);
  const createSession = useChatStore((state) => state.createSession);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const syncFromDatabase = useChatStore((state) => state.syncFromDatabase);

  // Load sessions from server action on mount if not provided
  useEffect(() => {
    // CRITICAL: If currentSessionId is set (user selected a session), NEVER load
    // This prevents overriding the user's selection
    if (currentSessionId) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistoryClient] 🚫 BLOCKED initial load - user selected session:', currentSessionId);
      }
      setIsLoading(false);
      return;
    }

    const loadSessions = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const serverSessions = await getChatSessions(chatType);
        setSessions(serverSessions);
        
        // CRITICAL: Check again if currentSessionId was set while fetching
        const currentState = useChatStore.getState();
        if (currentState.currentSessionId) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistoryClient] 🚫 User selected session during fetch, skipping sync');
          }
          setIsLoading(false);
          return;
        }
        
          // Sync to store - merge sessions, don't replace (preserves user-selected sessions)
          if (serverSessions.length > 0) {
            const sessionsToSync = serverSessions.map((s) => ({
              id: s.id,
              chatType: s.chatType,
              title: s.title || undefined,
              messages: s.lastMessage ? [{
                id: s.lastMessage.id,
                role: s.lastMessage.role,
                content: s.lastMessage.content,
                timestamp: new Date(s.lastMessage.timestamp),
              }] : [],
              updatedAt: new Date(s.updatedAt),
            }));
            
            // CRITICAL: Don't use replaceForChatType on initial load
            // This preserves local sessions that haven't been saved to DB yet
            syncFromDatabase(sessionsToSync);
          
          // Set current session if none is set (don't override user selection)
          // Double-check currentSessionId is still null
          const finalState = useChatStore.getState();
          if (!finalState.currentSessionId) {
            const matchingSession = serverSessions.find((s) => s.chatType === chatType);
            if (matchingSession) {
              setCurrentSession(matchingSession.id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load if we don't have initial sessions
    if (initialSessions.length === 0) {
      loadSessions();
    } else {
      // CRITICAL: Check if currentSessionId is set before syncing initial sessions
      if (currentSessionId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistoryClient] 🚫 BLOCKED initial sync - user selected session:', currentSessionId);
        }
        return;
      }

      // Sync initial sessions to store
      const sessionsToSync = initialSessions.map((s) => ({
        id: s.id,
        chatType: s.chatType,
        title: s.title || undefined,
        messages: s.lastMessage ? [{
          id: s.lastMessage.id,
          role: s.lastMessage.role,
          content: s.lastMessage.content,
          timestamp: new Date(s.lastMessage.timestamp),
        }] : [],
        updatedAt: new Date(s.updatedAt),
      }));
      
      // CRITICAL: Don't use replaceForChatType - preserve local sessions
      syncFromDatabase(sessionsToSync);
      
      // Double-check before setting
      const finalCheckState = useChatStore.getState();
      if (!finalCheckState.currentSessionId) {
        const matchingSession = initialSessions.find((s) => s.chatType === chatType);
        if (matchingSession) {
          setCurrentSession(matchingSession.id);
        }
      }
    }
  }, [chatType, isAuthenticated, currentSessionId, syncFromDatabase, setCurrentSession]); // Added currentSessionId to deps

  // Only render after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Refresh sessions periodically or when chatType changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshSessions = async () => {
      // CRITICAL: If currentSessionId is set (user selected a session), skip refresh
      // This prevents interfering with the user's selected conversation
      const currentState = useChatStore.getState();
      if (currentState.currentSessionId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistoryClient] 🚫 BLOCKED periodic refresh - user selected session:', currentState.currentSessionId);
        }
        return;
      }

      try {
        const serverSessions = await getChatSessions(chatType);
        setSessions(serverSessions);
        
        // Double-check before syncing
        const checkState = useChatStore.getState();
        if (checkState.currentSessionId) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistoryClient] 🚫 User selected session during refresh, skipping sync');
          }
          return;
        }
        
        if (serverSessions.length > 0) {
          const sessionsToSync = serverSessions.map((s) => ({
            id: s.id,
            chatType: s.chatType,
            title: s.title || undefined,
            messages: s.lastMessage ? [{
              id: s.lastMessage.id,
              role: s.lastMessage.role,
              content: s.lastMessage.content,
              timestamp: new Date(s.lastMessage.timestamp),
            }] : [],
            updatedAt: new Date(s.updatedAt),
          }));
          // CRITICAL: Don't use replaceForChatType on periodic refresh
          // This preserves local sessions that haven't been saved to DB yet (waiting for title)
          // Only merge, don't replace - this prevents the current conversation from closing
          syncFromDatabase(sessionsToSync);
        } else {
          // No server sessions - but DON'T clear local sessions on periodic refresh
          // They might be new sessions waiting to be saved
          // Only clear on initial load if explicitly needed
        }
      } catch (error) {
        console.error('Failed to refresh sessions:', error);
      }
    };

    // Refresh every 30 seconds to catch new sessions
    const interval = setInterval(refreshSessions, 30000);
    return () => clearInterval(interval);
  }, [chatType, isAuthenticated, syncFromDatabase]);

  // Merge server sessions with store sessions for display
  // IMPORTANT: Only show sessions with messages OR the current active session
  // This prevents empty "New Chat" sessions from appearing in history
  // until the user actually starts a conversation
  const displaySessions = useMemo(() => {
    const storeSessions = useChatStore.getState().sessions;
    const currentSessionId = useChatStore.getState().currentSessionId;
    const storeSessionArray = Object.values(storeSessions).filter(
      (s) => s.chatType === chatType
    );
    
    // Combine server sessions with store sessions
    // Store sessions take precedence (they have latest updates)
    const sessionMap = new Map<string, SessionData>();
    
    // Add server sessions (these should all have messages since they're from DB)
    sessions.forEach((s) => {
      sessionMap.set(s.id, s);
    });
    
    // Update with store sessions (which may have newer data)
    storeSessionArray.forEach((s) => {
      const existing = sessionMap.get(s.id);
      const hasMessages = s.messages && s.messages.length > 0;
      const isCurrentSession = s.id === currentSessionId;
      
      // Only include sessions with messages OR the current active session
      if (!hasMessages && !isCurrentSession) {
        return; // Skip empty sessions that aren't active
      }
      
      if (existing) {
        // Update with store data
        sessionMap.set(s.id, {
          ...existing,
          title: s.title || existing.title,
          messageCount: s.messages?.length || existing.messageCount,
          updatedAt: s.updatedAt,
        });
      } else {
        // New session from store
        sessionMap.set(s.id, {
          id: s.id,
          chatType: s.chatType,
          title: s.title,
          messageCount: s.messages?.length || 0,
          lastMessage: s.messages && s.messages.length > 0 ? (() => {
            const msg = s.messages[s.messages.length - 1];
            let timestamp: Date;
            if (msg.timestamp instanceof Date) {
              timestamp = msg.timestamp;
            } else if (msg.timestamp) {
              timestamp = new Date(msg.timestamp);
            } else {
              timestamp = new Date();
            }
            return {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp,
            };
          })() : undefined,
          updatedAt: s.updatedAt,
        });
      }
    });
    
    return Array.from(sessionMap.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }, [sessions, chatType]);

  const handleNewChat = () => {
    const newSessionId = createSession(chatType);
    setCurrentSession(newSessionId);
    
    // NOTE: Session is created locally but NOT saved to database until AI generates a title
    // The session will be saved automatically after the first AI response generates a title
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistory] Created new session locally:', newSessionId);
      console.log('[ChatHistory] Session will be saved to database after AI generates title');
    }
    
    // Add the new session to the display list immediately so it appears in the UI
    // The displaySessions useMemo will pick it up from the store
    const storeState = useChatStore.getState();
    const newSession = storeState.sessions[newSessionId];
    if (newSession) {
      // Add to local sessions state so it appears immediately
      const lastMsg = newSession.messages && newSession.messages.length > 0 
        ? newSession.messages[newSession.messages.length - 1] 
        : null;
      
      let lastMessage: SessionData['lastMessage'] = undefined;
      if (lastMsg) {
        // Ensure timestamp is always a Date (not optional)
        const timestamp: Date = lastMsg.timestamp instanceof Date 
          ? lastMsg.timestamp 
          : lastMsg.timestamp 
            ? new Date(lastMsg.timestamp) 
            : new Date();
        
        lastMessage = {
          id: lastMsg.id,
          role: lastMsg.role,
          content: lastMsg.content,
          timestamp, // Now guaranteed to be Date, not Date | undefined
        };
      }
      
      const newSessionData: SessionData = {
        id: newSession.id,
        chatType: newSession.chatType,
        title: newSession.title,
        messageCount: newSession.messages?.length || 0,
        lastMessage,
        updatedAt: newSession.updatedAt,
      };
      
      setSessions(prev => {
        // Check if session already exists
        if (prev.find(s => s.id === newSessionId)) {
          return prev;
        }
        // Add new session at the beginning (most recent first)
        return [newSessionData, ...prev];
      });
    }
    
    onSessionSelect?.(newSessionId);
  };

  const handleSessionSelect = async (sessionId: string) => {
    // Set loading state
    setLoadingSessionId(sessionId);
    
    // Set current session immediately so chat panel knows which session to use
    // This will update the lock in chat-panel.tsx to allow switching between conversations
    setCurrentSession(sessionId);
    onSessionSelect?.(sessionId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistoryClient] ✅ Switching to session:', sessionId);
      console.log('[ChatHistoryClient] Lock will be updated in chat-panel.tsx');
    }
    
    // Get current local messages first (might have optimistic updates)
    const storeState = useChatStore.getState();
    const localSession = storeState.sessions[sessionId];
    const localMessages = localSession?.messages || [];
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatHistory] Local messages:', localMessages.length);
    }
    
    // If not authenticated, use local messages only
    if (!isAuthenticated) {
      setLoadingSessionId(null);
      if (localMessages.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistory] Not authenticated, using', localMessages.length, 'local messages');
        }
        // Messages are already in store, just ensure session is current
        return;
      }
      return;
    }
    
    // Load messages from database
    try {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`, {
        credentials: 'include',
      });
      
      if (response.status === 401) {
        openAuthModal('sign-in');
        setLoadingSessionId(null);
        return;
      }
      
      // Handle 404 - session doesn't exist in database yet (normal for new sessions)
      if (response.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistory] Session not in database yet (new session):', sessionId);
        }
        // Use local messages from store - this is expected for new sessions
        const { sessions } = useChatStore.getState();
        const localSession = sessions[sessionId];
        if (localSession && localSession.messages && localSession.messages.length > 0) {
          // Session exists locally with messages, use those
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] Using local messages for new session:', localSession.messages.length);
          }
        }
        setLoadingSessionId(null);
        return; // Session will be saved to DB after AI generates title
      }
      
      if (response.ok) {
        const { messages: dbMessages } = await response.json();
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistory] Loaded', dbMessages?.length || 0, 'messages from database');
        }
        
        const { addMessages } = useChatStore.getState();
        
        if (dbMessages && dbMessages.length > 0) {
          // Format database messages
          interface DbMessage {
            id: string;
            role: 'user' | 'assistant';
            content: string;
            timestamp: string | Date;
          }
          const formattedMessages = dbMessages.map((m: DbMessage): Message => ({
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
          
          // Check if we have local messages that aren't in database (optimistic updates)
          const dbMessageIds = new Set(formattedMessages.map((m: Message) => m.id));
          const unsavedLocalMessages = localMessages.filter((m: Message) => !dbMessageIds.has(m.id));
          
          // Find database messages that aren't in local (new messages from other devices)
          const localMessageIds = new Set(localMessages.map((m: Message) => m.id));
          const newDbMessages = formattedMessages.filter((m: Message) => !localMessageIds.has(m.id));
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] Found', unsavedLocalMessages.length, 'unsaved local messages (optimistic updates)');
            console.log('[ChatHistory] Found', newDbMessages.length, 'new database messages');
            console.log('[ChatHistory] Database messages:', formattedMessages.map((m: Message) => `${m.role}: ${m.content.substring(0, 30)}...`));
          }
          
          // DON'T clear the session - merge messages to preserve optimistic updates
          // Only add new messages from database that don't exist locally
          if (newDbMessages.length > 0) {
            addMessages(sessionId, newDbMessages);
          }
          
          // Ensure unsaved local messages (optimistic updates) are preserved
          if (unsavedLocalMessages.length > 0) {
            // Check if they're already in the store
            const currentStoreState = useChatStore.getState();
            const currentSession = currentStoreState.sessions[sessionId];
            const currentMessageIds = new Set((currentSession?.messages || []).map((m: Message) => m.id));
            const missingMessages = unsavedLocalMessages.filter((m: Message) => !currentMessageIds.has(m.id));
            
            if (missingMessages.length > 0) {
              addMessages(sessionId, missingMessages);
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            const finalMessages = useChatStore.getState().sessions[sessionId]?.messages || [];
            console.log('[ChatHistory] ✅ Total messages after load:', finalMessages.length);
            console.log('[ChatHistory] Messages breakdown:', {
              user: finalMessages.filter(m => m.role === 'user').length,
              assistant: finalMessages.filter(m => m.role === 'assistant').length,
            });
          }
        } else if (localMessages.length > 0) {
          // No database messages but we have local messages - keep them
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] No database messages, keeping', localMessages.length, 'local messages');
          }
          // Messages are already in store, no need to reload
          // DON'T clear - preserve local messages
        } else {
          // No messages at all - but DON'T clear the session
          // The session might be new and waiting for first message
          // Clearing it would cause the conversation to disappear
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatHistory] No messages found, but keeping session alive');
          }
        }
      } else {
        console.error('[ChatHistory] Failed to load messages:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[ChatHistory] Error loading messages:', error);
      // On error, keep local messages if available
      if (localMessages.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistory] Error loading from database, using', localMessages.length, 'local messages');
        }
      }
    } finally {
      // Clear loading state
      setLoadingSessionId(null);
    }
  };

  const handleClearAllConversations = async (options?: { emptyOnly?: boolean; noTitleOnly?: boolean }) => {
    if (isClearingAll) return;
    
    setIsClearingAll(true);
    
    try {
      const params = new URLSearchParams();
      if (chatType) {
        params.append('chatType', chatType);
      }
      if (options?.emptyOnly) {
        params.append('emptyOnly', 'true');
      }
      if (options?.noTitleOnly) {
        params.append('noTitleOnly', 'true');
      }
      
      const response = await fetch(`/api/chat/sessions/clear?${params.toString()}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          openAuthModal('sign-in');
          return;
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to clear conversations: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Clear all sessions from local store that match the chatType
      const storeState = useChatStore.getState();
      const sessionsToDelete = Object.values(storeState.sessions)
        .filter(s => s.chatType === chatType)
        .map(s => s.id);
      
      sessionsToDelete.forEach(id => {
        deleteSession(id);
      });
      
      // Clear current session if it was deleted
      if (currentSessionId && sessionsToDelete.includes(currentSessionId)) {
        setCurrentSession(null);
      }
      
      // Refresh from server to ensure we have the latest state (should be empty)
      if (isAuthenticated) {
        try {
          const serverSessions = await getChatSessions(chatType);
          setSessions(serverSessions);
          
          // Clear store completely for this chatType - don't merge, replace
          if (serverSessions.length === 0) {
            // If no server sessions, clear all local sessions for this chatType
            const allLocalSessions = Object.values(useChatStore.getState().sessions)
              .filter(s => s.chatType === chatType);
            allLocalSessions.forEach(s => deleteSession(s.id));
          } else {
            // Sync only the server sessions (replace, don't merge)
            const sessionsToSync = serverSessions.map((s) => ({
              id: s.id,
              chatType: s.chatType,
              title: s.title || undefined,
              messages: s.lastMessage ? [{
                id: s.lastMessage.id,
                role: s.lastMessage.role,
                content: s.lastMessage.content,
                timestamp: new Date(s.lastMessage.timestamp),
              }] : [],
              updatedAt: new Date(s.updatedAt),
            }));
            syncFromDatabase(sessionsToSync, chatType);
          }
        } catch (error) {
          console.error('[ChatHistory] Failed to refresh after clear:', error);
        }
      } else {
        // Not authenticated - just clear local state
        setSessions([]);
      }
      
      // Show success toast
      toast({
        title: 'Conversations cleared',
        description: result.message || `Deleted ${result.deletedCount} conversation${result.deletedCount !== 1 ? 's' : ''}`,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] ✅ Cleared all conversations:', result);
      }
    } catch (error) {
      console.error('[ChatHistory] Failed to clear conversations:', error);
      
      toast({
        title: 'Failed to clear conversations',
        description: error instanceof Error ? error.message : 'An error occurred while clearing conversations.',
        variant: 'destructive',
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    // Prevent double deletion
    if (deletingSessionId === sessionId) return;
    
    setDeletingSessionId(sessionId);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] Deleting session:', sessionId);
      }
      
      // Optimistically remove from UI immediately for smooth UX
      const sessionToDelete = sessions.find(s => s.id === sessionId);
      deleteSession(sessionId);
      
      // If this was the current session, switch to another one or clear
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0].id);
          onSessionSelect?.(remainingSessions[0].id);
        } else {
          setCurrentSession(null);
        }
      }
      
      // Update local state immediately
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // Delete from database
      const response = await fetch(`/api/chat/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          openAuthModal('sign-in');
          // Restore session on auth error
          if (sessionToDelete) {
            setSessions(prev => [...prev, sessionToDelete].sort((a, b) => 
              b.updatedAt.getTime() - a.updatedAt.getTime()
            ));
          }
          return;
        }
        
        // Restore session on error
        if (sessionToDelete) {
          setSessions(prev => [...prev, sessionToDelete].sort((a, b) => 
            b.updatedAt.getTime() - a.updatedAt.getTime()
          ));
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to delete session: ${response.status}`);
      }
      
      // Success - refresh from server to ensure consistency
      if (isAuthenticated) {
        try {
          const serverSessions = await getChatSessions(chatType);
          setSessions(serverSessions);
          
          if (serverSessions.length > 0) {
            const sessionsToSync = serverSessions.map((s) => ({
              id: s.id,
              chatType: s.chatType,
              title: s.title || undefined,
              messages: s.lastMessage ? [{
                id: s.lastMessage.id,
                role: s.lastMessage.role,
                content: s.lastMessage.content,
                timestamp: new Date(s.lastMessage.timestamp),
              }] : [],
              updatedAt: new Date(s.updatedAt),
            }));
            syncFromDatabase(sessionsToSync, chatType);
          }
        } catch (error) {
          console.error('[ChatHistory] Failed to refresh sessions after delete:', error);
          // Don't show error to user - deletion succeeded, just refresh failed
        }
      }
      
      // Show success toast
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been permanently deleted.',
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatHistory] ✅ Session deleted successfully');
      }
    } catch (error) {
      console.error('[ChatHistory] Failed to delete session:', error);
      
      // Show error toast
      toast({
        title: 'Failed to delete conversation',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the conversation.',
        variant: 'destructive',
      });
    } finally {
      setDeletingSessionId(null);
    }
  };

  // Show auth prompt if not authenticated
  if (!isAuthenticated && !isAuthPending && isMounted) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Conversations</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sign in to view your chat history
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="text-center max-w-sm w-full">
            <div className="inline-block p-4 sm:p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-5 sm:mb-6 border border-primary/20">
              <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <p className="text-base sm:text-lg font-semibold text-foreground mb-2">Sign in Required</p>
            <p className="text-sm text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Sign in to access your chat history and continue conversations
            </p>
            <Button
              onClick={() => openAuthModal('sign-in')}
              size="default"
              className="w-full sm:w-auto min-w-[140px]"
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
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 sm:py-5 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight">Conversations</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {chatType === 'context-aware' ? 'Recipe chats' : 'Meal tracking chats'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-1 shrink-0">
            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleClearAllConversations({ emptyOnly: true, noTitleOnly: true })}
                className={cn(
                  "h-9 w-9 sm:h-8 sm:w-8 p-0",
                  "hover:bg-destructive/15 hover:text-destructive",
                  "active:bg-destructive/25",
                  "border border-destructive/30 hover:border-destructive/50",
                  "rounded-lg",
                  "transition-all duration-200"
                )}
                aria-label="Clear empty conversations without titles"
                disabled={!isAuthenticated || isClearingAll}
                title="Clear empty conversations"
              >
                {isClearingAll ? (
                  <Loader2 className="h-5 w-5 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Trash className="h-5 w-5 sm:h-4 sm:w-4" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className={cn(
                "h-9 w-9 sm:h-8 sm:w-8 p-0",
                "hover:bg-primary/15 hover:text-primary",
                "active:bg-primary/25",
                "border border-primary/30 hover:border-primary/50",
                "rounded-lg",
                "transition-all duration-200",
                "shadow-sm hover:shadow-md"
              )}
              aria-label="New chat"
              disabled={!isAuthenticated}
              title="New chat"
            >
              <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-1.5">
          {(isLoading || isAuthPending) ? (
            <div className="flex items-center justify-center py-12 sm:py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 sm:h-5 sm:w-5 animate-spin text-primary" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading conversations...</p>
              </div>
            </div>
          ) : displaySessions.length === 0 ? (
            <div className="text-center py-16 sm:py-20 px-4">
              <div className="inline-block p-4 sm:p-5 bg-muted/30 rounded-2xl mb-4 sm:mb-5">
                <History className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-foreground mb-2">No conversations yet</p>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Start chatting to see your conversation history here
              </p>
            </div>
          ) : (
            displaySessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                isActive={currentSessionId === session.id}
                isDeleting={deletingSessionId === session.id}
                onSelect={handleSessionSelect}
                onDelete={handleDeleteSession}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

