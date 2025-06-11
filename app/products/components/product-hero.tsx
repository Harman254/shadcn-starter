import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {  ChefHat, ShoppingCart } from "lucide-react"

export function ProductHero() {
  return (
    <section className="bg-gradient-to-br bg-background/95 py-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <Badge variant="secondary" className="mb-6 bg-orange-100 text-orange-800 hover:bg-orange-200">
          {/* <Sparkles className="w-4 h-4 mr-2" /> */}
          AI-Powered Meal Planning
        </Badge>

        <h1 className="text-5xl md:text-6xl font-bold text-green-500 mb-6 leading-tight">
          Smart Meal Planning
          <span className="text-orange-600 block">Made Simple</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Transform your cooking routine with AI-powered meal planning, automated grocery lists, and location-based
          shopping assistance. Save time, reduce waste, and eat better.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
            <ChefHat className="w-5 h-5 mr-2" />
            Start Planning Meals
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-orange-200 hover:bg-orange-50">
            <ShoppingCart className="w-5 h-5 mr-2" />
            See How It Works
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">10M+</div>
            <div className="text-gray-600">Meals Planned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">500K+</div>
            <div className="text-gray-600">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">30%</div>
            <div className="text-gray-600">Food Waste Reduced</div>
          </div>
        </div>
      </div>
    </section>
  )
}
