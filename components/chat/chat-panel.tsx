'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Message } from '@/types';
import { generateSessionTitle } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chat-store';
import { useChatSync } from '@/hooks/use-chat-sync';
import { useOfflineChat } from '@/hooks/use-offline-chat';
import { useSession } from '@/lib/auth-client';
import { useAuthModal } from '@/components/AuthModalProvider';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { EmptyScreen } from './empty-screen';
import { ToolProgress, type ExecutionProgressData } from './tool-progress';
import { logger } from '@/utils/logger';
import { fetchWithRetry } from '@/utils/api-retry';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

// Cache empty arrays outside component to ensure stable references
const EMPTY_MESSAGES: Message[] = [];

export function ChatPanel({
  chatType,
  preferencesSummary = '',
}: {
  chatType: 'context-aware' | 'tool-selection';
  preferencesSummary?: string;
}) {
  const [toolProgress, setToolProgress] = useState<ExecutionProgressData | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Zustand store
  const currentSessionId = useChatStore((state) => state.currentSessionId);
  const getCurrentSession = useChatStore((state) => state.getCurrentSession);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const clearSession = useChatStore((state) => state.clearSession);
  const createSession = useChatStore((state) => state.createSession);
  const setCurrentSession = useChatStore((state) => state.setCurrentSession);
  const updateSessionTitle = useChatStore((state) => state.updateSessionTitle);
  
  // Auth
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const { open: openAuthModal } = useAuthModal();
  
  const titleGeneratedRef = useRef<string | null>(null);
  const lockedSessionRef = useRef<string | null>(null);
  const lockInitializedRef = useRef(false);
  const isUserSubmittingRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialScrolledRef = useRef(false);
  const [finalSessionId, setFinalSessionId] = useState<string | null>(null);
  const sessionInitializedRef = useRef(false);
  
  // Initialize session ID - must be done in useEffect to avoid state update during render
  useEffect(() => {
    // Only run once
    if (sessionInitializedRef.current) return;
    sessionInitializedRef.current = true;

    // Initialize lock from localStorage to prevent creating new session on refresh
    if (!lockInitializedRef.current && typeof window !== 'undefined') {
      lockInitializedRef.current = true;
      try {
        const stored = localStorage.getItem('chat-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          const storedSessionId = parsed?.state?.currentSessionId;
          if (storedSessionId) {
            lockedSessionRef.current = storedSessionId;
          }
        }
      } catch (e) { /* Ignore */ }
    }

    // Determine session ID
    if (currentSessionId) {
      if (lockedSessionRef.current !== currentSessionId) {
        lockedSessionRef.current = currentSessionId;
        titleGeneratedRef.current = null;
      }
      setFinalSessionId(currentSessionId);
    } else if (lockedSessionRef.current) {
      setFinalSessionId(lockedSessionRef.current);
    } else {
      // Create new session only after mount
      const newSessionId = createSession(chatType);
      titleGeneratedRef.current = null;
      setFinalSessionId(newSessionId);
    }
  }, [currentSessionId, createSession, chatType]);

  // Update session ID when currentSessionId changes (after initial mount)
  useEffect(() => {
    if (!sessionInitializedRef.current) return; // Wait for initial mount
    
    if (currentSessionId && currentSessionId !== finalSessionId) {
      if (lockedSessionRef.current !== currentSessionId) {
        lockedSessionRef.current = currentSessionId;
        titleGeneratedRef.current = null;
      }
      setFinalSessionId(currentSessionId);
    }
  }, [currentSessionId, finalSessionId]);

  // Get initial messages from store
  const storeMessages = useChatStore((state) => {
    if (!finalSessionId) return EMPTY_MESSAGES;
    return state.sessions[finalSessionId]?.messages || EMPTY_MESSAGES;
  });

  // Sync with database
  const { saveToDatabase, clearFromDatabase } = useChatSync(
    isAuthenticated ? finalSessionId : null, 
    chatType
  );

  // Offline chat
  const { queueMessage } = useOfflineChat({
    sessionId: finalSessionId,
    chatType,
    onMessageQueued: (messageId) => {
      toast({ title: 'Message queued', description: 'Will send when online.' });
    },
    onMessageSynced: (messageId) => logger.log('Synced:', messageId),
  });

  // Vercel AI SDK useChat
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append, reload, data } = useChat({
    api: '/api/chat',
    id: finalSessionId || undefined, // Convert null to undefined for useChat
    initialMessages: storeMessages,
    body: {
      sessionId: finalSessionId || undefined, // Convert null to undefined
      chatType,
      preferencesSummary,
    },
    onFinish: async (message) => {
      isUserSubmittingRef.current = false;
      if (!finalSessionId) return;
      
      // Extract UI data from the stream data
      let uiData: any = null;
      if (data && data.length > 0) {
        console.log('[ChatPanel] Stream data received. Length:', data.length);
        console.log('[ChatPanel] Full data array:', JSON.stringify(data, null, 2));
        
        // Find ui_data events in the stream data
        for (const item of data) {
          console.log('[ChatPanel] Checking item:', item, 'Type:', (item as any)?.type);
          if (item && typeof item === 'object' && (item as any).type === 'ui_data') {
            console.log('[ChatPanel] ✅ Found UI data:', (item as any).content);
            uiData = (item as any).content;
            
            // Trigger toast if present in UI data (e.g. for modifyMealPlan)
            if (uiData?.toast) {
              toast({
                title: 'Success',
                description: uiData.toast,
              });
            }
            
            break; // Use the first (or last) ui_data we find
          }
        }
        
        if (!uiData) {
          console.log('[ChatPanel] ⚠️ No ui_data found in stream data');
        }
      } else {
        console.log('[ChatPanel] ⚠️ No stream data received or empty array');
      }
      
      // Sync assistant message to store WITH UI data
      const assistantMsg: Message = {
        id: message.id,
        role: 'assistant',
        content: message.content,
        timestamp: message.createdAt || new Date(),
        toolInvocations: message.toolInvocations,
        ui: uiData, // Attach the UI data here!
      };
      
      addMessage(finalSessionId, assistantMsg);
      
      // Get current messages (both user and assistant messages are now in store)
      const currentMessages = useChatStore.getState().sessions[finalSessionId]?.messages || [];
      
      // Generate Title if needed and create session BEFORE saving messages
      // This ensures sessions are only saved when they have a proper title
      if (currentMessages.length === 2 && !titleGeneratedRef.current) {
        titleGeneratedRef.current = finalSessionId;
        try {
          const title = await generateSessionTitle(currentMessages);
          if (title && title !== 'New Chat') {
            // Create the session with the generated title
            const createResponse = await fetchWithRetry('/api/chat/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                sessionId: finalSessionId,
                chatType,
                title 
              }),
            });

            if (createResponse.ok) {
              // Update local store
              updateSessionTitle(finalSessionId, title);
              
              // Now save the messages since the session exists
              saveToDatabase(currentMessages);
            } else {
              const errorText = await createResponse.text();
              console.error('Failed to create session with title:', errorText);
              // Don't save messages if session creation failed
            }
          } else {
            // Title generation returned "New Chat" or empty - don't create session
            // Messages won't be saved, preventing empty sessions in history
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatPanel] Title generation returned invalid title, skipping session creation');
            }
          }
        } catch (e) {
          console.error('Title generation or session creation failed', e);
          // Don't save messages if session creation failed
        }
      } else if (currentMessages.length > 2) {
        // Session should already exist if we have more than 2 messages
        // Save messages normally
        saveToDatabase(currentMessages);
      }
      // If we have less than 2 messages, don't save yet (wait for title generation)
    },
    onError: (error) => {
      isUserSubmittingRef.current = false;
      console.error('[ChatPanel] useChat error:', error);
      toast({
        title: 'Message failed',
        description: 'There was an issue connecting to the AI. Please try again.',
        variant: 'destructive',
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => reload()}
            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
          >
            Retry
          </Button>
        ),
      });
    }
  });

  // Sync store messages to useChat when session changes
   // CRITICAL: Don't sync during streaming or we'll overwrite the streaming message!
useEffect(() => {
if (!isLoading && !isUserSubmittingRef.current) {
setMessages(storeMessages);
}
}, [finalSessionId, storeMessages, isLoading, setMessages]);


  // We need to override the default submit handler to use append() so we can control the ID
  const handleManualSubmit = async (value: string) => {
     if (!value.trim()) return;
     if (!isAuthenticated) {
        openAuthModal('sign-in');
        return;
     }

     // Wait for session to be initialized
     if (!finalSessionId) {
        toast({
          title: 'Initializing...',
          description: 'Please wait a moment and try again.',
        });
        return;
     }

     if (!navigator.onLine) {
        queueMessage(value.trim());
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
        return;
     }

     const messageId = crypto.randomUUID();
     const userMsg: Message = {
        id: messageId,
        role: 'user',
        content: value,
        timestamp: new Date(),
     };
     
     isUserSubmittingRef.current = true;
     addMessage(finalSessionId, userMsg);
     
     // Clear input
     handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
     
     // Append with same ID
     append({
        id: messageId,
        role: 'user',
        content: value,
     });
  };
  // Auto-scroll to bottom when chat first loads
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (messages.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length]);

  // Scroll during streaming
  useEffect(() => {
    if (!scrollContainerRef.current || !isLoading) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages, isLoading]);


  const handleClearChat = useCallback(async () => {
    if (!finalSessionId) return;
    clearSession(finalSessionId);
    await clearFromDatabase();
    setMessages([]); // Clear useChat state
    toast({ title: 'Chat cleared' });
  }, [finalSessionId, clearSession, clearFromDatabase, toast, setMessages]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full w-full relative"
      suppressHydrationWarning
    >
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="max-w-3xl mx-auto w-full pb-32 sm:pb-40 px-4">
          {messages.length === 0 ? (
            <EmptyScreen onExampleClick={(val) => {
               if (!isAuthenticated) {
                  openAuthModal('sign-in');
                  return;
               }
               if (!finalSessionId) {
                  toast({
                    title: 'Initializing...',
                    description: 'Please wait a moment and try again.',
                  });
                  return;
               }
               const messageId = crypto.randomUUID();
               const userMsg: Message = {
                  id: messageId,
                  role: 'user',
                  content: val,
                  timestamp: new Date(),
               };
               isUserSubmittingRef.current = true;
               addMessage(finalSessionId, userMsg);
               append({ 
                  id: messageId,
                  role: 'user', 
                  content: val 
               });
            }} />
          ) : (
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading}
              data={data}
              onActionClick={handleManualSubmit}
            />
          )}
        </div>
      </div>
      
      {/* Floating Input Container */}
      <div className="fixed bottom-0 right-0 z-50 px-4 pb-4 sm:pb-6 pointer-events-none left-0 md:left-[260px]">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <ChatInput 
              onSubmit={handleManualSubmit}
              isLoading={isLoading}
              disabled={!isAuthenticated}
              input={input}
              handleInputChange={handleInputChange}
            />
          </div>
      </div>
    </motion.div>
  );
}