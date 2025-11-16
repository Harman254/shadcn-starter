'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

interface SessionData {
  id: string;
  chatType: 'context-aware' | 'tool-selection';
  title?: string;
  messageCount: number;
  lastMessage?: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  updatedAt: Date;
}

export async function getChatSessions(chatType: 'context-aware' | 'tool-selection'): Promise<SessionData[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // If not authenticated, return empty array
    if (!session?.user?.id) {
      return [];
    }

    const userId = session.user.id;

    // Fetch sessions from database - only need title and metadata
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId,
        chatType,
      },
      select: {
        id: true,
        chatType: true,
        title: true,
        updatedAt: true,
        _count: {
          select: { messages: true }, // Get message count for reference
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50, // Limit to 50 most recent sessions
    });

    // Transform to match client component format - only title needed
    return chatSessions.map((s) => ({
      id: s.id,
      chatType: s.chatType as 'context-aware' | 'tool-selection',
      title: s.title || undefined,
      messageCount: s._count?.messages || 0,
      lastMessage: undefined, // Not needed - only showing titles
      updatedAt: s.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }
}

