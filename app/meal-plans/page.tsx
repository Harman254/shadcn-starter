import React from 'react';
import { fetchMealPlansByUserId } from '@/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, UtensilsIcon } from 'lucide-react';
import DeleteButton from '@/components/delete-button';
import Link from 'next/link';
import { MealPlan } from '@/types'; 
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

const MealPlans = async () => {

  const session = await auth.api.getSession({
    headers: await headers() 
})

const userId = session?.user?.id




  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-muted/20 rounded-lg max-w-md">
          <h3 className="text-xl font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">
            You must be logged in to view your meal plans.
          </p>
        </div>
      </div>
    );
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId);

  if (mealPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-muted/20 rounded-lg max-w-md">
          <h3 className="text-xl font-medium mb-2">No Meal Plans Found</h3>
          <p className="text-muted-foreground mb-4">
            Please generate a meal plan first.
          </p>
          <Link
            href="/meal-plans/new"
            className="px-4 py-2 bg-primary rounded-md font-medium text-sm inline-block text-primary-foreground hover:bg-primary/80 transition duration-200"
          >
            Create Meal Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Your Meal Plans</h1>
      <div className="grid gap-6">
        {mealPlans.map((mealPlan) => (
          <Card
            key={mealPlan.id}
            className="border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:bg-muted/20 transition-all duration-200 p-4 rounded-lg"
          >
            
            <CardHeader className="bg-muted/10 border-b border-border pb-4">
              <Link
                href={`/meal-plans/${mealPlan.id}`}
                className="hover:underline"
                >
                <div className="flex items-center justify-between mb-1">
                  <CardTitle className="text-xl font-semibold">
                    {mealPlan.title}
                  </CardTitle>
                  
                  <Badge variant="outline" className="bg-background/80">
                    {mealPlan.mealsPerDay} meals/day
                  </Badge>
                </div>
                <h2 className='text-lg font-bold text-foreground tracking-tighter'>
                    {mealPlan.duration}-Day Meal Plan
                  </h2>
                <CardDescription className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                  Created on{' '}
                  {new Date(mealPlan.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </Link>
            </CardHeader>

            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {mealPlan.duration * mealPlan.mealsPerDay} total meals planned
                </span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <Link
                  href={`/meal-plans/${mealPlan.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View Details
                </Link>
                <DeleteButton id={mealPlan.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MealPlans;
