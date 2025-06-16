"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Star, Loader2, Utensils, Clock } from "lucide-react"

export default function MealLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-12 text-center">
            {/* Main Loading Icon */}
            <div className="relative mb-10">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl animate-pulse">
                <ChefHat className="w-14 h-14 text-white" />
              </div>
              {/* Subtle sparkle effects */}
              <div className="absolute -top-3 -right-3 animate-ping">
                <Star className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-ping delay-500">
                <Star className="w-5 h-5 text-teal-400" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-4 mb-10">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                Creating Your Meal Plan
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Our AI chef is carefully crafting personalized recipes just for you...
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-5 max-w-md mx-auto mb-10">
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                  Analyzing your preferences
                </span>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center animate-pulse shadow-md">
                  <Utensils className="w-5 h-5 text-white animate-spin" />
                </div>
                <span className="text-base font-medium text-slate-600 dark:text-slate-400">
                  Selecting fresh ingredients
                </span>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 opacity-60 shadow-sm">
                <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-medium text-slate-500 dark:text-slate-500">
                  Finalizing your meal plan
                </span>
              </div>
            </div>

            {/* Enhanced Loading Animation */}
            <div className="flex justify-center space-x-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce shadow-md"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-100 shadow-md"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce delay-200 shadow-md"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 