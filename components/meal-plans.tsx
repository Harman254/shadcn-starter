"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Utensils,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Meal, MealType } from "@/types";

const mealTypeColors: Record<MealType, string> = {
  breakfast: "bg-orange-100 text-orange-700",
  lunch: "bg-green-100 text-green-700",
  dinner: "bg-purple-100 text-purple-700",
  snack: "bg-blue-100 text-blue-700",
};

type MealPlansProps = {
  mealPlans: Meal[];
};

const MealPlans = ({ mealPlans }: MealPlansProps) => {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const mealsByDate = useMemo(() => {
    const result: Record<string, Meal[]> = {};
  
    for (const meal of mealPlans) {
      const dateKey = new Date(meal.dayMeal.date).toISOString().split("T")[0];
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      result[dateKey].push(meal);
    }
  
    return result;
  }, [mealPlans]);
  

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const currentDateStr = currentDate.toISOString().split("T")[0];
  const currentDayMeals = mealsByDate[currentDateStr] || [];

  const MealCard = ({ meal }: { meal: Meal }) => (
    <Card
      className="p-4 mb-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedMeal(meal)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className={mealTypeColors[meal.type as MealType]}
            >
              {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
            </Badge>
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {meal.calories} cal
            </span>
          </div>
          <h3 className="font-semibold text-lg mb-1">{meal.name}</h3>
          <p className="text-gray-600 text-sm">{meal.description}</p>
        </div>
        <Button variant="ghost" size="icon">
          <Utensils className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-purple-600" />
          Meal Plans
        </h1>
        <Select defaultValue="weekly">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily View</SelectItem>
            <SelectItem value="weekly">Weekly View</SelectItem>
            <SelectItem value="monthly">Monthly View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex items-center justify-between border-b">
          <Button variant="ghost" size="icon" onClick={() => navigateDay("prev")}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
          <Button variant="ghost" size="icon" onClick={() => navigateDay("next")}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-280px)] p-4">
          {currentDayMeals.length > 0 ? (
            currentDayMeals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          ) : (
            <div className="text-center text-gray-500 py-8">
              No meals planned for this day
            </div>
          )}
        </ScrollArea>
      </Card>

      <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMeal?.name}
            </DialogTitle>
            <DialogDescription>{selectedMeal?.description}</DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={mealTypeColors[selectedMeal.type]}
                >
                  {selectedMeal.type.charAt(0).toUpperCase() +
                    selectedMeal.type.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedMeal.calories} calories
                </span>
                <p>
                  {selectedMeal.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlans;
