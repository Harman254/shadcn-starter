'use client';

import React, { useState } from 'react';
import { GenerateMealPlanInput } from '@/ai/flows/generate-meal-plan';
import { generatePersonalizedMealPlan } from '@/ai/flows/generate-meal-plan';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/lable';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/hooks/use-toast';
import { UserPreference } from '@/types';
import { Loader2, RefreshCcw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

const CreateMealPlan = ({ preferences }: CreateMealPlanProps) => {
  const [duration, setDuration] = useState<number>(7);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealPlan, setMealPlan] = useState<DayMealPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingMealPlan, setSavingMealPlan] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const generateMealPlan = async () => {
    try {
      setLoading(true);

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences
      };

      const result = await generatePersonalizedMealPlan(input);

      if (!result || !result.mealPlan) {
        throw new Error('No meal plan returned');
      }

      setMealPlan(result.mealPlan);

      Toast({
        title: 'Meal plan generated successfully!',
      });
    } catch (error) {
      Toast({
        title: 'Error generating meal plan',
        variant: 'destructive'
      });
      console.error('Error generating meal plan:', error);
      setMealPlan([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMealPlan = async () => {
    setSavingMealPlan(true);

    try {
      const response = await fetch('/api/savemealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          mealsPerDay,
          days: mealPlan,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save meal plan');
      }

      Toast({
        title: 'Meal plan saved!',
      });

      console.log('Meal plan saved successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      Toast({
        title: 'Failed to save meal plan',
        variant: 'destructive'
      });
    } finally {
      setSavingMealPlan(false);
    }
  };

  const handleRejectPlan = async () => {
    try {
      setRegenerating(true);
      setMealPlan([]);

      await generateMealPlan();

      Toast({
        title: 'New meal plan generated!',
      });
    } catch (error) {
      console.error('Error regenerating plan:', error);
      Toast({
        title: 'Error regenerating plan',
        variant: 'destructive'
      });
    } finally {
      setRegenerating(false);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(parseInt(value, 10));
  };

  const handleMealsPerDayChange = (value: string) => {
    setMealsPerDay(parseInt(value, 10));
  };

  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-8">
      {/* Configuration Card */}
      <Card className="border border-muted shadow-xl">
        <CardHeader className="bg-muted/30 rounded-t-lg px-6 py-4">
          <CardTitle className="text-2xl font-bold text-foreground">
            Meal Plan Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Set your preferences and generate a personalized plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-base font-medium">Duration</Label>
              <Select onValueChange={handleDurationChange} defaultValue={duration.toString()}>
                <SelectTrigger className="bg-background border rounded-lg px-4 py-2 text-foreground">
                  <SelectValue placeholder={`${duration} days`} />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 5, 7, 10, 14].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mealsPerDay" className="text-base font-medium">Meals per day</Label>
              <Select onValueChange={handleMealsPerDayChange} defaultValue={mealsPerDay.toString()}>
                <SelectTrigger className="bg-background border rounded-lg px-4 py-2 text-foreground">
                  <SelectValue placeholder={`${mealsPerDay} meals`} />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((meal) => (
                    <SelectItem key={meal} value={meal.toString()}>
                      {meal} meals
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={generateMealPlan}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
          >
            {loading ? (
              <>
                Generating...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Generate Meal Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Meal Plan UI */}
      {mealPlan.length > 0 && (
        <Card className="shadow-xl border border-muted">
          <CardHeader className="bg-muted/30 px-6 py-4 rounded-t-lg">
            <CardTitle className="text-xl tracking-tight font-bold">Your Meal Plan</CardTitle>
            <CardDescription className="text-muted-foreground mt-1 text-md">
              {duration} days • {mealsPerDay} meals per day
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-screen rounded-md border border-muted">
              <div className="space-y-6 p-4">
                {mealPlan.map((dayPlan) => (
                  <div key={dayPlan.day}>
                    <h3 className="text-lg font-semibold text-primary mb-3">Day {dayPlan.day}</h3>
                    <div className="grid gap-4">
                      {dayPlan.meals.map((meal, index) => (
                        <div
                          key={index}
                          className="bg-muted/10 border border-border rounded-xl p-4 space-y-3 shadow-md"
                        >
                          <h4 className="text-base font-semibold">{meal.name}</h4>
                          <div>
                            <Badge variant="secondary" className="mb-1 text-md">Ingredients</Badge>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                              {meal.ingredients.map((ingredient, i) => (
                                <li className="text-md text-foreground/80" key={i}>
                                  {ingredient}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                          <Badge variant="secondary" className="mb-1 text-lg tracking-tighter font-semibold leading-3">Cooking Procedure</Badge>
                            <p className="text-md text-foreground/80">
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

      {/* Buttons */}
      <div className="flex">
        <Button
          onClick={handleSaveMealPlan}
          variant="outline"
          disabled={savingMealPlan || mealPlan.length === 0}
          className={`px-4 m-2 ${savingMealPlan ? 'bg-gray-400' : 'bg-green-500'}`}
        >
          {savingMealPlan ? (
            <>
              Saving...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            'Save Meal Plan'
          )}
        </Button>
        <Button
          onClick={handleRejectPlan}
          disabled={regenerating || mealPlan.length === 0}
          variant="destructive"
          className="px-4 m-2"
        >
          {regenerating ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reject & Regenerate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateMealPlan;
