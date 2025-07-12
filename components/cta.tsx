import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Pacifico } from "next/font/google"


const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default function CTA() {
  return (
    <section className="relative bg-white dark:bg-black border-t border-blue-500/30 dark:border-cyan-500/30 overflow-hidden transition-colors duration-300">
      {/* Animated grid background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
      </div>
      
      {/* LED border frames - adaptive colors */}
      <div className="absolute inset-0 border-4 border-blue-500 dark:border-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.6)] dark:shadow-[0_0_30px_rgba(0,255,255,0.5)] animate-pulse"></div>
      <div className="absolute inset-2 border-2 border-purple-500 dark:border-pink-400 shadow-[0_0_20px_rgba(147,51,234,0.5)] dark:shadow-[0_0_20px_rgba(255,20,147,0.4)] animate-pulse"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA Content */}
        <div className="flex flex-col items-center gap-8 py-24 text-center md:py-32">
          
          {/* LED Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-cyan-500/20 dark:to-pink-500/20 border-2 border-blue-500 dark:border-cyan-400 text-blue-700 dark:text-cyan-300 text-sm font-bold backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.7)] dark:shadow-[0_0_30px_rgba(0,255,255,0.6)] animate-pulse">
            <span className="animate-bounce mr-2">🚀</span>
            <span className="drop-shadow-[0_0_10px_rgba(59,130,246,1)] dark:drop-shadow-[0_0_10px_rgba(0,255,255,1)]">TRANSFORM YOUR KITCHEN</span>
          </div>

          {/* Main LED Heading */}
          <div className="relative">
            <h2 className="font-black text-4xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl tracking-wide">
              <span className="block text-blue-600 dark:text-cyan-300 drop-shadow-[0_0_20px_rgba(59,130,246,1)] dark:drop-shadow-[0_0_20px_rgba(0,255,255,1)] animate-pulse">
                READY TO REVOLUTIONIZE
              </span>
              <span className="block text-purple-600 dark:text-pink-300 drop-shadow-[0_0_20px_rgba(147,51,234,1)] dark:drop-shadow-[0_0_20px_rgba(255,20,147,1)] animate-pulse">
                YOUR KITCHEN AND ENJOY
              </span>
              <span className="block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 dark:from-yellow-300 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(249,115,22,1)] dark:drop-shadow-[0_0_30px_rgba(255,255,0,1)] animate-pulse">
                FANTASTIC MEALS
              </span>
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
            </h2>
            
            {/* Glowing underline */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-blue-500 dark:via-cyan-400 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)] dark:shadow-[0_0_20px_rgba(0,255,255,0.8)] animate-pulse"></div>
          </div>

          {/* LED Subheading */}
          <p className="max-w-[42rem] leading-normal text-slate-700 dark:text-cyan-100 sm:text-xl sm:leading-8 font-semibold drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] dark:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-pulse">
            Join leading professionals who trust Mealwise to drive their meal planning journey and stay ahead of the game
          </p>

          {/* LED CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/meal-plans/new">
              <Button 
                size="lg" 
                className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-pink-500 dark:via-red-500 dark:to-orange-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 dark:hover:from-pink-400 dark:hover:via-red-400 dark:hover:to-orange-400 text-white font-black px-12 py-6 rounded-2xl transition-all duration-300 hover:scale-110 shadow-[0_0_40px_rgba(147,51,234,0.8)] dark:shadow-[0_0_40px_rgba(255,20,147,0.8)] hover:shadow-[0_0_60px_rgba(147,51,234,1)] dark:hover:shadow-[0_0_60px_rgba(255,20,147,1)] border-4 border-purple-400 dark:border-pink-400 text-xl tracking-wider animate-pulse"
              >
                <span className="relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
                  GET STARTED TODAY
                </span>
                {/* Button inner glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 dark:from-pink-400/30 dark:to-orange-400/30 rounded-2xl blur-md animate-pulse"></div>
              </Button>
            </Link>
          </div>

          {/* LED Social Proof */}
          <div className="flex flex-col items-center gap-6 mt-12 pt-8 border-t-2 border-blue-500 dark:border-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] dark:shadow-[0_0_20px_rgba(0,255,255,0.5)]">
            <div className="flex items-center gap-4 text-blue-700 dark:text-cyan-300 text-sm font-bold">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-cyan-400 dark:to-blue-500 border-2 border-blue-400 dark:border-cyan-300 shadow-[0_0_15px_rgba(59,130,246,0.8)] dark:shadow-[0_0_15px_rgba(0,255,255,0.8)] animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 dark:from-pink-400 dark:to-purple-500 border-2 border-purple-400 dark:border-pink-300 shadow-[0_0_15px_rgba(147,51,234,0.8)] dark:shadow-[0_0_15px_rgba(255,20,147,0.8)] animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 dark:from-yellow-400 dark:to-orange-500 border-2 border-orange-400 dark:border-yellow-300 shadow-[0_0_15px_rgba(249,115,22,0.8)] dark:shadow-[0_0_15px_rgba(255,255,0,0.8)] animate-pulse"></div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 border-2 border-green-400 dark:border-green-300 flex items-center justify-center text-xs text-white font-black shadow-[0_0_15px_rgba(34,197,94,0.8)] dark:shadow-[0_0_15px_rgba(0,255,0,0.8)] animate-pulse">
                  +99
                </div>
              </div>
              <span className="drop-shadow-[0_0_10px_rgba(59,130,246,1)] dark:drop-shadow-[0_0_10px_rgba(0,255,255,1)] animate-pulse">
                JOIN 1,000+ PROFESSIONALS ALREADY USING MEALWISE
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-purple-700 dark:text-pink-300 text-sm font-bold">
              <div className="flex items-center gap-2 animate-pulse">
                <span className="text-yellow-500 dark:text-yellow-300 text-lg drop-shadow-[0_0_10px_rgba(234,179,8,1)] dark:drop-shadow-[0_0_10px_rgba(255,255,0,1)]">⭐</span>
                <span className="drop-shadow-[0_0_10px_rgba(147,51,234,1)] dark:drop-shadow-[0_0_10px_rgba(255,20,147,1)]">4.9/5 RATING</span>
              </div>
              <div className="flex items-center gap-2 animate-pulse">
                <span className="text-green-600 dark:text-green-300 text-lg drop-shadow-[0_0_10px_rgba(34,197,94,1)] dark:drop-shadow-[0_0_10px_rgba(0,255,0,1)]">🔒</span>
                <span className="drop-shadow-[0_0_10px_rgba(147,51,234,1)] dark:drop-shadow-[0_0_10px_rgba(255,20,147,1)]">SECURE & PRIVATE</span>
              </div>
              <div className="flex items-center gap-2 animate-pulse">
                <span className="text-blue-600 dark:text-cyan-300 text-lg drop-shadow-[0_0_10px_rgba(59,130,246,1)] dark:drop-shadow-[0_0_10px_rgba(0,255,255,1)]">⚡</span>
                <span className="drop-shadow-[0_0_10px_rgba(147,51,234,1)] dark:drop-shadow-[0_0_10px_rgba(255,20,147,1)]">SETUP IN 2 MINUTES</span>
              </div>
            </div>
          </div>
        </div>

        {/* LED Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Neon Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-cyan-500/30 dark:to-blue-500/30 rounded-full blur-3xl animate-pulse shadow-[0_0_100px_rgba(59,130,246,0.4)] dark:shadow-[0_0_100px_rgba(0,255,255,0.5)]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-pink-500/30 dark:to-purple-500/30 rounded-full blur-3xl animate-pulse shadow-[0_0_100px_rgba(147,51,234,0.4)] dark:shadow-[0_0_100px_rgba(255,20,147,0.5)]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/15 to-red-500/15 dark:from-yellow-500/20 dark:to-orange-500/20 rounded-full blur-3xl animate-pulse shadow-[0_0_80px_rgba(249,115,22,0.3)] dark:shadow-[0_0_80px_rgba(255,255,0,0.4)]"></div>
          
          {/* LED Corner Lights */}
          <div className="absolute top-4 left-4 w-4 h-4 bg-blue-500 dark:bg-cyan-400 rounded-full animate-ping shadow-[0_0_20px_rgba(59,130,246,1)] dark:shadow-[0_0_20px_rgba(0,255,255,1)]"></div>
          <div className="absolute top-4 right-4 w-4 h-4 bg-purple-500 dark:bg-pink-400 rounded-full animate-ping shadow-[0_0_20px_rgba(147,51,234,1)] dark:shadow-[0_0_20px_rgba(255,20,147,1)]"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 bg-orange-500 dark:bg-yellow-400 rounded-full animate-ping shadow-[0_0_20px_rgba(249,115,22,1)] dark:shadow-[0_0_20px_rgba(255,255,0,1)]"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 bg-green-500 dark:bg-green-400 rounded-full animate-ping shadow-[0_0_20px_rgba(34,197,94,1)] dark:shadow-[0_0_20px_rgba(0,255,0,1)]"></div>
        </div>
      </div>
    </section>
  )
}