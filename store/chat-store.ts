import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/types';

interface ChatSession {
  id: string;
  chatType: 'context-aware' | 'tool-selection';
  title?: string;
  messages: Message[];
  updatedAt: Date;
  isSynced?: boolean; // Track if session exists in database
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
          isSynced: false, // New sessions are not synced yet
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
        set((state) => {
          const sessionsMap: Record<string, ChatSession> = {};

          // Find the oldest session in the incoming batch to determine the sync window
          let oldestIncomingSession: Date | null = null;

          // Process incoming sessions
          sessions.forEach((session) => {
            const updatedAt = new Date(session.updatedAt);

            // Track oldest session for sync window
            if (!oldestIncomingSession || updatedAt < oldestIncomingSession) {
              oldestIncomingSession = updatedAt;
            }

            sessionsMap[session.id] = {
              id: session.id,
              chatType: session.chatType,
              title: session.title || undefined,
              updatedAt: updatedAt,
              messages: session.messages.map((msg) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
              })),
              isSynced: true, // Mark as synced since it came from DB
            };
          });

          // If replaceForChatType is specified, remove all sessions of that type first
          let filteredSessions = { ...state.sessions };
          if (replaceForChatType) {
            filteredSessions = Object.fromEntries(
              Object.entries(state.sessions).filter(
                ([_, session]) => session.chatType !== replaceForChatType
              )
            );
          } else {
            // SMART SYNC: Handle deletions for partial syncs
            // If we have a local session that is marked as synced (exists in DB)
            // BUT it is missing from the incoming batch
            // AND it is newer than the oldest incoming session (so it should be in the batch)
            // THEN it must have been deleted remotely -> Remove it

            const incomingIds = new Set(Object.keys(sessionsMap));

            filteredSessions = Object.fromEntries(
              Object.entries(state.sessions).filter(([id, session]) => {
                // Keep if it's in the incoming batch (will be merged later)
                if (incomingIds.has(id)) return true;

                // Keep if it's NOT synced (unsaved local session)
                if (!session.isSynced) return true;

                // If we have incoming sessions, check if this one should have been included
                if (oldestIncomingSession) {
                  // If this session is newer than the oldest incoming one,
                  // it SHOULD have been in the batch if it still existed.
                  // Since it's missing, it must be deleted.
                  if (session.updatedAt >= oldestIncomingSession) {
                    if (process.env.NODE_ENV === 'development') {
                      console.log(`[ChatStore] 🗑️ Removing deleted session: ${id} (${session.title})`);
                    }
                    return false; // Remove it
                  }
                } else if (sessions.length === 0 && session.chatType === sessions[0]?.chatType) {
                  // If incoming batch is empty, and we expected sessions for this type,
                  // then all synced sessions of this type are deleted.
                  // But we don't know the chatType if sessions is empty...
                  // Wait, if sessions is empty, we can't infer chatType easily unless passed.
                  // But usually getChatSessions returns empty array if no sessions.
                  // If we don't know the chatType, we can't safely delete.
                  // But typically syncFromDatabase is called with a specific list.
                  return true;
                }

                // Keep older sessions (might be paginated out)
                return true;
              })
            );
          }

          // Merge database sessions with filtered local sessions
          // For sessions that exist in both, we need to be careful
          const mergedSessions = { ...filteredSessions };

          Object.values(sessionsMap).forEach(dbSession => {
            const localSession = mergedSessions[dbSession.id];

            if (localSession) {
              // If session exists locally, merge carefully
              // Prefer DB title if available
              const title = dbSession.title || localSession.title;

              // For messages, we generally trust the DB, but we want to preserve
              // optimistic updates (messages that are local but not in DB yet)
              // This is complex, so for now we'll trust the DB if it has more messages
              // or if the local session has no messages
              let messages = dbSession.messages;

              if (localSession.messages.length > dbSession.messages.length) {
                // Local has more messages - likely optimistic updates
                // Keep local messages but update IDs/timestamps if they match
                // This is a simplification - ideally we'd merge by ID
                messages = localSession.messages;
              }

              mergedSessions[dbSession.id] = {
                ...dbSession,
                title,
                messages,
                // Keep the later update time
                updatedAt: localSession.updatedAt > dbSession.updatedAt ? localSession.updatedAt : dbSession.updatedAt,
                isSynced: true, // Confirm it's synced
              };
            } else {
              // New session from DB
              mergedSessions[dbSession.id] = dbSession;
            }
          });

          // CRITICAL: NEVER clear currentSessionId during sync - always preserve it
          const preservedCurrentSessionId = state.currentSessionId;

          return {
            sessions: mergedSessions,
            currentSessionId: preservedCurrentSessionId, // ALWAYS preserve - never clear
          };
        });
      },

      markAsSaved: (sessionId) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                updatedAt: new Date(),
                isSynced: true, // Mark as synced when saved
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

