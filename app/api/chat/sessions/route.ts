import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// GET - Fetch all chat sessions for the current user
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
    const chatType = searchParams.get('chatType') as 'context-aware' | 'tool-selection' | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build where clause
    const where: any = { userId };
    if (chatType && ['context-aware', 'tool-selection'].includes(chatType)) {
      where.chatType = chatType;
    }

    // Pagination
    const take = limit ? Math.min(parseInt(limit, 10), 100) : undefined; // Max 100 per page
    const skip = offset ? parseInt(offset, 10) : undefined;

    const chatSessions = await prisma.chatSession.findMany({
      where,
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1, // Only get the last message for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    });

    // Get total count for pagination
    const total = await prisma.chatSession.count({ where });

    // Transform to match our ChatSession type
    const sessions = chatSessions.map((s) => ({
      id: s.id,
      chatType: s.chatType as 'context-aware' | 'tool-selection',
      title: s.title || undefined,
      messages: s.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: m.timestamp,
      })),
      updatedAt: s.updatedAt,
    }));

    return NextResponse.json({ 
      sessions,
      pagination: take || skip ? {
        total,
        limit: take,
        offset: skip || 0,
        hasMore: skip !== undefined && take !== undefined ? (skip + take) < total : false,
      } : undefined,
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat session
// Requires authentication
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { chatType, title, sessionId } = body;

    // Validate chatType
    if (!chatType || !['context-aware', 'tool-selection'].includes(chatType)) {
      return NextResponse.json(
        { error: 'Invalid chatType. Must be "context-aware" or "tool-selection"' },
        { status: 400 }
      );
    }

    // Require title - sessions cannot be saved without an AI-generated title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required. Sessions must have an AI-generated title before being saved.' },
        { status: 400 }
      );
    }
    
    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }
    
    // Reject default/placeholder titles
    if (title.startsWith('Chat ') || title === 'New Chat' || title.match(/^Chat \d+\/\d+\/\d+$/)) {
      return NextResponse.json(
        { error: 'Session must have an AI-generated title. Default titles are not allowed.' },
        { status: 400 }
      );
    }

    // Validate sessionId format if provided (should be a valid UUID or cuid)
    if (sessionId !== undefined) {
      if (typeof sessionId !== 'string' || sessionId.length < 1 || sessionId.length > 100) {
        return NextResponse.json(
          { error: 'Invalid sessionId format' },
          { status: 400 }
        );
      }
      
      // Check if sessionId already exists
      const existingSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });
      
      if (existingSession) {
        // If it exists and belongs to this user, return it
        if (existingSession.userId === userId) {
          return NextResponse.json({
            session: {
              id: existingSession.id,
              chatType: existingSession.chatType as 'context-aware' | 'tool-selection',
              title: existingSession.title || undefined,
              messages: [],
              updatedAt: existingSession.updatedAt,
            },
          });
        } else {
          return NextResponse.json(
            { error: 'Session ID already exists' },
            { status: 409 }
          );
        }
      }
    }

    try {
      const chatSession = await prisma.chatSession.create({
        data: {
          id: sessionId || undefined, // Use provided ID or let Prisma generate
          userId,
          chatType,
          title: title, // Title is required and validated above
        },
        include: {
          messages: true,
        },
      });

      return NextResponse.json({
        session: {
          id: chatSession.id,
          chatType: chatSession.chatType as 'context-aware' | 'tool-selection',
          title: chatSession.title || undefined,
          messages: [],
          updatedAt: chatSession.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle Prisma unique constraint errors
      if (error?.code === 'P2002') {
        return NextResponse.json(
          { error: 'Session ID already exists' },
          { status: 409 }
        );
      }
      throw error; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat session
// Note: This uses query params for compatibility with existing frontend code
// Ideally, DELETE should be in [sessionId]/route.ts, but keeping it here for now
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
        { error: 'sessionId query parameter is required' },
        { status: 400 }
      );
    }

    // Validate sessionId format
    if (typeof sessionId !== 'string' || sessionId.length < 1 || sessionId.length > 100) {
      return NextResponse.json(
        { error: 'Invalid sessionId format' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete the session (messages will be cascade deleted due to onDelete: Cascade)
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}

