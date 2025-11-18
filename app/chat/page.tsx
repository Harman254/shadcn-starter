import { ChatPageClient } from '@/components/chat/chat-page-client';
import { fetchOnboardingData } from '@/data';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { UserPreference } from '@/types';

export default async function ChatPage() {
  // Fetch user preferences for context
  let preferences: UserPreference[] = [];
  
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (session?.user?.id) {
      preferences = await fetchOnboardingData(session.user.id);
      
      if (process.env.NODE_ENV === 'development' && preferences.length > 0) {
        console.log('[ChatPage] Loaded user preferences:', {
          count: preferences.length,
          dietaryPreference: preferences[0]?.dietaryPreference,
          goal: preferences[0]?.goal,
        });
      }
    }
  } catch (error) {
    // Log error but don't block page render - chat works without preferences
    console.error('[ChatPage] Error fetching preferences:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ChatPage] Continuing without preferences - chat will still function');
    }
  }

  return <ChatPageClient preferences={preferences} />;
}

