import React from 'react';
import { fetchMealPlansByUserId } from '@/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, UtensilsIcon, Plus, TrendingUp, Clock } from 'lucide-react';
import DeleteButton from '@/components/delete-button';
import Link from 'next/link';
import { MealPlan } from '@/types'; 
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

const MealPlans = async () => {
  const session = await auth.api.getSession({
    headers: await headers() 
  })

  const userId = session?.user?.id

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-white/80 border border-white/60 shadow-2xl rounded-3xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h3>
          <p className="text-gray-600 leading-relaxed mb-8">
            Sign in to access your personalized meal planning experience and unlock your culinary journey.
          </p>
          <div className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-semibold">Please Sign In</span>
          </div>
        </div>
      </div>
    );
  }

  const mealPlans: MealPlan[] = await fetchMealPlansByUserId(userId);

  if (mealPlans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-6">
        <div className="backdrop-blur-xl bg-white/80 border border-white/60 shadow-2xl rounded-3xl p-12 max-w-lg text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
            <UtensilsIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Start Your Culinary Journey</h3>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            Create your first meal plan and discover amazing recipes tailored just for you.
          </p>
          <Link
            href="/meal-plans/new"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Create Your First Plan
          </Link>
        </div>
      </div>
    );
  }

  const totalMeals = mealPlans.reduce((acc, plan) => acc + (plan.duration * plan.mealsPerDay), 0);
  const totalDays = mealPlans.reduce((acc, plan) => acc + plan.duration, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative container max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-16">
            <div className="flex-1">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">
                Your Meal Plans
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
                Discover, organize, and enjoy your personalized nutrition journey with beautifully crafted meal plans designed just for you.
              </p>
            </div>
            <Link
              href="/meal-plans/new"
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Plan
            </Link>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UtensilsIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{mealPlans.length}</p>
                  <p className="text-gray-600 font-medium">Active Plans</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalDays}</p>
                  <p className="text-gray-600 font-medium">Total Days</p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{totalMeals}</p>
                  <p className="text-gray-600 font-medium">Total Meals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meal Plans Grid */}
      <div className="container max-w-7xl mx-auto px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {mealPlans.map((mealPlan) => (
            <Card
              key={mealPlan.id}
              className="group relative backdrop-blur-xl bg-white/80 border border-white/50 shadow-xl hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            >
              {/* Gradient Header */}
              <div className="h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/20 border-white/30 text-white backdrop-blur-sm">
                    {mealPlan.mealsPerDay} meals/day
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{mealPlan.duration} days</span>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-4 pt-6">
                <Link
                  href={`/meal-plans/${mealPlan.id}`}
                  className="hover:underline group-hover:text-blue-600 transition-colors"
                >
                  <CardTitle className="text-2xl font-bold mb-2 leading-tight">
                    {mealPlan.title}
                  </CardTitle>
                  <div className="text-lg font-semibold text-indigo-600 mb-3">
                    {mealPlan.duration}-Day Meal Plan
                  </div>
                  <CardDescription className="flex items-center text-gray-600">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Created on{' '}
                    {new Date(mealPlan.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </Link>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                    <UtensilsIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {mealPlan.duration * mealPlan.mealsPerDay}
                    </div>
                    <div className="text-sm text-gray-600">total meals planned</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <Link
                    href={`/meal-plans/${mealPlan.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <span>View Details</span>
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                  <DeleteButton id={mealPlan.id} />
                </div>
              </CardContent>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl"></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlans;