'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ChefHat,
  ClipboardList,
  Heart,
  Loader2,
  Settings,
} from 'lucide-react';
import MealPlanStatusCard, { MealPlan } from '@/components/meal-plan-status';
import { Meal } from '@/types';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

const  Dashboard = () =>{
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
      <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-800 flex items-center justify-center text-primary-foreground shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
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
          <Link href="/meal-plans/new" >
            <QuickNavCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Create New Plan"
              description="Start fresh with a new meal plan"
            />
          </Link>
          <Link href="/recipes" >
          <QuickNavCard
            icon={<Heart className="w-8 h-8" />}
            title="Favorite Recipes"
            description="Access your saved recipes"
          />
          </Link>
          <Link href="/dashboard/analytics" >

          <QuickNavCard
            icon={<ClipboardList className="w-8 h-8" />}
            title="Analytics"
            description="Track your meal planning progress"
          />
          </Link>
          <Link href="/dashboard/preferences" >
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
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/70 via-white/80 to-emerald-50/70 dark:from-slate-800/70 dark:via-slate-900/80 dark:to-emerald-900/70 rounded-xl p-6 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-emerald-300/30 dark:hover:shadow-emerald-900/50 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group backdrop-blur-sm">
      <div className="text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground/85 text-sm">{description}</p>
    </div>
  );
}


export default Dashboard;