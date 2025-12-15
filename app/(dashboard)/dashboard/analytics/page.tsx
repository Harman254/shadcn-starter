import { AnalyticsHeader } from "./AnalyticsHeader";
import { StatCard } from "./StatCard";
import { Utensils, CalendarCheck, ShoppingCart, TrendingUp, Lock } from "lucide-react";
import { getUserAnalytics } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProGate } from "@/components/analytics/ProGate";
import { RefreshInsightsButton } from "@/components/analytics/RefreshInsightsButton";
import { checkUserProStatus } from "@/lib/subscription";

const Index = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        redirect("/sign-in");
    }

    // Parallel data fetching for performance
    const [analytics, isPro] = await Promise.all([
        getUserAnalytics(session.user.id),
        checkUserProStatus(session.user.id)
    ]);

    const { overview, trends, aiInsights } = analytics;
    const hasData = overview.totalMealsPlanned > 0;

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                     <AnalyticsHeader />
                     {isPro && <RefreshInsightsButton hasData={hasData} />}
                </div>

                {/* AI Insight Card (Pro Only) */}
                <ProGate isPro={isPro} blurAmount="md">
                    <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 border border-indigo-500/20 shadow-sm relative overflow-hidden min-h-[160px]">
                        <div className="relative z-10 p-2">
                             {aiInsights ? (
                                <>
                                    <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                                        <TrendingUp className="h-5 w-5" />
                                        AI Flavor Profile
                                    </h2>
                                    <p className="mt-2 text-foreground/80 font-medium italic">
                                        "{aiInsights.flavorProfile}"
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {aiInsights.suggestions.map((s, i) => (
                                            <span key={i} className="text-xs bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                                                💡 {s}
                                            </span>
                                        ))}
                                    </div>
                                </>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                     <p>Generate your first AI analysis to see insights.</p>
                                     {/* If Pro but no data yet, show instructions or empty state */}
                                     {!aiInsights && isPro && hasData && (
                                         <p className="text-xs">Click "Generate AI Insights" above.</p>
                                     )}
                                     {!hasData && (
                                         <p className="text-xs">Create some meal plans first!</p>
                                     )}
                                </div>
                             )}
                        </div>
                    </div>
                </ProGate>


                {/* Stats Grid (Visible to All) */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Meals"
                        value={overview.totalMealsPlanned}
                        change="Lifetime planned"
                        changeType="neutral"
                        icon={Utensils}
                        iconColor="bg-primary/10 text-primary"
                        delay={0}
                    />
                    <StatCard
                        title="Meal Plans"
                        value={overview.totalGenerations}
                        change="Generations created"
                        changeType="neutral"
                        icon={CalendarCheck}
                        iconColor="bg-warning/10 text-warning"
                        delay={100}
                    />
                    <StatCard
                        title="Recipes Saved"
                        value={overview.totalRecipesSaved}
                        change="Favorites"
                        changeType="positive"
                        icon={ShoppingCart}
                        iconColor="bg-accent/10 text-accent"
                        delay={200}
                    />
                    <StatCard
                        title="Est. Saved"
                        value={`$${overview.estimatedMoneySaved}`}
                        change="vs Takeout"
                        changeType="positive"
                        icon={TrendingUp}
                        iconColor="bg-info/10 text-info"
                        delay={300}
                    />
                </div>

                 {/* Charts Row - Gated for Pro */}
                <div className="mt-8 grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card relative">
                        <ProGate isPro={isPro} blurAmount="sm">
                             <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">Activity Trend</h2>
                                    <p className="text-sm text-muted-foreground">Planning frequency (Last 30 Days)</p>
                                </div>
                            </div>
                             <div className="overflow-x-auto pb-2">
                                 <div className="h-[200px] w-full min-w-[600px] flex items-end justify-between px-4 gap-2">
                                     {trends.weeklyActivity.length > 0 ? trends.weeklyActivity.map((day, i) => (
                                         <div key={i} className="flex flex-col items-center gap-1 group w-full">
                                              <div 
                                                className="w-full bg-primary/20 rounded-t-md hover:bg-primary/40 transition-all relative"
                                                style={{ height: `${Math.min(day.count * 20, 100)}%` }}
                                              >
                                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                      {day.count} plans
                                                  </div>
                                              </div>
                                              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{day.date.slice(5)}</span>
                                         </div>
                                     )) : (
                                         <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                                             No activity data yet
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </ProGate>
                    </div>

                    {/* Upsell / Info Card */}
                    <div className="rounded-2xl bg-card p-6 shadow-card flex flex-col items-center justify-center text-center">
                        {isPro ? (
                             <>
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="font-semibold text-lg">Pro Status Active</h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    You have full access to advanced analytics.
                                </p>
                             </>
                        ) : (
                            <>
                                 <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                    <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                 </div>
                                 <h3 className="font-semibold text-lg">Unlock Full Analytics</h3>
                                 <p className="text-sm text-muted-foreground mt-2 mb-4">
                                     See your detailed nutrition trends and cost savings.
                                 </p>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href="/pricing">Upgrade Now</a>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
