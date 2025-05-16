'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ChefHat,
  ClipboardList,
  Heart,
  Settings,
} from 'lucide-react';
import MealPlanStatusCard, { MealPlan } from '@/components/meal-plan-status';
import { Meal } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function Dashboard() {
  const {data: session, isPending, error} = useSession();
  const [mealPlan, setMealPlan] = useState<MealPlan>();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [hasMealPlan, setHasMealPlan] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchMealPlans = async () => {
      try {
        const response = await axios.get('/api/getmealplans');
        const { mealPlan, meals } = response.data;

        if (mealPlan) {
          setMealPlan(mealPlan);
          setMeals(meals);
          setHasMealPlan(true);
        }
      } catch (error) {
        console.error("Failed to fetch meal plans:", error);
      } finally {
        setIsFetching(false);
      }
    };

    if (!isPending && session) {
      fetchMealPlans();
    }
  }, [!isPending, session]);

  if (isPending || isFetching) {
    return (
      <Skeleton className="h-full w-full" />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-gray-600">
            Let&apos;s make your meal planning journey delicious and easy.
          </p>
        </div>

        {/* Meal Plan Status Card */}
        <MealPlanStatusCard
          hasMealPlan={hasMealPlan}
          mealPlan={mealPlan}
          meals={meals}
        />

        {/* Quick Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          <Link href="/meal-plans/new" legacyBehavior>
            <QuickNavCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Create New Plan"
              description="Start fresh with a new meal plan"
            />
          </Link>
          <QuickNavCard
            icon={<Heart className="w-8 h-8" />}
            title="Favorite Recipes"
            description="Access your saved recipes"
          />
          <QuickNavCard
            icon={<ClipboardList className="w-8 h-8" />}
            title="Grocery List"
            description="View your shopping needs"
          />
          <Link href="/dashboard/preferences" legacyBehavior>
            <QuickNavCard
              icon={<Settings className="w-8 h-8" />}
              title="Preferences"
              description="Update your profile settings"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

function QuickNavCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
