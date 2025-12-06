'use client';

import { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
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
    role: Message['role'];
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

// Helper for date grouping
function getDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (checkDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (checkDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  if (checkDate > sevenDaysAgo) {
    return 'Previous 7 Days';
  }
  return 'Older';
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
        "group relative flex items-center gap-2 px-3 py-2.5 text-sm transition-all rounded-lg cursor-pointer",
        // ChatGPT-style: subtle left border when active
        isActive 
          ? "bg-accent/80 text-foreground before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:bg-primary before:rounded-r-full" 
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
      onClick={() => onSelect(session.id)}
    >
      {/* Chat icon for visual hint */}
      <div className={cn(
        "h-5 w-5 shrink-0 flex items-center justify-center rounded-md transition-colors",
        isActive ? "text-primary" : "text-muted-foreground/50"
      )}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      {/* Title - clean, single line */}
      <div className="flex-1 min-w-0 truncate font-medium">
        {session.title || (session.messageCount > 0 ? 'New conversation' : 'New chat')}
      </div>

      {/* Delete button - ONLY visible on hover (ChatGPT style) */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "h-7 w-7 shrink-0 flex items-center justify-center rounded-md transition-all",
              "opacity-0 group-hover:opacity-100", // Hidden until hover
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              "cursor-pointer"
            )}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
              }
            }}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </div>
        </AlertDialogTrigger>
        {/* @ts-expect-error - TS 4.9.5 doesn't infer Radix types correctly */}
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            {/* @ts-expect-error - TS 4.9.5 type inference issue */}
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            {/* @ts-expect-error - TS 4.9.5 type inference issue */}
            <AlertDialogDescription>
              This will permanently delete this conversation and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            {/* @ts-expect-error - TS 4.9.5 type inference issue */}
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            {/* @ts-expect-error - TS 4.9.5 type inference issue */}
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
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
  );
});

export function ChatHistoryClient({ chatType, initialSessions = [], onSessionSelect }: ChatHistoryClientProps) {
  // Initialize from store if available to prevent layout shift/loading
  const storeSessions = useChatStore((state) => state.sessions);
  const hasStoreSessions = Object.values(storeSessions).some(s => s.chatType === chatType);
  
  const [isMounted, setIsMounted] = useState(false);
  // Initialize with store sessions if available, otherwise initialSessions
  const [sessions, setSessions] = useState<SessionData[]>(() => {
    if (initialSessions.length > 0) return initialSessions;
    
    // Convert store sessions to SessionData format
    const storeSessionList = Object.values(storeSessions)
      .filter(s => s.chatType === chatType)
      .map(s => ({
        id: s.id,
        chatType: s.chatType,
        title: s.title,
        messageCount: s.messages.length,
        lastMessage: s.messages.length > 0 ? {
          id: s.messages[s.messages.length - 1].id,
          role: s.messages[s.messages.length - 1].role,
          content: s.messages[s.messages.length - 1].content,
          timestamp: s.messages[s.messages.length - 1].timestamp || new Date(),
        } : undefined,
        updatedAt: s.updatedAt,
      }));
      
    return storeSessionList.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  });

  const [isLoading, setIsLoading] = useState(() => {
    // If we have sessions from store or props, don't show loading
    return !hasStoreSessions && initialSessions.length === 0;
  });
  
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const { data: session, isPending: isAuthPending } = useSession();
  const isAuthenticated = !!session?.user;
  const { open: openAuthModal } = useAuthModal();
  const { toast } = useToast();
  
  // Track if we've already loaded to prevent duplicate fetches
  const hasLoadedRef = useRef(false);
  
  // Zustand store for reactive updates
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const setCurrentSession = useChatStore((state) => state.setCurrentSession);
  const createSession = useChatStore((state) => state.createSession);
  const deleteSession = useChatStore((state) => state.deleteSession);
  const syncFromDatabase = useChatStore((state) => state.syncFromDatabase);

  // Load sessions from server action on mount if not provided
  // This effect runs ONCE on mount to load initial data
  useEffect(() => {
    // Prevent duplicate loads - only run once
    if (hasLoadedRef.current) {
      return;
    }

    const loadSessions = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        // Only show loading if we don't have data yet
        if (!hasStoreSessions && sessions.length === 0) {
          setIsLoading(true);
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatHistoryClient] 📥 Loading sessions from server (background refresh)');
        }
        
        const serverSessions = await getChatSessions(chatType);
        setSessions(serverSessions);
        
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
          
          syncFromDatabase(sessionsToSync);
        
          // Auto-select the most recent session if none is set
          // serverSessions are already sorted by updatedAt descending, so first = most recent
          const finalState = useChatStore.getState();
          if (!finalState.currentSessionId && serverSessions.length > 0) {
            const mostRecentSession = serverSessions[0]; // Already sorted, first is most recent
            if (mostRecentSession.chatType === chatType) {
              setCurrentSession(mostRecentSession.id);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[ChatHistoryClient] 🎯 Auto-selected most recent chat:', mostRecentSession.id, mostRecentSession.title);
              }
            }
          }
        }
      } catch (error) {
        console.error('[ChatHistoryClient] Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
        hasLoadedRef.current = true; // Mark as loaded
      }
    };

    // Always try to refresh from server in background to get latest updates
    // But don't block UI if we have store data
    loadSessions();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run ONCE on mount only

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
    
    return Array.from(sessionMap.values()).sort((a, b) => {
      // Primary sort: updatedAt (newest first)
      const timeDiff = b.updatedAt.getTime() - a.updatedAt.getTime();
      if (timeDiff !== 0) return timeDiff;
      // Secondary sort: id (stable, deterministic)
      return b.id.localeCompare(a.id);
    });
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

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, SessionData[]> = {};
    displaySessions.forEach(session => {
      const group = getDateGroup(new Date(session.updatedAt));
      if (!groups[group]) groups[group] = [];
      groups[group].push(session);
    });
    return groups;
  }, [displaySessions]);

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

  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* New Chat Button - Full width, prominent (ChatGPT style) */}
      <div className="p-3 border-b border-border/30">
        <Button
          onClick={handleNewChat}
          variant="outline"
          className="w-full justify-start gap-3 h-10 px-3 text-sm font-medium border-border/50 hover:bg-muted/50"
          disabled={!isAuthenticated}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Scrollable content */}
      {/* @ts-ignore - TS 4.9.5 type inference issue with Radix ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="py-3 space-y-4">
          {(isLoading || isAuthPending) ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-xs">Loading...</p>
            </div>
          ) : displaySessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                <History className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-4 px-2">
              {groupOrder.map(group => {
                const groupSessions = groupedSessions[group];
                if (!groupSessions || groupSessions.length === 0) return null;

                return (
                  <div key={group}>
                    <h4 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wide">{group}</h4>
                    <div className="space-y-0.5">
                      {groupSessions.map((session) => (
                        <SessionItem
                          key={session.id}
                          session={session}
                          isActive={currentSessionId === session.id}
                          isDeleting={deletingSessionId === session.id}
                          onSelect={handleSessionSelect}
                          onDelete={handleDeleteSession}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

