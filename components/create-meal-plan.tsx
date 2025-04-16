'use client';

import React, { useEffect, useState } from 'react';
import { GenerateMealPlanInput } from '@/ai/flows/generate-meal-plan';
import { generatePersonalizedMealPlan } from '@/ai/flows/generate-meal-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from '@/hooks/use-toast';
import { UserPreference } from '@/types';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { fetchOnboardingData } from '@/data';

interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
}

interface DayMealPlan {
  day: number;
  meals: Meal[];  
}

interface CreateMealPlanProps {
  preferences: UserPreference[];
  // Add any props you need here
}



const CreateMealPlan  = ( {preferences}:CreateMealPlanProps) => {
  const [duration, setDuration] = useState<number>(7);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [mealPlan, setMealPlan] = useState<DayMealPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  // Fetch user preferences on mount
  
  const generateMealPlan = async () => {
    setLoading(true);
    setUserPreferences(preferences);
    try {
      if (!userPreferences || userPreferences.length === 0) {
        setOpenAlertDialog(true);
        toast({
          title: 'No preferences set',
          description: 'Please set your preferences before generating a meal plan.'
        });
        return;
      }

      const input: GenerateMealPlanInput = {
        duration,
        mealsPerDay,
        preferences: userPreferences
      };

      const result = await generatePersonalizedMealPlan(input);

      if (!result || !result.mealPlan) {
        throw new Error('No meal plan returned');
      }

      setMealPlan(result.mealPlan);
      toast({
        title: 'Meal plan generated successfully!',
        description: 'Your personalized meal plan is ready to view.'
      });
    } catch (error) {
      toast({
        title: 'Error generating meal plan',
        description: 'Failed to generate meal plan. Please try again.',
        variant: 'destructive'
      });
      console.error('Error generating meal plan:', error);
      setMealPlan([]); // Clear the meal plan on error
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (value: string) => {
    setDuration(parseInt(value, 10));
  };

  const handleMealsPerDayChange = (value: string) => {
    setMealsPerDay(parseInt(value, 10));
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Meal Plan Configuration</CardTitle>
          <CardDescription>
            Configure the duration and meals per day for your personalized meal plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Select onValueChange={handleDurationChange} defaultValue={duration.toString()}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={`${duration} days`} />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14].map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mealsPerDay">Meals per day</Label>
              <Select onValueChange={handleMealsPerDayChange} defaultValue={mealsPerDay.toString()}>
                <SelectTrigger className="mt-1">
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
            className="bg-accent text-accent-foreground font-bold py-2 px-4 rounded"
          >
            {loading ? (
              <>
                Generating Meal Plan...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              'Generate Meal Plan'
            )}
          </Button>
        </CardContent>
      </Card>

      {mealPlan.length > 0 && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Generated Meal Plan</CardTitle>
            <CardDescription>
              Here is your personalized meal plan for {duration} days with {mealsPerDay} meals per
              day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <div className="grid gap-4 p-4">
                {mealPlan.map((dayPlan) => (
                  <div key={dayPlan.day} className="mb-4">
                    <h3 className="text-md font-semibold mb-2">Day {dayPlan.day}</h3>
                    {dayPlan.meals.map((meal, index) => (
                      <div key={index} className="mb-3 p-3 rounded-md border border-border">
                        <h4 className="text-sm font-semibold">{meal.name}</h4>
                        <div className="mt-1">
                          <Badge variant="secondary">Ingredients:</Badge>
                          <ul className="list-disc pl-5 mt-1">
                            {meal.ingredients.map((ingredient, i) => (
                              <li key={i} className="text-sm">
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-1">
                          <Badge variant="secondary">Instructions:</Badge>
                          <p className="text-sm mt-1">{meal.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="mt-4">
            Set Preferences
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Preferences Required</AlertDialogTitle>
            <AlertDialogDescription>
              To generate a personalized meal plan, please set your dietary restrictions and
              allergies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Set Preferences</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreateMealPlan;
