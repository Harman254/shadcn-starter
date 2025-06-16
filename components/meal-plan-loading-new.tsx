"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Star, Loader2, Utensils, Clock, Zap } from "lucide-react"

export default function MealLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/20">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-12 text-center">
            {/* Main Loading Icon with Spinning Rings */}
            <div className="relative mb-10">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 w-28 h-28 border-4 border-emerald-300/50 rounded-full animate-spin"></div>
              
              {/* Middle spinning ring */}
              <div className="absolute inset-2 w-24 h-24 border-3 border-teal-400/60 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
              
              {/* Inner spinning ring */}
              <div className="absolute inset-4 w-20 h-20 border-2 border-emerald-500/70 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
              
              {/* Center icon */}
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl relative z-10">
                <ChefHat className="w-14 h-14 text-white animate-pulse" />
              </div>
              
              {/* Spinning sparkles */}
              <div className="absolute -top-3 -right-3 animate-spin" style={{ animationDuration: '4s' }}>
                <Star className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}>
                <Star className="w-5 h-5 text-teal-400" />
              </div>
              
              {/* Additional spinning elements */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 animate-spin" style={{ animationDuration: '5s' }}>
                <Star className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
                <Zap className="w-4 h-4 text-teal-300" />
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

            {/* Progress Steps with Enhanced Animations */}
            <div className="space-y-5 max-w-md mx-auto mb-10">
              <div className="flex items-center gap-5 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <div className="relative w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  {/* Spinning ring around completed step */}
                  <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                </div>
                <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                  Analyzing your preferences
                </span>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="relative w-10 h-10 bg-slate-400 rounded-full flex items-center justify-center shadow-md">
                  <Utensils className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '1.5s' }} />
                  {/* Spinning outer ring */}
                  <div className="absolute -inset-1 border-2 border-slate-300 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                </div>
                <span className="text-base font-medium text-slate-600 dark:text-slate-400">
                  Selecting fresh ingredients
                </span>
              </div>

              <div className="flex items-center gap-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 opacity-60 shadow-sm">
                <div className="relative w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center shadow-md">
                  <Clock className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '2s' }} />
                  {/* Pulsing ring for pending step */}
                  <div className="absolute inset-0 border-2 border-slate-400 rounded-full animate-ping"></div>
                </div>
                <span className="text-base font-medium text-slate-500 dark:text-slate-500">
                  Finalizing your meal plan
                </span>
              </div>
            </div>

            {/* Enhanced Loading Animation with Spinning Elements */}
            <div className="flex justify-center items-center space-x-6">
              {/* Spinning circles */}
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce shadow-md"></div>
                <div className="absolute inset-0 w-4 h-4 border-2 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce delay-100 shadow-md"></div>
                <div className="absolute inset-0 w-4 h-4 border-2 border-emerald-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              <div className="relative">
                <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce delay-200 shadow-md"></div>
                <div className="absolute inset-0 w-4 h-4 border-2 border-emerald-400 rounded-full animate-spin" style={{ animationDuration: '2.5s' }}></div>
              </div>
              
              {/* Spinning star in the middle */}
              <div className="relative mx-4">
                <Star className="w-5 h-5 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 