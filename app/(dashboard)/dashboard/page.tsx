"use client";

import { useRouter } from 'next/navigation';

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

// Mock user data - in production this would come from your backend
const user = {
  name: "Haman",
  hasMealPlan: false,
  mealPlan: {
    days: 7,
    mealsPerDay: 3
  }
};

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Let's make your meal planning journey delicious and easy.
          </p>
        </div>

        {/* Meal Plan Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          {user.hasMealPlan ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Current Meal Plan
              </h2>
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">{user.mealPlan.days}</p>
                  <p className="text-gray-600">Days</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-600">{user.mealPlan.mealsPerDay}</p>
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
              <button onClick={() => router.push('/meal-plans/new')} className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto">
                <Plus size={24} />
                Generate Meal Plan
              </button>
            </div>
          )}
        </div>

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
