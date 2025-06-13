"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Utensils, Clock, Rocket } from "lucide-react"

export default function MealLoading() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 min-h-screen">
      {/* Cool Loading Animation */}
      <div className="relative">
        {/* Floating Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 animate-bounce delay-100">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              🥕
            </div>
          </div>
          <div className="absolute top-20 right-16 animate-bounce delay-300">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              🥬
            </div>
          </div>
          <div className="absolute top-32 left-1/3 animate-bounce delay-500">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              🍅
            </div>
          </div>
          <div className="absolute top-16 right-1/3 animate-bounce delay-700">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              🧄
            </div>
          </div>
        </div>

        {/* Main Loading Card */}
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden bg-gradient-to-br from-white to-orange-50/30 dark:from-neutral-900 dark:to-orange-950/20">
          <CardContent className="p-12 text-center">
            {/* Animated Chef Hat */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg animate-pulse">
                <ChefHat className="w-12 h-12 text-white" />
              </div>
              {/* Sparkles around chef hat */}
              <div className="absolute -top-2 -right-2 animate-ping">
                <Rocket className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-ping delay-300">
                <Rocket className="w-4 h-4 text-orange-400" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="space-y-4 mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Cooking Up Your Perfect Meal Plan
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300">
                Our AI chef is carefully crafting personalized recipes just for you...
              </p>
            </div>

            {/* Animated Progress Steps */}
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <span className="text-neutral-700 dark:text-neutral-300">Analyzing your preferences</span>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse delay-300">
                  <Utensils className="w-4 h-4 text-white" />
                </div>
                <span className="text-neutral-700 dark:text-neutral-300">Selecting fresh ingredients</span>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-lg bg-white/30 dark:bg-neutral-800/30 backdrop-blur-sm opacity-60">
                <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center animate-pulse delay-500">
                  <Clock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </div>
                <span className="text-neutral-500 dark:text-neutral-400">Finalizing your meal plan</span>
              </div>
            </div>

            {/* Animated Cooking Pot */}
            <div className="mt-12 relative">
              <div className="inline-block">
                <div className="w-16 h-12 bg-gradient-to-b from-neutral-600 to-neutral-800 rounded-b-full relative">
                  {/* Steam animation */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-4 bg-white/60 rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-x-2">
                    <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 translate-x-2">
                    <div className="w-1 h-3 bg-white/40 rounded-full animate-pulse delay-400"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-center space-x-2 mt-8">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
