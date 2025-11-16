import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// PATCH - Update session title
// Requires authentication
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> | { sessionId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Require authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Handle both Promise and direct params (Next.js 13+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { sessionId } = resolvedParams;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid sessionId parameter' },
        { status: 400 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { title } = body;

    // Validate title
    if (title === undefined || title === null) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title must be a string' },
        { status: 400 }
      );
    }

    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      );
    }

    // Reject default/placeholder titles - only AI-generated titles are allowed
    if (title.startsWith('Chat ') || title === 'New Chat' || title.match(/^Chat \d+\/\d+\/\d+$/)) {
      return NextResponse.json(
        { error: 'Default titles are not allowed. Only AI-generated titles are permitted.' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const chatSession = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId, 
        userId,
      },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found or you do not have permission to update it' },
        { status: 404 }
      );
    }

    // Update the session title
    try {
      const updatedSession = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          title: title.trim(),
          updatedAt: new Date(), // Explicitly update timestamp
        },
      });

      return NextResponse.json({
        success: true,
        session: {
          id: updatedSession.id,
          chatType: updatedSession.chatType as 'context-aware' | 'tool-selection',
          title: updatedSession.title,
          updatedAt: updatedSession.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle Prisma errors
      if (error?.code === 'P2025') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      throw error; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error updating session title:', error);
    
    // Provide more specific error messages
    if (error?.code) {
      console.error('Prisma error code:', error.code);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update session title',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}



