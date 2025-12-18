"use client"

import { motion } from "framer-motion"
import { Leaf, Sun, Snowflake, Cloud, Flower2, DollarSign, MapPin, ChefHat, Calendar, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SeasonalDisplayProps {
  data: {
    season: string
    location: string
    seasonalItems: Array<{
      name: string
      category: string
      peakMonths: string
      priceAdvantage: string
      localTip?: string
    }>
    recipeSuggestions?: Array<{
      name: string
      featuredIngredient: string
      description: string
    }>
    shoppingTip: string
  }
  onActionClick?: (action: string) => void
}

export function SeasonalDisplay({ data, onActionClick }: SeasonalDisplayProps) {
  const seasonIcons: Record<string, React.ReactNode> = {
    'Spring': <Flower2 className="h-5 w-5" />,
    'Summer': <Sun className="h-5 w-5" />,
    'Fall': <Cloud className="h-5 w-5" />,
    'Autumn': <Cloud className="h-5 w-5" />,
    'Winter': <Snowflake className="h-5 w-5" />,
  }

  const seasonColors: Record<string, string> = {
    'Spring': 'from-pink-950 via-slate-900 to-green-950 border-pink-500/20',
    'Summer': 'from-orange-950 via-slate-900 to-yellow-950 border-orange-500/20',
    'Fall': 'from-amber-950 via-slate-900 to-red-950 border-amber-500/20',
    'Autumn': 'from-amber-950 via-slate-900 to-red-950 border-amber-500/20',
    'Winter': 'from-blue-950 via-slate-900 to-cyan-950 border-blue-500/20',
  }

  const currentSeason = Object.keys(seasonColors).find(s => 
    data.season.toLowerCase().includes(s.toLowerCase())
  ) || 'Summer'

  const categoryColors: Record<string, string> = {
    'fruits': 'bg-red-500/20 text-red-300 border-red-500/30',
    'vegetables': 'bg-green-500/20 text-green-300 border-green-500/30',
    'herbs': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'seafood': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br",
        seasonColors[currentSeason] || seasonColors['Summer'],
        "border",
        "shadow-2xl"
      )}>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
        
        {/* Header */}
        <div className="relative p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                {seasonIcons[currentSeason] || <Leaf className="h-5 w-5" />}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                <MapPin className="h-3 w-3" />
                {data.location}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {data.season} Harvest
            </h2>
            <p className="text-white/50 text-sm mt-1">{data.seasonalItems.length} items in peak season</p>
          </motion.div>
        </div>

        {/* Seasonal Items Grid */}
        <div className="relative px-6 sm:px-8 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.seasonalItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium border",
                    categoryColors[item.category.toLowerCase()] || 'bg-white/10 text-white/60'
                  )}>
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 mb-2">{item.peakMonths}</p>
                <div className="flex items-center gap-1 text-emerald-400 text-xs">
                  <DollarSign className="h-3 w-3" />
                  {item.priceAdvantage}
                </div>
                {item.localTip && (
                  <p className="text-[10px] text-white/30 mt-1 italic">{item.localTip}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recipe Suggestions */}
        {data.recipeSuggestions && data.recipeSuggestions.length > 0 && (
          <div className="relative px-6 sm:px-8 pb-6">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Seasonal Recipes
            </h3>
            <div className="space-y-2">
              {data.recipeSuggestions.map((recipe, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{recipe.name}</h4>
                    <span className="text-xs text-white/40">feat. {recipe.featuredIngredient}</span>
                  </div>

                  <p className="text-sm text-white/50 mt-1 mb-2">{recipe.description}</p>
                  
                  {onActionClick && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="w-full justify-between bg-white/5 hover:bg-white/10 text-emerald-400 hover:text-emerald-300 h-8 text-xs font-medium"
                      onClick={() => onActionClick(`Recipe for ${recipe.name} with ${recipe.featuredIngredient}`)}
                    >
                      View Recipe <ChefHat className="h-3 ml-2" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping Tip */}
        <div className="relative px-6 sm:px-8 pb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <p className="text-white/70 text-sm">💡 {data.shoppingTip}</p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        {onActionClick && (
          <div className="relative px-6 sm:px-8 pb-6">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                className="h-14 rounded-2xl font-semibold text-base gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                onClick={() => {
                  const seasonalItems = data.seasonalItems.map(item => item.name).join(', ');
                  onActionClick(`Create a meal plan using these seasonal ingredients: ${seasonalItems}`);
                }}
              >
                <Calendar className="h-5 w-5" /> Create Plan
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-2xl font-semibold text-base gap-3 bg-white/5 border-white/10 text-white hover:bg-white/10"
                onClick={() => {
                  const seasonalItems = data.seasonalItems.map(item => item.name).join(', ');
                  onActionClick(`Generate a grocery list for these seasonal items: ${seasonalItems}`);
                }}
              >
                <ShoppingCart className="h-5 w-5" /> Shopping List
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
