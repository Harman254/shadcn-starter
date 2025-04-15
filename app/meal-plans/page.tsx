'use client';
import React from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Calendar, Clock, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockMealPlan } from "@/data";

// This would come from your state management in the future
const usePlans = () => {
  // For now, return an array with just the mock meal plan
  return [
    {
      id: mockMealPlan.id,
      name: mockMealPlan.name,
      createdAt: new Date().toISOString(),
      days: mockMealPlan.days,
      mealsPerDay: mockMealPlan.days.length > 0 
        ? mockMealPlan.days[0].meals.length 
        : 4,
    }
  ];
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const MealPlanList = () => {
    const router = useRouter();
  const plans = usePlans();

  const handleViewPlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/meal-plans/${id}`);
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Meal Plans</h1>
            <p className="text-lg text-gray-600">View and manage all your saved meal plans</p>
          </div>
          <Button 
            onClick={() => router.push('/meal-plans/new')} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Plan
          </Button>
        </div>

        {plans.length === 0 ? (
          <EmptyState onCreateClick={() => router.push('/meal-plans/new')} />
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {plans.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onViewClick={(e) => handleViewPlan(plan.id, e)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MealPlanCardProps {
  plan: {
    id: string;
    name: string;
    createdAt: string;
    days: any[];
    mealsPerDay: number;
  };
  onViewClick: (e: React.MouseEvent) => void;
}

const MealPlanCard = ({ plan, onViewClick }: MealPlanCardProps) => {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{plan.name}</h3>
            <p className="text-sm text-gray-500">Created {formatDate(plan.createdAt)}</p>
          </div>
          <div className="bg-green-100 rounded-full p-2">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{plan.days.length} Days</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{plan.mealsPerDay} meals per day</span>
          </div>
        </div>

        <Button
          onClick={onViewClick}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          View Plan
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
    <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
      <ClipboardList className="w-8 h-8 text-green-600" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-3">No meal plans yet</h2>
    <p className="text-gray-600 mb-8">Create your first meal plan to get started on your health journey</p>
    <Button 
      onClick={onCreateClick}
      className="bg-green-600 hover:bg-green-700"
    >
      <Plus className="w-5 h-5 mr-2" />
      Create Your First Plan
    </Button>
  </div>
);

export default MealPlanList;