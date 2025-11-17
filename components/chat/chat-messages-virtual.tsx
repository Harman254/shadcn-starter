'use client';

import { useEffect, useRef, memo } from 'react';
import type { Message } from '@/types';
import { ChatMessage } from './chat-message';

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
}

// Threshold for when to use virtual scrolling (100+ messages)
const VIRTUAL_SCROLL_THRESHOLD = 100;

export const ChatMessagesVirtual = memo(function ChatMessagesVirtual({ 
  messages, 
  isLoading 
}: ChatMessagesVirtualProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<boolean>(false);

  // Use virtual scrolling only if we have many messages AND library is available
  const useVirtual = messages.length >= VIRTUAL_SCROLL_THRESHOLD && useVirtualizer !== null;

  // Always call useVirtualizer if available (hooks must be called unconditionally)
  // Pass count: 0 when we don't want to use virtual scrolling to avoid rendering
  const virtualizer = useVirtualizer ? useVirtualizer({
    count: useVirtual ? messages.length + (isLoading ? 1 : 0) : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated height per message (will be adjusted)
    overscan: 5, // Render 5 extra items above/below viewport
  }) : null;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!parentRef.current) return;

    // Only auto-scroll if user is near the bottom (within 200px)
    const viewport = parentRef.current;
    const isNearBottom = 
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 200;

    if (isNearBottom || scrollToBottomRef.current) {
      requestAnimationFrame(() => {
        if (useVirtual && virtualizer) {
          // Scroll to last item in virtual list
          virtualizer.scrollToIndex(messages.length - 1, {
            align: 'end',
            behavior: 'smooth',
          });
        } else {
          // Regular scroll to bottom
          viewport.scrollTop = viewport.scrollHeight;
        }
        scrollToBottomRef.current = false;
      });
    }
  }, [messages.length, isLoading, useVirtual, virtualizer]);

  // Mark that we should scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomRef.current = true;
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
  if (useVirtual && virtualizer) {
    const virtualItems = virtualizer.getVirtualItems();

    return (
      <div 
        className="h-full w-full overflow-auto" 
        ref={parentRef}
        role="log" 
        aria-live="polite" 
        aria-label="Chat messages"
      >
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
                  <ChatMessage message={message} />
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
                <ChatMessage isLoading />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular rendering for smaller lists
  return (
    <div 
      className="h-full w-full overflow-auto" 
      ref={parentRef}
      role="log" 
      aria-live="polite" 
      aria-label="Chat messages"
    >
      <div className="w-full pb-24" role="list">
        {messages.map((message) => {
          return (
            <div key={message.id} role="listitem">
              <ChatMessage message={message} />
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

