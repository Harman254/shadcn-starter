'use client';

import { memo } from 'react';
import type { Message } from '@/types';
import { ChatMessagesVirtual } from './chat-messages-virtual';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

// Wrapper component that uses virtual scrolling for large lists
export const ChatMessages = memo(function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return <ChatMessagesVirtual messages={messages} isLoading={isLoading} />;
});
