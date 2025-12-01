'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  Heart,
  Loader2,
  MessageSquare,
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
      <div className="flex min-h-screen w-full flex-col items-center bg-[#EAEFEF] dark:bg-[#222222] justify-center gap-4">
      <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-400 text-4xl text-blue-400">
        <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-red-400 text-2xl text-red-400"></div>
      </div>
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEFEF] dark:bg-[#222222]">
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
          <Link href="/chat" >
            <QuickNavCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="AI Nutritionist"
              description="Get instant answers and personalized advice"
            />
          </Link>
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
    <div 
      className="relative overflow-hidden bg-gradient-to-br from-slate-50/90 via-white/95 to-emerald-50/80 dark:from-slate-800/90 dark:via-slate-900/95 dark:to-emerald-900/80 rounded-2xl p-7 shadow-lg shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-200/60 dark:border-slate-700/60 hover:shadow-2xl hover:shadow-emerald-300/40 dark:hover:shadow-emerald-900/60 transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group backdrop-blur-md"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-transparent to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Floating particles effect */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400/30 rounded-full group-hover:animate-ping" />
      <div className="absolute top-4 right-8 w-1 h-1 bg-blue-400/40 rounded-full group-hover:animate-bounce" style={{animationDelay: '0.2s'}} />
      <div className="absolute top-6 right-4 w-1.5 h-1.5 bg-emerald-300/30 rounded-full group-hover:animate-pulse" style={{animationDelay: '0.4s'}} />
      
      <div className="relative z-10">
        {/* Icon with enhanced animation */}
        <div className="text-emerald-600 dark:text-emerald-400 mb-5 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 transform origin-center">
          <div className="relative">
            {icon}
            {/* Icon glow effect */}
            <div className="absolute inset-0 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300">
              {icon}
            </div>
          </div>
        </div>
        
        {/* Title with subtle animation */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 dark:from-slate-100 dark:via-slate-200 dark:to-emerald-200 bg-clip-text text-transparent mb-3 group-hover:from-emerald-700 group-hover:via-emerald-600 group-hover:to-blue-600 dark:group-hover:from-emerald-300 dark:group-hover:via-emerald-200 dark:group-hover:to-blue-300 transition-all duration-300">
          {title}
        </h3>
        
        {/* Description with improved typography */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="flex items-center justify-end">
          <ArrowRight className="w-5 h-5 text-emerald-500/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transform translate-x-0 group-hover:translate-x-1 opacity-60 group-hover:opacity-100 transition-all duration-300" />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 group-hover:w-full transition-all duration-500" />
    </div>
  );
}


export default Dashboard;