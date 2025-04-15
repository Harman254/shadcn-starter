'use client'
import React, { useState } from "react";
import { MealPlan, Meal, DayPlan, MealType } from "@/types/index";
import { mockMealPlan, regenerateMeal } from "@/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditMealModal from "./EditMealModal";

const MealPlanView = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan>(mockMealPlan);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const handleEditMeal = (dayId: string, meal: Meal) => {
    setSelectedMeal(meal);
    setSelectedDayId(dayId);
    setIsModalOpen(true);
  };

  const handleSaveMeal = (updatedMeal: Meal) => {
    if (!selectedDayId) return;

    setMealPlan((prevPlan) => {
      return {
        ...prevPlan,
        days: prevPlan.days.map((day) => {
          if (day.id === selectedDayId) {
            return {
              ...day,
              meals: day.meals.map((meal) => {
                if (meal.id === updatedMeal.id) {
                  return updatedMeal;
                }
                return meal;
              }),
            };
          }
          return day;
        }),
      };
    });

    setIsModalOpen(false);
    setSelectedMeal(null);
    setSelectedDayId(null);
  };

  const handleRegenerateMeal = (dayId: string, mealType: MealType, mealId: string) => {
    const newMeal = regenerateMeal(mealType);

    setMealPlan((prevPlan) => {
      return {
        ...prevPlan,
        days: prevPlan.days.map((day) => {
          if (day.id === dayId) {
            return {
              ...day,
              meals: day.meals.map((meal) => {
                if (meal.id === mealId) {
                  return newMeal;
                }
                return meal;
              }),
            };
          }
          return day;
        }),
      };
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{mealPlan.name}</h1>
        <p className="text-gray-600 mt-2">{mealPlan.description}</p>
      </div>

      <div className="space-y-10">
        {mealPlan.days.map((day) => (
          <div key={day.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {day.meals.map((meal) => (
                <Card key={meal.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span className="capitalize">{meal.type}</span>
                      <div className="flex space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditMeal(day.id, meal)}
                          className="h-8 w-8"
                          aria-label="Edit meal"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRegenerateMeal(day.id, meal.type, meal.id)}
                          className="h-8 w-8"
                          aria-label="Regenerate meal"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{meal.calories} calories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-1">{meal.name}</h3>
                    <p className="text-sm text-gray-600">{meal.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <EditMealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        meal={selectedMeal}
        onSave={handleSaveMeal}
      />
    </div>
  );
};

export default MealPlanView;