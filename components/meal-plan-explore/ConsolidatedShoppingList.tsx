"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ConsolidatedShoppingListProps {
  mealPlan: {
    id: string;
    days: {
      meals: {
        ingredients: string[];
      }[];
    }[];
  };
}

export function ConsolidatedShoppingList({ mealPlan }: ConsolidatedShoppingListProps) {
  // Flatten and deduplicate ingredients for a quick view
  const allIngredients = mealPlan.days.flatMap(day => 
    day.meals.flatMap(meal => meal.ingredients)
  );
  
  // Simple consolidation (case-insensitive deduplication)
  const uniqueIngredients = Array.from(new Set(allIngredients.map(i => i.toLowerCase()))).sort();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping List
        </CardTitle>
        <Button variant="outline" size="sm">
          Generate with Prices
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {uniqueIngredients.length > 0 ? (
            uniqueIngredients.map((ingredient, index) => (
              <div key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-muted/50">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <span className="capitalize">{ingredient}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">No ingredients found in this plan.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
