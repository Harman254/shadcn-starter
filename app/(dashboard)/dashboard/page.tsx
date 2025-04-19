"use client";


import React from 'react';
import { 
  ChefHat, 
  ClipboardList, 
  Heart, 
  Settings, 
  Plus,
  ArrowRight,
  Link
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import MealPlanStatusCard from '@/components/meal-plan-status';

// Mock user data - in production this would come from your backend

export default function Dashboard({  mealPlan }: any) {
  const  [hasMealPlan, setHasMealPlan ] = React.useState(false);

  const { isSignedIn, user, isLoaded } = useUser()


  if(mealPlan)
    setHasMealPlan(true)



  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600">
            Let's make your meal planning journey delicious and easy.
          </p>
        </div>
          {/* Meal Plan Status Card */}

          <MealPlanStatusCard hasMealPlan={hasMealPlan} mealPlan={mealPlan} />
        
        

        {/* Quick Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickNavCard 
            icon={<ChefHat className="w-8 h-8" />}
            title="Create New Plan"
            description="Start fresh with a new meal plan"
          />
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
          <QuickNavCard 
            icon={<Settings className="w-8 h-8" />}
            title="Preferences"
            description="Update your profile settings"
          />
        </div>
      </div>
    </div>
  );
}

function QuickNavCard({ icon, title, description } : { icon: React.ReactNode, title: string, description: string }) {
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
