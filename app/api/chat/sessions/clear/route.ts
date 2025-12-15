import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

// DELETE - Clear all chat sessions for the current user
// Optional query params:
// - chatType: filter by chat type ('context-aware' | 'tool-selection')
// - emptyOnly: if true, only delete sessions with no messages
// - noTitleOnly: if true, only delete sessions without AI-generated titles
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
    const chatType = searchParams.get('chatType') as 'context-aware' | 'tool-selection' | null;
    const emptyOnly = searchParams.get('emptyOnly') === 'true';
    const noTitleOnly = searchParams.get('noTitleOnly') === 'true';

    // Build where clause
    const where: any = { userId };
    
    if (chatType && ['context-aware', 'tool-selection'].includes(chatType)) {
      where.chatType = chatType;
    }

    // If filtering by empty sessions or no title, we need to check messages/title
    if (emptyOnly || noTitleOnly) {
      // Get all sessions first to filter
      const allSessions = await prisma.chatSession.findMany({
        where,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      });

      // Filter sessions based on criteria
      let sessionsToDelete = allSessions;
      
      if (emptyOnly) {
        sessionsToDelete = sessionsToDelete.filter(s => s._count.messages === 0);
      }
      
      if (noTitleOnly) {
        sessionsToDelete = sessionsToDelete.filter(s => 
          !s.title || 
          s.title.startsWith('Chat ') || 
          s.title === 'New Chat' ||
          s.title.match(/^Chat \d+\/\d+\/\d+$/)
        );
      }

      // Delete filtered sessions
      if (sessionsToDelete.length > 0) {
        await prisma.chatSession.deleteMany({
          where: {
            id: {
              in: sessionsToDelete.map(s => s.id),
            },
          },
        });
      }

      return NextResponse.json({
        success: true,
        deletedCount: sessionsToDelete.length,
        message: `Deleted ${sessionsToDelete.length} conversation${sessionsToDelete.length !== 1 ? 's' : ''}`,
      });
    } else {
      // Delete all sessions matching the where clause
      const result = await prisma.chatSession.deleteMany({
        where,
      });

      return NextResponse.json({
        success: true,
        deletedCount: result.count,
        message: `Deleted ${result.count} conversation${result.count !== 1 ? 's' : ''}`,
      });
    }
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to clear chat sessions' },
      { status: 500 }
    );
  }
}



