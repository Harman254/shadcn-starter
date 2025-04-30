'use client';

import React, { useState } from 'react';
import { GenerateMealPlanInput, generatePersonalizedMealPlan } from '@/ai/flows/generate-meal-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/lable';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMealPlanStore } from '@/store';
import { UserPreference } from '@/types';
import { Loader2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Skeleton } from './ui/skeleton';

/* ======================== */
/*        Interfaces         */
/* ======================== */

interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
}

export interface DayMealPlan {
  day: number;
  meals: Meal[];
}

interface CreateMealPlanProps {
  preferences: UserPreference[];
}

/* ======================== */
/*         Component         */
/* ======================== */
const CreateMealPlan = ({ preferences }: CreateMealPlanProps) => {
  const {
    mealPlan,
    duration,
    mealsPerDay,
    setDuration,
    setMealsPerDay,
    setMealPlan,
    clearMealPlan,
  } = useMealPlanStore();

  const [loading, setLoading] = useState(false);
  const [savingMealPlan, setSavingMealPlan] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  /* ======================== */
  /*       Functions           */
  /* ======================== */

  const generateMealPlan = async () => {
    const { duration, mealsPerDay } = useMealPlanStore.getState();

    try {
      setLoading(true);

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      };

      const result = await generatePersonalizedMealPlan(input);

      if (!result?.mealPlan) {
        toast.error('Meal plan service returned invalid data');
        clearMealPlan();
        return;
      }

      const today = new Date().toISOString();
      setMealPlan(result.mealPlan, duration, mealsPerDay, today);
      
      toast.success('Meal plan generated successfully!');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error('Failed to generate meal plan');
      clearMealPlan();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMealPlan = async () => {
    try {
      setSavingMealPlan(true);

      const response = await fetch('/api/savemealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          mealsPerDay,
          days: mealPlan,
          createdAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save meal plan');
      }

      toast.success('Meal plan saved successfully!');
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast.error('Failed to save meal plan');
    } finally {
      setSavingMealPlan(false);
    }
  };

  const handleRejectPlan = async () => {
    if (regenerating) return;
    
    try {
      setRegenerating(true);
      
      // We'll clear the meal plan but keep the UI visible with loading indicators
      // instead of showing skeleton loaders
      
      const { duration, mealsPerDay } = useMealPlanStore.getState();

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences,
      };

      const result = await generatePersonalizedMealPlan(input);

      if (!result?.mealPlan) {
        toast.error('Meal plan service returned invalid data');
        return;
      }

      const today = new Date().toISOString();
      setMealPlan(result.mealPlan, duration, mealsPerDay, today);
      
      toast.success('Meal plan regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating meal plan:', error);
      toast.error('Failed to regenerate meal plan');
    } finally {
      setRegenerating(false);
    }
  };

  /* ======================== */
  /*         Render            */
  /* ======================== */

  if (loading || regenerating) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-10">
        {/* Skeleton for the Configuration UI */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-md overflow-hidden">
          <CardHeader className="bg-neutral-50 dark:bg-neutral-900 px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <CardTitle className="text-2xl font-bold tracking-tight">
              <Skeleton className="w-48 h-7" />
            </CardTitle>
            <CardDescription className="text-neutral-500 dark:text-neutral-400 mt-1.5">
              <Skeleton className="w-64 h-4" />
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Skeleton for Select Inputs */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Skeleton for Generate Button */}
            <div className="pt-2">
              <Skeleton className="h-12 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Skeleton for Meal Plan */}
        <Card className="shadow-md border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <CardHeader className="bg-neutral-50 dark:bg-neutral-900 px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  <Skeleton className="w-36 h-6" />
                </CardTitle>
                <CardDescription className="mt-1">
                  <Skeleton className="w-24 h-4" />
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              {[1, 2].map(day => (
                <div key={day} className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-4">
                    {[1, 2].map(meal => (
                      <div key={meal} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-4">
                        <div className="space-y-4">
                          <Skeleton className="h-5 w-32" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <div className="space-y-1.5 pl-3">
                              <Skeleton className="h-3.5 w-full" />
                              <Skeleton className="h-3.5 w-5/6" />
                              <Skeleton className="h-3.5 w-4/6" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Configuration */}
      <Card className="border-neutral-200 dark:border-neutral-800 shadow-md overflow-hidden">
        <CardHeader className="bg-neutral-50 dark:bg-neutral-900 px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Meal Plan Configuration
          </CardTitle>
          <CardDescription className="text-neutral-500 dark:text-neutral-400 mt-1.5">
            Set your preferences and generate a personalized plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Duration Selector */}
            <div className="space-y-3">
              <Label htmlFor="duration" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Duration
              </Label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                <SelectTrigger className="w-full h-11 border-neutral-300 dark:border-neutral-700 text-base">
                  <SelectValue placeholder={`${duration} days`} />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 5, 7, 10, 14].map((d) => (
                    <SelectItem key={d} value={d.toString()} className="text-base">
                      {d} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Meals per Day Selector */}
            <div className="space-y-3">
              <Label htmlFor="mealsPerDay" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Meals per day
              </Label>
              <Select value={mealsPerDay.toString()} onValueChange={(v) => setMealsPerDay(parseInt(v))}>
                <SelectTrigger className="w-full h-11 border-neutral-300 dark:border-neutral-700 text-base">
                  <SelectValue placeholder={`${mealsPerDay} meals`} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <SelectItem key={m} value={m.toString()} className="text-base">
                      {m} meals
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <Button
              onClick={generateMealPlan}
              disabled={loading}
              className="h-12 px-8 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 transition-all"
            >
              {loading ? (
                <>
                  Generating...
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                </>
              ) : 'Generate Meal Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Display Meal Plan */}
      {mealPlan.length > 0 && (
        <Card className="shadow-md border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <CardHeader className="bg-neutral-50 dark:bg-neutral-900 px-6 pt-5 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <CardTitle className="text-xl font-bold tracking-tight">
                  Your Meal Plan
                </CardTitle>
                <CardDescription className="mt-1 text-neutral-500 dark:text-neutral-400">
                  {duration} days • {mealsPerDay} meals per day
                </CardDescription>
              </div>
              {/* Actions */}
              <div className="flex gap-3 mt-2 sm:mt-0">
                <Button
                  onClick={handleSaveMealPlan}
                  disabled={savingMealPlan}
                  variant="outline"
                  className="h-9 px-4 text-sm font-medium border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {savingMealPlan ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="mr-1.5 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Plan
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRejectPlan}
                  disabled={regenerating}
                  variant="destructive"
                  className="h-9 px-4 text-sm font-medium bg-red-100 hover:bg-red-200 text-red-700 border-0 transition-colors"
                >
                  {regenerating ? (
                    <>
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="p-6 space-y-8">
                {mealPlan.map((dayPlan) => (
                  <div key={dayPlan.day} className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                      Day {dayPlan.day}
                    </h3>
                    <div className="space-y-4">
                      {dayPlan.meals.map((meal, idx) => (
                        <div 
                          key={idx} 
                          className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <h4 className="text-base font-semibold tracking-tight">{meal.name}</h4>
                          <div className="space-y-2">
                            <Badge 
                              variant="secondary" 
                              className="mb-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs px-2.5 py-0.5"
                            >
                              Ingredients
                            </Badge>
                            <ul className="list-disc pl-5 text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                              {meal.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <Badge 
                              variant="secondary"
                              className="mb-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs px-2.5 py-0.5"
                            >
                              Cooking Procedure
                            </Badge>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                              {meal.instructions}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateMealPlan;
