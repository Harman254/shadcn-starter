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
  
  // Initialize lock from localStorage
  useEffect(() => {
    if (lockInitializedRef.current) return;
    lockInitializedRef.current = true;
    try {
      const stored = localStorage.getItem('chat-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedSessionId = parsed?.state?.currentSessionId;
        if (storedSessionId) lockedSessionRef.current = storedSessionId;
      }
    } catch (e) { /* Ignore */ }
  }, []);
  
  // Session Logic
  const finalSessionId = useMemo(() => {
    if (currentSessionId) {
      if (lockedSessionRef.current !== currentSessionId) {
        lockedSessionRef.current = currentSessionId;
        titleGeneratedRef.current = null;
      }
      return currentSessionId;
    }
    if (lockedSessionRef.current) return lockedSessionRef.current;
    const newSessionId = createSession(chatType);
    titleGeneratedRef.current = null;
    return newSessionId;
  }, [currentSessionId, createSession, chatType]);

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
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append } = useChat({
    api: '/api/chat',
    id: finalSessionId,
    initialMessages: storeMessages,
    body: {
      sessionId: finalSessionId,
      chatType,
      preferencesSummary,
    },
    onFinish: async (message) => {
      if (!finalSessionId) return;
      
      // Sync assistant message to store
      // Note: useChat's message type is slightly different, but compatible enough for storage
      // We might need to map it if strict typing is enforced
      const assistantMsg: Message = {
        id: message.id,
        role: 'assistant',
        content: message.content,
        timestamp: message.createdAt || new Date(),
        toolInvocations: message.toolInvocations,
      };
      
      addMessage(finalSessionId, assistantMsg);
      
      // Save to DB (both user and assistant messages are now in store)
      // We need to fetch the latest state to get the user message too
      const currentMessages = useChatStore.getState().sessions[finalSessionId]?.messages || [];
      saveToDatabase(currentMessages);

      // Generate Title if needed
      if (currentMessages.length === 2 && !titleGeneratedRef.current) {
        titleGeneratedRef.current = finalSessionId;
        try {
          const title = await generateSessionTitle(currentMessages);
          if (title && title !== 'New Chat') {
            updateSessionTitle(finalSessionId, title);
            fetchWithRetry(`/api/chat/sessions/${finalSessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
          }
        } catch (e) {
          console.error('Title generation failed', e);
        }
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Sync store messages to useChat when session changes
  useEffect(() => {
    setMessages(storeMessages);
  }, [finalSessionId]); 

  const onFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    if (!isAuthenticated) {
      openAuthModal('sign-in');
      return;
    }

    if (!navigator.onLine) {
      queueMessage(input.trim());
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      return;
    }

    // Optimistically add user message to store
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(finalSessionId, userMsg);
    
    // Trigger useChat submit
    handleSubmit(e);
  };

  const handleClearChat = useCallback(async () => {
    if (!finalSessionId) return;
    clearSession(finalSessionId);
    await clearFromDatabase();
    setMessages([]); // Clear useChat state
    toast({ title: 'Chat cleared' });
  }, [finalSessionId, clearSession, clearFromDatabase, toast, setMessages]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 sm:pb-6">
        {messages.length === 0 ? (
          <EmptyScreen onExampleClick={(val) => {
             handleInputChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>);
          }} />
        ) : (
          <ChatMessages 
            messages={messages} 
            isLoading={isLoading}
          />
        )}
      </div>
      
      <div className="shrink-0 z-20 bg-background/50 backdrop-blur-sm">
         <ChatInput 
           onSubmit={(val) => {
             // ChatInput calls onSubmit with the value
             // We need to update useChat's input state then submit
             handleInputChange({ target: { value: val } } as React.ChangeEvent<HTMLInputElement>);
             // We need to wait for state update? No, handleInputChange is sync-ish.
             // Actually, handleSubmit uses the *current* input state.
             // Better: use append() for direct submission without form event
             if (!isAuthenticated) {
                openAuthModal('sign-in');
                return;
             }
             const userMsg: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: val,
                timestamp: new Date(),
             };
             addMessage(finalSessionId, userMsg);
             append({ role: 'user', content: val });
           }}
           isLoading={isLoading}
           disabled={!isAuthenticated}
         />
      </div>
    </div>
  );
}