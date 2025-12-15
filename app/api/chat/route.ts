import { StreamData } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';
import { isDatabaseConnectionError } from '@/lib/prisma';

export const maxDuration = 60;

/**
 * User preferences from database
 */
interface UserPreferences {
    dietary: string | null;
    goal: string | null;
    householdSize: number | null;
    cuisines: string[];
    location: {
        country: string | null;
        city: string | null;
        currency: {
            code: string | null;
            symbol: string | null;
        };
    };
}

/**
 * Fetch user preferences from database
 */
async function fetchUserPreferences(userId: string): Promise<UserPreferences> {
    try {
        // Fetch onboarding data and user location in parallel
        const [onboardingData, userData] = await Promise.all([
            prisma.onboardingData.findUnique({
                where: { userId },
                select: {
                    dietaryPreference: true,
                    goal: true,
                    householdSize: true,
                    cuisinePreferences: true,
                },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    country: true,
                    city: true,
                    currencyCode: true,
                    currencySymbol: true,
                },
            }),
        ]);

        return {
            dietary: onboardingData?.dietaryPreference || null,
            goal: onboardingData?.goal || null,
            householdSize: onboardingData?.householdSize || null,
            cuisines: onboardingData?.cuisinePreferences || [],
            location: {
                country: userData?.country || null,
                city: userData?.city || null,
                currency: {
                    code: userData?.currencyCode || null,
                    symbol: userData?.currencySymbol || null,
                },
            },
        };
    } catch (error) {
        console.error('[fetchUserPreferences] Error:', error);
        return {
            dietary: null,
            goal: null,
            householdSize: null,
            cuisines: [],
            location: {
                country: null,
                city: null,
                currency: { code: null, symbol: null },
            },
        };
    }
}

export async function POST(req: Request) {
    try {
        let session;
        try {
            session = await auth.api.getSession({
                headers: await headers(),
            });
        } catch (sessionError: any) {
            // Handle database connection errors when fetching session
            console.error('[POST /api/chat] Error fetching session:', sessionError);
            console.error('[POST /api/chat] Error details:', {
                message: sessionError?.message,
                code: sessionError?.code,
                status: sessionError?.status,
                statusCode: sessionError?.statusCode,
                body: sessionError?.body,
                name: sessionError?.name,
                cause: sessionError?.cause,
            });
            
            // Use the helper function to check for database connection errors
            // Also check for internal server errors which often indicate database issues
            const isInternalServerError = 
                sessionError?.status === 'INTERNAL_SERVER_ERROR' ||
                sessionError?.statusCode === 500;
            
            // Check if it's a database connection error using helper + additional checks
            const isConnectionError = 
                isDatabaseConnectionError(sessionError) ||
                isDatabaseConnectionError(sessionError?.cause) ||
                isDatabaseConnectionError(sessionError?.body?.error) ||
                (isInternalServerError && (
                    JSON.stringify(sessionError).toLowerCase().includes('prisma') ||
                    JSON.stringify(sessionError).toLowerCase().includes('postgresql') ||
                    JSON.stringify(sessionError).toLowerCase().includes('database') ||
                    JSON.stringify(sessionError).toLowerCase().includes('connection closed') ||
                    JSON.stringify(sessionError).toLowerCase().includes('kind: closed')
                ));
            
            if (isConnectionError) {
                console.error('[POST /api/chat] ✅ Database connection error detected - returning 503');
                return new Response(
                    JSON.stringify({ 
                        error: 'Database connection failed. Cannot authenticate. Please try again later.',
                        code: 'DATABASE_ERROR',
                        details: 'The database server is unreachable. Please check your connection or try again later.'
                    }), 
                    { 
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            }
            
            // For other auth errors, return 401
            console.error('[POST /api/chat] Auth error (non-database):', sessionError?.message);
            return new Response(
                JSON.stringify({ error: 'Unauthorized. Please sign in.' }), 
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        if (!session?.user?.id) {
            console.warn('[POST /api/chat] No session or user ID found');
            return new Response(
                JSON.stringify({ error: 'Unauthorized. Please sign in.' }), 
                { 
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];

        // Fetch user preferences (Promise)
        const userPreferencesPromise = fetchUserPreferences(session.user.id);

        // Initialize Orchestrated Chat Flow
        const chatFlow = getOrchestratedChatFlow();

        // Helper to formatting message content
        const formatMessageContent = (msg: any) => {
            if (msg.experimental_attachments && msg.experimental_attachments.length > 0) {
                return [
                    { type: 'text', text: msg.content },
                    ...msg.experimental_attachments.map((att: any) => ({
                        type: 'image',
                        image: att.url // Base64 or URL
                    }))
                ];
            }
            return msg.content;
        };

        // Process message with streaming
        console.log('[POST /api/chat] Processing message with streaming...');
        
        try {
            const stream = chatFlow.processMessageStream({
                message: formatMessageContent(lastMessage),
                userId: session.user.id,
                sessionId: session.session?.id || session.user.id, // Fallback if session.id missing
                conversationHistory: messages.slice(0, -1).map((m: any) => ({
                    role: m.role,
                    content: m.content
                })),
                userPreferences: userPreferencesPromise,
                locationData: userPreferencesPromise.then(p => p.location)
            });

            console.log('[POST /api/chat] Stream created, returning response');
            
            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Vercel-AI-Data-Stream': 'v1'
                }
            });
        } catch (streamError: any) {
            console.error('[POST /api/chat] Error creating stream:', streamError);
            return new Response(
                JSON.stringify({ 
                    error: 'Failed to create stream', 
                    details: process.env.NODE_ENV === 'development' ? streamError.message : 'Stream initialization failed'
                }), 
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

    } catch (error: any) {
        console.error('[POST /api/chat] CRITICAL ERROR:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
        });
        
        // Check if it's a database connection error
        const isConnectionError = 
            error?.message?.includes("Can't reach database server") ||
            error?.message?.includes('Database connection') ||
            error?.code === 'P1001' ||
            error?.code === 'P1002' ||
            error?.code === 'P1003';
        
        if (isConnectionError) {
            return new Response(
                JSON.stringify({ 
                    error: 'Database connection failed. Please try again later.',
                    code: 'DATABASE_ERROR'
                }), 
                { 
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
        
        return new Response(
            JSON.stringify({ 
                error: 'Internal Server Error', 
                details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
            }), 
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
