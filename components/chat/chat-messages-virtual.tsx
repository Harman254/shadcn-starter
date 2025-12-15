'use client';

import { useEffect, useRef, memo } from 'react';
import type { Message } from '@/types';
import { ChatMessage } from './chat-message';
import { cn } from '@/lib/utils';

// Dynamically import virtual scrolling - gracefully degrades if not installed
let useVirtualizer: any = null;
try {
  const virtualModule = require('@tanstack/react-virtual');
  useVirtualizer = virtualModule.useVirtualizer;
} catch (e) {
  // Library not installed - will use regular scrolling
}

interface ChatMessagesVirtualProps {
  messages: Message[];
  isLoading: boolean;
  onActionClick?: (message: string) => void;
  data?: any[];
}

// Threshold for when to use virtual scrolling (100+ messages)
const VIRTUAL_SCROLL_THRESHOLD = 100;

// Component that uses virtual scrolling (only rendered when library is available)
function VirtualizedMessages({ 
  messages, 
  isLoading,
  parentRef,
  onActionClick,
  data
}: { 
  messages: Message[]; 
  isLoading: boolean;
  parentRef: React.RefObject<HTMLDivElement | null>;
  onActionClick?: (message: string) => void;
  data?: any[];
}) {
  // This hook is always called - no conditional logic
  const virtualizer = useVirtualizer({
    count: messages.length + (isLoading ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      <div className="w-full" role="list">
        {virtualItems.map((virtualItem: any) => {
          const index = virtualItem.index;
          const message = messages[index];
          
          if (!message) return null;

          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
              role="listitem"
            >
              <ChatMessage message={message} onActionClick={onActionClick} />
            </div>
          );
        })}
        {isLoading && (
          <div 
            style={{
              position: 'absolute',
              top: `${virtualizer.getTotalSize()}px`,
              left: 0,
              width: '100%',
            }}
            role="status" 
            aria-label="AI is typing"
          >
            <ChatMessage isLoading data={data} />
          </div>
        )}
      </div>
    </div>
  );
}

export const ChatMessagesVirtual = memo(function ChatMessagesVirtual({ 
  messages, 
  isLoading,
  onActionClick,
  data
}: ChatMessagesVirtualProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<boolean>(false);

  // Use virtual scrolling only if we have many messages AND library is available
  const useVirtual = messages.length >= VIRTUAL_SCROLL_THRESHOLD && useVirtualizer !== null;

  // Smooth auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!parentRef.current) return;

    // Only auto-scroll if user is near the bottom (within 300px)
    const viewport = parentRef.current;
    const isNearBottom = 
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 300;

    if (isNearBottom || scrollToBottomRef.current) {
      requestAnimationFrame(() => {
        if (parentRef.current) {
          // Use smooth scroll behavior
          parentRef.current.scrollTo({
            top: parentRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        scrollToBottomRef.current = false;
      });
    }
  }, [messages.length, isLoading, useVirtual]);

  // Mark that we should scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRef.current = true;
    }
  }, [messages.length]);

  // Smooth scroll to bottom on initial load (when messages are first rendered)
  const hasInitialScrolledRef = useRef(false);
  useEffect(() => {
    if (!parentRef.current || hasInitialScrolledRef.current) return;
    if (messages.length > 0) {
      hasInitialScrolledRef.current = true;
      // Small delay to ensure DOM is fully rendered, then smooth scroll
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (parentRef.current) {
            parentRef.current.scrollTo({
              top: parentRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 150);
      });
    }
  }, [messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div 
        className="flex items-center justify-center h-full min-h-[60vh] text-muted-foreground text-sm sm:text-base"
        role="status"
        aria-label="No messages yet"
      >
        No messages yet. Start a conversation!
      </div>
    );
  }

  // Use virtual scrolling for large lists
  if (useVirtual && useVirtualizer) {
    return (
      <div 
        className={cn(
          "h-full w-full overflow-y-auto overflow-x-hidden",
          "scroll-smooth" // Smooth scrolling
        )}
        style={{ scrollBehavior: 'smooth' }}
        ref={parentRef}
        role="log" 
        aria-live="polite" 
        aria-label="Chat messages"
      >
        <VirtualizedMessages 
          messages={messages} 
          isLoading={isLoading}
          parentRef={parentRef}
          onActionClick={onActionClick}
          data={data}
        />
      </div>
    );
  }

  // Regular rendering for smaller lists
  return (
    <div 
      className={cn(
        "h-full w-full overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent",
        "scroll-smooth" // Smooth scrolling
      )}
      style={{ scrollBehavior: 'smooth' }}
      ref={parentRef}
      role="log" 
      aria-live="polite" 
      aria-label="Chat messages"
    >
      <div className="w-full pb-24" role="list">
        {messages.map((message) => {
          return (
            <div key={message.id} role="listitem">
              <ChatMessage message={message} onActionClick={onActionClick} />
            </div>
          );
        })}
        {isLoading && (
          <div role="status" aria-label="AI is typing">
            <ChatMessage isLoading />
          </div>
        )}
      </div>
    </div>
  );
});

