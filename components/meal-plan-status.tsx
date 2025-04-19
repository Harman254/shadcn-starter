'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Plus } from 'lucide-react';

type MealPlan = {
  days: number;
  mealsPerDay: number;
};

type Props = {
  hasMealPlan: boolean;
  mealPlan?: MealPlan | null;
};

const MealPlanStatusCard = ({ hasMealPlan, mealPlan }: Props) => {
  const router = useRouter();
  console.log(mealPlan);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
      {hasMealPlan && mealPlan ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Your Current Meal Plan
          </h2>
          <div className="flex justify-center items-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{mealPlan.days}</p>
              <p className="text-gray-600">Days</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-emerald-600">{mealPlan.mealsPerDay}</p>
              <p className="text-gray-600">Meals per day</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              View Plan <ArrowRight size={20} />
            </button>
            <button className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
              Edit Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Start Your Meal Planning Journey
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first meal plan and make healthy eating effortless.
          </p>
          <button
            onClick={() => router.push('/meal-plans/new')}
            className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus size={24} />
            Generate Meal Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default MealPlanStatusCard;
