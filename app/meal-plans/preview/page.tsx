'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NutritionOverview } from '@/components/meal-plan-explore/NutritionOverview';
import { ConsolidatedShoppingList } from '@/components/meal-plan-explore/ConsolidatedShoppingList';
import { PrepTimeline } from '@/components/meal-plan-explore/PrepTimeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, AlertCircle, CircleDotIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function getMealType(mealIndex: number, mealsPerDay: number): string {
  if (mealIndex === 0) return 'breakfast';
  if (mealIndex === 1) return 'lunch';
  if (mealIndex === 2) return 'dinner';
  return 'snack';
}

export default function PreviewMealPlanPage() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('mealPlanPreview');
    if (!data) {
      router.push('/chat');
      return;
    }
    
    try {
      // Transform to match database structure
      const parsedPlan = JSON.parse(data);
      const transformed = {
        id: 'preview',
        userId: 'preview',
        createdAt: new Date(),
        coverImageUrl: null,
        ...parsedPlan,
        days: parsedPlan.days.map((day: any, idx: number) => ({
          id: `preview-day-${idx}`,
          date: new Date(Date.now() + idx * 24 * 60 * 60 * 1000),
          mealPlanId: 'preview',
          meals: day.meals.map((meal: any, mealIdx: number) => ({
            id: `preview-meal-${idx}-${mealIdx}`,
            dayMealId: `preview-day-${idx}`,
            isLiked: false,
            ...meal,
            type: getMealType(mealIdx, parsedPlan.mealsPerDay),
            calories: meal.ingredients?.length ? meal.ingredients.length * 100 : 300,
            imageUrl: meal.imageUrl || null,
          })),
        })),
      };
      
      setMealPlan(transformed);
    } catch (error) {
      console.error('Failed to parse meal plan preview:', error);
      router.push('/chat');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!mealPlan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Premium Header with Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "sticky top-0 z-50",
            "backdrop-blur-xl bg-background/80 border border-border/50",
            "rounded-2xl shadow-lg shadow-primary/5",
            "p-4 sm:p-6"
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => router.back()}
                className="shrink-0 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Preview Mode
                  </h1>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    "border border-amber-500/20 text-xs font-medium"
                  )}>
                    <CircleDotIcon className="h-3 w-3" />
                    Unsaved
                  </div>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {mealPlan.title} • {mealPlan.duration} {mealPlan.duration === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.back()}
              size="lg"
              className={cn(
                "w-full sm:w-auto gap-2 font-semibold",
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:from-primary/90 hover:to-primary/80",
                "shadow-lg shadow-primary/25"
              )}
            >
              <Save className="h-4 w-4" />
              Save to Continue
            </Button>
          </div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className={cn(
              "mt-4 p-3 rounded-lg",
              "bg-blue-500/5 border border-blue-500/20",
              "flex items-start gap-2"
            )}
          >
            <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
              This is a preview. Go back and click <span className="font-semibold">"Save Meal Plan"</span> to save permanently and unlock full features.
            </p>
          </motion.div>
        </motion.div>

        {/* Nutrition Overview with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <NutritionOverview mealPlan={mealPlan} />
        </motion.div>

        {/* Main Content Grid with Staggered Animation */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="lg:col-span-2"
          >
            <PrepTimeline mealPlan={mealPlan} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <ConsolidatedShoppingList mealPlan={mealPlan} />
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className={cn(
            "sticky bottom-6",
            "p-6 rounded-2xl",
            "bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10",
            "border border-border/50 backdrop-blur-xl",
            "shadow-lg"
          )}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Ready to save this plan?</h3>
              <p className="text-sm text-muted-foreground">
                Save it to access nutrition tracking, grocery lists, and more features.
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              size="lg"
              className={cn(
                "w-full sm:w-auto gap-2 font-semibold",
                "bg-gradient-to-r from-primary to-primary/90",
                "hover:from-primary/90 hover:to-primary/80",
                "shadow-lg shadow-primary/25"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Save
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
