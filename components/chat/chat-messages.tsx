'use client';

import { memo } from 'react';
import type { Message } from '@/types';
import { ChatMessagesVirtual } from './chat-messages-virtual';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onActionClick?: (message: string) => void;
}

// Wrapper component that uses virtual scrolling for large lists
export const ChatMessages = memo(function ChatMessages({ messages, isLoading, onActionClick }: ChatMessagesProps) {
  return <ChatMessagesVirtual messages={messages} isLoading={isLoading} onActionClick={onActionClick} />;
});
