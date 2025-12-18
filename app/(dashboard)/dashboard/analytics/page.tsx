import { Lock, Crown } from "lucide-react";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAnalyticsData } from './analytics-data';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { hasAdvancedAnalytics } from '@/lib/utils/feature-gates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsClient } from './analytics-client';
import { UpgradeButton } from './upgrade-button';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    </div>
  );
}

async function AnalyticsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Check if user has Pro access to analytics
  const hasAccess = await hasAdvancedAnalytics(session.user.id);
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <CardTitle>Pro Feature</CardTitle>
            </div>
            <CardDescription>
              Advanced Analytics is available for Pro subscribers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Unlock powerful insights with Pro:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nutritional trends over time</li>
                <li>Meal prep efficiency metrics</li>
                <li>Cost analysis per meal</li>
                <li>Dietary goal tracking</li>
                <li>Export capabilities (CSV, JSON)</li>
              </ul>
            </div>
            <UpgradeButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const analyticsData = await fetchAnalyticsData(session.user.id, 'week');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AnalyticsClient analyticsData={analyticsData} />
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalyticsContent />
    </Suspense>
  );
};

export default Index;
