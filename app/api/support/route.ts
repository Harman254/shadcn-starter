import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { hasPrioritySupport } from '@/lib/utils/feature-gates';
import prisma from '@/lib/prisma';

/**
 * Submit support request
 * Pro users get priority support (faster response time)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subject, message, category } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Check if user has priority support
    const isPriority = await hasPrioritySupport(session.user.id);

    // Create support ticket
    // Note: You may want to create a SupportTicket model in Prisma
    // For now, we'll just log it and return success
    const supportTicket = {
      userId: session.user.id,
      subject,
      message,
      category: category || 'general',
      priority: isPriority ? 'high' : 'normal',
      status: 'open',
      createdAt: new Date(),
    };

    // In a real implementation, save to database:
    // await prisma.supportTicket.create({ data: supportTicket });

    console.log('Support ticket created:', supportTicket);

    return NextResponse.json({
      success: true,
      ticket: supportTicket,
      message: isPriority
        ? 'Your priority support request has been submitted. We\'ll respond within 24 hours.'
        : 'Your support request has been submitted. We\'ll respond within 48-72 hours.',
      isPriority,
    });
  } catch (error: any) {
    console.error('Error submitting support request:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to submit support request',
      },
      { status: 500 }
    );
  }
}

/**
 * Get support ticket status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has priority support
    const isPriority = await hasPrioritySupport(session.user.id);

    // In a real implementation, fetch tickets from database:
    // const tickets = await prisma.supportTicket.findMany({
    //   where: { userId: session.user.id },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      isPriority,
      priorityResponseTime: '24 hours',
      standardResponseTime: '48-72 hours',
      message: isPriority
        ? 'You have priority support. Your requests are handled with higher priority.'
        : 'Upgrade to Pro for priority support and faster response times.',
    });
  } catch (error: any) {
    console.error('Error fetching support status:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch support status',
      },
      { status: 500 }
    );
  }
}

