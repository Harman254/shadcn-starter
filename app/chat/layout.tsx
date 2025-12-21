import { Toaster } from "@/components/ui/sonner";
import { ReactNode, Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

// Force dynamic rendering since we use headers() for auth
export const dynamic = 'force-dynamic';

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Fetch session - required for chat access
  let session = null;
  
  try {
    const headersList = await headers();
    session = await auth.api.getSession({
      headers: headersList,
    });
  } catch (error: any) {
    // Handle errors gracefully
    // In production, log minimal info to avoid exposing internals
    if (process.env.NODE_ENV === 'production') {
      console.error('[ChatLayout] Session fetch error');
    } else {
      console.error('[ChatLayout] Error fetching session:', error);
      if (error instanceof Error) {
        console.error('[ChatLayout] Error details:', {
          message: error.message,
          digest: (error as any).digest,
        });
      }
    }
    
    // Set session to null - will trigger redirect below
    session = null;
  }

  // Authentication required - redirect to home if no session
  // This check must be outside try-catch for redirect to work properly
  if (!session) {
    redirect("/");
  }
  
  return (
    <div className="h-full w-full" suppressHydrationWarning>
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
        {children}
      </Suspense>
      <Toaster 
        richColors 
        closeButton 
        theme="light" 
        position="bottom-right"
        className="md:mr-4"
      />
    </div>
  );
}
