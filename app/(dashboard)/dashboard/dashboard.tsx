'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useProfileStore } from '@/store/profile-store';
import {
  ArrowRight,
  ChefHat,
  ClipboardList,
  Heart,
  Loader2,
  MessageSquare,
  Settings,
  Shield,
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

  // Check if user is admin (you can customize this logic)
  const isAdmin = session?.user?.email?.endsWith('@aimealwise.com') || 
                  session?.user?.email === 'harmanmalova@gmail.com' ||
                  false; // Add your admin role check here

  const { getProfile } = useProfileStore();

  useEffect(() => {
    const fetchMealPlans = async () => {
      // Check cache first for meal stats
      const cached = getProfile();
      if (cached?.mealStats) {
        // Use cached data if available, but still fetch fresh meal plans
      }

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
  }, [!isPending, session, getProfile]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome back, {session?.user?.name}
          </h1>
          <p className="text-muted-foreground text-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          <Link href="/chat" >
            <QuickNavCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="AI Nutritionist"
              description="Get instant answers and personalized advice"
            />
          </Link>
          <Link href="/chat" >
            <QuickNavCard
              icon={<ChefHat className="w-8 h-8" />}
              title="Create New Plan"
              description="Chat with AI to create a new meal plan"
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
          {isAdmin && (
            <Link href="/admin">
              <QuickNavCard
                icon={<Shield className="w-8 h-8" />}
                title="Admin Panel"
                description="Manage users and system settings"
                isAdmin
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickNavCard({
  icon,
  title,
  description,
  isAdmin = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isAdmin?: boolean;
}) {
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-7 shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group backdrop-blur-md bg-card/80 border border-border/50 hover:shadow-xl ${
        isAdmin 
          ? 'hover:shadow-amber-300/40 dark:hover:shadow-amber-900/60'
          : 'hover:shadow-primary/40 dark:hover:shadow-primary/60'
      }`}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
        isAdmin 
          ? 'bg-gradient-to-br from-amber-400/10 via-transparent to-red-400/10'
          : 'bg-gradient-to-br from-emerald-400/10 via-transparent to-blue-400/10'
      }`} />
      
      {/* Floating particles effect */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full group-hover:animate-ping ${
        isAdmin ? 'bg-amber-400/30' : 'bg-emerald-400/30'
      }`} />
      <div className={`absolute top-4 right-8 w-1 h-1 rounded-full group-hover:animate-bounce ${
        isAdmin ? 'bg-red-400/40' : 'bg-blue-400/40'
      }`} style={{animationDelay: '0.2s'}} />
      <div className={`absolute top-6 right-4 w-1.5 h-1.5 rounded-full group-hover:animate-pulse ${
        isAdmin ? 'bg-amber-300/30' : 'bg-emerald-300/30'
      }`} style={{animationDelay: '0.4s'}} />
      
      <div className="relative z-10">
        {/* Icon with enhanced animation */}
        <div className={`mb-5 group-hover:scale-125 group-hover:rotate-3 transition-all duration-300 transform origin-center ${
          isAdmin 
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-emerald-600 dark:text-emerald-400'
        }`}>
          <div className="relative">
            {icon}
            {/* Icon glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300 ${
              isAdmin 
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {icon}
            </div>
          </div>
        </div>
        
        {/* Title with subtle animation */}
        <h3 className={`text-xl font-bold bg-clip-text text-transparent mb-3 transition-all duration-300 ${
          isAdmin
            ? 'bg-gradient-to-r from-slate-900 via-amber-800 to-red-800 dark:from-slate-100 dark:via-amber-200 dark:to-red-200 group-hover:from-amber-700 group-hover:via-red-600 group-hover:to-red-600 dark:group-hover:from-amber-300 dark:group-hover:via-red-200 dark:group-hover:to-red-300'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 dark:from-slate-100 dark:via-slate-200 dark:to-emerald-200 group-hover:from-emerald-700 group-hover:via-emerald-600 group-hover:to-blue-600 dark:group-hover:from-emerald-300 dark:group-hover:via-emerald-200 dark:group-hover:to-blue-300'
        }`}>
          {title}
        </h3>
        
        {/* Description with improved typography */}
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="flex items-center justify-end">
          <ArrowRight className={`w-5 h-5 transform translate-x-0 group-hover:translate-x-1 opacity-60 group-hover:opacity-100 transition-all duration-300 ${
            isAdmin 
              ? 'text-amber-500/60 group-hover:text-amber-600 dark:group-hover:text-amber-400'
              : 'text-emerald-500/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
          }`} />
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 w-0 h-1 group-hover:w-full transition-all duration-500 ${
        isAdmin 
          ? 'bg-gradient-to-r from-amber-500 to-red-500'
          : 'bg-gradient-to-r from-emerald-500 to-blue-500'
      }`} />
    </div>
  );
}


export default Dashboard;