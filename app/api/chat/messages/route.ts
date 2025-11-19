import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { rateLimit as checkRateLimit } from '@/lib/rate-limit';

// POST - Save messages to a chat session
// Requires authentication
export async function POST(request: NextRequest) {
  // Apply rate limiting (20 requests per minute per user - higher limit for message saves)
  const rateLimitResponse = checkRateLimit(request, {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    let session;
    try {
      session = await auth.api.getSession({ headers: await headers() });
    } catch (sessionError) {
      // Handle database connection errors when fetching session
      console.error('[POST /api/chat/messages] Error fetching session:', sessionError);
      // Return error - can't save without authentication
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
    
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

    let chatSession;
    let existingMessages;
    
    try {
      // Verify the session belongs to the user, or create it if it doesn't exist
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!chatSession) {
        // Session doesn't exist yet - this can happen for new chats
        // Create a temporary session with a placeholder title
        // The title will be updated later when the AI generates it
        try {
          chatSession = await prisma.chatSession.create({
            data: {
              id: sessionId,
              userId,
              chatType: 'context-aware', // Default, will be updated if needed
              title: 'New Chat', // Placeholder title
            },
          });
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[POST /api/chat/messages] Created new session: ${sessionId}`);
          }
        } catch (createError: any) {
          // If creation fails (e.g., duplicate key), try to find it again
          if (createError?.code === 'P2002') {
            chatSession = await prisma.chatSession.findFirst({
              where: { id: sessionId, userId },
            });
          }
          
          if (!chatSession) {
            console.error('[POST /api/chat/messages] Failed to create session:', createError);
            return NextResponse.json(
              { error: 'Failed to create session' },
              { status: 500 }
            );
          }
        }
      }

      // Get existing message IDs to avoid duplicates
      existingMessages = await prisma.chatMessage.findMany({
        where: { sessionId },
        select: { id: true },
      });
    } catch (dbError) {
      // Handle database connection errors gracefully
      console.error('[POST /api/chat/messages] Database error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }
    
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
      try {
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
      } catch (dbError) {
        // Handle database connection errors gracefully
        console.error('[POST /api/chat/messages] Database error saving messages:', dbError);
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        );
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] All ${messages.length} messages already exist in database for session ${sessionId}`);
      }
    }

    return NextResponse.json({ success: true, saved: newMessages.length });
  } catch (error) {
    console.error('[POST /api/chat/messages] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Failed to save messages' },
      { status: 500 }
    );
  }
}

// GET - Fetch messages for a chat session
// Requires authentication
export async function GET(request: NextRequest) {
  // Apply rate limiting (15 requests per minute per user)
  const rateLimitResponse = checkRateLimit(request, {
    maxRequests: 15,
    windowMs: 60 * 1000, // 1 minute
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  try {
    let session;
    try {
      session = await auth.api.getSession({ headers: await headers() });
    } catch (sessionError) {
      // Handle database connection errors when fetching session
      console.error('[GET /api/chat/messages] Error fetching session:', sessionError);
      // Return empty array instead of error - allows frontend to work offline
      return NextResponse.json({ messages: [], total: 0, hasMore: false });
    }
    
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

    let chatSession;
    let totalCount;
    let allMessages;
    
    try {
      // Verify the session belongs to the user
      chatSession = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
      });

      if (!chatSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      // Get total count for pagination info
      totalCount = await prisma.chatMessage.count({
        where: { sessionId },
      });

      // Limit message retrieval to prevent large payloads
      // For very long conversations, consider pagination
      const messageLimit = 1000; // Max 1000 messages per request
      
      // Get messages with limit (most recent first, then reverse for chronological order)
      allMessages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: messageLimit,
      });
    } catch (dbError) {
      // Handle database connection errors gracefully
      console.error('[GET /api/chat/messages] Database error:', dbError);
      // Return empty array instead of error - allows frontend to work offline
      return NextResponse.json({ messages: [], total: 0, hasMore: false });
    }

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
      hasMore: totalCount > 1000,
    });
  } catch (error) {
    console.error('[GET /api/chat/messages] Unexpected error:', error);
    // Return empty array instead of error - allows frontend to work offline
    return NextResponse.json({ messages: [], total: 0, hasMore: false });
  }
}

// DELETE - Clear messages from a chat session
// Requires authentication
export async function DELETE(request: NextRequest) {
  // Apply rate limiting (10 requests per minute per user)
  const rateLimitResponse = checkRateLimit(request, {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
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

