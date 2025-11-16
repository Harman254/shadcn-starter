import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// POST - Save messages to a chat session
// Requires authentication
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { sessionId, messages } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'messages must be an array' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get existing message IDs to avoid duplicates
    const existingMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      select: { id: true },
    });
    const existingIds = new Set(existingMessages.map((m) => m.id));

    // Validate message count limit to prevent abuse
    if (messages.length > 100) {
      return NextResponse.json(
        { error: 'Too many messages. Maximum 100 messages per request.' },
        { status: 400 }
      );
    }

    // Filter out messages that already exist and prepare new ones
    const newMessages = messages
      .filter((msg: any) => {
        // Validate message structure
        if (!msg.id || !msg.role || !msg.content) {
          console.warn('Invalid message structure:', msg);
          return false;
        }
        
        // Validate role
        if (!['user', 'assistant'].includes(msg.role)) {
          console.warn('Invalid message role:', msg.role);
          return false;
        }
        
        // Validate content length (prevent extremely long messages)
        if (typeof msg.content !== 'string' || msg.content.length > 50000) {
          console.warn('Message content too long:', msg.content.length);
          return false;
        }
        
        // Validate content is not empty after trim
        if (!msg.content.trim()) {
          return false;
        }
        
        return !existingIds.has(msg.id);
      })
      .map((msg: any) => {
        // Handle timestamp - can be Date, ISO string, or undefined
        let timestamp: Date;
        if (msg.timestamp) {
          timestamp = msg.timestamp instanceof Date 
            ? msg.timestamp 
            : new Date(msg.timestamp);
        } else {
          timestamp = new Date();
        }
        
        // Truncate content if too long (safety measure)
        const content = msg.content.length > 50000 
          ? msg.content.substring(0, 50000) 
          : msg.content;
        
        return {
          id: msg.id,
          sessionId,
          role: msg.role,
          content: content.trim(),
          timestamp,
        };
      });

    if (newMessages.length > 0) {
      // Save messages to database using Prisma
      const result = await prisma.chatMessage.createMany({
        data: newMessages,
        skipDuplicates: true,
      });

      // Update session's updatedAt to reflect latest activity
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ✅ Saved ${result.count} new messages to database for session ${sessionId}`);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] All ${messages.length} messages already exist in database for session ${sessionId}`);
      }
    }

    return NextResponse.json({ success: true, saved: newMessages.length });
  } catch (error) {
    console.error('Error saving messages:', error);
    return NextResponse.json(
      { error: 'Failed to save messages' },
      { status: 500 }
    );
  }
}

// GET - Fetch messages for a chat session
// Requires authentication
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get total count for pagination info
    const totalCount = await prisma.chatMessage.count({
      where: { sessionId },
    });

    // Limit message retrieval to prevent large payloads
    // For very long conversations, consider pagination
    const messageLimit = 1000; // Max 1000 messages per request
    
    // Get messages with limit (most recent first, then reverse for chronological order)
    const allMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
      take: messageLimit,
    });

    // Reverse to get chronological order (oldest first)
    const messages = allMessages
      .reverse()
      .map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp,
      }));

    return NextResponse.json({ 
      messages,
      total: totalCount,
      hasMore: totalCount > messageLimit,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// DELETE - Clear messages from a chat session
// Requires authentication
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    await prisma.chatMessage.deleteMany({
      where: { sessionId },
    });

    // Update session's updatedAt
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing messages:', error);
    return NextResponse.json(
      { error: 'Failed to clear messages' },
      { status: 500 }
    );
  }
}

