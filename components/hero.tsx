"use client"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import Image from "next/image"
import { Rocket, Zap, Clock, ChefHat } from "lucide-react"

export default function Hero() {
  const user = useSession()

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black to-emerald-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />

      {/* Floating food emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-bounce delay-100">🥗</div>
        <div className="absolute top-40 right-20 text-3xl animate-pulse delay-300">🍕</div>
        <div className="absolute bottom-32 left-20 text-5xl animate-bounce delay-500">🥘</div>
        <div className="absolute top-60 left-1/3 text-2xl animate-pulse delay-700">🍎</div>
        <div className="absolute bottom-20 right-10 text-4xl animate-bounce delay-200">🥑</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            {/* Glowing badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <Rocket className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-green-300 font-medium">AI Magic ✨ 10,000+ meals planned</span>
            </div>

            {/* Massive headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-8">
              <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-green-500 bg-clip-text text-transparent animate-pulse">
                Meal Planning 
              </span>
              <br />
              <span className="text-white">Made simple</span>
              <br />
              <span className="text-gray-400">with Ai</span>
            </h1>

            {/* Punchy subheading */}
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 font-medium">
              Your AI chef creates perfect meal plans in
              <span className="text-green-400 font-bold"> 30 seconds</span>
              <br />
              No more panning attacks when you need something to eat🤯
            </p>

            {/* Power stats */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-green-400">30s</div>
                <div className="text-sm text-gray-400">Plan Time</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-green-400">5hrs</div>
                <div className="text-sm text-gray-400">Saved/Week</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-green-400">100%</div>
                <div className="text-sm text-gray-400">Stress Free</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <Link href="/meal-plans/new">
                  <Button className="group relative px-8 py-6 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                    <Zap className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                    Create a Meal Plan
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button className="group relative px-8 py-6 text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-black rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105">
                    <Zap className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                    START FREE NOW
                  </Button>
                </Link>
              )}

              <Button
                variant="outline"
                className="px-8 py-6 text-xl font-bold border-2 border-green-500/50 text-green-400 hover:bg-green-500/10 rounded-2xl backdrop-blur-sm"
              >
                <Clock className="w-6 h-6 mr-2" />
                2-MIN DEMO
              </Button>
            </div>
          </div>

          {/* Right side - Hero Visual */}
          <div className="mt-12 lg:mt-0 relative">
            <div className="relative">
              {/* Main image with glow effect */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                <Image
                  src="/hero.png"
                  alt="AI Meal Planning Interface"
                  width={600}
                  height={700}
                  className="relative rounded-3xl shadow-2xl border border-green-500/20"
                  priority
                />
              </div>

              {/* Floating UI elements */}
              <div className="absolute -top-8 -right-8 bg-gradient-to-r from-green-500 to-emerald-600 text-black rounded-2xl p-4 shadow-2xl animate-bounce">
                <ChefHat className="w-8 h-8 mb-2" />
                <div className="font-bold text-sm">LET AI COOK!</div>
              </div>

              <div className="absolute -bottom-8 -left-8 bg-black/80 backdrop-blur-sm border border-green-500/30 text-green-400 rounded-2xl p-4 shadow-2xl">
                <div className="font-bold text-lg">🔥 MEAL PLANNED</div>
                <div className="text-sm text-gray-400">in 23 seconds</div>
              </div>

              <div className="absolute top-1/2 -left-12 bg-gradient-to-r from-emerald-500 to-green-600 text-black rounded-full p-3 shadow-xl animate-pulse">
                <Rocket className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
