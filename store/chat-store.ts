import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types';

interface ChatSession {
  id: string;
  chatType: 'context-aware' | 'tool-selection';
  title?: string;
  messages: Message[];
  updatedAt: Date;
}

interface ChatStore {
  // Current active session
  currentSessionId: string | null;
  sessions: Record<string, ChatSession>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  createSession: (chatType: 'context-aware' | 'tool-selection', title?: string) => string;
  setCurrentSession: (sessionId: string | null) => void;
  addMessage: (sessionId: string, message: Message) => void;
  addMessages: (sessionId: string, messages: Message[]) => void;
  updateMessageStatus: (sessionId: string, messageId: string, status: Message['status']) => void;
  clearSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  getCurrentSession: () => ChatSession | null;
  getCurrentMessages: () => Message[];
  
  // Sync with database
  syncFromDatabase: (sessions: ChatSession[], replaceForChatType?: 'context-aware' | 'tool-selection') => void;
  markAsSaved: (sessionId: string) => void;
}

// Initial state for SSR - cached to ensure stable reference
const initialState: Pick<ChatStore, 'currentSessionId' | 'sessions'> = {
  currentSessionId: null,
  sessions: {},
};

// Cache the server snapshot result to avoid infinite loop warning
// Zustand requires the result to be cached, not just the function
const cachedServerSnapshot = initialState;

// getServerSnapshot must return the same cached object reference
const getServerSnapshot = () => cachedServerSnapshot;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      isLoading: false,
      isSaving: false,

      createSession: (chatType, title) => {
        const sessionId = crypto.randomUUID();
        const newSession: ChatSession = {
          id: sessionId,
          chatType,
          // Don't create a default title - let AI generate it after first message
          // Only use provided title if explicitly passed
          title: title || undefined,
          messages: [],
          updatedAt: new Date(),
        };
        
        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: newSession,
          },
          currentSessionId: sessionId,
        }));
        
        return sessionId;
      },

      setCurrentSession: (sessionId) => {
        const current = get().currentSessionId;
        
        // ABSOLUTE BLOCK: Never allow clearing if we have a valid session
        if (sessionId === null && current) {
          const session = get().sessions[current];
          if (session) {
            const stack = new Error().stack;
            if (process.env.NODE_ENV === 'development') {
              console.warn(`[ChatStore] 🚨🚨🚨 ABSOLUTELY BLOCKED clearing! Keeping: ${current}`);
              console.warn(`[ChatStore] Stack:`, stack?.split('\n').slice(0, 5).join('\n'));
            }
            return; // NEVER clear
          }
        }
        
        // Block setting to a different session if current session has messages
        // This prevents accidental switching when user has an active conversation
        if (sessionId !== null && sessionId !== current && current) {
          const currentSession = get().sessions[current];
          if (currentSession && currentSession.messages && currentSession.messages.length > 0) {
            // Only allow switch if explicitly requested (user clicked a different conversation)
            // For now, allow it but log it
            if (process.env.NODE_ENV === 'development') {
              console.log(`[ChatStore] Switching from session with ${currentSession.messages.length} messages: ${current} → ${sessionId}`);
            }
          }
        }
        
        // Log ALL changes
        if (process.env.NODE_ENV === 'development') {
          if (sessionId !== current) {
            const stack = new Error().stack;
            console.log(`[ChatStore] setCurrentSession: ${current} → ${sessionId}`);
            if (sessionId === null) {
              console.warn(`[ChatStore] ⚠️⚠️⚠️ Setting to NULL! Stack:`, stack?.split('\n').slice(0, 5).join('\n'));
            }
          }
        }
        
        set({ currentSessionId: sessionId });
        
        // Verify persistence immediately
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              const stored = localStorage.getItem('chat-storage');
              if (stored) {
                const parsed = JSON.parse(stored);
                const storedSessionId = parsed?.state?.currentSessionId;
                if (storedSessionId !== sessionId) {
                  console.warn(`[ChatStore] ⚠️ Persistence mismatch! Set: ${sessionId}, Stored: ${storedSessionId}`);
                } else {
                  console.log(`[ChatStore] ✅ Verified persistence: ${sessionId}`);
                }
              }
            } catch (e) {
              // Ignore errors
            }
          }, 100);
        }
      },

      addMessage: (sessionId, message) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[ChatStore] addMessage: Session not found', sessionId);
            }
            return state;
          }

          // Check for duplicate messages to prevent duplicates
          const existingIds = new Set(session.messages.map((m) => m.id));
          if (existingIds.has(message.id)) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[ChatStore] addMessage: Message already exists, skipping', message.id);
            }
            return state; // Don't add duplicate
          }

          const updatedMessages = [...session.messages, message];
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[ChatStore] ✅ addMessage: Added message to session ${sessionId}, total: ${updatedMessages.length}`);
            console.log(`[ChatStore] Message: ${message.role} - ${message.content.substring(0, 50)}...`);
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: updatedMessages,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      addMessages: (sessionId, messages) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          // Merge messages, avoiding duplicates
          const existingIds = new Set(session.messages.map((m) => m.id));
          const newMessages = messages.filter((m) => !existingIds.has(m.id));
          
          // Combine and sort by timestamp
          const allMessages = [...session.messages, ...newMessages].sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
            return timeA - timeB;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: allMessages,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      updateMessageStatus: (sessionId, messageId, status) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          const updatedMessages = session.messages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          );

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: updatedMessages,
              },
            },
          };
        });
      },

      clearSession: (sessionId) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [],
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const { [sessionId]: deleted, ...rest } = state.sessions;
          
          // If deleting the current session, switch to another one
          let newCurrentSessionId = state.currentSessionId;
          if (state.currentSessionId === sessionId) {
            // Try to find another session of the same chatType
            const deletedSession = deleted;
            const sameChatTypeSessions = Object.values(rest)
              .filter(s => s.chatType === deletedSession?.chatType);
            
            if (sameChatTypeSessions.length > 0) {
              // Switch to the most recent session of the same type
              const sorted = sameChatTypeSessions.sort((a, b) => 
                b.updatedAt.getTime() - a.updatedAt.getTime()
              );
              newCurrentSessionId = sorted[0].id;
            } else {
              // No other sessions of this type - set to null
              newCurrentSessionId = null;
            }
          }

          return {
            sessions: rest,
            currentSessionId: newCurrentSessionId,
          };
        });
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                title,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      getCurrentSession: () => {
        const state = get();
        if (!state.currentSessionId) return null;
        return state.sessions[state.currentSessionId] || null;
      },

      getCurrentMessages: () => {
        const session = get().getCurrentSession();
        return session?.messages || [];
      },

      syncFromDatabase: (sessions, replaceForChatType?: 'context-aware' | 'tool-selection') => {
        const sessionsMap: Record<string, ChatSession> = {};
        sessions.forEach((session) => {
          sessionsMap[session.id] = {
            id: session.id,
            chatType: session.chatType,
            title: session.title || undefined, // Preserve title from database
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map((msg) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            })),
          };
        });

        set((state) => {
          // If replaceForChatType is specified, remove all sessions of that type first
          let filteredSessions = { ...state.sessions };
          if (replaceForChatType) {
            filteredSessions = Object.fromEntries(
              Object.entries(state.sessions).filter(
                ([_, session]) => session.chatType !== replaceForChatType
              )
            );
          }
          
          // Merge database sessions with filtered local sessions
          // For sessions that exist in both, prefer database version (it's the source of truth)
          const mergedSessions = {
            ...filteredSessions,
            ...sessionsMap,
          };
          
          // CRITICAL: NEVER clear currentSessionId during sync - always preserve it
          // Even if the session doesn't exist in mergedSessions, keep currentSessionId
          // This prevents the conversation from closing when sessions are synced
          // The session might be loading or might exist locally but not in DB yet
          const preservedCurrentSessionId = state.currentSessionId;
          
          if (process.env.NODE_ENV === 'development' && state.currentSessionId) {
            const sessionExists = mergedSessions[state.currentSessionId];
            if (!sessionExists) {
              console.warn(`[ChatStore] ⚠️ syncFromDatabase: currentSessionId ${state.currentSessionId} not in merged sessions, but preserving it`);
            }
          }
          
          return {
            sessions: mergedSessions,
            currentSessionId: preservedCurrentSessionId, // ALWAYS preserve - never clear
          };
        });
      },

      markAsSaved: (sessionId) => {
        // This can be used to track which sessions need to be saved
        // For now, we'll just update the session
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                updatedAt: new Date(),
              },
            },
          };
        });
      },
    }),
    {
      name: 'chat-storage', // localStorage key
      partialize: (state) => ({
        // Only persist sessions and currentSessionId, not loading states
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
      // Fix SSR hydration issue - use cached function to avoid infinite loop
      getServerSnapshot,
      // Properly serialize/deserialize Date objects for client-side only
      storage: typeof window !== 'undefined' ? {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            if (parsed?.state?.sessions) {
              // Convert Date strings back to Date objects
              Object.keys(parsed.state.sessions).forEach((sessionId) => {
                const session = parsed.state.sessions[sessionId];
                if (session.updatedAt) {
                  session.updatedAt = new Date(session.updatedAt);
                }
                if (session.messages) {
                  session.messages = session.messages.map((msg: any) => ({
                    ...msg,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
                  }));
                }
              });
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Ensure we're saving the latest state
            const stateToSave = JSON.stringify(value);
            localStorage.setItem(name, stateToSave);
            
            if (process.env.NODE_ENV === 'development') {
              // Verify what we saved
              const saved = JSON.parse(localStorage.getItem(name) || '{}');
              const sessionCount = Object.keys(saved?.state?.sessions || {}).length;
              if (sessionCount > 0) {
                console.log(`[ChatStore] 💾 Persisted ${sessionCount} sessions to localStorage`);
              }
            }
          } catch (error) {
            console.error('Failed to save to localStorage:', error);
            // If localStorage is full, try to clear old data or warn user
            if (error instanceof Error && error.name === 'QuotaExceededError') {
              console.warn('[ChatStore] localStorage quota exceeded. Consider clearing old sessions.');
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.error('Failed to remove from localStorage:', error);
          }
        },
      } : undefined,
    }
  )
);

