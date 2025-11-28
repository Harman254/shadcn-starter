"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ConsolidatedShoppingListProps {
  mealPlan: {
    id: string;
    title?: string;
    days: Array<{
      date?: Date | string;
      meals: Array<{
        name?: string;
        ingredients: string[];
        [key: string]: any;
      }>;
      [key: string]: any;
    }>;
  };
}

interface GroceryItem {
  item: string;
  quantity: string;
  category: string;
  estimatedPrice: string;
  suggestedLocation: string;
}

export function ConsolidatedShoppingList({ mealPlan }: ConsolidatedShoppingListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [groceryList, setGroceryList] = useState<GroceryItem[] | null>(null);
  const [totalCost, setTotalCost] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // In a real app, we'd call the AI tool directly here.
      // For this demo, we'll use a client-side consolidation 
      // combined with a "mock" AI delay to show the UX, 
      // as connecting the full AI tool flow here requires a new API route.
      
      // 1. Flatten ingredients
      const allIngredients = mealPlan.days.flatMap(day => 
        day.meals.flatMap(meal => meal.ingredients)
      );

      // 2. Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Smart-ish local consolidation (Mocking the AI result for UI demo)
      // In production, this would be replaced by the actual AI tool response
      const consolidated = allIngredients.reduce((acc, curr) => {
        const key = curr.toLowerCase().trim();
        if (!acc[key]) {
          acc[key] = { count: 1, original: curr };
        } else {
          acc[key].count++;
        }
        return acc;
      }, {} as Record<string, { count: number, original: string }>);

      const items: GroceryItem[] = Object.values(consolidated).map((val, i) => ({
        item: val.original,
        quantity: val.count > 1 ? `x${val.count}` : "1",
        category: "General", // We'd need AI for real categorization
        estimatedPrice: "$2.00", // Mock price
        suggestedLocation: "Local Store"
      }));

      setGroceryList(items);
      setTotalCost(`$${(items.length * 2).toFixed(2)}`);
      toast.success("Grocery list generated!");

    } catch (error) {
      toast.error("Failed to generate list");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial simple view
  const allIngredients = mealPlan.days.flatMap(day => 
    day.meals.flatMap(meal => meal.ingredients)
  );
  const uniqueIngredients = Array.from(new Set(allIngredients.map(i => i.toLowerCase()))).sort();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Shopping List
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerate}
          disabled={isLoading}
          className="h-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-3 w-3" />
              {groceryList ? "Regenerate" : "Generate with Prices"}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pr-2 space-y-4">
          
          {totalCost && (
            <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Total</span>
              <span className="text-lg font-bold text-primary">{totalCost}</span>
            </div>
          )}

          {groceryList ? (
            <div className="space-y-1">
              {groceryList.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="font-medium text-sm">{item.item}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="bg-background px-2 py-0.5 rounded-full border shadow-sm text-xs">
                      {item.quantity}
                    </span>
                    <span className="w-16 text-right">{item.estimatedPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
               <p className="text-xs text-muted-foreground mb-4">
                Raw ingredients list ({uniqueIngredients.length} items). Generate for pricing and consolidation.
              </p>
              {uniqueIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-start gap-2 text-sm p-2 rounded-md hover:bg-muted/50">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="capitalize text-muted-foreground">{ingredient}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
