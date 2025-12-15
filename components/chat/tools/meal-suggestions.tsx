"use client"

import { motion } from "framer-motion"
import { Clock, Wand2, ChefHat, ArrowRight, Star, Flame, ExternalLink, Search, Globe, Zap, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80", // Healthy bowl
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", // Pancakes
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80", // Pizza
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=80", // Toast
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800&q=80", // Sandwich
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80", // Pasta
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800&q=80", // Burger
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80", // Curry
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", // Steak
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80", // Sushi
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=800&q=80", // Breakfast
  "https://images.unsplash.com/photo-1476718408415-c934f70faaa3?w=800&q=80", // Soup
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80", // Healthy
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80", // Pancakes top down
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80", // Waffles
];

function getFallbackImage(term: string) {
  let hash = 0;
  for (let i = 0; i < term.length; i++) {
    hash = term.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FOOD_IMAGES.length;
  return FOOD_IMAGES[index];
}

interface MealSuggestionsProps {
  results: any[]
  title?: string
  onActionClick?: (action: string) => void
}

export function MealSuggestions({ results, title, onActionClick }: MealSuggestionsProps) {
  if (!results?.length) return null

  // Check if this is from a search (has sourceUrl) vs AI generated
  const isFromSearch = results.some(r => r.sourceUrl)


  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className={cn(
        "relative overflow-hidden rounded-[2rem]",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        "border border-white/[0.08]",
        "shadow-2xl shadow-black/40"
      )}>
        {/* Ambient background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-500/25 to-pink-500/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-white/[0.02] to-transparent" />
        </div>
        
        {/* Header */}
        <div className="relative p-6 sm:p-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={cn(
                  "p-3 rounded-2xl",
                  isFromSearch 
                    ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30" 
                    : "bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30"
                )}>
                  {isFromSearch ? (
                    <Search className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ChefHat className="h-6 w-6 text-rose-400" />
                  )}
                </div>
                {/* Pulse ring */}
                <motion.div 
                  className={cn(
                    "absolute inset-0 rounded-2xl border-2",
                    isFromSearch ? "border-blue-500/30" : "border-rose-500/30"
                  )}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                  {title || (isFromSearch ? "Search Results" : "Recipe Suggestions")}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-sm">{results.length} recipes found</span>
                  {isFromSearch && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <Globe className="h-3 w-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-300">Web Search</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20"
            >
              <Wand2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-amber-300">AI Powered</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Recipe Cards Grid */}
        <div className="relative px-4 sm:px-6 pb-6 sm:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {results.map((recipe: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onActionClick?.(`Give me the full recipe for ${recipe.name}`)}
                className={cn(
                  "group relative w-full flex flex-col overflow-hidden rounded-2xl text-left h-full cursor-pointer",
                  "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
                  "border border-white/[0.08] hover:border-rose-500/30",
                  "transition-all duration-300",
                  "hover:shadow-2xl hover:shadow-rose-500/10"
                )}
              >
                {/* Hero Image */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900/50">
                  <motion.img
                    src={recipe.imageUrl || getFallbackImage(recipe.name)}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getFallbackImage(recipe.name + "fallback");
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80" />
                  
                  {/* Floating Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                     {recipe.rating && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs font-medium text-amber-400 shadow-sm">
                           <Star className="h-3 w-3 fill-amber-400" /> {recipe.rating}
                        </div>
                     )}
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {recipe.calories && (
                           <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white/90">
                              <Flame className="h-3 w-3 text-orange-400" /> {recipe.calories} kcal
                           </div>
                        )}
                        {recipe.totalTime && (
                           <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 text-[10px] font-medium text-white/90">
                              <Clock className="h-3 w-3 text-blue-400" /> {recipe.totalTime}
                           </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight group-hover:text-rose-400 transition-colors">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-2 mt-1.5 leading-relaxed">
                      {recipe.description || "A delicious culinary experience tailored just for you."}
                    </p>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 mt-auto">
                    {recipe.sourceUrl ? (
                        <a
                           href={recipe.sourceUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                           <ExternalLink className="h-3 w-3" />
                           <span className="max-w-[80px] truncate">{new URL(recipe.sourceUrl).hostname.replace('www.', '')}</span>
                        </a>
                    ) : (
                        <span className="text-[10px] text-rose-400/50 uppercase tracking-wider font-medium">Original Recipe</span>
                    )}

                    <Button
                         size="sm"
                         variant="secondary"
                         className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-0"
                         onClick={(e) => {
                           e.stopPropagation();
                           onActionClick?.(`Give me the full recipe for ${recipe.name}`);
                         }}
                       >
                        View
                        <ArrowRight className="h-3 w-3 ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-xs text-white/25 mt-6"
          >
            Tap a recipe to view full details and instructions
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
