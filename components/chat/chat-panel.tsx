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
  const [isLoadingSession, setIsLoadingSession] = useState(false);
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
  
  // Synchronously initialize lock from localStorage to prevent creating new session on refresh
  // This ensures users can continue their conversation when they return
  // This is safe because ChatPanel is loaded with ssr: false
  if (!lockInitializedRef.current && typeof window !== 'undefined') {
    lockInitializedRef.current = true;
    try {
      const stored = localStorage.getItem('chat-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const storedSessionId = parsed?.state?.currentSessionId;
        if (storedSessionId) {
          // Verify the session exists in the store
          const storeState = useChatStore.getState();
          if (storeState.sessions[storedSessionId]) {
            lockedSessionRef.current = storedSessionId;
            // Restore the session immediately for smooth UX
            setCurrentSession(storedSessionId);
          }
        }
      }
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') {
        console.warn('[ChatPanel] Failed to restore session from localStorage:', e);
      }
    }
  }
  
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
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, append, reload, data } = useChat({
    api: '/api/chat',
    id: finalSessionId,
    initialMessages: storeMessages,
    body: {
      sessionId: finalSessionId,
      chatType,
      preferencesSummary,
    },
    onFinish: async (message) => {
      isUserSubmittingRef.current = false;
      if (!finalSessionId) return;
      
      // Extract UI data from multiple sources
      let uiData: any = null;
      
      // Method 1: Extract from toolInvocations (PRIMARY METHOD)
      if (message.toolInvocations && message.toolInvocations.length > 0) {
        console.log('[ChatPanel] Found toolInvocations:', message.toolInvocations.map(t => t.toolName));
        
        for (const tool of message.toolInvocations) {
          if (tool.state === 'result') {
            const result = tool.result;
            const data = result?.data || result;
            
            // Extract UI metadata from tool result
            if (tool.toolName === 'generateMealPlan') {
              const mealPlan = data?.mealPlan || result?.mealPlan;
              if (mealPlan) {
                uiData = { ...uiData, mealPlan };
                console.log('[ChatPanel] ✅ Extracted mealPlan from toolInvocations');
              }
            } else if (tool.toolName === 'generateMealRecipe') {
              const recipe = data?.recipe || result?.recipe;
              if (recipe) {
                uiData = { ...uiData, mealRecipe: recipe };
                console.log('[ChatPanel] ✅ Extracted recipe from toolInvocations');
              }
            } else if (tool.toolName === 'generateGroceryList') {
              const groceryList = data?.groceryList || result?.groceryList;
              if (groceryList) {
                uiData = { ...uiData, groceryList };
                console.log('[ChatPanel] ✅ Extracted groceryList from toolInvocations');
              }
            } else if (tool.toolName === 'analyzeNutrition') {
              if (data?.totalNutrition || data?.dailyAverage) {
                uiData = { ...uiData, nutrition: {
                  total: data?.totalNutrition,
                  dailyAverage: data?.dailyAverage,
                  insights: data?.insights,
                  healthScore: data?.healthScore,
                  summary: data?.summary,
                  type: 'plan'
                }};
                console.log('[ChatPanel] ✅ Extracted nutrition from toolInvocations');
              }
            } else if (tool.toolName === 'getGroceryPricing') {
              const prices = data?.prices || result?.prices;
              if (prices) {
                uiData = { ...uiData, prices };
                console.log('[ChatPanel] ✅ Extracted prices from toolInvocations');
              }
            } else if (tool.toolName === 'searchRecipes') {
              const recipes = data?.recipes || result?.recipes;
              if (recipes) {
                uiData = { ...uiData, recipeResults: recipes, query: data?.query };
                console.log('[ChatPanel] ✅ Extracted recipeResults from toolInvocations');
              }
            } else if (tool.toolName === 'modifyMealPlan' || tool.toolName === 'swapMeal') {
              const mealPlan = data?.mealPlan || result?.mealPlan;
              if (mealPlan) {
                uiData = { ...uiData, mealPlan };
                console.log(`[ChatPanel] ✅ Extracted mealPlan from ${tool.toolName}`);
              }
            } else if (tool.toolName === 'optimizeGroceryList') {
              const optimization = data?.optimization || result?.optimization;
              if (optimization) {
                uiData = { ...uiData, optimization };
                console.log('[ChatPanel] ✅ Extracted optimization from toolInvocations');
              }
            } else if (tool.toolName === 'suggestIngredientSubstitutions') {
              const substitutions = data?.substitutions || data || result?.substitutions || result;
              if (substitutions) {
                uiData = { ...uiData, substitutions };
                console.log('[ChatPanel] ✅ Extracted substitutions from toolInvocations');
              }
            } else if (tool.toolName === 'getSeasonalIngredients') {
              const seasonal = data?.seasonal || data || result?.seasonal || result;
              if (seasonal) {
                uiData = { ...uiData, seasonal };
                console.log('[ChatPanel] ✅ Extracted seasonal from toolInvocations');
              }
            } else if (tool.toolName === 'planFromInventory') {
              const inventoryPlan = data?.inventoryPlan || data || result?.inventoryPlan || result;
              if (inventoryPlan) {
                uiData = { ...uiData, inventoryPlan };
                console.log('[ChatPanel] ✅ Extracted inventoryPlan from toolInvocations');
              }
            } else if (tool.toolName === 'generatePrepTimeline') {
              const prepTimeline = data?.prepTimeline || data || result?.prepTimeline || result;
              if (prepTimeline) {
                uiData = { ...uiData, prepTimeline };
                console.log('[ChatPanel] ✅ Extracted prepTimeline from toolInvocations');
              }
            } else if (tool.toolName === 'searchFoodData') {
              const foodData = data || result;
              if (foodData && (foodData.query || foodData.summary || foodData.nutrition || foodData.pricing)) {
                uiData = { ...uiData, foodData };
                console.log('[ChatPanel] ✅ Extracted foodData from toolInvocations');
              }
            } else if (tool.toolName === 'analyzePantryImage') {
              const items = data?.items || [];
              const imageUrl = data?.summary?.includes("imageUrl") ? data.summary : undefined;
              if (items.length > 0) {
                uiData = { ...uiData, pantryAnalysis: { items, imageUrl } };
                console.log('[ChatPanel] ✅ Extracted pantryAnalysis from toolInvocations');
              }
            }
          }
        }
      }
      
      // Method 2: Extract from message content [UI_METADATA:...] (FALLBACK)
      if (!uiData && message.content) {
        let match = message.content.match(/<!-- UI_DATA_START:([\s\S]+?):UI_DATA_END -->/);
        if (!match) {
          match = message.content.match(/\[UI_METADATA:([\s\S]+?)\]/);
        }
        
        if (match && match[1]) {
          try {
            const decoded = atob(match[1].trim());
            uiData = JSON.parse(decoded);
            console.log('[ChatPanel] ✅ Extracted UI metadata from message content:', Object.keys(uiData));
          } catch (e) {
            console.warn('[ChatPanel] Failed to parse UI_METADATA from content:', e);
          }
        }
      }
      
      // Method 3: Extract from stream data events (LEGACY FALLBACK)
      if (!uiData && data && data.length > 0) {
        for (const item of data) {
          if (item && typeof item === 'object' && (item as any).type === 'ui_data') {
            uiData = (item as any).content;
            console.log('[ChatPanel] ✅ Extracted UI data from stream data events');
            break;
          }
        }
      }
      
      // Trigger toast if present in UI data
      if (uiData?.toast) {
        toast({
          title: 'Success',
          description: uiData.toast,
        });
      }
      
      if (!uiData) {
        console.log('[ChatPanel] ⚠️ No UI data extracted from any source');
      }
      
      // Get the last user message from useChat messages
      // Find the last user message (before the assistant response we just received)
      const userMessage = [...messages].reverse().find(m => m.role === 'user');
      
      // Add user message to store if it's not already there
      // Check if it already exists in store to avoid duplicates
      const storeMessages = useChatStore.getState().sessions[finalSessionId]?.messages || [];
      const userMessageExists = storeMessages.some(m => m.id === userMessage?.id);
      
      if (userMessage && userMessage.role === 'user' && !userMessageExists) {
        const userMsg: Message = {
          id: userMessage.id,
          role: 'user',
          content: userMessage.content,
          timestamp: userMessage.createdAt || new Date(),
        };
        addMessage(finalSessionId, userMsg);
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
      
      // Save to DB (both user and assistant messages are now in store)
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
      isUserSubmittingRef.current = false;
      console.error('[ChatPanel] useChat error:', error);
      console.error('[ChatPanel] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      });
      
      // Check error type for better user messaging
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDatabaseError = 
        errorMessage.includes('Database connection') ||
        errorMessage.includes('DATABASE_ERROR') ||
        errorMessage.includes('503') ||
        errorMessage.includes('Cannot authenticate');
      
      const isAuthError = 
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('401');
      
      const isNetworkError = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('network') ||
        (typeof navigator !== 'undefined' && !navigator.onLine);
      
      const isStreamError = 
        errorMessage.includes('stream') ||
        errorMessage.includes('Stream');
      
      // If it's a network error and we're actually offline, queue the message
      if (isNetworkError && typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('[ChatPanel] Network error detected and navigator reports offline, queuing message');
        // Get the last user message and queue it
        const userMessages = messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        if (lastUserMessage) {
          queueMessage(lastUserMessage.content);
        }
      }
      
      toast({
        title: isDatabaseError ? 'Database unavailable' : isAuthError ? 'Authentication required' : isNetworkError ? 'Connection error' : isStreamError ? 'Stream error' : 'Message failed',
        description: isDatabaseError 
          ? 'The database is temporarily unavailable. Your message is saved locally and will sync when the connection is restored.'
          : isAuthError
          ? 'Please sign in to continue chatting.'
          : isNetworkError
          ? 'Failed to connect to the server. Your message will be sent when you are back online.'
          : isStreamError
          ? 'Failed to receive AI response. Please check your connection and try again.'
          : 'There was an issue connecting to the AI. Please try again.',
        variant: 'destructive',
        action: !isAuthError ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => reload()}
            className="bg-white/20 hover:bg-white/30 text-white border-transparent"
          >
            Retry
          </Button>
        ) : undefined,
      });
    }
  });

  // Sync store messages to useChat when session changes
  // CRITICAL: Don't sync during streaming or we'll overwrite the streaming message!
  useEffect(() => {
    if (!isLoading && !isUserSubmittingRef.current) {
      // Show loading state briefly when switching sessions with no messages
      if (storeMessages.length === 0 && finalSessionId) {
        const session = getCurrentSession();
        // Only show loading if session exists but has no messages (might be loading from DB)
        if (session && session.messages.length === 0) {
          setIsLoadingSession(true);
          // Give it a moment to load, then hide loading
          const timeoutId = setTimeout(() => {
            setIsLoadingSession(false);
          }, 800);
          return () => clearTimeout(timeoutId);
        } else {
          setIsLoadingSession(false);
        }
      } else {
        setIsLoadingSession(false);
        // Don't overwrite useChat messages if useChat has more messages than store
        // This can happen when a new message was just submitted and is in useChat but not yet in store
        // The store will catch up in onFinish
        if (messages.length <= storeMessages.length) {
          setMessages(storeMessages);
        }
      }
    }
  }, [finalSessionId, storeMessages, isLoading, setMessages, getCurrentSession, messages.length]);


  // We need to override the default submit handler to use append() so we can control the ID
  const handleManualSubmit = async (value: string, attachments?: string[]) => {
     if (!value.trim() && (!attachments || attachments.length === 0)) return;
     if (!isAuthenticated) {
        openAuthModal('sign-in');
        return;
     }

     // Don't check navigator.onLine here - it's unreliable and can cause false positives
     // Let the API call happen, and only queue on actual failure
     // The useChat hook will handle network errors properly

     const messageId = crypto.randomUUID();
     
     // Construct content properly for store
     // If we have attachments, we'll store them in a way our UI renders? 
     // For now, let's just append. The store might not handle images well without update, 
     // but 'append' will send it to backend.
     
     const userMsg: Message = {
        id: messageId,
        role: 'user',
        content: value,
        timestamp: new Date(),
     };
     
     isUserSubmittingRef.current = true;
     
     // Add user message to store immediately so it doesn't disappear from UI
     // This prevents the sync effect from removing it
     addMessage(finalSessionId, userMsg);
     
     // Clear input
     handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
     
     // Append with attachments - this will add the message to useChat state
     append({
        id: messageId,
        role: 'user',
        content: value,
        experimental_attachments: attachments ? attachments.map(url => ({
            name: 'image.jpg',
            contentType: 'image/jpeg', // We force jpeg/png in input
            url: url
        })) : undefined
     });
  };
  // Smooth scroll helper function
  const smoothScrollToBottom = useCallback((element: HTMLDivElement, force = false) => {
    if (!element) return;
    
    // Check if user is near bottom (within 300px) or force scroll
    const isNearBottom = 
      element.scrollHeight - element.scrollTop - element.clientHeight < 300;
    
    if (isNearBottom || force) {
      // Use smooth scroll behavior
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Auto-scroll to bottom when chat first loads or session changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    if (messages.length > 0 && !hasInitialScrolledRef.current) {
      hasInitialScrolledRef.current = true;
      // Small delay to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollContainerRef.current) {
            smoothScrollToBottom(scrollContainerRef.current, true);
          }
        }, 150);
      });
    }
  }, [messages.length, finalSessionId, smoothScrollToBottom]);

  // Reset initial scroll flag when session changes
  useEffect(() => {
    hasInitialScrolledRef.current = false;
  }, [finalSessionId]);

  // Smooth scroll during streaming (only if user is near bottom)
  useEffect(() => {
    if (!scrollContainerRef.current || !isLoading) return;
    // Only auto-scroll if user hasn't manually scrolled up
    smoothScrollToBottom(scrollContainerRef.current, false);
  }, [messages, isLoading, smoothScrollToBottom]);


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
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-full relative"
      data-chat-panel
    >
      <div 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-3xl mx-auto w-full pb-32 sm:pb-40 px-4">
          {isLoadingSession ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center h-full min-h-[60vh]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading conversation...</p>
              </div>
            </motion.div>
          ) : messages.length === 0 ? (
            <EmptyScreen onExampleClick={(val) => {
               if (!isAuthenticated) {
                  openAuthModal('sign-in');
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
               // Add to store immediately so it doesn't disappear
               addMessage(finalSessionId, userMsg);
               // Append will also add to useChat
               append({ 
                  id: messageId,
                  role: 'user', 
                  content: val 
               });
            }} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading}
                data={data}
                onActionClick={handleManualSubmit}
              />
            </motion.div>
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