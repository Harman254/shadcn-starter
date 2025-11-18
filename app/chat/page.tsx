import { ChatPageClient } from '@/components/chat/chat-page-client';
import { fetchOnboardingData } from '@/data';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserPreference } from '@/types';
import { getOrGeneratePreferencesSummary } from '@/lib/utils/preferences-cache';

export default async function ChatPage() {
  // Fetch user preferences for context
  let preferences: UserPreference[] = [];
  let preferencesSummary = '';
  
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
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

  return <ChatPageClient preferences={preferences} preferencesSummary={preferencesSummary} />;
}

