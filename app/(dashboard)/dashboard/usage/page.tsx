import { UsageDashboard } from './usage-dashboard';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Force dynamic rendering since we use headers() for auth
export const dynamic = 'force-dynamic';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading usage stats...</p>
      </div>
    </div>
  );
}

async function UsageContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  return <UsageDashboard userId={session.user.id} />;
}

export default function UsagePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UsageContent />
    </Suspense>
  );
}

