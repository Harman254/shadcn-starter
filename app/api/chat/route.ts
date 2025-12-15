import { StreamData } from 'ai';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';

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
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
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

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1'
            }
        });

    } catch (error: any) {
        console.error('CRITICAL ERROR in chat API:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            cause: error.cause
        });
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
