"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChefHat, Utensils, Clock, Rocket } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-950/20">
      <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Cool Loading Animation */}
      <div className="relative">
        {/* Floating Food Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 animate-bounce delay-100">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">🥕</span>
              </div>
            </div>
            <div className="absolute top-20 right-16 animate-bounce delay-300">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">🥬</span>
              </div>
            </div>
            <div className="absolute top-32 left-1/3 animate-bounce delay-500">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">🍅</span>
              </div>
            </div>
            <div className="absolute top-16 right-1/3 animate-bounce delay-700">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg">🧄</span>
          </div>
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-200">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm">🥑</span>
          </div>
            </div>
            <div className="absolute bottom-32 right-24 animate-bounce delay-600">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm">🐟</span>
            </div>
          </div>
        </div>

        {/* Main Loading Card */}
          <Card className="border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-gradient-to-br from-white/90 to-orange-50/50 dark:from-neutral-900/90 dark:to-orange-950/30 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
            {/* Animated Chef Hat */}
              <div className="relative mb-12">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 rounded-full shadow-2xl animate-pulse">
                  <ChefHat className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              {/* Sparkles around chef hat */}
                <div className="absolute -top-4 -right-4 animate-ping">
                  <Rocket className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-4 -left-4 animate-ping delay-300">
                  <Rocket className="w-6 h-6 text-orange-400 drop-shadow-lg" />
                </div>
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 animate-ping delay-500">
                  <Rocket className="w-4 h-4 text-emerald-400 drop-shadow-lg" />
              </div>
            </div>

            {/* Loading Text */}
              <div className="space-y-6 mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                Cooking Up Your Perfect Meal Plan
              </h2>
                <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                Our AI chef is carefully crafting personalized recipes just for you...
              </p>
            </div>

            {/* Animated Progress Steps */}
              <div className="space-y-6 max-w-lg mx-auto mb-12">
                <div className="flex items-center space-x-6 p-6 rounded-2xl bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm shadow-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Analyzing your preferences</span>
                </div>

                <div className="flex items-center space-x-6 p-6 rounded-2xl bg-white/70 dark:bg-neutral-800/70 backdrop-blur-sm shadow-lg border border-orange-100 dark:border-orange-900/30">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center animate-pulse delay-300 shadow-lg">
                    <Utensils className="w-6 h-6 text-white" />
              </div>
                  <span className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Selecting fresh ingredients</span>
                </div>

                <div className="flex items-center space-x-6 p-6 rounded-2xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm shadow-lg border border-neutral-200 dark:border-neutral-700 opacity-60">
                  <div className="w-12 h-12 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full flex items-center justify-center animate-pulse delay-500 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
              </div>
                  <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">Finalizing your meal plan</span>
              </div>
            </div>

            {/* Animated Cooking Pot */}
              <div className="mt-16 relative">
              <div className="inline-block">
                  <div className="w-20 h-16 bg-gradient-to-b from-neutral-600 via-neutral-700 to-neutral-800 rounded-b-full relative shadow-2xl">
                  {/* Steam animation */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-6 bg-white/70 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-1.5 h-4 bg-white/50 rounded-full animate-pulse delay-200 -translate-x-3 shadow-lg"></div>
                  </div>
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-1.5 h-4 bg-white/50 rounded-full animate-pulse delay-400 translate-x-3 shadow-lg"></div>
                  </div>
                    {/* Pot handle */}
                    <div className="absolute -top-2 -right-6 w-6 h-2 bg-neutral-700 rounded-full"></div>
                    <div className="absolute -top-2 -left-6 w-6 h-2 bg-neutral-700 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Loading Dots */}
              <div className="flex justify-center space-x-3 mt-12">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-bounce shadow-lg"></div>
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-bounce delay-100 shadow-lg"></div>
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-bounce delay-200 shadow-lg"></div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
