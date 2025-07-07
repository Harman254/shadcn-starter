import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="border-t border-zinc-800/50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Content */}
        <div className="flex flex-col items-center gap-8 py-24 text-center md:py-32">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm font-medium backdrop-blur-sm">
            🚀 Transform Your Kitchen
          </div>

          {/* Main Heading */}
          <h2 className="font-bold text-4xl leading-[1.1] sm:text-5xl md:text-6xl text-zinc-900 dark:text-white max-w-4xl">
            Ready to revolutionize your kitchen and enjoy 
            <span className="bg-gradient-to-r from-zinc-400 to-zinc-200 dark:from-zinc-200 dark:to-zinc-100 bg-clip-text text-transparent"> fantastic meals </span>
            with Mealwise
          </h2>

          {/* Subheading */}
          <p className="max-w-[42rem] leading-normal text-zinc-600 dark:text-zinc-400 sm:text-xl sm:leading-8">
            Join leading professionals who trust Mealwise to drive their meal planning journey and stay ahead of the game
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/meal-plans/new">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-zinc-600 to-zinc-700 hover:from-zinc-500 hover:to-zinc-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-zinc-700/50 border border-zinc-600/50"
              >
                Get Started Today
              </Button>
            </Link>
            
            
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 mt-12 pt-8 border-t border-zinc-800/50">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-700 border-2 border-zinc-800"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-500 to-zinc-600 border-2 border-zinc-800"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-400 to-zinc-500 border-2 border-zinc-800"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-700 border-2 border-zinc-800 flex items-center justify-center text-xs text-white font-medium">
                  +99
                </div>
              </div>
              <span>Join 1,000+ professionals already using Mealwise</span>
            </div>
            
            <div className="flex items-center gap-6 text-zinc-500 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">⭐</span>
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">⚡</span>
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-zinc-600/20 to-zinc-700/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-zinc-500/20 to-zinc-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>
    </section>
  )
}