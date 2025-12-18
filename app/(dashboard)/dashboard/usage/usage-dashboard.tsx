'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Calendar,
  DollarSign,
  Crown,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { useProFeatures } from '@/hooks/use-pro-features';

interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  toolBreakdown: Array<{
    toolName: string;
    calls: number;
    tokens: number;
    cost: number;
  }>;
}

interface FeatureUsage {
  toolName: string;
  currentUsage: number;
  limit: number;
  remaining: number;
  period: 'week' | 'month';
}

interface UsageDashboardProps {
  userId: string;
}

export function UsageDashboard({ userId }: UsageDashboardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const { isPro, subscription } = useProFeatures();

  useEffect(() => {
    async function fetchUsage() {
      try {
        setLoading(true);
        const [statsRes, usageRes] = await Promise.all([
          fetch(`/api/usage/stats?period=${period}`),
          fetch(`/api/usage/features?period=${period}`),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setFeatureUsage(usageData);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [period]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading usage stats...</p>
        </div>
      </div>
    );
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === Infinity) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'destructive';
    if (percentage >= 75) return 'warning';
    return 'default';
  };

  const formatToolName = (toolName: string) => {
    return toolName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Usage Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Track your AI tool usage and manage your plan
              </p>
            </div>
            {!isPro && (
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard/account?upgrade=usage">
                  <Crown className="h-4 w-4" />
                  Upgrade to Pro
                </Link>
              </Button>
            )}
            {isPro && (
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Pro Member
              </Badge>
            )}
          </div>
        </div>

        {/* Period Selector */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')} className="mb-6">
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCalls || 0}</div>
              <p className="text-xs text-muted-foreground">
                {period === 'week' ? 'This week' : 'This month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalTokens ? (stats.totalTokens / 1000).toFixed(1) + 'K' : '0'}
              </div>
              <p className="text-xs text-muted-foreground">Input + Output tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats?.totalCost ? stats.totalCost.toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">AI API usage cost</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{subscription?.plan || 'Free'}</div>
              <p className="text-xs text-muted-foreground">
                {isPro ? 'Unlimited access' : 'Limited features'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Usage Limits (Free Users) */}
        {!isPro && featureUsage.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>
                Track your remaining free tier limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureUsage.map((usage) => {
                const percentage = getUsagePercentage(usage.currentUsage, usage.limit);
                const isNearLimit = percentage >= 75;
                const isAtLimit = percentage >= 100;

                return (
                  <div key={usage.toolName} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatToolName(usage.toolName)}</span>
                        {isAtLimit ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Limit Reached
                          </Badge>
                        ) : isNearLimit ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Near Limit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {usage.remaining} remaining
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {usage.currentUsage} / {usage.limit === Infinity ? '∞' : usage.limit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    {isNearLimit && !isAtLimit && (
                      <div className="flex items-center gap-2 text-xs text-warning">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                          You're at {percentage.toFixed(0)}% of your limit. Upgrade to Pro for unlimited access.
                        </span>
                      </div>
                    )}
                    {isAtLimit && (
                      <div className="flex items-center gap-2 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>You've reached your limit. Upgrade to Pro to continue.</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {featureUsage.some((u) => getUsagePercentage(u.currentUsage, u.limit) >= 75) && (
                <Button asChild className="w-full mt-4" variant="default">
                  <Link href="/dashboard/account?upgrade=usage">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro for Unlimited Access
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tool Breakdown */}
        {stats && stats.toolBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tool Usage Breakdown</CardTitle>
              <CardDescription>
                Detailed usage by tool for {period === 'week' ? 'this week' : 'this month'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.toolBreakdown.map((tool) => (
                  <div key={tool.toolName} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{formatToolName(tool.toolName)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{tool.calls} calls</span>
                        <span>{(tool.tokens / 1000).toFixed(1)}K tokens</span>
                        <span>${tool.cost.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${tool.cost.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro Benefits (Free Users) */}
        {!isPro && (
          <Card className="mt-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle>Unlock Pro Benefits</CardTitle>
              </div>
              <CardDescription>
                Get unlimited access to all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited meal plans per week
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited pantry image analyses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Unlimited recipe generations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Advanced analytics dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Export to CSV, JSON formats
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Grocery list optimization
                </li>
              </ul>
              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard/account?upgrade=usage">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pro Stats (Pro Users) */}
        {isPro && stats && (
          <Card className="mt-6 border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <CardTitle>Pro Member Benefits</CardTitle>
              </div>
              <CardDescription>
                You have unlimited access to all features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Savings</div>
                  <div className="text-2xl font-bold text-amber-500">
                    ${(stats.totalCost * 0.5).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">Estimated savings vs free tier</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Unlimited Access</div>
                  <div className="text-2xl font-bold text-primary">∞</div>
                  <div className="text-xs text-muted-foreground">No limits on any features</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

