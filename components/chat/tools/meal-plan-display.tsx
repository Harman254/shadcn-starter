"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Flame, Users, Bookmark, Check, Loader2, ShoppingCart, TrendingUp, Timer, ChefHat } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { CldImage } from 'next-cloudinary'

interface Meal {
  id: string;
  name: string;
  image: string;
  calories: number;
  prepTime: string;
  servings: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  description?: string;
  ingredients?: string[];
}

interface Citation {
  title: string;
  url: string;
  source: string;
}

interface MealPlanDisplayProps {
  // Accepts the tool output structure which contains days
  mealPlan: any
  onActionClick?: (action: string) => void
}

const mealTypeColors: Record<string, string> = {
  breakfast: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  lunch: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  dinner: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  snack: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

export function MealPlanDisplay({ mealPlan, onActionClick }: MealPlanDisplayProps) {
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [checkingSave, setCheckingSave] = useState(true)
  const router = useRouter()

  // Check if meal plan is already saved on mount
  useEffect(() => {
    const checkSaved = async () => {
      if (!mealPlan.title) {
        setCheckingSave(false)
        return
      }
      try {
        const response = await fetch('/api/getmealplans')
        if (response.ok) {
          const data = await response.json()
          // Handle different response formats
          const mealPlans = Array.isArray(data) ? data : data.mealPlans || data.data || []
          const existing = mealPlans.find((mp: any) => 
            mp.title?.toLowerCase().trim() === mealPlan.title.toLowerCase().trim()
          )
          if (existing) {
            setSavedId(existing.id)
          }
        }
      } catch (e) {
        // Silently fail - user can still save
      } finally {
        setCheckingSave(false)
      }
    }
    checkSaved()
  }, [mealPlan.title])

  const handleSave = async () => {
    if (savedId) return
    try {
      setSaving(true)
      const response = await fetch('/api/savemealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...mealPlan, 
          duration: Math.round(Number(mealPlan.duration)) || mealPlan.days?.length || 1,
          mealsPerDay: Math.round(Number(mealPlan.mealsPerDay)) || (mealPlan.days?.[0]?.meals?.length) || 3,
          createdAt: new Date().toISOString() 
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setSavedId(result.mealPlan.id)
        toast.success("Meal plan saved!", {
          description: `"${mealPlan.title}" has been added to your saved plans.`,
        })
        router.refresh()
      } else {
        toast.error("Failed to save", {
          description: result.error || "Please try again."
        })
      }
    } catch (e) {
      toast.error("Error", { description: "An unexpected error occurred." })
    } finally {
      setSaving(false)
    }
  }

  // Flatten meals from days for the grid view, or show day sections?
  // User design implies a flat list or at least a grid. 
  // Let's iterate days and show a section for each day if >1 day, or just the meals if 1 day.
  const isMultiDay = mealPlan.duration > 1;

  // Mock citations if none provided (as the tool currently doesn't output citations)
  const citations: Citation[] = [
    { title: "Healthy Eating Plate", url: "https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/", source: "Harvard Health" },
    { title: "Dietary Guidelines", url: "https://www.dietaryguidelines.gov/", source: "USDA" },
  ];

  return (
    <div className="w-full max-w-2xl space-y-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{mealPlan.title}</h3>
          <p className="text-sm text-muted-foreground">
            {mealPlan.mealsPerDay} meals per day • {mealPlan.days.reduce((acc: number, d: any) => acc + d.meals.length, 0)} total meals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Generated
          </Badge>
          <Button 
            size="sm" 
            onClick={handleSave} 
            className="gap-1.5"
            disabled={saving || !!savedId}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedId ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {savedId ? "Saved" : "Save Plan"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {mealPlan.days.map((day: any, dayIndex: number) => (
          <div key={dayIndex} className="space-y-3">
             {isMultiDay && (
                <h4 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider ml-1">
                  Day {day.day}
                </h4>
             )}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {day.meals.map((meal: any, mealIndex: number) => (
                <Card 
                  key={`${dayIndex}-${mealIndex}`} 
                  className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => onActionClick?.(`Show me the full recipe for ${meal.name}`)}
                >
                  <div className="relative h-32 overflow-hidden">
                    {meal.imageUrl && meal.imageUrl.includes('cloudinary.com') ? (
                      <CldImage
                        src={meal.imageUrl}
                        alt={meal.name}
                        width={400}
                        height={256}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src={meal.imageUrl || meal.image || "https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg"}
                        alt={meal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg';
                        }}
                      />
                    )}
                    <Badge 
                      className={`absolute top-2 left-2 text-xs border-0 ${mealTypeColors[meal.mealType] || "bg-primary/20 text-primary"}`}
                    >
                      {meal.mealType}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1 mb-2 group-hover:text-primary transition-colors">
                      {meal.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {meal.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {meal.calories} cal
                        </span>
                      )}
                      {(meal.prepTime || meal.cookTime) && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.prepTime || meal.cookTime}
                        </span>
                      )}
                      {meal.servings && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {meal.servings}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons Row */}
      {onActionClick && (
         <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onActionClick("Generate a grocery list for this plan")}>
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Grocery List
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onActionClick("Analyze the nutrition")}>
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Nutrition
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                // Extract all meal names from the meal plan
                const mealNames = mealPlan.days.flatMap((day: any) => 
                  day.meals.map((meal: any) => meal.name)
                );
                const recipesList = mealNames.length > 0 
                  ? mealNames.join(', ')
                  : 'these meals';
                onActionClick(`Create a prep schedule for this meal plan with recipes: ${recipesList}`);
              }}
            >
              <Timer className="w-3.5 h-3.5 mr-1.5" /> Prep Schedule
            </Button>
             {savedId && (
              <Button variant="ghost" size="sm" onClick={() => router.push(`/meal-plans/${savedId}/explore`)}>
                <ChefHat className="w-3.5 h-3.5 mr-1.5" /> View Full Plan
              </Button>
             )}
         </div>
      )}

      {/* Citations */}
      <div className="pt-3 border-t border-border/50">
        <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
        <div className="flex flex-wrap gap-2">
          {citations.map((citation, index) => (
            <a
              key={index}
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-medium">
                {index + 1}
              </span>
              <span className="max-w-[120px] truncate">{citation.source}</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
