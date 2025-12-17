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
    <section className="relative bg-zinc-950 border-t-4 border-cyan-400 overflow-hidden">
      {/* LED border frame */}
      <div className="absolute inset-0 pointer-events-none border-t-4 border-cyan-400" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA Content */}
        <div className="flex flex-col items-center gap-8 py-20 text-center">
          
          <div className="inline-flex items-center px-6 py-2 rounded-full bg-zinc-900 border border-cyan-400 text-cyan-300 text-sm font-bold tracking-widest uppercase mb-2">
            <span className="mr-2">🚀</span>
            <span>Transform Your Kitchen</span>
          </div>

          {/* Main LED Heading */}
          <div className="relative">
            <h2 className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl tracking-wide bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 bg-clip-text text-transparent " style={{ letterSpacing: '0.08em' }}>
              <span className="block">Ready to Revolutionize</span>
              <span className="block">Your Kitchen and Enjoy</span>
              <span className="block">Fantastic Meals</span>
              <span
                className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-black/90 to-rose-500 dark:from-indigo-300 dark:via-white/90 dark:to-rose-300 ",
                  pacifico.className,
                )}
              >Mealwise
                </span>
            </h2>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-cyan-400 rounded-full" />
          </div>

          {/* Subheading */}
          <p className="max-w-[42rem] leading-normal text-cyan-200 sm:text-xl sm:leading-8 font-semibold mt-2">
            Join leading professionals who trust Mealwise to drive their meal planning journey and stay ahead of the game
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/chat">
              <Button 
                size="lg" 
                className="relative bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-black px-12 py-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg border-2 border-cyan-400 text-xl tracking-wider"
              >
                <span className="relative z-10">
                  GET STARTED TODAY
                </span>
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-4 mt-12 pt-8 border-t border-cyan-800">
            <div className="flex items-center gap-4 text-cyan-400 text-sm font-bold">
              <span className="tracking-widest">JOIN 1,000+ PROFESSIONALS ALREADY USING MEALWISE</span>
            </div>
            <div className="flex items-center gap-8 text-cyan-700 text-sm font-bold">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-lg">⭐</span>
                <span>4.9/5 RATING</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-lg">🔒</span>
                <span>SECURE & PRIVATE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 text-lg">⚡</span>
                <span>SETUP IN 2 MINUTES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}