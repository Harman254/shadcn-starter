import { ChatPageClient } from '@/components/chat/chat-page-client';
import { fetchOnboardingData } from '@/data';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserPreference } from '@/types';
import { getOrGeneratePreferencesSummary } from '@/lib/utils/preferences-cache';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chat | Mealwise',
  description: 'Chat with your AI kitchen assistant for personalized meal planning, recipes, and cooking tips.',
};

// Force dynamic rendering since we use headers() for auth
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  // Fetch user preferences for context
  let preferences: UserPreference[] = [];
  let preferencesSummary = '';
  
  try {
    let session = null;
    try {
      const headersList = await headers();
      session = await auth.api.getSession({
        headers: headersList,
      });
    } catch (sessionError: any) {
      // Handle database connection errors when fetching session
      // In production, log minimal info
      if (process.env.NODE_ENV === 'production') {
        console.error('[ChatPage] Session fetch error');
      } else {
        console.error('[ChatPage] Error fetching session:', sessionError);
        if (sessionError instanceof Error) {
          console.error('[ChatPage] Session error details:', {
            message: sessionError.message,
            stack: sessionError.stack,
          });
        }
        console.warn('[ChatPage] Continuing without session - chat will still function');
      }
      // Continue without session - chat can work without preferences
      session = null;
    }
    
    if (session?.user?.id) {
      try {
        preferences = await fetchOnboardingData(session.user.id);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[ChatPage] Fetched preferences:', {
            userId: session.user.id,
            count: preferences.length,
            hasPreferences: preferences.length > 0,
          });
        }
        
        if (preferences.length > 0) {
          // Get cached summary or generate new one if preferences changed
          try {
            preferencesSummary = await getOrGeneratePreferencesSummary(session.user.id, preferences);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[ChatPage] Loaded preferences summary:', {
                count: preferences.length,
                summary: preferencesSummary,
              });
            }
          } catch (summaryError) {
            console.error('[ChatPage] Error getting preferences summary:', summaryError);
            if (process.env.NODE_ENV === 'development') {
              if (summaryError instanceof Error) {
                console.error('[ChatPage] Summary error details:', {
                  message: summaryError.message,
                  stack: summaryError.stack,
                });
              }
            }
            // Continue without summary - chat will work but without preference context
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[ChatPage] No preferences found for user:', session.user.id);
          }
        }
      } catch (fetchError) {
        console.error('[ChatPage] Error fetching onboarding data:', fetchError);
        if (process.env.NODE_ENV === 'development') {
          if (fetchError instanceof Error) {
            console.error('[ChatPage] Fetch error details:', {
              message: fetchError.message,
              stack: fetchError.stack,
            });
          }
        }
        // Continue without preferences - chat will work but without preference context
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ChatPage] No session found - user not authenticated');
      }
    }
  } catch (error) {
    // Log error but don't block page render - chat works without preferences
    console.error('[ChatPage] Error in preferences fetch flow:', error);
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof Error) {
        console.error('[ChatPage] Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
      console.warn('[ChatPage] Continuing without preferences - chat will still function');
    }
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatPageClient preferences={preferences} preferencesSummary={preferencesSummary} />
    </Suspense>
  );
}

